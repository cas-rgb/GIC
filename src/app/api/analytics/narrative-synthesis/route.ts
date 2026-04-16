import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { validateRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous_ip";
    const rateLimit = validateRateLimit(ip, 30, 60000); // 30 requests per minute
    if (!rateLimit.success) {
      return NextResponse.json({ error: rateLimit.message }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const lens = searchParams.get("lens");
    const province = searchParams.get("province") || "Gauteng";
    const municipality = searchParams.get("municipality");
    const leader = searchParams.get("leader");
    const limit = Number(searchParams.get("limit")) || 50;

    if (!lens) {
      return NextResponse.json({ error: "Lens must be specified ('social', 'municipality', 'leadership')" }, { status: 400 });
    }

    let sql = `
      select 
        who_involved, what_happened, why_it_happened, 
        how_resolved_or_current, when_timeline, source_evidence
      from ai_narrative_synthesis
      where lens = $1 and province = $2
    `;
    const params: any[] = [lens, province];
    let paramIndex = 3;

    if (municipality) {
      sql += ` and municipality = $${paramIndex++}`;
      params.push(municipality);
    }

    if (leader) {
      sql += ` and leader_name = $${paramIndex++}`;
      params.push(leader);
    }

    sql += ` order by created_at desc limit $${paramIndex}`;
    params.push(limit);

    const result = await query(sql, params);

    return NextResponse.json({ events: result.rows });
  } catch (error) {
    console.error("Failed to fetch narrative synthesis:", error);
    return NextResponse.json(
      { error: "Internal Server Error", events: [] },
      { status: 500 }
    );
  }
}


