import { getAlegraMetricsSnapshot, hasAlegraCredentials } from './alegra';
import { getCustomerDiscountRules } from './customer-discounts';
import { createClient } from './supabase/server';

/**
 * Tipos para las métricas
 */
export interface BreakdownItem {
  name: string;
  value: number;
  date?: string;
  quantity?: number;
  unitCost?: number;
}

export interface Metric {
  title: string;
  value: number;
  target: number;
  showProgressBar: boolean;
  unit?: string;
  breakdown?: BreakdownItem[];
}

export interface MetricsData {
  companyName: string;
  lastUpdated?: string;
  metrics: {
    ventas: Metric;
    recaudo: Metric;
    inventario: Metric;
    margen: Metric;
    caja: Metric;
  };
  fileLastModified?: string;
}

type MetricKey = keyof MetricsData['metrics'];

interface SettingRow {
  key: string;
  value: string;
  updated_at: string | null;
}

interface MetricRow {
  key: MetricKey;
  title: string;
  value: number | string;
  target: number | string;
  unit: string | null;
  show_progress_bar: boolean;
  updated_at: string | null;
}

function parseNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
  }

  return 0;
}

function createDefaultMetricsData(): MetricsData {
  return {
    companyName: 'BioTissue Colombia',
    metrics: {
      ventas: {
        title: 'Ventas',
        value: 0,
        target: 46000000,
        showProgressBar: true,
        breakdown: [],
      },
      recaudo: {
        title: 'Recaudo',
        value: 0,
        target: 46000000,
        showProgressBar: true,
        breakdown: [],
      },
      inventario: {
        title: 'Inventario',
        value: 0,
        target: 26000000,
        showProgressBar: true,
        breakdown: [],
      },
      margen: {
        title: 'Margen',
        value: 25,
        target: 30,
        showProgressBar: true,
        unit: '%',
        breakdown: [],
      },
      caja: {
        title: 'Caja',
        value: 8674,
        target: 36000000,
        showProgressBar: true,
        breakdown: [],
      },
    },
  };
}

function getLatestUpdatedAt(
  timestamps: Array<string | null | undefined>
): string | undefined {
  let latestDate: Date | null = null;

  for (const timestamp of timestamps) {
    if (!timestamp) {
      continue;
    }

    const parsed = new Date(timestamp);

    if (Number.isNaN(parsed.getTime())) {
      continue;
    }

    if (!latestDate || parsed > latestDate) {
      latestDate = parsed;
    }
  }

  return latestDate?.toISOString();
}

async function getMetricsDataFromSupabase(): Promise<MetricsData> {
  const fallbackData = createDefaultMetricsData();

  try {
    const supabase = await createClient();
    const [settingsResponse, metricsResponse] = await Promise.all([
      supabase.from('settings').select('key, value, updated_at'),
      supabase
        .from('metrics')
        .select('key, title, value, target, unit, show_progress_bar, updated_at')
        .order('sort_order', { ascending: true }),
    ]);

    if (settingsResponse.error) {
      console.error(
        '⚠️ No fue posible cargar settings desde Supabase:',
        settingsResponse.error
      );
      return fallbackData;
    }

    if (metricsResponse.error) {
      console.error(
        '⚠️ No fue posible cargar metrics desde Supabase:',
        metricsResponse.error
      );
      return fallbackData;
    }

    const data = createDefaultMetricsData();
    const settings = (settingsResponse.data ?? []) as SettingRow[];
    const metrics = (metricsResponse.data ?? []) as MetricRow[];

    const companyName = settings.find((setting) => setting.key === 'company_name')?.value;

    if (companyName?.trim()) {
      data.companyName = companyName.trim();
    }

    for (const metric of metrics) {
      const currentMetric = data.metrics[metric.key];

      data.metrics[metric.key] = {
        ...currentMetric,
        title: metric.title?.trim() || currentMetric.title,
        value: parseNumber(metric.value),
        target: parseNumber(metric.target),
        showProgressBar: metric.show_progress_bar,
        unit: metric.unit ?? undefined,
        breakdown: [],
      };
    }

    const latestUpdatedAt = getLatestUpdatedAt([
      ...settings.map((setting) => setting.updated_at),
      ...metrics.map((metric) => metric.updated_at),
    ]);

    data.lastUpdated = latestUpdatedAt;
    data.fileLastModified = latestUpdatedAt ?? new Date().toISOString();

    console.log('✅ Datos de métricas cargados desde Supabase');
    return data;
  } catch (error) {
    console.error('❌ Error al cargar datos base desde Supabase:', error);
    fallbackData.fileLastModified = new Date().toISOString();
    return fallbackData;
  }
}

function mergeAlegraMetrics(
  baseData: MetricsData,
  alegraData: NonNullable<Awaited<ReturnType<typeof getAlegraMetricsSnapshot>>>
): MetricsData {
  return {
    ...baseData,
    lastUpdated: alegraData.lastUpdated,
    fileLastModified: alegraData.lastUpdated,
    metrics: {
      ...baseData.metrics,
      ventas: {
        ...baseData.metrics.ventas,
        value: alegraData.ventas.value,
        breakdown: alegraData.ventas.breakdown,
      },
      recaudo: {
        ...baseData.metrics.recaudo,
        value: alegraData.recaudo.value,
        breakdown: alegraData.recaudo.breakdown,
      },
      inventario: {
        ...baseData.metrics.inventario,
        value: alegraData.inventario.value,
        breakdown: alegraData.inventario.breakdown,
      },
    },
  };
}

export async function getMetricsData(): Promise<MetricsData> {
  const baseData = await getMetricsDataFromSupabase();

  if (!hasAlegraCredentials()) {
    return baseData;
  }

  try {
    const customerDiscountRules = await getCustomerDiscountRules();
    const alegraData = await getAlegraMetricsSnapshot(customerDiscountRules);

    if (!alegraData) {
      return baseData;
    }

    console.log('✅ Métricas de Alegra sincronizadas');
    return mergeAlegraMetrics(baseData, alegraData);
  } catch (error) {
    console.error('⚠️ No fue posible sincronizar Alegra, se usarán datos locales:', error);
    return baseData;
  }
}

/**
 * Formatea un número como moneda colombiana
 */
export function formatCurrency(value: number): string {
  // Formatear solo el número con separadores de miles
  const numberFormatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  
  // Agregar manualmente el símbolo de pesos sin espacio
  return `$${numberFormatted}`;
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Formatea la fecha de modificación del archivo para mostrar en la interfaz
 * Usa la zona horaria de Colombia (America/Bogota)
 */
export function formatFileDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota'
    });
  } catch (error) {
    return 'Fecha no disponible';
  }
}

/**
 * Formatea un valor según su unidad (moneda o porcentaje)
 */
export function formatValue(value: number, unit?: string): string {
  if (unit === '%') {
    return `${value}%`;
  }
  return formatCurrency(value);
}

/**
 * Calcula el porcentaje de progreso basado en value/target
 */
export function calculatePercentage(value: number, target: number): number {
  if (target === 0) return 0;
  return Math.round((value / target) * 100);
}

