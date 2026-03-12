'use client';

import { useCallback, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useRefreshState } from './RefreshProvider';

interface AutoRefreshProps {
  intervalMinutes?: number;
}

export default function AutoRefresh({ intervalMinutes = 5 }: AutoRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setIsRefreshing } = useRefreshState();

  useEffect(() => {
    setIsRefreshing(isPending);
  }, [isPending, setIsRefreshing]);

  const triggerRefresh = useCallback(
    (reason: string) => {
      if (isPending) {
        return;
      }

      console.log(reason);
      startTransition(() => {
        router.refresh();
      });
    },
    [isPending, router]
  );

  useEffect(() => {
    // Auto-refresh cada X minutos
    const interval = setInterval(() => {
      triggerRefresh('🔄 Auto-refresh activado');
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [intervalMinutes, triggerRefresh]);

  useEffect(() => {
    // Refresh cuando la app vuelve al foreground (iOS)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        triggerRefresh('🔄 App visible - refrescando datos');
      }
    };

    // Refresh cuando la ventana vuelve a tener foco
    const handleFocus = () => {
      triggerRefresh('🔄 App enfocada - refrescando datos');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [triggerRefresh]);

  return null; // Componente invisible
}