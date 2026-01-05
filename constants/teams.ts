/**
 * Consolidated NFL Team Data
 *
 * Single source of truth for all team information including:
 * - Team names and abbreviations
 * - Logo URLs
 * - Brand colors and styling
 * - ESPN and nflfastR ID mappings
 */

export const DEFAULT_NFL_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png';

/**
 * Unified team data structure
 */
export interface NFLTeam {
  abbreviation: string;
  name: string;
  city: string;
  logoUrl: string;
  espnId: string;
  nflfastrAbbr: string;
  division: 'NFC East' | 'NFC North' | 'NFC South' | 'NFC West' | 'AFC East' | 'AFC North' | 'AFC South' | 'AFC West';
  conference: 'NFC' | 'AFC';
  branding: {
    primary: string;
    secondary: string;
    colors: {
      primary: string;
      lightAccent: string;
      darkAccent: string;
    };
  };
}

/**
 * Complete NFL team data (32 teams)
 */
export const NFL_TEAMS: Record<string, NFLTeam> = {
  // NFC East
  "DAL": {
    abbreviation: "DAL",
    name: "Cowboys",
    city: "Dallas",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",
    espnId: "6",
    nflfastrAbbr: "DAL",
    division: "NFC East",
    conference: "NFC",
    branding: {
      primary: "#003594",
      secondary: "#869397",
      colors: { primary: "#003594", lightAccent: "#003594", darkAccent: "#4D8AFF" }
    }
  },
  "NYG": {
    abbreviation: "NYG",
    name: "Giants",
    city: "New York",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png",
    espnId: "19",
    nflfastrAbbr: "NYG",
    division: "NFC East",
    conference: "NFC",
    branding: {
      primary: "#002244",
      secondary: "#A71930",
      colors: { primary: "#002244", lightAccent: "#002244", darkAccent: "#4D8AFF" }
    }
  },
  "PHI": {
    abbreviation: "PHI",
    name: "Eagles",
    city: "Philadelphia",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",
    espnId: "21",
    nflfastrAbbr: "PHI",
    division: "NFC East",
    conference: "NFC",
    branding: {
      primary: "#004C54",
      secondary: "#A5ACAF",
      colors: { primary: "#004C54", lightAccent: "#004C54", darkAccent: "#2BD990" }
    }
  },
  "WSH": {
    abbreviation: "WSH",
    name: "Commanders",
    city: "Washington",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png",
    espnId: "28",
    nflfastrAbbr: "WAS",
    division: "NFC East",
    conference: "NFC",
    branding: {
      primary: "#5A1414",
      secondary: "#FFB612",
      colors: { primary: "#5A1414", lightAccent: "#5A1414", darkAccent: "#FFB612" }
    }
  },

  // NFC North
  "CHI": {
    abbreviation: "CHI",
    name: "Bears",
    city: "Chicago",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
    espnId: "3",
    nflfastrAbbr: "CHI",
    division: "NFC North",
    conference: "NFC",
    branding: {
      primary: "#0B162A",
      secondary: "#C83803",
      colors: { primary: "#0B162A", lightAccent: "#0B162A", darkAccent: "#FF8F4D" }
    }
  },
  "DET": {
    abbreviation: "DET",
    name: "Lions",
    city: "Detroit",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png",
    espnId: "8",
    nflfastrAbbr: "DET",
    division: "NFC North",
    conference: "NFC",
    branding: {
      primary: "#0076B6",
      secondary: "#B0B7BC",
      colors: { primary: "#0076B6", lightAccent: "#0076B6", darkAccent: "#4DB6FF" }
    }
  },
  "GB": {
    abbreviation: "GB",
    name: "Packers",
    city: "Green Bay",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",
    espnId: "9",
    nflfastrAbbr: "GB",
    division: "NFC North",
    conference: "NFC",
    branding: {
      primary: "#203731",
      secondary: "#FFB612",
      colors: { primary: "#203731", lightAccent: "#203731", darkAccent: "#2BD990" }
    }
  },
  "MIN": {
    abbreviation: "MIN",
    name: "Vikings",
    city: "Minnesota",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/min.png",
    espnId: "16",
    nflfastrAbbr: "MIN",
    division: "NFC North",
    conference: "NFC",
    branding: {
      primary: "#4F2683",
      secondary: "#FFC62F",
      colors: { primary: "#4F2683", lightAccent: "#4F2683", darkAccent: "#9E7CFF" }
    }
  },

  // NFC South
  "ATL": {
    abbreviation: "ATL",
    name: "Falcons",
    city: "Atlanta",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png",
    espnId: "1",
    nflfastrAbbr: "ATL",
    division: "NFC South",
    conference: "NFC",
    branding: {
      primary: "#A71930",
      secondary: "#000000",
      colors: { primary: "#A71930", lightAccent: "#A71930", darkAccent: "#FF4D6D" }
    }
  },
  "CAR": {
    abbreviation: "CAR",
    name: "Panthers",
    city: "Carolina",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
    espnId: "29",
    nflfastrAbbr: "CAR",
    division: "NFC South",
    conference: "NFC",
    branding: {
      primary: "#0085CA",
      secondary: "#101820",
      colors: { primary: "#0085CA", lightAccent: "#0085CA", darkAccent: "#4DB6FF" }
    }
  },
  "NO": {
    abbreviation: "NO",
    name: "Saints",
    city: "New Orleans",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/no.png",
    espnId: "18",
    nflfastrAbbr: "NO",
    division: "NFC South",
    conference: "NFC",
    branding: {
      primary: "#D3BC8D",
      secondary: "#101820",
      colors: { primary: "#D3BC8D", lightAccent: "#D3BC8D", darkAccent: "#F0E6D2" }
    }
  },
  "TB": {
    abbreviation: "TB",
    name: "Buccaneers",
    city: "Tampa Bay",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png",
    espnId: "27",
    nflfastrAbbr: "TB",
    division: "NFC South",
    conference: "NFC",
    branding: {
      primary: "#D50A0A",
      secondary: "#34302B",
      colors: { primary: "#D50A0A", lightAccent: "#D50A0A", darkAccent: "#FF4D6D" }
    }
  },

  // NFC West
  "ARI": {
    abbreviation: "ARI",
    name: "Cardinals",
    city: "Arizona",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png",
    espnId: "22",
    nflfastrAbbr: "ARI",
    division: "NFC West",
    conference: "NFC",
    branding: {
      primary: "#97233F",
      secondary: "#000000",
      colors: { primary: "#97233F", lightAccent: "#97233F", darkAccent: "#FF4D6D" }
    }
  },
  "LAR": {
    abbreviation: "LAR",
    name: "Rams",
    city: "Los Angeles",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",
    espnId: "14",
    nflfastrAbbr: "LA",
    division: "NFC West",
    conference: "NFC",
    branding: {
      primary: "#003594",
      secondary: "#FFA300",
      colors: { primary: "#003594", lightAccent: "#003594", darkAccent: "#FFD100" }
    }
  },
  "SF": {
    abbreviation: "SF",
    name: "49ers",
    city: "San Francisco",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
    espnId: "25",
    nflfastrAbbr: "SF",
    division: "NFC West",
    conference: "NFC",
    branding: {
      primary: "#AA0000",
      secondary: "#B3995D",
      colors: { primary: "#AA0000", lightAccent: "#AA0000", darkAccent: "#FF4D6D" }
    }
  },
  "SEA": {
    abbreviation: "SEA",
    name: "Seahawks",
    city: "Seattle",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png",
    espnId: "26",
    nflfastrAbbr: "SEA",
    division: "NFC West",
    conference: "NFC",
    branding: {
      primary: "#002244",
      secondary: "#69BE28",
      colors: { primary: "#002244", lightAccent: "#002244", darkAccent: "#69BE28" }
    }
  },

  // AFC East
  "BUF": {
    abbreviation: "BUF",
    name: "Bills",
    city: "Buffalo",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",
    espnId: "2",
    nflfastrAbbr: "BUF",
    division: "AFC East",
    conference: "AFC",
    branding: {
      primary: "#00338D",
      secondary: "#C60C30",
      colors: { primary: "#00338D", lightAccent: "#00338D", darkAccent: "#4FACFF" }
    }
  },
  "MIA": {
    abbreviation: "MIA",
    name: "Dolphins",
    city: "Miami",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png",
    espnId: "15",
    nflfastrAbbr: "MIA",
    division: "AFC East",
    conference: "AFC",
    branding: {
      primary: "#008E97",
      secondary: "#FC4C02",
      colors: { primary: "#008E97", lightAccent: "#008E97", darkAccent: "#00D1DE" }
    }
  },
  "NE": {
    abbreviation: "NE",
    name: "Patriots",
    city: "New England",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png",
    espnId: "17",
    nflfastrAbbr: "NE",
    division: "AFC East",
    conference: "AFC",
    branding: {
      primary: "#002244",
      secondary: "#C60C30",
      colors: { primary: "#002244", lightAccent: "#002244", darkAccent: "#FF4D4D" }
    }
  },
  "NYJ": {
    abbreviation: "NYJ",
    name: "Jets",
    city: "New York",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png",
    espnId: "20",
    nflfastrAbbr: "NYJ",
    division: "AFC East",
    conference: "AFC",
    branding: {
      primary: "#125740",
      secondary: "#000000",
      colors: { primary: "#125740", lightAccent: "#125740", darkAccent: "#2BD990" }
    }
  },

  // AFC North
  "BAL": {
    abbreviation: "BAL",
    name: "Ravens",
    city: "Baltimore",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png",
    espnId: "33",
    nflfastrAbbr: "BAL",
    division: "AFC North",
    conference: "AFC",
    branding: {
      primary: "#241773",
      secondary: "#000000",
      colors: { primary: "#241773", lightAccent: "#241773", darkAccent: "#9E7CFF" }
    }
  },
  "CIN": {
    abbreviation: "CIN",
    name: "Bengals",
    city: "Cincinnati",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png",
    espnId: "4",
    nflfastrAbbr: "CIN",
    division: "AFC North",
    conference: "AFC",
    branding: {
      primary: "#FB4F14",
      secondary: "#000000",
      colors: { primary: "#FB4F14", lightAccent: "#FB4F14", darkAccent: "#FF7A4D" }
    }
  },
  "CLE": {
    abbreviation: "CLE",
    name: "Browns",
    city: "Cleveland",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png",
    espnId: "5",
    nflfastrAbbr: "CLE",
    division: "AFC North",
    conference: "AFC",
    branding: {
      primary: "#311D00",
      secondary: "#FF3C00",
      colors: { primary: "#311D00", lightAccent: "#311D00", darkAccent: "#FF6B00" }
    }
  },
  "PIT": {
    abbreviation: "PIT",
    name: "Steelers",
    city: "Pittsburgh",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png",
    espnId: "23",
    nflfastrAbbr: "PIT",
    division: "AFC North",
    conference: "AFC",
    branding: {
      primary: "#101820",
      secondary: "#FFB612",
      colors: { primary: "#101820", lightAccent: "#101820", darkAccent: "#FFB612" }
    }
  },

  // AFC South
  "HOU": {
    abbreviation: "HOU",
    name: "Texans",
    city: "Houston",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png",
    espnId: "34",
    nflfastrAbbr: "HOU",
    division: "AFC South",
    conference: "AFC",
    branding: {
      primary: "#03202F",
      secondary: "#A71930",
      colors: { primary: "#03202F", lightAccent: "#03202F", darkAccent: "#FF4D4D" }
    }
  },
  "IND": {
    abbreviation: "IND",
    name: "Colts",
    city: "Indianapolis",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png",
    espnId: "11",
    nflfastrAbbr: "IND",
    division: "AFC South",
    conference: "AFC",
    branding: {
      primary: "#002C5F",
      secondary: "#A2AAAD",
      colors: { primary: "#002C5F", lightAccent: "#002C5F", darkAccent: "#4D8AFF" }
    }
  },
  "JAX": {
    abbreviation: "JAX",
    name: "Jaguars",
    city: "Jacksonville",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png",
    espnId: "30",
    nflfastrAbbr: "JAX",
    division: "AFC South",
    conference: "AFC",
    branding: {
      primary: "#006778",
      secondary: "#9F792C",
      colors: { primary: "#006778", lightAccent: "#006778", darkAccent: "#00B3CC" }
    }
  },
  "TEN": {
    abbreviation: "TEN",
    name: "Titans",
    city: "Tennessee",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png",
    espnId: "10",
    nflfastrAbbr: "TEN",
    division: "AFC South",
    conference: "AFC",
    branding: {
      primary: "#0C2340",
      secondary: "#4B92DB",
      colors: { primary: "#0C2340", lightAccent: "#0C2340", darkAccent: "#4DB6FF" }
    }
  },

  // AFC West
  "DEN": {
    abbreviation: "DEN",
    name: "Broncos",
    city: "Denver",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/den.png",
    espnId: "7",
    nflfastrAbbr: "DEN",
    division: "AFC West",
    conference: "AFC",
    branding: {
      primary: "#FB4F14",
      secondary: "#002244",
      colors: { primary: "#FB4F14", lightAccent: "#FB4F14", darkAccent: "#FF7A4D" }
    }
  },
  "KC": {
    abbreviation: "KC",
    name: "Chiefs",
    city: "Kansas City",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
    espnId: "12",
    nflfastrAbbr: "KC",
    division: "AFC West",
    conference: "AFC",
    branding: {
      primary: "#E31837",
      secondary: "#FFB81C",
      colors: { primary: "#E31837", lightAccent: "#E31837", darkAccent: "#FF4D6D" }
    }
  },
  "LAC": {
    abbreviation: "LAC",
    name: "Chargers",
    city: "Los Angeles",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png",
    espnId: "24",
    nflfastrAbbr: "LAC",
    division: "AFC West",
    conference: "AFC",
    branding: {
      primary: "#0080C6",
      secondary: "#FFC20E",
      colors: { primary: "#0080C6", lightAccent: "#0080C6", darkAccent: "#4DB6FF" }
    }
  },
  "LV": {
    abbreviation: "LV",
    name: "Raiders",
    city: "Las Vegas",
    logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png",
    espnId: "13",
    nflfastrAbbr: "LV",
    division: "AFC West",
    conference: "AFC",
    branding: {
      primary: "#000000",
      secondary: "#A5ACAF",
      colors: { primary: "#000000", lightAccent: "#000000", darkAccent: "#CCCCCC" }
    }
  }
};

