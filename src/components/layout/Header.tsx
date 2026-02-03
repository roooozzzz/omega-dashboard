"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 bg-white border-b border-stripe-border px-8 py-4 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-stripe-ink">{title}</h1>
          {description && (
            <p className="text-sm text-stripe-ink-lighter">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stripe-ink-lighter">
            Last updated: {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </span>
          <Button
            variant="outline"
            className="bg-white border-stripe-border text-stripe-ink hover:bg-stripe-bg"
          >
            <RefreshCw className="w-4 h-4 text-stripe-ink-light" />
            Refresh
          </Button>
        </div>
      </div>
    </header>
  );
}
