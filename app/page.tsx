import { getMetricsData, formatFileDate } from '@/lib/metrics';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AutoRefresh from './components/AutoRefresh';
import MetricsDisplay from './components/MetricsDisplay';
import LogoutButton from './components/LogoutButton';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Cargar datos desde el JSON
  const metricsData = await getMetricsData();
  
  const currentDateFormatted = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota'
  });
  
  // Asegurar que el mes termine con punto
  const currentDate = currentDateFormatted.replace(/([a-z]+)( \d{4})/, '$1.$2');

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
        <div className="mb-3">
          <LogoutButton />
        </div>
        <span className="text-[11px] font-normal text-gray-500">
          Última actualización: {fileModifiedTime}
        </span>
      </div>
    </main>
  );
}