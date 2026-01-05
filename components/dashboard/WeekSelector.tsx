"use client";

import Link from "next/link";
import { getCurrentNFLWeek } from "@/lib/nflDates";
import { useSeason } from "@/context/SeasonContext";

export function WeekSelector({ currentWeek }: { currentWeek: number }) {
  const { selectedSeason } = useSeason();
  
  // Prior to 2021, the NFL season had 17 weeks. From 2021 onwards, it has 18.
  const totalWeeks = selectedSeason >= 2021 ? 18 : 17;
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  
  const activeNFLWeek = getCurrentNFLWeek();

  return (
    <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible pb-2 scrollbar-hide">
      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-2">
        Week:
      </span>
      {weeks.map((week) => (
        <Link
          key={week}
          href={`/dashboard/${week}`}
          className={`relative px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
            week === currentWeek
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
          }`}
        >
          {week}
          {week === activeNFLWeek && selectedSeason === 2025 && (
            <span className="absolute top-0 right-0 flex h-2 w-2 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </Link>
      ))}
      <Link
          href={`/dashboard/playoffs`}
          className={`relative px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
            currentWeek > 18 || Number.isNaN(currentWeek)
              ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
          }`}
        >
          Playoffs
          {activeNFLWeek === 'playoffs' && selectedSeason === 2025 && (
            <span className="absolute top-0 right-0 flex h-2 w-2 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </Link>
    </div>
  );
}
