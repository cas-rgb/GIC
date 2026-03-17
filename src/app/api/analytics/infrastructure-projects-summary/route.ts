import { NextRequest, NextResponse } from "next/server";

import { getInfrastructureProjectsSummary } from "@/lib/analytics/infrastructure-projects-summary";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");

  try {
    const response = await getInfrastructureProjectsSummary(province);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch infrastructure project summary",
      },
      { status: 500 }
    );
  }
}
