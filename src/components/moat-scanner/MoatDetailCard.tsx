"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { MoatProposal } from "@/lib/moat-data";

const statusConfig = {
  Pending: {
    icon: Clock,
    variant: "warning" as const,
    color: "text-stripe-warning",
  },
  Verified: {
    icon: CheckCircle,
    variant: "success" as const,
    color: "text-stripe-success",
  },
  Rejected: {
    icon: XCircle,
    variant: "danger" as const,
    color: "text-stripe-danger",
  },
};

const confidenceColor = {
  High: "text-stripe-success",
  Medium: "text-stripe-warning",
  Low: "text-stripe-danger",
};

interface MoatDetailCardProps {
  proposal: MoatProposal;
}

export function MoatDetailCard({ proposal }: MoatDetailCardProps) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = statusConfig[proposal.status].icon;

  return (
    <div className="bg-white rounded-lg border border-stripe-border shadow-[var(--shadow-omega-sm)] hover:shadow-[var(--shadow-omega)] transition-shadow duration-150">
      {/* Header Row */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-stripe-bg flex items-center justify-center">
            <span className="text-lg font-semibold text-stripe-ink">
              {proposal.ticker[0]}
            </span>
          </div>

          {/* Stock Info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stripe-ink">
                {proposal.ticker}
              </h3>
              <StatusBadge variant="neutral">{proposal.sector}</StatusBadge>
            </div>
            <p className="text-sm text-stripe-ink-lighter">{proposal.name}</p>
          </div>
        </div>

        {/* Scores */}
        <div className="flex items-center gap-8">
          {/* AI Score */}
          <div className="text-center">
            <p className="text-2xl font-semibold text-stripe-ink">
              {proposal.aiScore}
              <span className="text-sm text-stripe-ink-lighter font-normal">
                /{proposal.maxScore}
              </span>
            </p>
            <p className="text-xs text-stripe-ink-lighter">AI Score</p>
          </div>

          {/* Confidence */}
          <div className="text-center">
            <p
              className={`text-lg font-semibold ${
                confidenceColor[proposal.confidence]
              }`}
            >
              {proposal.confidence}
            </p>
            <p className="text-xs text-stripe-ink-lighter">Confidence</p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusIcon
              className={`w-5 h-5 ${statusConfig[proposal.status].color}`}
            />
            <StatusBadge variant={statusConfig[proposal.status].variant}>
              {proposal.status}
            </StatusBadge>
          </div>

          {/* Expand */}
          <button className="p-2 hover:bg-stripe-bg rounded-md transition-colors">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-stripe-ink-lighter" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stripe-ink-lighter" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-stripe-border">
          {/* Powers Grid */}
          <div className="p-5 grid grid-cols-5 gap-4">
            {proposal.powers.map((power) => {
              const Icon = power.icon;
              const percentage = (power.score / power.maxScore) * 100;
              return (
                <div
                  key={power.name}
                  className="p-4 bg-stripe-bg rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-stripe-ink-light" />
                    <span className="text-sm font-medium text-stripe-ink">
                      {power.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-stripe-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-stripe-purple rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-stripe-ink">
                      {power.score}/{power.maxScore}
                    </span>
                  </div>
                  <p className="text-xs text-stripe-ink-lighter">
                    {power.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* AI Summary */}
          <div className="px-5 pb-5">
            <div className="p-4 bg-stripe-info-light rounded-lg">
              <h4 className="text-sm font-medium text-stripe-info-text mb-2">
                AI Analysis Summary
              </h4>
              <p className="text-sm text-stripe-ink-light">
                {proposal.aiSummary}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 flex items-center justify-between">
            <p className="text-xs text-stripe-ink-lighter">
              Analyzed: {proposal.analyzedAt}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="bg-white border-stripe-danger text-stripe-danger hover:bg-stripe-danger-light"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button className="bg-stripe-success text-white hover:bg-stripe-success/90">
                <CheckCircle className="w-4 h-4" />
                Verify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
