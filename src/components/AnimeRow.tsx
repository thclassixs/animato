"use client";

import { useRef } from "react";
import { AnimeCard } from "./AnimeCard";

type Anime = {
  id: string;
  title: string;
  poster?: string | null;
  posterSmall?: string | null;
  slug: string;
};

type Props = {
  title: string;
  animes: Anime[];
  showRank?: boolean;
};

export function AnimeRow({ title, animes, showRank }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!animes.length) return null;

  return (
    <section className="py-6">
      <div className="flex items-center justify-between px-4 max-w-7xl mx-auto mb-3">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto overflow-y-hidden scroll-smooth px-4 max-w-7xl mx-auto pb-2 scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {animes.map((anime, i) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            size="medium"
            rank={showRank ? i + 1 : undefined}
          />
        ))}
      </div>
    </section>
  );
}
