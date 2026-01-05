"use client";

import { useState, useEffect, useMemo } from "react";
import { getPlayoffPicture } from "@/services/playoffService";
import { PlayoffConference, PlayoffPicture, PlayoffTeam } from "@/types/nfl";
import { PlayoffMatchupCard } from "./PlayoffMatchupCard";
import { SafeImage } from "../common/SafeImage";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { BracketView } from "./BracketView";
import { ConferenceStandingsTable, SortConfig } from "./ConferenceStandingsTable";
import { useSeason } from "@/context/SeasonContext";

import { Info, List, Network } from "lucide-react";

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

const ByeWeekCard = ({ team }: { team: PlayoffTeam }) => (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden p-5 space-y-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center w-12 justify-center">
                    <div className="text-3xl font-black text-slate-300">{team.seed}</div>
                    <ClinchBadge status={team.clinchStatus} />
                </div>
                <SafeImage 
                    src={team.logoUrl} 
                    alt={team.name} 
                    width={52} 
                    height={52} 
                    className="object-contain"
                    initials={team.abbreviation}
                    fallbackClassName="rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-lg text-slate-900 uppercase tracking-tight">{team.name}</p>
                    {team.tiebreakerReason && (
                        <div className="group relative">
                            <Info className="w-3.5 h-3.5 text-slate-300 hover:text-blue-500 cursor-help" />
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-50 normal-case tracking-normal font-medium leading-relaxed">
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
            </div>
            <span className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                First-Round Bye
            </span>
        </div>
        {team.scenarios && (
            <p className="ml-16 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded italic border border-blue-100">
                {team.scenarios}
            </p>
        )}
    </div>
);

const InTheHuntView = ({ teams }: { teams: PlayoffTeam[] }) => {
    if (teams.length === 0) return null;
    return (
        <div className="mt-8 bg-slate-100/50 rounded-xl p-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">In The Hunt</h4>
            <div className="space-y-3">
                {teams.map(team => (
                    <div key={team.id} className="flex items-center justify-between bg-white/50 p-3 rounded-lg border border-slate-200/50">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-300 w-4">{team.seed}</span>
                            <SafeImage src={team.logoUrl} alt="" width={24} height={24} initials={team.abbreviation} />
                            <div>
                                <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{team.name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{team.record}</p>
                            </div>
                        </div>
                        {team.gamesBehind && (
                            <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                {team.gamesBehind}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

const EliminatedView = ({ teams }: { teams: PlayoffTeam[] }) => {
    if (teams.length === 0) return null;
    return (
        <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Eliminated</h4>
            <div className="flex flex-wrap gap-2">
                {teams.map(team => (
                    <div key={team.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                        <SafeImage src={team.logoUrl} alt="" width={16} height={16} initials={team.abbreviation} />
                        <span className="text-[10px] font-bold text-slate-500">{team.abbreviation}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const ConferencePlayoffView = ({ conference }: { conference: PlayoffConference }) => {
    const teams = [...conference.teams];
    while(teams.length < 7) {
        teams.push({
            id: `tbd-${teams.length}`,
            name: "TBD",
            abbreviation: "TBD",
            logoUrl: "",
            seed: teams.length + 1,
            record: "0-0-0",
            wins: 0,
            losses: 0,
            ties: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            differential: 0,
            streak: '-',
            winPercentage: 0,
            clinchStatus: 'NONE'
        });
    }
    
    const [seed1, seed2, seed3, seed4, seed5, seed6, seed7] = teams;

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-2xl font-black mb-6 text-slate-800 tracking-tight uppercase flex items-center justify-between">
                <span>{conference.name} Bracket</span>
            </h3>
            <div className="space-y-4 flex-1">
                <ByeWeekCard team={seed1} />
                <PlayoffMatchupCard homeTeam={seed2} awayTeam={seed7} />
                <PlayoffMatchupCard homeTeam={seed3} awayTeam={seed6} />
                <PlayoffMatchupCard homeTeam={seed4} awayTeam={seed5} />
                <InTheHuntView teams={conference.inTheHunt} />
            </div>
            <EliminatedView teams={conference.eliminated} />
        </div>
    )
}

type ViewMode = 'STANDINGS' | 'BRACKET';
type SortKey = keyof PlayoffTeam;

export function PlayoffsTab() {
  const [playoffPicture, setPlayoffPicture] = useState<PlayoffPicture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('STANDINGS');
  const { selectedSeason } = useSeason();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'seed', direction: 'asc' });

  useEffect(() => {
    async function fetchData() {
        try {
            setIsLoading(true);
            const data = await getPlayoffPicture(selectedSeason);
            if (data) {
                setPlayoffPicture(data);
            } else {
                throw new Error("Could not retrieve playoff data.");
            }
        } catch (err) {
            setError("Failed to load playoff picture.");
        } finally {
            setIsLoading(false);
        }
    }
    
    const savedView = localStorage.getItem('playoffViewMode') as ViewMode;
    if (savedView) {
        setViewMode(savedView);
    }

    fetchData();
  }, [selectedSeason]);

  const sortedAfcTeams = useMemo(() => {
    if (!playoffPicture?.afc.allTeams) return [];
    const sorted = [...playoffPicture.afc.allTeams];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [playoffPicture, sortConfig]);

  const sortedNfcTeams = useMemo(() => {
    if (!playoffPicture?.nfc.allTeams) return [];
    const sorted = [...playoffPicture.nfc.allTeams];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [playoffPicture, sortConfig]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    // Default to 'asc' for string columns if it's the first time sorting them
    if (typeof sortedNfcTeams[0]?.[key] === 'string' && sortConfig.key !== key) {
        direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const toggleView = (mode: ViewMode) => {
      setViewMode(mode);
      localStorage.setItem('playoffViewMode', mode);
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
        </div>
    );
  }

  if (error || !playoffPicture) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 font-bold">{error || "Could not load playoff picture. Please try again later."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex justify-end">
            <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                    onClick={() => toggleView('STANDINGS')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'STANDINGS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <List className="w-4 h-4" />
                    List View
                </button>
                <button 
                    onClick={() => toggleView('BRACKET')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'BRACKET' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Network className="w-4 h-4" />
                    Bracket
                </button>
            </div>
        </div>

        {viewMode === 'STANDINGS' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <ConferenceStandingsTable
                    conference="NFC"
                    teams={sortedNfcTeams}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                />
                <ConferenceStandingsTable
                    conference="AFC"
                    teams={sortedAfcTeams}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                />
            </div>
        ) : (
            <BracketView playoffPicture={playoffPicture} />
        )}
        
        <footer className="pt-12 border-t border-slate-200 text-center dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed dark:text-slate-500">
                Legend: * - Clinched Home-Field Advantage | z - Clinched Division | y - Clinched Wild Card | e - Eliminated
            </p>
        </footer>
    </div>
  );
}