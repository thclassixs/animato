"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Props = { initialQuery?: string };

export function SearchForm({ initialQuery }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl">
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="Search anime..."
        className="flex-1 rounded-lg bg-netflix-gray border border-white/10 px-4 py-3 text-white placeholder:text-netflix-lightGray focus:outline-none focus:ring-2 focus:ring-netflix-red"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-3 rounded-lg bg-netflix-red text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        Search
      </button>
    </form>
  );
}
