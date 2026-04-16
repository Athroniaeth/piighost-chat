import { ArrowUpward, Check, ChevronDown } from "@tailgrids/icons";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../tailgrids/core/dropdown";
import { DATA, THEME, type ConfigItem } from "./data";
import type { Entity, DetectionDTO } from "../../services/api";
import type { Status } from "../../pages/Home";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: () => void;
  variant?: "centered" | "bottom";
  status?: Status;
  pendingEntities?: Entity[];
  pendingDetections?: DetectionDTO[];
  availableLabels?: string[];
  pendingMessage?: string;
  onValidate?: () => void;
  onCancelReview?: () => void;
  onRemoveDetection?: (det: DetectionDTO) => void;
  onAddDetection?: (det: DetectionDTO) => void;
}

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  PERSON: { bg: "#dbeafe", text: "#1e40af" },
  LOCATION: { bg: "#dcfce7", text: "#166534" },
  EMAIL: { bg: "#ffedd5", text: "#9a3412" },
  PHONE: { bg: "#f3e8ff", text: "#6b21a8" },
  PHONE_INTERNATIONAL: { bg: "#f3e8ff", text: "#6b21a8" },
  CREDIT_CARD: { bg: "#fee2e2", text: "#991b1b" },
  URL: { bg: "#cffafe", text: "#155e75" },
  SSN: { bg: "#fee2e2", text: "#991b1b" },
};
const DEFAULT_COLOR = { bg: "var(--color-primary-500)", text: "#ffffff" };

function getLabelColor(label: string) {
  return LABEL_COLORS[label.toUpperCase()] ?? DEFAULT_COLOR;
}

interface Segment {
  text: string;
  start: number;
  end: number;
  detection?: DetectionDTO;
}

function buildDetectionSegments(
  text: string,
  detections: DetectionDTO[],
): Segment[] {
  if (!detections.length)
    return [{ text, start: 0, end: text.length }];

  const sorted = [...detections].sort(
    (a, b) => a.start_pos - b.start_pos,
  );
  const segments: Segment[] = [];
  let cursor = 0;

  for (const det of sorted) {
    if (det.start_pos > cursor) {
      segments.push({
        text: text.slice(cursor, det.start_pos),
        start: cursor,
        end: det.start_pos,
      });
    }
    segments.push({
      text: text.slice(det.start_pos, det.end_pos),
      start: det.start_pos,
      end: det.end_pos,
      detection: det,
    });
    cursor = det.end_pos;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      start: cursor,
      end: text.length,
    });
  }

  return segments;
}

