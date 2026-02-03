import { NextResponse } from "next/server";
import { getMarketIndices } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";
export const revalidate = 60; // 每分钟刷新

export async function GET() {
  try {
    const indices = await getMarketIndices();

    const data = {
      sp500: indices.sp500
        ? {
            symbol: "SPX",
            name: "标普500指数",
            value: indices.sp500.regularMarketPrice,
            change: indices.sp500.regularMarketChange,
            changePercent: indices.sp500.regularMarketChangePercent,
          }
        : null,
      nasdaq: indices.nasdaq
        ? {
            symbol: "IXIC",
            name: "纳斯达克",
            value: indices.nasdaq.regularMarketPrice,
            change: indices.nasdaq.regularMarketChange,
            changePercent: indices.nasdaq.regularMarketChangePercent,
          }
        : null,
      dow: indices.dow
        ? {
            symbol: "DJI",
            name: "道琼斯",
            value: indices.dow.regularMarketPrice,
            change: indices.dow.regularMarketChange,
            changePercent: indices.dow.regularMarketChangePercent,
          }
        : null,
      vix: indices.vix
        ? {
            symbol: "VIX",
            name: "恐慌指数",
            value: indices.vix.regularMarketPrice,
            change: indices.vix.regularMarketChange,
            changePercent: indices.vix.regularMarketChangePercent,
            level: getVixLevel(indices.vix.regularMarketPrice),
          }
        : null,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Market API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}

function getVixLevel(value: number): string {
  if (value < 15) return "低波动";
  if (value < 20) return "适中";
  if (value < 30) return "高波动";
  return "极端恐慌";
}
