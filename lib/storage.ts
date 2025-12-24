import { Game } from "@/types/nfl";

export type Snapshot = {
  data: Game[];
  lastUpdated: number;
};

const SNAPSHOT_PREFIX = "nfl_dashboard_week_";

export const storage = {
  saveSnapshot: (week: number, data: Game[]) => {
    if (typeof window === "undefined") return;
    try {
      const snapshot: Snapshot = {
        data,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(`${SNAPSHOT_PREFIX}${week}`, JSON.stringify(snapshot));
    } catch (e) {
      console.error("Failed to save snapshot to localStorage", e);
    }
  },

  getSnapshot: (week: number): Snapshot | null => {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(`${SNAPSHOT_PREFIX}${week}`);
      if (!item) return null;
      return JSON.parse(item) as Snapshot;
    } catch (e) {
      console.error("Failed to parse snapshot from localStorage", e);
      return null;
    }
  },
};
