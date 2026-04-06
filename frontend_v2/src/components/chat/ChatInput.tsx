import { ArrowUpward, Check, ChevronDown } from "@tailgrids/icons";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../tailgrids/core/dropdown";
import { Badge } from "../tailgrids/core/badge";
import { DATA, THEME, type ConfigItem } from "./data";
import type { Entity } from "../../services/api";
import type { Status } from "../../pages/Home";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: () => void;
  variant?: "centered" | "bottom";
  status?: Status;
  pendingEntities?: Entity[];
  pendingMessage?: string;
  onValidate?: () => void;
  onCancelReview?: () => void;
}

const ENTITY_COLORS: Record<
  string,
  | "primary"
  | "error"
  | "warning"
  | "success"
  | "violet"
  | "orange"
  | "cyan"
  | "rose"
  | "blue"
> = {
  PERSON: "blue",
  LOCATION: "success",
  ORGANIZATION: "violet",
  EMAIL: "warning",
  PHONE_NUMBER: "orange",
  DATE_OF_BIRTH: "cyan",
  ADDRESS: "success",
  CREDIT_CARD: "error",
  IBAN: "error",
  SOCIAL_SECURITY_NUMBER: "rose",
};

function buildSegments(
  text: string,
  entities: Entity[],
): { text: string; entity?: Entity }[] {
  if (!entities.length) return [{ text }];

  const sorted = [...entities].sort((a, b) => {
    const ai = text.toLowerCase().indexOf(a.original_text.toLowerCase());
    const bi = text.toLowerCase().indexOf(b.original_text.toLowerCase());
    return ai - bi;
  });

  const segments: { text: string; entity?: Entity }[] = [];
  let cursor = 0;

  for (const entity of sorted) {
    const idx = text
      .toLowerCase()
      .indexOf(entity.original_text.toLowerCase(), cursor);
    if (idx === -1) continue;

    if (idx > cursor) {
      segments.push({ text: text.slice(cursor, idx) });
    }
    segments.push({
      text: text.slice(idx, idx + entity.original_text.length),
      entity,
    });
    cursor = idx + entity.original_text.length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return segments;
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
  status = "idle",
  pendingEntities = [],
  pendingMessage = "",
  onValidate,
  onCancelReview,
}: ChatInputProps) {
  const [selectedModel, setSelectedModel] = useState("Claude-3.5-sonnet");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isReviewing = status === "reviewing";
  const isDisabled = status !== "idle" && status !== "reviewing";
  const hasEntities = pendingEntities.length > 0;
  const segments = isReviewing
    ? buildSegments(pendingMessage, pendingEntities)
    : [];

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

  // Global Enter handler for review validation
  const handleGlobalKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (isReviewing && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onValidate?.();
      }
    },
    [isReviewing, onValidate],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, [handleGlobalKeydown]);

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
        {/* Popup above input during review */}
        {isReviewing && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl ring-1 ring-white/10">
            {hasEntities
              ? "Données personnelles détectées — Entrée pour confirmer"
              : "Aucune PII détectée — Entrée pour envoyer"}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-6 border-t-6 border-x-transparent border-t-gray-900"></div>
          </div>
        )}

        <div
          className={`relative flex flex-col bg-background-50 rounded-3xl shadow-[0px_20px_32px_0px_rgba(17,24,39,0.04)] border transition-[border-color] duration-300 min-h-[120px] ${
            isReviewing
              ? hasEntities
                ? "border-warning-500/40"
                : "border-success-500/40"
              : isFocused
                ? "border-primary-500/40"
                : "border-base-100"
          }`}
        >
          {isReviewing ? (
            /* Review mode: highlighted text replaces textarea */
            <div className="pl-5 pr-2 pt-5 pb-3 text-title-50 text-base sm:text-lg sm:leading-6 min-h-[70px]">
              {segments.map((seg, i) =>
                seg.entity ? (
                  <Badge
                    key={i}
                    color={ENTITY_COLORS[seg.entity.label] ?? "gray"}
                    size="md"
                    className="mx-0.5 align-baseline"
                  >
                    {seg.text}
                    <span className="opacity-50 text-[10px] ml-0.5 uppercase">
                      {seg.entity.label}
                    </span>
                  </Badge>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </div>
          ) : (
            /* Normal mode: textarea */
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
              disabled={isDisabled}
            />
          )}

          <div className="flex items-center justify-between px-3 pb-3 pt-0">
            <div className="flex items-center">
              {isReviewing && (
                <button
                  onClick={onCancelReview}
                  className="text-text-100 hover:text-title-50 hover:bg-background-soft-100 text-sm font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {!isReviewing && (
                <div className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="underline-none hover:bg-background-soft-100 text-title-50 data-pressed:bg-background-soft-100 inline-flex cursor-pointer items-center justify-center md:gap-2 rounded-full w-9 h-9 p-0 md:w-auto md:h-auto md:px-3 md:py-2 text-sm font-medium transition-colors outline-none shrink-0">
                      {
                        DATA.MODELS.find((m) => m.value === selectedModel)
                          ?.icon
                      }
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
              )}

              <button
                onClick={isReviewing ? onValidate : onSend}
                disabled={
                  !isReviewing && (isDisabled || !inputValue.trim())
                }
                className={`text-white-100 shrink-0 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors ${
                  isReviewing
                    ? "bg-gray-800 hover:bg-foreground-soft-500"
                    : inputValue.trim() && !isDisabled
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

      {variant === "centered" && !isReviewing && (
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
