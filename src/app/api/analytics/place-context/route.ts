import { NextRequest, NextResponse } from "next/server";

import { getPlaceContext } from "@/lib/analytics/place-context";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");

  if (!province) {
    return NextResponse.json({ error: "province is required" }, { status: 400 });
  }

  try {
    const response = await getPlaceContext({ province, municipality });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch place context",
      },
      { status: 500 }
    );
  }
}
