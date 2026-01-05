/**
 * Adaptive polling configuration based on game status
 * Balances real-time updates with resource efficiency
 */

import { Game, GameStatus } from '@/types/nfl';

export const POLLING_INTERVALS = {
  PRE_GAME: 60000,      // 1 minute - game hasn't started
  LIVE_GAME: 10000,     // 10 seconds - live action
  POST_GAME: null,      // null - no polling, game finished
  ERROR_BACKOFF: 30000, // 30 seconds - on error, retry slower
  HIDDEN_TAB: null,     // null - pause when tab hidden
} as const;

/**
 * Determines polling interval based on game state and browser visibility
 *
 * @param gameStatus - Current status of the game ('pre', 'in', 'post')
 * @param isVisible - Whether the browser tab is currently visible
 * @param hasError - Whether the last fetch resulted in an error
 * @returns Polling interval in milliseconds, or null to stop polling
 */
export function getPollingInterval(
  gameStatus: GameStatus,
  isVisible: boolean,
  hasError: boolean
): number | null {
  // Don't poll if tab is hidden
  if (!isVisible) {
    return POLLING_INTERVALS.HIDDEN_TAB;
  }

  // Slow down on errors to avoid hammering failing endpoints
  if (hasError) {
    return POLLING_INTERVALS.ERROR_BACKOFF;
  }

  // Adaptive interval based on game status
  switch (gameStatus) {
    case 'pre':
      return POLLING_INTERVALS.PRE_GAME;
    case 'in':
      return POLLING_INTERVALS.LIVE_GAME;
    case 'post':
      return POLLING_INTERVALS.POST_GAME;
    default:
      return POLLING_INTERVALS.LIVE_GAME; // Safe default
  }
}

/**
 * Detects if game data has meaningfully changed
 * Prevents unnecessary re-renders when data is identical
 *
 * @param prev - Previous game state
 * @param current - Current game state
 * @returns true if game has changed in a meaningful way
 */
export function hasGameChanged(prev: Game | null, current: Game): boolean {
  if (!prev) return true;

  // Check critical fields that affect display
  return (
    prev.homeScore !== current.homeScore ||
    prev.awayScore !== current.awayScore ||
    prev.status !== current.status ||
    prev.drives?.[0]?.id !== current.drives?.[0]?.id || // New drive
    prev.drives?.[0]?.plays?.[0]?.id !== current.drives?.[0]?.plays?.[0]?.id // New play
  );
}

/**
 * Generates a simple hash from game data for change detection
 * Used for ETag-style caching
 *
 * @param game - Game object to hash
 * @returns Hash string representing critical game state
 */
export function generateGameHash(game: Game): string {
  return JSON.stringify({
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    status: game.status,
    lastDriveId: game.drives?.[0]?.id,
    lastPlayId: game.drives?.[0]?.plays?.[0]?.id,
  });
}
