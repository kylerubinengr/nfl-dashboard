"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGamesByWeek } from "@/services/gameService";
import { Game } from "@/types/nfl";
import { GameCard } from "@/components/dashboard/GameCard";
import { HistoricalGameCard } from "@/components/dashboard/HistoricalGameCard";
import { WeekSelector } from "@/components/dashboard/WeekSelector";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Radio } from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const week = params.week as string;
  const weekNum = parseInt(week);

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

  // Initial Fetch
  useEffect(() => {
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 18) {
      router.push("/dashboard/18");
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        // Initial fetch gets everything including odds
        const result = await getGamesByWeek(weekNum);
        setData(result);
      } catch (e) {
        console.error("Dashboard fetch failed", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [weekNum, router]);

  // Polling Logic for Live Games
  useEffect(() => {
    if (!data) return;

    const hasLiveGames = data.games.some(g => g.status === 'in');
    
    if (hasLiveGames) {
        const intervalId = setInterval(async () => {
            try {
                // Fetch updates without hitting odds API
                const result = await getGamesByWeek(weekNum, 2, false);
                
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
                        // If we are polling, we are likely live, so preserve isSnapshot status or set to false if successful
                        isSnapshot: result.isSnapshot 
                    };
                });
            } catch (e) {
                console.error("Polling failed", e);
            }
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(intervalId);
    }
  }, [data?.games, weekNum]); // Depend on games to re-evaluate if we still need to poll

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
          
          <div className="flex items-center gap-4 w-full md:w-auto">
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
    </main>
  );
}
