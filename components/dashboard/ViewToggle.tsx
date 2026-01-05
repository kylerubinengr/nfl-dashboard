"use client";

import { useRouter, usePathname } from "next/navigation";
import { Calendar, Users } from "lucide-react";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();

  const isTeamView = pathname.startsWith("/team");
  const isWeekView = pathname.startsWith("/dashboard") || pathname === "/";

  return (
    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
      <button
        onClick={() => router.push("/dashboard/18")}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          flex items-center gap-2
          ${isWeekView
            ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }
        `}
      >
        <Calendar className="w-4 h-4" />
        Week View
      </button>
      <button
        onClick={() => router.push("/team/BUF")}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          flex items-center gap-2
          ${isTeamView
            ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }
        `}
      >
        <Users className="w-4 h-4" />
        Team View
      </button>
    </div>
  );
}
