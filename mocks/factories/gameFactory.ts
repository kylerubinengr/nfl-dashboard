import { Team, ScoringPlay, Linescore } from '@/types/nfl';

export const mockTeam = (overrides?: Partial<Team>): Team => ({
  id: 'team-1',
  name: 'Test Team',
  abbreviation: 'TST',
  record: '0-0',
  logoUrl: '/test.png',
  clinchedPlayoffs: false,
  ...overrides,
});

export const mockScoringPlay = (overrides?: Partial<ScoringPlay>): ScoringPlay => ({
  id: 'play-1',
  quarter: 1,
  clock: '15:00',
  text: 'Touchdown',
  type: 'TD',
  team: {
    id: 'team-1',
    abbreviation: 'TST',
    logo: '/test.png',
  },
  scoreValue: 6,
  homeScore: 0,
  awayScore: 6,
  ...overrides,
});

export const mockLinescore = (label: string, value: string): Linescore => ({
  label,
  displayValue: value,
});
