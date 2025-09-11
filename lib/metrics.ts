import { promises as fs } from 'fs';
import path from 'path';

/**
 * Tipos para las métricas
 */
export interface Metric {
  title: string;
  value: number;
  target: number;
  showProgressBar: boolean;
  unit?: string;
}

export interface MetricsData {
  companyName: string;
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
export async function getMetricsData(): Promise<MetricsData> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'metrics.json');
    
    // Obtener información del archivo (incluyendo fecha de modificación)
    const fileStats = await fs.stat(filePath);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: MetricsData = JSON.parse(fileContents);
    
    // Agregar la fecha de modificación del archivo automáticamente
    data.fileLastModified = fileStats.mtime.toISOString();
    
    console.log('✅ Datos de métricas cargados exitosamente');
    console.log(`📅 Archivo modificado: ${formatFileDate(data.fileLastModified)}`);
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
    
    return defaultData;
  }
}

/**
 * Formatea un número como moneda colombiana
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Formatea la fecha de modificación del archivo para mostrar en la interfaz
 */
export function formatFileDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
