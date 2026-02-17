/**
 * Animato seed script - fetches from anime API and populates DB
 * API: https://animeapi-blond.vercel.app/api/
 */
import { PrismaClient } from "@prisma/client";

const API_BASE = "https://animeapi-blond.vercel.app/api";

const prisma = new PrismaClient();

type TvInfo = {
  showType?: string;
  duration?: string;
  releaseDate?: string;
  quality?: string;
  episodeInfo?: { sub?: string; dub?: string };
  sub?: string;
  dub?: string;
  eps?: string;
};

type AnimeItem = {
  id: string;
  data_id: string;
  poster?: string;
  title: string;
  japanese_title?: string;
  description?: string;
  tvInfo?: TvInfo;
  adultContent?: boolean;
};

function parseEpisodeCount(s: string | undefined): number | null {
  if (s == null || s === "") return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

async function upsertAnime(item: AnimeItem): Promise<string> {
  const tv = item.tvInfo || {};
  const epInfo = tv.episodeInfo || {};
  const subCount = epInfo.sub ?? tv.sub ?? undefined;
  const dubCount = epInfo.dub ?? tv.dub ?? undefined;
  const totalEps = parseEpisodeCount(epInfo.eps ?? tv.eps) ?? parseEpisodeCount(subCount) ?? parseEpisodeCount(dubCount) ?? null;

  const poster = item.poster ?? null;
  const posterSmall = poster?.includes("300x400") ? poster : null;
  const posterLarge = poster && !poster.includes("300x400") ? poster : null;

  const anime = await prisma.anime.upsert({
    where: { externalId: item.id },
    create: {
      externalId: item.id,
      dataId: item.data_id,
      title: item.title,
      japaneseTitle: item.japanese_title ?? null,
      description: item.description ?? null,
      poster: posterLarge ?? poster,
      posterSmall: posterSmall ?? (posterLarge ? null : poster),
      showType: tv.showType ?? null,
      duration: tv.duration ?? null,
      releaseDate: tv.releaseDate ?? null,
      quality: tv.quality ?? null,
      subCount: subCount ?? null,
      dubCount: dubCount ?? null,
      totalEps,
      adultContent: item.adultContent ?? false,
      slug: item.id,
    },
    update: {
      title: item.title,
      japaneseTitle: item.japanese_title ?? null,
      description: item.description ?? null,
      posterSmall: item.poster?.includes("300x400") ? item.poster : undefined,
      showType: tv.showType ?? null,
      duration: tv.duration ?? null,
      releaseDate: tv.releaseDate ?? null,
      quality: tv.quality ?? null,
      subCount: subCount ?? null,
      dubCount: dubCount ?? null,
      totalEps,
      adultContent: item.adultContent ?? false,
    },
  });

  return anime.id;
}

async function main() {
  console.log("Fetching from API...");
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  if (!json.success || !json.results) throw new Error("Invalid API response");

  const results = json.results as {
    spotlights?: AnimeItem[];
    trending?: (AnimeItem & { number?: string })[];
    topTen?: {
      today?: (AnimeItem & { number?: string })[];
      week?: (AnimeItem & { number?: string })[];
      month?: (AnimeItem & { number?: string })[];
    };
    topAiring?: AnimeItem[];
  };

  const seenIds = new Set<string>();

  // Helper to collect and upsert anime from any list
  async function processList(
    list: AnimeItem[] | undefined,
    type: string,
    orderKey: (item: AnimeItem & { number?: string }, index: number) => number
  ) {
    if (!list?.length) return;
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (!item?.id) continue;
      const animeId = await upsertAnime(item);
      seenIds.add(item.id);
      const order = orderKey(item as AnimeItem & { number?: string }, i);
      await prisma.featuredAnime.upsert({
        where: {
          featured_type_order: { type, order },
        },
        create: {
          animeId: animeId,
          type,
          order,
        },
        update: { animeId },
      });
    }
  }

  // Clear existing featured to avoid stale data (optional - comment out to append)
  await prisma.featuredAnime.deleteMany({});

  await processList(results.spotlights, "spotlight", (_, i) => i + 1);
  await processList(results.trending, "trending", (item, i) => {
    const n = item.number ? parseInt(item.number, 10) : i + 1;
    return isNaN(n) ? i + 1 : n;
  });
  await processList(results.topTen?.today, "top_today", (item, i) => {
    const n = (item as { number?: string }).number ? parseInt((item as { number?: string }).number!, 10) : i + 1;
    return isNaN(n) ? i + 1 : n;
  });
  await processList(results.topTen?.week, "top_week", (item, i) => {
    const n = (item as { number?: string }).number ? parseInt((item as { number?: string }).number!, 10) : i + 1;
    return isNaN(n) ? i + 1 : n;
  });
  await processList(results.topTen?.month, "top_month", (item, i) => {
    const n = (item as { number?: string }).number ? parseInt((item as { number?: string }).number!, 10) : i + 1;
    return isNaN(n) ? i + 1 : n;
  });

  // topAiring - upsert anime only (no featured row required, or add type "top_airing")
  if (results.topAiring?.length) {
    for (const item of results.topAiring) {
      if (item?.id) await upsertAnime(item);
    }
  }

  // Create episodes for each anime (1..totalEps) - embed URLs can be resolved at watch time
  const animes = await prisma.anime.findMany({ where: {} });
  for (const anime of animes) {
    const total = anime.totalEps ?? (anime.subCount ? parseEpisodeCount(anime.subCount) : null) ?? 12;
    const maxEps = Math.min(total, 100); // cap for seed speed; add more on demand if needed
    for (let num = 1; num <= maxEps; num++) {
      await prisma.episode.upsert({
        where: {
          animeId_number: { animeId: anime.id, number: num },
        },
        create: {
          animeId: anime.id,
          number: num,
          title: `Episode ${num}`,
        },
        update: {},
      });
    }
  }

  // Ensure we have at least one genre for UI (optional)
  const genreNames = ["Action", "Adventure", "Fantasy", "Comedy", "Drama", "Romance", "Sci-Fi", "Horror"];
  for (const name of genreNames) {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    await prisma.genre.upsert({
      where: { slug },
      create: { name, slug },
      update: { name },
    });
  }

  console.log(`Seed done. Anime: ${animes.length}, Featured rows populated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
