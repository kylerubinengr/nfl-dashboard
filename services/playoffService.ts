import { PlayoffPicture, PlayoffTeam } from "@/types/nfl";

function getMockPlayoffPicture(): PlayoffPicture {
    const getLogo = (abbr: string) => `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`;

    const afcTeams: PlayoffTeam[] = [
        { id: '7', name: 'Denver Broncos', abbreviation: 'DEN', seed: 1, record: '12-3', logoUrl: getLogo('den'), clinchStatus: 'CLINCHED_HOMEFIELD', scenarios: "Clinches AFC West with a win AND Chargers loss" },
        { id: '17', name: 'New England Patriots', abbreviation: 'NE', seed: 2, record: '12-3', logoUrl: getLogo('ne'), clinchStatus: 'NONE', tiebreakerReason: "Loses tiebreaker to Denver based on head-to-head record", magicNumber: 1 },
        { id: '30', name: 'Jacksonville Jaguars', abbreviation: 'JAX', seed: 3, record: '11-4', logoUrl: getLogo('jax'), clinchStatus: 'NONE', magicNumber: 2 },
        { id: '23', name: 'Pittsburgh Steelers', abbreviation: 'PIT', seed: 4, record: '9-6', logoUrl: getLogo('pit'), clinchStatus: 'NONE', scenarios: "Clinches North with a win OR Ravens loss", magicNumber: 1 },
        { id: '24', name: 'Los Angeles Chargers', abbreviation: 'LAC', seed: 5, record: '11-4', logoUrl: getLogo('lac'), clinchStatus: 'NONE' },
        { id: '2', name: 'Buffalo Bills', abbreviation: 'BUF', seed: 6, record: '11-4', logoUrl: getLogo('buf'), clinchStatus: 'NONE' },
        { id: '34', name: 'Houston Texans', abbreviation: 'HOU', seed: 7, record: '10-5', logoUrl: getLogo('hou'), clinchStatus: 'NONE' },
        { id: '33', name: 'Baltimore Ravens', abbreviation: 'BAL', seed: 8, record: '10-5', logoUrl: getLogo('bal'), clinchStatus: 'NONE', gamesBehind: "1.0 GB" },
        { id: '11', name: 'Indianapolis Colts', abbreviation: 'IND', seed: 9, record: '9-6', logoUrl: getLogo('ind'), clinchStatus: 'NONE', gamesBehind: "2.0 GB" },
        { id: '10', name: 'Tennessee Titans', abbreviation: 'TEN', seed: 15, record: '3-12', logoUrl: getLogo('ten'), clinchStatus: 'ELIMINATED' },
    ];

     const nfcTeams: PlayoffTeam[] = [
        { id: '26', name: 'Seattle Seahawks', abbreviation: 'SEA', seed: 1, record: '12-3', logoUrl: getLogo('sea'), clinchStatus: 'CLINCHED_HOMEFIELD' },
        { id: '3', name: 'Chicago Bears', abbreviation: 'CHI', seed: 2, record: '11-4', logoUrl: getLogo('chi'), clinchStatus: 'NONE', magicNumber: 2 },
        { id: '21', name: 'Philadelphia Eagles', abbreviation: 'PHI', seed: 3, record: '10-5', logoUrl: getLogo('phi'), clinchStatus: 'CLINCHED_DIVISION' },
        { id: '29', name: 'Carolina Panthers', abbreviation: 'CAR', seed: 4, record: '8-7', logoUrl: getLogo('car'), clinchStatus: 'NONE', scenarios: "Clinches South with a win AND Falcons loss" },
        { id: '25', name: 'San Francisco 49ers', abbreviation: 'SF', seed: 5, record: '11-4', logoUrl: getLogo('sf'), clinchStatus: 'NONE' },
        { id: '14', name: 'Los Angeles Rams', abbreviation: 'LAR', seed: 6, record: '11-4', logoUrl: getLogo('lar'), clinchStatus: 'NONE' },
        { id: '9', name: 'Green Bay Packers', abbreviation: 'GB', seed: 7, record: '9-5-1', logoUrl: getLogo('gb'), clinchStatus: 'NONE' },
        { id: '1', name: 'Atlanta Falcons', abbreviation: 'ATL', seed: 8, record: '9-6', logoUrl: getLogo('atl'), clinchStatus: 'NONE', gamesBehind: "0.5 GB" },
        { id: '6', name: 'Dallas Cowboys', abbreviation: 'DAL', seed: 9, record: '8-7', logoUrl: getLogo('dal'), clinchStatus: 'NONE', gamesBehind: "1.0 GB" },
        { id: '19', name: 'New York Giants', abbreviation: 'NYG', seed: 16, record: '2-13', logoUrl: getLogo('nyg'), clinchStatus: 'ELIMINATED' },
    ];

    return {
      afc: { 
          name: "AFC", 
          teams: afcTeams.filter(t => t.seed <= 7), 
          inTheHunt: afcTeams.filter(t => t.seed > 7 && t.clinchStatus !== 'ELIMINATED'),
          eliminated: afcTeams.filter(t => t.clinchStatus === 'ELIMINATED')
      },
      nfc: { 
          name: "NFC", 
          teams: nfcTeams.filter(t => t.seed <= 7), 
          inTheHunt: nfcTeams.filter(t => t.seed > 7 && t.clinchStatus !== 'ELIMINATED'),
          eliminated: nfcTeams.filter(t => t.clinchStatus === 'ELIMINATED')
      },
    };
}


