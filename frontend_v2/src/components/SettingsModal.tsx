import { useState, useEffect } from "react";
import {
  QuestionMarkCircle,
  UserCircle1,
  SlidersDoubleHorizontal,
  Wallet2,
} from "@tailgrids/icons";
import {
  DialogOverlay,
  DialogContent,
  DialogBody,
} from "./tailgrids/core/dialog";
import { useTheme } from "../utils/theme-provider";

import { SettingsSidebar, type SettingsTab } from "./settings/SettingsSidebar";
import { AccountTab } from "./settings/AccountTab";
import { PreferenceTab } from "./settings/PreferenceTab";
import { PlanTab } from "./settings/PlanTab";
import { ResourcesTab } from "./settings/ResourcesTab";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
}

type TabType = "account" | "preference" | "plan" | "resources";

export default function SettingsModal({
  isOpen,
  onClose,
  initialTab = "account",
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const tabs: readonly SettingsTab[] = [
    {
      id: "account",
      label: "Account",
      icon: <UserCircle1 className="size-5" />,
    },
    {
      id: "preference",
      label: "Preference",
      icon: <SlidersDoubleHorizontal className="size-5" />,
    },
    {
      id: "plan",
      label: "Plan & Billing",
      icon: <Wallet2 className="size-5" />,
    },
    {
      id: "resources",
      label: "Resources",
      icon: <QuestionMarkCircle className="size-5" />,
    },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountTab onClose={onClose} />;
      case "preference":
        return (
          <PreferenceTab theme={theme} setTheme={setTheme} onClose={onClose} />
        );
      case "plan":
        return <PlanTab onClose={onClose} />;
      case "resources":
        return <ResourcesTab onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <DialogOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
    >
      <DialogContent
        className="p-0 border-none w-full max-w-184 mx-auto rounded-2xl overflow-hidden overflow-y-auto shadow-xl"
        modalProps={{ className: "max-w-184" }}
        showCloseButton={false}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] sm:h-[min(640px,calc(100vh-32px))] min-w-0 h-[90vh] max-h-screen">
          <SettingsSidebar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id)}
          />

          {/* Main Content */}
          <div className="min-w-0 flex flex-col bg-background-soft-100 p-2 rounded-r-2xl overflow-y-auto max-h-[80vh] sm:max-h-none">
            <DialogBody className="flex-1 flex flex-col px-5 lg:px-8  bg-background-50 rounded-xl pt-0">
              <div className="mx-2">{renderContent()}</div>
            </DialogBody>
          </div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
}
