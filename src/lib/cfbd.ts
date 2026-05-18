/**
 * Client for the College Football Data API (collegefootballdata.com).
 * Falls back to mock data when CFBD_API_KEY is not set.
 */

const BASE_URL = "https://api.collegefootballdata.com";

async function cfbdFetch<T>(path: string): Promise<T | null> {
  const key = process.env.CFBD_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export interface CFBDGame {
  id: number;
  season: number;
  week: number;
  season_type: string;
  start_date: string;
  neutral_site: boolean;
  conference_game: boolean;
  home_team: string;
  home_conference: string;
  home_points: number | null;
  away_team: string;
  away_conference: string;
  away_points: number | null;
  venue: string;
  excitement_index: number;
}

export interface CFBDTeam {
  id: number;
  school: string;
  mascot: string;
  abbreviation: string;
  alt_name_1: string;
  conference: string;
  division: string;
  color: string;
  alt_color: string;
  logos: string[];
}

export interface CFBDTeamStats {
  season: number;
  team: string;
  conference: string;
  statName: string;
  statValue: number;
}

export interface CFBDBettingLine {
  id: number;
  season: number;
  week: number;
  home_team: string;
  away_team: string;
  lines: {
    provider: string;
    spread: string;
    formattedSpread: string;
    spreadOpen: string;
    overUnder: string;
    overUnderOpen: string;
    homeMoneyline: number;
    awayMoneyline: number;
  }[];
}

export interface CFBDRating {
  year: number;
  team: string;
  conference: string;
  rating: number;
  ranking: number;
  offense: { rating: number; ranking: number };
  defense: { rating: number; ranking: number };
}

export async function fetchGames(
  season: number,
  week?: number
): Promise<CFBDGame[] | null> {
  const q = new URLSearchParams({ season: String(season), division: "fbs" });
  if (week) q.set("week", String(week));
  return cfbdFetch<CFBDGame[]>(`/games?${q}`);
}

export async function fetchTeams(): Promise<CFBDTeam[] | null> {
  return cfbdFetch<CFBDTeam[]>("/teams/fbs");
}

export async function fetchBettingLines(
  season: number,
  week: number
): Promise<CFBDBettingLine[] | null> {
  const q = new URLSearchParams({ season: String(season), week: String(week) });
  return cfbdFetch<CFBDBettingLine[]>(`/lines?${q}`);
}

export async function fetchSPRatings(
  season: number
): Promise<CFBDRating[] | null> {
  return cfbdFetch<CFBDRating[]>(`/ratings/sp?year=${season}`);
}

export async function fetchTeamStats(
  season: number,
  team?: string
): Promise<CFBDTeamStats[] | null> {
  const q = new URLSearchParams({ season: String(season) });
  if (team) q.set("team", team);
  return cfbdFetch<CFBDTeamStats[]>(`/stats/season?${q}`);
}
