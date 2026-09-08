import type { Metadata } from "next";
import { isPlayoffSlug, getPlayoffFullName } from "@/lib/routes";

export async function generateMetadata({ params }: { params: Promise<{ season: string; week: string }> }): Promise<Metadata> {
  const { season, week } = await params;
  const weekNum = week.replace(/^week-/, '');
  const weekLabel = isPlayoffSlug(week) ? getPlayoffFullName(week) : `Week ${weekNum}`;
  return {
    title: `${season} ${weekLabel}`,
    description: `NFL scores for ${weekLabel} of the ${season} season.`,
  };
}

export default function ScoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
