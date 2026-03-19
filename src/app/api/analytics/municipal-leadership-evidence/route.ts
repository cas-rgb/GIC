import { NextRequest, NextResponse } from "next/server";

import { getMunicipalLeadershipEvidence } from "@/lib/analytics/municipal-leadership-evidence";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");
  const leaderName = request.nextUrl.searchParams.get("leaderName");
  const office = request.nextUrl.searchParams.get("office");
  const daysParam = request.nextUrl.searchParams.get("days");
  const days = daysParam ? Number(daysParam) : 30;

  if (!province) {
    return NextResponse.json(
      { error: "province is required" },
      { status: 400 },
    );
  }

  if (!municipality) {
    return NextResponse.json(
      { error: "municipality is required" },
      { status: 400 },
    );
  }

  if (!Number.isFinite(days) || days <= 0) {
    return NextResponse.json(
      { error: "days must be a positive number" },
      { status: 400 },
    );
  }

  try {
    const response = await getMunicipalLeadershipEvidence(
      province,
      municipality,
      leaderName,
      office,
      days,
    );
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch municipal leadership evidence",
      },
      { status: 500 },
    );
  }
}


