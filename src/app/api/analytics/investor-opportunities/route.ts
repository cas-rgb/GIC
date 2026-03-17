import { NextRequest, NextResponse } from "next/server";

import { getInvestorOpportunities } from "@/lib/analytics/investor-opportunities";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 12;

  if (!Number.isFinite(limit) || limit <= 0 || limit > 50) {
    return NextResponse.json(
      { error: "limit must be between 1 and 50" },
      { status: 400 }
    );
  }

  try {
    const response = await getInvestorOpportunities(province, municipality, limit);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch investor opportunities",
      },
      { status: 500 }
    );
  }
}
