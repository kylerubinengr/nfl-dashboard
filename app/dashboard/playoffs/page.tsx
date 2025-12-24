"use client";

import { WeekSelector } from "@/components/dashboard/WeekSelector";
import { PlayoffsTab } from "@/components/dashboard/PlayoffsTab";

export default function PlayoffsPage() {
  return (
    <main className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-slate-900">
              NFL Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <WeekSelector currentWeek={19} /> {/* 19 or NaN to highlight Playoffs */}
          </div>
        </div>

        <PlayoffsTab />
      </div>
    </main>
  );
}
