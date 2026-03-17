import { NextResponse } from "next/server";

import { getSourceRegistrySummary } from "@/lib/source-registry/queries";

export async function GET() {
  try {
    const summary = await getSourceRegistrySummary();
    return NextResponse.json(summary);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load source registry summary";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
