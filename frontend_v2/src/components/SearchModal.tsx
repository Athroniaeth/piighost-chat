import { useState, useEffect } from "react";
import { ClockThree, Search1, Xmark2x } from "@tailgrids/icons";
import { Input } from "./tailgrids/core/input";
import { Button } from "./tailgrids/core/button";
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "./tailgrids/core/dialog";

export default function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearchValue("");
    }
  }, [isOpen]);

  const handleClose = () => {
    setSearchValue("");
    onClose();
  };
  return (
    <DialogOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      isDismissable
    >
      <DialogContent
        showCloseButton={false}
        modalProps={{ className: "max-w-[550px]" }}
        className="p-0 border-none w-full rounded-2xl max-w-[550px] mx-auto overflow-hidden transition-all duration-300"
      >
        {/* Modal Header with Search Input */}
        <DialogHeader className="border-b border-base-50 px-5 py-4">
          <div className="flex items-center">
            <div className="relative flex grow items-center">
              <span className="text-text-200 mr-2.5">
                <Search1 className="size-5" />
              </span>
              <Input
                autoFocus
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="placeholder:text-text-200 w-full rounded-md border-0 bg-transparent p-0 text-base focus:ring-0"
                placeholder="Search anything"
              />
            </div>
            <Button
              variant="ghost"
              iconOnly
              size="xs"
              onClick={() => setSearchValue("")}
            >
              <Xmark2x className="size-5.5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body with Search Suggestions */}
        <DialogBody className="no-scrollbar max-h-[60vh] overflow-y-auto p-5 outline-none">
          <div className="space-y-8">
            {/* Todays Section */}
            <div>
              <h3 className="text-text-200 mb-4 flex items-center gap-2.5 px-3 text-sm font-normal">
                <ClockThree className="size-4.5" />
                <span>Todays</span>
              </h3>
              <ul className="space-y-1 pl-3">
                {[
                  "Getting Started Conversation",
                  "AI Inspirations",
                  "Analytics Report",
                ].map((title, index) => (
                  <li
                    key={`today-${index}`}
                    className="hover:bg-background-soft-200 text-title-50 cursor-pointer rounded-xl bg-transparent px-4 py-3 text-sm font-medium transition-all"
                  >
                    {title}
                  </li>
                ))}
              </ul>
            </div>

            {/* Yesterday Section */}
            <div>
              <h3 className="text-text-200 mb-4 flex items-center gap-2.5 px-3 text-sm font-normal">
                <ClockThree className="size-4.5" />
                <span>Yesterday</span>
              </h3>
              <ul className="space-y-1 pl-3">
                {[
                  "Getting Started Conversation",
                  "AI Inspirations",
                  "Analytics Report",
                ].map((title, index) => (
                  <li
                    key={`yesterday-${index}`}
                    className="hover:bg-background-soft-100 text-title-50 cursor-pointer rounded-xl bg-transparent px-4 py-3 text-sm font-medium transition-all"
                  >
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogBody>

        {/* Modal Footer with Keyboard Info */}
        <DialogFooter className="border-t border-base-50 bg-background-soft-50 px-5 py-2.5 justify-center sm:justify-center">
          <p className="text-text-100 text-xs">
            Press
            <kbd className="bg-background-soft-200 text-text-50 mx-1.5 inline-flex h-6 w-10 items-center justify-center rounded-md border border-base-50 px-2.5 py-1 font-medium text-[10px] uppercase ">
              esc
            </kbd>
            to close
          </p>
        </DialogFooter>
      </DialogContent>
    </DialogOverlay>
  );
}
