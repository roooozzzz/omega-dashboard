"use client";

import { useState, useEffect, useCallback } from "react";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import { newsApi, type NewsArticleData } from "@/lib/api";

// 7 Powers 中英文映射
const POWER_LABELS: Record<string, string> = {
  scale_economies: "规模经济",
  network_effects: "网络效应",
  counter_positioning: "差异化定位",
  switching_costs: "转换成本",
  branding: "品牌",
  cornered_resource: "稀缺资源",
  process_power: "流程优势",
};

const IMPACT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  positive: { bg: "bg-stripe-success-light", text: "text-stripe-success", label: "正面" },
  negative: { bg: "bg-stripe-danger-light", text: "text-stripe-danger", label: "负面" },
  neutral: { bg: "bg-stripe-bg", text: "text-stripe-ink-lighter", label: "中性" },
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

function SentimentDot({ score }: { score?: number }) {
  if (score === undefined || score === null) return null;
  const color =
    score > 0.1
      ? "bg-stripe-success"
      : score < -0.1
      ? "bg-stripe-danger"
      : "bg-stripe-ink-lighter";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color}`}
      title={`情绪分: ${score > 0 ? "+" : ""}${score.toFixed(2)}`}
    />
  );
}

function NewsItem({ article }: { article: NewsArticleData }) {
  const summaries = article.tags.filter((t) => t.summary);

  return (
    <div className="py-3 border-b border-stripe-border-light last:border-b-0">
      <div className="flex items-start gap-2">
        <SentimentDot score={article.sentimentScore} />
        <div className="flex-1 min-w-0">
          {/* 标题 */}
          {article.url ? (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-stripe-ink hover:text-stripe-purple transition-colors line-clamp-2 leading-snug"
            >
              {article.title}
              <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-40" />
            </a>
          ) : (
            <p className="text-sm font-medium text-stripe-ink line-clamp-2 leading-snug">
              {article.title}
            </p>
          )}
          {/* 来源 + 时间 */}
          <p className="text-xs text-stripe-ink-lighter mt-1">
            {article.source && <span>{article.source}</span>}
            {article.source && article.publishedAt && <span className="mx-1">·</span>}
            {article.publishedAt && <span>{formatRelativeTime(article.publishedAt)}</span>}
          </p>
          {/* 7 Powers 标签 */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {article.tags.map((tag, idx) => {
                const style = IMPACT_STYLES[tag.impact] || IMPACT_STYLES.neutral;
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${style.bg} ${style.text}`}
                  >
                    {POWER_LABELS[tag.power] || tag.power}
                    <span className="opacity-60">{style.label}</span>
                  </span>
                );
              })}
            </div>
          )}
          {/* 中文关键要点 */}
          {summaries.length > 0 && (
            <div className="mt-1.5 text-xs text-stripe-ink-light leading-relaxed">
              {summaries.map((t, i) => (
                <p key={i}>{t.summary}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NewsSectionProps {
  symbol: string;
}

export function NewsSection({ symbol }: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticleData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await newsApi.getStockNews(symbol, { limit: 20 });
      setArticles(data.articles);
      setTotal(data.total);
    } catch {
      // 静默处理
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000); // 5 分钟刷新
    return () => clearInterval(interval);
  }, [fetchNews]);

  const displayArticles = showAll ? articles : articles.slice(0, 10);

  return (
    <div className="bg-white rounded-lg border border-stripe-border p-4 md:p-6 shadow-[var(--shadow-omega-sm)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-stripe-purple" />
          <h3 className="font-semibold text-stripe-ink">新闻动态</h3>
          {total > 0 && (
            <span className="text-xs text-stripe-ink-lighter bg-stripe-bg px-2 py-0.5 rounded-full">
              {total} 篇
            </span>
          )}
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="p-1.5 hover:bg-stripe-bg rounded-md transition-colors"
          title="刷新"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-stripe-ink-lighter ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && articles.length === 0 ? (
        <div className="py-8 text-center">
          <RefreshCw className="w-5 h-5 text-stripe-purple animate-spin mx-auto mb-2" />
          <p className="text-sm text-stripe-ink-lighter">加载新闻...</p>
        </div>
      ) : articles.length === 0 ? (
        <p className="text-sm text-stripe-ink-lighter py-4 text-center">
          暂无新闻数据。访问情绪分析后将自动抓取。
        </p>
      ) : (
        <>
          <div className="divide-y-0">
            {displayArticles.map((article) => (
              <NewsItem key={article.id} article={article} />
            ))}
          </div>
          {articles.length > 10 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 w-full text-center text-sm text-stripe-purple hover:text-stripe-purple/80 font-medium py-2 bg-stripe-bg/50 rounded-md transition-colors"
            >
              查看更多 ({articles.length - 10} 篇)
            </button>
          )}
        </>
      )}
    </div>
  );
}
