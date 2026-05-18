import { NextResponse } from "next/server";
import { TEAMS } from "@/lib/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conference = searchParams.get("conference");
  const search = searchParams.get("search");

  let teams = Object.values(TEAMS);

  if (conference && conference !== "all")
    teams = teams.filter((t) => t.conference === conference);
  if (search)
    teams = teams.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.mascot.toLowerCase().includes(search.toLowerCase())
    );

  teams = teams.sort((a, b) => b.rating - a.rating);

  return NextResponse.json({ teams, total: teams.length });
}
