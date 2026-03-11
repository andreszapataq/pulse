'use client';

import { useRefreshState } from './RefreshProvider';

interface RefreshStatusProps {
  lastSynchronizedAt: string;
}

export default function RefreshStatus({
  lastSynchronizedAt,
}: RefreshStatusProps) {
  const { isRefreshing } = useRefreshState();

  return (
    <span
      aria-live="polite"
      className="inline-flex min-h-4 items-center justify-center gap-2 text-[11px] font-normal text-gray-500"
    >
      {isRefreshing ? (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse" />
          Actualizando...
        </>
      ) : (
        <>Última sincronización: {lastSynchronizedAt}</>
      )}
    </span>
  );
}
