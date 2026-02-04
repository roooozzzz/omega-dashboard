"use client";

import { ReactNode } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const { isMobile, isCollapsed, isTablet } = useSidebar();

  // 移动端无边距，平板和桌面根据折叠状态调整
  const marginClass = isMobile
    ? "ml-0"
    : isCollapsed
    ? "ml-16"
    : "ml-60";

  return (
    <main
      className={cn(
        "min-h-screen transition-[margin] duration-200",
        marginClass,
        className
      )}
    >
      {children}
    </main>
  );
}
