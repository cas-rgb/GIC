import { NextRequest, NextResponse } from "next/server";

import { getProvinceIssueHeatmap } from "@/lib/analytics/province-issue-heatmap";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const daysParam = request.nextUrl.searchParams.get("days");
  const serviceDomain = request.nextUrl.searchParams.get("serviceDomain");
  const days = daysParam ? Number(daysParam) : 30;

  if (!province) {
    return NextResponse.json({ error: "province is required" }, { status: 400 });
  }

  if (!Number.isFinite(days) || days <= 0) {
    return NextResponse.json(
      { error: "days must be a positive number" },
      { status: 400 }
    );
  }

  try {
    const response = await getProvinceIssueHeatmap(province, days, serviceDomain);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch province issue heatmap",
      },
      { status: 500 }
    );
  }
}
