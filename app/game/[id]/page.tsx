import { getGameById, getGamesByWeek } from "@/services/gameService";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Wind, Droplets, Thermometer, Home, TrendingUp } from "lucide-react";
import { OddsTable } from "@/components/dashboard/OddsTable";
import { StatTable } from "@/components/dashboard/StatTable";
import { formatGameTime } from "@/lib/utils";
import { BettingOdds } from "@/types/nfl";

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

  const isFinal = game.status === 'post';

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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <nav className="flex justify-between items-center mb-6">
        <div className="text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-500">Home</Link>
          <span className="mx-2">&gt;</span>
          <span className="font-semibold text-slate-700">
            {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
          </span>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </nav>

      <header className="text-center mb-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
          <div className="flex flex-col items-center gap-3">
            <Image src={game.awayTeam.logoUrl} alt={game.awayTeam.name} width={80} height={80} className="drop-shadow-sm" />
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">{game.awayTeam.name}</h2>
                <p className="text-slate-500 text-sm font-bold">{game.awayTeam.record}</p>
                {isFinal && <p className="text-4xl font-black mt-2">{game.awayScore}</p>}
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="text-xl font-black text-slate-200 bg-slate-50 px-4 py-1 rounded-full">{isFinal ? 'FINAL' : 'VS'}</div>
            <p className="text-sm font-bold text-slate-600 mt-2">{formatGameTime(game.date)}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold">
                <MapPin className="w-3 h-3" />
                <span>{game.venue}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Image src={game.homeTeam.logoUrl} alt={game.homeTeam.name} width={80} height={80} className="drop-shadow-sm" />
             <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">{game.homeTeam.name}</h2>
                <p className="text-slate-500 text-sm font-bold">{game.homeTeam.record}</p>
                {isFinal && <p className="text-4xl font-black mt-2">{game.homeScore}</p>}
            </div>
          </div>
        </div>
      </header>

      {isFinal ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 border-t border-slate-100 pt-8">
            {/* Away Team Stats */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                    <Image src={game.awayTeam.logoUrl} alt="" width={24} height={24} />
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
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                    <Image src={game.homeTeam.logoUrl} alt="" width={24} height={24} />
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-12">
                <div className="bg-slate-50 p-12 rounded-2xl text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Matchup Leaders & Box Score</p>
                    <p className="text-slate-300 text-sm mt-2">Available once the game begins.</p>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <Wind className="w-5 h-5 text-blue-500" />
                        Game Conditions
                    </h3>
                    {game.indoor ? (
                        <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-200">
                            <Home className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="font-bold text-slate-700">Indoor (Dome)</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-wider">Controlled Environment</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 rounded-lg text-center">
                                <Thermometer className="w-4 h-4 mx-auto mb-1 text-slate-400"/>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Temp</span>
                                <span className="font-black text-slate-900">{game.weather.temperature}°F</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg text-center">
                                <Home className="w-4 h-4 mx-auto mb-1 text-slate-400"/>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Sky</span>
                                <span className="font-black text-slate-900 text-xs">{game.weather.condition}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-slate-800">Betting Intelligence</h3>
                    </div>
                    {hasImpliedTotals && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Implied Points</h4>
                            <div className="p-4 bg-slate-900 rounded-lg text-center text-white">
                                <div className="flex justify-center items-center gap-4">
                                    <span className="font-black text-xl">{game.awayTeam.abbreviation} <span className="text-green-400">{impliedAwayScore.toFixed(1)}</span></span>
                                    <span className="text-slate-700">|</span>
                                    <span className="font-black text-xl">{game.homeTeam.abbreviation} <span className="text-green-400">{impliedHomeScore.toFixed(1)}</span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Live Market</h4>
                        <OddsTable bookmakers={game.bookmakers} />
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}