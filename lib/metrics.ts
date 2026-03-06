import { promises as fs } from 'fs';
import path from 'path';
import { getAlegraMetricsSnapshot, hasAlegraCredentials } from './alegra';
import { getCustomerDiscountRules } from './customer-discounts';

/**
 * Tipos para las métricas
 */
export interface BreakdownItem {
  name: string;
  value: number;
  date?: string;
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
  lastUpdated?: string; // Fecha manual en el JSON
  metrics: {
    ventas: Metric;
    recaudo: Metric;
    inventario: Metric;
    margen: Metric;
    caja: Metric;
  };
  // Campo automático agregado dinámicamente
  fileLastModified?: string;
}

/**
 * Lee los datos de métricas desde el archivo JSON
 * Incluye automáticamente la fecha de modificación del archivo
 */
async function getMetricsDataFromFile(): Promise<MetricsData> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'metrics.json');
    
    // Obtener información del archivo (incluyendo fecha de modificación)
    const fileStats = await fs.stat(filePath);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: MetricsData = JSON.parse(fileContents);
    
    // Estrategia de fechas simplificada:
    // 1. Si existe lastUpdated en el JSON, usarla (recomendado)
    // 2. Como respaldo, usar fecha del archivo
    
    if (data.lastUpdated) {
      // Prioridad 1: Usar fecha manual del JSON (recomendado)
      data.fileLastModified = data.lastUpdated;
      console.log('✅ Usando fecha manual del JSON');
      console.log(`📅 Fecha de actualización: ${formatFileDate(data.fileLastModified)}`);
    } else {
      // Prioridad 2: Usar fecha del archivo como respaldo
      data.fileLastModified = fileStats.mtime.toISOString();
      console.log('✅ Usando fecha del archivo');
      console.log(`📅 Archivo modificado: ${formatFileDate(data.fileLastModified)}`);
    }
    
    console.log('✅ Datos de métricas cargados exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error al cargar datos de métricas:', error);
    
    // Datos por defecto en caso de error
    const defaultData: MetricsData = {
      companyName: "BioTissue Colombia",
      metrics: {
        ventas: {
          title: "Ventas",
          value: 0,
          target: 0,
          showProgressBar: true
        },
        recaudo: {
          title: "Recaudo",
          value: 0,
          target: 0,
          showProgressBar: true
        },
        inventario: {
          title: "Inventario",
          value: 0,
          target: 0,
          showProgressBar: true
        },
        margen: {
          title: "Margen",
          value: 0,
          target: 0,
          showProgressBar: true,
          unit: "%"
        },
        caja: {
          title: "Caja",
          value: 0,
          target: 0,
          showProgressBar: true
        }
      }
    };
    
    // En caso de error, usar fecha actual
    defaultData.fileLastModified = new Date().toISOString();
    
    return defaultData;
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
      inventario: {
        ...baseData.metrics.inventario,
        value: alegraData.inventario.value,
        breakdown: alegraData.inventario.breakdown,
      },
    },
  };
}

export async function getMetricsData(): Promise<MetricsData> {
  const baseData = await getMetricsDataFromFile();

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

