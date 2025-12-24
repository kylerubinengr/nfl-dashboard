"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 18) {
      router.push("/dashboard/18");
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
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

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  const isLive = data.games.some((game) => game.isLive);

  return (
    <main className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-slate-900">
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