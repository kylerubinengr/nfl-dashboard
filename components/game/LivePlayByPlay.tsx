import { PlayByPlay } from "@/types/nfl";
import { SafeImage } from "../common/SafeImage";
import { ArrowDown, Clock } from "lucide-react";

interface LivePlayByPlayProps {
  plays: PlayByPlay[];
}

export function LivePlayByPlay({ plays }: LivePlayByPlayProps) {
  if (!plays || plays.length === 0) return null;

  // Filter out plays without text descriptions
  const validPlays = plays.filter(p => p.text).slice(0, 5); // Show last 5

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden mb-6">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <RadioPulse />
            Live Feed
        </h3>
        <span className="text-[10px] text-slate-400 font-bold">Last Updates</span>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {validPlays.map((play, index) => (
             <PlayItem key={index} play={play} isNew={index === 0} />
        ))}
      </div>
    </div>
  );
}

function PlayItem({ play, isNew }: { play: PlayByPlay, isNew: boolean }) {
    return (
        <div className={`flex items-start gap-4 p-3 md:p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isNew ? 'animate-in slide-in-from-top-2 duration-500 bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
             {/* Left: Team/Context */}
             <div className="flex-shrink-0 w-12 flex flex-col items-center gap-1 pt-1">
                {play.team?.logo ? (
                    <SafeImage src={play.team.logo} alt="Team" width={24} height={24} />
                ) : (
                    <div className="w-6 h-6 bg-slate-200 rounded-full" />
                )}
                <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">
                    {play.down && play.distance ? `${getOrdinal(play.down)} & ${play.distance}` : play.clock}
                </span>
             </div>

             {/* Center: Narrative */}
             <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    {play.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800 dark:text-slate-500">
                        {play.type}
                    </span>
                    {play.yardLine && (
                        <span className="text-[10px] text-slate-400 font-mono">
                            @ {play.yardLine > 50 ? `OPP ${100 - play.yardLine}` : `OWN ${play.yardLine}`}
                        </span>
                    )}
                </div>
             </div>

             {/* Right: Gain Indicator */}
             {play.yardsGained !== undefined && play.yardsGained !== 0 && (
                 <div className={`flex-shrink-0 flex flex-col items-end pt-1 ${play.yardsGained > 0 ? 'text-green-600' : 'text-red-500'}`}>
                     <span className="text-sm font-black flex items-center">
                        {play.yardsGained > 0 ? '+' : ''}{play.yardsGained}
                        <span className="text-[10px] ml-0.5 uppercase text-slate-400 font-bold">yds</span>
                     </span>
                 </div>
             )}
        </div>
    )
}

const RadioPulse = () => (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
    </span>
);

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
