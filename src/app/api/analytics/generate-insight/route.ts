import { NextRequest, NextResponse } from "next/server";
import { getStateOfProvinceMetrics } from "@/lib/analytics/state-of-province";
import { generateControlledInsight } from "@/lib/analytics/insight-generator";

// Temporary mapping until all dashboard metrics are fully extracted into shared functions
export async function GET(request: NextRequest): Promise<NextResponse> {
  const lens = request.nextUrl.searchParams.get("lens") || "province";
  const province = request.nextUrl.searchParams.get("province") || "Gauteng";
  const daysParam = request.nextUrl.searchParams.get("days");
  const days = daysParam ? Number(daysParam) : 30;

  try {
    let metricsData: any = {};

    if (lens === "province") {
      // Fetch the strict metric grid for the province
      metricsData = await getStateOfProvinceMetrics(province, days);
    } else {
      return NextResponse.json(
        { error: `Lens '${lens}' is not yet supported for insight generation.` },
        { status: 400 }
      );
    }

    // Pass the strict metrics grid to the governed AI translator
    const insight = await generateControlledInsight(metricsData);

    return NextResponse.json({
      lens,
      province,
      days,
      insight,
      trace_evidence: metricsData.trace, // Include the trace so the frontend knows what the AI read
      metrics: metricsData               // Pass raw numerical averages down to the UI charts
    });

  } catch (error) {
    console.error("Insight generation API failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate AI insight",
      },
      { status: 500 }
    );
  }
}


