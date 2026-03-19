import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  return NextResponse.json(result.rows);
}
