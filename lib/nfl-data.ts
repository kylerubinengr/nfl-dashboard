import Papa from 'papaparse';

// Official Mapping: ESPN ID -> nflfastR Abbreviation
const TEAM_MAP: { [key: string]: string } = {
  "1": "ATL", "2": "BUF", "3": "CHI", "4": "CIN", "5": "CLE", "6": "DAL",
  "7": "DEN", "8": "DET", "9": "GB", "10": "TEN", "11": "IND", "12": "KC",
  "13": "LV", "14": "LAR", "15": "MIA", "16": "MIN", "17": "NE", "18": "NO",
  "19": "NYG", "20": "NYJ", "21": "PHI", "22": "ARI", "23": "PIT", "24": "LAC",
  "25": "SF", "26": "SEA", "27": "TB", "28": "WAS", "29": "CAR", "30": "JAX",
  "33": "BAL", "34": "HOU"
};

export async function getNflFastRStats(homeId: string, awayId: string) {
  const NFL_STATS_URL = "https://github.com/nflverse/nflverse-data/releases/download/stats/season_stats.csv";

  try {
    const response = await fetch(NFL_STATS_URL, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`Failed to fetch nflfastR CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, dynamicTyping: true });
    // Assuming 2024 is the target season as per prior logic
    const latestSeason = parsed.data.filter((row: any) => row.season === 2024);

    const homeAbbr = TEAM_MAP[homeId];
    const awayAbbr = TEAM_MAP[awayId];

    const homeStats = latestSeason.find((t: any) => t.team === homeAbbr) || null;
    const awayStats = latestSeason.find((t: any) => t.team === awayAbbr) || null;

    return {
      home: homeStats,
      away: awayStats
    };
  } catch (error: any) {
    console.error("nfl-data.ts Error:", error.message);
    return { home: null, away: null };
  }
}
