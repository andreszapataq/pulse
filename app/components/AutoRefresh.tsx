'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AutoRefreshProps {
  intervalMinutes?: number;
}

export default function AutoRefresh({ intervalMinutes = 5 }: AutoRefreshProps) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    // Auto-refresh cada X minutos
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh activado');
      router.refresh();
      setLastRefresh(new Date());
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [router, intervalMinutes]);

  useEffect(() => {
    // Refresh cuando la app vuelve al foreground (iOS)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 App visible - refrescando datos');
        router.refresh();
        setLastRefresh(new Date());
      }
    };

    // Refresh cuando la ventana vuelve a tener foco
    const handleFocus = () => {
      console.log('🔄 App enfocada - refrescando datos');
      router.refresh();
      setLastRefresh(new Date());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router]);

  return null; // Componente invisible
}