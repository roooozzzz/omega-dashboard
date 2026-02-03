import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-stripe-success-light text-stripe-success-text",
  warning: "bg-stripe-warning-light text-stripe-warning-text",
  danger: "bg-stripe-danger-light text-stripe-danger-text",
  info: "bg-stripe-info-light text-stripe-info-text",
  neutral: "bg-stripe-neutral text-stripe-neutral-text",
};

export function StatusBadge({
  variant,
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
