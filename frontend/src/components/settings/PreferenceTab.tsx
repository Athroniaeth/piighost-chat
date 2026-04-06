import { cn } from "../../utils/cn";
import { type Theme } from "../../utils/theme-provider";
import { Toggle } from "../tailgrids/core/toggle";
import { Button } from "../tailgrids/core/button";
import { Xmark2x } from "@tailgrids/icons";

interface PreferenceTabProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onClose?: () => void;
}

export function PreferenceTab({
  theme,
  setTheme,
  onClose,
}: PreferenceTabProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="py-3 border-b border-base-100 flex justify-between items-center bg-background-50 z-10">
        <h3 className="text-xl font-medium text-title-50">Preference</h3>
        <Button
          variant="ghost"
          iconOnly
          size="xs"
          className="text-text-100 hover:text-title-50"
          onClick={onClose}
        >
          <Xmark2x className="size-6" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 pb-10 space-y-8 pr-1">
        {/* Theme */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-title-50">Theme</h4>
            <p className="text-xs text-text-100">
              Adjust your display appearance
            </p>
          </div>
          <div className="flex items-center rounded-full border border-base-100 h-8 p-0.5">
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "cursor-pointer rounded-full text-title-50 inline-flex items-center justify-center p-1.5 h-7 w-7 transition-all ",
                theme === "system"
                  ? "bg-background-soft-100 shadow-xs"
                  : " hover:bg-background-soft-100 hover:shadow-xs",
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
                  stroke="currentcolor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "cursor-pointer rounded-full text-title-50 inline-flex items-center justify-center p-1.5 h-7 w-7 transition-all",
                theme === "light"
                  ? "bg-background-soft-100 shadow-xs"
                  : " hover:bg-background-soft-100 hover:shadow-xs",
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
                "cursor-pointer rounded-full text-title-50 p-1.5 h-7 w-7 inline-flex items-center justify-center transition-all ",
                theme === "dark"
                  ? "bg-background-soft-100 shadow-xs"
                  : " hover:bg-background-soft-100 hover:shadow-xs",
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
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-title-50">Language</h4>
            <p className="text-xs text-text-100">
              Choose your preferred language
            </p>
          </div>
          <select className="bg-background-50 border border-base-100 rounded-lg px-3 py-1.5 text-sm text-title-50 outline-none w-[120px] focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer">
            <option>English</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
          </select>
        </div>

        <div className="border-t border-base-100 my-4" />

        {/* Deep Research */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-title-50">Deep Research</h4>
            <p className="text-xs text-text-100">
              Get notified Your detailed research findings are ready
            </p>
          </div>
          <Toggle size="sm" defaultChecked />
        </div>

        {/* Newsletter */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-title-50">Newsletter</h4>
            <p className="text-xs text-text-100">
              Stay updated with the latest news and insights
            </p>
          </div>
          <Toggle size="sm" />
        </div>
      </div>
    </div>
  );
}
