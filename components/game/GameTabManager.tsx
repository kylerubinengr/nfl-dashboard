"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameTabs } from "@/context/GameTabsContext";

interface GameTabManagerProps {
  gameId: string;
  awayAbbreviation: string;
  homeAbbreviation: string;
  week: number;
  season: number;
}

/**
 * Client component that registers a game tab when mounted.
 * Handles the server/client boundary for game pages.
 */
export function GameTabManager({
  gameId,
  awayAbbreviation,
  homeAbbreviation,
  week,
  season
}: GameTabManagerProps) {
  const { tabs, addGameTab, removeGameTab, isTabLimitReached } = useGameTabs();
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();
  
  // Keep track of the latest tabs in a ref to avoid dependency cycles in cleanup
  const tabsRef = useRef(tabs);
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  // Auto-close unpinned tabs when navigating away
  useEffect(() => {
    return () => {
      // On unmount, check if this tab is unpinned and remove it
      // Use the ref to check the latest state without triggering re-runs
      const currentTab = tabsRef.current.find(t => t.id === gameId);
      if (currentTab && !currentTab.isPinned) {
        removeGameTab(gameId, false);
      }
    };
  }, [gameId, removeGameTab]);

  useEffect(() => {
    // Check if already at limit BEFORE trying to add
    const tabExists = tabs.find(t => t.id === gameId);

    if (isTabLimitReached && !tabExists) {
      // At limit and this is a new tab - prevent navigation
      setShowWarning(true);

      // Navigate back to dashboard after a delay so user sees the warning
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 2000);

      // Auto-hide warning after 5 seconds
      const hideTimer = setTimeout(() => {
        setShowWarning(false);
      }, 5000);

      return () => {
        clearTimeout(redirectTimer);
        clearTimeout(hideTimer);
      };
    }

    // Normal add logic - either not at limit or tab already exists
    const wasAdded = addGameTab({
      id: gameId,
      awayAbbreviation,
      homeAbbreviation,
      week,
      season,
    });

    // If add failed (should only happen if race condition or limit reached between render and call)
    if (!wasAdded && !tabExists) {
      setShowWarning(true);
      
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 2000);

      const hideTimer = setTimeout(() => {
        setShowWarning(false);
      }, 5000);

      return () => {
        clearTimeout(redirectTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [gameId, awayAbbreviation, homeAbbreviation, tabs, addGameTab, isTabLimitReached, router]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm animate-slide-in">
      <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded-lg shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Tab Limit Reached
            </h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              Maximum of 8 game tabs allowed. Close an existing tab to open this game.
            </p>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="flex-shrink-0 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200"
            aria-label="Dismiss warning"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
