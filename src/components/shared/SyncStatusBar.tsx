"use client";

import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useScannerStatus } from "@/hooks/useScannerStatus";

export function SyncStatusBar() {
  const { scannerStatus, loading, firstScanDone } = useScannerStatus();

  // 加载中或 API 不可用时不显示
  if (loading || !scannerStatus) return null;

  // 首次扫描已完成且当前不在扫描 → 不显示
  if (firstScanDone && scannerStatus.status !== "scanning") return null;

  const isScanning = scannerStatus.status === "scanning";
  const isError = scannerStatus.status === "error";
  const isDone = scannerStatus.status === "done";
  const isIdle = scannerStatus.status === "idle";

  // 首次启动，还没开始扫描
  if (isIdle && !firstScanDone) {
    return (
      <div className="bg-stripe-info-light border border-stripe-info/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-stripe-info animate-spin" />
        <span className="text-sm text-stripe-ink">
          系统启动中，正在准备首次数据同步...
        </span>
      </div>
    );
  }

  // 正在扫描
  if (isScanning) {
    return (
      <div className="bg-stripe-info-light border border-stripe-info/20 rounded-lg px-4 py-3 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Loader2 className="w-4 h-4 text-stripe-info animate-spin" />
          <span className="text-sm text-stripe-ink font-medium">
            {scannerStatus.phase || "正在同步市场数据..."}
          </span>
          <span className="text-xs text-stripe-ink-lighter ml-auto">
            {scannerStatus.progress}%
          </span>
        </div>
        <div className="w-full bg-stripe-border/30 rounded-full h-1.5">
          <div
            className="bg-stripe-info h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${scannerStatus.progress}%` }}
          />
        </div>
      </div>
    );
  }

  // 错误
  if (isError) {
    return (
      <div className="bg-red-50 border border-stripe-danger/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-stripe-danger" />
        <span className="text-sm text-stripe-danger">
          数据同步出错: {scannerStatus.error || "未知错误"}
        </span>
      </div>
    );
  }

  // 首次扫描刚完成 → 短暂显示完成提示（由 firstScanDone 控制自动隐藏）
  if (isDone && !firstScanDone) {
    return (
      <div className="bg-green-50 border border-stripe-success/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
        <CheckCircle2 className="w-4 h-4 text-stripe-success" />
        <span className="text-sm text-stripe-ink">
          数据同步完成，共发现 {scannerStatus.totalSignals} 个交易信号
        </span>
      </div>
    );
  }

  return null;
}
