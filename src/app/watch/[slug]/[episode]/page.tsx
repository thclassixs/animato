import { notFound } from "next/navigation";
import Link from "next/link";
import { getEpisodeForWatch, getStreamEmbedUrl } from "@/lib/actions";

type Props = { params: Promise<{ slug: string; episode: string }> };

export default async function WatchPage({ params }: Props) {
  const { slug, episode: epParam } = await params;
  const episodeNumber = parseInt(epParam, 10);
  if (isNaN(episodeNumber) || episodeNumber < 1) notFound();

  const data = await getEpisodeForWatch(slug, episodeNumber);
  if (!data) notFound();

  const { anime, episode } = data;
  const embedUrl = await getStreamEmbedUrl(anime.externalId, episode.number, true);

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="sticky top-16 z-10 bg-netflix-black/95 border-b border-white/10 px-4 py-3 flex items-center justify-between max-w-7xl mx-auto">
        <Link
          href={`/anime/${anime.slug}`}
          className="text-netflix-red hover:text-red-400 font-semibold"
        >
          ← Back to {anime.title}
        </Link>
        <span className="text-netflix-lightGray">
          Episode {episode.number}
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${anime.title} - Episode ${episode.number}`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-netflix-lightGray">
              <p>Stream unavailable for this episode. Try again later.</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {episode.number > 1 && (
            <Link
              href={`/watch/${anime.slug}/${episode.number - 1}`}
              className="px-4 py-2 rounded bg-netflix-gray hover:bg-netflix-red transition-colors"
            >
              ← Previous
            </Link>
          )}
          {data.anime.episodes.some((e) => e.number === episode.number + 1) && (
            <Link
              href={`/watch/${anime.slug}/${episode.number + 1}`}
              className="px-4 py-2 rounded bg-netflix-gray hover:bg-netflix-red transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
