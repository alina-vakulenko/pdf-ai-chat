import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  PresignedPostOptions,
  createPresignedPost,
} from "@aws-sdk/s3-presigned-post";
import { publicProcedure, privateProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { s3 } from "@/app/_s3/s3";
import { db } from "@/db";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { getPinecone } from "@/lib/pinecone";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
import { ROUTES } from "@/config/routes";

const FREE_PLAN = PLANS.find((plan) => plan.name === "Free");
const PRO_PLAN = PLANS.find((plan) => plan.name === "Pro");

const FREE_MAX_FILE_SIZE = 1024 * 1024 * 4;
const PRO_MAX_FILE_SIZE = 1024 * 1024 * 16;

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id || !user.email) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          text: true,
          createdAt: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),
  createFile: privateProcedure
    .input(
      z.object({
        key: z.string(),
        name: z.string(),
        url: z.string(),
        isSubscribed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { key, name, url, isSubscribed } = input;

      const fileExists = await db.file.findFirst({
        where: {
          key,
        },
      });

      if (fileExists) throw new TRPCError({ code: "CONFLICT" });

      const file = await db.file.create({
        data: {
          key,
          name,
          userId,
          url,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        const res = await fetch(input.url);
        const blob = await res.blob();

        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();
        const pagesCount = pageLevelDocs.length;

        const isProExceeded = pagesCount > PRO_PLAN!.pagesPerPdf;
        const isFreeExceeded = pagesCount > FREE_PLAN!.pagesPerPdf;

        if (
          (isSubscribed && isProExceeded) ||
          (!isSubscribed && isFreeExceeded)
        ) {
          await db.file.update({
            data: {
              uploadStatus: "FAILED",
            },
            where: {
              id: file.id,
            },
          });
        }
        const pineconeIndex = getPinecone();
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
        });

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: file.id,
          },
        });
      } catch (err) {
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: file.id,
          },
        });
      }

      return file;
    }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
    }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) {
        return { status: "PENDING" as const };
      }

      return { status: file.uploadStatus };
    }),
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),
  getPresignedUrl: privateProcedure
    .input(z.object({ isSubscribed: z.boolean() }))
    .query(async ({ input }) => {
      const Bucket = process.env.AWS_BUCKET!;
      const Key = uuidv4() + ".pdf";
      const Conditions: PresignedPostOptions["Conditions"] = [
        ["eq", "$bucket", Bucket],
        [
          "content-length-range",
          0,
          input.isSubscribed ? PRO_MAX_FILE_SIZE : FREE_MAX_FILE_SIZE,
        ],
        ["eq", "$Content-Type", "application/pdf"],
      ];
      const Fields = { key: Key };

      const { url: uploadUrl, fields } = await createPresignedPost(s3, {
        Bucket,
        Key,
        Conditions,
        Fields,
        Expires: 600, // Expires in 10 minutes
      });

      return { url: uploadUrl, fields };
    }),
  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });

    const billingUrl = absoluteUrl(ROUTES.billing);
    const subscriptionPlan = await getUserSubscriptionPlan();

    if (
      subscriptionPlan.isSubscribed &&
      "stripeCustomerId" in dbUser &&
      dbUser?.stripeCustomerId
    ) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId as string,
        return_url: billingUrl,
      });

      return { url: stripeSession.url };
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return { url: stripeSession.url };
  }),
});

export type AppRouter = typeof appRouter;
