"use client";

import { useState } from "react";
import { RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/shared/GlobalSearch";

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
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 bg-white border-b border-stripe-border px-8 py-4 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-stripe-ink">{title}</h1>
          {description && (
            <p className="text-sm text-stripe-ink-lighter">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Global Search */}
          <GlobalSearch />

          <span className="text-sm text-stripe-ink-lighter">
            最后更新: {new Date().toLocaleTimeString("zh-CN", { hour12: false })}
          </span>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-stripe-bg rounded-md transition-colors"
            >
              <Bell className="w-5 h-5 text-stripe-ink-light" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-stripe-danger text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-md)] z-50">
                <div className="p-3 border-b border-stripe-border flex items-center justify-between">
                  <span className="font-medium text-sm text-stripe-ink">
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
                      className={`p-3 border-b border-stripe-border-light hover:bg-stripe-bg transition-colors cursor-pointer ${
                        !notif.read ? "bg-stripe-info-light/30" : ""
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-stripe-ink">
                            {notif.title}
                          </p>
                          <p className="text-xs text-stripe-ink-lighter mt-0.5">
                            {notif.message}
                          </p>
                          <p className="text-xs text-stripe-ink-lighter mt-1">
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
                <div className="p-3 border-t border-stripe-border">
                  <button className="text-sm text-stripe-purple hover:underline w-full text-center">
                    查看全部通知
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
          >
            <RefreshCw className="w-4 h-4 text-stripe-ink-light" />
            刷新
          </Button>
        </div>
      </div>
    </header>
  );
}
