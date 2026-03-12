'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useRefreshState } from './RefreshProvider';

interface AutoRefreshProps {
  intervalMinutes?: number;
  lastSyncedAt?: string;
}

function parseTimestamp(value?: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export default function AutoRefresh({
  intervalMinutes = 5,
  lastSyncedAt,
}: AutoRefreshProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { setIsRefreshing } = useRefreshState();
  const intervalMs = intervalMinutes * 60 * 1000;
  const lastSyncedAtMs = parseTimestamp(lastSyncedAt);
  const lastRefreshCompletedAtRef = useRef(lastSyncedAtMs ?? Date.now());
  const refreshInFlightRef = useRef(false);
  const awaitingRouteRefreshRef = useRef(false);
  const routeRefreshStartedRef = useRef(false);

  useEffect(() => {
    if (lastSyncedAtMs !== null) {
      lastRefreshCompletedAtRef.current = lastSyncedAtMs;
    }
  }, [lastSyncedAtMs]);

  useEffect(() => {
    setIsRefreshing(isSyncing || isPending);

    if (isPending && awaitingRouteRefreshRef.current) {
      routeRefreshStartedRef.current = true;
      return;
    }

    if (
      !isPending &&
      awaitingRouteRefreshRef.current &&
      routeRefreshStartedRef.current
    ) {
      if (lastSyncedAtMs !== null) {
        lastRefreshCompletedAtRef.current = lastSyncedAtMs;
      } else {
        lastRefreshCompletedAtRef.current = Date.now();
      }
      refreshInFlightRef.current = false;
      awaitingRouteRefreshRef.current = false;
      routeRefreshStartedRef.current = false;
      setIsSyncing(false);
    }
  }, [isPending, isSyncing, lastSyncedAtMs, setIsRefreshing]);

  const syncMetrics = useCallback(async () => {
    const response = await fetch('/api/metrics/sync', {
      method: 'POST',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('No fue posible sincronizar las métricas.');
    }

    const payload = (await response.json()) as { lastSyncedAt?: string | null };
    const syncedAtMs = parseTimestamp(payload.lastSyncedAt ?? undefined);

    if (syncedAtMs !== null) {
      lastRefreshCompletedAtRef.current = syncedAtMs;
    }
  }, []);

  const triggerRefresh = useCallback(
    async (reason: string) => {
      if (refreshInFlightRef.current) {
        return;
      }

      const msSinceLastRefresh = Date.now() - lastRefreshCompletedAtRef.current;
      if (msSinceLastRefresh < intervalMs) {
        return;
      }

      refreshInFlightRef.current = true;
      console.log(reason);
      setIsSyncing(true);

      try {
        await syncMetrics();
        awaitingRouteRefreshRef.current = true;
        routeRefreshStartedRef.current = false;
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        console.error('⚠️ No fue posible refrescar las métricas:', error);
        refreshInFlightRef.current = false;
        awaitingRouteRefreshRef.current = false;
        routeRefreshStartedRef.current = false;
        setIsSyncing(false);
      }
    },
    [intervalMs, router, startTransition, syncMetrics]
  );

  useEffect(() => {
    // Auto-refresh cada X minutos
    const interval = setInterval(() => {
      void triggerRefresh('🔄 Auto-refresh activado');
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, triggerRefresh]);

  useEffect(() => {
    // Solo refrescar al volver a foco si los datos ya cumplieron el umbral.
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void triggerRefresh('🔄 App visible - refrescando datos');
      }
    };

    const handleFocus = () => {
      void triggerRefresh('🔄 App enfocada - refrescando datos');
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