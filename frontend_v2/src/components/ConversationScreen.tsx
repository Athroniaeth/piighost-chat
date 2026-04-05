import ChatInput from "./chat/ChatInput";
import MessageItem from "./chat/MessageItem";

interface ConversationScreenProps {
  messages: any[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: (text?: string) => void;
  isThinking?: boolean;
  onEditMessage?: (id: number, content: string) => void;
  onDeleteMessage?: (id: number) => void;
}

export default function ConversationScreen({
  messages,
  inputValue,
  setInputValue,
  onSend,
  isThinking = false,
  onEditMessage,
  onDeleteMessage,
}: ConversationScreenProps) {
  return (
    <div className="bg-background-50 flex h-[calc(100%-1.5rem)] flex-col relative m-3 rounded-xl overflow-hidden text-black-main">
      {/* Chat Container */}
      <div className="mx-auto w-full max-w-207.5 flex-1 overflow-y-auto custom-scrollbar pb-16 sm:pb-20">
        <div className="space-y-6 p-4 pb-48">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
            />
          ))}

          {isThinking && (
            <MessageItem
              message={{
                id: Date.now(),
                type: "thinking",
                content: "",
                actions: [],
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-background-50 from-80% to-transparent p-4 pt-6 pb-5">
        <ChatInput
          variant="bottom"
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={onSend}
        />
      </div>
    </div>
  );
}
