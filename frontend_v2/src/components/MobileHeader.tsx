import { MenuHamburger1 } from "@tailgrids/icons";
import { useTheme } from "../utils/theme-provider";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { theme } = useTheme();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <header className="flex items-center justify-between border-b border-base-100 bg-background-50 p-4 lg:hidden">
      <img
        src={
          isDarkMode
            ? "/images/logo/onyx-logo-white.svg"
            : "/images/logo/onyx-logo.svg"
        }
        alt="Logo"
      />
      <div className="w-8" /> {/* Spacer */}
      <button
        onClick={onMenuClick}
        className="text-title-50 cursor-pointer p-1"
      >
        <MenuHamburger1 />
      </button>
    </header>
  );
}
