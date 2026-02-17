"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ANIME_API_BASE = "https://animeapi-blond.vercel.app";

export type AnimeWithRelations = Awaited<ReturnType<typeof getAnimeBySlug>>;
export type EpisodeWithAnime = Awaited<ReturnType<typeof getEpisodeForWatch>>;

export async function getFeaturedRows() {
  const [spotlight, trending, topToday, topWeek, topMonth] = await Promise.all([
    prisma.featuredAnime.findMany({
      where: { type: "spotlight" },
      orderBy: { order: "asc" },
      include: { anime: true },
    }),
    prisma.featuredAnime.findMany({
      where: { type: "trending" },
      orderBy: { order: "asc" },
      include: { anime: true },
    }),
    prisma.featuredAnime.findMany({
      where: { type: "top_today" },
      orderBy: { order: "asc" },
      include: { anime: true },
    }),
    prisma.featuredAnime.findMany({
      where: { type: "top_week" },
      orderBy: { order: "asc" },
      include: { anime: true },
    }),
    prisma.featuredAnime.findMany({
      where: { type: "top_month" },
      orderBy: { order: "asc" },
      include: { anime: true },
    }),
  ]);

  return {
    spotlight: spotlight.map((f) => f.anime),
    trending: trending.map((f) => f.anime),
    topToday: topToday.map((f) => f.anime),
    topWeek: topWeek.map((f) => f.anime),
    topMonth: topMonth.map((f) => f.anime),
  };
}

export async function getAnimeBySlug(slug: string) {
  return prisma.anime.findUnique({
    where: { slug },
    include: {
      episodes: { orderBy: { number: "asc" } },
      genres: { include: { genre: true } },
    },
  });
}

export async function getAnimeById(id: string) {
  return prisma.anime.findUnique({
    where: { id },
    include: {
      episodes: { orderBy: { number: "asc" } },
      genres: { include: { genre: true } },
    },
  });
}

export async function getEpisodeForWatch(animeSlug: string, episodeNumber: number) {
  const anime = await prisma.anime.findUnique({
    where: { slug: animeSlug },
    include: { episodes: { orderBy: { number: "asc" } } },
  });
  if (!anime) return null;
  const episode = anime.episodes.find((e) => e.number === episodeNumber);
  if (!episode) return null;
  return { anime, episode };
}

/**
 * Fetch real stream embed URL from anime API.
 * API: GET /api/episodes/{id} then GET /api/stream?id={episodeId}&server=hd-1&type=sub
 */
export async function getStreamEmbedUrl(
  animeExternalId: string,
  episodeNumber: number,
  sub: boolean = true
): Promise<string | null> {
  try {
    const episodesRes = await fetch(
      `${ANIME_API_BASE}/api/episodes/${animeExternalId}`,
      { next: { revalidate: 300 } }
    );
    if (!episodesRes.ok) return null;
    const episodesJson = await episodesRes.json();
    const episodes = episodesJson?.results?.episodes as Array<{ episode_no: number; id: string }> | undefined;
    const ep = episodes?.find((e) => e.episode_no === episodeNumber);
    if (!ep?.id) return null;

    const type = sub ? "sub" : "dub";
    const streamRes = await fetch(
      `${ANIME_API_BASE}/api/stream?id=${encodeURIComponent(ep.id)}&server=hd-1&type=${type}`,
      { next: { revalidate: 60 } }
    );
    if (!streamRes.ok) return null;
    const streamJson = await streamRes.json();
    const iframe = streamJson?.results?.streamingLink?.iframe as string | undefined;
    return iframe ?? null;
  } catch {
    return null;
  }
}

export async function searchAnime(q: string) {
  if (!q.trim()) return [];
  return prisma.anime.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { japaneseTitle: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 24,
    orderBy: { title: "asc" },
  });
}

export async function getAllAnimeForBrowse() {
  return prisma.anime.findMany({
    orderBy: { title: "asc" },
    take: 100,
  });
}

const GUEST_EMAIL = "guest@animato.local";

async function getOrCreateGuestUserId(): Promise<string> {
  let user = await prisma.user.findUnique({ where: { email: GUEST_EMAIL } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: GUEST_EMAIL, name: "Guest" },
    });
  }
  return user.id;
}

export async function getFavorites() {
  const user = await prisma.user.findUnique({
    where: { email: GUEST_EMAIL },
    include: { favorites: { include: { anime: true } } },
  });
  return user?.favorites.map((f) => f.anime) ?? [];
}

export async function toggleFavorite(animeId: string) {
  const userId = await getOrCreateGuestUserId();
  const existing = await prisma.favorite.findUnique({
    where: { userId_animeId: { userId, animeId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId, animeId } });
  }
  revalidatePath("/");
  revalidatePath("/favorites");
  revalidatePath("/anime/[slug]");
}

export async function isFavorite(animeId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email: GUEST_EMAIL } });
  if (!user) return false;
  const fav = await prisma.favorite.findUnique({
    where: { userId_animeId: { userId: user.id, animeId } },
  });
  return !!fav;
}

export async function recordWatchProgress(
  animeId: string,
  episodeId: string,
  progress: number,
  completed: boolean
) {
  const userId = await getOrCreateGuestUserId();
  await prisma.watchHistory.upsert({
    where: {
      userId_episodeId: { userId, episodeId },
    },
    create: { userId, animeId, episodeId, progress, completed },
    update: { progress, completed },
  });
  revalidatePath("/anime/[slug]");
}
