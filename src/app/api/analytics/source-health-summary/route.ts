import { NextRequest, NextResponse } from "next/server";

import { getSourceHealthSummary } from "@/lib/source-registry/health-queries";

export async function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province");

  try {
    const summary = await getSourceHealthSummary(province);
    return NextResponse.json(summary);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load source health summary";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}


