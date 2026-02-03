"use client";

import { Building2, TrendingUp, Zap } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LucideIcon } from "lucide-react";

type SignalType = "买入" | "卖出" | "观望" | "预警";
type StrategyType = "long" | "mid" | "short";

interface Signal {
  id: string;
  ticker: string;
  name: string;
  signal: SignalType;
  strategy: StrategyType;
  indicator: string;
  price: number;
  change: number;
  triggeredAt: string;
  reason: string;
}

const signalConfig: Record<SignalType, { variant: "success" | "danger" | "neutral" | "warning" }> = {
  "买入": { variant: "success" },
  "卖出": { variant: "danger" },
  "观望": { variant: "neutral" },
  "预警": { variant: "warning" },
};

const strategyConfig: Record<
  StrategyType,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  long: {
    label: "长线",
    icon: Building2,
    color: "text-stripe-ink",
    bg: "bg-stripe-bg",
  },
  mid: {
    label: "中线",
    icon: TrendingUp,
    color: "text-stripe-purple",
    bg: "bg-indigo-50",
  },
  short: {
    label: "短线",
    icon: Zap,
    color: "text-stripe-warning",
    bg: "bg-stripe-warning-light",
  },
};

const demoSignals: Signal[] = [
  {
    id: "1",
    ticker: "MSFT",
    name: "微软",
    signal: "买入",
    strategy: "long",
    indicator: "护城河 26/35",
    price: 412.35,
    change: 2.15,
    triggeredAt: "2026-02-03 14:32",
    reason: "护城河评分通过审核，符合长线买入标准",
  },
  {
    id: "2",
    ticker: "SMCI",
    name: "超微电脑",
    signal: "买入",
    strategy: "mid",
    indicator: "RS 94",
    price: 892.45,
    change: 5.23,
    triggeredAt: "2026-02-03 13:15",
    reason: "RS 评级突破 90，动量强劲",
  },
  {
    id: "3",
    ticker: "GOOGL",
    name: "谷歌",
    signal: "预警",
    strategy: "short",
    indicator: "RSI 24",
    price: 141.22,
    change: -3.45,
    triggeredAt: "2026-02-03 11:45",
    reason: "RSI 进入超卖区间，关注反弹机会",
  },
  {
    id: "4",
    ticker: "NVDA",
    name: "英伟达",
    signal: "观望",
    strategy: "long",
    indicator: "护城河 24/35",
    price: 878.45,
    change: 1.82,
    triggeredAt: "2026-02-03 10:30",
    reason: "估值偏高，等待更好入场点",
  },
  {
    id: "5",
    ticker: "AAPL",
    name: "苹果",
    signal: "卖出",
    strategy: "mid",
    indicator: "RS 65",
    price: 185.92,
    change: -1.24,
    triggeredAt: "2026-02-03 09:45",
    reason: "RS 评级跌破 70，动量减弱",
  },
  {
    id: "6",
    ticker: "TSLA",
    name: "特斯拉",
    signal: "观望",
    strategy: "short",
    indicator: "RSI 45",
    price: 245.67,
    change: 0.85,
    triggeredAt: "2026-02-03 09:15",
    reason: "RSI 中性区间，无明确方向",
  },
];

export function SignalsTable() {
  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      <div className="p-5 border-b border-stripe-border">
        <h2 className="font-semibold text-stripe-ink">信号历史</h2>
        <p className="text-sm text-stripe-ink-lighter mt-0.5">
          最近 24 小时内触发的交易信号
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-stripe-border">
            <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              股票
            </TableHead>
            <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              信号
            </TableHead>
            <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              策略
            </TableHead>
            <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              指标
            </TableHead>
            <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              价格
            </TableHead>
            <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              触发时间
            </TableHead>
            <TableHead className="text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              原因
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {demoSignals.map((signal) => {
            const StratIcon = strategyConfig[signal.strategy].icon;
            return (
              <TableRow
                key={signal.id}
                className="hover:bg-stripe-bg border-b border-stripe-border-light"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stripe-bg flex items-center justify-center">
                      <span className="text-sm font-medium text-stripe-ink">
                        {signal.ticker[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-stripe-ink">
                        {signal.ticker}
                      </p>
                      <p className="text-xs text-stripe-ink-lighter">
                        {signal.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge variant={signalConfig[signal.signal].variant}>
                    {signal.signal}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${
                      strategyConfig[signal.strategy].bg
                    }`}
                  >
                    <StratIcon
                      className={`w-3.5 h-3.5 ${
                        strategyConfig[signal.strategy].color
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        strategyConfig[signal.strategy].color
                      }`}
                    >
                      {strategyConfig[signal.strategy].label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-stripe-ink">
                    {signal.indicator}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-stripe-ink">
                      ${signal.price.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs ${
                        signal.change >= 0
                          ? "text-stripe-success"
                          : "text-stripe-danger"
                      }`}
                    >
                      {signal.change >= 0 ? "+" : ""}
                      {signal.change.toFixed(2)}%
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-stripe-ink-lighter">
                    {signal.triggeredAt}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-stripe-ink-lighter max-w-xs truncate">
                    {signal.reason}
                  </p>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
