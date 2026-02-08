"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  source?: string;
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const isAI = source === "openclaw";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none",
        isAI
          ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
          : "bg-stripe-bg text-stripe-ink-lighter dark:bg-white/5 dark:text-gray-500",
        className
      )}
      title={isAI ? "由 OpenClaw AI 自动提交" : "手动添加"}
    >
      {isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
      {isAI ? "AI" : "手动"}
    </span>
  );
}
