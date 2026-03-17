import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  const connectorSeeds = [
    {
      id: "media-news24",
      connectorType: "rss",
      connectorUrl:
        "https://feeds.24.com/articles/news24/SouthAfrica/rss",
    },
    {
      id: "media-sabc-news",
      connectorType: "rss",
      connectorUrl:
        "https://www.sabcnews.com/sabcnews/feed/",
    },
    {
      id: "media-groundup",
      connectorType: "rss",
      connectorUrl:
        "https://groundup.org.za/feed/",
    },
    {
      id: "media-daily-maverick",
      connectorType: "rss",
      connectorUrl:
        "https://www.dailymaverick.co.za/feed/",
    },
    {
      id: "media-mail-and-guardian",
      connectorType: "rss",
      connectorUrl:
        "https://mg.co.za/feed/",
    },
    {
      id: "media-iol",
      connectorType: "rss",
      connectorUrl:
        "https://www.iol.co.za/feed/",
    },
    {
      id: "civic-corruption-watch",
      connectorType: "rss",
      connectorUrl:
        "https://www.corruptionwatch.org.za/feed/",
    },
    {
      id: "civic-outa",
      connectorType: "rss",
      connectorUrl:
        "https://www.outa.co.za/feed/",
    },
    {
      id: "watchdog-accountability-sa",
      connectorType: "rss",
      connectorUrl:
        "https://accountabilitysa.org/feed/",
    },
  ];

  for (const seed of connectorSeeds) {
    await query(
      `
        update source_registry
        set
          connector_type = $2,
          connector_url = $3,
          ingestion_enabled = true,
          updated_at = now()
        where id = $1
      `,
      [seed.id, seed.connectorType, seed.connectorUrl]
    );
  }

  console.log(`activated ${connectorSeeds.length} registry connectors`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
