"use client";

import { useState, useMemo } from "react";
import { GAMES } from "@/lib/mockData";
import { predictGame } from "@/lib/predictor";
import GameCard from "@/components/GameCard";

const CONFERENCES = ["all", "SEC", "Big Ten", "ACC", "Big 12", "Independent"];
const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function GamesPage() {
  const [filterConf, setFilterConf] = useState("all");
  const [filterWeek, setFilterWeek] = useState<number | "all">("all");
  const [filterConf2, setFilterConf2] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "confidence">("date");

  const allPredictions = useMemo(
    () => GAMES.map((g) => ({ game: g, prediction: predictGame(g) })),
    []
  );

  const filtered = useMemo(() => {
    let list = [...allPredictions];

    if (filterConf !== "all") {
      list = list.filter(
        ({ game }) =>
          game.homeTeam.conference === filterConf ||
          game.awayTeam.conference === filterConf
      );
    }

    if (filterWeek !== "all") {
      list = list.filter(({ game }) => game.week === filterWeek);
    }

    if (filterConf2) {
      const q = filterConf2.toLowerCase();
      list = list.filter(
        ({ game }) =>
          game.homeTeam.name.toLowerCase().includes(q) ||
          game.awayTeam.name.toLowerCase().includes(q)
      );
    }

    if (sortBy === "confidence") {
      const order = { elite: 4, high: 3, medium: 2, low: 1 };
      list.sort(
        (a, b) =>
          (order[b.prediction.confidence] ?? 0) - (order[a.prediction.confidence] ?? 0)
      );
    } else {
      list.sort((a, b) => a.game.date.localeCompare(b.game.date));
    }

    return list;
  }, [allPredictions, filterConf, filterWeek, filterConf2, sortBy]);

  const eliteCount = allPredictions.filter((p) => p.prediction.confidence === "elite").length;
  const highCount = allPredictions.filter((p) => p.prediction.confidence === "high").length;
  const atsPickCount = allPredictions.filter(
    (p) => p.prediction.spreadPick.side !== "no-bet"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-wider text-white mb-2">
          2026 GAME PREDICTIONS
        </h1>
        <p className="text-muted text-sm">
          AI-powered picks for every D1 matchup — winner, spread, and over/under.
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          {[
            { label: "Total Games", value: allPredictions.length },
            { label: "Elite Picks", value: eliteCount, color: "text-primary" },
            { label: "High Confidence", value: highCount, color: "text-green-400" },
            { label: "ATS Picks", value: atsPickCount, color: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="card px-4 py-3 flex items-center gap-3">
              <span className={`text-xl font-bold ${s.color ?? "text-white"}`}>{s.value}</span>
              <span className="text-xs text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search team..."
          value={filterConf2}
          onChange={(e) => setFilterConf2(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-primary/60 w-40"
        />

        {/* Conference filter */}
        <div className="flex flex-wrap gap-1">
          {CONFERENCES.map((c) => (
            <button
              key={c}
              onClick={() => setFilterConf(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterConf === c
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-muted hover:border-primary/50 hover:text-white"
              }`}
            >
              {c === "all" ? "All Conf." : c}
            </button>
          ))}
        </div>

        {/* Week filter */}
        <select
          value={filterWeek}
          onChange={(e) =>
            setFilterWeek(e.target.value === "all" ? "all" : parseInt(e.target.value))
          }
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/60"
        >
          <option value="all">All Weeks</option>
          {WEEKS.map((w) => (
            <option key={w} value={w}>
              Week {w}
            </option>
          ))}
        </select>

        {/* Sort */}
        <div className="ml-auto flex gap-1">
          {(["date", "confidence"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                sortBy === s
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-surface border border-border text-muted hover:text-white"
              }`}
            >
              By {s}
            </button>
          ))}
        </div>
      </div>

      {/* Game grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <div className="text-4xl mb-3">🏈</div>
          <div className="text-lg font-semibold text-white mb-1">No games found</div>
          <div className="text-sm">Try adjusting your filters</div>
        </div>
      ) : (
        <>
          <div className="text-xs text-muted mb-3">
            Showing {filtered.length} game{filtered.length !== 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(({ game, prediction }) => (
              <GameCard key={game.id} game={game} prediction={prediction} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
