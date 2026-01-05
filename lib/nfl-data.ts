import Papa from 'papaparse';
import { getTeamByEspnId } from '@/constants/teams';

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

    const homeAbbr = getTeamByEspnId(homeId)?.nflfastrAbbr;
    const awayAbbr = getTeamByEspnId(awayId)?.nflfastrAbbr;

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
