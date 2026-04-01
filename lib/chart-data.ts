import { createClient } from './supabase/server';
import { getCurrentMonthStr } from './alegra';
import type { MetricsData } from './metrics';

export interface InventarioRadarDataPoint {
  category: string;
  value: number;
}

export interface InventarioRadarChartData {
  chartData: InventarioRadarDataPoint[];
}

export interface ChartDataPoint {
  month: string;
  monthLabel: string;
  ventas?: number;
  ventasCurrent?: number;
}

export interface VentasChartData {
  companyName: string;
  chartData: ChartDataPoint[];
}

interface SnapshotRow {
  month: string;
  metrics_data: MetricsData['metrics'];
}

/**
 * Carga todos los snapshots del año (incluyendo el mes actual) desde Supabase.
 * El snapshot del mes actual se guarda/actualiza cada vez que el dashboard principal carga.
 */
async function getYearlySnapshots(): Promise<SnapshotRow[]> {
  const currentMonth = getCurrentMonthStr();
  const currentYear = currentMonth.split('-')[0];

  const supabase = await createClient();
  const { data } = await supabase
    .from('monthly_snapshots')
    .select('month, metrics_data')
    .gte('month', `${currentYear}-01`)
    .lte('month', currentMonth)
    .order('month', { ascending: true });

  return (data ?? []) as SnapshotRow[];
}

export async function getChartsData(): Promise<{
  companyName: string;
  ventasData: VentasChartData;
  inventarioData: InventarioRadarChartData;
}> {
  const currentMonth = getCurrentMonthStr();
  const currentMonthNum = Number(currentMonth.split('-')[1]);

  const [snapshots, settingsResult] = await Promise.all([
    getYearlySnapshots(),
    createClient().then((sb) =>
      sb.from('settings').select('value').eq('key', 'company_name').single()
    ),
  ]);

  const companyName = settingsResult.data?.value?.trim() || 'BioTissue Colombia';

  const snapshotMap = new Map<string, MetricsData['metrics']>();
  for (const snapshot of snapshots) {
    snapshotMap.set(snapshot.month, snapshot.metrics_data);
  }

  // Ventas chart
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const currentYear = currentMonth.split('-')[0];
  const chartData: ChartDataPoint[] = [];

  for (let m = 1; m <= currentMonthNum; m++) {
    const monthStr = `${currentYear}-${String(m).padStart(2, '0')}`;
    const metrics = snapshotMap.get(monthStr);
    const value = metrics?.ventas?.value ?? 0;
    const isCurrentMonth = m === currentMonthNum;
    const isBridge = m === currentMonthNum - 1;

    chartData.push({
      month: monthStr,
      monthLabel: monthNames[m - 1],
      // Complete months get 'ventas'; bridge month gets both to connect the two areas
      ventas: isCurrentMonth ? undefined : value,
      ventasCurrent: isCurrentMonth || isBridge ? value : undefined,
    });
  }

  // Inventario radar chart (del snapshot más reciente)
  const currentSnapshot = snapshotMap.get(currentMonth);
  const categoryBreakdown = currentSnapshot?.inventario?.categoryBreakdown ?? [];

  return {
    companyName,
    ventasData: { companyName, chartData },
    inventarioData: {
      chartData: categoryBreakdown.map((item) => ({
        category: item.category,
        value: item.value,
      })),
    },
  };
}
