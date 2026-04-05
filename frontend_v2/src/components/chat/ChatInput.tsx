import { ArrowUpward, Check, ChevronDown } from "@tailgrids/icons";
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
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxTextHeight = 250;
      const initialHeight = 70;
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
          <div className="flex items-center justify-end px-3 pb-3 pt-0">
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
