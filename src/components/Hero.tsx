import Link from "next/link";
import Image from "next/image";

type Anime = {
  id: string;
  title: string;
  description?: string | null;
  poster?: string | null;
  slug: string;
};

type Props = {
  anime: Anime;
};

export function Hero({ anime }: Props) {
  const poster = anime.poster || "https://placehold.co/1366x768/1f1f1f/666?text=No+Image";

  return (
    <section className="relative h-[70vh] min-h-[400px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={poster}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-4 max-w-2xl">
          {anime.title}
        </h1>
        {anime.description && (
          <p className="text-white/90 text-sm md:text-base line-clamp-3 max-w-xl mb-6">
            {anime.description}
          </p>
        )}
        <div className="flex gap-3">
          <Link
            href={`/anime/${anime.slug}`}
            className="px-6 py-3 rounded bg-netflix-red text-white font-semibold hover:bg-red-600 transition-colors"
          >
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
}
