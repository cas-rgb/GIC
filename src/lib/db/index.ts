import { Pool, QueryResult, QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __gicPgPool: Pool | undefined;
}

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  return databaseUrl;
}

export const pool =
  global.__gicPgPool ??
  new Pool({
    connectionString: getDatabaseUrl(),
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__gicPgPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  try {
    return await pool.query<T>(text, params);
  } catch (error: any) {
    if (
      error.code === "ECONNREFUSED" || 
      error.code === "28P01" || 
      error.code === "3D000" ||
      (error.message && error.message.includes("connect"))
    ) {
      throw new Error("Offline Maintenance Mode: Database connection unavailable.");
    }
    throw error;
  }
}
