"use client";

import { useState, useEffect } from "react";
import { getPlayoffPicture } from "@/services/playoffService";
import { PlayoffConference, PlayoffPicture, PlayoffTeam } from "@/types/nfl";
import { PlayoffMatchupCard } from "./PlayoffMatchupCard";
import Image from "next/image";
import { LoadingSpinner } from "../ui/LoadingSpinner";

import { Info } from "lucide-react";

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
                {team.logoUrl ? (
                    <Image src={team.logoUrl} alt={team.name} width={52} height={52} className="object-contain" />
                ) : (
                    <div className="w-[52px] h-[52px] bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-slate-400 font-bold uppercase">TBD</span>
                    </div>
                )}
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
                            {team.logoUrl && <Image src={team.logoUrl} alt="" width={24} height={24} />}
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
                        {team.logoUrl && <Image src={team.logoUrl} alt="" width={16} height={16} />}
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
            clinchStatus: 'NONE'
        });
    }
    
    const [seed1, seed2, seed3, seed4, seed5, seed6, seed7] = teams;

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-2xl font-black mb-6 text-slate-800 tracking-tight uppercase flex items-center justify-between">
                <span>{conference.name} Bracket</span>
                <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full tracking-[0.2em]">Live</span>
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

export function PlayoffsTab() {
  const [playoffPicture, setPlayoffPicture] = useState<PlayoffPicture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
        try {
            setIsLoading(true);
            const data = await getPlayoffPicture();
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
    fetchData();
  }, []);

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
    <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
            <ConferencePlayoffView conference={playoffPicture.nfc} />
            <ConferencePlayoffView conference={playoffPicture.afc} />
        </div>
        
        <footer className="pt-12 border-t border-slate-200 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
                Legend: * - Clinched Home-Field Advantage | Z - Clinched Division | X - Clinched Playoff | E - Eliminated
            </p>
        </footer>
    </div>
  );
}