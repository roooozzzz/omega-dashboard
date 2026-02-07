"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { useSidebar } from "@/contexts/SidebarContext";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface HeaderProps {
  title: string;
  description?: string;
}

interface Notification {
  id: string;
  type: "signal" | "moat" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const demoNotifications: Notification[] = [
  {
    id: "1",
    type: "signal",
    title: "新买入信号",
    message: "MSFT 触发护城河买入信号",
    time: "5 分钟前",
    read: false,
  },
  {
    id: "2",
    type: "moat",
    title: "护城河分析完成",
    message: "CRWD 分析报告已生成，待审核",
    time: "15 分钟前",
    read: false,
  },
  {
    id: "3",
    type: "alert",
    title: "VIX 预警",
    message: "VIX 指数接近 25 阈值",
    time: "1 小时前",
    read: true,
  },
];

export function Header({ title, description }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(demoNotifications);
  const { toggleOpen, isMobile } = useSidebar();
  const [currentTime, setCurrentTime] = useState("");
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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

          <span className="text-sm text-stripe-ink-lighter dark:text-gray-500 hidden lg:block">
            最后更新: {currentTime}
          </span>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-stripe-bg dark:hover:bg-white/5 rounded-md transition-colors"
            >
              <Bell className="w-5 h-5 text-stripe-ink-light dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-stripe-danger text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#16161D] rounded-lg border border-stripe-border dark:border-[#2A2A35] shadow-[var(--shadow-omega-md)] z-50">
                <div className="p-3 border-b border-stripe-border dark:border-[#2A2A35] flex items-center justify-between">
                  <span className="font-medium text-sm text-stripe-ink dark:text-white">
                    通知
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-stripe-purple hover:underline"
                    >
                      全部已读
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 border-b border-stripe-border-light dark:border-[#1E1E26] hover:bg-stripe-bg dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        !notif.read ? "bg-stripe-info-light/30 dark:bg-stripe-purple/10" : ""
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-stripe-ink dark:text-white">
                            {notif.title}
                          </p>
                          <p className="text-xs text-stripe-ink-lighter dark:text-gray-400 mt-0.5">
                            {notif.message}
                          </p>
                          <p className="text-xs text-stripe-ink-lighter dark:text-gray-500 mt-1">
                            {notif.time}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-stripe-purple rounded-full mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-stripe-border dark:border-[#2A2A35]">
                  <button className="text-sm text-stripe-purple hover:underline w-full text-center">
                    查看全部通知
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="bg-white dark:bg-transparent border-stripe-border dark:border-[#2A2A35] text-stripe-ink dark:text-gray-300 hover:bg-stripe-bg dark:hover:bg-white/5 hidden sm:flex"
          >
            <RefreshCw className="w-4 h-4 text-stripe-ink-light dark:text-gray-400" />
            <span className="hidden md:inline ml-2">刷新</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
