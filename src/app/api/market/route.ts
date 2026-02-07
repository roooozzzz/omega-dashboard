import { NextResponse } from "next/server";
import { getMarketIndices } from "@/lib/yahoo-finance";

export async function GET() {
  try {
    const indices = await getMarketIndices();

    const hasData = indices.sp500 || indices.vix;

    // 格式化市场数据
    const marketData = {
      sp500: indices.sp500
        ? {
            symbol: "SPX",
            name: "标普500",
            value: indices.sp500.regularMarketPrice,
            change: indices.sp500.regularMarketChange,
            changePercent: indices.sp500.regularMarketChangePercent,
          }
        : null,
      vix: indices.vix
        ? {
            symbol: "VIX",
            name: "恐慌指数",
            value: indices.vix.regularMarketPrice,
            change: indices.vix.regularMarketChange,
            changePercent: indices.vix.regularMarketChangePercent,
            level: getVIXLevel(indices.vix.regularMarketPrice),
          }
        : null,
      nasdaq: indices.nasdaq
        ? {
            symbol: "NDX",
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
      updatedAt: new Date().toISOString(),
      isLive: hasData,
    };

    return NextResponse.json({ success: true, data: marketData });
  } catch (error) {
    console.error("Market data API error:", error);

    return NextResponse.json(
      { success: false, error: "无法获取市场数据" },
      { status: 503 }
    );
  }
}

function getVIXLevel(value: number): string {
  if (value >= 30) return "极端恐慌";
  if (value >= 25) return "高波动";
  if (value >= 20) return "中波动";
  if (value >= 15) return "适中";
  return "低波动";
}
