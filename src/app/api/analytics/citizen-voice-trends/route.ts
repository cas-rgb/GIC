import { NextRequest, NextResponse } from "next/server";

import { getCitizenVoiceTrends } from "@/lib/analytics/citizen-voice-trends";

export async function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province");
  const days = Number(request.nextUrl.searchParams.get("days") ?? "30");

  try {
    const response = await getCitizenVoiceTrends(province, days);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load citizen voice trends";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
