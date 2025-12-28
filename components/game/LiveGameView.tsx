"use client";

import { useEffect, useState } from "react";
import { Game } from "@/types/nfl";
import { refreshGameData } from "@/app/actions/gameActions";
import { LiveGameHeader } from "./LiveGameHeader";
import { LiveDriveChart } from "./LiveDriveChart";
import { ScoringSummary } from "./ScoringSummary";
import { StatTable } from "@/components/dashboard/StatTable";
import { SafeImage } from "@/components/common/SafeImage";

interface LiveGameViewProps {
  initialGame: Game;
}

export default function LiveGameView({ initialGame }: LiveGameViewProps) {
  const [game, setGame] = useState<Game>(initialGame);

  useEffect(() => {
    // Poll every 1 second for live updates
    const interval = setInterval(async () => {
      const updatedGame = await refreshGameData(game.id);
      if (updatedGame) {
        setGame(updatedGame);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game.id]);

  const currentPlay = game.drives?.[0]?.plays?.[0];
  const clockDisplay = game.status === 'in' 
    ? (currentPlay?.clock && currentPlay?.quarter ? `${currentPlay.clock} - Q${currentPlay.quarter}` : "Live") 
    : "Final";

  return (
    <div className="space-y-6">
      <LiveGameHeader 
        homeTeam={game.homeTeam}
        awayTeam={game.awayTeam}
        homeScore={game.homeScore || 0}
        awayScore={game.awayScore || 0}
        clock={clockDisplay}
      />

      <LiveDriveChart drives={game.drives || []} isLive={game.status === 'in'} />

      {game.scoringPlays && game.linescores && (
         <ScoringSummary 
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            scoringPlays={game.scoringPlays}
            homeLinescores={game.linescores.home}
            awayLinescores={game.linescores.away}
            homeScore={game.homeScore || 0}
            awayScore={game.awayScore || 0}
         />
      )}

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Away Team Stats */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2 dark:border-slate-800">
                    <SafeImage src={game.awayTeam.logoUrl} alt="" width={24} height={24} />
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">{game.awayTeam.name} Stats</h3>
                </div>
                {game.matchupStats?.away.boxscore ? (
                    <div className="space-y-6">
                        <StatTable title="PASSING" headers={game.matchupStats.away.boxscore.passing.headers} players={game.matchupStats.away.boxscore.passing.players} totals={game.matchupStats.away.boxscore.passing.totals} />
                        <StatTable title="RUSHING" headers={game.matchupStats.away.boxscore.rushing.headers} players={game.matchupStats.away.boxscore.rushing.players} totals={game.matchupStats.away.boxscore.rushing.totals} />
                        <StatTable title="RECEIVING" headers={game.matchupStats.away.boxscore.receiving.headers} players={game.matchupStats.away.boxscore.receiving.players} totals={game.matchupStats.away.boxscore.receiving.totals} />
                    </div>
                ) : <p className="text-slate-400 text-sm italic">Detailed stats not available.</p>}
            </div>

            {/* Home Team Stats */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2 dark:border-slate-800">
                    <SafeImage src={game.homeTeam.logoUrl} alt="" width={24} height={24} />
                    <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">{game.homeTeam.name} Stats</h3>
                </div>
                {game.matchupStats?.home.boxscore ? (
                    <div className="space-y-6">
                        <StatTable title="PASSING" headers={game.matchupStats.home.boxscore.passing.headers} players={game.matchupStats.home.boxscore.passing.players} totals={game.matchupStats.home.boxscore.passing.totals} />
                        <StatTable title="RUSHING" headers={game.matchupStats.home.boxscore.rushing.headers} players={game.matchupStats.home.boxscore.rushing.players} totals={game.matchupStats.home.boxscore.rushing.totals} />
                        <StatTable title="RECEIVING" headers={game.matchupStats.home.boxscore.receiving.headers} players={game.matchupStats.home.boxscore.receiving.players} totals={game.matchupStats.home.boxscore.receiving.totals} />
                    </div>
                ) : <p className="text-slate-400 text-sm italic">Detailed stats not available.</p>}
            </div>
      </div>
    </div>
  );
}