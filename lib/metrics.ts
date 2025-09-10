import { promises as fs } from 'fs';
import path from 'path';

/**
 * Tipos para las métricas
 */
export interface Metric {
  title: string;
  value: number;
  formattedValue: string;
  target: number;
  percentage: number;
  showProgressBar: boolean;
  unit?: string;
}

export interface MetricsData {
  lastUpdated: string;
  companyName: string;
  period: {
    start: string;
    end: string;
    description: string;
  };
  metrics: {
    ventas: Metric;
    recaudo: Metric;
    inventario: Metric;
    margen: Metric;
    caja: Metric;
  };
  notes: string;
}

/**
 * Lee los datos de métricas desde el archivo JSON
 */
export async function getMetricsData(): Promise<MetricsData> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'metrics.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: MetricsData = JSON.parse(fileContents);
    
    console.log('✅ Datos de métricas cargados exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error al cargar datos de métricas:', error);
    
    // Datos por defecto en caso de error
    const defaultData: MetricsData = {
      lastUpdated: new Date().toISOString(),
      companyName: "BioTissue Colombia",
      period: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        description: "Datos por defecto"
      },
      metrics: {
        ventas: {
          title: "Ventas",
          value: 0,
          formattedValue: "$0",
          target: 0,
          percentage: 0,
          showProgressBar: true
        },
        recaudo: {
          title: "Recaudo",
          value: 0,
          formattedValue: "$0",
          target: 0,
          percentage: 0,
          showProgressBar: true
        },
        inventario: {
          title: "Inventario",
          value: 0,
          formattedValue: "$0",
          target: 0,
          percentage: 0,
          showProgressBar: true
        },
        margen: {
          title: "Margen",
          value: 0,
          formattedValue: "0%",
          target: 0,
          percentage: 0,
          showProgressBar: true,
          unit: "%"
        },
        caja: {
          title: "Caja",
          value: 0,
          formattedValue: "$0",
          target: 0,
          percentage: 0,
          showProgressBar: true
        }
      },
      notes: "Error al cargar datos - usando valores por defecto"
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
