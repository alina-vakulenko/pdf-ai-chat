import { Metadata } from "next";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") {
    console.log(path);
    return path;
  }
  if (process.env.VERCEL_URL) {
    console.log(`https://${process.env.VERCEL_URL}${path}`);
    return `https://${process.env.VERCEL_URL}${path}`;
  }
  console.log(`http://localhost:${process.env.PORT ?? 8000}${path}`);
  return `http://localhost:${process.env.PORT ?? 8000}${path}`;
}

export function constructMetadata({
  title = "Quill - the SaaS for students",
  description = "Quill is an open-source software to make chatting to your PDF files easy",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      // creator:"@twitteruser"
    },
    icons,
    metadataBase: new URL("https://quill-pdf-assist.vercel.app"),
    themeColor: "#FFF",
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
