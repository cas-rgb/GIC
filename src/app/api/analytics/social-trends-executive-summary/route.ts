import { NextRequest, NextResponse } from "next/server";

import { getSocialTrendsExecutiveSummary } from "@/lib/analytics/social-trends-executive-summary";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province");
    const daysParam = searchParams.get("days");
    const days = daysParam ? Number(daysParam) : 30;

    const response = await getSocialTrendsExecutiveSummary(
      province && province !== "All Provinces" ? province : null,
      Number.isFinite(days) ? days : 30
    );

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load social trends executive summary",
      },
      { status: 500 }
    );
  }
}
