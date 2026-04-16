import { NextResponse } from 'next/server';
import { query } from '@/lib/db/index';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query(`
      SELECT COUNT(id) as count 
      FROM signals 
      WHERE created_at > NOW() - INTERVAL '1 day'
    `);
    const count = parseInt(res.rows[0]?.count || "0");
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Pulse Check Error:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
