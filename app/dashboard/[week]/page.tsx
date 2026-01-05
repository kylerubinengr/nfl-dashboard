"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { getGamesByWeek } from "@/services/gameService";
import { Game } from "@/types/nfl";
import { GameCard } from "@/components/dashboard/GameCard";
import { HistoricalGameCard } from "@/components/dashboard/HistoricalGameCard";
import { WeekSelector } from "@/components/dashboard/WeekSelector";
import { SeasonSelector } from "@/components/dashboard/SeasonSelector";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TabSettingsPanel } from "@/components/dashboard/TabSettingsPanel";
import { TabLimitWarning } from "@/components/ui/TabLimitWarning";
import { ViewToggle } from "@/components/dashboard/ViewToggle";
import { useGameTabs } from "@/context/GameTabsContext";
import { useSeason } from "@/context/SeasonContext";
import { Radio } from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const week = params.week as string;
  const weekNum = parseInt(week);
  const { closeUnpinnedTabs } = useGameTabs();
  const { selectedSeason, setViewMode } = useSeason();
  const pathname = usePathname();

  // Update view mode state
  useEffect(() => {
    setViewMode({ type: 'WEEK', href: pathname });
  }, [pathname, setViewMode]);

  const [data, setData] = useState<{
    games: Game[];
    lastUpdated?: number;
    isSnapshot: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref to hold the current data for the interval closure
  const dataRef = useRef<{ games: Game[] } | null>(null);
  
  useEffect(() => {
    if (data) {
        dataRef.current = data;
    }
  }, [data]);

  // Auto-close unpinned tabs when persistence is disabled
  useEffect(() => {
    const isPersistenceEnabled = localStorage.getItem('tabPersistenceEnabled');

    if (isPersistenceEnabled === 'false') {
      closeUnpinnedTabs();
    }
  }, [closeUnpinnedTabs]);

  // Initial Fetch
  useEffect(() => {
    const maxWeeks = selectedSeason >= 2021 ? 18 : 17;

    if (isNaN(weekNum) || weekNum < 1 || weekNum > maxWeeks) {
      // For historical seasons, user asked to default to Week 1. 
      // Also handles invalid weeks.
      // If we are in 2025 and week > 18, it might mean playoffs or invalid, defaulting to max regular season week or 1 is safest.
      // But standard "invalid url" behavior usually redirects to a safe default.
      
      const targetWeek = (selectedSeason < 2025 || weekNum > 18) ? 1 : 18;
      router.push(`/dashboard/${targetWeek}`);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        // Initial fetch gets everything including odds
        const result = await getGamesByWeek(weekNum, 2, false, selectedSeason);
        setData(result);
      } catch (e) {
        console.error("Dashboard fetch failed", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [weekNum, router, selectedSeason]);

  // Smart Polling Logic for Live Games
  useEffect(() => {
    if (!data) return;

    const hasLiveGames = data.games.some(g => g.status === 'in');

    // Don't poll if there are no live games
    if (!hasLiveGames) {
      console.log('[Dashboard] No live games - polling stopped');
      return;
    }

    // Only poll when tab is visible
    const pollData = async () => {
      if (document.visibilityState !== 'visible') {
        console.log('[Dashboard] Tab hidden - skipping poll');
        return;
      }

      try {
        // Fetch updates without hitting odds API
        const result = await getGamesByWeek(weekNum, 2, false, selectedSeason);

        // Merge new scores with existing odds/bookmakers
        setData(prevData => {
          if (!prevData) return result;

          const mergedGames = result.games.map(newGame => {
            const oldGame = prevData.games.find(g => g.id === newGame.id);
            if (oldGame && newGame.bookmakers.length === 0) {
              return {
                ...newGame,
                bookmakers: oldGame.bookmakers
              };
            }
            return newGame;
          });

          return {
            ...result,
            games: mergedGames,
            isSnapshot: result.isSnapshot
          };
        });
      } catch (e) {
        console.error("Polling failed", e);
      }
    };

    console.log('[Dashboard] Live games detected - starting smart polling (30s interval)');

    // Initial poll
    pollData();

    // Set up interval
    const intervalId = setInterval(pollData, 30000); // Poll every 30 seconds

    return () => {
      console.log('[Dashboard] Cleaning up polling interval');
      clearInterval(intervalId);
    };
  }, [data?.games, weekNum, selectedSeason]); // Depend on games to re-evaluate if we still need to poll

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  const isLive = data.games.some((game) => game.isLive);

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen pt-2 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              NFL Dashboard
            </h1>
            {isLive && (
              <div className="flex items-center gap-2 text-red-600">
                <Radio className="w-6 h-6 animate-pulse" />
                <span className="font-semibold">Live</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
             <div className="flex items-center gap-2">
                <SeasonSelector />
                <ViewToggle />
             </div>
             <WeekSelector currentWeek={weekNum} />
          </div>
        </div>

        <StatusBanner isSnapshot={data.isSnapshot} lastUpdated={data.lastUpdated} />

        {data.games.length === 0 ? (
             <div className="text-center py-16">
                <p className="text-slate-500">No games scheduled for Week {weekNum}.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.games.map((game) => (
                game.status === 'post' ? (
                    <HistoricalGameCard key={game.id} game={game} />
                ) : (
                    <GameCard key={game.id} game={game} />
                )
            ))}
            </div>
        )}
      </div>

      {/* Floating tab settings panel */}
      <TabSettingsPanel />
      <TabLimitWarning />
    </main>
  );
}
