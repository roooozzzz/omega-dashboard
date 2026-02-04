"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShieldCheck,
  Radio,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { useSidebar } from "@/contexts/SidebarContext";

const navItems = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard },
  { href: "/moat-scanner", label: "护城河扫描", icon: ShieldCheck },
  { href: "/signals", label: "交易信号", icon: Radio },
  { href: "/portfolio", label: "持仓管理", icon: Briefcase },
  { href: "/settings", label: "系统设置", icon: Settings },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobile } = useSidebar();

  return (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-stripe-border flex items-center justify-between">
        {isCollapsed && !isMobile ? (
          <Logo size="sm" showText={false} />
        ) : (
          <Logo />
        )}
        {!isMobile && (
          <button
            onClick={toggleCollapsed}
            className="p-1 hover:bg-stripe-bg rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-stripe-ink-lighter" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-stripe-ink-lighter" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150",
                  isActive
                    ? "bg-stripe-bg text-stripe-purple-light font-medium"
                    : "text-stripe-ink-light hover:bg-stripe-bg",
                  isCollapsed && !isMobile && "justify-center px-2"
                )}
                title={isCollapsed && !isMobile ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {(!isCollapsed || isMobile) && item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      {(!isCollapsed || isMobile) && (
        <div className="p-3 border-t border-stripe-border">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-stripe-bg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-stripe-purple flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stripe-ink truncate">
                交易员
              </p>
              <p className="text-xs text-stripe-ink-lighter truncate">
                专业版
              </p>
            </div>
            <LogOut className="w-4 h-4 text-stripe-ink-lighter" />
          </div>
        </div>
      )}

      {/* System Status */}
      <div className={cn("p-4 border-t border-stripe-border", isCollapsed && !isMobile && "p-2")}>
        <div
          className={cn(
            "p-3 rounded-md bg-stripe-success-light",
            isCollapsed && !isMobile && "p-2"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-stripe-success rounded-full flex-shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="text-xs font-medium text-stripe-success-text">
                系统运行中
              </span>
            )}
          </div>
          {(!isCollapsed || isMobile) && (
            <p className="text-xs text-stripe-success-text mt-1 opacity-80">
              熔断器: 关闭
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const { isOpen, isCollapsed, close, isMobile } = useSidebar();

  // 移动端：抽屉式侧边栏
  if (isMobile) {
    return (
      <>
        {/* 遮罩层 */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={close}
          />
        )}

        {/* 抽屉 */}
        <aside
          className={cn(
            "fixed left-0 top-0 h-full w-72 bg-white border-r border-stripe-border flex flex-col z-50 transition-transform duration-300 md:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* 关闭按钮 */}
          <button
            onClick={close}
            className="absolute top-4 right-4 p-1 hover:bg-stripe-bg rounded transition-colors"
            aria-label="关闭菜单"
          >
            <X className="w-5 h-5 text-stripe-ink-lighter" />
          </button>

          <SidebarContent onNavClick={close} />
        </aside>
      </>
    );
  }

  // 桌面端：固定侧边栏
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-stripe-border flex-col z-20 transition-all duration-200 hidden md:flex",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <SidebarContent />
    </aside>
  );
}
