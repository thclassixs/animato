import { getFeaturedRows } from "@/lib/actions";
import { Hero } from "@/components/Hero";
import { AnimeRow } from "@/components/AnimeRow";

export default async function HomePage() {
  const rows = await getFeaturedRows();
  const firstSpotlight = rows.spotlight[0];

  return (
    <div className="min-h-screen">
      {firstSpotlight && <Hero anime={firstSpotlight} />}
      <div className="space-y-2">
        {rows.spotlight.length > 1 && (
          <AnimeRow title="Spotlight" animes={rows.spotlight.slice(1)} />
        )}
        <AnimeRow title="Trending Now" animes={rows.trending} />
        <AnimeRow title="Top 10 Today" animes={rows.topToday} showRank />
        <AnimeRow title="Top This Week" animes={rows.topWeek} showRank />
        <AnimeRow title="Top This Month" animes={rows.topMonth} showRank />
      </div>
    </div>
  );
}
