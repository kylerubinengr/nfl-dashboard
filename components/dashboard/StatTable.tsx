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
    <div className="mb-4 overflow-hidden rounded border border-slate-100 bg-white shadow-sm">
      <div className="bg-slate-50 px-3 py-1.5 font-black uppercase text-slate-400 text-[10px] tracking-widest border-b border-slate-100">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-[9px] uppercase text-slate-400 font-bold border-b border-slate-50">
            <tr>
              <th className="px-3 py-1.5 min-w-[120px]">Player</th>
              {headers.map((header, i) => (
                <th key={i} className="px-1.5 py-1.5 text-right min-w-[45px]">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {players.map((player, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-3 py-1 text-[11px] font-bold text-slate-700 whitespace-nowrap">
                  {player.name}
                </td>
                {player.stats.map((stat, i) => (
                  <td key={i} className="px-1.5 py-1 text-right text-[10px] text-slate-500 font-mono">
                    {stat}
                  </td>
                ))}
              </tr>
            ))}
            {totals && totals.length > 0 && totals.some(t => t) && (
              <tr className="bg-slate-50/50 font-black border-t border-slate-100">
                <td className="px-3 py-1 text-[10px] text-slate-900 uppercase">Team</td>
                {totals.map((total, i) => (
                  <td key={i} className="px-1.5 py-1 text-right text-[10px] text-slate-900 font-mono">
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
