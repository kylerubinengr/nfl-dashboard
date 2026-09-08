import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ season: string }> }): Promise<Metadata> {
  const { season } = await params;
  return {
    title: `${season} Top Performances`,
    description: `Top NFL player performances by EPA for the ${season} season.`,
  };
}

export default function PerformancesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
