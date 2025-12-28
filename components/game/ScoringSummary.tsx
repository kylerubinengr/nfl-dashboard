import { Team, ScoringPlay, Linescore } from "@/types/nfl";
import { SafeImage } from "../common/SafeImage";

interface ScoringSummaryProps {
    homeTeam: Team;
    awayTeam: Team;
    scoringPlays: ScoringPlay[];
    homeLinescores: Linescore[];
    awayLinescores: Linescore[];
    homeScore: number;
    awayScore: number;
}

export function ScoringSummary({ 
    homeTeam, 
    awayTeam, 
    scoringPlays, 
    homeLinescores, 
    awayLinescores,
    homeScore,
    awayScore
}: ScoringSummaryProps) {
    
    const playsByQuarter: { [key: number]: ScoringPlay[] } = {};
    scoringPlays.forEach(play => {
        if (!playsByQuarter[play.quarter]) {
            playsByQuarter[play.quarter] = [];
        }
        playsByQuarter[play.quarter].push(play);
    });

    // Determine quarters based on linescores length to support OT dynamically
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
        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 dark:bg-slate-900 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest dark:text-slate-200">Scoring Summary</h3>
            </div>
            
            <div className="overflow-x-auto">
                <div 
                    className="grid min-w-[800px]"
                    style={{
                        gridTemplateColumns: `200px repeat(${quarters.length}, minmax(160px, 1fr)) 100px`
                    }}
                >
                    {/* Header Row */}
                    <div className="p-3 bg-slate-50 text-left font-black text-slate-400 uppercase text-xs tracking-wider border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500">Team</div>
                    {quarters.map(q => (
                        <div key={`header-${q}`} className="p-3 bg-slate-50 text-center font-black text-slate-400 uppercase text-xs border-b border-l border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-500">
                            {q > 4 ? 'OT' : q}
                        </div>
                    ))}
                    <div className="p-3 bg-slate-100 text-center font-black text-slate-800 uppercase text-xs border-b border-l border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-800">Total</div>

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
        </div>
    );
}