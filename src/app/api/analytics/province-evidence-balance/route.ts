import { NextRequest, NextResponse } from "next/server";

import { getProvinceEvidenceBalance } from "@/lib/analytics/province-evidence-balance";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const daysParam = request.nextUrl.searchParams.get("days");
  const days = daysParam ? Number(daysParam) : 30;

  if (!province) {
    return NextResponse.json({ error: "province is required" }, { status: 400 });
  }

  if (!Number.isFinite(days) || days <= 0) {
    return NextResponse.json(
      { error: "days must be a positive number" },
      { status: 400 }
    );
  }

  try {
    const response = await getProvinceEvidenceBalance(province, days);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch province evidence balance",
      },
      { status: 500 }
    );
  }
}
