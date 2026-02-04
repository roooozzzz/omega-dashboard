"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

export function MobileMenuButton() {
  const { isMobile, toggleOpen } = useSidebar();

  if (!isMobile) return null;

  return (
    <button
      onClick={toggleOpen}
      className={cn(
        "fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-stripe-border",
        "hover:bg-stripe-bg transition-colors"
      )}
      aria-label="打开菜单"
    >
      <Menu className="w-5 h-5 text-stripe-ink" />
    </button>
  );
}
