import { Layout22, PenToSquare, Xmark2x } from "@tailgrids/icons";
import { Link } from "react-router-dom";
import { useTheme } from "../../utils/theme-provider";

interface SidebarHeaderProps {
  isExpanded: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onCloseMobile?: () => void;
}

export const SidebarHeader = ({
  isExpanded,
  onToggleSidebar,
  onNewChat,
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
        </div>
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
        </div>
      )}
    </div>
  );
};
