import { NextRequest, NextResponse } from "next/server";

import { getMunicipalityComparison } from "@/lib/analytics/municipality-comparison";

export async function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province");
  const days = Number(request.nextUrl.searchParams.get("days") ?? "30");

  if (!province) {
    return NextResponse.json({ error: "province is required" }, { status: 400 });
  }

  try {
    const response = await getMunicipalityComparison(province, days);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load municipality comparison";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
