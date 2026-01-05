import { useEffect, useRef, useState, useCallback } from 'react';
import { getPollingInterval, hasGameChanged, generateGameHash } from '@/lib/polling-config';
import type { Game, GameStatus } from '@/types/nfl';

interface UseAdaptivePollingOptions {
  gameId: string;
  initialStatus: GameStatus;
  fetchFunction: (gameId: string, clientETag?: string) => Promise<Game | undefined>;
  onUpdate: (game: Game) => void;
  onError?: (error: Error) => void;
}

interface AdaptivePollingState {
  isPolling: boolean;
  currentStatus: GameStatus;
  hasError: boolean;
  isVisible: boolean;
}

/**
 * Custom hook for adaptive polling with visibility detection and error handling
 *
 * Features:
 * - Adjusts polling rate based on game status (pre: 60s, live: 10s, post: none)
 * - Pauses when tab is hidden (saves battery and data)
 * - Exponential backoff on errors (30s retry interval)
 * - Change detection to prevent unnecessary updates
 *
 * @example
 * ```tsx
 * const { isPolling, hasError } = useAdaptivePolling({
 *   gameId: '401671640',
 *   initialStatus: 'in',
 *   fetchFunction: refreshGameData,
 *   onUpdate: setGame,
 * });
 * ```
 *
 * @param options - Configuration options for the polling hook
 * @returns Polling state information
 */
export function useAdaptivePolling({
  gameId,
  initialStatus,
  fetchFunction,
  onUpdate,
  onError,
}: UseAdaptivePollingOptions): AdaptivePollingState {
  const [isVisible, setIsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<GameStatus>(initialStatus);
  const lastGameRef = useRef<Game | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const etagRef = useRef<string | null>(null);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsVisible(visible);
      console.log(`[Polling] Tab visibility changed: ${visible ? 'visible' : 'hidden'}`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Polling logic with ETag support
  const poll = useCallback(async () => {
    try {
      // Pass current ETag to server for change detection
      const game = await fetchFunction(gameId, etagRef.current ?? undefined);

      // If undefined is returned, it means no changes (ETag matched)
      if (!game) {
        console.log(`[Polling] No changes detected for game ${gameId}`);

        // Still clear error state on successful fetch
        if (hasError) {
          console.log(`[Polling] Recovered from error state`);
          setHasError(false);
        }
        return;
      }

      // Generate new ETag for client-side tracking
      const newETag = generateGameHash(game);
      etagRef.current = newETag;

      // Only update if data actually changed
      if (hasGameChanged(lastGameRef.current, game)) {
        console.log(`[Polling] Game ${gameId} data changed, updating UI (ETag: ${newETag})`);
        onUpdate(game);
        lastGameRef.current = game;

        // Update status if it changed (e.g., game went from 'in' to 'post')
        if (game.status !== currentStatus) {
          console.log(`[Polling] Game status changed: ${currentStatus} → ${game.status}`);
          setCurrentStatus(game.status);
        }
      }

      // Clear error state on successful fetch
      if (hasError) {
        console.log(`[Polling] Recovered from error state`);
        setHasError(false);
      }
    } catch (error) {
      console.error('[Polling] Error fetching game data:', error);
      setHasError(true);
      onError?.(error as Error);
    }
  }, [gameId, fetchFunction, onUpdate, onError, currentStatus, hasError]);

  // Setup interval
  useEffect(() => {
    const interval = getPollingInterval(currentStatus, isVisible, hasError);

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't poll if interval is null (post-game or hidden)
    if (interval === null) {
      console.log(
        `[Polling] Paused - status: ${currentStatus}, visible: ${isVisible}, error: ${hasError}`
      );
      return;
    }

    console.log(
      `[Polling] Active - interval: ${interval}ms, status: ${currentStatus}, visible: ${isVisible}`
    );

    // Initial immediate fetch
    poll();

    // Setup recurring polling
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentStatus, isVisible, hasError, poll]);

  return {
    isPolling: intervalRef.current !== null,
    currentStatus,
    hasError,
    isVisible,
  };
}