export async function getPlayoffPicture(): Promise<PlayoffPicture | null> {
  const url = "https://cdn.espn.com/core/nfl/standings?xhr=1";
  
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn("Live playoff API failed, using mock data.");
      return getMockPlayoffPicture();
    }
    const data = await res.json();
    
    const conferences = data.content.standings.groups;
    const afcTeams: PlayoffTeam[] = [];
    const nfcTeams: PlayoffTeam[] = [];

    conferences.forEach((conf: any) => {
      const conferenceName = conf.name === "American Football Conference" ? "AFC" : "NFC";
      
      conf.groups.forEach((div: any) => {
        div.standings.entries.forEach((entry: any) => {
          const seedStat = entry.stats.find((s: any) => s.type === "playoffseed");
          const seed = seedStat ? parseInt(seedStat.displayValue) : 0;
          
          if (seed > 0 && seed <= 10) {
            const wins = entry.stats.find((s:any) => s.type === 'wins')?.displayValue || "0";
            const losses = entry.stats.find((s:any) => s.type === 'losses')?.displayValue || "0";
            const ties = entry.stats.find((s:any) => s.type === 'ties')?.displayValue || "0";

            let clinchStatus: 'CLINCHED_HOMEFIELD' | 'CLINCHED_DIVISION' | 'CLINCHED_PLAYOFF' | 'ELIMINATED' | 'NONE' = 'NONE';
            if (entry.team.clincher === '*') {
                clinchStatus = 'CLINCHED_HOMEFIELD';
            } else if (entry.team.clincher === 'z' || entry.team.clincher === 'y') {
                clinchStatus = 'CLINCHED_DIVISION';
            } else if (entry.team.clincher === 'x') {
                clinchStatus = 'CLINCHED_PLAYOFF';
            } else if (entry.team.clincher === 'e') {
                clinchStatus = 'ELIMINATED';
            }

            const team: PlayoffTeam = {
              id: entry.team.id,
              name: entry.team.displayName,
              abbreviation: entry.team.abbreviation,
              logoUrl: entry.team.logos?.[0]?.href || "",
              seed: seed,
              record: `${wins}-${losses}-${ties}`,
              clinchStatus: clinchStatus,
              tiebreakerReason: entry.stats.find((s: any) => s.name === "tiebreaker")?.displayValue,
              gamesBehind: entry.stats.find((s: any) => s.name === "gamesBehind")?.displayValue,
            };

            if (conferenceName === "AFC") {
              afcTeams.push(team);
            } else {
              nfcTeams.push(team);
            }
          }
        });
      });
    });

    // If live data parsing fails to find teams, use the mock data
    if (afcTeams.length < 7 || nfcTeams.length < 7) {
        console.warn("Live playoff data is incomplete, falling back to mock data.");
        return getMockPlayoffPicture();
    }

    afcTeams.sort((a, b) => a.seed - b.seed);
    nfcTeams.sort((a, b) => a.seed - b.seed);
    
    // Categorize teams
    const categorize = (teams: PlayoffTeam[]) => {
        const bracket = teams.filter(t => t.seed <= 7);
        const inTheHunt = teams.filter(t => t.seed > 7 && t.seed <= 14 && t.clinchStatus !== 'ELIMINATED');
        const eliminated = teams.filter(t => t.clinchStatus === 'ELIMINATED');
        return { bracket, inTheHunt, eliminated };
    };

    const afcGroups = categorize(afcTeams);
    const nfcGroups = categorize(nfcTeams);

    return {
      afc: { 
        name: "AFC", 
        teams: afcGroups.bracket,
        inTheHunt: afcGroups.inTheHunt,
        eliminated: afcGroups.eliminated
      },
      nfc: { 
        name: "NFC", 
        teams: nfcGroups.bracket,
        inTheHunt: nfcGroups.inTheHunt,
        eliminated: nfcGroups.eliminated
      },
    };

  } catch (error) {
    console.error("Error fetching playoff picture, using mock data:", error);
    return getMockPlayoffPicture();
  }
}