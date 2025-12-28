import React from 'react';

interface StatTableProps {
  title: string;
  headers: string[];
  players: { name: string; stats: string[] }[];
  totals?: string[];
}

export function StatTable({ title, headers, players, totals }: StatTableProps) {
  if (!players || players.length === 0) return null;

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden dark:border-slate-800">
      <div className="bg-slate-50 p-2 border-b border-slate-100 flex justify-between items-center dark:bg-slate-800/50 dark:border-slate-800">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50/50 dark:bg-slate-800/30">
            <tr>
              <th className="p-2 text-left font-bold text-slate-400 dark:text-slate-500">Player</th>
              {headers.map((h, i) => (
                <th key={i} className="p-2 text-right font-bold text-slate-400 dark:text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {players.map((player, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
                <td className="px-3 py-1 text-[11px] font-bold text-slate-700 whitespace-nowrap dark:text-slate-300">
                  {player.name}
                </td>
                {player.stats.map((stat, i) => (
                  <td key={i} className="px-1.5 py-1 text-right text-[10px] text-slate-500 font-mono dark:text-slate-400">
                    {stat}
                  </td>
                ))}
              </tr>
            ))}
            {totals && totals.length > 0 && totals.some(t => t) && (
              <tr className="bg-slate-50/50 font-black border-t border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                <td className="px-3 py-1 text-[10px] text-slate-900 uppercase dark:text-slate-300">Team</td>
                {totals.map((total, i) => (
                  <td key={i} className="px-1.5 py-1 text-right text-[10px] text-slate-900 font-mono dark:text-slate-300">
                    {total}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}