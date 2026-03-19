import { NextRequest, NextResponse } from "next/server";

import { getInfrastructureProjectsSummary } from "@/lib/analytics/infrastructure-projects-summary";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const province = request.nextUrl.searchParams.get("province");
  const municipality = request.nextUrl.searchParams.get("municipality");
  const serviceDomain = request.nextUrl.searchParams.get("serviceDomain");

  try {
    const response = await getInfrastructureProjectsSummary(province, municipality, serviceDomain);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch infrastructure project summary",
      },
      { status: 500 },
    );
  }
}
