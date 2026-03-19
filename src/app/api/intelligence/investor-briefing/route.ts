import { NextRequest, NextResponse } from "next/server";

import { getInvestorBriefing } from "@/lib/intelligence/investor-briefing";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");
  const daysParam = request.nextUrl.searchParams.get("days");
  const days = daysParam ? Number(daysParam) : 30;

  if (!Number.isFinite(days) || days <= 0) {
    return NextResponse.json(
      { error: "days must be a positive number" },
      { status: 400 },
    );
  }

  try {
    const response = await getInvestorBriefing(province, municipality, days);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch investor briefing",
      },
      { status: 500 },
    );
  }
}
