import {
  ChevronRight,
  Folder1,
  MenuMeatballs1,
  PenToSquare,
  Pin,
  Trash1,
  Upload1,
} from "@tailgrids/icons";
import ChatInput from "./chat/ChatInput";
import MessageItem from "./chat/MessageItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownSubmenuTrigger,
} from "./tailgrids/core/dropdown";
import { THEME } from "./chat/data";

interface ConversationScreenProps {
  messages: any[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: (text?: string) => void;
  isThinking?: boolean;
  onDeleteChat?: () => void;
  onRenameChat?: () => void;
  onEditMessage?: (id: number, content: string) => void;
  onDeleteMessage?: (id: number) => void;
}

export default function ConversationScreen({
  messages,
  inputValue,
  setInputValue,
  onSend,
  isThinking = false,
  onDeleteChat,
  onRenameChat,
  onEditMessage,
  onDeleteMessage,
}: ConversationScreenProps) {
  return (
    <div className="bg-background-50 flex h-[calc(100%-1.5rem)] flex-col relative m-3 rounded-xl overflow-hidden text-black-main">
      {/* Top Bar Actions */}
      <div className="justify-end py-4 pb-6 px-6 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="border-base-100 flex h-9 w-9 py-1.5 cursor-pointer items-center justify-center rounded-lg border bg-background-50 text-text-50 hover:bg-background-soft-50 transition-colors">
              <MenuMeatballs1 className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              placement="bottom end"
              className={`${THEME.dropdown} w-52 overflow-visible shadow-md`}
            >
              <DropdownMenuItem className={THEME.dropdownItem}>
                <Pin className="size-4.5" /> <span>Pin</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onAction={onRenameChat}
                className={THEME.dropdownItem}
              >
                <PenToSquare className="size-4.5" /> <span>Rename</span>
              </DropdownMenuItem>

              <DropdownSubmenuTrigger>
                <DropdownMenuItem className={THEME.dropdownItem}>
                  <Folder1 className="size-4.5" /> <span>Move to project</span>
                  <ChevronRight className="ml-auto size-4" />
                </DropdownMenuItem>
                <DropdownMenuContent
                  placement="right top"
                  className={`${THEME.dropdown} w-45 shadow-md`}
                >
                  <DropdownMenuItem className={THEME.dropdownItem}>
                    <Folder1 className="size-4.5" /> <span>Pimjo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className={THEME.dropdownItem}>
                    <Folder1 className="size-4.5" /> <span>Aymo</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownSubmenuTrigger>
              <DropdownMenuItem
                onAction={onDeleteChat}
                className={`${THEME.dropdownItem} `}
              >
                <Trash1 className="size-4.5" /> <span>Delete chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className=" flex h-9 gap-1.5 py-1.5 cursor-pointer items-center justify-center rounded-lg bg-gray-800 px-3 text-sm font-medium text-white transition-colors hover:bg-gray-900">
            <Upload1 className="size-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

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
