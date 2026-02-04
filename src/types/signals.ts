// 信号类型定义

export type StrategyType = "long" | "mid" | "short";
export type ActionType = "BUY" | "SELL" | "HOLD" | "WATCH";

export type LongSignalType = "STRONG_BUY" | "HOLD" | "SELL";
export type MidSignalType = "POCKET_PIVOT" | "VCP_BREAKOUT" | "TREND_FOLLOW";
export type ShortSignalType = "OVERSOLD_T1" | "OVERSOLD_T2" | "BOUNCE";

export type SignalType = LongSignalType | MidSignalType | ShortSignalType;

export interface TradingSignal {
  id: string;
  ticker: string;
  name?: string;
  strategy: StrategyType;
  signal_type: SignalType;
  score: number;
  timestamp: string;
  reasons: string[];
  action: ActionType;
  suggested_position: number;
  price?: number;
  change_percent?: number;
}

export interface SignalStats {
  total: number;
  today: number;
  by_strategy: {
    long?: number;
    mid?: number;
    short?: number;
  };
  by_action: {
    BUY?: number;
    SELL?: number;
    HOLD?: number;
    WATCH?: number;
  };
  subscribers: number;
}

// 信号类型配置
export const SIGNAL_TYPE_CONFIG: Record<SignalType, { label: string; color: string }> = {
  // 长线
  STRONG_BUY: { label: "强力买入", color: "text-stripe-success" },
  HOLD: { label: "持有", color: "text-stripe-ink-lighter" },
  SELL: { label: "卖出", color: "text-stripe-danger" },
  // 中线
  POCKET_PIVOT: { label: "口袋支点", color: "text-stripe-purple" },
  VCP_BREAKOUT: { label: "VCP 突破", color: "text-stripe-purple" },
  TREND_FOLLOW: { label: "趋势跟踪", color: "text-stripe-purple" },
  // 短线
  OVERSOLD_T1: { label: "超卖 T1", color: "text-stripe-warning" },
  OVERSOLD_T2: { label: "超卖 T2", color: "text-stripe-warning" },
  BOUNCE: { label: "反弹", color: "text-stripe-warning" },
};

export const ACTION_CONFIG: Record<ActionType, { label: string; variant: "success" | "danger" | "neutral" | "warning" }> = {
  BUY: { label: "买入", variant: "success" },
  SELL: { label: "卖出", variant: "danger" },
  HOLD: { label: "持有", variant: "neutral" },
  WATCH: { label: "观望", variant: "warning" },
};

export const STRATEGY_CONFIG: Record<StrategyType, { label: string; color: string; bg: string }> = {
  long: { label: "长线", color: "text-stripe-ink", bg: "bg-stripe-bg" },
  mid: { label: "中线", color: "text-stripe-purple", bg: "bg-indigo-50" },
  short: { label: "短线", color: "text-stripe-warning", bg: "bg-stripe-warning-light" },
};
