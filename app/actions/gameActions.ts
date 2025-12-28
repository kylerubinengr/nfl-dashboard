"use server";

import { getGameById } from "@/services/gameService";
import { Game } from "@/types/nfl";

export async function refreshGameData(gameId: string): Promise<Game | undefined> {
  try {
    const game = await getGameById(gameId, { fetchWeather: false });
    return game;
  } catch (error) {
    console.error(`Failed to refresh game data for ${gameId}:`, error);
    return undefined;
  }
}
