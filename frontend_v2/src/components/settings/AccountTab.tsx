import { useRef, useState } from "react";
import { Button } from "../tailgrids/core/button";
import { Input } from "../tailgrids/core/input";
import { Xmark2x } from "@tailgrids/icons";

export function AccountTab({ onClose }: { onClose?: () => void }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="py-3 border-b flex justify-between items-center border-base-100 bg-background-50 z-10">
        <h3 className="text-xl font-medium text-title-50">Account</h3>
        <Button
          variant="ghost"
          iconOnly
          size="xs"
          className="text-title-50"
          onClick={onClose}
        >
          <Xmark2x className="size-6" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pt-6  space-y-6 max-h-[550px] no-scrollbar pr-1">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <img
              src="/images/avatar/user.png"
              className="size-12 rounded-full"
              alt="Avatar"
            />
            <div>
              <h4 className="font-medium  text-title-50 text-base">
                Adam Wathon
              </h4>
              <p className="text-sm text-text-100">adamwhaton@example.com</p>
            </div>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <Button
              appearance="outline"
              className="text-sm h-8 px-3"
              onClick={handleAvatarClick}
            >
              Change Avatar
            </Button>
          </div>
        </div>

        {/* Name Section */}
        {isEditingName ? (
          <div className="space-y-3">
            <Input
              label="Name"
              type="text"
              className="h-11"
              placeholder="Adam Wathon"
            />
            <div className="flex justify-end gap-2">
              <Button
                appearance="outline"
                className="text-sm h-8 px-3"
                onClick={() => setIsEditingName(false)}
              >
                Cancel
              </Button>
              <Button
                className="text-sm h-8 px-3 bg-gray-800 hover:bg-gray-900"
                onClick={() => setIsEditingName(false)}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between py-2">
            <div>
              <p className="text-xs text-text-100 mb-1">Full Name</p>
              <p className="text-sm font-medium text-title-50">Adam Wathon</p>
            </div>
            <Button
              appearance="outline"
              className="text-sm h-8 px-3"
              onClick={() => setIsEditingName(true)}
            >
              Edit Name
            </Button>
          </div>
        )}

        {/* Email Display */}
        <div className="py-2">
          <p className="text-xs text-text-100 mb-1">Your email address</p>
          <p className="text-sm font-medium text-title-50">
            adamwhaton@example.com
          </p>
        </div>

        {/* Password Section */}
        {isChangingPassword ? (
          <div className="space-y-4 pt-2">
            <Input
              label="New password"
              type="password"
              placeholder="••••••••"
              className="placeholder:text-xl placeholder:leading-none h-11"
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="••••••••"
              className="placeholder:text-xl placeholder:leading-none h-11"
            />
            <div className="flex justify-end gap-2">
              <Button
                appearance="outline"
                className="px-3 h-8"
                onClick={() => setIsChangingPassword(false)}
              >
                Cancel
              </Button>{" "}
              <Button
                className="text-sm h-8 px-3 bg-gray-800 hover:bg-gray-900"
                onClick={() => setIsChangingPassword(false)}
              >
                Change Password
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between py-2">
            <div>
              <p className="text-xs text-text-100 mb-1">Change password</p>
              <p className="text-sm font-medium text-title-50 tracking-tighter">
                ••••••••••
              </p>
            </div>
            <Button
              appearance="outline"
              className="text-sm h-8 px-3 "
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </Button>
          </div>
        )}

        <div className="border-t border-base-100 my-4" />

        {/* Export Data */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-title-50">
              Export your Data
            </p>
            <p className="text-xs text-text-100">
              You can download all account data
            </p>
          </div>
          <Button appearance="outline" className="text-sm h-8 px-3">
            Export
          </Button>
        </div>

        {/* Sign Out */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-title-50">Sign out</p>
            <p className="text-xs text-text-100">
              Log out of your account on this device
            </p>
          </div>
          <Button appearance="outline" className="text-sm h-8 px-3">
            Sign Out
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-title-50">Delete Account</p>
            <p className="text-xs text-text-100">
              Deletions are immediate and cannot be undone.
            </p>
          </div>
          <Button
            appearance="outline"
            variant="danger"
            className="text-sm h-8 px-3"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
