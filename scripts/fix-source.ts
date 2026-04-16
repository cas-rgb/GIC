import { query } from "../src/lib/db";

async function main() {
  try {
    const res = await query(
      "UPDATE sources SET name = 'SABC News' WHERE name = 'Demo Source' RETURNING *"
    );
    console.log("Updated rows:", res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
