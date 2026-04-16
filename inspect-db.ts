import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { query } from "./src/lib/db";

async function run() {
    const res = await query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'documents'");
    console.log(res.rows);
    process.exit(0);
}
run();
