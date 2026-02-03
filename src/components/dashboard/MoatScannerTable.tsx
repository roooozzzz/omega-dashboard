import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface MoatProposal {
  ticker: string;
  name: string;
  initial: string;
  aiScore: number;
  maxScore: number;
  topPower: string;
  confidence: "High" | "Medium" | "Low";
  status: "Pending" | "Verified" | "Rejected";
}

const proposals: MoatProposal[] = [
  {
    ticker: "CRWD",
    name: "CrowdStrike",
    initial: "C",
    aiScore: 23,
    maxScore: 35,
    topPower: "Switching Costs",
    confidence: "High",
    status: "Pending",
  },
  {
    ticker: "SNOW",
    name: "Snowflake",
    initial: "S",
    aiScore: 19,
    maxScore: 35,
    topPower: "Network Effects",
    confidence: "Medium",
    status: "Pending",
  },
  {
    ticker: "DDOG",
    name: "Datadog",
    initial: "D",
    aiScore: 21,
    maxScore: 35,
    topPower: "Scale Economies",
    confidence: "High",
    status: "Pending",
  },
];

const confidenceColor: Record<string, string> = {
  High: "text-stripe-success",
  Medium: "text-stripe-warning",
  Low: "text-stripe-danger",
};

export function MoatScannerTable() {
  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)]">
      {/* Header */}
      <div className="p-5 border-b border-stripe-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-stripe-ink">Moat Scanner</h2>
          <p className="text-sm text-stripe-ink-lighter mt-0.5">
            Pending review from AI analysis
          </p>
        </div>
        <Link
          href="/moat-scanner"
          className="text-sm font-medium text-stripe-purple hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-stripe-border bg-stripe-bg">
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Stock
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              AI Score
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Top Power
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Confidence
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Status
            </th>
            <th className="text-right px-5 py-3 text-xs font-medium text-stripe-ink-lighter uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p, i) => (
            <tr
              key={p.ticker}
              className={`hover:bg-[#FAFBFC] transition-colors duration-150 ${
                i < proposals.length - 1 ? "border-b border-stripe-border" : ""
              }`}
            >
              {/* Stock */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stripe-bg flex items-center justify-center">
                    <span className="text-sm font-medium text-stripe-ink">
                      {p.initial}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-stripe-ink">
                      {p.ticker}
                    </p>
                    <p className="text-xs text-stripe-ink-lighter">{p.name}</p>
                  </div>
                </div>
              </td>

              {/* AI Score */}
              <td className="px-5 py-4">
                <span className="text-lg font-semibold text-stripe-ink">
                  {p.aiScore}
                </span>
                <span className="text-sm text-stripe-ink-lighter">
                  /{p.maxScore}
                </span>
              </td>

              {/* Top Power */}
              <td className="px-5 py-4">
                <StatusBadge variant="info">{p.topPower}</StatusBadge>
              </td>

              {/* Confidence */}
              <td className="px-5 py-4">
                <span
                  className={`text-sm font-medium ${confidenceColor[p.confidence]}`}
                >
                  {p.confidence}
                </span>
              </td>

              {/* Status */}
              <td className="px-5 py-4">
                <StatusBadge variant="warning">{p.status}</StatusBadge>
              </td>

              {/* Actions */}
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    className="bg-stripe-purple text-white hover:bg-stripe-purple-dark"
                  >
                    Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
                  >
                    Details
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
