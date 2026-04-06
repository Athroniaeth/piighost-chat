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

interface RenameProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void;
}

export default function RenameProjectModal({
  isOpen,
  onClose,
  currentName,
  onRename,
}: RenameProjectModalProps) {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = () => {
    if (newName.trim()) {
      onRename(newName.trim());
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
          <DialogTitle className="text-2xl">Rename project</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4 pt-2">
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter project name"
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
            disabled={!newName.trim()}
            className="bg-gray-800 hover:bg-gray-950 h-11"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogOverlay>
  );
}
