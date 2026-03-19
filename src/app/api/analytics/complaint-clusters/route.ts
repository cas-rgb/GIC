import { NextRequest, NextResponse } from "next/server";

import { getComplaintClusters } from "@/lib/analytics/complaint-clusters";

export async function GET(request: NextRequest) {
  try {
    const province = request.nextUrl.searchParams.get("province");
    const days = Number(request.nextUrl.searchParams.get("days") ?? "30");

    const response = await getComplaintClusters(
      province && province !== "All Provinces" ? province : null,
      Number.isFinite(days) ? days : 30,
    );

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load complaint clusters",
      },
      { status: 500 },
    );
  }
}


