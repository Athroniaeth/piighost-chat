import { ArrowUpward, Check, ChevronDown, Xmark2x } from "@tailgrids/icons";
import { useRef, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../tailgrids/core/dropdown";
import { DATA, THEME, type ConfigItem } from "./data";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: () => void;
  variant?: "centered" | "bottom";
}

const StyledMenuItem = ({
  item,
  isSelected,
  onClick,
  className = "",
  showCheck = true,
}: {
  item: ConfigItem;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
  showCheck?: boolean;
}) => (
  <DropdownMenuItem
    onAction={onClick}
    className={`${THEME.dropdownItem}  ${className} ${isSelected ? "bg-background-soft-100" : ""}`}
  >
    <div className="flex items-center gap-2 grow">
      {item.icon}
      <span className="text-sm">{item.label}</span>
    </div>
    <div className="flex items-center gap-1 ">
      {showCheck && isSelected && <Check className="size-4 " />}
    </div>
  </DropdownMenuItem>
);

export default function ChatInput({
  inputValue,
  setInputValue,
  onSend,
  variant = "centered",
}: ChatInputProps) {
  const [selectedModel, setSelectedModel] = useState("Claude-3.5-sonnet");
  const [selectedTool, setSelectedTool] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxTextHeight = 250;
      const initialHeight = 70; // Enough height to fill the 120px container reasonably
      const newHeight = Math.max(
        initialHeight,
        Math.min(textarea.scrollHeight, maxTextHeight),
      );
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = "scroll";
    }
  }, [inputValue]);

  // Short label mapping for models
  const modelShortLabels: Record<string, string> = {
    "GPT-4o": "4o",
    "GPT-4o-mini": "4o Mini",
    "Claude-3-5-sonnet": "Claude 3.5",
    "Gemini-1-5-pro": "Gemini Pro",
    "Gemini-1-5-flash": "Gemini Flash",
  };
  const currentModelLabel = modelShortLabels[selectedModel] || selectedModel;

  const containerClasses =
    variant === "centered"
      ? "relative z-50 mx-auto w-full max-w-[800px]"
      : "mx-auto max-w-[800px]";

  return (
    <div className={containerClasses}>
      <div className="relative group transition-all duration-300">
        <div
          className={`relative flex flex-col bg-background-50 rounded-3xl shadow-[0px_20px_32px_0px_rgba(17,24,39,0.04)] border transition-[border-color] duration-300 min-h-[120px] ${
            isFocused ? "border-primary-500/40" : "border-base-100"
          }`}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            className="text-title-50 pl-5 pr-2 pt-5 pb-3 placeholder:text-base placeholder:text-gray-400 font-normal block w-full resize-none border-0 bg-transparent focus:ring-0 outline-none sm:text-lg sm:leading-6 custom-scrollbar"
            placeholder="Ask me anything..."
            value={inputValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <div className="flex items-center justify-between px-3 pb-3 pt-0">
            <div className="flex items-center ">
              <input
                type="file"
                id="chat-file-input"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    console.log("Selected file:", files[0].name);
                    // You can add logic here to handle the file upload or preview
                  }
                }}
              />
              <button
                className={THEME.buttonIcon + " shrink-0"}
                onClick={() =>
                  document.getElementById("chat-file-input")?.click()
                }
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.58191 1.54199C10.5624 1.54218 12.1688 3.14806 12.1688 5.12891L12.1688 13.4541C12.1685 14.6513 11.1972 15.6221 9.99988 15.6221C8.80293 15.6217 7.83224 14.6511 7.83191 13.4541L7.83191 5.12891C7.83191 4.71484 8.1679 4.37915 8.58191 4.37891C8.99612 4.37891 9.33191 4.71469 9.33191 5.12891L9.33191 13.4541C9.33224 13.8226 9.63135 14.1217 9.99988 14.1221C10.3688 14.1221 10.6685 13.8229 10.6688 13.4541V12.0537C10.6687 12.0478 10.6679 12.0412 10.6678 12.0352L10.6688 5.12891C10.6688 3.97681 9.73429 3.04218 8.58191 3.04199C7.42969 3.04217 6.495 3.97664 6.495 5.12891L6.495 13.4541C6.49533 15.3893 8.06465 16.9587 9.99988 16.959C11.9353 16.959 13.5044 15.3895 13.5048 13.4541L13.5048 7.96484C13.5049 7.55092 13.8409 7.21511 14.2548 7.21484C14.6689 7.21484 15.0046 7.55076 15.0048 7.96484L15.0048 13.4541C15.0044 16.2179 12.7638 18.459 9.99988 18.459C7.23623 18.4587 4.99533 16.2177 4.995 13.4541L4.995 5.12891C4.995 3.14821 6.60126 1.54217 8.58191 1.54199Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              <div className="flex">
                {selectedTool ? (
                  <div className="bg-primary-500/10 shrink-0 text-primary-500 h-9 rounded-full inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-2 text-sm font-medium">
                    <button
                      onClick={() => setSelectedTool("")}
                      className="bg-primary-500/20 hover:bg-primary-500/10 text-primary-500 size-4 flex items-center justify-center rounded-full transition-colors cursor-pointer"
                    >
                      <Xmark2x className="size-4" />
                    </button>
                    <span className="md:hidden flex items-center">
                      {DATA.TOOLS.find((t) => t.value === selectedTool)?.icon}
                    </span>
                    <span className="hidden md:inline">
                      {DATA.TOOLS.find((t) => t.value === selectedTool)?.label}
                    </span>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-title-50 flex items-center justify-center md:gap-2 font-medium hover:bg-background-soft-100 rounded-full w-9 h-9 p-0 md:w-auto md:h-auto md:px-3 md:py-1.5 transition-colors outline-none cursor-pointer">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="shrink-0"
                      >
                        <path
                          d="M11.7227 4.72366C11.7227 3.5878 10.8019 2.66699 9.66605 2.66699C8.53019 2.66699 7.6094 3.58781 7.60938 4.72366M11.7227 4.72366C11.7227 5.85952 10.8019 6.78033 9.66605 6.78033C8.53019 6.78033 7.60938 5.85952 7.60938 4.72366M11.7227 4.72366L14.1667 4.72363M7.60938 4.72366L1.83334 4.72363M4.2773 11.277C4.27731 10.1411 5.1981 9.22033 6.33397 9.22033C7.46983 9.22033 8.39063 10.1411 8.39063 11.277M4.2773 11.277C4.2773 12.4129 5.1981 13.3337 6.33397 13.3337C7.46983 13.3337 8.39063 12.4129 8.39063 11.277M4.2773 11.277L1.83334 11.277M8.39063 11.277L14.1667 11.277"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="hidden md:inline">Tools</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      placement="bottom start"
                      className={`${THEME.dropdown} w-45`}
                    >
                      {DATA.TOOLS.map((tool) => (
                        <StyledMenuItem
                          key={tool.id}
                          item={tool}
                          isSelected={selectedTool === tool.value}
                          onClick={() => setSelectedTool(tool.value || "")}
                          className="text-sm"
                          showCheck={false}
                        />
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <div className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger className="underline-none hover:bg-background-soft-100 text-title-50 data-pressed:bg-background-soft-100 inline-flex cursor-pointer items-center justify-center md:gap-2 rounded-full w-9 h-9 p-0 md:w-auto md:h-auto md:px-3 md:py-2 text-sm font-medium transition-colors outline-none shrink-0">
                    {DATA.MODELS.find((m) => m.value === selectedModel)?.icon}
                    <span className="hidden md:inline">
                      {currentModelLabel}
                    </span>
                    <ChevronDown className="hidden md:block size-4 sm:size-5 transition-transform duration-200 group-data-open:rotate-180" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    placement="bottom start"
                    className={`${THEME.dropdown} w-45`}
                  >
                    {DATA.MODELS.map((model) => (
                      <StyledMenuItem
                        key={model.id}
                        item={model}
                        isSelected={selectedModel === model.value}
                        onClick={() => setSelectedModel(model.value || "")}
                      />
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <button
                onClick={onSend}
                disabled={!inputValue.trim()}
                className={`text-white-100  shrink-0 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors ${
                  inputValue.trim()
                    ? "bg-gray-800 hover:bg-foreground-soft-500"
                    : "bg-gray-300 cursor-not-allowed opacity-50"
                }`}
              >
                <ArrowUpward className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {variant === "centered" && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {DATA.QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                setInputValue(action.label);
                textareaRef.current?.focus();
              }}
              className="border-base-100 hover:bg-background-soft-100 text-text-200 flex items-center gap-2 rounded-full border bg-transparent px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
