import { config } from "dotenv";
config({ path: "C:\\Users\\Dell\\Desktop\\Sparc Innovation\\gic-app\\.env.local" });

async function bumpDates() {
  const { query } = await import("../src/lib/db");
  console.log("Starting Investor Profiling forward-scaling to 2025-2027 horizon...");
  
  try {
    // Shift the primary infrastructure_projects metadata
    console.log("Shifting infrastructure_projects latest_budget_year...");
    await query(`
      update infrastructure_projects 
      set latest_budget_year = replace(latest_budget_year, '2022', '2025');
    `);
    await query(`
      update infrastructure_projects 
      set latest_budget_year = replace(latest_budget_year, '2023', '2026');
    `);
    await query(`
      update infrastructure_projects 
      set latest_budget_year = replace(latest_budget_year, '2024', '2027');
    `);

    // Shift the project_funding_sources timeline
    console.log("Shifting project_funding_sources financial_year...");
    await query(`
      update project_funding_sources 
      set financial_year = replace(financial_year, '2021/22', '2024/25');
    `);
    await query(`
      update project_funding_sources 
      set financial_year = replace(financial_year, '2022/23', '2025/26');
    `);
    await query(`
      update project_funding_sources 
      set financial_year = replace(financial_year, '2023/24', '2026/27');
    `);
    await query(`
      update project_funding_sources 
      set financial_year = replace(financial_year, '2024/25', '2027/28');
    `);

    console.log("Dates successfully escalated to the 2025/2026/2027 strategic horizon.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

bumpDates();
