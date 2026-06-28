import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface ArticleEnrichment {
  tldr: string;
  bulletSummary: string[];
  executiveSummary: string;
  whyItMatters: string;
  supplyImpact: string;
  demandImpact: string;
  category: string;
  tags: string[];
  commodities: string[];
  producers: string[];
  instruments: string[];
  importanceScore: number;
}

const SYSTEM_PROMPT = `You are a commodity markets news analyst. Analyze the given article and return a JSON object with:
- tldr: One sentence summary
- bulletSummary: Array of 3 key bullet points
- executiveSummary: 2-3 sentence executive overview
- whyItMatters: Why this matters in the broader commodity-market context
- supplyImpact: Supply-side implications (producers, mines, OPEC, harvests, etc.)
- demandImpact: Demand-side implications (industrial users, consumer demand, etc.)
- category: One of: gold, silver, oil, gas, metals, agriculture
- tags: Array of relevant tags (max 8)
- commodities: Array of specific commodities mentioned (e.g. "gold", "WTI crude", "copper", "wheat")
- producers: Array of producers / mining companies / exporters mentioned
- instruments: Array of financial instruments mentioned (futures contracts, ETFs, indices)
- importanceScore: 1-100 score based on source authority, market significance, and price-impact potential`;

export async function enrichArticle(
  title: string,
  content: string,
  source: string
): Promise<ArticleEnrichment | null> {
  if (!openai) {
    return getDefaultEnrichment(title, source);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Title: ${title}\nSource: ${source}\n\nContent: ${content.slice(0, 4000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) return getDefaultEnrichment(title, source);

    return JSON.parse(text);
  } catch (error) {
    console.error("AI enrichment failed:", error);
    return getDefaultEnrichment(title, source);
  }
}

function getDefaultEnrichment(title: string, source: string): ArticleEnrichment {
  return {
    tldr: title,
    bulletSummary: [title],
    executiveSummary: title,
    whyItMatters: `Reported by ${source}`,
    supplyImpact: "Analysis pending",
    demandImpact: "Analysis pending",
    category: "metals",
    tags: [source],
    commodities: [],
    producers: [],
    instruments: [],
    importanceScore: 50,
  };
}
