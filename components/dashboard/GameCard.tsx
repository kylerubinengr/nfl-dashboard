"use client";

import { Game, Team, BettingOdds } from "@/types/nfl";
import { Sun, Cloud, CloudRain, CloudSnow, Home, MapPin, Wind, Droplets } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatGameTime } from "@/lib/utils";

interface GameCardProps {
  game: Game;
}

const TeamSection = ({ team, isHome, score, isWinner, isFinal }: { team: Team; isHome: boolean; score?: number; isWinner: boolean; isFinal: boolean }) => (
  <div className={`flex items-center space-x-4 p-4 ${isWinner ? 'bg-green-50/50' : ''}`}>
    {team.logoUrl ? (
      <Image
        src={team.logoUrl}
        alt={`${team.name} logo`}
        width={48}
        height={48}
        className="object-contain"
      />
    ) : (
      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
        <span className="text-[10px] text-slate-500 font-bold">{team.abbreviation}</span>
      </div>
    )}
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className={`font-bold tracking-tight text-lg ${isWinner ? 'text-green-700' : 'text-slate-800'}`}>{team.name}</h3>
      </div>
      <p className="text-sm text-slate-500">{team.record}</p>
    </div>
    {isFinal && (
      <div className={`text-2xl font-black ${isWinner ? 'text-green-700' : 'text-slate-400'}`}>
        {score}
      </div>
    )}
  </div>
);

const SimplifiedOddsRow = ({ odds, homeAbbr, awayAbbr }: { odds: BettingOdds, homeAbbr: string, awayAbbr: string }) => {
  const isHomeFavored = odds.spread < 0;
  const favoredAbbr = isHomeFavored ? homeAbbr : awayAbbr;
  const displaySpread = isHomeFavored ? odds.spread : -odds.spread;
  
  return (
    <div className="flex justify-around items-center text-center p-3 bg-slate-50/70 border-t border-slate-100">
      <div className="flex items-center gap-2">
         <span className="font-bold text-slate-700">{favoredAbbr}</span>
         <span className="font-mono text-slate-600">{displaySpread}</span>
      </div>
      <div className="h-4 w-px bg-slate-300" />
      <div className="flex items-center gap-2">
         <span className="text-xs uppercase text-slate-500">Total</span>
         <span className="font-mono font-bold text-slate-700">{odds.total}</span>
      </div>
    </div>
  );
};

export function GameCard({ game }: GameCardProps) {
  const isFinal = game.status === 'post';
  const isAwayWinner = game.winnerId === game.awayTeam.id;
  const isHomeWinner = game.winnerId === game.homeTeam.id;

  const getWeatherDisplay = (condition: string) => {
    const iconClass = "w-5 h-5";
    switch (condition) {
      case "Sunny": return <Sun className={iconClass} />;
      case "Cloudy": return <Cloud className={iconClass} />;
      case "Rain": return <CloudRain className={iconClass} />;
      case "Snow": return <CloudSnow className={iconClass} />;
      case "Dome": return <Home className={iconClass} />;
      default: return <Cloud className={iconClass} />;
    }
  };

  // Logic: Select MGM, fallback to first
  const mgmOdds = game.bookmakers.find(b => b.key === 'betmgm')?.odds;
  const displayOdds = mgmOdds || (game.bookmakers.length > 0 ? game.bookmakers[0].odds : null);

  return (
    <Link href={`/game/${game.id}`} className="block bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg hover:border-blue-500 hover:scale-[1.01] transition-all duration-300 overflow-hidden">
      <header className="px-4 py-3 flex justify-between items-start gap-4">
        <div className="text-sm text-slate-700">
          <p>{isFinal ? new Date(game.date).toLocaleDateString() : formatGameTime(game.date)}</p>
          {game.broadcast && <p className="text-xs text-slate-500">{game.broadcast}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          {isFinal ? (
            <span className="font-bold text-slate-800">FINAL</span>
          ) : game.indoor ? (
            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
              Indoors
            </span>
          ) : (
            <>
              {getWeatherDisplay(game.weather.condition)}
              <span>{game.weather.temperature}°F</span>
            </>
          )}
        </div>
      </header>

      <div className="p-2">
        <TeamSection team={game.awayTeam} isHome={false} score={game.awayScore} isWinner={isAwayWinner} isFinal={isFinal} />
        <TeamSection team={game.homeTeam} isHome={true} score={game.homeScore} isWinner={isHomeWinner} isFinal={isFinal} />
      </div>

      {!isFinal && displayOdds && (
        <SimplifiedOddsRow 
            odds={displayOdds} 
            homeAbbr={game.homeTeam.abbreviation}
            awayAbbr={game.awayTeam.abbreviation}
        />
      )}

      {isFinal && game.bettingResult && (
         <div className="p-3 bg-slate-50/70 border-t border-slate-100 text-center text-xs">
            <span className="font-bold text-slate-700 mr-2">{game.bettingResult.spreadCoveredBy} {game.bettingResult.spreadResult}</span>
            <span className="text-slate-400">|</span>
            <span className="font-bold text-slate-700 ml-2">{game.bettingResult.totalResult} {game.bettingResult.closingTotal}</span>
         </div>
      )}

      <footer className="px-4 py-2 text-center text-xs text-slate-400 border-t border-slate-100">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="w-3 h-3" />
          <span>{game.venue} • {game.venueLocation}</span>
        </div>
      </footer>
    </Link>
  );
}