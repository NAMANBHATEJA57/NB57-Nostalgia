export function calculateAskingPrice({
  name,
  condition,
  sealed,
  categoryName,
  series
}: {
  name: string;
  condition: string;
  sealed: boolean;
  categoryName: string;
  series: string;
}): number {
  const n = (name || "").toLowerCase();
  const c = (condition || "").toLowerCase();
  const cat = (categoryName || "").toLowerCase();
  const s = (series || "").toLowerCase();

  const isPokemon = cat.includes("pokemon") || s.includes("pokemon");
  const isYugioh = cat.includes("yu-gi-oh") || cat.includes("yugioh") || s.includes("yu-gi-oh") || s.includes("yugioh");
  const isBen10 = cat.includes("ben 10") || s.includes("ben 10");
  const isBeyblade = cat.includes("beyblade") || s.includes("beyblade");

  // 1. GLOBAL OVERRIDES
  if (sealed || c.includes("factory sealed")) {
    return 999;
  }
  if (n.includes("pikachu")) {
    return 499;
  }

  // 2. FRANCHISE-SPECIFIC PRICING
  if (isPokemon) {
    if (c.includes("heavy play") || c.includes("heavily played")) return 119;
    if (c.includes("played")) return 169; // since heavy is caught above
    return 199;
  }

  if (isYugioh) {
    if (c.includes("played")) return 299;
    // Good or better: Good, Excellent, Near Mint, Mint
    if (c.includes("good") || c.includes("excellent") || c.includes("mint") || c.includes("near mint") || c.includes("not played")) return 399;
  }

  if (isBen10) {
    if (n.includes("buildup") && (c.includes("good") || c.includes("unpunched"))) return 499;
    if (n.includes("disc") && (c.includes("mint") || c.includes("near mint") || c.includes("not played"))) return 799; // Mint or Near Mint
  }

  if (isBeyblade) {
    if (c.includes("played")) return 119;
    if (c.includes("good")) return 199;
    if (c.includes("mint") || c.includes("excellent") || c.includes("near mint") || c.includes("not played")) return 249;
  }

  // 3. DEFAULT FALLBACK
  return 199;
}
