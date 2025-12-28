import { getMatchupComparison } from '../services/matchupService';
import { server } from '../mocks/server';
import { http } from 'msw'; // Use http for MSW 2.x

describe('Temporary Data Fetch Test', () => {
  // Tell MSW to let all requests pass through for this specific test suite
  beforeAll(() => server.use(http.all(/.*/, (req) => req.passthrough())));

  it('should fetch and log Ravens vs Packers matchup data', async () => {
    // Packers (9) home, Ravens (33) away
    const data = await getMatchupComparison("9", "33");
    console.log(JSON.stringify(data, null, 2));
    
    // Expect data to not be null and to have some properties populated
    expect(data).not.toBeNull();
    expect(data?.home).toHaveProperty('record');
    expect(data?.away).toHaveProperty('offEpa');
    // We expect actual numbers now, not N/A, so check if not 'N/A'
    expect(data?.home.offEpa).not.toBe('N/A');
    expect(data?.away.offEpa).not.toBe('N/A');
  }, 30000); // Increase timeout for API calls
});
