import { useContext, useRef } from "react";
import { Send } from "lucide-react";
import { ChatContext } from "./ChatContext";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface ChatInputProps {
  disabled?: boolean;
}

const ChatInput = ({ disabled }: ChatInputProps) => {
  const { message, addMessage, handleInpuChange, isLoading } =
    useContext(ChatContext);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                ref={chatInputRef}
                placeholder="Enter your question..."
                autoFocus
                rows={1}
                maxRows={4}
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
                value={message}
                onChange={handleInpuChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();

                    addMessage();
                    chatInputRef.current?.focus();
                  }
                }}
              />
              <Button
                type="submit"
                className="absolute top-1.5 -translate-x-1/2 right-[8px]"
                aria-label="send message"
                onClick={() => {
                  addMessage();
                  chatInputRef.current?.focus();
                }}
                disabled={isLoading || disabled}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
