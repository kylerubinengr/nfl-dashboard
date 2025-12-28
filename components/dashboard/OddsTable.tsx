"use client";

import { Bookmaker, BettingOdds } from "@/types/nfl";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

interface OddsTableProps {
  bookmakers: Bookmaker[];
}

const getBookmakerLogo = (key: string) => {
  switch (key) {
    case "draftkings": return "DK";
    case "fanduel": return "FD";
    case "betmgm": return "MGM";
    default: return key.substring(0, 3).toUpperCase();
  }
};

const formatMoneyline = (moneyline: number) => {
  if (moneyline > 0) return `+${moneyline}`;
  return moneyline;
};

const MovementArrow = ({ movement }: { movement: BettingOdds['movement'] }) => {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(false), 300000); // 5 minutes
    return () => clearTimeout(timer);
  }, [movement]);

  if (movement === 'stable' || !animate) {
    return null;
  }

  const iconClass = `w-3 h-3 text-slate-400 ${animate ? 'animate-fade-in' : ''}`;
  if (movement === 'up') {
    return <TrendingUp className={iconClass} />;
  }
  if (movement === 'down') {
    return <TrendingDown className={iconClass} />;
  }
  return null;
};

export function OddsTable({ bookmakers }: OddsTableProps) {
  if (!bookmakers || bookmakers.length === 0) {
    return (
      <div className="text-center text-sm text-slate-500 py-3">
        Odds not available
      </div>
    );
  }

  const getUniqueBest = (values: number[], isMoneyline: boolean = false) => {
    if (values.length === 0) return null;
    const sorted = [...new Set(values)].sort((a, b) => {
      if (isMoneyline) {
        if (a >= 0 && b >= 0) return b - a;
        if (a < 0 && b < 0) return a - b;
        return a - b;
      }
      return b - a;
    });
    if (sorted.length > 1 && sorted[0] > sorted[1]) {
      return sorted[0];
    }
    return null;
  };

  const spreadValues = bookmakers.map((b) => b.odds.spread);
  const totalValues = bookmakers.map((b) => b.odds.total);
  const moneylineHomeValues = bookmakers.map((b) => b.odds.moneylineHome);
  const moneylineAwayValues = bookmakers.map((b) => b.odds.moneylineAway);

  const bestSpread = getUniqueBest(spreadValues);
  const bestTotal = getUniqueBest(totalValues);
  const bestMoneylineHome = getUniqueBest(moneylineHomeValues, true);
  const bestMoneylineAway = getUniqueBest(moneylineAwayValues, true);

  const getCellClasses = (value: number, bestValue: number | null) => {
    let classes = "font-mono text-slate-500 dark:text-slate-400";
    if (bestValue !== null && value === bestValue) {
      classes = "font-bold text-slate-950 bg-slate-100 rounded-sm dark:bg-slate-800 dark:text-slate-100";
    }
    return classes;
  };

  return (
    <div className="p-3 bg-slate-50/70 dark:bg-slate-800/30">
      <table className="w-full text-xs text-center border-separate [border-spacing:0.5rem_0.25rem]">
        <thead className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400">
          <tr>
            <th className="text-left py-1">Bookmaker</th>
            <th>Spread</th>
            <th>Total</th>
            <th>Home</th>
            <th>Away</th>
          </tr>
        </thead>
        <tbody>
          {bookmakers.map((book) => (
            <tr key={book.key}>
              <td className="text-left font-bold text-slate-700 py-2 dark:text-slate-200">
                {getBookmakerLogo(book.key)}
              </td>
              <td>
                <div className="flex items-center justify-center gap-1">
                  <span className={getCellClasses(book.odds.spread, bestSpread)}>
                    {book.odds.spread > 0 ? `+${book.odds.spread}`: book.odds.spread}
                  </span>
                  <MovementArrow movement={book.odds.movement} />
                </div>
              </td>
              <td>
                <div className="flex items-center justify-center gap-1">
                  <span className={getCellClasses(book.odds.total, bestTotal)}>
                    {book.odds.total}
                  </span>
                   <MovementArrow movement={book.odds.movement} />
                </div>
              </td>
              <td>
                <div className="flex items-center justify-center gap-1">
                  <span className={getCellClasses(book.odds.moneylineHome, bestMoneylineHome)}>
                    {formatMoneyline(book.odds.moneylineHome)}
                  </span>
                   <MovementArrow movement={book.odds.movement} />
                </div>
              </td>
              <td>
                <div className="flex items-center justify-center gap-1">
                  <span className={getCellClasses(book.odds.moneylineAway, bestMoneylineAway)}>
                    {formatMoneyline(book.odds.moneylineAway)}
                  </span>
                  <MovementArrow movement={book.odds.movement} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}