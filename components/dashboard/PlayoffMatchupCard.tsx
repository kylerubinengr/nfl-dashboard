import { PlayoffTeam } from "@/types/nfl";
import Image from "next/image";
import { Info } from "lucide-react";

interface PlayoffMatchupCardProps {
  homeTeam: PlayoffTeam;
  awayTeam: PlayoffTeam;
}

const ClinchBadge = ({ status }: { status: PlayoffTeam['clinchStatus'] }) => {
  switch (status) {
    case 'CLINCHED_HOMEFIELD':
      return <span className="ml-1 w-5 h-5 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center text-[10px] font-black border border-yellow-500 shadow-sm" title="Clinched Home Field Advantage">*</span>;
    case 'CLINCHED_DIVISION':
      return <span className="ml-1 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-black border border-green-600 shadow-sm" title="Clinched Division">Z</span>;
    case 'CLINCHED_PLAYOFF':
      return <span className="ml-1 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black border border-blue-600 shadow-sm" title="Clinched Playoff Berth">X</span>;
    case 'ELIMINATED':
      return <span className="ml-1 w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px] font-black border border-slate-500 shadow-sm" title="Eliminated from Playoffs">E</span>;
    default:
      return null;
  }
};

const TeamDisplay = ({ team }: { team: PlayoffTeam }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-4">
        <div className="flex items-center w-12 justify-center">
            <div className="text-3xl font-black text-slate-300">{team.seed}</div>
            <ClinchBadge status={team.clinchStatus} />
        </div>
        {team.logoUrl ? (
            <Image src={team.logoUrl} alt={team.name} width={52} height={52} className="object-contain" />
        ) : (
            <div className="w-[52px] h-[52px] bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-slate-400 font-bold uppercase">TBD</span>
            </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-black text-lg text-slate-900 truncate uppercase tracking-tight">{team.name}</p>
            {team.tiebreakerReason && (
                <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-slate-300 hover:text-blue-500 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-50">
                        {team.tiebreakerReason}
                    </div>
                </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-400">{team.record}</p>
            {team.magicNumber && (
                <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase">
                    Magic #: {team.magicNumber}
                </span>
            )}
          </div>
        </div>
        {team.clinchStatus === 'NONE' && team.seed > 0 && team.seed <= 10 && (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-400 tracking-tighter">
            {team.seed <= 7 ? 'Wild Card' : 'In the Hunt'}
          </span>
        )}
    </div>
    {team.scenarios && (
        <p className="ml-16 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded italic border border-blue-100">
            {team.scenarios}
        </p>
    )}
  </div>
);

export function PlayoffMatchupCard({ homeTeam, awayTeam }: PlayoffMatchupCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-5 space-y-4">
            <TeamDisplay team={awayTeam} />
            <div className="pl-12 text-slate-500 font-bold">@</div>
            <TeamDisplay team={homeTeam} />
        </div>
    </div>
  );
}
