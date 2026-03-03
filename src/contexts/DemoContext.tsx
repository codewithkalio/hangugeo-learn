import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

const DEMO_STORAGE_KEY = 'hangugeo-demo';

function getStoredDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(DEMO_STORAGE_KEY) === '1';
}

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoModeState] = useState(getStoredDemoMode);

  // Sync from storage (e.g. new tab or storage event)
  useEffect(() => {
    const handler = () => setIsDemoModeState(getStoredDemoMode());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setDemoMode = useCallback((value: boolean) => {
    if (value) {
      sessionStorage.setItem(DEMO_STORAGE_KEY, '1');
    } else {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
    }
    setIsDemoModeState(value);
  }, []);

  const exitDemo = useCallback(() => {
    setDemoMode(false);
  }, [setDemoMode]);

  return (
    <DemoContext.Provider value={{ isDemoMode: isDemoMode, setDemoMode, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode(): DemoContextType {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoProvider');
  return ctx;
}
