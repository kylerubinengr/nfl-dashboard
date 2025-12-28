"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

interface StatusBannerProps {
  isSnapshot: boolean;
  lastUpdated?: number;
}

export function StatusBanner({ isSnapshot, lastUpdated }: StatusBannerProps) {
  const timeString = lastUpdated 
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  if (isSnapshot) {
    return (
      <div className="mb-4 bg-amber-50 border border-amber-100 rounded px-2 py-1 flex items-center gap-2 text-amber-700 text-[11px] dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400">
        <AlertCircle className="w-3 h-3 text-amber-500" />
        <p>
          <span className="font-bold uppercase tracking-wider">Offline:</span> Data from {timeString}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-2 text-green-600 text-[11px] px-1 dark:text-green-400">
      <CheckCircle2 className="w-3 h-3" />
      <p>
        <span className="font-bold uppercase tracking-wider">Live:</span> Updated just now
      </p>
    </div>
  );
}
