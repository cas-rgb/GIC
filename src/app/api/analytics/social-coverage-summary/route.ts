import { NextResponse } from "next/server";

import { getSocialCoverageSummary } from "@/lib/source-registry/social-queries";

export async function GET() {
  try {
    const summary = await getSocialCoverageSummary();
    return NextResponse.json(summary);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load social coverage summary";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
