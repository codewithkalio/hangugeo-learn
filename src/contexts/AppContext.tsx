import { createContext, useContext, ReactNode } from 'react';
import { useAppData } from '@/hooks/useAppData';

type AppContextType = ReturnType<typeof useAppData>;

const fallback: AppContextType = {
  data: { flashcards: [], drillResults: [], categories: [], streak: 0, lastDrillDate: null },
  addFlashcard: async () => ({}) as any,
  updateFlashcard: async () => {},
  deleteFlashcard: () => {},
  addCategory: () => {},
  addDrillResult: () => {},
};

const AppContext = createContext<AppContextType>(fallback);

export function AppProvider({ children }: { children: ReactNode }) {
  const appData = useAppData();
  return <AppContext.Provider value={appData}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
