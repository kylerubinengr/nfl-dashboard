import { PlayoffPicture, PlayoffTeam } from "@/types/nfl";
import { TEAM_LOGOS, DEFAULT_NFL_LOGO } from "@/constants/teams";

function getMockPlayoffPicture(): PlayoffPicture {
    const afcTeams: PlayoffTeam[] = [
        { id: '7', name: 'Denver Broncos', abbreviation: 'DEN', seed: 1, record: '12-3', logoUrl: TEAM_LOGOS['DEN'] || DEFAULT_NFL_LOGO, clinchStatus: 'CLINCHED_HOMEFIELD', scenarios: "Clinches AFC West with a win AND Chargers loss" },
        { id: '17', name: 'New England Patriots', abbreviation: 'NE', seed: 2, record: '12-3', logoUrl: TEAM_LOGOS['NE'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE', tiebreakerReason: "Loses tiebreaker to Denver based on head-to-head record", magicNumber: 1 },
        { id: '30', name: 'Jacksonville Jaguars', abbreviation: 'JAX', seed: 3, record: '11-4', logoUrl: TEAM_LOGOS['JAX'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE', magicNumber: 2 },
        { id: '23', name: 'Pittsburgh Steelers', abbreviation: 'PIT', seed: 4, record: '9-6', logoUrl: TEAM_LOGOS['PIT'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE', scenarios: "Clinches North with a win OR Ravens loss", magicNumber: 1 },
        { id: '24', name: 'Los Angeles Chargers', abbreviation: 'LAC', seed: 5, record: '11-4', logoUrl: TEAM_LOGOS['LAC'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE' },
        { id: '2', name: 'Buffalo Bills', abbreviation: 'BUF', seed: 6, record: '11-4', logoUrl: TEAM_LOGOS['BUF'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE' },
        { id: '34', name: 'Houston Texans', abbreviation: 'HOU', seed: 7, record: '10-5', logoUrl: TEAM_LOGOS['HOU'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE' },
        { id: '33', name: 'Baltimore Ravens', abbreviation: 'BAL', seed: 8, record: '10-5', logoUrl: TEAM_LOGOS['BAL'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE', gamesBehind: "1.0 GB" },
        { id: '11', name: 'Indianapolis Colts', abbreviation: 'IND', seed: 9, record: '9-6', logoUrl: TEAM_LOGOS['IND'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE', gamesBehind: "2.0 GB" },
        { id: '10', name: 'Tennessee Titans', abbreviation: 'TEN', seed: 15, record: '3-12', logoUrl: TEAM_LOGOS['TEN'] || DEFAULT_NFL_LOGO, clinchStatus: 'ELIMINATED' },
    ];

     const nfcTeams: PlayoffTeam[] = [
        { id: '26', name: 'Seattle Seahawks', abbreviation: 'SEA', seed: 1, record: '12-3', logoUrl: TEAM_LOGOS['SEA'] || DEFAULT_NFL_LOGO, clinchStatus: 'CLINCHED_HOMEFIELD' },
        { id: '3', name: 'Chicago Bears', abbreviation: 'CHI', seed: 2, record: '11-4', logoUrl: TEAM_LOGOS['CHI'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE', magicNumber: 2 },
        { id: '21', name: 'Philadelphia Eagles', abbreviation: 'PHI', seed: 3, record: '10-5', logoUrl: TEAM_LOGOS['PHI'] || DEFAULT_NFL_LOGO, clinchStatus: 'CLINCHED_DIVISION' },
        { id: '29', name: 'Carolina Panthers', abbreviation: 'CAR', seed: 4, record: '8-7', logoUrl: TEAM_LOGOS['CAR'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE', scenarios: "Clinches South with a win AND Falcons loss" },
        { id: '25', name: 'San Francisco 49ers', abbreviation: 'SF', seed: 5, record: '11-4', logoUrl: TEAM_LOGOS['SF'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE' },
        { id: '14', name: 'Los Angeles Rams', abbreviation: 'LAR', seed: 6, record: '11-4', logoUrl: TEAM_LOGOS['LAR'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE' },
        { id: '9', name: 'Green Bay Packers', abbreviation: 'GB', seed: 7, record: '9-5-1', logoUrl: TEAM_LOGOS['GB'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE' },
        { id: '1', name: 'Atlanta Falcons', abbreviation: 'ATL', seed: 8, record: '9-6', logoUrl: TEAM_LOGOS['ATL'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE', gamesBehind: "0.5 GB" },
        { id: '6', name: 'Dallas Cowboys', abbreviation: 'DAL', seed: 9, record: '8-7', logoUrl: TEAM_LOGOS['DAL'] || DEFAULT_NFL_LOGO, clinchStatus: 'NONE', gamesBehind: "1.0 GB" },
        { id: '19', name: 'New York Giants', abbreviation: 'NYG', seed: 16, record: '2-13', logoUrl: TEAM_LOGOS['NYG'] || DEFAULT_NFL_LOGO, clinchStatus: 'ELIMINATED' },
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
  const url = "http://site.api.espn.com/apis/v2/sports/football/nfl/standings";
  
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.warn("Live playoff API failed, using mock data.");
      return getMockPlayoffPicture();
    }
    const data = await res.json();
    
    const afcTeams: PlayoffTeam[] = [];
    const nfcTeams: PlayoffTeam[] = [];

    const processConference = (conferenceData: any, targetArray: PlayoffTeam[]) => {
       if (!conferenceData?.standings?.entries) return;

       conferenceData.standings.entries.forEach((entry: any) => {
          const stats = entry.stats || [];
          const getStat = (type: string) => stats.find((s: any) => s.type === type)?.displayValue;
          
          const seedStr = getStat('playoffseed');
          const seed = seedStr ? parseInt(seedStr) : 0;
          
          const clincher = getStat('clincher');
          let clinchStatus: PlayoffTeam['clinchStatus'] = 'NONE';
          
          if (clincher === '*') clinchStatus = 'CLINCHED_HOMEFIELD';
          else if (clincher === 'z' || clincher === 'y') clinchStatus = 'CLINCHED_DIVISION';
          else if (clincher === 'x') clinchStatus = 'CLINCHED_PLAYOFF';
          else if (clincher === 'e') clinchStatus = 'ELIMINATED';

          const wins = getStat('wins') || "0";
          const losses = getStat('losses') || "0";
          const ties = getStat('ties') || "0";
          const record = ties !== "0" ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;

          const teamAbbreviation = entry.team.abbreviation;
          const team: PlayoffTeam = {
              id: entry.team.id,
              name: entry.team.displayName,
              abbreviation: teamAbbreviation,
              logoUrl: TEAM_LOGOS[teamAbbreviation] || DEFAULT_NFL_LOGO,
              seed: seed,
              record: record,
              clinchStatus: clinchStatus,
              gamesBehind: getStat('gamesbehind'),
          };
          
          targetArray.push(team);
       });
    };

    if (data.children) {
        data.children.forEach((child: any) => {
            if (child.abbreviation === 'AFC') {
                processConference(child, afcTeams);
            } else if (child.abbreviation === 'NFC') {
                processConference(child, nfcTeams);
            }
        });
    }

    if (afcTeams.length < 7 || nfcTeams.length < 7) {
        console.warn("Live playoff data is incomplete, falling back to mock data.");
        return getMockPlayoffPicture();
    }

    afcTeams.sort((a, b) => a.seed - b.seed);
    nfcTeams.sort((a, b) => a.seed - b.seed);
    
    const categorize = (teams: PlayoffTeam[]) => {
        const bracket = teams.filter(t => t.seed > 0 && t.seed <= 7);
        const inTheHunt = teams.filter(t => t.seed >= 8 && t.seed <= 12 && t.clinchStatus !== 'ELIMINATED');
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
