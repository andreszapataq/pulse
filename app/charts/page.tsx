import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getYearlyVentasData } from '@/lib/chart-data';
import VentasChart from './VentasChart';
import Link from 'next/link';

export default async function VentasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { companyName, chartData } = await getYearlyVentasData();

  return (
    <main className="min-h-screen bg-white px-9 py-13 max-w-md mx-auto font-mono">
      {/* Header */}
      <div className="mb-[50px]">
        <div>
          <img src="/logo.svg" alt="Pulse Logo" className="h-4 w-auto ml-px mb-px" />
        </div>
        <div className="flex justify-between items-start">
          <h1 className="text-sm font-semibold">{companyName}</h1>
          <Link
            href="/"
            className="text-[11px] text-gray-500 cursor-pointer"
            aria-label="Volver al inicio"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* Chart */}
      <VentasChart data={chartData} />
    </main>
  );
}
