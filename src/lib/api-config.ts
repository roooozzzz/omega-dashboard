/**
 * OMEGA API 配置
 * 数据源 API 端点和配置
 */

export const API_CONFIG = {
  // ============ 免费数据源 ============
  
  // Yahoo Finance (非官方 API)
  yahooFinance: {
    name: "Yahoo Finance",
    type: "free" as const,
    baseUrl: "https://query1.finance.yahoo.com/v8/finance",
    endpoints: {
      quote: "/quote",
      chart: "/chart/{symbol}",
      quoteSummary: "/quoteSummary/{symbol}",
    },
    rateLimit: "无明确限制，建议 1-2 req/s",
    features: ["实时价格", "历史数据", "财务数据", "分析师评级"],
    docs: "https://github.com/ranaroussi/yfinance",
  },

  // Alpha Vantage
  alphaVantage: {
    name: "Alpha Vantage",
    type: "freemium" as const,
    baseUrl: "https://www.alphavantage.co/query",
    apiKeyEnv: "ALPHA_VANTAGE_API_KEY",
    endpoints: {
      quote: "?function=GLOBAL_QUOTE&symbol={symbol}",
      daily: "?function=TIME_SERIES_DAILY&symbol={symbol}",
      rsi: "?function=RSI&symbol={symbol}&interval=daily&time_period=14&series_type=close",
      macd: "?function=MACD&symbol={symbol}&interval=daily&series_type=close",
      bbands: "?function=BBANDS&symbol={symbol}&interval=daily&time_period=20&series_type=close",
      overview: "?function=OVERVIEW&symbol={symbol}",
    },
    rateLimit: "免费: 25 次/天; Premium: 75-1200 次/分钟",
    pricing: {
      free: "$0 (25 req/day)",
      basic: "$50/月 (75 req/min)",
      premium: "$150/月 (150 req/min)",
    },
    features: ["技术指标", "基本面数据", "外汇", "加密货币"],
    docs: "https://www.alphavantage.co/documentation/",
  },

  // Financial Modeling Prep
  fmp: {
    name: "Financial Modeling Prep",
    type: "freemium" as const,
    baseUrl: "https://financialmodelingprep.com/api/v3",
    apiKeyEnv: "FMP_API_KEY",
    endpoints: {
      quote: "/quote/{symbol}",
      profile: "/profile/{symbol}",
      ratios: "/ratios/{symbol}",
      keyMetrics: "/key-metrics/{symbol}",
      dcf: "/discounted-cash-flow/{symbol}",
      rating: "/rating/{symbol}",
      incomeStatement: "/income-statement/{symbol}",
      balanceSheet: "/balance-sheet/{symbol}",
      cashFlow: "/cash-flow-statement/{symbol}",
    },
    rateLimit: "免费: 250 次/天; Starter: 300 req/min",
    pricing: {
      free: "$0 (250 req/day)",
      starter: "$19/月 (300 req/min)",
      pro: "$49/月 (750 req/min)",
      ultimate: "$99/月 (无限)",
    },
    features: ["财务报表", "估值比率", "DCF 模型", "评级"],
    docs: "https://site.financialmodelingprep.com/developer/docs",
  },

  // Finnhub
  finnhub: {
    name: "Finnhub",
    type: "freemium" as const,
    baseUrl: "https://finnhub.io/api/v1",
    apiKeyEnv: "FINNHUB_API_KEY",
    endpoints: {
      quote: "/quote?symbol={symbol}",
      profile: "/stock/profile2?symbol={symbol}",
      news: "/company-news?symbol={symbol}",
      recommendation: "/stock/recommendation?symbol={symbol}",
      peersSymbol: "/stock/peers?symbol={symbol}",
      insiderTransactions: "/stock/insider-transactions?symbol={symbol}",
      institutionalOwnership: "/institutional-ownership?symbol={symbol}",
    },
    rateLimit: "免费: 60 次/分钟; 付费: 300-3600 次/分钟",
    pricing: {
      free: "$0 (60 req/min)",
      starter: "$49/月 (300 req/min)",
      pro: "$199/月 (1200 req/min)",
    },
    features: ["实时价格", "新闻", "内部交易", "机构持仓"],
    docs: "https://finnhub.io/docs/api",
    websocket: "wss://ws.finnhub.io",
  },

  // ============ 付费数据源 ============

  // Polygon.io
  polygon: {
    name: "Polygon.io",
    type: "paid" as const,
    baseUrl: "https://api.polygon.io",
    apiKeyEnv: "POLYGON_API_KEY",
    endpoints: {
      ticker: "/v3/reference/tickers/{symbol}",
      aggregates: "/v2/aggs/ticker/{symbol}/range/1/day/{from}/{to}",
      snapshot: "/v2/snapshot/locale/us/markets/stocks/tickers/{symbol}",
      previousClose: "/v2/aggs/ticker/{symbol}/prev",
    },
    rateLimit: "Starter: 5 req/min; Developer: 无限",
    pricing: {
      starter: "$29/月 (5 req/min, 延迟 15 分钟)",
      developer: "$79/月 (无限, 实时)",
      advanced: "$199/月 (WebSocket, 历史)",
    },
    features: ["实时数据", "历史数据", "期权", "加密货币"],
    docs: "https://polygon.io/docs",
    websocket: "wss://socket.polygon.io",
  },

  // IEX Cloud
  iexCloud: {
    name: "IEX Cloud",
    type: "paid" as const,
    baseUrl: "https://cloud.iexapis.com/stable",
    apiKeyEnv: "IEX_CLOUD_API_KEY",
    endpoints: {
      quote: "/stock/{symbol}/quote",
      stats: "/stock/{symbol}/stats",
      financials: "/stock/{symbol}/financials",
      estimates: "/stock/{symbol}/estimates",
      recommendationTrends: "/stock/{symbol}/recommendation-trends",
    },
    rateLimit: "基于信用额度",
    pricing: {
      launch: "$9/月 (50 万消息)",
      grow: "$49/月 (200 万消息)",
      scale: "$499/月 (3000 万消息)",
    },
    features: ["实时价格", "财务数据", "分析师预期", "新闻"],
    docs: "https://iexcloud.io/docs/api/",
  },

  // ============ 专业数据源 ============

  // Morningstar (护城河评级)
  morningstar: {
    name: "Morningstar",
    type: "paid" as const,
    baseUrl: "https://api.morningstar.com",
    note: "需要企业级账户，联系销售获取 API",
    features: ["护城河评级", "公允价值估算", "不确定性评级", "管理层评分"],
    docs: "https://developer.morningstar.com/",
  },

  // IBD (相对强度评级)
  ibd: {
    name: "Investor's Business Daily",
    type: "paid" as const,
    note: "RS Rating 通过 IBD Digital 订阅获取，无公开 API",
    features: ["RS Rating", "EPS Rating", "Composite Rating", "行业排名"],
    pricing: "IBD Digital: $35/月",
    website: "https://www.investors.com/",
  },

  // ============ 情绪数据 ============

  // Fear & Greed Index
  fearGreed: {
    name: "CNN Fear & Greed Index",
    type: "free" as const,
    source: "https://edition.cnn.com/markets/fear-and-greed",
    note: "需要爬取网页数据，无官方 API",
    alternative: "https://api.alternative.me/fng/ (加密货币版本)",
  },

  // VIX
  vix: {
    name: "CBOE VIX",
    type: "free" as const,
    source: "通过 Yahoo Finance 或其他行情 API 获取 ^VIX",
    symbol: "^VIX",
  },
};

// ============ 推荐 API 组合 ============

export const RECOMMENDED_STACK = {
  free: {
    name: "免费方案",
    cost: "$0/月",
    sources: ["Yahoo Finance", "Alpha Vantage (免费)", "FMP (免费)"],
    limitations: [
      "Alpha Vantage 每日 25 次调用限制",
      "无实时数据",
      "技术指标计算需自建",
    ],
  },
  starter: {
    name: "入门方案",
    cost: "~$70/月",
    sources: ["Alpha Vantage Basic ($50)", "FMP Starter ($19)"],
    features: [
      "技术指标 API",
      "完整财务数据",
      "每分钟 75+ 次调用",
    ],
  },
  professional: {
    name: "专业方案",
    cost: "~$250/月",
    sources: ["Polygon Developer ($79)", "Finnhub Pro ($199)"],
    features: [
      "实时数据",
      "WebSocket 推送",
      "机构持仓数据",
      "无调用限制",
    ],
  },
};
