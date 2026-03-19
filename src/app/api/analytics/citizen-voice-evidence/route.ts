import { NextRequest, NextResponse } from "next/server";

import { getCitizenVoiceEvidence } from "@/lib/analytics/citizen-voice-evidence";

export async function GET(request: NextRequest) {
  try {
    const province = request.nextUrl.searchParams.get("province");
    const municipality = request.nextUrl.searchParams.get("municipality");
    const ward = request.nextUrl.searchParams.get("ward");
    const issueFamily = request.nextUrl.searchParams.get("issueFamily");
    const sourceType = request.nextUrl.searchParams.get("sourceType");
    const days = Number(request.nextUrl.searchParams.get("days") ?? "30");

    const response = await getCitizenVoiceEvidence(
      province,
      municipality,
      ward,
      issueFamily,
      sourceType,
      Number.isFinite(days) ? days : 30,
    );

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load citizen voice evidence";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}


