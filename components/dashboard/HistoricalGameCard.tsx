"use client";

import { Game, Team, BettingResult } from "@/types/nfl";
import { Home, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HistoricalGameCardProps {
  game: Game;
}

const TeamSection = ({ team, score, isWinner }: { team: Team; score?: number; isWinner: boolean }) => (
  <div className={`flex items-center space-x-4 p-4 ${isWinner ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
    {team.logoUrl ? (
      <Image
        src={team.logoUrl}
        alt={`${team.name} logo`}
        width={48}
        height={48}
        className="object-contain"
      />
    ) : (
      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center dark:bg-slate-700">
        <span className="text-[10px] text-slate-500 font-bold dark:text-slate-300">{team.abbreviation}</span>
      </div>
    )}
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className={`font-bold tracking-tight text-lg ${isWinner ? 'text-green-700 dark:text-green-400' : 'text-slate-800 dark:text-slate-100'}`}>{team.name}</h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{team.record}</p>
    </div>
    <div className={`text-2xl font-black ${isWinner ? 'text-green-700 dark:text-green-400' : 'text-slate-400 dark:text-slate-600'}`}>
      {score}
    </div>
  </div>
);

const BettingResultDisplay = ({ bettingResult, homeAbbr, awayAbbr, homeScore, awayScore }: { bettingResult?: BettingResult, homeAbbr: string, awayAbbr: string, homeScore?: number, awayScore?: number }) => {
  if (!bettingResult || homeScore === undefined || awayScore === undefined) return null;

  const totalPoints = homeScore + awayScore;

  let spreadBadgeColor = 'text-slate-600';
  if (bettingResult.spreadCoveredBy === homeAbbr || bettingResult.spreadCoveredBy === awayAbbr) {
    spreadBadgeColor = 'text-green-700';
  } else if (bettingResult.spreadCoveredBy === 'PUSH') {
    spreadBadgeColor = 'text-amber-700';
  }

  let totalBadgeColor = 'text-slate-600';
  if (bettingResult.totalResult === 'OVER') {
    totalBadgeColor = 'text-green-700';
  } else if (bettingResult.totalResult === 'UNDER') {
    totalBadgeColor = 'text-red-700';
  } else if (bettingResult.totalResult === 'PUSH') {
    totalBadgeColor = 'text-amber-700';
  }

  return (
    <div className="flex justify-around items-center text-center p-3 bg-slate-50/70 border-t border-slate-100 dark:bg-slate-800/30 dark:border-slate-800">
      <div className="flex items-center gap-2">
         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight dark:text-slate-500">Spread</span>
         <span className={`font-bold text-xs ${spreadBadgeColor} dark:${spreadBadgeColor.replace('text-slate-600', 'text-slate-300').replace('text-green-700', 'text-green-400').replace('text-amber-700', 'text-amber-400')}`}>
            {bettingResult.spreadCoveredBy} {bettingResult.spreadResult}
         </span>
      </div>
      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
      <div className="flex items-center gap-2">
         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight dark:text-slate-500">Total</span>
         <span className={`font-bold text-xs ${totalBadgeColor} dark:${totalBadgeColor.replace('text-slate-600', 'text-slate-300').replace('text-green-700', 'text-green-400').replace('text-red-700', 'text-red-400').replace('text-amber-700', 'text-amber-400')}`}>
            {totalPoints.toFixed(1)} ({bettingResult.totalResult} {bettingResult.closingTotal})
         </span>
      </div>
    </div>
  );
};

export function HistoricalGameCard({ game }: HistoricalGameCardProps) {
  const isAwayWinner = game.winnerId === game.awayTeam.id;
  const isHomeWinner = game.winnerId === game.homeTeam.id;

  return (
    <Link href={`/game/${game.id}`} className="block bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg hover:border-blue-500 hover:scale-[1.01] transition-all duration-300 overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-500">
      <header className="px-4 py-3 flex justify-between items-start gap-4 bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
        <div className="text-sm text-slate-700 dark:text-slate-200">
          <p>{game.date ? new Date(game.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
          {game.broadcast && <p className="text-xs text-slate-500 dark:text-slate-400">{game.broadcast}</p>}
        </div>
        <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest dark:bg-slate-700 dark:text-slate-100">
                FINAL
            </span>
        </div>
      </header>

      <div className="p-2">
        <TeamSection team={game.awayTeam} score={game.awayScore} isWinner={isAwayWinner} />
        <TeamSection team={game.homeTeam} score={game.homeScore} isWinner={isHomeWinner} />
      </div>

      {/*
      <BettingResultDisplay 
          bettingResult={game.bettingResult} 
          homeAbbr={game.homeTeam.abbreviation} 
          awayAbbr={game.awayTeam.abbreviation}
          homeScore={game.homeScore}
          awayScore={game.awayScore}
      />
      */}

      <footer className="px-4 py-2 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 dark:text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-3 h-3" />
          <span>{game.venue} • {game.venueLocation}</span>
        </div>
      </footer>
    </Link>
  );
}