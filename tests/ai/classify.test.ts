import { describe, it, expect } from "vitest";
import { classifyArticle, getPrimaryCategory } from "../../src/lib/ai/classify";

describe("classifyArticle — commodity categories", () => {
  it("tags a gold article as gold", () => {
    const tags = classifyArticle(
      "Gold price rallies as central bank reserves hit record",
      "Spot gold climbed to a new high as central banks added bullion to reserves. The GLD ETF saw strong inflows."
    );
    expect(tags).toContain("gold");
  });

  it("tags a silver article as silver", () => {
    const tags = classifyArticle(
      "Silver demand from solar panel makers drives industrial shortage",
      "Photovoltaic silver consumption pushed the silver market into a deficit. SLV holdings grew."
    );
    expect(tags).toContain("silver");
  });

  it("tags an oil article as oil", () => {
    const tags = classifyArticle(
      "WTI crude falls as OPEC+ signals production increase",
      "Brent and WTI both dropped after OPEC+ hinted at higher output. Refiners watched spreads."
    );
    expect(tags).toContain("oil");
  });

  it("tags a gas article as gas", () => {
    const tags = classifyArticle(
      "Henry Hub natural gas prices surge on cold weather forecast",
      "TTF and LNG markets rallied as winter demand spiked. Pipeline gas flows tightened."
    );
    expect(tags).toContain("gas");
  });

  it("tags a metals article as metals", () => {
    const tags = classifyArticle(
      "Copper price hits record as BHP and Rio Tinto flag supply shortfall",
      "Lithium and nickel also gained. Glencore warned of iron ore tightness."
    );
    expect(tags).toContain("metals");
  });

  it("tags an agriculture article as agriculture", () => {
    const tags = classifyArticle(
      "Wheat futures drop on favorable USDA crop report",
      "Corn and soybean futures also fell. Coffee and sugar rallied on weather concerns."
    );
    expect(tags).toContain("agriculture");
  });

  it("does NOT match finance keywords (regression guard)", () => {
    const tags = classifyArticle(
      "JPMorgan reports record quarterly profit on strong lending",
      "The bank's net interest margin expanded as deposits grew."
    );
    expect(tags).not.toContain("banking");
    expect(tags).not.toContain("forex");
    expect(tags).not.toContain("crypto");
  });
});

describe("getPrimaryCategory — commodity source hints", () => {
  it("falls back to source hint when article text has no keywords", () => {
    const cat = getPrimaryCategory(
      "Untitled market update",
      "no recognizable keywords here",
      "Kitco News"
    );
    // Kitco primarily covers gold; should default to gold
    expect(["gold", "silver"]).toContain(cat);
  });

  it("returns gold for a gold article with gold source", () => {
    const cat = getPrimaryCategory(
      "Gold ETF inflows surge",
      "spot gold climbed on central bank demand",
      "World Gold Council"
    );
    expect(cat).toBe("gold");
  });

  it("prefers precious metals over base metals when both match", () => {
    const cat = getPrimaryCategory(
      "Silver rally pulls gold higher as copper rises on supply concerns",
      "the spot gold price rose as silver and copper also gained",
      "Reuters Metals"
    );
    // Both gold and silver keywords match. Priority chain picks gold first.
    expect(cat).toBe("gold");
  });
});
