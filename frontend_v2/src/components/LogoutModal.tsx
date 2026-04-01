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
import { Exit } from "@tailgrids/icons";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  return (
    <DialogOverlay
      isOpen={isOpen}
      onOpenChange={(open: boolean) => !open && onClose()}
      isDismissable
    >
      <DialogContent className="max-w-md mx-auto">
        <DialogBody className="text-center pt-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Exit className="size-8" />
          </div>
          <DialogTitle className="text-xl font-bold mb-2">
            Sign out?
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Are you sure you want to sign out of your account on this device?
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
            className="h-10 bg-gray-800 hover:bg-gray-950 text-white text-sm flex-1"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogOverlay>
  );
}
