import { useState } from "react";
import { Input } from "./tailgrids/core/input";
import { Button } from "./tailgrids/core/button";
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  Dialog,
} from "./tailgrids/core/dialog";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");

  const handleCreate = () => {
    if (projectName.trim()) {
      onCreate(projectName.trim());
      setProjectName("");
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay isDismissable>
        <DialogContent className="max-w-134 mx-auto ">
          <DialogHeader>
            <DialogTitle className="text-2xl text-title-50">
              Create new project
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4 pt-2">
              <Input
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreate();
                  }
                }}
              />
            </div>
          </DialogBody>
          <DialogFooter className="gap-4">
            <Button appearance="outline" onClick={onClose} className="h-11">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-gray-800 hover:bg-gray-950  h-11"
              disabled={!projectName.trim()}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
