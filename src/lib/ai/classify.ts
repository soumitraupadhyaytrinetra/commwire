export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  gold: [
    "gold", "gold price", "gold prices", "spot gold", "gold spot", "xau", "xau/usd",
    "gold etf", "gold etfs", "gld", "iau", "gold futures", "gold contract",
    "central bank gold", "central bank reserves", "gold reserves", "bullion",
    "gold mining", "gold miner", "gold producers", "gold bar", "gold bars",
    "gold coin", "gold coins", "gold ounce", "troy ounce",
    "safe haven", "haven asset", "haven demand",
    "yellow metal",
    "newmont", "barrick gold", "goldman sachs commodity",
    "goldman", "fraser institute",
    "tether gold", "paxg",
    "黄金", "金价",
  ],
  silver: [
    "silver", "silver price", "silver prices", "spot silver", "silver spot", "xag", "xag/usd",
    "silver etf", "silver etfs", "slv", "silver futures",
    "industrial silver", "silver demand", "silver supply", "silver deficit", "silver shortage",
    "silver mining", "silver miner", "silver producer", "silver mine",
    "silver bar", "silver bars", "silver coin", "silver coins",
    "photovoltaic silver", "solar panel silver", "solar silver",
    "silverware", "sterling silver",
    "first majestic", "pan american silver", "wheaton precious",
    "白银", "银价",
  ],
  oil: [
    "crude oil", "crude", "oil price", "oil prices", "oil futures",
    "wti", "brent", "brent crude", "wti crude",
    "opec", "opec+", "opec plus", "saudi", "aramco", "uae oil",
    "shale", "shale oil", "fracking", "frack", "permian", "bakken",
    "refinery", "refineries", "refining", "refiner",
    "barrel", "barrels", "bbl", "mb/d", "million barrels",
    "petroleum", "crude supply", "oil demand",
    "exxon", "chevron", "shell", "bp", "totalenergies",
    "原油", "石油", "油价",
  ],
  gas: [
    "natural gas", "nat gas", "natgas",
    "henry hub", "ttf", "jkm", "lng", "liquefied natural gas",
    "lng carrier", "lng terminal", "lng export", "lng import",
    "gas pipeline", "nord stream", "pipeline gas",
    "gasprom", "gazprom", "novatek", "qatar energy",
    "天然气", "液化天然气",
    "shale gas", "gas field", "gas reserves", "gas supply", "gas demand",
    "european gas", "asian lng", "us lng", "gas price", "gas prices",
    "coal-to-gas", "coal to gas", "blue hydrogen", "green hydrogen",
  ],
  metals: [
    "copper", "copper price", "copper prices", "copper futures",
    "iron ore", "iron ore price", "iron ore prices",
    "lithium", "lithium price", "lithium carbonate", "lithium hydroxide",
    "nickel", "nickel price", "nickel prices", "nickel pig iron",
    "aluminum", "aluminium", "aluminum price", "aluminum futures",
    "zinc", "zinc price", "lead", "tin",
    "steel", "steel price", "steel prices", "rebar", "hot-rolled coil", "hrc",
    "cobalt", "manganese", "tungsten", "rare earth",
    "bhp", "rio tinto", "vale", "glencore", "anglo american", "southern copper",
    "freeport-mcmoran", "freeport mcmoran", "first quantum",
    "mining company", "mining companies", "mining sector",
    "bauxite", "concentrate",
    "铜", "锂", "镍",
  ],
  agriculture: [
    "wheat", "wheat price", "wheat futures", "wheat crop", "winter wheat", "spring wheat",
    "corn", "corn price", "corn futures", "corn crop", "corn yield", "corn belt",
    "soybean", "soybeans", "soybean price", "soybean futures", "soybean crop",
    "coffee", "coffee price", "coffee futures", "arabica", "robusta",
    "sugar", "sugar price", "sugar futures", "raw sugar", "white sugar",
    "cocoa", "cocoa price", "cocoa futures",
    "cotton", "cotton price", "cotton futures",
    "rice", "rice price", "palm oil", "soybean oil", "canola", "rapeseed",
    "usda", "usda report", "crop report", "planting report", "wasde",
    "harvest", "harvest season", "crop yield", "grain", "grains",
    "futures market", "futures contract", "soft commodities",
    "fertilizer", "urea", "potash", "phosphate",
    "小麦", "玉米", "大豆", "咖啡", "糖",
  ],
};

export const SOURCE_CATEGORY_HINTS: Record<string, string[]> = {
  "Kitco News": ["gold", "silver"],
  "World Gold Council": ["gold"],
  "Mining.com": ["metals", "gold", "silver"],
  "Sprott Money": ["gold", "silver"],
  "Silver Institute": ["silver"],
  "OilPrice.com": ["oil", "gas"],
  "World Oil": ["oil"],
  "Rigzone": ["oil", "gas"],
  "Reuters Energy": ["oil", "gas"],
  "Natural Gas Intel": ["gas"],
  "Mining Weekly": ["metals", "gold"],
  "Reuters Metals": ["metals"],
  "Investing.com Commodities": ["metals", "agriculture"],
  "SteelOrbis": ["metals"],
  "World-Grain": ["agriculture"],
  "Successful Farming": ["agriculture"],
  "Farm Futures": ["agriculture"],
  "Brownfield Ag News": ["agriculture"],
  "USDA News": ["agriculture"],
};

// Word-boundary keyword match. Substring matching (String.includes) was
// catching false positives on short keywords — e.g. the metals symbol "au"
// matches "australia", "audit", "auto". Word boundaries fix that for all
// keywords, not just short ones, with negligible perf cost at our scale.
function kwMatches(text: string, kw: string): boolean {
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

function extractKeywords(title: string, content: string): string {
  return `${title} ${content}`.toLowerCase();
}

export function classifyArticle(title: string, content: string): string[] {
  const text = extractKeywords(title, content);
  const matched: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => kwMatches(text, kw))) {
      matched.push(category);
    }
  }

  return [...new Set(matched)];
}

export function getPrimaryCategory(
  title: string,
  content: string,
  source: string
): string {
  const keywords = classifyArticle(title, content);
  const sourceHint = SOURCE_CATEGORY_HINTS[source];

  if (keywords.length === 0 && sourceHint) {
    return sourceHint[0];
  }

  // If keywords matched, pick the most specific single category.
  // Priority chain: gold > silver > oil > gas > metals > agriculture
  // (precious metals win over base metals; energy over metals/agriculture)
  if (keywords.length > 0) {
    const priority = ["gold", "silver", "oil", "gas", "metals", "agriculture"];
    for (const cat of priority) {
      if (keywords.includes(cat)) return cat;
    }
  }

  if (sourceHint) return sourceHint[0];

  return "metals";
}

export const categoryMapping: Record<string, string> = {
  gold: "gold",
  silver: "silver",
  oil: "oil",
  gas: "gas",
  metals: "metals",
  agriculture: "agriculture",
};
