import { useState } from "react";
import { useTheme } from "../utils/theme-provider";
import { SidebarHeader } from "../components/sidebar/SidebarHeader";
import {
  WorkspaceList,
  type WorkspaceItem,
} from "../components/sidebar/WorkspaceList";
import { ChatHistory, type ChatItem } from "../components/sidebar/ChatHistory";
import { UserFooter } from "../components/sidebar/UserFooter";
import CreateProjectModal from "../components/CreateProjectModal";

interface AppSidebarProps {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  chats: ChatItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
  onRenameChat: (id: string, currentTitle: string) => void;
  onRenameProject: (name: string) => void;
  onConfirmDeleteChat: (id: string, title: string) => void;
  onConfirmDeleteProject: (name: string) => void;
  onLogout: () => void;
  onOpenSettings: (
    tab?: "account" | "preference" | "plan" | "resources",
  ) => void;
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
  onOpenSearch,
  onRenameChat,
  onRenameProject,
  onConfirmDeleteChat,
  onConfirmDeleteProject,
  onLogout,
  onOpenSettings,
}: AppSidebarProps) => {
  const { theme, setTheme } = useTheme();
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(
    null,
  );
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);

  const workspaces: WorkspaceItem[] = [
    {
      name: "Pimjo",
      count: "03",
      hasSubmenu: true,
      submenuItems: [
        { id: "pj-1", title: "Project Overview" },
        { id: "pj-2", title: "Marketing Assets" },
        { id: "pj-3", title: "Q1 Strategy" },
      ],
    },
    {
      name: "Meku",
      count: "02",
      hasSubmenu: true,
      submenuItems: [
        { id: "mk-2", title: "Sustainable Fashion: Trends and Innovations" },
      ],
    },
    {
      name: "Formbold",
      count: "04",
      hasSubmenu: true,
      submenuItems: [
        { id: "fb-1", title: "Form Components" },
        { id: "fb-2", title: "Landing Page Design" },
        { id: "fb-3", title: "API Documentation" },
        { id: "fb-4", title: "Feedback Loop" },
      ],
    },
    {
      name: "Tailadmin",
      count: "03",
      hasSubmenu: true,
      submenuItems: [
        { id: "ta-1", title: "Dashboard v2" },
        { id: "ta-2", title: "User Permissions" },
        { id: "ta-3", title: "Analytics Integration" },
      ],
    },
  ];

  const toggleWorkspace = (name: string) => {
    setExpandedWorkspace(expandedWorkspace === name ? null : name);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setExpandedWorkspace(null);
    }
  };

  const handleCreateProject = (name: string) => {
    console.log("Creating project:", name);
    // Add logic here if there's a project management system
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
          onOpenSearch={onOpenSearch}
          onCreateProject={() => setIsCreateProjectModalOpen(true)}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Workspaces & Projects & Chats */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className={`space-y-8 ${!isExpanded ? "hidden" : "block"}`}>
            <WorkspaceList
              workspaces={workspaces}
              expandedWorkspace={expandedWorkspace}
              activeChatId={activeChatId}
              onToggleWorkspace={toggleWorkspace}
              onSelectChat={onSelectChat}
              onRenameChat={onRenameChat}
              onRenameProject={onRenameProject}
              onConfirmDeleteChat={onConfirmDeleteChat}
              onConfirmDeleteProject={onConfirmDeleteProject}
            />

            <ChatHistory
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onRenameChat={onRenameChat}
              onConfirmDeleteChat={onConfirmDeleteChat}
            />
          </div>

          {!isExpanded && (
            <div className="flex flex-col items-center gap-4 py-4">
              {/* Add icons for collapsed mode if needed, but currently handled by sub-components or hidden */}
            </div>
          )}
        </div>

        <div>
          <UserFooter
            isExpanded={isExpanded}
            theme={theme}
            setTheme={setTheme}
            onLogout={onLogout}
            onOpenSettings={onOpenSettings}
          />
        </div>
      </aside>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  );
};

export default AppSidebar;
