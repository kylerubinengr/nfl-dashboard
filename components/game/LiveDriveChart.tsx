"use client";

import { useState, useEffect } from "react";
import { Drive, PlayByPlay } from "@/types/nfl";
import { SafeImage } from "../common/SafeImage";
import { ChevronDown, ChevronUp, Radio } from "lucide-react";

interface LiveDriveChartProps {
  drives: Drive[];
  isLive?: boolean;
}

export function LiveDriveChart({ drives, isLive }: LiveDriveChartProps) {
  const [expandedDriveIds, setExpandedDriveIds] = useState<Set<string>>(new Set());

  // Auto-expand the most recent drive if live
  useEffect(() => {
    if (drives.length > 0 && isLive) {
        const latestDriveId = drives[0].id; // drives are reversed in service
        setExpandedDriveIds(prev => {
            const next = new Set(prev);
            next.add(latestDriveId);
            return next;
        });
    }
  }, [drives, isLive]);

  const toggleDrive = (id: string) => {
    setExpandedDriveIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        return next;
    });
  };

  if (!drives || drives.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden mb-6">
      <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            {isLive && <Radio className="w-2.5 h-2.5 text-red-500 animate-pulse" />}
            Drive Chart
        </h3>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {drives.map((drive, index) => (
             <DriveGroup 
                key={`${drive.id}-${index}`} 
                drive={drive} 
                isExpanded={expandedDriveIds.has(drive.id)} 
                onToggle={() => toggleDrive(drive.id)} 
             />
        ))}
      </div>
    </div>
  );
}

function DriveGroup({ drive, isExpanded, onToggle }: { drive: Drive, isExpanded: boolean, onToggle: () => void }) {
    const result = drive.result || "";
    const isSuccess = drive.isScore || result.includes("Touchdown") || result.includes("Field Goal");
    const isTurnover = result.includes("Interception") || result.includes("Fumble") || result.includes("Downs");

    const badgeColor = isSuccess ? "bg-green-100 text-green-700 border-green-200" 
                     : isTurnover ? "bg-red-100 text-red-700 border-red-200" 
                     : "bg-slate-100 text-slate-500 border-slate-200";

    return (
        <div className="group">
            {/* Drive Header */}
            <button 
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-2.5 md:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 relative">
                        <SafeImage src={drive.team.logo} alt="" width={28} height={28} />
                        {isExpanded && <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-200 dark:bg-slate-700 -z-10" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                             <span className="font-black text-slate-900 dark:text-slate-100 text-xs">{drive.description || `Drive ${drive.id}`}</span>
                             <span className={`text-[8px] font-bold px-1 py-0.5 rounded border uppercase ${badgeColor}`}>
                                {drive.result}
                             </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {drive.playCount} plays • {drive.yards} yds • {drive.timeElapsed}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
            </button>

            {/* Expanded Plays */}
            {isExpanded && (
                <div className="pl-[2.1rem] md:pl-[2.3rem] pr-2 pb-1.5">
                    <div className="border-l border-slate-200 dark:border-slate-700 pl-3.5 space-y-2 pt-1 pb-1" style={{ borderColor: drive.team.color || undefined }}>
                        {drive.plays.map((play) => (
                            <PlayItem key={play.id} play={play} teamColor={drive.team.color} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function PlayItem({ play, teamColor }: { play: PlayByPlay, teamColor?: string }) {
    return (
        <div className="relative pb-1.5 last:pb-0">
             {/* Timeline dot */}
             <div className="absolute -left-[1.15rem] top-1.5 w-2 h-2 rounded-full border border-white dark:border-slate-900 shadow-sm" style={{ backgroundColor: teamColor || '#94a3b8' }} />
             
             <div className="flex items-baseline justify-between gap-4">
                 <div className="text-[9px] font-bold text-slate-400 font-mono whitespace-nowrap uppercase">
                    {play.down && play.distance ? `${getOrdinal(play.down)} & ${play.distance}` : play.clock}
                    {play.yardLine && ` @ ${play.yardLine > 50 ? `OPP ${100 - play.yardLine}` : `OWN ${play.yardLine}`}`}
                 </div>
                 <div className="text-[9px] text-slate-400 font-mono">{play.clock}</div>
             </div>

             <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 mt-0.5 leading-tight tracking-tight">
                {play.text}
             </p>

             <div className="mt-0.5 flex items-center gap-2">
                 <span className={`text-[9px] font-black uppercase ${play.yardsGained && play.yardsGained > 0 ? 'text-green-600' : play.yardsGained && play.yardsGained < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                    {play.yardsGained !== undefined ? (play.yardsGained > 0 ? `+${play.yardsGained} yds` : `${play.yardsGained} yds`) : ''}
                 </span>
                 {play.type && <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded uppercase tracking-tighter">{play.type}</span>}
             </div>
        </div>
    );
}

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
