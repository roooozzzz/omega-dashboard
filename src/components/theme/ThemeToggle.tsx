"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免 hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-md bg-transparent" aria-label="加载中">
        <div className="w-5 h-5" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "dark") {
      return <Moon className="w-5 h-5" />;
    } else if (theme === "light") {
      return <Sun className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getLabel = () => {
    if (theme === "dark") return "暗色模式";
    if (theme === "light") return "亮色模式";
    return "跟随系统";
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 hover:bg-stripe-bg dark:hover:bg-white/5 rounded-md transition-colors"
      aria-label={getLabel()}
      title={getLabel()}
    >
      <span className="text-stripe-ink-light dark:text-gray-400">
        {getIcon()}
      </span>
    </button>
  );
}