/** Walk up DOM to find nearest span with data-offset attribute. */
function getSpanWithOffset(node: Node): HTMLElement | null {
  let cur: Node | null = node;
  while (cur && cur !== document.body) {
    if (cur instanceof HTMLElement && cur.dataset.offset !== undefined) {
      return cur;
    }
    cur = cur.parentNode;
  }
  return null;
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
  pendingDetections = [],
  availableLabels = [],
  pendingMessage = "",
  onValidate,
  onCancelReview,
  onRemoveDetection,
  onAddDetection,
}: ChatInputProps) {
  const [selectedModel, setSelectedModel] = useState("GPT-5.4");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  // Label picker state for adding detections via text selection
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number; text: string } | null>(null);
  const [customLabel, setCustomLabel] = useState("");

  const isReviewing = status === "reviewing";
  const isDisabled = status !== "idle" && status !== "reviewing";
  const hasDetections = pendingDetections.length > 0;
  const segments = isReviewing
    ? buildDetectionSegments(pendingMessage, pendingDetections)
    : [];

  // All known labels: config + currently used
  const allLabels = [
    ...new Set([
      ...availableLabels,
      ...pendingDetections.map((d) => d.label),
    ]),
  ].sort();

  const closePicker = useCallback(() => {
    setPickerPos(null);
    setSelectedRange(null);
    setCustomLabel("");
    window.getSelection()?.removeAllRanges();
  }, []);

  const addWithLabel = useCallback(
    (label: string) => {
      if (!selectedRange || !onAddDetection) return;
      onAddDetection({
        text: selectedRange.text,
        label,
        start_pos: selectedRange.start,
        end_pos: selectedRange.end,
        confidence: 1.0,
      });
      closePicker();
    },
    [selectedRange, onAddDetection, closePicker],
  );

  // Handle text selection in review mode for adding detections
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !reviewRef.current) return;

    const range = sel.getRangeAt(0);
    if (!reviewRef.current.contains(range.commonAncestorContainer)) return;

    const selectedText = sel.toString();
    if (!selectedText.trim()) return;

    const startSpan = getSpanWithOffset(range.startContainer);
    const endSpan = getSpanWithOffset(range.endContainer);
    if (!startSpan || !endSpan) return;

    const absStart = parseInt(startSpan.dataset.offset ?? "0", 10) + range.startOffset;
    const absEnd = parseInt(endSpan.dataset.offset ?? "0", 10) + range.endOffset;
    if (absStart >= absEnd) return;

    // Don't allow overlapping with existing detections
    const overlaps = pendingDetections.some(
      (d) => d.start_pos < absEnd && absStart < d.end_pos,
    );
    if (overlaps) return;

    const rect = range.getBoundingClientRect();
    const containerRect = reviewRef.current.getBoundingClientRect();
    setPickerPos({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.bottom - containerRect.top + 4,
    });
    setSelectedRange({
      start: absStart,
      end: absEnd,
      text: pendingMessage.slice(absStart, absEnd),
    });
  }, [pendingDetections, pendingMessage]);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerPos) return;
    function handleClick(e: MouseEvent) {
      const picker = document.getElementById("label-picker");
      if (picker && !picker.contains(e.target as Node)) {
        closePicker();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerPos, closePicker]);

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
            {hasDetections
              ? "PII detected. Remove with ✕, select text to add. Enter to confirm."
              : "No PII detected. Select text to add, or press Enter to send."}
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
            /* Review mode: highlighted text with X buttons and text selection */
            <div
              ref={reviewRef}
              onMouseUp={handleMouseUp}
              className="relative pl-5 pr-2 pt-5 pb-3 text-title-50 text-base sm:text-lg sm:leading-6 min-h-[70px] select-text"
            >
              {segments.map((seg, i) => {
                if (seg.detection) {
                  const color = getLabelColor(seg.detection.label);
                  return (
                    <mark
                      key={i}
                      data-offset={seg.start}
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                        borderRadius: "6px",
                        padding: "2px 6px",
                        margin: "0 2px",
                        fontSize: "inherit",
                        fontWeight: 500,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.65em",
                          textTransform: "uppercase",
                          opacity: 0.7,
                          fontWeight: 600,
                        }}
                      >
                        {seg.detection.label}
                      </span>
                      {seg.text}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveDetection?.(seg.detection!);
                        }}
                        style={{
                          marginLeft: "2px",
                          opacity: 0.6,
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          color: "inherit",
                          padding: "0 1px",
                          fontSize: "0.8em",
                          lineHeight: 1,
                        }}
                        title={`Remove "${seg.text}" (${seg.detection.label})`}
                      >
                        ✕
                      </button>
                    </mark>
                  );
                }
                return (
                  <span key={i} data-offset={seg.start}>
                    {seg.text}
                  </span>
                );
              })}

              {/* Label picker popover */}
              {pickerPos && selectedRange && (
                <div
                  id="label-picker"
                  className="absolute z-50 flex flex-col gap-1 rounded-lg border bg-white p-2 shadow-lg"
                  style={{
                    left: pickerPos.x,
                    top: pickerPos.y,
                    transform: "translateX(-50%)",
                    minWidth: 180,
                  }}
                >
                  <p className="text-xs text-gray-500 mb-1">
                    Label for &quot;{selectedRange.text}&quot;
                  </p>
                  {allLabels.map((label) => {
                    const color = getLabelColor(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        className="flex items-center gap-2 rounded px-2 py-1 text-left text-xs hover:opacity-80 cursor-pointer"
                        style={{ backgroundColor: color.bg, color: color.text }}
                        onClick={() => addWithLabel(label)}
                      >
                        + {label}
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-1 border-t pt-1 mt-1">
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value.toUpperCase())}
                      placeholder="CUSTOM_LABEL"
                      className="flex-1 rounded border px-1.5 py-0.5 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customLabel.trim()) {
                          e.stopPropagation();
                          addWithLabel(customLabel.trim());
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={!customLabel.trim()}
                      className="text-green-600 text-xs px-1 cursor-pointer disabled:opacity-30"
                      onClick={() => {
                        if (customLabel.trim()) addWithLabel(customLabel.trim());
                      }}
                    >
                      ✓
                    </button>
                  </div>
                </div>
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
                  Cancel
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
              onClick={() => onSend(action.label)}
              className="border-base-100 hover:bg-background-soft-100 text-text-200 flex items-center gap-2 rounded-full border bg-transparent px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
