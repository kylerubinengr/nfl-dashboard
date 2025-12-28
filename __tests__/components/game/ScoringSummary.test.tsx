import { render, screen } from '@testing-library/react';
import { ScoringSummary } from '@/components/game/ScoringSummary';
import { mockTeam, mockScoringPlay, mockLinescore } from '@/mocks/factories/gameFactory';

// Mock SafeImage to avoid Next.js image issues
jest.mock('@/components/common/SafeImage', () => ({
  SafeImage: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe('ScoringSummary', () => {
  const homeTeam = mockTeam({ id: 'home', name: 'Home Team', abbreviation: 'HOME' });
  const awayTeam = mockTeam({ id: 'away', name: 'Away Team', abbreviation: 'AWAY' });

  it('renders basic score and header correctly', () => {
    render(
      <ScoringSummary
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        scoringPlays={[]}
        homeLinescores={[mockLinescore('1', '0')]}
        awayLinescores={[mockLinescore('1', '0')]}
        homeScore={0}
        awayScore={0}
      />
    );

    expect(screen.getByText('Scoring Summary')).toBeInTheDocument();
    expect(screen.getByText('Home Team')).toBeInTheDocument();
    expect(screen.getByText('Away Team')).toBeInTheDocument();
  });

  it('dynamically renders OT column when OT linescores exist', () => {
    const homeLinescores = [
        mockLinescore('1', '0'), mockLinescore('2', '0'), 
        mockLinescore('3', '0'), mockLinescore('4', '0'), 
        mockLinescore('OT', '3')
    ];
    const awayLinescores = [
        mockLinescore('1', '0'), mockLinescore('2', '0'), 
        mockLinescore('3', '0'), mockLinescore('4', '0'), 
        mockLinescore('OT', '0')
    ];

    render(
      <ScoringSummary
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        scoringPlays={[]}
        homeLinescores={homeLinescores}
        awayLinescores={awayLinescores}
        homeScore={3}
        awayScore={0}
      />
    );

    expect(screen.getByText('OT')).toBeInTheDocument();
    // Check that at least one "3" is present (could be in OT column or Total)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('renders scoring plays with correct running score format', () => {
    const play = mockScoringPlay({
        text: 'Touchdown HOME',
        team: { id: 'home', abbreviation: 'HOME', logo: '/logo.png' },
        homeScore: 7,
        awayScore: 0
    });

    render(
      <ScoringSummary
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        scoringPlays={[play]}
        homeLinescores={[mockLinescore('1', '7')]}
        awayLinescores={[mockLinescore('1', '0')]}
        homeScore={7}
        awayScore={0}
      />
    );

    // Check for the play text
    expect(screen.getByText('Touchdown HOME')).toBeInTheDocument();
    
    // Check for the running score: "HOME 7 - 0 AWAY"
    // Since the component splits this into spans, we might need a looser check or exact text match logic
    // But our refactor put it in a single <p>: <span class="font-bold">HOME</span> 7 - 0 AWAY
    // RTL's getByText might stumble on the markup if not careful, but typically handles text content.
    // Let's verify the parts exist.
    expect(screen.getByText('HOME', { selector: 'span.font-bold.text-slate-700' })).toBeInTheDocument();
    expect(screen.getByText(/7 - 0/)).toBeInTheDocument();
    expect(screen.getByText(/AWAY/)).toBeInTheDocument();
  });
});
