import { NextRequest, NextResponse } from "next/server";

import { getWardCoverage } from "@/lib/analytics/ward-coverage";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");

  if (!province || !municipality) {
    return NextResponse.json(
      { error: "province and municipality are required" },
      { status: 400 }
    );
  }

  try {
    const response = await getWardCoverage(province, municipality);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch ward coverage",
      },
      { status: 500 }
    );
  }
}
