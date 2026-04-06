import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface SettingsTab {
  id: string;
  label: string;
  icon: ReactNode;
}

interface SettingsSidebarProps {
  tabs: readonly SettingsTab[];
  activeTab: string;
  onTabChange: (id: any) => void;
}

export function SettingsSidebar({
  tabs,
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <div className="border-r border-base-50 rounded-l-2xl bg-background-50 px-2 py-6 flex flex-col overflow-hidden">
      <nav className="space-y-1 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-background-soft-100 text-title-50 shadow-sm"
                : "text-text-100 hover:bg-background-soft-100 hover:text-text-50",
            )}
          >
            <span
              className={cn(
                "size-5",
                activeTab === tab.id
                  ? "text-text-50 stroke-1.5"
                  : "text-text-100",
              )}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
