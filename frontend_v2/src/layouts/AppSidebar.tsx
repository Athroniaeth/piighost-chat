import { SidebarHeader } from "../components/sidebar/SidebarHeader";
import { ChatHistory, type ChatItem } from "../components/sidebar/ChatHistory";

interface AppSidebarProps {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  chats: ChatItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string, currentTitle: string) => void;
  onConfirmDeleteChat: (id: string, title: string) => void;
}

const AppSidebar = ({
  isExpanded,
  setIsExpanded,
  isMobileOpen,
  setIsMobileOpen,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onConfirmDeleteChat,
}: AppSidebarProps) => {
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`bg-background-50 group/sidebar fixed inset-y-0 left-0 z-70 flex h-full flex-col justify-between border-r border-base-100 p-5 transition-all duration-300 lg:static ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isExpanded ? "w-75" : "w-22"}`}
      >
        <SidebarHeader
          isExpanded={isExpanded}
          onToggleSidebar={toggleSidebar}
          onNewChat={onNewChat}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Chats */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={`space-y-8 ${!isExpanded ? "hidden" : "block"}`}>
            <ChatHistory
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onRenameChat={onRenameChat}
              onConfirmDeleteChat={onConfirmDeleteChat}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
