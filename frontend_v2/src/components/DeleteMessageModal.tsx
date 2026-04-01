"use client";

import { Button } from "./tailgrids/core/button";
import {
  DialogOverlay,
  DialogContent,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./tailgrids/core/dialog";
import { Trash1 } from "@tailgrids/icons";

interface DeleteMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteMessageModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteMessageModalProps) {
  return (
    <DialogOverlay
      isOpen={isOpen}
      onOpenChange={(open: boolean) => !open && onClose()}
      isDismissable
    >
      <DialogContent className="max-w-md mx-auto">
        <DialogBody className="text-center pt-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Trash1 className="size-8" />
          </div>
          <DialogTitle className="text-xl font-bold mb-2">
            Delete Message?
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Are you sure you want to delete this message? This action cannot be
            undone.
          </DialogDescription>
        </DialogBody>
        <DialogFooter className="flex gap-3">
          <Button
            appearance="outline"
            className="h-10 text-sm flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="h-10 bg-alert-danger-button-background hover:bg-alert-danger-button-hover-background text-sm flex-1"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogOverlay>
  );
}
