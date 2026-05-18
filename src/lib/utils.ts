export function formatSpread(spread: number): string {
  if (Math.abs(spread) < 0.5) return "PK";
  const rounded = Math.round(spread * 2) / 2;
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export function formatTotal(total: number): string {
  return total.toFixed(1);
}

export function formatRecord(wins: number, losses: number): string {
  return `${wins}-${losses}`;
}

export function formatPct(pct: number): string {
  return `${(pct * 100).toFixed(1)}%`;
}

export function formatMoneyline(ml: number): string {
  return ml > 0 ? `+${ml}` : `${ml}`;
}

export function confidenceColor(confidence: string): string {
  switch (confidence) {
    case "elite": return "text-primary";
    case "high": return "text-green-400";
    case "medium": return "text-gold";
    case "low": return "text-muted";
    default: return "text-muted";
  }
}

export function confidenceBg(confidence: string): string {
  switch (confidence) {
    case "elite": return "bg-primary/20 border-primary/50 text-primary";
    case "high": return "bg-green-400/20 border-green-400/50 text-green-400";
    case "medium": return "bg-gold/20 border-gold/50 text-gold";
    case "low": return "bg-muted/20 border-muted/50 text-muted";
    default: return "bg-muted/20 border-muted/50 text-muted";
  }
}

export function confidenceLabel(confidence: string): string {
  switch (confidence) {
    case "elite": return "ELITE PICK";
    case "high": return "HIGH CONF";
    case "medium": return "MODERATE";
    case "low": return "LOW CONF";
    default: return "—";
  }
}

export function winProbBar(prob: number): { color: string; label: string } {
  if (prob >= 80) return { color: "bg-primary", label: "Dominant" };
  if (prob >= 65) return { color: "bg-green-400", label: "Favored" };
  if (prob >= 55) return { color: "bg-gold", label: "Slight Edge" };
  return { color: "bg-muted", label: "Toss-up" };
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatGameTime(dateStr: string, time: string): string {
  return `${formatDate(dateStr)} · ${time} ET`;
}

export function reliabilityStars(r: number): string {
  return "★".repeat(r) + "☆".repeat(5 - r);
}
