import { getFavorites } from "@/lib/actions";
import { AnimeCard } from "@/components/AnimeCard";
import Link from "next/link";

export const metadata = {
  title: "Favorites - Animato",
  description: "Your favorite anime",
};

export default async function FavoritesPage() {
  const animes = await getFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Favorites</h1>
      {animes.length === 0 ? (
        <p className="text-netflix-lightGray mb-4">
          You haven&apos;t added any favorites yet. Browse anime and click &quot;Add to Favorites&quot; on any title.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} size="medium" />
          ))}
        </div>
      )}
      <Link href="/" className="inline-block mt-6 text-netflix-red hover:text-red-400 font-medium">
        ← Back to Home
      </Link>
    </div>
  );
}
