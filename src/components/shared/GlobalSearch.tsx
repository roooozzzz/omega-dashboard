"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
}

// 本地股票库（无输入时展示热门 + 作为别名搜索补充）
// aliases 包含 Finnhub 搜不到的常用名称
const localStocks: (SearchResult & { aliases?: string[] })[] = [
  { symbol: "NVDA", name: "NVIDIA Corp", type: "stock", aliases: ["英伟达"] },
  { symbol: "MSFT", name: "Microsoft Corp", type: "stock", aliases: ["微软"] },
  { symbol: "AAPL", name: "Apple Inc", type: "stock", aliases: ["苹果"] },
  { symbol: "GOOGL", name: "Alphabet Inc", type: "stock", aliases: ["google", "谷歌"] },
  { symbol: "AMZN", name: "Amazon.com Inc", type: "stock", aliases: ["亚马逊"] },
  { symbol: "META", name: "Meta Platforms Inc", type: "stock", aliases: ["facebook", "脸书"] },
  { symbol: "TSLA", name: "Tesla Inc", type: "stock", aliases: ["特斯拉"] },
  { symbol: "CRWD", name: "CrowdStrike Holdings", type: "stock" },
  { symbol: "AMD", name: "Advanced Micro Devices", type: "stock", aliases: ["超威"] },
  { symbol: "SMCI", name: "Super Micro Computer", type: "stock", aliases: ["超微电脑"] },
  { symbol: "ARM", name: "Arm Holdings", type: "stock" },
  { symbol: "PLTR", name: "Palantir Technologies", type: "stock" },
  { symbol: "SNOW", name: "Snowflake Inc", type: "stock" },
  { symbol: "COIN", name: "Coinbase Global", type: "stock", aliases: ["coinbase", "比特币"] },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", type: "etf", aliases: ["标普500"] },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "etf", aliases: ["纳斯达克100"] },
];

const popularStocks: SearchResult[] = localStocks.slice(0, 8);

// 本地模糊搜索（支持别名）
function localSearch(q: string): SearchResult[] {
  const lower = q.toLowerCase();
  return localStocks
    .filter(
      (s) =>
        s.symbol.toLowerCase().includes(lower) ||
        s.name.toLowerCase().includes(lower) ||
        s.aliases?.some((a) => a.toLowerCase().includes(lower))
    )
    .map(({ aliases, ...rest }) => rest);
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Cmd/Ctrl + K
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

  // 聚焦
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 无搜索词时显示热门
  useEffect(() => {
    if (!query.trim()) {
      setResults(popularStocks);
      setSelectedIndex(0);
    }
  }, [query]);

  // 合并去重：本地结果 + API 结果，本地优先（因为有别名匹配）
  const mergeResults = useCallback(
    (local: SearchResult[], api: SearchResult[]): SearchResult[] => {
      const seen = new Set(local.map((r) => r.symbol));
      const merged = [...local];
      for (const item of api) {
        if (!seen.has(item.symbol)) {
          seen.add(item.symbol);
          merged.push(item);
        }
      }
      return merged.slice(0, 12);
    },
    []
  );

  // Finnhub 搜索（防抖 300ms）+ 本地别名合并
  const searchApi = useCallback(async (q: string) => {
    if (!q.trim()) return;

    const local = localSearch(q);
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/market/search?q=${encodeURIComponent(q)}&limit=10`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();
      const apiItems: SearchResult[] = (data.results || []).map((r: any) => ({
        symbol: r.symbol,
        name: r.name,
        type: r.type === "Common Stock" ? "stock" : r.type === "ETP" ? "etf" : r.type?.toLowerCase() || "stock",
      }));
      // 合并本地别名匹配 + API 结果
      const merged = mergeResults(local, apiItems);
      setResults(merged.length > 0 ? merged : local);
      setSelectedIndex(0);
    } catch {
      // 搜索失败时回退到本地搜索
      setResults(local);
    } finally {
      setLoading(false);
    }
  }, [mergeResults]);

  // 输入变化 → 立即本地搜索 + 防抖 API 搜索
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) return;

    // 立即显示本地匹配（包括别名），用户无需等待
    const local = localSearch(value);
    if (local.length > 0) {
      setResults(local);
      setSelectedIndex(0);
    }

    // 防抖调用 API 获取更多结果
    debounceRef.current = setTimeout(() => {
      searchApi(value);
    }, 300);
  };

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].symbol);
    }
  };

  const handleSelect = (symbol: string) => {
    router.push(`/stock/${symbol}`);
    setIsOpen(false);
    setQuery("");
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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
          {loading ? (
            <Loader2 className="w-5 h-5 text-stripe-accent animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-stripe-ink-lighter dark:text-gray-500" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索任意美股代码或公司名称..."
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
          {query && !loading && results.length > 0 && (
            <p className="px-4 py-2 text-xs text-stripe-ink-lighter dark:text-gray-500 uppercase tracking-wide">
              搜索结果 · Finnhub
            </p>
          )}
          {results.map((result, index) => (
            <button
              key={result.symbol}
              onClick={() => handleSelect(result.symbol)}
              className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                index === selectedIndex
                  ? "bg-stripe-bg dark:bg-white/10"
                  : "hover:bg-stripe-bg dark:hover:bg-white/5"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-stripe-bg dark:bg-white/5 flex items-center justify-center">
                <span className="text-sm font-medium text-stripe-ink dark:text-white">
                  {result.symbol[0]}
                </span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-stripe-ink dark:text-white">
                  {result.symbol}
                </p>
                <p className="text-xs text-stripe-ink-lighter dark:text-gray-400 truncate">
                  {result.name}
                </p>
              </div>
              <span className="text-xs text-stripe-ink-lighter dark:text-gray-500 uppercase shrink-0">
                {result.type === "etf" || result.type === "ETP"
                  ? "ETF"
                  : result.type === "Common Stock" || result.type === "stock"
                  ? "股票"
                  : result.type}
              </span>
            </button>
          ))}
          {query && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-stripe-ink-lighter dark:text-gray-400">
                未找到匹配的股票
              </p>
              <p className="text-xs text-stripe-ink-lighter dark:text-gray-500 mt-1">
                试试输入完整的股票代码，如 AAPL、TSLA
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stripe-border dark:border-[#2A2A35] flex items-center justify-between text-xs text-stripe-ink-lighter dark:text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stripe-bg dark:bg-white/5 border border-stripe-border dark:border-[#2A2A35] rounded">
                ↑↓
              </kbd>
              选择
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stripe-bg dark:bg-white/5 border border-stripe-border dark:border-[#2A2A35] rounded">
                ↵
              </kbd>
              确认
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-stripe-bg dark:bg-white/5 border border-stripe-border dark:border-[#2A2A35] rounded">
              Esc
            </kbd>
            关闭
          </span>
        </div>
      </div>
    </>
  );
}
