import { getGameById, getGamesByWeek } from "@/services/gameService";
import { getMatchupComparison } from "@/services/matchupService";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Wind, Thermometer, Home, TrendingUp } from "lucide-react";
import { OddsTable } from "@/components/dashboard/OddsTable";
import { StatTable } from "@/components/dashboard/StatTable";
import { ScoringSummary } from "@/components/game/ScoringSummary";
import { AdvancedMatchupEngine } from "@/components/game/AdvancedMatchupEngine";
import { formatGameTime } from "@/lib/utils";
import { BettingOdds } from "@/types/nfl";
import { SafeImage } from "@/components/common/SafeImage";
import LiveGameView from "@/components/game/LiveGameView";

export const dynamicParams = true;

export async function generateStaticParams() {
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
  const results = await Promise.all(
    weeks.map((week) => getGamesByWeek(week))
  );
  const flatGames = results.flatMap(r => r.games);
  return flatGames.map((game) => ({ id: game.id }));
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await getGameById(id);

  if (!game) {
    notFound();
  }

  const isLive = game.isLive || game.status === 'in';

  if (isLive) {
      return (
        <div className="container mx-auto px-4 pb-4 pt-0 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 max-w-7xl">
            <nav className="flex justify-between items-center mb-6">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                <Link href="/" className="hover:text-blue-500 dark:hover:text-blue-400">Home</Link>
                <span className="mx-2">&gt;</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
                </span>
                </div>
                <Link href="/" className="flex items-center gap-2 text-sm text-blue-500 hover:underline dark:text-blue-400">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
                </Link>
            </nav>
            <LiveGameView initialGame={game} />
        </div>
      );
  }

  const isFinal = game.status === 'post';
  const matchupComparison = !isFinal ? await getMatchupComparison(game.homeTeam.id, game.awayTeam.id) : null;

  // Consensus Odds Calculation
  const consensusOdds: BettingOdds | null = game.bookmakers.length > 0 ? {
    spread: game.bookmakers.reduce((acc, b) => acc + b.odds.spread, 0) / game.bookmakers.length,
    total: game.bookmakers.reduce((acc, b) => acc + b.odds.total, 0) / game.bookmakers.length,
    moneylineHome: 0,
    moneylineAway: 0,
  } : null;

  let impliedHomeScore = 0;
  let impliedAwayScore = 0;
  let hasImpliedTotals = false;

  if (consensusOdds && consensusOdds.total > 0) {
      const total = consensusOdds.total;
      const spread = consensusOdds.spread;
      const absSpread = Math.abs(spread);
      const favoredScore = (total + absSpread) / 2;
      const underdogScore = (total - absSpread) / 2;
      if (spread < 0) {
          impliedHomeScore = favoredScore;
          impliedAwayScore = underdogScore;
      } else {
          impliedAwayScore = favoredScore;
          impliedHomeScore = underdogScore;
      }
      hasImpliedTotals = true;
  }

  return (
    <div className="container mx-auto px-4 pb-4 pt-0 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 max-w-7xl">
      <nav className="flex justify-between items-center mb-6">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-500 dark:hover:text-blue-400">Home</Link>
          <span className="mx-2">&gt;</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
          </span>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm text-blue-500 hover:underline dark:text-blue-400">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </nav>

      <header className="text-center mb-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          <div className="flex flex-col items-center gap-3">
            <SafeImage src={game.awayTeam.logoUrl} alt={game.awayTeam.name} width={80} height={80} className="drop-shadow-sm" />
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{game.awayTeam.name}</h2>
                <p className="text-slate-500 text-sm font-bold dark:text-slate-400">{game.awayTeam.record}</p>
                {isFinal && <p className="text-4xl font-black mt-2 dark:text-slate-100">{game.awayScore}</p>}
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="text-xl font-black text-slate-200 bg-slate-50 px-4 py-1 rounded-full dark:bg-slate-800 dark:text-slate-600">{isFinal ? 'FINAL' : 'VS'}</div>
            <p className="text-sm font-bold text-slate-600 mt-2 dark:text-slate-400">{formatGameTime(game.date)}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold dark:text-slate-500">
                <MapPin className="w-3 h-3" />
                <span>{game.venue}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <SafeImage src={game.homeTeam.logoUrl} alt={game.homeTeam.name} width={80} height={80} className="drop-shadow-sm" />
             <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{game.homeTeam.name}</h2>
                <p className="text-slate-500 text-sm font-bold dark:text-slate-400">{game.homeTeam.record}</p>
                {isFinal && <p className="text-4xl font-black mt-2 dark:text-slate-100">{game.homeScore}</p>}
            </div>
          </div>
        </div>
      </header>

      {isFinal ? (
        <div className="mt-8 border-t border-slate-100 pt-8 dark:border-slate-800">
            {game.scoringPlays && game.linescores && (
                 <ScoringSummary 
                    homeTeam={game.homeTeam}
                    awayTeam={game.awayTeam}
                    scoringPlays={game.scoringPlays}
                    homeLinescores={game.linescores.home}
                    awayLinescores={game.linescores.away}
                    homeScore={game.homeScore || 0}
                    awayScore={game.awayScore || 0}
                    drives={game.drives}
                 />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      ) : (
        <div className="space-y-8">
            {/* Top Row: Weather & Betting Side-by-Side - COMMENTED OUT
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                // Weather
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 h-full">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Wind className="w-5 h-5 text-blue-500" />
                        Game Conditions
                    </h3>
                    {game.indoor ? (
                        <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-[140px] flex flex-col justify-center items-center">
                            <Home className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="font-bold text-slate-700 dark:text-slate-200">Indoor (Dome)</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-wider dark:text-slate-400">Controlled Environment</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 h-[140px]">
                            <div className="p-3 bg-slate-50 rounded-lg text-center dark:bg-slate-800 flex flex-col justify-center">
                                <Thermometer className="w-4 h-4 mx-auto mb-1 text-slate-400"/>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Temp</span>
                                <span className="font-black text-slate-900 text-lg dark:text-slate-200">{game.weather.temperature}°F</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg text-center dark:bg-slate-800 flex flex-col justify-center">
                                <Home className="w-4 h-4 mx-auto mb-1 text-slate-400"/>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Sky</span>
                                <span className="font-black text-slate-900 text-xs dark:text-slate-200">{game.weather.condition}</span>
                            </div>
                        </div>
                    )}
                </div>

                // Betting
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Betting Intelligence</h3>
                        </div>
                        {hasImpliedTotals && (
                             <div className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                IMPLIED: {game.awayTeam.abbreviation} {impliedAwayScore.toFixed(0)} - {game.homeTeam.abbreviation} {impliedHomeScore.toFixed(0)}
                             </div>
                        )}
                    </div>
                    <OddsTable bookmakers={game.bookmakers} />
                </div>
            </div>
            */}

            {/* Bottom Row: Advanced Matchup Engine */}
            {matchupComparison && (
                <AdvancedMatchupEngine 
                    homeTeam={game.homeTeam} 
                    awayTeam={game.awayTeam} 
                    comparison={matchupComparison} 
                />
            )}
        </div>
      )}
    </div>
  );
}