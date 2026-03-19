import { getStateOfProvinceMetrics } from '../src/lib/analytics/state-of-province';

async function main() {
  try {
    const res = await getStateOfProvinceMetrics('Gauteng', 30);
    console.log(JSON.stringify(res, null, 2));
  } catch (error) {
    console.error('FAILED TO FETCH:', error);
  }
}

main();
