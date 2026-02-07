import type { LucideIcon } from "lucide-react";

export interface MoatPower {
  name: string;
  score: number;
  maxScore: number;
  icon: LucideIcon;
  description: string;
}

export interface MoatProposal {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  aiScore: number;
  maxScore: number;
  confidence: "高" | "中" | "低";
  status: "待审核" | "已通过" | "已拒绝";
  analyzedAt: string;
  powers: MoatPower[];
  aiSummary: string;
}
