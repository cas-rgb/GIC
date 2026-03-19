import { NextResponse } from "next/server";

import { getConnectorReadyRegistrySources } from "@/lib/source-registry/connector-queries";

export async function GET() {
  try {
    const rows = await getConnectorReadyRegistrySources();

    return NextResponse.json({
      sourceCount: rows.length,
      rows,
      trace: {
        table: "source_registry",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load connector-ready sources";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}


