"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { signalsApi, ScannerStatus } from "@/lib/api";

interface UseScannerStatusResult {
  scannerStatus: ScannerStatus | null;
  loading: boolean;
  /** 首次扫描是否已完成（status 曾为 done） */
  firstScanDone: boolean;
}

export function useScannerStatus(): UseScannerStatusResult {
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstScanDone, setFirstScanDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const status = await signalsApi.getScannerStatus();
      setScannerStatus(status);

      if (status.status === "done" || status.totalSignals > 0) {
        setFirstScanDone(true);
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // 扫描进行中时每 2 秒轮询，完成后每 30 秒
    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus]);

  // 当首次扫描完成后，降低轮询频率
  useEffect(() => {
    if (firstScanDone && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(fetchStatus, 30000);
    }
  }, [firstScanDone, fetchStatus]);

  return { scannerStatus, loading, firstScanDone };
}
