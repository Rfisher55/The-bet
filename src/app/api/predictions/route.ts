import { NextResponse } from "next/server";
import { GAMES } from "@/lib/mockData";
import { predictGame } from "@/lib/predictor";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");

  if (gameId) {
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    const prediction = predictGame(game);
    return NextResponse.json(prediction);
  }

  // Return predictions for all games
  const predictions = GAMES.map((game) => ({
    gameId: game.id,
    prediction: predictGame(game),
  }));

  return NextResponse.json({ predictions });
}
