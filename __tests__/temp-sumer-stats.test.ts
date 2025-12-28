import { getSumerSportsStats } from '../lib/sumerSportsService';
import { server } from '../mocks/server';
import { http } from 'msw';

describe('Temporary SumerSports Stats Test', () => {
  // Allow all network requests to pass through MSW for this test
  beforeAll(() => server.use(http.all(/.*/, (req) => req.passthrough())));
  afterAll(() => server.resetHandlers()); // Reset handlers after this suite

  it('should fetch SumerSports stats and log Baltimore\'s EPA and rank', async () => {
    const allStats = await getSumerSportsStats();

    const balStats = allStats["BAL"];
    if (!balStats) {
      console.log("Baltimore Ravens (BAL) stats not found from SumerSports.");
      expect(true).toBe(false); // Fail the test if stats not found
      return;
    }

    console.log("\n--- Baltimore Ravens (BAL) SumerSports Stats ---");
    console.log(`  Offensive EPA/Play: ${balStats.off_epa}`);
    console.log(`  Defensive EPA/Play: ${balStats.def_epa}`);

    // Calculate Ranks
    const offensiveEPA = Object.entries(allStats)
      .filter(([, stats]) => stats.off_epa && stats.off_epa !== "N/A" && !isNaN(parseFloat(stats.off_epa)))
      .map(([team, stats]) => ({ team, epa: parseFloat(stats.off_epa) }))
      .sort((a, b) => b.epa - a.epa); // Higher EPA is better for offense

    const defensiveEPA = Object.entries(allStats)
      .filter(([, stats]) => stats.def_epa && stats.def_epa !== "N/A" && !isNaN(parseFloat(stats.def_epa)))
      .map(([team, stats]) => ({ team, epa: parseFloat(stats.def_epa) }))
      .sort((a, b) => a.epa - b.epa); // Lower EPA is better for defense

    const balOffRank = offensiveEPA.findIndex(s => s.team === "BAL") + 1;
    const balDefRank = defensiveEPA.findIndex(s => s.team === "BAL") + 1;

    console.log(`  Offensive EPA Rank: ${balOffRank} of ${offensiveEPA.length}`);
    console.log(`  Defensive EPA Rank: ${balDefRank} of ${defensiveEPA.length}`);
    console.log("-------------------------------------------\n");

    expect(balStats.off_epa).not.toBe('N/A');
    expect(balStats.def_epa).not.toBe('N/A');
    expect(balOffRank).toBeGreaterThan(0);
    expect(balDefRank).toBeGreaterThan(0);

  }, 60000); // Increased timeout for external fetches and parsing
});
