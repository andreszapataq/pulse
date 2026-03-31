import { getMetricsData, formatFileDate } from '@/lib/metrics';
import { getCurrentMonthStr } from '@/lib/alegra';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AutoRefresh from './components/AutoRefresh';
import MetricsDisplay from './components/MetricsDisplay';
import MonthPicker from './components/MonthPicker';
import LogoutButton from './components/LogoutButton';
import ChartsLink from './components/ChartsLink';

interface HomeProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Determinar mes seleccionado
  const params = await searchParams;
  const bogotaMonth = getCurrentMonthStr();
  const requestedMonth = params.month;
  const isValidMonth = requestedMonth?.match(/^\d{4}-(0[1-9]|1[0-2])$/) && requestedMonth <= bogotaMonth;
  const selectedMonth = isValidMonth ? requestedMonth : undefined;
  const isViewingCurrentMonth = !selectedMonth || selectedMonth === bogotaMonth;

  // Cargar datos del mes seleccionado
  const metricsData = await getMetricsData(selectedMonth);

  // Formato de fecha para mostrar
  let displayDate: string;
  if (isViewingCurrentMonth) {
    const formatted = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/Bogota',
    });
    displayDate = formatted.replace(/([a-z]+)( \d{4})/, '$1.$2');
  } else {
    const [year, month] = selectedMonth!.split('-').map(Number);
    const formatted = new Date(year, month - 1, 1).toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric',
    });
    displayDate = formatted.replace(/([a-z]+)( \d{4})/, '$1.$2');
  }

  // Usar la fecha de modificación del archivo (automática)
  const fileModifiedTime = metricsData.fileLastModified
    ? formatFileDate(metricsData.fileLastModified)
    : 'Fecha no disponible';

  return (
    <main className="min-h-screen bg-white px-9 py-13 max-w-md mx-auto font-mono">
      {/* Auto-refresh solo para el mes actual */}
      {isViewingCurrentMonth && <AutoRefresh intervalMinutes={2} />}

      {/* Header */}
      <div className="mb-[50px]">
        <div>
          <img src="/logo.svg" alt="Pulse Logo" className="h-4 w-auto ml-px mb-px" />
        </div>

        <div className="flex justify-between items-start">
          <h1 className="text-sm font-semibold">
            {metricsData.companyName}
          </h1>
          <MonthPicker
            currentMonth={selectedMonth ?? bogotaMonth}
            displayDate={displayDate}
            isCurrentMonth={isViewingCurrentMonth}
          />
        </div>
      </div>

      {/* Metrics */}
      <MetricsDisplay metricsData={metricsData} />

      {/* Footer with automatic file modification time */}
      <div className="mt-22 text-center">
        <div className="mb-3 relative flex items-center justify-center">
          <LogoutButton />
          <ChartsLink />
        </div>
        <span className="text-[11px] font-normal text-gray-500">
          Última actualización: {fileModifiedTime}
        </span>
      </div>
    </main>
  );
}