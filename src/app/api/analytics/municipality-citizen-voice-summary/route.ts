import { NextRequest, NextResponse } from "next/server";

import { getMunicipalityCitizenVoiceSummary } from "@/lib/analytics/municipality-citizen-voice-summary";

export async function GET(request: NextRequest) {
  try {
    const province = request.nextUrl.searchParams.get("province");
    const municipality = request.nextUrl.searchParams.get("municipality");
    const days = Number(request.nextUrl.searchParams.get("days") ?? "30");

    if (!province || !municipality) {
      return NextResponse.json(
        { error: "province and municipality are required" },
        { status: 400 },
      );
    }

    const response = await getMunicipalityCitizenVoiceSummary(
      province,
      municipality,
      Number.isFinite(days) ? days : 30,
    );

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load municipality citizen voice summary";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}


