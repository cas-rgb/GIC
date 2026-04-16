import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

async function main() {
  const { query } = require("../src/lib/db");
  const res = await query(`SELECT pg_get_constraintdef(oid) as cdef FROM pg_constraint WHERE conname = 'documents_doc_type_check';`);
  console.log(res.rows[0].cdef);
}

main().then(() => process.exit(0)).catch(console.error);
