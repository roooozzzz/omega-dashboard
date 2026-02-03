import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: "w-8 h-8", svg: "w-4 h-4" },
  md: { container: "w-9 h-9", svg: "w-5 h-5" },
  lg: { container: "w-16 h-16", svg: "w-9 h-9" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "rounded-lg bg-indigo-50 flex items-center justify-center",
          s.container
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={s.svg}
          style={{
            stroke: "#6366F1",
            strokeWidth: 1.5,
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }}
        >
          {/* 底层 - 最大，最透明 */}
          <path d="M12 2 L22 7 L12 12 L2 7 Z" opacity={0.3} />
          {/* 中层 */}
          <path d="M12 6 L18 9.5 L12 13 L6 9.5 Z" opacity={0.55} />
          {/* 顶层 - 最小，最实 */}
          <path d="M12 10 L15 11.5 L12 13 L9 11.5 Z" opacity={0.85} />
        </svg>
      </div>
      {showText && (
        <span className="font-semibold text-base text-stripe-ink">OMEGA</span>
      )}
    </div>
  );
}
