# CommWire

A commodity markets news intelligence platform. Aggregates headlines from major commodity desks, mining publications, energy wires, and agriculture reports across 6 categories — Gold, Silver, Oil, Gas, Mining & Metals, Agriculture.

**Live demo:** [commwire.app](https://commwire.app)

## What CommWire is

A static site that crawls 9 RSS feeds from World Gold Council, Silver Institute, OilPrice.com, Natural Gas World, Mining.com, Investing.com, Investing News Network, American Ag Network, and Farm Foundation, then surfaces them through a category-indexed reading experience. Built on Astro with the Lipi design language, designed for fast page loads and zero-tracking browsing.

It is the commodities-sector sibling of [FinWire](https://github.com/soumitraupadhyaytrinetra/finwire) (finance), [DeepWire Celebs](https://github.com/soumitraupadhyaytrinetra/celebwire) (entertainment), and [DeepWire](https://github.com/Himan-D/deepwire) (AI/deep-tech).

## Features

- 6 category landing pages (Gold, Silver, Oil, Gas, Mining & Metals, Agriculture)
- Article detail pages with TL;DR, full text, importance score, related stories
- Trending sidebar with tag-driven growth tracking
- Full-text search across all ingested articles
- Dark theme, terracotta accent, Manrope typography — identical visual treatment to FinWire/Celebs
- Read-only admin dashboard at `/admin` showing counts, source list, and trends
- All static HTML output — no client-side database, no third-party trackers
- Article ingestion pipeline via RSS → keyword classifier → optional full-text crawl → JSON store

## Getting Started

### Clone and install

```sh
git clone https://github.com/soumitraupadhyaytrinetra/commwire.git
cd commwire
npm install
npm run dev
```

Dev server runs at `http://localhost:4321/`.

### Ingest commodity feeds

```sh
npm run ingest              # all sources
npm run ingest "Kitco News" # one source only
```

### Other worker commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run ingest` | Pull RSS from all ~22 sources into `data/articles.json` |
| `npm run process` | Backfill full content for unprocessed articles |
| `npm test` | Run classifier unit tests |

## Configuration

All site identity lives in `src/config.ts`:

```ts
export const siteConfig = {
  name: "CommWire",
  description: "Commodity Markets News Intelligence",
  url: "https://commwire.app",
  // ...
};

export const categories = [
  { id: "gold", label: "Gold", icon: "🥇" },
  // ...5 more
];
```

The RSS source list is in `src/lib/rss/sources.ts`. The category classifier vocabulary is in `src/lib/ai/classify.ts`.

## Project Structure

```
commwire/
├── astro.config.mjs
├── package.json
├── vitest.config.ts
├── data/                       # runtime: articles.json, sources-state.json
├── public/
├── src/
│   ├── config.ts               # siteConfig + categories + nav
│   ├── styles/global.css       # design tokens (identical to finwire)
│   ├── layouts/{Base,Admin}Layout.astro
│   ├── components/
│   │   ├── layout/             # Header, Footer
│   │   ├── news/               # NewsCard, HeroSection, TrendingTopics
│   │   ├── search/SearchBar.astro
│   │   └── ui/                 # Badge, TimeAgo
│   ├── lib/
│   │   ├── data.ts             # JSON-backed read API
│   │   ├── utils.ts
│   │   ├── rss/{parser,sources}.ts
│   │   └── ai/classify.ts      # keyword + source-hint classifier
│   └── pages/
│       ├── index.astro
│       ├── trending.astro
│       ├── gold.astro, silver.astro, oil.astro,
│       ├── gas.astro, metals.astro, agriculture.astro
│       ├── search.astro
│       ├── api/articles.json.ts   # slim article index for client-side search
│       ├── story/[slug].astro
│       └── admin/{index,feeds,jobs,trends}.astro
├── tests/
│   └── ai/classify.test.ts
└── workers/
    ├── db-migrate.ts
    ├── rss-ingestion.ts
    └── article-processing.ts
```

## License

MIT.
