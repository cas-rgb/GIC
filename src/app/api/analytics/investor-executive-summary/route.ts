import { NextRequest, NextResponse } from "next/server";

import { getInvestorExecutiveSummary } from "@/lib/analytics/investor-executive-summary";

export async function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province");

  try {
    const summary = await getInvestorExecutiveSummary(province);
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load investor executive summary",
      },
      { status: 500 },
    );
  }
}


