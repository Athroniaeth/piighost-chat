import {
  Check,
  Copy4,
  MenuKebab1,
  Pencil1,
  RefreshCircle1Clockwise,
  ShareNodes,
  ThumbsUp2,
  Trash1,
} from "@tailgrids/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../tailgrids/core/dropdown";
import { useState } from "react";
import { THEME } from "./data";
import { Button } from "../tailgrids/core/button";

export const AIIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
  >
    <g clipPath="url(#clip0_11928_2513)">
      <path
        d="M16 8.016C13.9242 8.14339 11.9666 9.02545 10.496 10.496C9.02545 11.9666 8.14339 13.9242 8.016 16H7.984C7.85682 13.9241 6.97483 11.9664 5.5042 10.4958C4.03358 9.02518 2.07588 8.14318 0 8.016L0 7.984C2.07588 7.85682 4.03358 6.97483 5.5042 5.5042C6.97483 4.03358 7.85682 2.07588 7.984 0L8.016 0C8.14339 2.07581 9.02545 4.03339 10.496 5.50397C11.9666 6.97455 13.9242 7.85661 16 7.984V8.016Z"
        fill="url(#paint0_radial_11928_2513)"
      />
    </g>
    <defs>
      <radialGradient
        id="paint0_radial_11928_2513"
        cx={0}
        cy={0}
        r={1}
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(1.588 6.503) rotate(18.6832) scale(17.03 136.421)"
      >
        <stop offset="0.067" stopColor="#3758F9" />
        <stop offset="0.343" stopColor="#5E84FC" />
        <stop offset="0.672" stopColor="#BECDFF" />
      </radialGradient>
      <clipPath id="clip0_11928_2513">
        <rect width={16} height={16} fill="white" />
      </clipPath>
    </defs>
  </svg>
);

interface ActionButtonProps {
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

const ActionButton = ({
  onClick,
  icon,
  label,
  className = "",
}: ActionButtonProps) => (
  <button
    onClick={onClick}
    className={`group relative hover:bg-background-soft-100 text-text-50 cursor-pointer gap-1.5 rounded-full size-8 flex items-center justify-center transition-colors ${className}`}
  >
    {icon}
    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 mb-2 h-9 flex items-center justify-center -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 ring-1 ring-white/10 pointer-events-none z-50">
      {label}
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900"></div>
    </div>
  </button>
);

interface MessageProps {
  message: {
    id: number;
    type: string;
    content: string;
    actions: string[];
  };
  onEdit?: (id: number, content: string) => void;
  onDelete?: (id: number) => void;
}

export default function MessageItem({
  message,
  onEdit,
  onDelete,
}: MessageProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);

  const handleCopy = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (message.type === "thinking") {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2">
          <AIIcon />
          <span className="text-text-100 text-sm">Tailgrids AI 2.0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.3s]"></div>
          <div className="size-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.15s]"></div>
          <div className="size-2 animate-bounce rounded-full bg-primary-400"></div>
        </div>
      </div>
    );
  }

  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="w-full max-w-fit">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <div className="bg-background-soft-100 rounded-3xl rounded-tr-md p-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-transparent w-full text-title-50 ring-0 focus:ring-0 text-base focus:outline-none border-0 focus:border-0 outline-none p-3 resize-none min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2 pr-1">
                <Button
                  appearance="outline"
                  className="h-8 text-sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditValue(message.content);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="h-8 bg-gray-800 hover:bg-gray-95 text-sm"
                  onClick={() => {
                    onEdit?.(message.id, editValue);
                    setIsEditing(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-background-soft-100 rounded-3xl rounded-tr-md px-5 py-4">
                <p className="text-title-50 text-base">{message.content}</p>
              </div>
              <div className="mt-2.5 flex justify-end gap-1.5">
                {message.actions.includes("copy") && (
                  <ActionButton
                    onClick={() => handleCopy(message.id, message.content)}
                    label={copiedId === message.id ? "Copied!" : "Copy"}
                    icon={
                      copiedId === message.id ? (
                        <Check className="text-success-500 size-4.5" />
                      ) : (
                        <Copy4 className="text-text-100 size-4.5" />
                      )
                    }
                  />
                )}
                {message.actions.includes("edit") && (
                  <ActionButton
                    onClick={() => setIsEditing(true)}
                    label="Edit"
                    icon={<Pencil1 className="text-text-100 size-4" />}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-2">
        <AIIcon />
        <span className="text-text-100 text-sm">Tailgrids AI 2.0</span>
      </div>
      <div>
        <p className="text-title-50 mb-3 leading-relaxed">{message.content}</p>
        <div className="flex items-center gap-1.5">
          {message.actions.includes("copy") && (
            <ActionButton
              onClick={() => handleCopy(message.id, message.content)}
              label={copiedId === message.id ? "Copied!" : "Copy"}
              icon={
                copiedId === message.id ? (
                  <Check className="text-success-500 size-4.5" />
                ) : (
                  <Copy4 className="text-text-100 size-4.5" />
                )
              }
            />
          )}
          {message.actions.includes("regenerate") && (
            <ActionButton
              label="Regenerate"
              icon={
                <RefreshCircle1Clockwise className="text-text-100 size-5" />
              }
            />
          )}
          {(message.actions.includes("thumbs_up") ||
            message.actions.includes("thumbs_down")) && (
            <div className=" flex   ">
              {message.actions.includes("thumbs_up") && (
                <div className="group relative">
                  <button className="hover:bg-background-soft-100 text-text-100 cursor-pointer rounded-full size-8   flex items-center justify-center transition-colors">
                    <ThumbsUp2 className="size-4.5" />
                  </button>
                  <div className="absolute bottom-full left-1/2 mb-2 h-9 flex items-center justify-center -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 ring-1 ring-white/10 pointer-events-none z-50">
                    Good response
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
              {message.actions.includes("thumbs_down") && (
                <div className="group relative">
                  <button className="hover:bg-background-soft-100 text-text-100 cursor-pointer rounded-full size-8   flex items-center justify-center transition-colors">
                    <ThumbsUp2 className="size-4.5 rotate-180" />
                  </button>
                  <div className="absolute bottom-full left-1/2 mb-2 h-9 flex items-center justify-center -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 ring-1 ring-white/10 pointer-events-none z-50">
                    Bad response
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          )}
          {message.actions.includes("more") && (
            <DropdownMenu>
              <div className="group relative">
                <DropdownMenuTrigger className="hover:bg-background-soft-100 text-text-100 data-pressed:bg-background-soft-100 flex h-8 w-8 cursor-pointer items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors outline-none">
                  <MenuKebab1 className="size-5" />
                </DropdownMenuTrigger>
                <div className="absolute bottom-full left-1/2 mb-2 h-9 flex items-center justify-center -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 ring-1 ring-white/10 pointer-events-none z-50">
                  More
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900"></div>
                </div>
              </div>
              <DropdownMenuContent
                placement="bottom end"
                className={`${THEME.dropdown} w-40 overflow-visible shadow-md`}
              >
                <DropdownMenuItem className={THEME.dropdownItem}>
                  <ShareNodes className="size-4.5" /> <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onAction={() => onDelete?.(message.id)}
                  className={`${THEME.dropdownItem}`}
                >
                  <Trash1 className="size-4.5" /> <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
