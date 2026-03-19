import { NextRequest, NextResponse } from "next/server";

import { getSourceReliability } from "@/lib/analytics/source-reliability";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");

  if (!province) {
    return NextResponse.json(
      { error: "province is required" },
      { status: 400 },
    );
  }

  try {
    const response = await getSourceReliability(province);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch source reliability",
      },
      { status: 500 },
    );
  }
}


