'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false);
  const { setIsRefreshing } = useRefreshState();
  const intervalMs = intervalMinutes * 60 * 1000;
  const lastSyncedAtMs = parseTimestamp(lastSyncedAt);
  const lastRefreshCompletedAtRef = useRef(lastSyncedAtMs ?? Date.now());
  const refreshInFlightRef = useRef(false);
  const expectedSyncedAtRef = useRef<number | null>(null);
  const finishRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lastSyncedAtMs !== null) {
      lastRefreshCompletedAtRef.current = lastSyncedAtMs;
    }
  }, [lastSyncedAtMs]);

  useEffect(() => {
    setIsRefreshing(isRefreshingLocal);
  }, [isRefreshingLocal, setIsRefreshing]);

  const finishRefresh = useCallback(() => {
    if (finishRefreshTimeoutRef.current) {
      clearTimeout(finishRefreshTimeoutRef.current);
      finishRefreshTimeoutRef.current = null;
    }

    if (lastSyncedAtMs !== null) {
      lastRefreshCompletedAtRef.current = lastSyncedAtMs;
    }

    expectedSyncedAtRef.current = null;
    refreshInFlightRef.current = false;
    setIsRefreshingLocal(false);
  }, [lastSyncedAtMs]);

  useEffect(() => {
    if (
      refreshInFlightRef.current &&
      expectedSyncedAtRef.current !== null &&
      lastSyncedAtMs !== null &&
      lastSyncedAtMs >= expectedSyncedAtRef.current
    ) {
      finishRefresh();
    }
  }, [finishRefresh, lastSyncedAtMs]);

  useEffect(() => {
    return () => {
      if (finishRefreshTimeoutRef.current) {
        clearTimeout(finishRefreshTimeoutRef.current);
      }
    };
  }, []);

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
    return syncedAtMs;
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
      setIsRefreshingLocal(true);

      try {
        expectedSyncedAtRef.current = await syncMetrics();
        router.refresh();
        finishRefreshTimeoutRef.current = setTimeout(() => {
          finishRefresh();
        }, 2000);
      } catch (error) {
        console.error('⚠️ No fue posible refrescar las métricas:', error);
        finishRefresh();
      }
    },
    [finishRefresh, intervalMs, router, syncMetrics]
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