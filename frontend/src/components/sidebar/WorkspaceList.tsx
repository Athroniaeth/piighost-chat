import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownSubmenuTrigger,
} from "../tailgrids/core/dropdown";
import {
  ChevronRight,
  Folder1,
  MenuKebab1,
  Pencil1,
  Pin,
  Trash1,
  Upload1,
} from "@tailgrids/icons";
import { THEME } from "../chat/data";

export interface WorkspaceSubItem {
  id: string;
  title: string;
}

export interface WorkspaceItem {
  name: string;
  count: string;
  hasSubmenu?: boolean;
  submenuItems?: WorkspaceSubItem[];
}

interface WorkspaceListProps {
  workspaces: WorkspaceItem[];
  expandedWorkspace: string | null;
  activeChatId: string | null;
  onToggleWorkspace: (name: string) => void;
  onSelectChat: (id: string) => void;
  onRenameChat?: (id: string, currentTitle: string) => void;
  onRenameProject?: (name: string) => void;
  onConfirmDeleteChat?: (id: string, title: string) => void;
  onConfirmDeleteProject?: (name: string) => void;
}

export const WorkspaceList = ({
  workspaces,
  expandedWorkspace,
  activeChatId,
  onToggleWorkspace,
  onSelectChat,
  onRenameChat,
  onRenameProject,
  onConfirmDeleteChat,
  onConfirmDeleteProject,
}: WorkspaceListProps) => {
  return (
    <div>
      <ul className="space-y-1">
        {workspaces.map((workspace, index) => (
          <li key={index} className="relative">
            {workspace.hasSubmenu ? (
              <>
                <div className="group relative">
                  <button
                    onClick={() => onToggleWorkspace(workspace.name)}
                    className="hover:bg-background-soft-200 text-text-100 group/item relative flex h-9 w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg p-3 pr-2 text-left text-sm"
                  >
                    <Folder1 className="size-5" />
                    <span className="line-clamp-1">{workspace.name}</span>
                    <div className="relative ml-auto flex items-center justify-center min-w-[24px]">
                      <span className="bg-background-soft-100 text-text-50 rounded-2xl px-2 py-0.5 text-xs font-medium transition-opacity group-hover/item:opacity-0">
                        {workspace.count}
                      </span>
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger className="text-text-100 hover:text-text-50 hover:bg-background-soft-300 data-pressed:bg-background-soft-300 data-pressed:text-text-50 flex items-center justify-center rounded-full p-1 outline-hidden transition-colors">
                            <MenuKebab1 className="size-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            placement="bottom start"
                            className={`${THEME.dropdown} w-48 overflow-visible shadow-md`}
                          >
                            <DropdownMenuItem className={THEME.dropdownItem}>
                              <Pin className="size-4.5" />
                              <span>Pin</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onAction={() => onRenameProject?.(workspace.name)}
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
                                <DropdownMenuItem
                                  className={THEME.dropdownItem}
                                >
                                  <Folder1 className="size-4.5" />{" "}
                                  <span>Pimjo</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={THEME.dropdownItem}
                                >
                                  <Folder1 className="size-4.5" />{" "}
                                  <span>Aymo</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownSubmenuTrigger>
                            <DropdownMenuItem className={THEME.dropdownItem}>
                              <Upload1 className="size-4.5" />
                              <span>Share</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onAction={() =>
                                onConfirmDeleteProject?.(workspace.name)
                              }
                              className={`${THEME.dropdownItem} `}
                            >
                              <Trash1 className="size-4.5" />
                              <span>Delete Project</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </button>
                </div>
                {expandedWorkspace === workspace.name && (
                  <div className="mt-1 w-full pl-7">
                    <ul className="text-text-50 text-sm space-y-1">
                      {workspace.submenuItems?.map((item, subIndex) => (
                        <li key={subIndex} className="group relative">
                          <button
                            onClick={() => onSelectChat(item.id)}
                            className={`hover:bg-background-soft-100 text-text-100 relative flex h-9 w-full items-center rounded-lg p-3 pr-10 text-sm transition-colors ${
                              activeChatId === item.id
                                ? "bg-background-soft-100"
                                : ""
                            }`}
                          >
                            <span className="line-clamp-1 overflow-hidden wrap-break-word">
                              {item.title}
                            </span>
                          </button>
                          <div
                            className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger className="text-text-100 hover:text-text-50 hover:bg-background-soft-300 data-pressed:bg-background-soft-300 data-pressed:text-text-50 flex items-center justify-center rounded-full p-1 outline-hidden transition-colors">
                                <MenuKebab1 className="size-5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                placement="bottom start"
                                className={`${THEME.dropdown} w-52 overflow-visible shadow-md`}
                              >
                                <DropdownMenuItem
                                  className={THEME.dropdownItem}
                                >
                                  <Pin className="size-4.5" />
                                  <span>Pin</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onAction={() =>
                                    onRenameChat?.(item.id, item.title)
                                  }
                                  className={THEME.dropdownItem}
                                >
                                  <Pencil1 className="size-4.5" />
                                  <span>Rename</span>
                                </DropdownMenuItem>
                                <DropdownSubmenuTrigger>
                                  <DropdownMenuItem
                                    className={THEME.dropdownItem}
                                  >
                                    <Folder1 className="size-4.5" />{" "}
                                    <span>Move to project</span>
                                    <ChevronRight className="ml-auto size-4" />
                                  </DropdownMenuItem>
                                  <DropdownMenuContent
                                    placement="right top"
                                    className={`${THEME.dropdown} w-45 shadow-md`}
                                  >
                                    <DropdownMenuItem
                                      className={THEME.dropdownItem}
                                    >
                                      <Folder1 className="size-4.5" />{" "}
                                      <span>Pimjo</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className={THEME.dropdownItem}
                                    >
                                      <Folder1 className="size-4.5" />{" "}
                                      <span>Aymo</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownSubmenuTrigger>
                                <DropdownMenuItem
                                  className={THEME.dropdownItem}
                                >
                                  <Upload1 className="size-4.5" />
                                  <span>Share</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onAction={() =>
                                    onConfirmDeleteChat?.(item.id, item.title)
                                  }
                                  className={`${THEME.dropdownItem} `}
                                >
                                  <Trash1 className="size-4.5" />
                                  <span>Delete chat</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="group relative">
                <a
                  href="#"
                  className="hover:bg-background-soft-200 text-text-100 relative flex h-9 items-center gap-2 overflow-hidden rounded-lg p-3 pr-3 text-sm"
                >
                  <svg
                    width="17"
                    height="14"
                    viewBox="0 0 17 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.31 1.23C6.08338 0.927832 5.72771 0.75 5.35 0.75H1.95C1.28726 0.75 0.75 1.28726 0.75 1.95V11.55C0.75 12.2127 1.28726 12.75 1.95 12.75H14.35C15.0127 12.75 15.55 12.2127 15.55 11.55V4.35C15.55 3.68726 15.0127 3.15 14.35 3.15H8.35C7.97232 3.15 7.61664 2.97217 7.39 2.67L6.31 1.23Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className="line-clamp-1">{workspace.name}</span>
                  <div className="relative ml-auto flex items-center justify-center min-w-[24px]">
                    <span className="bg-background-soft-100 text-text-50 rounded-2xl px-2 py-0.5 text-xs font-medium transition-opacity group-hover:opacity-0">
                      {workspace.count}
                    </span>
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="text-text-100 hover:text-text-50 hover:bg-background-soft-300 data-pressed:bg-background-soft-300 data-pressed:text-text-50 flex items-center justify-center rounded-full p-1 outline-hidden transition-colors">
                          <MenuKebab1 className="size-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          placement="bottom start"
                          className={`${THEME.dropdown} w-48 overflow-visible shadow-md`}
                        >
                          <DropdownMenuItem className={THEME.dropdownItem}>
                            <Pin className="size-4.5" />
                            <span>Pin</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className={THEME.dropdownItem}>
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
                                <Folder1 className="size-4.5" />{" "}
                                <span>Pimjo</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className={THEME.dropdownItem}>
                                <Folder1 className="size-4.5" />{" "}
                                <span>Aymo</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownSubmenuTrigger>
                          <DropdownMenuItem className={THEME.dropdownItem}>
                            <Upload1 className="size-4.5" />
                            <span>Share</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onAction={() =>
                              onConfirmDeleteProject?.(workspace.name)
                            }
                            className={`${THEME.dropdownItem} `}
                          >
                            <Trash1 className="size-4.5" />
                            <span>Delete Project</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
