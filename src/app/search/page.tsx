import { Suspense } from "react";
import { SearchForm } from "@/components/SearchForm";
import { searchAnime } from "@/lib/actions";
import { AnimeCard } from "@/components/AnimeCard";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata = {
  title: "Search - Animato",
  description: "Search anime on Animato",
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const animes = q ? await searchAnime(q) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
      <Suspense fallback={<div className="h-12 w-full max-w-xl rounded-lg bg-netflix-gray animate-pulse" />}>
        <SearchForm initialQuery={q} />
      </Suspense>
      {q != null && (
        <div className="mt-8">
          {animes.length === 0 ? (
            <p className="text-netflix-lightGray">No results for &quot;{q}&quot;</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {animes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} size="medium" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
