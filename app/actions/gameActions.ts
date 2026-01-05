"use server";

import { getGameById } from "@/services/gameService";
import { Game } from "@/types/nfl";
import crypto from "crypto";

// In-memory cache for ETags (use Redis in production for multi-instance deployments)
const etagCache = new Map<string, { etag: string; data: Game; timestamp: number }>();

// Cache cleanup interval (run every 5 minutes)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Periodically clean up old cache entries
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of etagCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        etagCache.delete(key);
      }
    }
  }, 60000); // Run cleanup every minute
}

/**
 * Generates ETag from game data for change detection
 * Only includes fields that affect the UI to avoid false changes
 */
function generateETag(game: Game): string {
  const relevantData = {
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    status: game.status,
    lastDriveId: game.drives?.[0]?.id,
    lastPlayId: game.drives?.[0]?.plays?.[0]?.id,
  };
  return crypto.createHash('md5').update(JSON.stringify(relevantData)).digest('hex');
}

/**
 * Refreshes game data with ETag-based change detection
 * Returns undefined if data hasn't changed (based on ETag)
 *
 * @param gameId - The ID of the game to refresh
 * @param clientETag - Optional ETag from client to check for changes
 * @returns Updated game data, or undefined if no change or error
 */
export async function refreshGameData(
  gameId: string,
  clientETag?: string
): Promise<Game | undefined> {
  try {
    const game = await getGameById(gameId, { fetchWeather: false });

    if (!game) return undefined;

    const serverETag = generateETag(game);

    // Check if client already has latest data
    if (clientETag && clientETag === serverETag) {
      console.log(`[ETag] No changes for game ${gameId} - skipping update`);
      return undefined; // Signal no change
    }

    // Cache the new ETag
    etagCache.set(gameId, {
      etag: serverETag,
      data: game,
      timestamp: Date.now(),
    });

    console.log(`[ETag] Game ${gameId} data changed (ETag: ${serverETag})`);
    return game;
  } catch (error) {
    console.error(`Failed to refresh game data for ${gameId}:`, error);
    return undefined;
  }
}

/**
 * Batch refresh for multiple games (dashboard use)
 * Efficiently refreshes multiple games in parallel
 *
 * @param gameIds - Array of game IDs to refresh
 * @returns Array of updated games (excludes unchanged games)
 */
export async function refreshMultipleGames(gameIds: string[]): Promise<Game[]> {
  const games = await Promise.all(
    gameIds.map(id => refreshGameData(id))
  );
  return games.filter((g): g is Game => g !== undefined);
}
