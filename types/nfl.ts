export type Team = {
  id: string;
  name: string;
  abbreviation: string;
  record: string;
  logoUrl: string;
  clinchedPlayoffs: boolean;
  color?: string;
  colors?: {
    primary: string;
    lightAccent: string;
    darkAccent: string;
  };
};

export type WeatherInfo = {
  temperature: number;
  condition: string;
  windSpeed: number;
  precipChance: number;
  lastUpdated?: number;
};

export type BettingOdds = {
  spread: number;
  total: number;
  moneylineHome: number;
  moneylineAway: number;
  movement?: 'up' | 'down' | 'stable';
};

export type Bookmaker = {
  key: string;
  title: string;
  lastUpdate: string;
  odds: BettingOdds;
};

export type StatLeader = {
  name: string;
  value: string;
  category: string;
  teamAbbreviation: string;
  logoUrl?: string;
  detailedStats?: { [key: string]: string };
  rank?: number;
  espnId?: string;
};

export type BoxScoreData = {
  passing: {
    headers: string[];
    players: { name: string; stats: string[] }[];
    totals: string[];
  };
  rushing: {
    headers: string[];
    players: { name: string; stats: string[] }[];
    totals: string[];
  };
  receiving: {
    headers: string[];
    players: { name: string; stats: string[] }[];
    totals: string[];
  };
  fumbles?: {
    headers: string[];
    players: { name: string; stats: string[] }[];
    totals: string[];
  };
};

export type MatchupStats = {
  home: {
    passingLeader?: StatLeader;
    rushingLeader?: StatLeader;
    receivingLeader?: StatLeader;
    boxscore?: BoxScoreData;
  };
  away: {
    passingLeader?: StatLeader;
    rushingLeader?: StatLeader;
    receivingLeader?: StatLeader;
    boxscore?: BoxScoreData;
  };
};

export type PlayoffTeam = {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl: string;
  seed: number;
  record: string;
  clinchStatus: 'CLINCHED_HOMEFIELD' | 'CLINCHED_DIVISION' | 'CLINCHED_PLAYOFF' | 'ELIMINATED' | 'NONE';
  tiebreakerReason?: string;
  magicNumber?: number;
  scenarios?: string;
  gamesBehind?: string;
};

export type PlayoffConference = {
  name: 'AFC' | 'NFC';
  teams: PlayoffTeam[];
  inTheHunt: PlayoffTeam[];
  eliminated: PlayoffTeam[];
};

export type PlayoffPicture = {
  afc: PlayoffConference;
  nfc: PlayoffConference;
};

export type TeamBoxscore = {
    passingYards: number;
    rushingYards: number;
    turnovers: number;
    sacks?: number;
    interceptions?: number;
    defensiveTD?: number;
};

export type BettingResult = {
    spreadCoveredBy: string; // Team abbreviation or 'PUSH'
    spreadResult: string; // e.g., 'Covered -3.5'
    totalResult: 'OVER' | 'UNDER' | 'PUSH';
    closingTotal: number;
};

export type ScoringPlay = {
    id: string;
    quarter: number;
    clock: string;
    text: string;
    type: string;
    team: {
        id: string;
        abbreviation: string;
        logo: string;
    };
    scoreValue: number;
    awayScore: number;
    homeScore: number;
};

export type Linescore = {
    displayValue: string;
    label: string;
};

export type PlayByPlay = {
    id: string;
    driveId?: string;
    clock: string;
    text: string;
    type: string;
    down?: number;
    distance?: number;
    yardLine?: number;
    yardsGained?: number;
    quarter?: number;
    isScore?: boolean;
    wallclock?: string;
    team?: {
        id: string;
        logo: string;
    };
};

export type Drive = {
    id: string;
    description: string;
    team: { id: string; logo: string; abbreviation: string; color?: string };
    result: string;
    plays: PlayByPlay[];
    yards: number;
    timeElapsed: string;
    playCount: number;
    startClock: string;
    isScore: boolean;
    startQuarter?: number;
    endQuarter?: number;
    homeScoreAfter?: number;
    awayScoreAfter?: number;
};

export type Game = {
  id: string;
  week: number;
  date: string;
  venue: string;
  venueLocation: string;
  homeTeam: Team;
  awayTeam: Team;
  bookmakers: Bookmaker[];
  weather: WeatherInfo;
  broadcast: string;
  isLive?: boolean;
  indoor: boolean;
  matchupStats?: MatchupStats;
  scoringPlays?: ScoringPlay[];
  linescores?: { home: Linescore[], away: Linescore[] };
  // Historical/Result data
  status: 'pre' | 'in' | 'post';
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
  boxscore?: { home: TeamBoxscore, away: TeamBoxscore };
  bettingResult?: BettingResult;
  drives?: Drive[];
};
