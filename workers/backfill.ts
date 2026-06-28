import * as fs from "fs";
import * as path from "path";
import { getDb, closeDb } from "../src/lib/db/index";

const SEC_EDGAR_BASE = "https://www.sec.gov/cgi-bin/browse-edgar";
const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

interface StoredArticle {
  id: number; title: string; url: string; source: string;
  author: string; excerpt: string; content: string;
  category: string; tags: string[]; publicationDate: string;
  imageUrl: string | null; importanceScore: number;
  companies: string[]; technologies: string[]; processed: boolean;
}

function loadArticles(): StoredArticle[] {
  if (fs.existsSync(ARTICLES_FILE)) {
    return JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
  }
  return [];
}

function saveArticles(articles: StoredArticle[]) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

async function fetchEdgarRecent(cik: string, formType: string, count: number): Promise<Array<{ title: string; url: string; date: string }>> {
  // SEC EDGAR browse-edgar action returns JSON when output=atom
  const url = `${SEC_EDGAR_BASE}?action=getcompany&CIK=${cik}&type=${formType}&dateb=&owner=include&count=${count}&output=atom`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "FinWire research@example.com" } });
    const xml = await res.text();

    const entries: Array<{ title: string; url: string; date: string }> = [];
    const entryMatches = xml.split("<entry>").slice(1);
    for (const entry of entryMatches) {
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const linkMatch = entry.match(/<link[^>]*href="([^"]+)"/);
      const updatedMatch = entry.match(/<updated>(.*?)<\/updated>/);
      if (titleMatch && linkMatch) {
        entries.push({
          title: titleMatch[1].replace(/<[^>]+>/g, "").trim(),
          url: linkMatch[1],
          date: updatedMatch ? updatedMatch[1] : new Date().toISOString(),
        });
      }
    }
    return entries;
  } catch (err) {
    console.error(`  EDGAR fetch failed for CIK ${cik}:`, err);
    return [];
  }
}

async function backfillEdgar() {
  const existing = loadArticles();
  const existingUrls = new Set(existing.map((a) => a.url));
  let nextId = existing.length > 0 ? Math.max(...existing.map((a) => a.id)) + 1 : 1;
  let newCount = 0;

  const targets = [
    { cik: "0000320193", formType: "10-K", source: "SEC EDGAR (Apple)", category: "regulation" },
    { cik: "0000789019", formType: "10-K", source: "SEC EDGAR (Microsoft)", category: "regulation" },
    { cik: "0001018724", formType: "10-K", source: "SEC EDGAR (Amazon)", category: "regulation" },
    { cik: "0001045810", formType: "10-K", source: "SEC EDGAR (NVIDIA)", category: "regulation" },
  ];

  for (const t of targets) {
    console.log(`  Fetching ${t.source} recent ${t.formType} filings...`);
    const filings = await fetchEdgarRecent(t.cik, t.formType, 10);

    for (const f of filings) {
      if (existingUrls.has(f.url)) continue;

      const article: StoredArticle = {
        id: nextId++,
        title: f.title,
        url: f.url,
        source: t.source,
        author: "SEC EDGAR",
        excerpt: f.title,
        content: `${t.formType} filing — see filing index at ${f.url}`,
        category: t.category,
        tags: [t.category, "sec-filing"],
        publicationDate: f.date,
        imageUrl: null,
        importanceScore: 70,
        companies: [],
        technologies: [],
        processed: true,
      };

      existing.push(article);
      existingUrls.add(f.url);
      newCount++;
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  saveArticles(existing);
  console.log(`  → Added ${newCount} new SEC filings`);
  return newCount;
}

async function main() {
  console.log("Backfilling historical SEC filings...\n");

  const total = await backfillEdgar();

  // Mirror to SQLite
  const { importFromJson } = await import("../src/lib/db/index");
  importFromJson();
  closeDb();

  console.log(`\nDone! Added ${total} backdated filings.`);
}

main().catch(console.error);