/**
 * Helper Functions
 */

// Get team by ESPN ID
export function getTeamByEspnId(espnId: string): NFLTeam | undefined {
  return Object.values(NFL_TEAMS).find(team => team.espnId === espnId);
}

// Get team by abbreviation
export function getTeamByAbbr(abbr: string): NFLTeam | undefined {
  return NFL_TEAMS[abbr.toUpperCase()];
}

// Get team branding
export function getTeamBranding(abbr: string) {
  return NFL_TEAMS[abbr.toUpperCase()]?.branding;
}

// Get full team name
export function getFullTeamName(abbr: string): string {
  const team = NFL_TEAMS[abbr.toUpperCase()];
  return team ? `${team.city} ${team.name}` : abbr;
}

// Get nflfastR abbreviation from ESPN abbreviation
export function getNflfastrAbbr(espnAbbr: string): string {
  return NFL_TEAMS[espnAbbr.toUpperCase()]?.nflfastrAbbr || espnAbbr;
}

// Get ESPN abbreviation from ESPN ID
export function getAbbrFromEspnId(espnId: string): string | undefined {
  return getTeamByEspnId(espnId)?.abbreviation;
}

/**
 * Backward-compatible exports for existing code
 */

// Logo URLs map
export const TEAM_LOGOS: Record<string, string> = Object.keys(NFL_TEAMS).reduce((acc, abbr) => {
  acc[abbr] = NFL_TEAMS[abbr].logoUrl;
  return acc;
}, {} as Record<string, string>);

