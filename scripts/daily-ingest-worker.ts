import { spawn } from "child_process";

console.log("====================================================");
console.log("   GIC Intelligence: Autonomous Ingestion Worker    ");
console.log("====================================================");
console.log(`System Time: ${new Date().toISOString()}`);
console.log("Status: DEACTIVATED (Cost Audit Enforced)");
console.log("====================================================\n");
console.warn("⚠️ The autonomous cron ingestion loop has been permanently disabled to prevent excessive Gemini API and Firestore billing.");
console.warn("⚠️ Please dispatch scripts manually if required.");

process.exit(0);
