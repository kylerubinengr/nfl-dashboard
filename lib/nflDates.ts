/**
 * NFL Season 2025-2026 Dates
 * Season starts: Thursday, September 4, 2025
 * Rollover: Every Tuesday at 6:00 AM local (Eastern used as NFL standard)
 */

export function getCurrentNFLWeek(): number | 'playoffs' {
  const now = Date.now();
  
  // Week 1 Rollover (Tuesday after Week 1 starts)
  // September 9, 2025, 06:00:00 AM EDT (UTC-4)
  const WEEK_1_ROLLOVER = new Date('2025-09-09T06:00:00-04:00').getTime();
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  const weeksSinceFirstRollover = Math.floor((now - WEEK_1_ROLLOVER) / MS_PER_WEEK);
  
  // If we are before the first Tuesday rollover, it's Week 1
  if (now < WEEK_1_ROLLOVER) {
    return 1;
  }

  // Current week is 2 + how many full weeks have passed since the first rollover
  const currentWeek = 2 + weeksSinceFirstRollover;

  if (currentWeek > 18) {
    return 'playoffs';
  }

  return currentWeek;
}
