import { createClient } from './supabase/server';
import { getCurrentMonthStr } from './alegra';
import { getMetricsData, type MetricsData } from './metrics';

export interface InventarioRadarDataPoint {
  category: string;
  value: number;
}

export interface InventarioRadarChartData {
  companyName: string;
  chartData: InventarioRadarDataPoint[];
}

export interface ChartDataPoint {
  month: string;
  monthLabel: string;
  ventas: number;
}

export interface VentasChartData {
  companyName: string;
  chartData: ChartDataPoint[];
}

export async function getYearlyVentasData(): Promise<VentasChartData> {
  const currentMonth = getCurrentMonthStr();
  const currentYear = currentMonth.split('-')[0];
  const currentMonthNum = Number(currentMonth.split('-')[1]);

  // Fetch current month live data (also gives us the company name)
  const liveData = await getMetricsData();

  // Fetch all snapshots for the year
  const supabase = await createClient();
  const { data: snapshots } = await supabase
    .from('monthly_snapshots')
    .select('month, metrics_data')
    .gte('month', `${currentYear}-01`)
    .lt('month', currentMonth)
    .order('month', { ascending: true });

  const snapshotMap = new Map<string, number>();
  if (snapshots) {
    for (const snapshot of snapshots) {
      const metricsData = snapshot.metrics_data as MetricsData['metrics'];
      snapshotMap.set(snapshot.month, metricsData?.ventas?.value ?? 0);
    }
  }

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const chartData: ChartDataPoint[] = [];

  for (let m = 1; m <= currentMonthNum; m++) {
    const monthStr = `${currentYear}-${String(m).padStart(2, '0')}`;
    const isCurrentMonth = monthStr === currentMonth;

    chartData.push({
      month: monthStr,
      monthLabel: monthNames[m - 1],
      ventas: isCurrentMonth
        ? liveData.metrics.ventas.value
        : (snapshotMap.get(monthStr) ?? 0),
    });
  }

  return {
    companyName: liveData.companyName,
    chartData,
  };
}

export async function getInventarioRadarData(): Promise<InventarioRadarChartData> {
  const liveData = await getMetricsData();

  const categoryBreakdown = liveData.metrics.inventario.categoryBreakdown ?? [];

  return {
    companyName: liveData.companyName,
    chartData: categoryBreakdown.map((item) => ({
      category: item.category,
      value: item.value,
    })),
  };
}
