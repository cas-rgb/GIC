import { NextRequest, NextResponse } from "next/server";

import { getInvestorOpportunityDetail } from "@/lib/analytics/investor-opportunity-detail";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 },
    );
  }

  try {
    const detail = await getInvestorOpportunityDetail(projectId);
    return NextResponse.json(detail);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load investor opportunity detail";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}


