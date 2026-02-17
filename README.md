# Animato

A modern anime streaming website (Netflix-style) built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **PostgreSQL (Neon)** with **Prisma ORM**. Database-first architecture.

## Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS**
- **Prisma** + **PostgreSQL (Neon)**
- **Server Actions** for data mutations
- SEO-friendly metadata

## Setup

### 1. Environment

Ensure `.env` contains your Neon database URL:

```env
DATABASE_URL=postgresql://...?sslmode=require
```

### 2. Install dependencies

```bash
npm install
```

### 3. Database (run in order)

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Neon (creates tables)
npm run db:push

# Seed from anime API (https://animeapi-blond.vercel.app/api/)
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start dev server (Turbopack)   |
| `npm run build`| Production build               |
| `npm run start`| Start production server        |
| `npm run db:generate` | Generate Prisma client  |
| `npm run db:push`     | Push schema to DB        |
| `npm run db:seed`     | Seed from anime API      |
| `npm run db:studio`   | Open Prisma Studio       |

## Pages

- **Home** – Hero + rows (Spotlight, Trending, Top 10 Today/Week/Month)
- **Anime Details** (`/anime/[slug]`) – Info, episodes list, add to favorites
- **Watch** (`/watch/[slug]/[episode]`) – iframe player
- **Search** – Query anime by title
- **Favorites** – Guest favorites list

## Database schema (summary)

- **Anime** – title, description, poster, metadata, slug
- **Episode** – number, optional stream URLs (embed resolved at watch time)
- **Genre** – many-to-many with Anime
- **User** – for favorites/watch history (guest user by default)
- **Favorite** – user ↔ anime
- **WatchHistory** – user progress per episode
- **FeaturedAnime** – homepage row placement (spotlight, trending, top_today, etc.)

Data is seeded from `https://animeapi-blond.vercel.app/api/`.
