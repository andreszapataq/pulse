import { getMetricsData, formatFileDate, type MetricsData } from '@/lib/metrics';
import AutoRefresh from './components/AutoRefresh';
import MetricsDisplay from './components/MetricsDisplay';

// Configurar revalidación cada 2 minutos (más frecuente para mejor UX)
export const revalidate = 120;


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
      <MetricsDisplay metricsData={metricsData} />

      {/* Footer with automatic file modification time */}
      <div className="mt-22 text-center">
        <span className="text-[11px] font-normal text-gray-500">
          Última actualización: {fileModifiedTime}
        </span>
      </div>
    </main>
  );
}