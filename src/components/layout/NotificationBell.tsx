"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell, Bot, User, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMoatList } from "@/hooks/useMoatData";
import { StatusBadge } from "@/components/shared/StatusBadge";

const LAST_SEEN_KEY = "omega-notification-last-seen";

function getLastSeen(): number {
  if (typeof window === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(LAST_SEEN_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function setLastSeenStorage(ts: number) {
  try {
    localStorage.setItem(LAST_SEEN_KEY, ts.toString());
  } catch {}
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

const statusLabel: Record<string, string> = {
  pending: "待审核",
  verified: "已通过",
  rejected: "已拒绝",
};

const statusVariant: Record<string, "warning" | "success" | "danger"> = {
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const { data: moatData } = useMoatList(true, 60000);

  // 过滤最近 48 小时的提案
  const recentItems = moatData
    .filter((m) => {
      const age = Date.now() - new Date(m.analyzedAt).getTime();
      return age < 48 * 60 * 60 * 1000;
    })
    .sort(
      (a, b) =>
        new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
    )
    .slice(0, 20);

  // 未读计数 (hydration-safe: 挂载后才读 localStorage)
  const [lastSeen, setLastSeen] = useState(0);
  useEffect(() => {
    setMounted(true);
    setLastSeen(getLastSeen());
  }, []);

  const unreadCount = mounted
    ? recentItems.filter(
        (m) => new Date(m.analyzedAt).getTime() > lastSeen
      ).length
    : 0;

  // 点击铃铛：切换弹出层 + 标记已读
  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        const now = Date.now();
        setLastSeenStorage(now);
        setLastSeen(now);
      }
      return !prev;
    });
  }, []);

  // 计算弹出层位置
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 6,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(updatePosition);
  }, [open, updatePosition]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (buttonRef.current?.contains(e.target as Node)) return;
      if (popoverRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Escape 关闭
  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative p-2 hover:bg-stripe-bg dark:hover:bg-white/5 rounded-md transition-colors"
        aria-label="通知"
      >
        <Bell className="w-5 h-5 text-stripe-ink-light dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-stripe-danger rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[9999] w-80 max-h-[420px] bg-white dark:bg-[#16161D] rounded-lg border border-stripe-border dark:border-[#2A2A35] shadow-[var(--shadow-omega-md)] flex flex-col"
            style={{ top: position.top, right: position.right }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-stripe-border dark:border-[#2A2A35]">
              <h4 className="text-sm font-semibold text-stripe-ink dark:text-white">
                护城河动态
              </h4>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-stripe-bg dark:hover:bg-white/5 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-stripe-ink-lighter" />
              </button>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto">
              {recentItems.length === 0 ? (
                <div className="p-8 text-center text-sm text-stripe-ink-lighter dark:text-gray-500">
                  最近 48 小时暂无动态
                </div>
              ) : (
                recentItems.map((item) => (
                  <Link
                    key={`${item.ticker}-${item.analyzedAt}`}
                    href={`/stock/${encodeURIComponent(item.ticker)}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-stripe-bg dark:hover:bg-white/5 transition-colors border-b border-stripe-border-light dark:border-[#2A2A35]/50 last:border-0"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        item.source === "openclaw"
                          ? "bg-violet-50 dark:bg-violet-500/10"
                          : "bg-stripe-bg dark:bg-white/5"
                      )}
                    >
                      {item.source === "openclaw" ? (
                        <Bot className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                      ) : (
                        <User className="w-4 h-4 text-stripe-ink-lighter" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stripe-ink dark:text-white font-medium truncate">
                        {item.ticker} 护城河提案
                      </p>
                      <p className="text-xs text-stripe-ink-lighter dark:text-gray-500 mt-0.5">
                        {item.totalScore}/35
                        {" · "}
                        {item.source === "openclaw" ? "OpenClaw" : "手动"}
                        {" · "}
                        {relativeTime(item.analyzedAt)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge
                          variant={statusVariant[item.status] || "warning"}
                        >
                          {statusLabel[item.status] || "待审核"}
                        </StatusBadge>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* 底部 */}
            <div className="px-4 py-2.5 border-t border-stripe-border dark:border-[#2A2A35]">
              <Link
                href="/signals/long"
                onClick={() => setOpen(false)}
                className="text-xs text-stripe-purple hover:underline font-medium"
              >
                查看全部护城河提案 &rarr;
              </Link>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
