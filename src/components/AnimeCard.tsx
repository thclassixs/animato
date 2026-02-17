import Link from "next/link";
import Image from "next/image";

type Anime = {
  id: string;
  title: string;
  poster?: string | null;
  posterSmall?: string | null;
  slug: string;
};

type Props = {
  anime: Anime;
  size?: "small" | "medium" | "large";
  rank?: number;
};

const sizeClasses = {
  small: "w-32 min-w-[8rem] aspect-[2/3]",
  medium: "w-40 min-w-[10rem] aspect-[2/3]",
  large: "w-48 min-w-[12rem] aspect-[2/3]",
};

export function AnimeCard({ anime, size = "medium", rank }: Props) {
  const imgUrl = anime.posterSmall || anime.poster || "https://placehold.co/300x400/1f1f1f/666?text=No+Image";
  const sizeClass = sizeClasses[size];

  return (
    <Link
      href={`/anime/${anime.slug}`}
      className={`group block ${sizeClass} rounded-lg overflow-hidden bg-netflix-gray shrink-0 transition-transform duration-300 hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-netflix-red`}
    >
      <div className="relative w-full h-full">
        <Image
          src={imgUrl}
          alt={anime.title}
          fill
          className="object-cover transition-opacity group-hover:opacity-90"
          sizes="(max-width: 768px) 128px, 192px"
          unoptimized
        />
        {rank != null && (
          <span className="absolute left-0 top-0 bg-netflix-red text-white text-2xl font-black w-10 h-10 flex items-center justify-center">
            {rank}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="absolute bottom-0 left-0 right-0 p-2 text-white text-sm font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
          {anime.title}
        </p>
      </div>
    </Link>
  );
}
