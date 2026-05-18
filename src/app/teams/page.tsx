"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TEAMS } from "@/lib/mockData";
import { formatRecord } from "@/lib/utils";

const CONFERENCES = ["all", "SEC", "Big Ten", "ACC", "Big 12", "Independent"];

export default function TeamsPage() {
  const [filterConf, setFilterConf] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "offense" | "defense" | "record">("rating");

  const teams = useMemo(() => {
    let list = Object.values(TEAMS);

    if (filterConf !== "all") {
      list = list.filter((t) => t.conference === filterConf);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.mascot.toLowerCase().includes(q) ||
          t.abbreviation.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "offense":
        list.sort((a, b) => b.offensiveRating - a.offensiveRating);
        break;
      case "defense":
        list.sort((a, b) => b.defensiveRating - a.defensiveRating);
        break;
      case "record":
        list.sort((a, b) => b.wins / (b.wins + b.losses) - a.wins / (a.wins + a.losses));
        break;
      default:
        list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [filterConf, search, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-wider text-white mb-2">TEAM POWER RANKINGS</h1>
        <p className="text-muted text-sm">
          Composite ratings based on offense, defense, recruiting, coaching, and efficiency metrics.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search team..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-primary/60 w-40"
        />

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
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-1">
          {(["rating", "offense", "defense", "record"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                sortBy === s
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-surface border border-border text-muted hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Team</div>
        <div className="col-span-1 text-center">W-L</div>
        <div className="col-span-2 text-center">Overall</div>
        <div className="col-span-2 text-center">Offense</div>
        <div className="col-span-2 text-center">Defense</div>
        <div className="col-span-1 text-center">SP+</div>
      </div>

      {/* Team rows */}
      <div className="space-y-2">
        {teams.map((team, i) => (
          <Link
            key={team.id}
            href={`/games?team=${encodeURIComponent(team.name)}`}
            className="block group"
          >
            <div className="card p-4 hover:border-primary/40 transition-all duration-150 hover:-translate-y-0.5">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Rank */}
                <div className="col-span-1">
                  <span
                    className={`text-lg font-bold ${
                      i === 0
                        ? "text-gold"
                        : i === 1
                        ? "text-slate-300"
                        : i === 2
                        ? "text-amber-600"
                        : "text-muted"
                    }`}
                  >
                    {i + 1}
                  </span>
                </div>

                {/* Team */}
                <div className="col-span-4 sm:col-span-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.abbreviation.slice(0, 3)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{team.name}</div>
                    <div className="text-xs text-muted">{team.conference}</div>
                  </div>
                </div>

                {/* Record */}
                <div className="col-span-2 sm:col-span-1 text-center">
                  <span className="text-sm font-semibold text-white">
                    {formatRecord(team.wins, team.losses)}
                  </span>
                </div>

                {/* Overall rating */}
                <div className="col-span-2 text-center hidden sm:block">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${team.rating}%`,
                          backgroundColor:
                            team.rating >= 95
                              ? "#10b981"
                              : team.rating >= 85
                              ? "#34d399"
                              : team.rating >= 75
                              ? "#f59e0b"
                              : "#6b7280",
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-8 shrink-0">{team.rating}</span>
                  </div>
                </div>

                {/* Offense */}
                <div className="col-span-2 text-center hidden sm:block">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${team.offensiveRating}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-8 shrink-0">
                      {team.offensiveRating}
                    </span>
                  </div>
                </div>

                {/* Defense */}
                <div className="col-span-2 text-center hidden sm:block">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${team.defensiveRating}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-8 shrink-0">
                      {team.defensiveRating}
                    </span>
                  </div>
                </div>

                {/* SP+ */}
                <div className="col-span-1 text-center hidden sm:block">
                  <span
                    className={`text-sm font-bold ${
                      team.spRating >= 25
                        ? "text-primary"
                        : team.spRating >= 15
                        ? "text-green-400"
                        : team.spRating >= 5
                        ? "text-gold"
                        : "text-muted"
                    }`}
                  >
                    +{team.spRating.toFixed(1)}
                  </span>
                </div>

                {/* Arrow */}
                <div className="col-span-1 sm:col-span-1 text-right text-muted group-hover:text-primary transition-colors text-sm">
                  →
                </div>
              </div>

              {/* Mobile stats */}
              <div className="sm:hidden mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-muted">Overall</div>
                  <div className="font-bold text-white">{team.rating}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted">Off</div>
                  <div className="font-bold text-accent">{team.offensiveRating}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted">Def</div>
                  <div className="font-bold text-gold">{team.defensiveRating}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-16 text-muted">
          <div className="text-4xl mb-3">🏈</div>
          <div className="text-lg font-semibold text-white mb-1">No teams found</div>
          <div className="text-sm">Try a different search or conference filter</div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 card p-4">
        <div className="section-title">Rating System</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-muted">
          <div>
            <span className="font-semibold text-white">Overall Rating</span> — Composite score
            combining all factors (0–100)
          </div>
          <div>
            <span className="font-semibold text-accent">Offense Rating</span> — Scoring, yards,
            efficiency, pace (0–100)
          </div>
          <div>
            <span className="font-semibold text-gold">Defense Rating</span> — Points allowed,
            turnovers, sacks, rush D (0–100)
          </div>
          <div>
            <span className="font-semibold text-primary">SP+</span> — ESPN&apos;s college football
            predictive metric
          </div>
        </div>
      </div>
    </div>
  );
}
