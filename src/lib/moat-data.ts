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
  confidence: "High" | "Medium" | "Low";
  status: "Pending" | "Verified" | "Rejected";
  analyzedAt: string;
  powers: MoatPower[];
  aiSummary: string;
}

export const demoProposals: MoatProposal[] = [
  {
    id: "1",
    ticker: "CRWD",
    name: "CrowdStrike Holdings",
    sector: "Cybersecurity",
    aiScore: 23,
    maxScore: 35,
    confidence: "High",
    status: "Pending",
    analyzedAt: "2026-02-03 14:32",
    powers: [
      {
        name: "Switching Costs",
        score: 6,
        maxScore: 7,
        icon: Building2,
        description: "Deep integration with enterprise IT infrastructure",
      },
      {
        name: "Network Effects",
        score: 5,
        maxScore: 7,
        icon: Users,
        description: "Threat intelligence improves with more endpoints",
      },
      {
        name: "Intangible Assets",
        score: 4,
        maxScore: 7,
        icon: Shield,
        description: "Strong brand in endpoint security market",
      },
      {
        name: "Cost Advantages",
        score: 4,
        maxScore: 7,
        icon: Scale,
        description: "Cloud-native architecture reduces costs",
      },
      {
        name: "Efficient Scale",
        score: 4,
        maxScore: 7,
        icon: Cpu,
        description: "Limited competition in XDR space",
      },
    ],
    aiSummary:
      "CrowdStrike demonstrates strong moat characteristics through high switching costs (deep enterprise integration) and growing network effects (threat intelligence). The Falcon platform's cloud-native architecture provides cost advantages over legacy competitors. Primary risk: Intense competition from Microsoft Defender.",
  },
  {
    id: "2",
    ticker: "SNOW",
    name: "Snowflake Inc",
    sector: "Cloud Data",
    aiScore: 19,
    maxScore: 35,
    confidence: "Medium",
    status: "Pending",
    analyzedAt: "2026-02-03 13:45",
    powers: [
      {
        name: "Switching Costs",
        score: 5,
        maxScore: 7,
        icon: Building2,
        description: "Data gravity creates strong retention",
      },
      {
        name: "Network Effects",
        score: 4,
        maxScore: 7,
        icon: Users,
        description: "Data sharing marketplace gaining traction",
      },
      {
        name: "Intangible Assets",
        score: 3,
        maxScore: 7,
        icon: Shield,
        description: "Recognized leader in cloud data warehousing",
      },
      {
        name: "Cost Advantages",
        score: 3,
        maxScore: 7,
        icon: Scale,
        description: "Consumption model aligns with usage",
      },
      {
        name: "Efficient Scale",
        score: 4,
        maxScore: 7,
        icon: Cpu,
        description: "Limited direct cloud-native competitors",
      },
    ],
    aiSummary:
      "Snowflake's moat is primarily built on switching costs due to data gravity and network effects from its data marketplace. The consumption-based model is a double-edged sword. Risk factors: Databricks competition, cloud vendor alternatives (BigQuery, Redshift).",
  },
  {
    id: "3",
    ticker: "DDOG",
    name: "Datadog Inc",
    sector: "Observability",
    aiScore: 21,
    maxScore: 35,
    confidence: "High",
    status: "Pending",
    analyzedAt: "2026-02-03 12:18",
    powers: [
      {
        name: "Switching Costs",
        score: 5,
        maxScore: 7,
        icon: Building2,
        description: "Deep integration across DevOps stack",
      },
      {
        name: "Network Effects",
        score: 3,
        maxScore: 7,
        icon: Users,
        description: "Growing marketplace for integrations",
      },
      {
        name: "Intangible Assets",
        score: 5,
        maxScore: 7,
        icon: Shield,
        description: "Strong brand, 900+ integrations",
      },
      {
        name: "Cost Advantages",
        score: 4,
        maxScore: 7,
        icon: Scale,
        description: "Unified platform reduces total cost",
      },
      {
        name: "Efficient Scale",
        score: 4,
        maxScore: 7,
        icon: Cpu,
        description: "Consolidating fragmented market",
      },
    ],
    aiSummary:
      "Datadog has built a strong moat through platform consolidation — combining logs, metrics, traces, and security in one solution. The 900+ integrations create significant intangible assets. High net revenue retention (130%+) indicates strong switching costs. Competition from Splunk/Elastic is manageable.",
  },
  {
    id: "4",
    ticker: "PANW",
    name: "Palo Alto Networks",
    sector: "Cybersecurity",
    aiScore: 25,
    maxScore: 35,
    confidence: "High",
    status: "Verified",
    analyzedAt: "2026-02-02 16:42",
    powers: [
      {
        name: "Switching Costs",
        score: 6,
        maxScore: 7,
        icon: Building2,
        description: "Enterprise firewalls deeply embedded",
      },
      {
        name: "Network Effects",
        score: 4,
        maxScore: 7,
        icon: Users,
        description: "Threat intelligence sharing",
      },
      {
        name: "Intangible Assets",
        score: 6,
        maxScore: 7,
        icon: Shield,
        description: "Premium brand in enterprise security",
      },
      {
        name: "Cost Advantages",
        score: 4,
        maxScore: 7,
        icon: Scale,
        description: "Platformization reduces vendor sprawl",
      },
      {
        name: "Efficient Scale",
        score: 5,
        maxScore: 7,
        icon: Cpu,
        description: "M&A consolidating market",
      },
    ],
    aiSummary:
      "Palo Alto Networks demonstrates the strongest moat in our cybersecurity coverage. The platformization strategy is paying off with strong cross-sell. Hardware + software + cloud creates multi-layer switching costs. Verified as a high-conviction moat.",
  },
  {
    id: "5",
    ticker: "ZS",
    name: "Zscaler Inc",
    sector: "Cybersecurity",
    aiScore: 14,
    maxScore: 35,
    confidence: "Low",
    status: "Rejected",
    analyzedAt: "2026-02-01 09:15",
    powers: [
      {
        name: "Switching Costs",
        score: 4,
        maxScore: 7,
        icon: Building2,
        description: "Moderate — proxy-based architecture",
      },
      {
        name: "Network Effects",
        score: 2,
        maxScore: 7,
        icon: Users,
        description: "Limited network effects",
      },
      {
        name: "Intangible Assets",
        score: 3,
        maxScore: 7,
        icon: Shield,
        description: "Growing brand in ZTNA",
      },
      {
        name: "Cost Advantages",
        score: 2,
        maxScore: 7,
        icon: Scale,
        description: "High infrastructure costs",
      },
      {
        name: "Efficient Scale",
        score: 3,
        maxScore: 7,
        icon: Cpu,
        description: "Crowded SASE market",
      },
    ],
    aiSummary:
      "Zscaler faces significant moat challenges. While switching costs exist, the proxy-based architecture is facing competition from integrated solutions (PANW, Fortinet). High infrastructure costs and a crowded SASE market limit moat durability. Rejected for watchlist.",
  },
];
