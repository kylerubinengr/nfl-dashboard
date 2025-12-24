"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentNFLWeek } from "@/lib/nflDates";

export function WeekSelector({ currentWeek }: { currentWeek: number }) {
  const router = useRouter();
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
  const activeNFLWeek = getCurrentNFLWeek();

  return (
    <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible pt-2 pb-2 scrollbar-hide">
      <div className="flex items-center gap-2 overflow-visible">
        <span className="text-sm font-bold text-slate-500 whitespace-nowrap mr-2">
          Week:
        </span>
        {weeks.map((week) => (
          <Link
            key={week}
            href={`/dashboard/${week}`}
            className={`relative px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
              week === currentWeek
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {week}
            {week === activeNFLWeek && (
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
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Playoffs
            {activeNFLWeek === 'playoffs' && (
              <span className="absolute top-0 right-0 flex h-2 w-2 z-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </Link>
      </div>
    </div>
  );
}
