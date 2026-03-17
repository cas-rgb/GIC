import { NextResponse } from "next/server";

import { getCitizenVoiceReadiness } from "@/lib/source-registry/citizen-voice-queries";

export async function GET() {
  try {
    const summary = await getCitizenVoiceReadiness();
    return NextResponse.json(summary);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load citizen voice readiness";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
