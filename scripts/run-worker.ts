const { loadEnv } = require("./load-env-cli");

loadEnv();

async function main(): Promise<void> {
  const { runWorkerOnce } = require("../src/lib/jobs/worker");
  let processed = true;

  while (processed) {
    processed = await runWorkerOnce();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
