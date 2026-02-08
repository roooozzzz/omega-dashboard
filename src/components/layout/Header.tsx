"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useSidebar } from "@/contexts/SidebarContext";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { toggleOpen, isMobile } = useSidebar();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
  }, []);

  return (
    <header className="sticky top-0 bg-white dark:bg-[#0F0F14] border-b border-stripe-border dark:border-[#2A2A35] px-4 md:px-8 py-4 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 移动端汉堡菜单 - 只在 Header 内显示，MobileMenuButton 是备用 */}
          {isMobile && (
            <button
              onClick={toggleOpen}
              className="p-2 hover:bg-stripe-bg dark:hover:bg-white/5 rounded-md transition-colors md:hidden"
              aria-label="打开菜单"
            >
              <Menu className="w-5 h-5 text-stripe-ink dark:text-gray-300" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-stripe-ink dark:text-white">{title}</h1>
            {description && (
              <p className="text-sm text-stripe-ink-lighter dark:text-gray-400 hidden sm:block">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Global Search - 移动端隐藏 */}
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>

          <NotificationBell />

          <span className="text-sm text-stripe-ink-lighter dark:text-gray-500 hidden lg:block">
            最后更新: {currentTime}
          </span>

          {/* Theme Toggle */}
          <ThemeToggle />

        </div>
      </div>
    </header>
  );
}
