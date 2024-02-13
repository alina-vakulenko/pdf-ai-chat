import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc";

type RouterOutput = inferRouterOutputs<AppRouter>;

type Messages = RouterOutput["getFileMessages"]["messages"];

type MessageWithoutText = Omit<Messages[number], "text">;

type ExtendedText = {
  text: string | JSX.Element;
};

export type ExtendedMessage = MessageWithoutText & ExtendedText;
