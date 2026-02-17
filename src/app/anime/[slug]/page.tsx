import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAnimeBySlug, isFavorite, toggleFavorite } from "@/lib/actions";
import { FavoriteButton } from "@/components/FavoriteButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anime = await getAnimeBySlug(slug);
  if (!anime) return { title: "Anime" };
  return {
    title: `${anime.title} - Animato`,
    description: anime.description ?? undefined,
    openGraph: { title: anime.title, description: anime.description ?? undefined },
  };
}

export default async function AnimePage({ params }: Props) {
  const { slug } = await params;
  const anime = await getAnimeBySlug(slug);
  if (!anime) notFound();

  const favorited = await isFavorite(anime.id);
  const poster = anime.poster || anime.posterSmall || "https://placehold.co/1366x768/1f1f1f/666?text=No+Image";

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="relative h-[50vh] min-h-[300px] w-full">
        <Image
          src={poster}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            {anime.title}
          </h1>
          {anime.japaneseTitle && (
            <p className="text-white/80 text-lg mt-1">{anime.japaneseTitle}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 items-center mb-6">
          {anime.showType && (
            <span className="px-3 py-1 rounded bg-white/10 text-sm">{anime.showType}</span>
          )}
          {anime.duration && (
            <span className="text-netflix-lightGray text-sm">{anime.duration}</span>
          )}
          {anime.releaseDate && (
            <span className="text-netflix-lightGray text-sm">{anime.releaseDate}</span>
          )}
          {anime.quality && (
            <span className="px-2 py-0.5 rounded bg-netflix-red text-xs">{anime.quality}</span>
          )}
          <FavoriteButton animeId={anime.id} initial={favorited} toggleFavorite={toggleFavorite} />
        </div>

        {anime.description && (
          <p className="text-white/90 max-w-2xl mb-8 leading-relaxed">{anime.description}</p>
        )}

        {anime.genres?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {anime.genres.map((ag) => (
              <span
                key={ag.genre.id}
                className="px-3 py-1 rounded-full bg-netflix-gray text-sm text-white/90"
              >
                {ag.genre.name}
              </span>
            ))}
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Episodes</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {anime.episodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/watch/${anime.slug}/${ep.number}`}
                className="rounded bg-netflix-gray hover:bg-netflix-red text-center py-3 px-2 text-sm font-medium text-white transition-colors"
              >
                {ep.number}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
