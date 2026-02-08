/**
 * 指数策略 Mock 数据
 * 后端 /api/index/* 上线前使用，API 调用失败时自动回退到此数据
 */

import type { IndexWatchlistResponse, IndexOverviewResponse } from "@/lib/api";

export const MOCK_INDEX_WATCHLIST: IndexWatchlistResponse = {
  etfs: [
    {
      symbol: "VOO",
      name: "Vanguard S&P 500 ETF",
      indexTracked: "S&P 500",
      price: 523.45,
      change: 2.31,
      changePercent: 0.44,
      pe: 24.8,
      pe5yAvg: 22.5,
      dividendYield: 1.32,
      ma200: 498.20,
      aboveMa200: true,
      rsi14: 55.3,
      expenseRatio: 0.03,
      healthStatus: "healthy",
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: "QQQ",
      name: "Invesco QQQ Trust",
      indexTracked: "Nasdaq-100",
      price: 487.12,
      change: -1.56,
      changePercent: -0.32,
      pe: 32.1,
      pe5yAvg: 28.7,
      dividendYield: 0.55,
      ma200: 462.80,
      aboveMa200: true,
      rsi14: 48.7,
      expenseRatio: 0.20,
      healthStatus: "watch",
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: "VTI",
      name: "Vanguard Total Stock Market ETF",
      indexTracked: "CRSP US Total Market",
      price: 275.88,
      change: 1.02,
      changePercent: 0.37,
      pe: 23.5,
      pe5yAvg: 21.8,
      dividendYield: 1.28,
      ma200: 261.45,
      aboveMa200: true,
      rsi14: 52.1,
      expenseRatio: 0.03,
      healthStatus: "healthy",
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: "SCHD",
      name: "Schwab U.S. Dividend Equity ETF",
      indexTracked: "Dow Jones US Dividend 100",
      price: 82.34,
      change: 0.45,
      changePercent: 0.55,
      pe: 16.2,
      pe5yAvg: 17.1,
      dividendYield: 3.42,
      ma200: 79.60,
      aboveMa200: true,
      rsi14: 58.9,
      expenseRatio: 0.06,
      healthStatus: "healthy",
      updatedAt: new Date().toISOString(),
    },
  ],
  updatedAt: new Date().toISOString(),
};

export const MOCK_INDEX_OVERVIEW: IndexOverviewResponse = {
  totalEtfs: 4,
  dcaStreakWeeks: 0,
  valueSignals: 0,
  riskAlerts: 0,
};
