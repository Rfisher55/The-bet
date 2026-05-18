import { NextResponse } from "next/server";
import { GAMES } from "@/lib/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");
  const conference = searchParams.get("conference");
  const team = searchParams.get("team");
  const status = searchParams.get("status");

  let games = [...GAMES];

  if (week) games = games.filter((g) => g.week === parseInt(week));
  if (conference && conference !== "all")
    games = games.filter(
      (g) =>
        g.homeTeam.conference === conference ||
        g.awayTeam.conference === conference
    );
  if (team)
    games = games.filter(
      (g) =>
        g.homeTeam.name.toLowerCase().includes(team.toLowerCase()) ||
        g.awayTeam.name.toLowerCase().includes(team.toLowerCase())
    );
  if (status) games = games.filter((g) => g.status === status);

  return NextResponse.json({ games, total: games.length });
}
