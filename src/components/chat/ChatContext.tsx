import { createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type ChatContextProps = {
  addMessage: () => void;
  message: string;
  handleInpuChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

type ChatContextProviderProps = {
  fileId: string;
  children: React.ReactNode;
};

export const ChatContext = createContext<ChatContextProps>({
  addMessage: () => {},
  message: "",
  handleInpuChange: () => {},
  isLoading: false,
});

export const ChatContextProvider = ({
  fileId,
  children,
}: ChatContextProviderProps) => {
  const utils = trpc.useUtils();
  const backupMessage = useRef("");

  const { toast } = useToast();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const res = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ fileId, message }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      return res.body;
    },
    onMutate: async ({ message }) => {
      // optimistic update
      backupMessage.current = message;
      setMessage("");

      await utils.getFileMessages.cancel();

      const previousMessages = utils.getFileMessages.getInfiniteData();

      utils.getFileMessages.setInfiniteData(
        {
          fileId,
          limit: INFINITE_QUERY_LIMIT,
        },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          let newPages = [...old.pages];
          let latestPage = newPages[0];

          latestPage.messages = [
            {
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];

          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) || [],
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let done = false;

      let accumResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunkValue = decoder.decode(value);

        accumResponse += chunkValue;

        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (old) => {
            if (!old) {
              return {
                pages: [],
                pageParams: [],
              };
            }

            let isAiResponseCreated = old.pages.some((page) =>
              page.messages.some((msg) => msg.id === "ai-response")
            );

            let updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                let updatedMessages;

                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: "ai-response",
                      text: accumResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map((msg) => {
                    if (msg.id === "ai-response") {
                      return { ...msg, text: accumResponse };
                    }
                    return msg;
                  });
                }
                return {
                  ...page,
                  messages: updatedMessages,
                };
              }
              return page;
            });

            return {
              ...old,
              pages: updatedPages,
            };
          }
        );
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages || [] }
      );
    },
    onSettled: async () => {
      setIsLoading(false);

      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  const addMessage = () => sendMessage({ message });

  const handleInpuChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInpuChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
