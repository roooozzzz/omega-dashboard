import { Shield, Building2, Users, Cpu, Scale } from "lucide-react";
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

export const demoProposals: MoatProposal[] = [
  {
    id: "1",
    ticker: "CRWD",
    name: "CrowdStrike Holdings",
    sector: "网络安全",
    aiScore: 23,
    maxScore: 35,
    confidence: "高",
    status: "待审核",
    analyzedAt: "2026-02-03 14:32",
    powers: [
      {
        name: "转换成本",
        score: 6,
        maxScore: 7,
        icon: Building2,
        description: "与企业IT基础设施深度集成",
      },
      {
        name: "网络效应",
        score: 5,
        maxScore: 7,
        icon: Users,
        description: "端点越多，威胁情报越强",
      },
      {
        name: "无形资产",
        score: 4,
        maxScore: 7,
        icon: Shield,
        description: "端点安全市场的强势品牌",
      },
      {
        name: "成本优势",
        score: 4,
        maxScore: 7,
        icon: Scale,
        description: "云原生架构降低运营成本",
      },
      {
        name: "有效规模",
        score: 4,
        maxScore: 7,
        icon: Cpu,
        description: "XDR 领域竞争有限",
      },
    ],
    aiSummary:
      "CrowdStrike 展现出强大的护城河特征：高转换成本（深度企业集成）和持续增长的网络效应（威胁情报）。Falcon 平台的云原生架构相比传统竞争对手具有成本优势。主要风险：微软 Defender 的激烈竞争。",
  },
  {
    id: "2",
    ticker: "SNOW",
    name: "Snowflake Inc",
    sector: "云数据",
    aiScore: 19,
    maxScore: 35,
    confidence: "中",
    status: "待审核",
    analyzedAt: "2026-02-03 13:45",
    powers: [
      {
        name: "转换成本",
        score: 5,
        maxScore: 7,
        icon: Building2,
        description: "数据引力创造强客户黏性",
      },
      {
        name: "网络效应",
        score: 4,
        maxScore: 7,
        icon: Users,
        description: "数据共享市场逐渐成熟",
      },
      {
        name: "无形资产",
        score: 3,
        maxScore: 7,
        icon: Shield,
        description: "云数据仓库领域公认领导者",
      },
      {
        name: "成本优势",
        score: 3,
        maxScore: 7,
        icon: Scale,
        description: "按需付费模式与使用量挂钩",
      },
      {
        name: "有效规模",
        score: 4,
        maxScore: 7,
        icon: Cpu,
        description: "云原生直接竞争对手有限",
      },
    ],
    aiSummary:
      "Snowflake 的护城河主要建立在数据引力带来的转换成本和数据市场的网络效应上。按需付费模式是把双刃剑。风险因素：Databricks 竞争、云厂商替代方案（BigQuery、Redshift）。",
  },
  {
    id: "3",
    ticker: "DDOG",
    name: "Datadog Inc",
    sector: "可观测性",
    aiScore: 21,
    maxScore: 35,
    confidence: "高",
    status: "待审核",
    analyzedAt: "2026-02-03 12:18",
    powers: [
      {
        name: "转换成本",
        score: 5,
        maxScore: 7,
        icon: Building2,
        description: "与 DevOps 工具栈深度集成",
      },
      {
        name: "网络效应",
        score: 3,
        maxScore: 7,
        icon: Users,
        description: "集成市场持续增长",
      },
      {
        name: "无形资产",
        score: 5,
        maxScore: 7,
        icon: Shield,
        description: "强势品牌，900+ 集成",
      },
      {
        name: "成本优势",
        score: 4,
        maxScore: 7,
        icon: Scale,
        description: "统一平台降低总成本",
      },
      {
        name: "有效规模",
        score: 4,
        maxScore: 7,
        icon: Cpu,
        description: "正在整合碎片化市场",
      },
    ],
    aiSummary:
      "Datadog 通过平台整合建立了强大护城河——将日志、指标、追踪和安全整合在一个解决方案中。900+ 集成创造了显著的无形资产。130%+ 的净收入留存率表明强大的转换成本。来自 Splunk/Elastic 的竞争可控。",
  },
  {
    id: "4",
    ticker: "PANW",
    name: "Palo Alto Networks",
    sector: "网络安全",
    aiScore: 25,
    maxScore: 35,
    confidence: "高",
    status: "已通过",
    analyzedAt: "2026-02-02 16:42",
    powers: [
      {
        name: "转换成本",
        score: 6,
        maxScore: 7,
        icon: Building2,
        description: "企业防火墙深度嵌入",
      },
      {
        name: "网络效应",
        score: 4,
        maxScore: 7,
        icon: Users,
        description: "威胁情报共享",
      },
      {
        name: "无形资产",
        score: 6,
        maxScore: 7,
        icon: Shield,
        description: "企业安全领域顶级品牌",
      },
      {
        name: "成本优势",
        score: 4,
        maxScore: 7,
        icon: Scale,
        description: "平台化减少供应商分散",
      },
      {
        name: "有效规模",
        score: 5,
        maxScore: 7,
        icon: Cpu,
        description: "并购整合市场",
      },
    ],
    aiSummary:
      "Palo Alto Networks 在我们的网络安全覆盖中展现出最强护城河。平台化战略正在带来强劲的交叉销售。硬件+软件+云创造多层转换成本。确认为高确信度护城河。",
  },
  {
    id: "5",
    ticker: "ZS",
    name: "Zscaler Inc",
    sector: "网络安全",
    aiScore: 14,
    maxScore: 35,
    confidence: "低",
    status: "已拒绝",
    analyzedAt: "2026-02-01 09:15",
    powers: [
      {
        name: "转换成本",
        score: 4,
        maxScore: 7,
        icon: Building2,
        description: "中等——代理架构",
      },
      {
        name: "网络效应",
        score: 2,
        maxScore: 7,
        icon: Users,
        description: "网络效应有限",
      },
      {
        name: "无形资产",
        score: 3,
        maxScore: 7,
        icon: Shield,
        description: "ZTNA 领域品牌增长中",
      },
      {
        name: "成本优势",
        score: 2,
        maxScore: 7,
        icon: Scale,
        description: "基础设施成本较高",
      },
      {
        name: "有效规模",
        score: 3,
        maxScore: 7,
        icon: Cpu,
        description: "SASE 市场竞争激烈",
      },
    ],
    aiSummary:
      "Zscaler 面临重大护城河挑战。虽然存在转换成本，但基于代理的架构正面临集成解决方案（PANW、Fortinet）的竞争。高基础设施成本和拥挤的 SASE 市场限制了护城河持久性。已从观察名单移除。",
  },
];
