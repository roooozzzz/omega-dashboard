"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Building2, Zap } from "lucide-react";

interface SearchResult {
  ticker: string;
  name: string;
  type: "stock" | "etf" | "index";
}

// 常用股票列表
const popularStocks: SearchResult[] = [
  { ticker: "NVDA", name: "英伟达", type: "stock" },
  { ticker: "MSFT", name: "微软", type: "stock" },
  { ticker: "AAPL", name: "苹果", type: "stock" },
  { ticker: "GOOGL", name: "谷歌", type: "stock" },
  { ticker: "AMZN", name: "亚马逊", type: "stock" },
  { ticker: "META", name: "Meta", type: "stock" },
  { ticker: "TSLA", name: "特斯拉", type: "stock" },
  { ticker: "CRWD", name: "CrowdStrike", type: "stock" },
  { ticker: "SMCI", name: "超微电脑", type: "stock" },
  { ticker: "ARM", name: "Arm Holdings", type: "stock" },
  { ticker: "PLTR", name: "Palantir", type: "stock" },
  { ticker: "SNOW", name: "Snowflake", type: "stock" },
  { ticker: "DDOG", name: "Datadog", type: "stock" },
  { ticker: "PANW", name: "Palo Alto Networks", type: "stock" },
  { ticker: "SPY", name: "标普500 ETF", type: "etf" },
  { ticker: "QQQ", name: "纳斯达克100 ETF", type: "etf" },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 键盘快捷键 Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 搜索过滤
  useEffect(() => {
    if (!query) {
      setResults(popularStocks.slice(0, 8));
      return;
    }

    const filtered = popularStocks.filter(
      (stock) =>
        stock.ticker.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  const handleSelect = (ticker: string) => {
    router.push(`/stock/${ticker}`);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-stripe-ink-lighter dark:text-gray-400 bg-stripe-bg dark:bg-white/5 border border-stripe-border dark:border-[#2A2A35] rounded-md hover:border-stripe-ink-lighter dark:hover:border-gray-500 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>搜索股票...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-white dark:bg-[#16161D] border border-stripe-border dark:border-[#2A2A35] rounded">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg bg-white dark:bg-[#16161D] rounded-lg shadow-[var(--shadow-omega-lg)] z-50">
        {/* Input */}
        <div className="flex items-center gap-3 p-4 border-b border-stripe-border dark:border-[#2A2A35]">
          <Search className="w-5 h-5 text-stripe-ink-lighter dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索股票代码或公司名称..."
            className="flex-1 text-sm outline-none placeholder:text-stripe-ink-lighter dark:placeholder:text-gray-500 bg-transparent text-stripe-ink dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-stripe-bg dark:hover:bg-white/5 rounded"
            >
              <X className="w-4 h-4 text-stripe-ink-lighter dark:text-gray-500" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {!query && (
            <p className="px-4 py-2 text-xs text-stripe-ink-lighter dark:text-gray-500 uppercase tracking-wide">
              热门股票
            </p>
          )}
          {results.map((result) => (
            <button
              key={result.ticker}
              onClick={() => handleSelect(result.ticker)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-stripe-bg dark:hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-stripe-bg dark:bg-white/5 flex items-center justify-center">
                <span className="text-sm font-medium text-stripe-ink dark:text-white">
                  {result.ticker[0]}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-stripe-ink dark:text-white">
                  {result.ticker}
                </p>
                <p className="text-xs text-stripe-ink-lighter dark:text-gray-400">{result.name}</p>
              </div>
              <span className="text-xs text-stripe-ink-lighter dark:text-gray-500 uppercase">
                {result.type === "etf" ? "ETF" : "股票"}
              </span>
            </button>
          ))}
          {query && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-stripe-ink-lighter dark:text-gray-400">
              未找到匹配的股票
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stripe-border dark:border-[#2A2A35] flex items-center justify-between text-xs text-stripe-ink-lighter dark:text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stripe-bg dark:bg-white/5 border border-stripe-border dark:border-[#2A2A35] rounded">↑↓</kbd>
              选择
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stripe-bg dark:bg-white/5 border border-stripe-border dark:border-[#2A2A35] rounded">↵</kbd>
              确认
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-stripe-bg dark:bg-white/5 border border-stripe-border dark:border-[#2A2A35] rounded">Esc</kbd>
            关闭
          </span>
        </div>
      </div>
    </>
  );
}
