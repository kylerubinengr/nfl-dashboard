import { PlayoffPicture, PlayoffTeam } from "@/types/nfl";
import Image from "next/image";

const TeamSlot = ({ team, placeholder }: { team?: PlayoffTeam, placeholder: string }) => {
    if (!team) {
        return (
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded opacity-50">
                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">?</div>
                <span className="text-xs font-bold text-slate-400 uppercase">{placeholder}</span>
            </div>
        )
    }
    return (
        <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded shadow-sm">
            <div className="w-6 h-6 relative flex-shrink-0">
                {team.logoUrl ? (
                    <Image src={team.logoUrl} alt={team.abbreviation} fill className="object-contain" />
                ) : (
                    <div className="w-full h-full bg-slate-100 rounded-full" />
                )}
            </div>
            <div className="flex items-baseline gap-1.5 overflow-hidden">
                <span className="text-[10px] font-black text-slate-400">#{team.seed}</span>
                <span className="text-xs font-bold text-slate-900 truncate">{team.name}</span>
            </div>
        </div>
    );
};

const MatchupNode = ({ home, away, label }: { home?: PlayoffTeam, away?: PlayoffTeam, label?: string }) => (
    <div className="flex flex-col justify-center relative my-2">
        {label && <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 text-center">{label}</div>}
        <div className="space-y-1 relative z-10">
             <TeamSlot team={home} placeholder="Home Team" />
             <TeamSlot team={away} placeholder="Away Team" />
        </div>
        {/* Connector logic could go here if we weren't using grid gap */}
    </div>
);

const ByeNode = ({ team, label }: { team?: PlayoffTeam, label: string }) => (
     <div className="flex flex-col justify-center relative my-2">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 text-center">{label}</div>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded shadow-sm flex flex-col items-center text-center space-y-2">
            <span className="text-[10px] font-black text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full uppercase tracking-wider">First Round Bye</span>
             {team ? (
                <>
                    {team.logoUrl && <Image src={team.logoUrl} alt={team.abbreviation} width={40} height={40} className="object-contain" />}
                    <div>
                        <div className="text-[10px] font-black text-slate-400">#{team.seed} Seed</div>
                        <div className="text-sm font-black text-slate-900 leading-tight">{team.name}</div>
                    </div>
                </>
             ) : (
                 <span className="text-xs text-slate-400 font-bold">TBD</span>
             )}
        </div>
    </div>
)

const EmptyNode = ({ label }: { label: string }) => (
    <div className="flex flex-col justify-center relative my-2 opacity-50">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 text-center">{label}</div>
        <div className="border-2 border-dashed border-slate-200 rounded p-4 flex items-center justify-center h-[86px]">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">TBD</span>
        </div>
    </div>
)


const SuperBowlNode = () => (
    <div className="flex flex-col justify-center h-full">
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Super Bowl LIX</div>
         <div className="flex flex-col items-center justify-center border-4 border-slate-100 rounded-xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 h-64 shadow-inner">
            <div className="w-16 h-16 rounded-full bg-slate-200 mb-4 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
            </div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest text-center">Caesars Superdome<br/>New Orleans, LA</span>
         </div>
    </div>
)

export const BracketView = ({ playoffPicture }: { playoffPicture: PlayoffPicture }) => {
    
    // Helper to get teams by seed (1-based index)
    const getTeam = (teams: PlayoffTeam[], seed: number) => teams.find(t => t.seed === seed);

    const afcTeams = playoffPicture.afc.teams;
    const nfcTeams = playoffPicture.nfc.teams;

    return (
        <div className="space-y-12 overflow-x-auto pb-8">
            {/* AFC Bracket */}
            <div className="min-w-[800px]">
                <h3 className="text-lg font-black text-red-700 uppercase tracking-widest mb-6 border-b border-red-100 pb-2">American Football Conference</h3>
                <div className="grid grid-cols-4 gap-8">
                    {/* Round 1: Wild Card */}
                    <div className="flex flex-col justify-around gap-4">
                        <MatchupNode 
                            home={getTeam(afcTeams, 2)} 
                            away={getTeam(afcTeams, 7)} 
                            label="Wild Card" 
                        />
                        <MatchupNode 
                            home={getTeam(afcTeams, 3)} 
                            away={getTeam(afcTeams, 6)} 
                            label="Wild Card" 
                        />
                        <MatchupNode 
                            home={getTeam(afcTeams, 4)} 
                            away={getTeam(afcTeams, 5)} 
                            label="Wild Card" 
                        />
                    </div>

                    {/* Round 2: Divisional */}
                    <div className="flex flex-col justify-around gap-12">
                         <ByeNode team={getTeam(afcTeams, 1)} label="Divisional Round" />
                         <EmptyNode label="Divisional Round" />
                    </div>

                    {/* Round 3: Championship */}
                    <div className="flex flex-col justify-center">
                        <EmptyNode label="AFC Championship" />
                    </div>

                    {/* Super Bowl Placeholder (Half) */}
                    <div className="flex flex-col justify-center opacity-20">
                         <div className="border-l-2 border-dashed border-slate-300 h-full flex items-center pl-4">
                             <span className="text-xs font-bold -rotate-90 whitespace-nowrap">To Super Bowl</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* NFC Bracket */}
            <div className="min-w-[800px]">
                <h3 className="text-lg font-black text-blue-700 uppercase tracking-widest mb-6 border-b border-blue-100 pb-2">National Football Conference</h3>
                <div className="grid grid-cols-4 gap-8">
                     {/* Round 1: Wild Card */}
                     <div className="flex flex-col justify-around gap-4">
                        <MatchupNode 
                            home={getTeam(nfcTeams, 2)} 
                            away={getTeam(nfcTeams, 7)} 
                            label="Wild Card" 
                        />
                        <MatchupNode 
                            home={getTeam(nfcTeams, 3)} 
                            away={getTeam(nfcTeams, 6)} 
                            label="Wild Card" 
                        />
                        <MatchupNode 
                            home={getTeam(nfcTeams, 4)} 
                            away={getTeam(nfcTeams, 5)} 
                            label="Wild Card" 
                        />
                    </div>

                    {/* Round 2: Divisional */}
                    <div className="flex flex-col justify-around gap-12">
                         <ByeNode team={getTeam(nfcTeams, 1)} label="Divisional Round" />
                         <EmptyNode label="Divisional Round" />
                    </div>

                    {/* Round 3: Championship */}
                    <div className="flex flex-col justify-center">
                        <EmptyNode label="NFC Championship" />
                    </div>

                     {/* Super Bowl Placeholder (Half) */}
                     <div className="flex flex-col justify-center opacity-20">
                         <div className="border-l-2 border-dashed border-slate-300 h-full flex items-center pl-4">
                             <span className="text-xs font-bold -rotate-90 whitespace-nowrap">To Super Bowl</span>
                         </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                    <span className="font-black">RESEEDING:</span> The highest remaining seed always plays the lowest remaining seed in each round.
                    <br/>
                    The higher seed (lower number) is always the host.
                </p>
            </div>
        </div>
    );
};
