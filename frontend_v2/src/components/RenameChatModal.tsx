"use client";

import { useState, useEffect } from "react";
import { Input } from "./tailgrids/core/input";
import { Button } from "./tailgrids/core/button";
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from "./tailgrids/core/dialog";

interface RenameChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onRename: (newTitle: string) => void;
}

export default function RenameChatModal({
  isOpen,
  onClose,
  currentTitle,
  onRename,
}: RenameChatModalProps) {
  const [newTitle, setNewTitle] = useState(currentTitle);

  useEffect(() => {
    if (isOpen) {
      setNewTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

  const handleSave = () => {
    if (newTitle.trim()) {
      onRename(newTitle.trim());
      onClose();
    }
  };

  return (
    <DialogOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
    >
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Rename chat</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4 pt-2">
            <Input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter chat title"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-3">
          <Button appearance="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!newTitle.trim()}
            className="bg-gray-800 hover:bg-gray-950  h-11"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogOverlay>
  );
}
