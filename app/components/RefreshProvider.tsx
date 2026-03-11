'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface RefreshContextValue {
  isRefreshing: boolean;
  setIsRefreshing: (value: boolean) => void;
}

const RefreshContext = createContext<RefreshContextValue | null>(null);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const value = useMemo(
    () => ({
      isRefreshing,
      setIsRefreshing,
    }),
    [isRefreshing]
  );

  return (
    <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
  );
}

export function useRefreshState() {
  const context = useContext(RefreshContext);

  if (!context) {
    throw new Error('useRefreshState debe usarse dentro de RefreshProvider');
  }

  return context;
}
