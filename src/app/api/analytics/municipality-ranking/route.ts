import { NextRequest, NextResponse } from "next/server";

import { getMunicipalityRanking } from "@/lib/analytics/municipality-ranking";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");

  if (!province) {
    return NextResponse.json(
      { error: "province is required" },
      { status: 400 }
    );
  }

  try {
    const response = await getMunicipalityRanking(province);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch municipality ranking",
      },
      { status: 500 }
    );
  }
}
