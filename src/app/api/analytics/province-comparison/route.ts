import { NextRequest, NextResponse } from "next/server";

import { getProvinceComparison } from "@/lib/analytics/province-comparison";

export async function GET(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days") ?? "30");

  try {
    const response = await getProvinceComparison(days);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load province comparison";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
