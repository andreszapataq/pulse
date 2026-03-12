'use client';

import { useCallback, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useRefreshState } from './RefreshProvider';

interface AutoRefreshProps {
  intervalMinutes?: number;
}

export default function AutoRefresh({ intervalMinutes = 5 }: AutoRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setIsRefreshing } = useRefreshState();
  const intervalMs = intervalMinutes * 60 * 1000;
  const lastRefreshCompletedAtRef = useRef(Date.now());
  const refreshInFlightRef = useRef(false);
  const hadPendingRefreshRef = useRef(false);

  useEffect(() => {
    setIsRefreshing(isPending);

    if (isPending) {
      hadPendingRefreshRef.current = true;
      return;
    }

    if (hadPendingRefreshRef.current) {
      lastRefreshCompletedAtRef.current = Date.now();
      refreshInFlightRef.current = false;
      hadPendingRefreshRef.current = false;
    }
  }, [isPending, setIsRefreshing]);

  const triggerRefresh = useCallback(
    (reason: string, force = false) => {
      if (refreshInFlightRef.current) {
        return;
      }

      const msSinceLastRefresh = Date.now() - lastRefreshCompletedAtRef.current;
      if (!force && msSinceLastRefresh < intervalMs) {
        return;
      }

      refreshInFlightRef.current = true;
      console.log(reason);
      startTransition(() => {
        router.refresh();
      });
    },
    [intervalMs, router, startTransition]
  );

  useEffect(() => {
    // Auto-refresh cada X minutos
    const interval = setInterval(() => {
      triggerRefresh('🔄 Auto-refresh activado', true);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, triggerRefresh]);

  useEffect(() => {
    // Solo refrescar al volver a foco si los datos ya cumplieron el umbral.
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        triggerRefresh('🔄 App visible - refrescando datos');
      }
    };

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