"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, ExternalLink } from "lucide-react";
import { newsApi, type NewsArticleData } from "@/lib/api";

const POWER_FILTERS: { key: string; label: string }[] = [
  { key: "", label: "全部" },
  { key: "scale_economies", label: "规模经济" },
  { key: "network_effects", label: "网络效应" },
  { key: "counter_positioning", label: "差异化定位" },
  { key: "switching_costs", label: "转换成本" },
  { key: "branding", label: "品牌" },
  { key: "cornered_resource", label: "稀缺资源" },
  { key: "process_power", label: "流程优势" },
];

const POWER_LABELS: Record<string, string> = {
  scale_economies: "规模经济",
  network_effects: "网络效应",
  counter_positioning: "差异化定位",
  switching_costs: "转换成本",
  branding: "品牌",
  cornered_resource: "稀缺资源",
  process_power: "流程优势",
};

const IMPACT_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  positive: { color: "text-stripe-success", bg: "bg-stripe-success-light", icon: "+" },
  negative: { color: "text-stripe-danger", bg: "bg-stripe-danger-light", icon: "-" },
  neutral: { color: "text-stripe-ink-lighter", bg: "bg-stripe-bg", icon: "~" },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

interface MoatNewsFeedProps {
  symbol: string;
}

export function MoatNewsFeed({ symbol }: MoatNewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticleData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPower, setSelectedPower] = useState("");

  const fetchMoatNews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await newsApi.getMoatFeed(symbol, {
        limit: 10,
        power: selectedPower || undefined,
      });
      setArticles(data.articles);
      setTotal(data.total);
    } catch {
      // 静默处理
    } finally {
      setLoading(false);
    }
  }, [symbol, selectedPower]);

  useEffect(() => {
    fetchMoatNews();
  }, [fetchMoatNews]);

  return (
    <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-stripe-purple" />
        <h3 className="font-semibold text-stripe-ink">护城河动态</h3>
        {total > 0 && (
          <span className="text-xs text-stripe-ink-lighter bg-stripe-bg px-2 py-0.5 rounded-full">
            {total} 条
          </span>
        )}
      </div>

      {/* Power 筛选按钮 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {POWER_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedPower(key)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedPower === key
                ? "bg-stripe-purple text-white"
                : "bg-stripe-bg text-stripe-ink-light hover:bg-stripe-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-stripe-ink-lighter py-4 text-center">加载中...</p>
      ) : articles.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-stripe-ink-lighter">
            暂无护城河相关新闻。
          </p>
          <p className="text-xs text-stripe-ink-lighter mt-1">
            OpenClaw 每 2 小时分析一次新闻。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="p-3 bg-stripe-bg/50 rounded-lg border border-stripe-border-light"
            >
              {/* 标签行 */}
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {article.tags.map((tag, idx) => {
                  const cfg = IMPACT_CONFIG[tag.impact] || IMPACT_CONFIG.neutral;
                  return (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${cfg.bg} ${cfg.color}`}
                    >
                      <span className="font-bold">{cfg.icon}</span>
                      {POWER_LABELS[tag.power] || tag.power}
                    </span>
                  );
                })}
              </div>

              {/* 标题 + 来源 */}
              <div className="flex items-start gap-1.5">
                <div className="flex-1 min-w-0">
                  {article.url ? (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-stripe-ink hover:text-stripe-purple transition-colors line-clamp-2 leading-snug"
                    >
                      {article.title}
                      <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-40" />
                    </a>
                  ) : (
                    <p className="text-sm text-stripe-ink line-clamp-2 leading-snug">
                      {article.title}
                    </p>
                  )}
                  <p className="text-[11px] text-stripe-ink-lighter mt-1">
                    {article.source}
                    {article.source && article.publishedAt && " · "}
                    {article.publishedAt && formatRelativeTime(article.publishedAt)}
                  </p>
                </div>
              </div>

              {/* OpenClaw 摘要 */}
              {article.tags.some((t) => t.summary) && (
                <div className="mt-2 text-xs text-stripe-ink-light leading-relaxed">
                  {article.tags
                    .filter((t) => t.summary)
                    .map((t, i) => (
                      <p key={i}>{t.summary}</p>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 获取每个 Power 的新闻计数（用于 MoatPowersGrid 指示器） */
export function useMoatNewsCount(symbol: string): Record<string, { positive: number; negative: number }> {
  const [counts, setCounts] = useState<Record<string, { positive: number; negative: number }>>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      try {
        const data = await newsApi.getMoatFeed(symbol, { limit: 50 });
        if (cancelled) return;

        const result: Record<string, { positive: number; negative: number }> = {};
        for (const article of data.articles) {
          for (const tag of article.tags) {
            if (!result[tag.power]) {
              result[tag.power] = { positive: 0, negative: 0 };
            }
            if (tag.impact === "positive") result[tag.power].positive++;
            if (tag.impact === "negative") result[tag.power].negative++;
          }
        }
        setCounts(result);
      } catch {
        // 静默处理
      }
    }

    fetchCounts();
    return () => { cancelled = true; };
  }, [symbol]);

  return counts;
}
