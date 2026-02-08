"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GlossaryEntry, BenchmarkStatus } from "@/lib/glossary";

const statusColors: Record<BenchmarkStatus, { bg: string; text: string; dot: string }> = {
  good: {
    bg: "bg-stripe-success-light",
    text: "text-stripe-success-text",
    dot: "bg-stripe-success",
  },
  neutral: {
    bg: "bg-stripe-bg",
    text: "text-stripe-ink-lighter",
    dot: "bg-stripe-ink-lighter",
  },
  warning: {
    bg: "bg-stripe-warning-light",
    text: "text-stripe-warning-text",
    dot: "bg-stripe-warning",
  },
  danger: {
    bg: "bg-stripe-danger-light",
    text: "text-stripe-danger-text",
    dot: "bg-stripe-danger",
  },
};

const POPOVER_WIDTH = 288; // w-72 = 18rem = 288px
const GAP = 6;
const VIEWPORT_PADDING = 8;
const HOVER_DELAY = 150; // ms 延迟，避免闪烁
const LEAVE_DELAY = 200; // ms 离开延迟，方便移动到浮层

interface InfoTooltipProps {
  entry: GlossaryEntry;
  className?: string;
  iconSize?: "sm" | "md";
}

export function InfoTooltip({ entry, className, iconSize = "sm" }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // 计算浮层位置（fixed 定位，基于按钮在视口中的位置）
  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !popoverRef.current) return;

    const btnRect = buttonRef.current.getBoundingClientRect();
    const popoverEl = popoverRef.current;
    const popoverHeight = popoverEl.offsetHeight;

    // 水平：尝试居中对齐按钮，然后裁剪到视口
    let left = btnRect.left + btnRect.width / 2 - POPOVER_WIDTH / 2;
    left = Math.max(VIEWPORT_PADDING, Math.min(left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_PADDING));

    // 垂直：优先向下弹出，空间不够则向上
    let top = btnRect.bottom + GAP;
    if (top + popoverHeight > window.innerHeight - VIEWPORT_PADDING) {
      top = btnRect.top - GAP - popoverHeight;
    }

    setPosition({ top, left });
  }, []);

  const handleEnter = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    enterTimer.current = setTimeout(() => setOpen(true), HOVER_DELAY);
  }, []);

  const handleLeave = useCallback(() => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    leaveTimer.current = setTimeout(() => setOpen(false), LEAVE_DELAY);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  // 打开时计算位置
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(updatePosition);
  }, [open, updatePosition]);

  // 滚动/resize 时重新计算
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  // Escape 关闭
  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const iconClass = iconSize === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-stripe-ink-lighter hover:text-stripe-purple transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-stripe-purple/30",
          className
        )}
        aria-label={`了解更多: ${entry.term}`}
      >
        <HelpCircle className={iconClass} />
      </button>

      {open && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[9999] w-72 bg-white dark:bg-[#16161D] rounded-lg border border-stripe-border dark:border-[#2A2A35] shadow-[var(--shadow-omega-md)]"
          style={{ top: position.top, left: position.left }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 pt-3 pb-2">
            <h4 className="text-sm font-semibold text-stripe-ink dark:text-white">
              {entry.term}
            </h4>
          </div>

          {/* Definition */}
          <div className="px-4 pb-3">
            <p className="text-xs text-stripe-ink-light dark:text-gray-400 leading-relaxed">
              {entry.definition}
            </p>
          </div>

          {/* Benchmark Levels */}
          {entry.benchmark && entry.benchmark.levels.length > 0 && (
            <div className="px-4 pb-3">
              <p className="text-xs font-medium text-stripe-ink-lighter dark:text-gray-500 mb-2 uppercase tracking-wide">
                水位线标准
              </p>
              <div className="space-y-1.5">
                {entry.benchmark.levels.map((level, i) => {
                  const colors = statusColors[level.status];
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs",
                        colors.bg
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          colors.dot
                        )}
                      />
                      <span className={cn("font-medium shrink-0", colors.text)}>
                        {level.range}
                      </span>
                      <span className={cn("text-right ml-auto", colors.text)}>
                        {level.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tip */}
          {entry.tip && (
            <div className="px-4 pb-3">
              <div className="p-2.5 rounded-md bg-stripe-info-light dark:bg-blue-500/10">
                <p className="text-xs text-stripe-info-text dark:text-blue-400 leading-relaxed">
                  {entry.tip}
                </p>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
