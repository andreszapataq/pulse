import { getMetricsData, formatFileDate, type MetricsData } from '@/lib/metrics';

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
    year: 'numeric'
  });

  // Usar la fecha de modificación del archivo (automática)
  const fileModifiedTime = metricsData.fileLastModified 
    ? formatFileDate(metricsData.fileLastModified)
    : 'Fecha no disponible';

  return (
    <main className="min-h-screen bg-white px-9 py-13 max-w-md mx-auto font-mono">
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
        <MetricCard
          title={metricsData.metrics.ventas.title}
          value={metricsData.metrics.ventas.formattedValue}
          percentage={`${metricsData.metrics.ventas.percentage}%`}
          showProgressBar={metricsData.metrics.ventas.showProgressBar}
        />
        
        <MetricCard
          title={metricsData.metrics.recaudo.title}
          value={metricsData.metrics.recaudo.formattedValue}
          percentage={`${metricsData.metrics.recaudo.percentage}%`}
          showProgressBar={metricsData.metrics.recaudo.showProgressBar}
        />
        
        <MetricCard
          title={metricsData.metrics.inventario.title}
          value={metricsData.metrics.inventario.formattedValue}
          percentage={`${metricsData.metrics.inventario.percentage}%`}
          showProgressBar={metricsData.metrics.inventario.showProgressBar}
        />
        
        <MetricCard
          title={metricsData.metrics.margen.title}
          value={metricsData.metrics.margen.formattedValue}
          percentage={`${metricsData.metrics.margen.percentage}%`}
          showProgressBar={metricsData.metrics.margen.showProgressBar}
        />
        
        <MetricCard
          title={metricsData.metrics.caja.title}
          value={metricsData.metrics.caja.formattedValue}
          percentage={`${metricsData.metrics.caja.percentage}%`}
          showProgressBar={metricsData.metrics.caja.showProgressBar}
        />
      </div>

      {/* Footer with automatic file modification time */}
      <div className="mt-24 text-center">
        <span className="text-xs font-normal text-gray-500">
          Última actualización: {fileModifiedTime}
        </span>
      </div>
    </main>
  );
}
