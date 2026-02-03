import { NextResponse } from "next/server";
import { getYahooQuote, calculateRSRating, calculateRSI } from "@/lib/yahoo-finance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: "Missing symbol parameter" },
      { status: 400 }
    );
  }

  try {
    // 并行获取所有数据
    const [quotes, rsData, rsiData] = await Promise.all([
      getYahooQuote([symbol.toUpperCase()]),
      calculateRSRating(symbol.toUpperCase()),
      calculateRSI(symbol.toUpperCase()),
    ]);

    const quote = quotes[0];

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "Stock not found" },
        { status: 404 }
      );
    }

    const data = {
      symbol: quote.symbol,
      name: quote.shortName || quote.longName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      pe: quote.trailingPE,
      
      // 技术指标
      rs: rsData,
      rsi: rsiData,
      
      // 52 周范围
      week52High: quote.fiftyTwoWeekHigh,
      week52Low: quote.fiftyTwoWeekLow,
      
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Stock API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
