"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export type GameTab = {
  id: string;
  awayAbbreviation: string;
  homeAbbreviation: string;
  isPinned: boolean;
  week: number;
  season: number;
};

interface GameTabsContextType {
  tabs: GameTab[];
  addGameTab: (tab: Omit<GameTab, 'isPinned'>) => boolean;
  removeGameTab: (id: string, shouldRedirect?: boolean) => void;
  togglePinTab: (id: string) => void;
  closeUnpinnedTabs: () => void;
  isTabLimitReached: boolean;
  isLimitWarningVisible: boolean;
  setIsLimitWarningVisible: (visible: boolean) => void;
}

const GameTabsContext = createContext<GameTabsContextType | undefined>(undefined);

const MAX_TABS = 8;

export function GameTabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<GameTab[]>([]);
  const [isLimitWarningVisible, setIsLimitWarningVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const addGameTab = useCallback((newTab: Omit<GameTab, 'isPinned'>): boolean => {
    // Check if tab already exists
    const existingTab = tabs.find(t => t.id === newTab.id);
    if (existingTab) {
      return true; // Already exists, consider it a success
    }

    // Check if limit reached
    if (tabs.length >= MAX_TABS) {
      return false; // Don't add, limit reached
    }

    setTabs((currentTabs) => {
      // Double check in setter just in case, though tabs dependency makes it reasonably safe
      if (currentTabs.length >= MAX_TABS && !currentTabs.find(t => t.id === newTab.id)) {
        return currentTabs;
      }
      
      // If it somehow appeared in between (unlikely with synchronous event loop)
      if (currentTabs.find(t => t.id === newTab.id)) {
        return currentTabs;
      }

      // Add new tab at the end with isPinned initialized to false
      return [...currentTabs, { ...newTab, isPinned: false }];
    });

    return true;
  }, [tabs]);

  const removeGameTab = useCallback((id: string, shouldRedirect: boolean = true) => {
    setTabs((currentTabs) => currentTabs.filter(t => t.id !== id));

    // If currently viewing this game, navigate to home
    if (shouldRedirect && pathname === `/game/${id}`) {
      router.push('/');
    }
  }, [pathname, router]);

  const togglePinTab = useCallback((id: string) => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === id ? { ...tab, isPinned: !tab.isPinned } : tab
      )
    );
  }, []);

  const closeUnpinnedTabs = useCallback(() => {
    setTabs((currentTabs) => currentTabs.filter(tab => tab.isPinned));
  }, []);

  const isTabLimitReached = tabs.length >= MAX_TABS;

  return (
    <GameTabsContext.Provider value={{ 
      tabs, 
      addGameTab, 
      removeGameTab, 
      togglePinTab, 
      closeUnpinnedTabs, 
      isTabLimitReached,
      isLimitWarningVisible,
      setIsLimitWarningVisible
    }}>
      {children}
    </GameTabsContext.Provider>
  );
}

export function useGameTabs() {
  const context = useContext(GameTabsContext);
  if (context === undefined) {
    throw new Error("useGameTabs must be used within a GameTabsProvider");
  }
  return context;
}
