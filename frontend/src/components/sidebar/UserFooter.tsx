import { Menu } from "react-aria-components";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownPopover,
} from "../tailgrids/core/dropdown";
import { Exit } from "@tailgrids/icons";
import { cn } from "../../utils/cn";
import { THEME } from "../chat/data";

import type { Theme } from "../../utils/theme-provider";

interface UserFooterProps {
  isExpanded: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onLogout: () => void;
  onOpenSettings: (
    tab?: "account" | "preference" | "plan" | "resources",
  ) => void;
}

export const UserFooter = ({
  isExpanded,
  theme,
  setTheme,
  onLogout,
  onOpenSettings,
}: UserFooterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "relative z-20 overflow-hidden mt-4 rounded-xl transition-colors w-full focus:outline-none cursor-pointer py-3 ",
          isExpanded
            ? "px-4 bg-background-soft-100 hover:bg-background-soft-100"
            : "px-0 flex justify-center",
        )}
      >
        <div
          className={cn(
            "relative z-20 flex items-center",
            isExpanded ? "justify-between w-full" : "justify-center",
          )}
        >
          <div
            className={cn(
              "flex items-center",
              isExpanded ? "gap-3" : "justify-center",
            )}
          >
            <div className="shrink-0">
              <img
                src="/images/avatar/user.png"
                className="size-10 rounded-full"
                alt="Avatar"
              />
            </div>
            {isExpanded && (
              <div className="text-left">
                <h3 className="text-text-50 font-medium line-clamp-1 text-sm">
                  Adam wathon...
                </h3>
                <p className="text-text-100 text-xs text-left">Free</p>
              </div>
            )}
          </div>
          {isExpanded && (
            <div
              role="button"
              tabIndex={0}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenSettings("plan");
              }}
              className="bg-background-soft-100 text-text-50 h-7 flex items-center cursor-pointer rounded-full px-3 py-1 text-xs font-medium border border-base-100 transition-colors hover:bg-background-soft-200 relative z-30"
            >
              Upgrade
            </div>
          )}
        </div>
        {isExpanded && (
          <img
            src="https://cdn-tailgrids.b-cdn.net/3.0/ai/ai-sidebar/shape.png"
            className="absolute top-0 right-0 z-10 h-full w-full pointer-events-none"
            alt=""
          />
        )}
      </DropdownMenuTrigger>
      <DropdownPopover
        placement="top"
        className={cn(
          THEME.dropdown,
          "w-64 mb-2 shadow-sm bg-background-50 overflow-hidden outline-hidden p-0",
        )}
      >
        <div className="outline-none">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-3 border-b border-base-50 bg-background-50/50">
            <img
              src="/images/avatar/user.png"
              className="size-10 rounded-full border border-base-100"
              alt="Avatar"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-title-50 line-clamp-1">
                Adam Wathon
              </p>
              <p className="text-xs text-text-100 line-clamp-1">
                adam@example.com
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <Menu className="p-1.5 outline-hidden">
            <DropdownMenuItem
              className="py-2.5 px-3 rounded-lg gap-3 text-sm cursor-pointer"
              onAction={() => onOpenSettings("account")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.2647 1.54199C12.3618 1.54199 13.251 2.43142 13.2511 3.52832C13.2513 3.90236 13.6568 4.13655 13.9806 3.9502C14.9305 3.40175 16.1449 3.7269 16.6935 4.67676L17.9571 6.86523C18.5056 7.81533 18.1806 9.03056 17.2306 9.5791C16.9065 9.76647 16.9064 10.2347 17.2306 10.4219C18.1805 10.9705 18.5056 12.1857 17.9571 13.1357L16.6935 15.3242C16.1448 16.2737 14.9303 16.5991 13.9806 16.0508C13.6566 15.8639 13.2511 16.0983 13.2511 16.4727C13.2507 17.5693 12.3616 18.459 11.2647 18.459H8.73838C7.64139 18.4589 6.75125 17.5687 6.75108 16.4717C6.75084 16.0975 6.34605 15.8636 6.02158 16.0508C5.07147 16.5991 3.85541 16.2734 3.30674 15.3232L2.04405 13.1357C1.4956 12.1858 1.82095 10.9706 2.77061 10.4219C3.09494 10.2346 3.09496 9.76637 2.77061 9.5791C1.82074 9.03055 1.49579 7.81526 2.04405 6.86523L3.30674 4.67676C3.85547 3.72655 5.07143 3.40164 6.02158 3.9502C6.34603 4.1372 6.75084 3.90246 6.75108 3.52832C6.75126 2.43134 7.64139 1.54211 8.73838 1.54199H11.2647ZM8.73838 3.04199C8.46981 3.04211 8.25126 3.25977 8.25108 3.52832C8.25084 5.05755 6.59574 6.0133 5.27158 5.24902C5.03885 5.11466 4.74107 5.19438 4.60655 5.42676L3.34287 7.61523C3.20882 7.84785 3.2881 8.14595 3.52061 8.28027C4.84494 9.04488 4.84496 10.9561 3.52061 11.7207C3.28832 11.8552 3.20863 12.1532 3.34287 12.3857L4.60655 14.5732C4.74092 14.8058 5.03877 14.8862 5.27158 14.752C6.59575 13.9875 8.25084 14.9424 8.25108 16.4717C8.25125 16.7402 8.46982 16.9589 8.73838 16.959H11.2647C11.533 16.959 11.7507 16.741 11.7511 16.4727C11.7511 14.9439 13.4063 13.9875 14.7306 14.752C14.9629 14.8861 15.2602 14.8063 15.3946 14.5742L16.6583 12.3857C16.7926 12.1531 16.7132 11.8551 16.4806 11.7207C15.1564 10.9562 15.1566 9.04499 16.4806 8.28027C16.7132 8.14596 16.7925 7.8479 16.6583 7.61523L15.3946 5.42676C15.2603 5.19427 14.9631 5.11477 14.7306 5.24902C13.4065 6.013 11.7513 5.05673 11.7511 3.52832C11.751 3.25969 11.5332 3.04199 11.2647 3.04199H8.73838ZM10.0011 6.67871C11.8348 6.67896 13.3212 8.16629 13.3214 10C13.3211 11.8337 11.8348 13.3201 10.0011 13.3203C8.16728 13.3202 6.68003 11.8338 6.67979 10C6.68 8.1662 8.16726 6.67882 10.0011 6.67871ZM10.0011 8.17871C8.99569 8.17882 8.18 8.99463 8.17979 10C8.18003 11.0053 8.99571 11.8202 10.0011 11.8203C11.0063 11.8201 11.8211 11.0053 11.8214 10C11.8212 8.99471 11.0064 8.17896 10.0011 8.17871Z"
                  fill="currentColor"
                />
              </svg>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="py-2.5 px-3 rounded-lg gap-3 text-sm cursor-pointer"
              onAction={() => onOpenSettings("resources")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.6667 14.2095V9.99971C16.6667 6.31779 13.6819 3.33301 9.99995 3.33301C6.31803 3.33301 3.33325 6.31779 3.33325 9.99971V14.2095M16.6664 11.7005V16.458C16.6664 17.1484 16.1068 17.708 15.4164 17.708H11.6664M5.41664 15.6247H4.5833C3.89295 15.6247 3.3333 15.065 3.3333 14.3747V11.458C3.3333 10.7677 3.89295 10.208 4.5833 10.208H5.41664C6.10699 10.208 6.66664 10.7677 6.66664 11.458V14.3747C6.66664 15.065 6.10699 15.6247 5.41664 15.6247ZM14.5833 15.6247H15.4166C16.1069 15.6247 16.6666 15.065 16.6666 14.3747V11.458C16.6666 10.7677 16.1069 10.208 15.4166 10.208H14.5833C13.8929 10.208 13.3333 10.7677 13.3333 11.458V14.3747C13.3333 15.065 13.8929 15.6247 14.5833 15.6247Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Help centers</span>
            </DropdownMenuItem>

            {/* Theme Toggle (Custom row - Outside Menu) */}
            <DropdownMenuItem className="flex items-center justify-between px-3  py-2.5 text-sm ">
              <span className="flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0001 2.29199V3.54199M15.4509 4.55111L14.567 5.43499M17.7084 10.0003H16.4584M15.4509 15.4495L14.567 14.5657M10.0001 16.4587V17.7087M5.43302 14.5706L4.54914 15.4545M3.54175 10.0003H2.29175M5.43302 5.43001L4.54914 4.54613M6.04175 10.0003C6.04175 12.1865 7.81395 13.9587 10.0001 13.9587C12.1862 13.9587 13.9584 12.1865 13.9584 10.0003C13.9584 7.8142 12.1862 6.04199 10.0001 6.04199C7.81395 6.04199 6.04175 7.8142 6.04175 10.0003Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Theme
              </span>
              <div className="flex items-center rounded-full border border-base-100 h-8  p-0.5">
                <button
                  onClick={() => setTheme("system")}
                  className={cn(
                    "cursor-pointer rounded-full inline-flex items-center justify-center  p-1.5 h-7 w-7 transition-all ",
                    theme === "system"
                      ? "bg-background-soft-100 shadow-xs"
                      : "text-title-50 hover:bg-background-soft-100 hover:shadow-xs",
                  )}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.29175 16.6663H17.7085M8.33342 11.6663H11.6668M4.58347 14.1663H15.4167C16.1071 14.1663 16.6667 13.6067 16.6667 12.9163V4.58301C16.6667 3.89265 16.1071 3.33301 15.4167 3.33301H4.58347C3.89312 3.33301 3.33347 3.89265 3.33347 4.58301V12.9163C3.33347 13.6067 3.89312 14.1663 4.58347 14.1663Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "cursor-pointer rounded-full inline-flex items-center justify-center p-1.5 h-7 w-7 transition-all",
                    theme === "light"
                      ? "bg-background-soft-100  shadow-xs"
                      : "text-title-50 hover:bg-background-soft-100 hover:shadow-xs",
                  )}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 14.5C8.80653 14.5 7.66193 14.0259 6.81802 13.182C5.97411 12.3381 5.5 11.1935 5.5 10C5.5 8.80653 5.97411 7.66193 6.81802 6.81802C7.66193 5.97411 8.80653 5.5 10 5.5C11.1935 5.5 12.3381 5.97411 13.182 6.81802C14.0259 7.66193 14.5 8.80653 14.5 10C14.5 11.1935 14.0259 12.3381 13.182 13.182C12.3381 14.0259 11.1935 14.5 10 14.5ZM10 13C10.7956 13 11.5587 12.6839 12.1213 12.1213C12.6839 11.5587 13 10.7956 13 10C13 9.20435 12.6839 8.44129 12.1213 7.87868C11.5587 7.31607 10.7956 7 10 7C9.20435 7 8.44129 7.31607 7.87868 7.87868C7.31607 8.44129 7 9.20435 7 10C7 10.7956 7.31607 11.5587 7.87868 12.1213C8.44129 12.6839 9.20435 13 10 13ZM9.25 2.5C9.25 2.08579 9.58579 1.75 10 1.75C10.4142 1.75 10.75 2.08579 10.75 2.5V3.25C10.75 3.66421 10.4142 4 10 4C9.58579 4 9.25 3.66421 9.25 3.25V2.5ZM9.25 16.75C9.25 16.3358 9.58579 16 10 16C10.4142 16 10.75 16.3358 10.75 16.75V17.5C10.75 17.9142 10.4142 18.25 10 18.25C9.58579 18.25 9.25 17.9142 9.25 17.5V16.75ZM4.1665 5.227C3.87365 4.93415 3.87365 4.45935 4.1665 4.1665C4.45935 3.87365 4.93415 3.87365 5.227 4.1665L5.75725 4.69675C6.0501 4.9896 6.0501 5.4644 5.75725 5.75725C5.4644 6.0501 4.9896 6.0501 4.69675 5.75725L4.1665 5.227ZM14.2428 15.3033C13.9499 15.0104 13.9499 14.5356 14.2428 14.2428C14.5356 13.9499 15.0104 13.9499 15.3033 14.2428L15.8335 14.773C16.1263 15.0658 16.1264 15.5407 15.8335 15.8335C15.5407 16.1264 15.0658 16.1263 14.773 15.8335L14.2428 15.3033ZM14.7727 4.16631C15.0657 3.8732 15.5408 3.87323 15.8337 4.16637C16.1265 4.45932 16.1264 4.93409 15.8336 5.22694L15.3033 5.75719C15.0104 6.05007 14.5356 6.05007 14.2427 5.75719C13.9499 5.46435 13.9498 4.98959 14.2426 4.69669L14.7727 4.16631ZM4.69675 14.2428C4.9896 13.9499 5.4644 13.9499 5.75725 14.2428C6.0501 14.5356 6.0501 15.0104 5.75725 15.3033L5.227 15.8335C4.93415 16.1264 4.45935 16.1263 4.1665 15.8335C3.87365 15.5407 3.87365 15.0658 4.1665 14.773L4.69675 14.2428ZM17.5 9.25C17.9142 9.25 18.25 9.58579 18.25 10C18.25 10.4142 17.9142 10.75 17.5 10.75H16.75C16.3358 10.75 16 10.4142 16 10C16 9.58579 16.3358 9.25 16.75 9.25H17.5ZM3.25 9.25C3.66421 9.25 4 9.58579 4 10C4 10.4142 3.66421 10.75 3.25 10.75H2.5C2.08579 10.75 1.75 10.4142 1.75 10C1.75 9.58579 2.08579 9.25 2.5 9.25H3.25Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "cursor-pointer rounded-full p-1.5 h-7 w-7 inline-flex items-center justify-center transition-all ",
                    theme === "dark"
                      ? "bg-background-soft-100 shadow-xs"
                      : "text-title-50 hover:bg-background-soft-100 hover:shadow-xs",
                  )}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.5 6.25C8.49985 7.29298 8.81035 8.31237 9.39192 9.17816C9.97348 10.0439 10.7997 10.7169 11.7653 11.1112C12.7309 11.5055 13.7921 11.6032 14.8134 11.3919C15.8348 11.1807 16.7701 10.67 17.5 9.925V10C17.5 14.1423 14.1423 17.5 10 17.5C5.85775 17.5 2.5 14.1423 2.5 10C2.5 5.85775 5.85775 2.5 10 2.5H10.075C9.57553 2.98834 9.17886 3.57172 8.90836 4.21576C8.63786 4.8598 8.49902 5.55146 8.5 6.25ZM4 10C3.99945 11.3387 4.44665 12.6392 5.27042 13.6945C6.09419 14.7497 7.24723 15.4992 8.54606 15.8236C9.84489 16.148 11.2149 16.0287 12.4381 15.4847C13.6614 14.9407 14.6675 14.0033 15.2965 12.8215C14.1771 13.0852 13.0088 13.0586 11.9026 12.744C10.7964 12.4295 9.78888 11.8376 8.97566 11.0243C8.16244 10.2111 7.57048 9.20361 7.25596 8.09738C6.94144 6.99116 6.91477 5.82292 7.1785 4.7035C6.21818 5.2151 5.41509 5.97825 4.85519 6.91123C4.2953 7.84422 3.99968 8.91191 4 10Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </DropdownMenuItem>
          </Menu>

          <Menu className="p-1 outline-hidden border-t border-base-50">
            <DropdownMenuItem
              onAction={onLogout}
              className="py-2.5 px-3 rounded-lg gap-3 cursor-pointer"
            >
              <Exit className="size-4.5" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </Menu>
        </div>
      </DropdownPopover>
    </DropdownMenu>
  );
};
