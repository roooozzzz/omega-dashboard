/**
 * OMEGA Hooks - 统一导出
 */

// 市场数据
export { useMarketData } from "./useMarketData";
export type { MarketData } from "./useMarketData";

// 股票数据
export { useStockData, useMultipleStocks } from "./useStockData";
export type { StockData } from "./useStockData";

// 护城河数据
export {
  useMoatList,
  useMoatData,
  useStrongBuys,
  useMoatActions,
} from "./useMoatData";
export type { MoatData } from "./useMoatData";

// 交易信号
export {
  useSignals,
  useSignalStream,
  useLongTermSignals,
  useMidTermSignals,
  useShortTermSignals,
} from "./useSignals";
export type { TradingSignal, SignalStats } from "./useSignals";

// 历史数据
export { useHistoricalData } from "./useHistoricalData";
