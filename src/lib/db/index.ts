import { QueryResult, QueryResultRow } from "pg";

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  console.log("Mocking query due to Cloud SQL decoupling logic:", text.substring(0, 50) + "...");
  
  // Provide basic structural fallback so charts don't completely throw TypeError
  // Returns empty rows. The Next.js frontend should simply show "No Data" or gracefully render empty charts.
  return {
    rows: [] as unknown as T[],
    command: "SELECT",
    rowCount: 0,
    oid: 0,
    fields: []
  };
}
