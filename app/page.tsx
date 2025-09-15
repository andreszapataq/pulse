import { getMetricsData, formatFileDate, formatValue, calculatePercentage, type MetricsData } from '@/lib/metrics';
import AutoRefresh from './components/AutoRefresh';
import AccordionMetricCard from './components/AccordionMetricCard';

// Configurar revalidación cada 2 minutos (más frecuente para mejor UX)
export const revalidate = 120;

interface MetricCardProps {
  title: string;
  value: string;
  percentage?: string;
  showProgressBar?: boolean;
}

function MetricCard({ title, value, percentage, showProgressBar = false }: MetricCardProps) {
  const getProgressWidth = () => {
    if (!percentage) return '0%';
    return percentage;
  };

  return (
    <div className="mb-10">
      <h2 className="text-base font-medium leading-tight">
        {title}
      </h2>
      <div className="flex justify-between items-baseline mb-[3px]">
        <div className="text-xl font-normal">
          {value}
        </div>
        {percentage && (
          <span className="text-sm font-normal text-gray-500">
            {percentage}
          </span>
        )}
      </div>
      {showProgressBar && (
        <div className="w-full h-[10px]">
          <div 
            className="bg-linear-to-r from-background to-foreground h-full" 
            style={{ width: getProgressWidth() }}
          />
        </div>
      )}
    </div>
  );
}

export default async function Home() {
  // Cargar datos desde el JSON
  const metricsData = await getMetricsData();
  
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota'
  });

  // Usar la fecha de modificación del archivo (automática)
  const fileModifiedTime = metricsData.fileLastModified 
    ? formatFileDate(metricsData.fileLastModified)
    : 'Fecha no disponible';

  return (
    <main className="min-h-screen bg-white px-9 py-13 max-w-md mx-auto font-mono">
      {/* Auto-refresh component - cada 2 minutos para mejor UX */}
      <AutoRefresh intervalMinutes={2} />
      
      {/* Header */}
      <div className="mb-[50px]">
        <div>
          <img src="/logo.svg" alt="Pulse Logo" className="h-4 w-auto ml-px mb-px" />
        </div>
        
        <div className="flex justify-between items-start">
          <h1 className="text-sm font-semibold">
            {metricsData.companyName}
          </h1>
          <span className="text-xs font-normal">
            {currentDate}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <AccordionMetricCard
          title={metricsData.metrics.ventas.title}
          value={formatValue(metricsData.metrics.ventas.value, metricsData.metrics.ventas.unit)}
          percentage={`${calculatePercentage(metricsData.metrics.ventas.value, metricsData.metrics.ventas.target)}%`}
          showProgressBar={metricsData.metrics.ventas.showProgressBar}
          breakdown={metricsData.metrics.ventas.breakdown}
          listStyle="numbers"
        />
        
        <AccordionMetricCard
          title={metricsData.metrics.recaudo.title}
          value={formatValue(metricsData.metrics.recaudo.value, metricsData.metrics.recaudo.unit)}
          percentage={`${calculatePercentage(metricsData.metrics.recaudo.value, metricsData.metrics.recaudo.target)}%`}
          showProgressBar={metricsData.metrics.recaudo.showProgressBar}
          breakdown={metricsData.metrics.recaudo.breakdown}
          listStyle="bullets"
        />
        
        <AccordionMetricCard
          title={metricsData.metrics.inventario.title}
          value={formatValue(metricsData.metrics.inventario.value, metricsData.metrics.inventario.unit)}
          percentage={`${calculatePercentage(metricsData.metrics.inventario.value, metricsData.metrics.inventario.target)}%`}
          showProgressBar={metricsData.metrics.inventario.showProgressBar}
          breakdown={metricsData.metrics.inventario.breakdown}
          listStyle="numbers"
        />
        
        <MetricCard
          title={metricsData.metrics.margen.title}
          value={formatValue(metricsData.metrics.margen.value, metricsData.metrics.margen.unit)}
          percentage={`${calculatePercentage(metricsData.metrics.margen.value, metricsData.metrics.margen.target)}%`}
          showProgressBar={metricsData.metrics.margen.showProgressBar}
        />
        
        <MetricCard
          title={metricsData.metrics.caja.title}
          value={formatValue(metricsData.metrics.caja.value, metricsData.metrics.caja.unit)}
          percentage={`${calculatePercentage(metricsData.metrics.caja.value, metricsData.metrics.caja.target)}%`}
          showProgressBar={metricsData.metrics.caja.showProgressBar}
        />
      </div>

      {/* Footer with automatic file modification time */}
      <div className="mt-22 text-center">
        <span className="text-[11px] font-normal text-gray-500">
          Última actualización: {fileModifiedTime}
        </span>
      </div>
    </main>
  );
}