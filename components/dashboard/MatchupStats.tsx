import { MatchupStats, StatLeader } from "@/types/nfl";
import Image from "next/image";

interface MatchupStatsProps {
  stats: MatchupStats;
  homeTeamName: string;
  awayTeamName: string;
}

const StatRow = ({ 
  homeLeader, 
  awayLeader, 
  label, 
  statKeys 
}: { 
  homeLeader?: StatLeader; 
  awayLeader?: StatLeader; 
  label: string;
  statKeys: string[];
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{label}</h4>
        <div className="flex gap-4 md:gap-8 text-xs font-semibold text-slate-400">
             {statKeys.map(k => <span key={k} className="min-w-[48px] md:min-w-[64px] text-right uppercase tracking-tighter">{k}</span>)}
        </div>
      </div>

      {/* Away Leader Row */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
           {awayLeader?.logoUrl ? (
             <Image src={awayLeader.logoUrl} alt={awayLeader.name} width={40} height={40} className="rounded-full bg-slate-100 object-cover" />
           ) : (
             <div className="w-10 h-10 rounded-full bg-slate-200" />
           )}
           <div>
             <p className="font-bold text-slate-900">{awayLeader?.name || "N/A"}</p>
             <p className="text-xs text-slate-500">{awayLeader?.teamAbbreviation}</p>
           </div>
        </div>
        <div className="flex gap-4 md:gap-8 text-sm font-mono text-slate-700">
             {statKeys.map(k => (
                 <span key={k} className="min-w-[48px] md:min-w-[64px] text-right font-bold tabular-nums">
                    {awayLeader?.detailedStats?.[k] || "-"}
                 </span>
             ))}
        </div>
      </div>

      {/* Home Leader Row */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
           {homeLeader?.logoUrl ? (
             <Image src={homeLeader.logoUrl} alt={homeLeader.name} width={40} height={40} className="rounded-full bg-slate-100 object-cover" />
           ) : (
             <div className="w-10 h-10 rounded-full bg-slate-200" />
           )}
           <div>
             <p className="font-bold text-slate-900">{homeLeader?.name || "N/A"}</p>
             <p className="text-xs text-slate-500">{homeLeader?.teamAbbreviation}</p>
           </div>
        </div>
        <div className="flex gap-4 md:gap-8 text-sm font-mono text-slate-700">
             {statKeys.map(k => (
                 <span key={k} className="min-w-[48px] md:min-w-[64px] text-right font-bold tabular-nums">
                    {homeLeader?.detailedStats?.[k] || "-"}
                 </span>
             ))}
        </div>
      </div>
    </div>
  );
};

export function MatchupStatsDisplay({ stats, homeTeamName, awayTeamName }: MatchupStatsProps) {
  return (
    <div className="space-y-2">
      <StatRow 
        label="Passing" 
        awayLeader={stats.away.passingLeader} 
        homeLeader={stats.home.passingLeader} 
        statKeys={["Yds", "TD", "INT"]}
      />
      <StatRow 
        label="Rushing" 
        awayLeader={stats.away.rushingLeader} 
        homeLeader={stats.home.rushingLeader} 
        statKeys={["Yds", "TD", "AVG"]}
      />
      <StatRow 
        label="Receiving" 
        awayLeader={stats.away.receivingLeader} 
        homeLeader={stats.home.receivingLeader} 
        statKeys={["Yds", "TD", "REC"]}
      />
    </div>
  );
}
