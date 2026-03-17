import { NextRequest, NextResponse } from "next/server";

import { getPlaceInfrastructureHistory } from "@/lib/analytics/place-infrastructure-history";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");
  const ward = request.nextUrl.searchParams.get("ward");

  if (!province) {
    return NextResponse.json({ error: "province is required" }, { status: 400 });
  }

  try {
    const response = await getPlaceInfrastructureHistory({
      province,
      municipality,
      ward,
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch place infrastructure history",
      },
      { status: 500 }
    );
  }
}
