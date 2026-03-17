import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

function municipalMoneyProvinceParam(province: string): string {
  if (province === "KwaZulu-Natal") {
    return "Kwazulu-Natal";
  }

  return province;
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  for (const province of PROVINCES) {
    const name = `Municipal Money Infrastructure Projects ${province}`;
    const provinceParam = encodeURIComponent(municipalMoneyProvinceParam(province));
    const baseUrl = `https://municipalmoney.gov.za/infrastructure/projects/?province=${provinceParam}`;

    const existing = await query(
      `
        select id
        from sources
        where name = $1
        limit 1
      `,
      [name]
    );

    if (existing.rows[0]) {
      await query(
        `
          update sources
          set
            source_type = 'treasury',
            base_url = $2,
            reliability_score = 0.950,
            active = true,
            updated_at = now()
          where id = $1
        `,
        [existing.rows[0].id, baseUrl]
      );
      continue;
    }

    await query(
      `
        insert into sources (name, source_type, base_url, reliability_score, active)
        values ($1, 'treasury', $2, 0.950, true)
      `,
      [name, baseUrl]
    );
  }

  console.log(JSON.stringify({ seeded: PROVINCES.length }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
