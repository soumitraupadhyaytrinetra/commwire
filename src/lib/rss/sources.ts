export interface RSSSource {
  name: string;
  feedUrl: string;
  url: string;
  category: string;
  authority: number;
}

// 11 working feeds (probed 2026-06-28). Failed candidates pruned:
// - Kitco, World Gold Council /news/rss, Mining Weekly: RSS endpoints
//   returned 404 (likely removed)
// - OilPrice.com /rss/, Rigzone, World Oil: same — 404
// - Reuters Energy, Reuters Metals: reutersagency.com redirects to a 404
// - Agriculture.com, Brownfield Ag News, HPJ, Farm Progress, World-Grain,
//   USDA: Cloudflare 403 / paywall / timeouts — bodies empty even when 200
//   (Cloudflare bot challenge returns empty HTML)
// - Sprott Money, Money Metals: 403 bot blocks
// - BullionVault, Goldmoney, CommodityOnline: 404 / 403
// - Natural Gas Intel: returns 200 but only 1 item — too thin to keep;
//   Natural Gas World (20 items) covers the category.
export const defaultSources: RSSSource[] = [
  // Gold
  { name: "World Gold Council", feedUrl: "https://www.gold.org/rss.xml", url: "https://www.gold.org", category: "gold", authority: 9 },

  // Silver
  { name: "Silver Institute", feedUrl: "https://silverinstitute.org/feed/", url: "https://silverinstitute.org", category: "silver", authority: 8 },

  // Oil
  { name: "OilPrice.com", feedUrl: "https://oilprice.com/rss/main", url: "https://oilprice.com", category: "oil", authority: 8 },

  // Gas
  { name: "Natural Gas World", feedUrl: "https://www.naturalgasworld.com/rss", url: "https://www.naturalgasworld.com", category: "gas", authority: 8 },

  // Mining & Metals
  { name: "Mining.com", feedUrl: "https://www.mining.com/feed/", url: "https://www.mining.com", category: "metals", authority: 9 },
  { name: "Investing.com Commodities", feedUrl: "https://www.investing.com/rss/news_14.rss", url: "https://www.investing.com/commodities", category: "metals", authority: 7 },
  { name: "Investing News Network", feedUrl: "https://investingnews.com/feeds/feed.rss", url: "https://investingnews.com", category: "metals", authority: 8 },

  // Agriculture
  { name: "American Ag Network", feedUrl: "https://www.americanagnetwork.com/feed/", url: "https://www.americanagnetwork.com", category: "agriculture", authority: 7 },
  { name: "Farm Foundation", feedUrl: "https://www.farmfoundation.org/feed/", url: "https://www.farmfoundation.org", category: "agriculture", authority: 7 },
];

export const categoryMapping: Record<string, string> = {
  gold: "gold",
  silver: "silver",
  oil: "oil",
  gas: "gas",
  metals: "metals",
  agriculture: "agriculture",
};
