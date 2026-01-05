import { Team } from "@/types/nfl";
import { SafeImage } from "../common/SafeImage";
import { MapPin, Calendar } from "lucide-react";

interface GameDetailHeaderProps {
  homeTeam: Team;
  awayTeam: Team;
  gameDate: string;
  venue: string;
  venueLocation: string;
  status: 'pre' | 'in' | 'post';
  homeScore?: number;
  awayScore?: number;
  broadcast?: string;
}

/**
 * GameDetailHeader Component
 *
 * Provides clear visual hierarchy for game detail pages:
 * 1. Game matchup as primary H1 header
 * 2. Team information prominently displayed
 * 3. Clean, modern design matching NFL Dashboard branding
 */
export function GameDetailHeader({
  homeTeam,
  awayTeam,
  gameDate,
  venue,
  venueLocation,
  status,
  homeScore,
  awayScore,
  broadcast,
}: GameDetailHeaderProps) {
  const isFinal = status === 'post';
  const isPre = status === 'pre';

  return (
    <div className="pt-6 mb-8">
      {/* Primary Header - Game Matchup */}
      <header className="bg-white rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {/* Main Content */}
        <div className="p-8">
          {/* Game Title - Clear H1 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
              {awayTeam.name} <span className="text-slate-400 dark:text-slate-600">@</span> {homeTeam.name}
            </h1>
            <div className="flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatGameDate(gameDate)}</span>
              </div>
              {broadcast && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="font-semibold">{broadcast}</span>
                </>
              )}
            </div>
          </div>

          {/* Teams Display */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            {/* Away Team */}
            <div className="flex flex-col items-center gap-3 flex-1 max-w-[200px]">
              <SafeImage
                src={awayTeam.logoUrl}
                alt={awayTeam.name}
                width={80}
                height={80}
                className="drop-shadow-sm"
              />
              <div className="text-center">
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {awayTeam.abbreviation}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {awayTeam.record}
                </div>
                {isFinal && (
                  <div className="text-4xl font-black mt-3 text-slate-900 dark:text-slate-100">
                    {awayScore}
                  </div>
                )}
              </div>
            </div>

            {/* VS / Final Indicator */}
            <div className="flex flex-col items-center gap-2">
              <div className={`text-xl font-black px-4 py-1 rounded-full ${
                isFinal
                  ? 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                  : 'text-slate-400 bg-slate-50 dark:bg-slate-800 dark:text-slate-600'
              }`}>
                {isFinal ? 'FINAL' : 'VS'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <MapPin className="w-3 h-3" />
                <span>{venue}</span>
              </div>
            </div>

            {/* Home Team */}
            <div className="flex flex-col items-center gap-3 flex-1 max-w-[200px]">
              <SafeImage
                src={homeTeam.logoUrl}
                alt={homeTeam.name}
                width={80}
                height={80}
                className="drop-shadow-sm"
              />
              <div className="text-center">
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {homeTeam.abbreviation}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {homeTeam.record}
                </div>
                {isFinal && (
                  <div className="text-4xl font-black mt-3 text-slate-900 dark:text-slate-100">
                    {homeScore}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Color Bar - Visual Branding */}
        <div className="h-1 w-full flex">
          <div
            className="h-full w-1/2"
            style={{ backgroundColor: awayTeam.colors?.primary || awayTeam.color || '#94a3b8' }}
          />
          <div
            className="h-full w-1/2"
            style={{ backgroundColor: homeTeam.colors?.primary || homeTeam.color || '#94a3b8' }}
          />
        </div>
      </header>
    </div>
  );
}

/**
 * Format game date for display
 */
function formatGameDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
