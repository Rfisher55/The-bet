import Link from "next/link";
import { GAMES, MODEL_RECORD } from "@/lib/mockData";
import { predictGame } from "@/lib/predictor";
import GameCard from "@/components/GameCard";
import { formatPct } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const allPredictions = GAMES.map((g) => ({ game: g, prediction: predictGame(g) }));
  const featuredGames = allPredictions.filter((p) => p.prediction.confidence === "elite" || p.prediction.confidence === "high").slice(0, 3);
  const topPicks = allPredictions.filter(
    (p) => p.prediction.spreadPick.side !== "no-bet" && p.prediction.spreadPick.confidence >= 65
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden mb-12 border border-border bg-gradient-hero">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #10b981 0%, transparent 60%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 50%)" }}
        />
        <div className="relative px-8 py-14 sm:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                2026 Season · AI-Powered Predictions
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-display tracking-wider text-white mb-4">
              WIN THE BET.<br />
              <span className="gradient-text">KNOW THE GAME.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              The most advanced D1 college football predictor. Winner, spread, and over/under —
              powered by team stats, player data, coaching tendencies, and social media intelligence.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/games"
                className="px-6 py-3 rounded-xl bg-gradient-green text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                View All Picks →
              </Link>
              <Link
                href="/teams"
                className="px-6 py-3 rounded-xl border border-border text-white font-semibold text-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                Team Rankings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Model Performance Stats */}
      <section className="mb-12">
        <div className="section-title">2025 Season Model Performance</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Straight Up",
              value: `${MODEL_RECORD.straightUp.wins}-${MODEL_RECORD.straightUp.losses}`,
              sub: formatPct(MODEL_RECORD.straightUp.pct),
              color: "text-primary",
            },
            {
              label: "Against the Spread",
              value: `${MODEL_RECORD.atsRecord.wins}-${MODEL_RECORD.atsRecord.losses}`,
              sub: formatPct(MODEL_RECORD.atsRecord.pct),
              color: "text-accent",
            },
            {
              label: "Over / Under",
              value: `${MODEL_RECORD.totalRecord.wins}-${MODEL_RECORD.totalRecord.losses}`,
              sub: formatPct(MODEL_RECORD.totalRecord.pct),
              color: "text-gold",
            },
            {
              label: "Estimated ROI",
              value: `+${MODEL_RECORD.roi}%`,
              sub: "flat betting",
              color: "text-primary",
            },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="text-xs text-muted mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Picks This Week */}
      {topPicks.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title mb-0">Top Picks — Week 1</div>
            <Link href="/games" className="text-xs text-primary hover:underline">
              All games →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topPicks.map(({ game, prediction }, i) => (
              <div key={game.id} className={`slide-up delay-${i + 1}00`}>
                <div className="card p-4 h-full">
                  {/* Pick badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">
                      {i === 0 ? "🏆" : i === 1 ? "🎯" : "⚡"}
                    </span>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      #{i + 1} Pick of the Week
                    </span>
                  </div>
                  {/* Game */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg text-xs font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: game.awayTeam.color }}
                    >
                      {game.awayTeam.abbreviation.slice(0, 3)}
                    </div>
                    <span className="text-xs text-muted">@</span>
                    <div
                      className="w-8 h-8 rounded-lg text-xs font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: game.homeTeam.color }}
                    >
                      {game.homeTeam.abbreviation.slice(0, 3)}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-bold text-white">
                        {game.awayTeam.abbreviation} @ {game.homeTeam.abbreviation}
                      </div>
                      <div className="text-xs text-muted">{game.date}</div>
                    </div>
                  </div>
                  {/* The pick */}
                  <div
                    className={`rounded-lg p-3 mb-3 ${
                      prediction.spreadPick.side === "home"
                        ? "bg-accent/10 border border-accent/30"
                        : "bg-gold/10 border border-gold/30"
                    }`}
                  >
                    <div className="text-xs text-muted mb-1">ATS Pick</div>
                    <div
                      className={`text-base font-bold ${
                        prediction.spreadPick.side === "home" ? "text-accent" : "text-gold"
                      }`}
                    >
                      {prediction.spreadPick.team}
                    </div>
                    {game.bettingLines && (
                      <div className="text-xs text-muted mt-0.5">
                        Line:{" "}
                        {prediction.spreadPick.side === "home"
                          ? game.bettingLines.spread
                          : -game.bettingLines.spread > 0
                          ? `+${-game.bettingLines.spread}`
                          : `${-game.bettingLines.spread}`}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">
                      Confidence: <span className="text-white font-bold">{prediction.spreadPick.confidence}%</span>
                    </span>
                    <span className="text-muted">
                      Edge: <span className="text-primary font-bold">+{prediction.spreadPick.edge.toFixed(1)} pts</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Games */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title mb-0">Featured Games — 2026 Season</div>
          <Link href="/games" className="text-xs text-primary hover:underline">
            See all {GAMES.length} games →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredGames.map(({ game, prediction }) => (
            <GameCard key={game.id} game={game} prediction={prediction} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <div className="section-title">How The Bet Works</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: "📊",
              title: "Stats Engine",
              desc: "Processes 50+ team and player metrics including PPG, yards per game, turnover margin, 3rd down %, red zone efficiency, and more.",
            },
            {
              icon: "🧠",
              title: "AI Predictor",
              desc: "Combines offensive vs. defensive matchup analysis, home field advantage, recent form weighting, recruiting talent, and coaching tendencies.",
            },
            {
              icon: "📱",
              title: "Social Intelligence",
              desc: "Aggregates insider tips, injury reports, practice reports, and sentiment from beat writers, Reddit, and Twitter/X for edge-finding signals.",
            },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-base font-semibold text-white mb-2">{item.title}</div>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data sources disclaimer */}
      <section>
        <div className="card p-5 flex items-start gap-3 bg-primary/5 border-primary/20">
          <span className="text-primary text-lg shrink-0">ℹ</span>
          <div>
            <div className="text-sm font-semibold text-white mb-1">Data Sources</div>
            <p className="text-xs text-muted leading-relaxed">
              Powered by College Football Data API (CFBD), ESPN feeds, beat writer reports, and social media
              aggregation. Predictions are for entertainment purposes only. Gambling involves risk — only bet
              what you can afford to lose. Add your CFBD API key in{" "}
              <code className="text-primary bg-surface px-1 rounded">.env.local</code> for live data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
