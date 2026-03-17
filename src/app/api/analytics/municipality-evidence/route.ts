import { NextRequest, NextResponse } from "next/server";

import { getMunicipalityEvidence } from "@/lib/analytics/municipality-evidence";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");
  const topic = request.nextUrl.searchParams.get("topic");
  const ward = request.nextUrl.searchParams.get("ward");

  if (!province) {
    return NextResponse.json({ error: "province is required" }, { status: 400 });
  }

  if (!municipality) {
    return NextResponse.json(
      { error: "municipality is required" },
      { status: 400 }
    );
  }

  try {
    const response = await getMunicipalityEvidence(province, municipality, topic, ward);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch municipality evidence",
      },
      { status: 500 }
    );
  }
}
