import { NextRequest, NextResponse } from "next/server";
import { getStockFullData } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: "Symbol is required" },
      { status: 400 }
    );
  }

  try {
    const data = await getStockFullData(symbol.toUpperCase());

    if (!data) {
      return NextResponse.json(
        { success: false, error: `Stock ${symbol} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`Stock API error for ${symbol}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
