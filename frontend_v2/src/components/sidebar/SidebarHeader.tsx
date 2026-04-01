import { Layout22, PenToSquare, Search1, Xmark2x } from "@tailgrids/icons";
import { Link } from "react-router-dom";
import { useTheme } from "../../utils/theme-provider";

interface SidebarHeaderProps {
  isExpanded: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
  onCreateProject?: () => void;
  onCloseMobile?: () => void;
}

export const SidebarHeader = ({
  isExpanded,
  onToggleSidebar,
  onNewChat,
  onOpenSearch,
  onCreateProject,
  onCloseMobile,
}: SidebarHeaderProps) => {
  const { theme } = useTheme();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <div>
      <div
        className={`mb-8 flex items-center relative ${
          isExpanded ? "justify-between" : "justify-center"
        }`}
      >
        <Link
          to="/"
          className={`flex items-center transition-opacity duration-300 ${
            !isExpanded ? "group-hover/sidebar:opacity-0" : ""
          }`}
        >
          {isExpanded ? (
            <img
              src={
                isDarkMode
                  ? "/images/logo/onyx-logo-white.svg"
                  : "/images/logo/onyx-logo.svg"
              }
              alt="Logo"
            />
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              className="mx-auto flex justify-center w-8 h-8"
            />
          )}
        </Link>
        <div
          className={`flex items-center gap-2 ${
            !isExpanded
              ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover/sidebar:opacity-100 pointer-events-none group-hover/sidebar:pointer-events-auto"
              : ""
          }`}
        >
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="text-text-100 cursor-pointer lg:hidden"
            >
              <Xmark2x className="size-6" />
            </button>
          )}
          <button
            onClick={onToggleSidebar}
            className="text-text-100 cursor-pointer hidden lg:block hover:bg-background-soft-100 p-1.5 rounded-lg transition-colors"
          >
            <Layout22 className="size-5" />
          </button>
        </div>
      </div>

      {isExpanded ? (
        <>
          <div className="mb-4 space-y-1">
            <button
              onClick={() => {
                onNewChat();
                onCloseMobile?.();
              }}
              className="hover:bg-background-soft-100 font-medium hover:text-title-50 text-text-100 flex w-full cursor-pointer items-center gap-2 rounded-lg bg-transparent px-3 py-2 text-sm"
            >
              <PenToSquare className="size-5" />
              New Chat
            </button>
            <button
              onClick={onOpenSearch}
              className="hover:bg-background-soft-100 font-medium hover:text-title-50 text-text-100 flex w-full cursor-pointer items-center gap-2 rounded-lg bg-transparent px-3 py-2 text-sm"
            >
              <Search1 className="size-5" />
              Search
            </button>
          </div>

          <div className="mb-5 flex items-center justify-between gap-2.5 pl-3">
            <p className="text-gray-400 text-sm">Projects</p>
            <button
              onClick={onCreateProject}
              className="hover:bg-background-soft-100 w-11.5 h-8 inline-flex items-center justify-center border-base-50 text-text-100 cursor-pointer rounded-lg border "
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 14.25H3.75C3.35218 14.25 2.97064 14.092 2.68934 13.8107C2.40804 13.5294 2.25 13.1478 2.25 12.75V4.5C2.25 4.10218 2.40804 3.72064 2.68934 3.43934C2.97064 3.15804 3.35218 3 3.75 3H6.33579C6.601 3 6.85536 3.10536 7.04289 3.29289L8.70711 4.95711C8.89464 5.14464 9.149 5.25 9.41421 5.25H14.25C14.6478 5.25 15.0294 5.40804 15.3107 5.68934C15.592 5.97064 15.75 6.35218 15.75 6.75V9.375"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 14.25H16.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.25 12V16.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="mb-4 flex flex-col items-center gap-2">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile?.();
            }}
            className="hover:bg-background-soft-100 size-9 text-text-100 flex cursor-pointer items-center justify-center rounded-lg "
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.7296 11.3536V16.3536C15.7296 17.0439 15.17 17.6036 14.4796 17.6036H3.64575C2.95534 17.6036 2.39568 17.0439 2.39575 16.3535L2.39635 10.9369L2.45362 5.50708C2.46085 4.8219 3.01823 4.27026 3.70344 4.27026H8.64635M13.7333 4.30092L15.87 6.43766M16.3954 2.76162L17.2382 3.60442C17.7263 4.09258 17.7263 4.88403 17.2382 5.37219L10.2182 12.3921C10.0469 12.5635 9.82944 12.6813 9.59234 12.7313L6.64719 13.3526L7.26846 10.4074C7.31847 10.1704 7.43632 9.95291 7.60766 9.78157L14.6276 2.76162C15.1158 2.27347 15.9072 2.27347 16.3954 2.76162Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={onOpenSearch}
            className="hover:bg-background-soft-100 size-9 text-text-100 flex cursor-pointer items-center justify-center rounded-lg "
          >
            <Search1 />
          </button>
          <button
            onClick={onCreateProject}
            className="hover:bg-background-soft-100 size-9 text-text-100 flex cursor-pointer items-center justify-center rounded-lg "
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 14.25H3.75C3.35218 14.25 2.97064 14.092 2.68934 13.8107C2.40804 13.5294 2.25 13.1478 2.25 12.75V4.5C2.25 4.10218 2.40804 3.72064 2.68934 3.43934C2.97064 3.15804 3.35218 3 3.75 3H6.33579C6.601 3 6.85536 3.10536 7.04289 3.29289L8.70711 4.95711C8.89464 5.14464 9.149 5.25 9.41421 5.25H14.25C14.6478 5.25 15.0294 5.40804 15.3107 5.68934C15.592 5.97064 15.75 6.35218 15.75 6.75V9.375"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M12 14.25H16.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M14.25 12V16.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
