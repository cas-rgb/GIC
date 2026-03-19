import { NextRequest, NextResponse } from "next/server";
import { generateExhaustiveLeadership } from "@/lib/analytics/generative-leadership";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const daysParam = request.nextUrl.searchParams.get("days");
  const days = daysParam ? Number(daysParam) : 30;

  if (!province) {
    return NextResponse.json({ error: "province is required" }, { status: 400 });
  }

  try {
    const response = await generateExhaustiveLeadership(province, days);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
        error: error instanceof Error ? error.message : "Failed to fetch generative leadership sentiment",
      },
      { status: 500 }
    );
  }
}