// Team names map
export const TEAM_NAMES: Record<string, string> = Object.keys(NFL_TEAMS).reduce((acc, abbr) => {
  acc[abbr] = getFullTeamName(abbr);
  return acc;
}, {} as Record<string, string>);

// ESPN ID to abbreviation map (backward compatible)
export const TEAM_ID_TO_ABBR: Record<string, string> = Object.values(NFL_TEAMS).reduce((acc, team) => {
  acc[team.espnId] = team.abbreviation;
  return acc;
}, {} as Record<string, string>);

// ESPN abbreviation to nflfastR abbreviation map (backward compatible)
export const TEAM_ABBR_TO_NFLFASTR: Record<string, string> = Object.keys(NFL_TEAMS).reduce((acc, abbr) => {
  acc[abbr] = NFL_TEAMS[abbr].nflfastrAbbr;
  return acc;
}, {} as Record<string, string>);

// Team branding map (backward compatible)
export const TEAM_BRANDING: Record<string, { logoUrl: string; primary: string; secondary: string; colors: { primary: string; lightAccent: string; darkAccent: string } }> = Object.keys(NFL_TEAMS).reduce((acc, abbr) => {
  const team = NFL_TEAMS[abbr];
  acc[abbr] = {
    logoUrl: team.logoUrl,
    primary: team.branding.primary,
    secondary: team.branding.secondary,
    colors: team.branding.colors
  };
  return acc;
}, {} as Record<string, { logoUrl: string; primary: string; secondary: string; colors: { primary: string; lightAccent: string; darkAccent: string } }>);
