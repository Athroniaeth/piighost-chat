import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownSubmenuTrigger,
} from "../tailgrids/core/dropdown";
import {
  Trash1,
  MenuKebab1,
  Pencil1,
  Upload1,
  ChevronRight,
  Folder1,
} from "@tailgrids/icons";
import { THEME } from "../chat/data";

export interface ChatItem {
  id: string;
  title: string;
}

interface ChatHistoryProps {
  chats: ChatItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onRenameChat: (id: string, currentTitle: string) => void;
  onConfirmDeleteChat: (id: string, title: string) => void;
}

export const ChatHistory = ({
  chats,
  activeChatId,
  onSelectChat,
  onRenameChat,
  onConfirmDeleteChat,
}: ChatHistoryProps) => {
  const todayChats = chats.slice(0, 2);
  const yesterdayChats = chats.slice(2, 5);

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-gray-400 mb-2 pl-3 text-xs font-medium uppercase tracking-wider">
          Today
        </h4>
        <ul className="space-y-1">
          {todayChats.map((chat) => (
            <li key={chat.id}>
              <div className="group relative">
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className={`hover:bg-background-soft-200 font-normal text-text-100 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg p-3 pr-10 text-sm  transition-colors ${
                    activeChatId === chat.id ? "bg-background-soft-200" : ""
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
                      className={`${THEME.dropdown} w-48 overflow-visible shadow-md`}
                    >
                      <DropdownMenuItem
                        onAction={() => onRenameChat(chat.id, chat.title)}
                        className={THEME.dropdownItem}
                      >
                        <Pencil1 className="size-4.5" />
                        <span>Rename</span>
                      </DropdownMenuItem>

                      <DropdownSubmenuTrigger>
                        <DropdownMenuItem className={THEME.dropdownItem}>
                          <Folder1 className="size-4.5" />{" "}
                          <span>Move to project</span>
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

                      <DropdownMenuItem className={THEME.dropdownItem}>
                        <Upload1 className="size-4.5" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onAction={() =>
                          onConfirmDeleteChat(chat.id, chat.title)
                        }
                        className={`${THEME.dropdownItem} `}
                      >
                        <Trash1 className="size-4.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-gray-400 mb-2 pl-3 text-xs font-medium uppercase tracking-wider">
          Yesterday
        </h4>
        <ul className="space-y-1">
          {yesterdayChats.map((chat) => (
            <li key={chat.id}>
              <div className="group relative">
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className={`hover:bg-background-soft-200 text-text-100 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg p-3 pr-10 text-sm font-medium transition-colors ${
                    activeChatId === chat.id ? "bg-background-soft-200" : ""
                  }`}
                >
                  <span className="relative z-10 font-normal line-clamp-1 text-left">
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
                      className={`${THEME.dropdown} w-48 overflow-visible shadow-md`}
                    >
                      <DropdownMenuItem
                        onAction={() => onRenameChat(chat.id, chat.title)}
                        className={THEME.dropdownItem}
                      >
                        <Pencil1 className="size-4.5" />
                        <span>Rename</span>
                      </DropdownMenuItem>

                      <DropdownSubmenuTrigger>
                        <DropdownMenuItem className={THEME.dropdownItem}>
                          <Folder1 className="size-4.5" />{" "}
                          <span>Move to project</span>
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

                      <DropdownMenuItem className={THEME.dropdownItem}>
                        <Upload1 className="size-4.5" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onAction={() =>
                          onConfirmDeleteChat(chat.id, chat.title)
                        }
                        className={`${THEME.dropdownItem} `}
                      >
                        <Trash1 className="size-4.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
