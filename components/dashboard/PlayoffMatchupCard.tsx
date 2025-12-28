import { PlayoffTeam } from "@/types/nfl";
import { SafeImage } from "../common/SafeImage";

interface PlayoffMatchupCardProps {
    homeTeam: PlayoffTeam;
    awayTeam: PlayoffTeam;
}

const TeamDisplay = ({ team, alignment }: { team: PlayoffTeam, alignment: 'left' | 'right' }) => (
    <div className={`flex items-center gap-3 ${alignment === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
        <SafeImage 
            src={team.logoUrl} 
            alt={team.name} 
            width={32} 
            height={32}
            initials={team.abbreviation}
            fallbackClassName="rounded-full"
        />
        <div className={alignment === 'right' ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-bold text-slate-400">{team.record}</p>
            <p className="font-semibold text-slate-700">{team.name}</p>
        </div>
    </div>
);

export const PlayoffMatchupCard = ({ homeTeam, awayTeam }: PlayoffMatchupCardProps) => {
    return (
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-black text-slate-400 text-sm">{awayTeam.seed}</span>
                    <TeamDisplay team={awayTeam} alignment="left" />
                </div>
                <div className="text-sm font-black text-slate-300">@</div>
                <div className="flex items-center gap-2">
                    <TeamDisplay team={homeTeam} alignment="right" />
                    <span className="font-black text-slate-400 text-sm">{homeTeam.seed}</span>
                </div>
            </div>
        </div>
    )
}