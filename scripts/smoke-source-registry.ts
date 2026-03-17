const { loadEnv } = require("./load-env-cli");

loadEnv();

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  const totals = await query(`
    select
      count(*)::int as source_count,
      count(*) filter (where verification_status = 'verified')::int as verified_count
    from source_registry
  `);

  const provinces = await query(`
    select province, count(*)::int as source_count
    from source_registry
    where province is not null
    group by province
    order by province asc
  `);

  console.log(
    JSON.stringify(
      {
        totals: totals.rows[0],
        provinces: provinces.rows,
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
