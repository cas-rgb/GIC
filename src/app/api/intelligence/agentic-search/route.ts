import { NextResponse } from "next/server";
import { executeDeepInvestigation } from "@/ai-layer/agentic-investigator";
import { validateRateLimit } from "@/lib/rate-limit";

// Maximum execution time for Agentic Loops (can take up to 90 seconds if deep recursion occurs)
export const maxDuration = 120; // 2 Minutes
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Heavy Rate Limiting to prevent massive token burn
  const ip = req.headers.get("x-forwarded-for") || "anonymous_ip";
  const rateLimit = validateRateLimit(ip, 3, 300000); // Only 3 Agentic Searches every 5 minutes per user
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Agentic Search limits exceeded. Please wait." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { targetEntity } = body;

    if (!targetEntity) {
      return NextResponse.json({ error: "Target Entity is required for Agentic Search." }, { status: 400 });
    }

    // Fire the autonomous agent with a maximum of 3 recursive search loops to prevent infinite cost
    const investigationResult = await executeDeepInvestigation(targetEntity, 3);

    return NextResponse.json({
        status: "complete",
        target: investigationResult.targetEntity,
        recursiveLoops: investigationResult.loopsExecuted,
        depth: "Maximum",
        dossier: investigationResult.dossier,
        timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Agentic Search Fatal Error:", error);
    return NextResponse.json({ error: "Internal Agentic Failure: " + error.message }, { status: 500 });
  }
}
