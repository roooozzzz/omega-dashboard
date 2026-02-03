"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShieldCheck,
  Radio,
  Briefcase,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/moat-scanner", label: "Moat Scanner", icon: ShieldCheck },
  { href: "/signals", label: "Signals", icon: Radio },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-stripe-border flex flex-col z-20">
      {/* Logo */}
      <div className="p-5 border-b border-stripe-border">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150",
                  isActive
                    ? "bg-stripe-bg text-stripe-purple-light font-medium"
                    : "text-stripe-ink-light hover:bg-stripe-bg"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-stripe-border">
        <div className="p-3 rounded-md bg-stripe-success-light">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-stripe-success rounded-full" />
            <span className="text-xs font-medium text-stripe-success-text">
              System Active
            </span>
          </div>
          <p className="text-xs text-stripe-success-text mt-1 opacity-80">
            Circuit Breaker: OFF
          </p>
        </div>
      </div>
    </aside>
  );
}
