const { loadEnv } = require("./load-env-cli");

loadEnv();

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");
  const sourceCountResult = await query(
    `select count(*)::text as count from sources`
  );
  const documentCountResult = await query(
    `select count(*)::text as count from documents`
  );
  const signalCountResult = await query(
    `select count(*)::text as count from signals`
  );
  const incidentCountResult = await query(
    `select count(*)::text as count from service_incidents`
  );
  const factCountResult = await query(
    `select count(*)::text as count from fact_service_pressure_daily`
  );

  console.log(
    JSON.stringify(
      {
        sources: Number(sourceCountResult.rows[0]?.count ?? 0),
        documents: Number(documentCountResult.rows[0]?.count ?? 0),
        signals: Number(signalCountResult.rows[0]?.count ?? 0),
        incidents: Number(incidentCountResult.rows[0]?.count ?? 0),
        factRows: Number(factCountResult.rows[0]?.count ?? 0),
      },
      null,
      2
    )
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
