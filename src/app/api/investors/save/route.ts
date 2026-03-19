import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let globalSavedRegistry: string[] = ["inv-1"]; // Pre-saved seed mock data

export async function GET() {
  return NextResponse.json({ saved: globalSavedRegistry });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, action } = body;

  if (action === "save") {
    if (!globalSavedRegistry.includes(id)) {
      globalSavedRegistry.push(id);
    }
  } else if (action === "unsave") {
    globalSavedRegistry = globalSavedRegistry.filter(i => i !== id);
  }

  return NextResponse.json({ success: true, saved: globalSavedRegistry });
}
