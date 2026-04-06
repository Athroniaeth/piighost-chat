import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../tailgrids/core/dropdown";
import { Trash1, MenuKebab1 } from "@tailgrids/icons";
import { THEME } from "../chat/data";

export interface ChatItem {
  id: string;
  title: string;
}

interface ChatHistoryProps {
  chats: ChatItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onConfirmDeleteChat: (id: string, title: string) => void;
}

const ChatListItem = ({
  chat,
  isActive,
  onSelect,
  onDelete,
}: {
  chat: ChatItem;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => (
  <li>
    <div className="group relative">
      <button
        onClick={onSelect}
        className={`hover:bg-background-soft-200 font-normal text-text-100 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg p-3 pr-10 text-sm transition-colors ${
          isActive ? "bg-background-soft-200" : ""
        }`}
      >
        <span className="relative z-10 line-clamp-1 text-left">
          {chat.title}
        </span>
      </button>
      <div
        className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="text-text-100 hover:text-text-50 hover:bg-background-soft-300 data-pressed:bg-background-soft-300 data-pressed:text-text-50 flex items-center justify-center rounded-full p-1 outline-hidden transition-colors">
            <MenuKebab1 />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            placement="bottom start"
            className={`${THEME.dropdown} w-40 overflow-visible shadow-md`}
          >
            <DropdownMenuItem
              onAction={onDelete}
              className={THEME.dropdownItem}
            >
              <Trash1 className="size-4.5" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </li>
);

export const ChatHistory = ({
  chats,
  activeChatId,
  onSelectChat,
  onConfirmDeleteChat,
}: ChatHistoryProps) => {
  if (chats.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-xs text-gray-400">
        No conversations yet
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-gray-400 mb-2 pl-3 text-xs font-medium uppercase tracking-wider">
        Conversations
      </h4>
      <ul className="space-y-1">
        {chats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={activeChatId === chat.id}
            onSelect={() => onSelectChat(chat.id)}
            onDelete={() => onConfirmDeleteChat(chat.id, chat.title)}
          />
        ))}
      </ul>
    </div>
  );
};
