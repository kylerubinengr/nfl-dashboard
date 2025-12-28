import { Team } from "@/types/nfl";
import { SafeImage } from "../common/SafeImage";
import { Radio } from "lucide-react";

interface LiveGameHeaderProps {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  clock: string; // e.g., "10:45 - 2nd" or just "2nd"
}

export function LiveGameHeader({ homeTeam, awayTeam, homeScore, awayScore, clock }: LiveGameHeaderProps) {
  return (
    <header className="bg-white rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden mb-6">
      <div className="flex flex-row justify-between items-center p-6 md:px-12">
        {/* Away Team */}
        <div className="flex items-center gap-4 flex-1">
            <SafeImage src={awayTeam.logoUrl} alt={awayTeam.name} width={56} height={56} className="drop-shadow-sm" />
            <div className="text-left">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight hidden md:block">{awayTeam.name}</h2>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight md:hidden">{awayTeam.abbreviation}</h2>
                <p className="text-slate-500 text-xs font-bold dark:text-slate-400">{awayTeam.record}</p>
            </div>
            <div className="ml-auto md:ml-6 text-4xl font-black text-slate-900 dark:text-slate-100">{awayScore}</div>
        </div>
        
        {/* Center Live Status */}
        <div className="flex flex-col items-center justify-center px-6 min-w-[140px]">
            <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 animate-pulse mb-2">
                <Radio className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>
            <div className="text-sm font-black text-slate-700 dark:text-slate-200 whitespace-nowrap">
                {clock || "In Progress"}
            </div>
        </div>

        {/* Home Team */}
        <div className="flex items-center gap-4 flex-1 flex-row-reverse text-right">
            <SafeImage src={homeTeam.logoUrl} alt={homeTeam.name} width={56} height={56} className="drop-shadow-sm" />
            <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight hidden md:block">{homeTeam.name}</h2>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight md:hidden">{homeTeam.abbreviation}</h2>
                <p className="text-slate-500 text-xs font-bold dark:text-slate-400">{homeTeam.record}</p>
            </div>
             <div className="mr-auto md:mr-6 text-4xl font-black text-slate-900 dark:text-slate-100">{homeScore}</div>
        </div>
      </div>
      
      {/* Decorative Bottom Bar */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/2" style={{ backgroundColor: awayTeam.color || '#000' }} />
        <div className="h-full w-1/2" style={{ backgroundColor: homeTeam.color || '#000' }} />
      </div>
    </header>
  );
}
