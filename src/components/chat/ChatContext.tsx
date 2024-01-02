import { createContext, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";

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
