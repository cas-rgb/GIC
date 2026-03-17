// src/lib/dashboard2-chart-configs.ts
import { 
  ProvinceServicePressureBreakdownRow, 
  ProvinceServicePressureTrendRow,
  ProvinceMunicipalityExposureRow,
  ProvinceStressEscalationMatrixRow
} from '@/types/dashboard2';

export function getPressureBreakdownConfig(data: ProvinceServicePressureBreakdownRow[]) {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '0', left: 'center', textStyle: { color: '#64748b', fontSize: 10, fontWeight: 'bold' } },
    series: [
      {
        name: 'Service Domain',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
        data: data.map(d => ({
          value: d.pressureCaseCount,
          name: d.serviceDomain,
          itemStyle: {
            color: 
              d.serviceDomain === 'Water Infrastructure' ? '#0ea5e9' :
              d.serviceDomain === 'Electricity Supply' ? '#f59e0b' :
              d.serviceDomain === 'Roads and Transport' ? '#6366f1' :
              d.serviceDomain === 'Healthcare' ? '#ec4899' :
              d.serviceDomain === 'Waste Management' ? '#10b981' : '#94a3b8'
          }
        }))
      }
    ]
  };
}

export function getPressureTrendConfig(data: ProvinceServicePressureTrendRow[]) {
  const dates = Array.from(new Set(data.map(d => d.reportingDate))).sort();
  const domains = Array.from(new Set(data.map(d => d.serviceDomain)));

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: domains.map(domain => ({
      name: domain,
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: dates.map(date => {
        const row = data.find(d => d.reportingDate === date && d.serviceDomain === domain);
        return row ? row.pressureCaseCount : 0;
      })
    }))
  };
}

export function getExposureRankingConfig(data: ProvinceMunicipalityExposureRow[]) {
  const topData = data.slice(0, 10).reverse();
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: {
      type: 'category',
      data: topData.map(d => d.municipality),
      axisLabel: { color: '#475569', fontSize: 10, fontWeight: 'black' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: 'Pressure Cases',
        type: 'bar',
        data: topData.map(d => d.pressureCaseCount),
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: (params: any) => {
            const val = params.data;
            if (val > 15) return '#e11d48';
            if (val > 8) return '#f59e0b';
            return '#3b82f6';
          }
        },
        label: { show: true, position: 'right', fontSize: 10, fontWeight: 'bold', color: '#64748b' }
      }
    ]
  };
}

export function getStressMatrixConfig(data: ProvinceStressEscalationMatrixRow[]) {
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const d = params.data;
        return `<b>${d.name}</b><br/>Pressure Score: ${d.value[0]}<br/>Escalation Score: ${d.value[1]}<br/>Status: ${d.status}`;
      }
    },
    grid: { left: '8%', right: '10%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      name: 'Pressure',
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    yAxis: {
      name: 'Acceleration',
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    series: [
      {
        type: 'scatter',
        symbolSize: (data: any) => Math.max(10, data[2] * 3),
        data: data.map(d => ({
          name: d.municipality,
          value: [d.currentPressureScore || 0, d.recentEscalationScore || 0, d.severityWeight || 1],
          status: d.stressStatus,
          itemStyle: {
            color: 
              d.stressStatus === 'Acute Flashpoint' ? '#e11d48' :
              d.stressStatus === 'Escalating Risk' ? '#f59e0b' :
              d.stressStatus === 'Chronic Pressure' ? '#3b82f6' : '#94a3b8',
            opacity: 0.8,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          }
        })),
        label: {
            show: true,
            formatter: '{b}',
            position: 'top',
            fontSize: 8,
            fontWeight: 'bold',
            color: '#64748b'
        }
      }
    ]
  };
}
