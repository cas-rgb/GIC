import { NextRequest, NextResponse } from "next/server";

import { getWardCouncillor } from "@/lib/analytics/ward-councillor";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");
  const ward = request.nextUrl.searchParams.get("ward");

  if (!province || !municipality || !ward) {
    return NextResponse.json(
      { error: "province, municipality, and ward are required" },
      { status: 400 }
    );
  }

  try {
    const response = await getWardCouncillor({
      province,
      municipality,
      ward,
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch ward councillor",
      },
      { status: 500 }
    );
  }
}
