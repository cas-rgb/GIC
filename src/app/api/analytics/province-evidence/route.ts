import { NextRequest, NextResponse } from "next/server";

import { getProvinceEvidence } from "@/lib/analytics/province-evidence";

export async function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province");
  const topic = request.nextUrl.searchParams.get("topic");

  if (!province) {
    return NextResponse.json(
      { error: "province is required" },
      { status: 400 },
    );
  }

  try {
    const response = await getProvinceEvidence(province, topic);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load province evidence";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}


