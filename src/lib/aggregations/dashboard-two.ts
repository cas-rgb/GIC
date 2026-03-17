// src/lib/aggregations/dashboard-two.ts
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { ServicePressureCase } from '@/types/dashboard2';
import * as metrics from '../dashboard2-metrics';
import * as aggs from '../dashboard2-aggregations';
import { serializeData } from '../serialization';

export class DashboardTwoAggregator {
  static async getServicePressureData(province: string) {
    const q = query(
      collection(db, 'service_pressure_case'),
      where('province', '==', province)
    );
    
    const snap = await getDocs(q);
    const cases = snap.docs.map(d => d.data() as ServicePressureCase);
    
    // Core KPIs
    const activePressure = metrics.buildActiveServicePressure(province, cases);
    const topDomain = metrics.buildTopServicePressureDomain(province, cases);
    const trajectory = metrics.buildServicePressureTrajectory(province, cases);
    const exposedMuni = metrics.buildMostExposedMunicipality(province, cases);
    
    // Tables & Charts
    const breakdown = aggs.buildProvinceServicePressureBreakdown(province, cases);
    const trend = aggs.buildProvinceServicePressureTrend(province, cases);
    const exposure = aggs.buildProvinceMunicipalityExposure(province, cases);
    const matrix = aggs.buildProvinceStressEscalationMatrix(province, exposure);
    const recentCases = cases.sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || '')).slice(0, 10);
    
    return serializeData({
      province,
      kpis: {
        activePressure,
        topDomain,
        trajectory,
        exposedMuni,
        recentCases
      },
      visuals: {
        breakdown,
        trend,
        exposure,
        matrix
      }
    });
  }

  static async getRecentSignals(province: string, limitCount: number = 10) {
    const q = query(
      collection(db, 'service_pressure_case'),
      where('province', '==', province),
      orderBy('publishedDate', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map(d => d.data() as ServicePressureCase);
    return serializeData(results);
  }
}
