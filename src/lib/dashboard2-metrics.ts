// src/lib/dashboard2-metrics.ts
import { GovernedMetric } from '@/lib/reporting-schema';
import { ServicePressureCase } from '@/types/dashboard2';
import { toConfidence, emptyStateFor } from './governance/confidence';

function provinceCases(province: string, rows: ServicePressureCase[]) {
  return rows.filter(
    r =>
      r.province === province &&
      r.citizenPressureIndicator === true &&
      r.serviceFailureIndicator === true
  );
}

export function buildActiveServicePressure(
  province: string,
  rows: ServicePressureCase[]
): GovernedMetric<number> {
  const filtered = provinceCases(province, rows);
  const count = filtered.length;
  const rating = toConfidence(count);

  return {
    id: 'gic.ops.active_pressure',
    label: 'Active Service Pressure',
    value: rating === 'INSUFFICIENT' ? null : count,
    confidence: count / 20 > 1 ? 1 : count / 20,
    rating,
    trace: [{
        table: 'service_pressure_case',
        query: `province == ${province}`,
        sourceCount: count,
        timestamp: new Date().toISOString()
    }],
    governanceNote: emptyStateFor(rating)
  };
}

export function buildTopServicePressureDomain(
  province: string,
  rows: ServicePressureCase[]
): GovernedMetric<{ domainName: string; shareOfPressurePercentage: number }> {
  const filtered = provinceCases(province, rows);

  if (filtered.length < 3) {
    return {
      id: 'gic.ops.top_domain',
      label: 'Top Pressure Domain',
      value: null,
      confidence: 0,
      rating: 'INSUFFICIENT',
      trace: [],
      governanceNote: 'Insufficient Data'
    };
  }

  const counts = new Map<string, number>();
  for (const row of filtered) {
    counts.set(row.serviceDomain, (counts.get(row.serviceDomain) || 0) + 1);
  }

  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const [domainName, domainCount] = entries[0];
  const rating = toConfidence(filtered.length);

  return {
    id: 'gic.ops.top_domain',
    label: 'Top Pressure Domain',
    value: {
      domainName,
      shareOfPressurePercentage: Number(((domainCount / filtered.length) * 100).toFixed(1))
    },
    confidence: filtered.length / 20 > 1 ? 1 : filtered.length / 20,
    rating,
    trace: [{
        table: 'service_pressure_case',
        query: `groupby service_domain for province ${province}`,
        sourceCount: filtered.length,
        timestamp: new Date().toISOString()
    }]
  };
}

export function buildServicePressureTrajectory(
  province: string,
  rows: ServicePressureCase[]
): GovernedMetric<{ value: number; direction: 'rising' | 'stable' | 'easing' }> {
  const filtered = provinceCases(province, rows).filter(r => r.publishedDate);

  if (filtered.length < 8) {
    return {
      id: 'gic.ops.trajectory',
      label: 'Pressure Trajectory',
      value: null,
      confidence: 0,
      rating: 'INSUFFICIENT',
      trace: [],
      governanceNote: 'Insufficient Data'
    };
  }

  const byDate = new Map<string, number>();
  for (const row of filtered) {
    const day = row.publishedDate!.slice(0, 10);
    byDate.set(day, (byDate.get(day) || 0) + 1);
  }

  const sortedDays = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  if (sortedDays.length < 4) {
    return {
      id: 'gic.ops.trajectory',
      label: 'Pressure Trajectory',
      value: null,
      confidence: 0.3,
      rating: 'LOW',
      trace: [],
      governanceNote: 'Partial Coverage'
    };
  }

  const counts = sortedDays.map(([, count]) => count);
  const current = counts.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, counts.length);
  const baseline = counts.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, counts.length - 3);
  const ratio = baseline === 0 ? current : current / baseline;

  let direction: 'rising' | 'stable' | 'easing' = 'stable';
  if (ratio > 1.2) direction = 'rising';
  if (ratio < 0.9) direction = 'easing';

  return {
    id: 'gic.ops.trajectory',
    label: 'Pressure Trajectory',
    value: { value: Number(ratio.toFixed(2)), direction },
    confidence: filtered.length / 20 > 1 ? 1 : filtered.length / 20,
    rating: toConfidence(filtered.length),
    trace: [{
        table: 'service_pressure_case',
        query: `trend analysis for ${province}`,
        sourceCount: filtered.length,
        timestamp: new Date().toISOString()
    }]
  };
}

export function buildMostExposedMunicipality(
  province: string,
  rows: ServicePressureCase[]
): GovernedMetric<{ municipalityName: string; issueCount: number }> {
  const filtered = provinceCases(province, rows).filter(r => r.municipality);

  if (filtered.length < 3) {
    return {
      id: 'gic.ops.exposed_muni',
      label: 'Most Exposed Municipality',
      value: null,
      confidence: 0.2,
      rating: 'LOW',
      trace: [],
      governanceNote: 'Partial Coverage'
    };
  }

  const counts = new Map<string, number>();
  for (const row of filtered) {
    counts.set(row.municipality!, (counts.get(row.municipality!) || 0) + 1);
  }

  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const [municipalityName, issueCount] = entries[0];

  return {
    id: 'gic.ops.exposed_muni',
    label: 'Most Exposed Municipality',
    value: { municipalityName, issueCount },
    confidence: filtered.length / 20 > 1 ? 1 : filtered.length / 20,
    rating: toConfidence(filtered.length),
    trace: [{
        table: 'service_pressure_case',
        query: `municipality distribution for ${province}`,
        sourceCount: filtered.length,
        timestamp: new Date().toISOString()
    }]
  };
}
