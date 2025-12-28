"use client";

import React, { useState } from "react";
import { Team, ScoringPlay, Linescore, Drive } from "@/types/nfl";
import { SafeImage } from "../common/SafeImage";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ScoringSummaryProps {
    homeTeam: Team;
    awayTeam: Team;
    scoringPlays: ScoringPlay[];
    homeLinescores: Linescore[];
    awayLinescores: Linescore[];
    homeScore: number;
    awayScore: number;
    drives?: Drive[];
}

const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function QuarterHeader({ quarter }: { quarter: number }) {
    return (
        <div className="sticky top-0 z-20 px-3 py-1.5 bg-slate-50 border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700 font-black text-[10px] text-slate-500 uppercase tracking-widest shadow-sm">
            {quarter > 4 ? 'Overtime' : `${getOrdinal(quarter)} Quarter`}
        </div>
    );
}

function DriveItem({ drive, homeAbbr, awayAbbr }: { drive: Drive, homeAbbr: string, awayAbbr: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-900 group">
            {/* Drive Header - Clickable */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative px-3 py-2 flex items-center justify-between border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-50 p-1 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center shadow-sm">
                            <SafeImage src={drive.team.logo} alt={drive.team.abbreviation} width={20} height={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest dark:text-slate-500">
                                {drive.team.abbreviation} Drive
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${drive.isScore ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                {drive.result}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                     {/* Possession Header Scoreboard */}
                     <div className="flex items-center gap-3 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            <span>{awayAbbr}</span>
                            <span className={`font-mono text-slate-900 dark:text-slate-100 ${drive.awayScoreAfter !== undefined && drive.awayScoreAfter > (drive.homeScoreAfter || 0) ? 'text-slate-900 dark:text-white' : ''}`}>
                                {drive.awayScoreAfter ?? 0}
                            </span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">-</span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            <span className={`font-mono text-slate-900 dark:text-slate-100 ${drive.homeScoreAfter !== undefined && drive.homeScoreAfter > (drive.awayScoreAfter || 0) ? 'text-slate-900 dark:text-white' : ''}`}>
                                {drive.homeScoreAfter ?? 0}
                            </span>
                            <span>{homeAbbr}</span>
                        </div>
                    </div>

                     <div className="text-right text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 leading-tight hidden sm:block">
                        <span>{drive.playCount} plays, {drive.yards} yds</span>
                        <span className="mx-1.5 opacity-50">|</span>
                        <span>{drive.timeElapsed}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </div>
            
            {/* Plays List - Conditional Render */}
            {isExpanded && (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50 bg-slate-50/20 dark:bg-black/10">
                    {drive.plays.map((play) => (
                        <div key={play.id} className="flex gap-3 p-2.5 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/30 pl-6 border-l-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <div className="w-14 flex-shrink-0 flex flex-col items-center pt-0.5">
                                <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">{play.clock}</span>
                                <span className="block text-[8px] text-slate-400 uppercase font-bold mt-0.5 dark:text-slate-500">
                                    {play.down && play.distance ? `${getOrdinal(play.down)} & ${play.distance}` : ''}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                     <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 rounded text-slate-400 tracking-wider dark:bg-slate-800 dark:text-slate-500">{play.type}</span>
                                     {play.yardLine && (
                                        <span className="text-[9px] text-slate-400 font-mono dark:text-slate-500">
                                            {play.yardLine > 50 ? `OPP ${100 - play.yardLine}` : `OWN ${play.yardLine}`}
                                        </span>
                                     )}
                                     {play.yardsGained !== undefined && play.yardsGained !== 0 && (
                                         <span className={`text-[9px] font-black ml-auto ${play.yardsGained > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                            {play.yardsGained > 0 ? '+' : ''}{play.yardsGained} yds
                                         </span>
                                     )}
                                </div>
                                <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug font-medium">
                                    {play.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function ScoringSummary({ 
    homeTeam, 
    awayTeam, 
    scoringPlays, 
    homeLinescores, 
    awayLinescores,
    homeScore,
    awayScore,
    drives
}: ScoringSummaryProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'pbp'>('summary');
    
    // --- Scoring Summary Logic ---
    const playsByQuarter: { [key: number]: ScoringPlay[] } = {};
    scoringPlays.forEach(play => {
        if (!playsByQuarter[play.quarter]) {
            playsByQuarter[play.quarter] = [];
        }
        playsByQuarter[play.quarter].push(play);
    });

    const maxQuarters = Math.max(
        homeLinescores.length, 
        awayLinescores.length, 
        4,
        ...Object.keys(playsByQuarter).map(Number)
    );
    
    const quarters = Array.from({ length: maxQuarters }, (_, i) => i + 1);

    const getScore = (scores: Linescore[], quarterIndex: number) => {
        return scores[quarterIndex]?.displayValue || "0";
    }

    const getRunningScoreText = (play: ScoringPlay) => {
        const isHome = play.team.id === homeTeam.id || play.team.abbreviation === homeTeam.abbreviation;
        const scoringTeam = isHome ? homeTeam.abbreviation : awayTeam.abbreviation;
        const opposingTeam = isHome ? awayTeam.abbreviation : homeTeam.abbreviation;
        const scoreA = isHome ? play.homeScore : play.awayScore;
        const scoreB = isHome ? play.awayScore : play.homeScore;

        return {
            scoringTeam,
            scoreString: `${scoreA} - ${scoreB}`,
            opposingTeam
        };
    };
    
    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 dark:bg-slate-900 dark:border-slate-800 flex flex-col h-[600px]">
            {/* Tabs Header */}
            <div className="flex-shrink-0 flex border-b border-slate-100 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-800">
                <button 
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'summary' ? 'bg-white text-blue-600 border-b-2 border-blue-600 dark:bg-slate-900 dark:text-blue-400' : 'text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-300'}`}
                >
                    Scoring Summary
                </button>
                <button 
                    onClick={() => setActiveTab('pbp')}
                    className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-colors ${activeTab === 'pbp' ? 'bg-white text-blue-600 border-b-2 border-blue-600 dark:bg-slate-900 dark:text-blue-400' : 'text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-300'}`}
                >
                    Play by Play
                </button>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'summary' ? (
                    <div className="overflow-x-auto h-full">
                        <div 
                            className="grid min-w-[800px]"
                            style={{
                                gridTemplateColumns: `200px repeat(${quarters.length}, minmax(160px, 1fr)) 100px`
                            }}
                        >
                            {/* Header Row */}
                            <div className="p-3 bg-slate-50 text-left font-black text-slate-400 uppercase text-xs tracking-wider border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500 sticky top-0 z-10">Team</div>
                            {quarters.map(q => (
                                <div key={`header-${q}`} className="p-3 bg-slate-50 text-center font-black text-slate-400 uppercase text-xs border-b border-l border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500 sticky top-0 z-10">
                                    {q > 4 ? 'OT' : q}
                                </div>
                            ))}
                            <div className="p-3 bg-slate-100 text-center font-black text-slate-800 uppercase text-xs border-b border-l border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-800 sticky top-0 z-10">Total</div>

                            {/* Away Team Row */}
                            <div className="p-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="relative w-6 h-6 flex-shrink-0">
                                    <SafeImage src={awayTeam.logoUrl} alt={awayTeam.abbreviation} width={24} height={24} className="object-contain" />
                                </div>
                                <span className="font-bold text-slate-700 text-sm dark:text-slate-200">{awayTeam.name}</span>
                            </div>
                            {quarters.map((q, i) => (
                                <div key={`away-score-${q}`} className="p-3 flex items-center justify-center font-semibold text-slate-600 text-lg border-b border-l border-slate-100 dark:text-slate-400 dark:border-slate-800">
                                    {getScore(awayLinescores, i)}
                                </div>
                            ))}
                            <div className="p-3 flex items-center justify-center font-black text-slate-900 text-xl bg-slate-50 border-b border-l border-slate-100 dark:bg-slate-800/30 dark:text-slate-100 dark:border-slate-800">
                                {awayScore}
                            </div>

                            {/* Home Team Row */}
                            <div className="p-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="relative w-6 h-6 flex-shrink-0">
                                    <SafeImage src={homeTeam.logoUrl} alt={homeTeam.abbreviation} width={24} height={24} className="object-contain" />
                                </div>
                                <span className="font-bold text-slate-700 text-sm dark:text-slate-200">{homeTeam.name}</span>
                            </div>
                            {quarters.map((q, i) => (
                                <div key={`home-score-${q}`} className="p-3 flex items-center justify-center font-semibold text-slate-600 text-lg border-b border-l border-slate-100 dark:text-slate-400 dark:border-slate-800">
                                    {getScore(homeLinescores, i)}
                                </div>
                            ))}
                            <div className="p-3 flex items-center justify-center font-black text-slate-900 text-xl bg-slate-50 border-b border-l border-slate-100 dark:bg-slate-800/30 dark:text-slate-100 dark:border-slate-800">
                                {homeScore}
                            </div>

                            {/* Plays Row */}
                            <div className="bg-slate-50/50 border-r border-slate-100 dark:bg-slate-800/50 dark:border-slate-800"></div> {/* Empty under Team Name */}
                            {quarters.map(q => {
                                const quarterPlays = playsByQuarter[q] || [];
                                return (
                                    <div key={`plays-${q}`} className="p-3 space-y-4 border-l border-slate-100 px-4 dark:border-slate-800">
                                        {quarterPlays.length > 0 ? quarterPlays.map(play => {
                                            const { scoringTeam, scoreString, opposingTeam } = getRunningScoreText(play);
                                            return (
                                                <div key={play.id} className="mb-4 last:mb-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <SafeImage src={play.team.logo} alt={play.team.abbreviation} width={16} height={16} />
                                                        <span className="font-bold text-xs dark:text-slate-300">{play.type}</span>
                                                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{play.clock}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mb-1 dark:text-slate-400">{play.text}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-500">
                                                        <span className="font-bold text-slate-700 dark:text-slate-300">{scoringTeam}</span> {scoreString} {opposingTeam}
                                                    </p>
                                                </div>
                                            );
                                        }) : <div className="h-full w-full"></div>}
                                    </div>
                                )
                            })}
                            <div className="bg-slate-50/50 border-l border-slate-100 dark:bg-slate-800/50 dark:border-slate-800"></div> {/* Empty under Total */}
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-950 min-h-full">
                        {!drives || drives.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-slate-500 font-bold">No play-by-play data available.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-800 pb-8">
                                {drives.map((drive, index) => {
                                    const currentQ = drive.startQuarter || drive.endQuarter || 1;
                                    const prevDrive = drives[index - 1];
                                    const prevQ = prevDrive ? (prevDrive.startQuarter || prevDrive.endQuarter || 1) : -1;
                                    
                                    const showHeader = index === 0 || currentQ !== prevQ;
                                    
                                    return (
                                        <React.Fragment key={drive.id}>
                                            {showHeader && <QuarterHeader quarter={currentQ} />}
                                            <DriveItem 
                                                drive={drive} 
                                                homeAbbr={homeTeam.abbreviation} 
                                                awayAbbr={awayTeam.abbreviation} 
                                            />
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
