import { NextRequest, NextResponse } from "next/server";

import { getMunicipalityIssueMatrix } from "@/lib/analytics/municipality-issue-matrix";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");
  const daysParam = request.nextUrl.searchParams.get("days");
  const serviceDomain = request.nextUrl.searchParams.get("serviceDomain");
  const days = daysParam ? Number(daysParam) : 30;

  if (!province || !municipality) {
    return NextResponse.json(
      { error: "province and municipality are required" },
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
    const response = await getMunicipalityIssueMatrix(
      province,
      municipality,
      days,
      serviceDomain,
    );
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch municipality issue matrix",
      },
      { status: 500 },
    );
  }
}


