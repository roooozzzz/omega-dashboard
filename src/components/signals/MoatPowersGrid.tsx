"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Users,
  Cpu,
  Scale,
  Cog,
  Zap,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 每个 Power 的图标映射
export const powersIcons: Record<string, LucideIcon> = {
  scaleEconomies: Scale,
  networkEffects: Users,
  counterPositioning: Zap,
  switchingCosts: Building2,
  branding: Shield,
  corneredResource: Cpu,
  processPower: Cog,
};

// 每个 Power 的评价描述（基于分数）
export const POWER_COMMENTS: Record<string, Record<number, string>> = {
  scaleEconomies: {
    5: "极强的规模壁垒，竞争者几乎无法复制成本结构",
    4: "显著的规模优势，新进入者面临巨大成本劣势",
    3: "具备一定规模效益，但尚未形成绝对壁垒",
    2: "规模优势有限，行业集中度不高",
    1: "规模效益微弱，小公司也能有效竞争",
    0: "无规模经济优势",
  },
  networkEffects: {
    5: "极强的网络效应，用户越多价值越大，赢者通吃",
    4: "强网络效应，平台粘性高，迁移成本大",
    3: "存在网络效应，但尚未形成垄断性优势",
    2: "网络效应较弱，用户粘性一般",
    1: "几乎没有网络效应",
    0: "无网络效应",
  },
  counterPositioning: {
    5: "颠覆性商业模式，在位者无法模仿而不自我毁灭",
    4: "差异化定位明确，竞争者跟进需付出重大代价",
    3: "有一定差异化，但竞争者可以逐步跟进",
    2: "差异化程度有限",
    1: "商业模式容易被复制",
    0: "无差异化定位优势",
  },
  switchingCosts: {
    5: "极高转换成本，客户几乎不可能离开",
    4: "高转换成本，数据/流程深度绑定",
    3: "中等转换成本，迁移需要一定时间和资源",
    2: "转换成本较低，客户可以较容易切换",
    1: "几乎没有转换成本",
    0: "零转换成本",
  },
  branding: {
    5: "顶级全球品牌，品牌本身就是护城河",
    4: "强品牌认知，具备显著溢价能力",
    3: "品牌有一定知名度和信任度",
    2: "品牌影响力有限，缺乏溢价能力",
    1: "品牌认知度低",
    0: "无品牌优势",
  },
  corneredResource: {
    5: "拥有极其稀缺且不可替代的核心资源",
    4: "掌握关键稀缺资源（人才/专利/数据/牌照）",
    3: "拥有一定稀缺资源，但替代品存在",
    2: "资源优势不明显",
    1: "几乎没有独占资源",
    0: "无稀缺资源优势",
  },
  processPower: {
    5: "卓越的组织能力和流程，长期积累难以复制",
    4: "优秀的运营效率和内部流程",
    3: "流程管理较好，有一定效率优势",
    2: "流程优势不突出",
    1: "运营效率一般",
    0: "无流程优势",
  },
};

export function getPowerComment(key: string, score: number): string {
  return POWER_COMMENTS[key]?.[score] ?? "";
}

// localStorage 读写评论
function loadComments(ticker: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(`moat-comments-${ticker}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveComments(ticker: string, comments: Record<string, string>) {
  localStorage.setItem(`moat-comments-${ticker}`, JSON.stringify(comments));
}

interface PowerData {
  name: string;
  score: number;
  maxScore: number;
  description?: string;
}

interface MoatPowersGridProps {
  powers: Record<string, PowerData>;
  editedScores: Record<string, number>;
  onScoreChange: (key: string, value: number) => void;
  ticker: string;
  readOnly?: boolean;
  newsCounts?: Record<string, { positive: number; negative: number }>;
}

export function MoatPowersGrid({
  powers,
  editedScores,
  onScoreChange,
  ticker,
  readOnly,
  newsCounts,
}: MoatPowersGridProps) {
  const [comments, setComments] = useState<Record<string, string>>({});

  // 加载评论
  useEffect(() => {
    setComments(loadComments(ticker));
  }, [ticker]);

  const handleCommentChange = useCallback(
    (key: string, value: string) => {
      setComments((prev) => {
        const next = { ...prev, [key]: value };
        saveComments(ticker, next);
        return next;
      });
    },
    [ticker]
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {Object.entries(powers).map(([key, power]) => {
        const Icon = powersIcons[key] || Shield;
        const currentScore = editedScores[key] ?? power.score;
        // 新闻计数指示器（snake_case key 映射）
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        const newsCount = newsCounts?.[snakeKey];
        return (
          <div
            key={key}
            className="p-3 bg-white dark:bg-stripe-ink/5 rounded-lg border border-stripe-border-light"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="w-3.5 h-3.5 text-stripe-ink-light" />
              <span className="text-xs font-medium text-stripe-ink">
                {power.name}
              </span>
              {/* 新闻计数指示器 */}
              {newsCount && (newsCount.positive > 0 || newsCount.negative > 0) && (
                <div className="ml-auto flex items-center gap-1">
                  {newsCount.positive > 0 && (
                    <span className="text-[10px] font-medium text-stripe-success bg-stripe-success-light px-1 py-0.5 rounded" title={`${newsCount.positive} 条正面新闻`}>
                      +{newsCount.positive}
                    </span>
                  )}
                  {newsCount.negative > 0 && (
                    <span className="text-[10px] font-medium text-stripe-danger bg-stripe-danger-light px-1 py-0.5 rounded" title={`${newsCount.negative} 条负面新闻`}>
                      -{newsCount.negative}
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-[10px] text-stripe-ink-lighter leading-snug mb-2 min-h-[28px]">
              {getPowerComment(key, currentScore)}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={power.maxScore}
                step={1}
                value={currentScore}
                onChange={(e) => onScoreChange(key, Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                disabled={readOnly}
                className="omega-slider flex-1"
              />
              <span className="text-xs font-medium text-stripe-ink tabular-nums w-7 text-right">
                {currentScore}/{power.maxScore}
              </span>
            </div>
            {/* 用户评论 */}
            <textarea
              value={comments[key] || ""}
              onChange={(e) => handleCommentChange(key, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="添加你的评论..."
              rows={2}
              className="mt-2 w-full text-[11px] leading-snug text-stripe-ink bg-stripe-bg/50 border border-stripe-border-light rounded-md px-2 py-1.5 placeholder:text-stripe-ink-lighter/50 focus:outline-none focus:ring-1 focus:ring-stripe-purple/30 focus:border-stripe-purple/30 resize-none"
            />
          </div>
        );
      })}
    </div>
  );
}
