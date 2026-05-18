import { notFound } from "next/navigation";
import Link from "next/link";
import { GAMES } from "@/lib/mockData";
import { predictGame } from "@/lib/predictor";
import TeamBadge from "@/components/TeamBadge";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import StatsComparison from "@/components/StatsComparison";
import SocialBuzz from "@/components/SocialBuzz";
import {
  formatSpread,
  formatTotal,
  formatMoneyline,
  formatGameTime,
  confidenceBg,
  confidenceLabel,
} from "@/lib/utils";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

const factorIcon = (impact: string) =>
  impact === "positive" ? "↑" : impact === "negative" ? "↓" : "→";

const factorColor = (impact: string, favored: string, perspective: "home" | "away") => {
  if (favored === "neither") return "text-muted";
  const goodForThisSide =
    (perspective === "home" && favored === "home") ||
    (perspective === "away" && favored === "away");
  return goodForThisSide ? "text-primary" : "text-danger";
};

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const game = GAMES.find((g) => g.id === params.id);
  if (!game) notFound();

  const prediction = predictGame(game);
  const { homeTeam, awayTeam } = game;
  const isHomeFavored = prediction.predictedSpread >= 0;
  const winner = isHomeFavored ? homeTeam : awayTeam;

  const breakdown = prediction.modelBreakdown;
  const breakdownItems = [
    { label: "Offense vs Defense Matchup", value: breakdown.offenseVsDefense, color: "bg-accent" },
    { label: "Recent Form", value: breakdown.recentForm, color: "bg-primary" },
    { label: "Home Field Advantage", value: breakdown.homeFieldAdvantage, color: "bg-green-400" },
    { label: "Head-to-Head History", value: breakdown.headToHead, color: "bg-gold" },
    { label: "Coaching Edge", value: breakdown.coachingEdge, color: "bg-purple-400" },
    { label: "Recruiting / Talent", value: breakdown.recruitingEdge, color: "bg-sky-400" },
    { label: "Social Signal", value: breakdown.socialSignal, color: "bg-pink-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/games"
        className="inline-flex items-center gap-2 text-muted hover:text-white text-sm mb-6 transition-colors"
      >
        ← Back to Games
      </Link>

      {/* Game header */}
      <div className="card p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `linear-gradient(135deg, ${homeTeam.color} 0%, transparent 40%, ${awayTeam.color} 100%)`,
          }}
        />
        <div className="relative">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs text-muted">{formatGameTime(game.date, game.time)}</span>
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted">{game.venue}</span>
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted">{game.network}</span>
            {game.isConferenceGame && (
              <span className="badge bg-accent/20 border-accent/40 text-accent">CONFERENCE GAME</span>
            )}
            <span className={`badge ${confidenceBg(prediction.confidence)} ml-auto`}>
              {confidenceLabel(prediction.confidence)}
            </span>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-3 items-center gap-4">
            <TeamBadge team={awayTeam} size="lg" showRecord />

            <div className="text-center">
              <div className="text-4xl font-display tracking-widest text-muted">VS</div>
              <div className="text-sm text-muted mt-1">Week {game.week}</div>
            </div>

            <TeamBadge team={homeTeam} size="lg" showRecord align="right" />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Predictions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prediction summary */}
          <div className="card p-6">
            <div className="section-title">Our Prediction</div>

            {/* Winner */}
            <div
              className="rounded-xl p-5 mb-4 border-2"
              style={{
                borderColor: winner.color + "60",
                background: winner.color + "15",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted mb-1 uppercase tracking-wider">Predicted Winner</div>
                  <div className="text-2xl font-bold text-white">{winner.name}</div>
                  <div className="text-sm text-muted">
                    {winner.mascot} · {winner.wins}-{winner.losses}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted mb-1 uppercase tracking-wider">Win Probability</div>
                  <div className="text-4xl font-bold" style={{ color: winner.color }}>
                    {prediction.winProbability}%
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <ConfidenceMeter value={prediction.winProbability} height="h-3" />
              </div>
            </div>

            {/* Win prob breakdown */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>{awayTeam.name} ({isHomeFavored ? 100 - prediction.winProbability : prediction.winProbability}%)</span>
                <span>{homeTeam.name} ({isHomeFavored ? prediction.winProbability : 100 - prediction.winProbability}%)</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden flex">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${isHomeFavored ? 100 - prediction.winProbability : prediction.winProbability}%`,
                    backgroundColor: awayTeam.color,
                  }}
                />
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${isHomeFavored ? prediction.winProbability : 100 - prediction.winProbability}%`,
                    backgroundColor: homeTeam.color,
                  }}
                />
              </div>
            </div>

            {/* Picks grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Spread pick */}
              <div
                className={`rounded-xl p-4 text-center border-2 ${
                  prediction.spreadPick.side === "home"
                    ? "border-accent/60 bg-accent/10"
                    : prediction.spreadPick.side === "away"
                    ? "border-gold/60 bg-gold/10"
                    : "border-border bg-surface"
                }`}
              >
                <div className="text-xs text-muted mb-2 uppercase tracking-wider">ATS Pick</div>
                {prediction.spreadPick.side === "no-bet" ? (
                  <div>
                    <div className="text-lg font-bold text-muted">No Bet</div>
                    <div className="text-xs text-muted mt-1">No significant edge</div>
                  </div>
                ) : (
                  <div>
                    <div
                      className={`text-lg font-bold ${
                        prediction.spreadPick.side === "home" ? "text-accent" : "text-gold"
                      }`}
                    >
                      {prediction.spreadPick.team}
                    </div>
                    {game.bettingLines && (
                      <div className="text-sm text-muted mt-1">
                        {formatSpread(
                          prediction.spreadPick.side === "home"
                            ? game.bettingLines.spread
                            : -game.bettingLines.spread
                        )}
                      </div>
                    )}
                    <div className="text-xs text-muted mt-1">
                      Edge: +{prediction.spreadPick.edge.toFixed(1)} pts
                    </div>
                  </div>
                )}
              </div>

              {/* Total pick */}
              <div
                className={`rounded-xl p-4 text-center border-2 ${
                  prediction.totalPick.side === "over"
                    ? "border-primary/60 bg-primary/10"
                    : prediction.totalPick.side === "under"
                    ? "border-danger/60 bg-danger/10"
                    : "border-border bg-surface"
                }`}
              >
                <div className="text-xs text-muted mb-2 uppercase tracking-wider">Total Pick</div>
                {prediction.totalPick.side === "no-bet" ? (
                  <div>
                    <div className="text-lg font-bold text-muted">No Bet</div>
                    <div className="text-xs text-muted mt-1">No significant edge</div>
                  </div>
                ) : (
                  <div>
                    <div
                      className={`text-2xl font-bold ${
                        prediction.totalPick.side === "over" ? "text-primary" : "text-danger"
                      }`}
                    >
                      {prediction.totalPick.side.toUpperCase()}
                    </div>
                    {game.bettingLines && (
                      <div className="text-sm text-muted mt-1">{game.bettingLines.total}</div>
                    )}
                    <div className="text-xs text-muted mt-1">
                      Model: {formatTotal(prediction.predictedTotal)} pts
                    </div>
                  </div>
                )}
              </div>

              {/* Predicted score */}
              <div className="rounded-xl p-4 text-center border-2 border-border bg-surface">
                <div className="text-xs text-muted mb-2 uppercase tracking-wider">Predicted Score</div>
                <div className="text-lg font-bold text-white">
                  {isHomeFavored
                    ? `${Math.round(prediction.predictedTotal / 2 + prediction.predictedSpread / 2)}-${Math.round(prediction.predictedTotal / 2 - prediction.predictedSpread / 2)}`
                    : `${Math.round(prediction.predictedTotal / 2 - Math.abs(prediction.predictedSpread) / 2)}-${Math.round(prediction.predictedTotal / 2 + Math.abs(prediction.predictedSpread) / 2)}`}
                </div>
                <div className="text-xs text-muted mt-1">
                  {homeTeam.abbreviation} vs {awayTeam.abbreviation}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Total: {formatTotal(prediction.predictedTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Vegas lines comparison */}
          {game.bettingLines && (
            <div className="card p-6">
              <div className="section-title">Vegas Lines vs Model</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-surface border border-border">
                  <div className="text-xs text-muted mb-1">Vegas Spread</div>
                  <div className="text-xl font-bold text-white">
                    {formatSpread(game.bettingLines.spread)}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {game.bettingLines.spread < 0 ? homeTeam.abbreviation : awayTeam.abbreviation} favored
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-surface border border-border">
                  <div className="text-xs text-muted mb-1">Model Spread</div>
                  <div className="text-xl font-bold text-accent">
                    {formatSpread(-prediction.predictedSpread)}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {prediction.predictedSpread >= 0 ? homeTeam.abbreviation : awayTeam.abbreviation} favored
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-surface border border-border">
                  <div className="text-xs text-muted mb-1">Vegas Total</div>
                  <div className="text-xl font-bold text-white">
                    {formatTotal(game.bettingLines.total)}
                  </div>
                  <div className="text-xs text-muted mt-1">{game.bettingLines.provider}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-surface border border-border">
                  <div className="text-xs text-muted mb-1">Model Total</div>
                  <div className="text-xl font-bold text-accent">
                    {formatTotal(prediction.predictedTotal)}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {prediction.predictedTotal > game.bettingLines.total
                      ? `+${(prediction.predictedTotal - game.bettingLines.total).toFixed(1)} over`
                      : `${(prediction.predictedTotal - game.bettingLines.total).toFixed(1)} under`}
                  </div>
                </div>
              </div>

              {/* Moneylines */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted mb-0.5">{homeTeam.name} ML</div>
                    <div className="text-lg font-bold text-white">
                      {formatMoneyline(game.bettingLines.homeMoneyline)}
                    </div>
                  </div>
                  {prediction.moneylineValue === "home" && (
                    <span className="badge badge-elite">VALUE</span>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted mb-0.5">{awayTeam.name} ML</div>
                    <div className="text-lg font-bold text-white">
                      {formatMoneyline(game.bettingLines.awayMoneyline)}
                    </div>
                  </div>
                  {prediction.moneylineValue === "away" && (
                    <span className="badge badge-elite">VALUE</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Key factors */}
          <div className="card p-6">
            <div className="section-title">Prediction Factors</div>
            <div className="space-y-3">
              {prediction.factors.map((factor, i) => (
                <div key={i} className="p-3 rounded-lg bg-surface border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          factor.impact === "positive"
                            ? "text-primary"
                            : factor.impact === "negative"
                            ? "text-danger"
                            : "text-muted"
                        }`}
                      >
                        {factorIcon(factor.impact)}
                      </span>
                      <span className="text-sm font-semibold text-white">{factor.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {factor.favoredTeam !== "neither" && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{
                            color: factor.favoredTeam === "home" ? homeTeam.color : awayTeam.color,
                            borderColor:
                              (factor.favoredTeam === "home" ? homeTeam.color : awayTeam.color) + "50",
                            backgroundColor:
                              (factor.favoredTeam === "home" ? homeTeam.color : awayTeam.color) + "15",
                          }}
                        >
                          {factor.favoredTeam === "home" ? homeTeam.abbreviation : awayTeam.abbreviation}
                        </span>
                      )}
                      <span className="text-xs text-muted">Mag: {factor.magnitude}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted">{factor.description}</p>
                  <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${factor.magnitude * 10}%`,
                        backgroundColor:
                          factor.impact === "positive"
                            ? "#10b981"
                            : factor.impact === "negative"
                            ? "#ef4444"
                            : "#6b7280",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats comparison */}
          <div className="card p-6">
            <div className="section-title">Head-to-Head Stats</div>
            <div className="flex justify-between text-xs text-muted mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: homeTeam.color }}
                />
                <span>{homeTeam.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{awayTeam.name}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: awayTeam.color }}
                />
              </div>
            </div>
            <StatsComparison home={homeTeam} away={awayTeam} />
          </div>

          {/* Key players */}
          {prediction.keyPlayers.length > 0 && (
            <div className="card p-6">
              <div className="section-title">Key Players to Watch</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prediction.keyPlayers.map((player) => {
                  const teamColor =
                    player.teamId === homeTeam.id ? homeTeam.color : awayTeam.color;
                  const teamName =
                    player.teamId === homeTeam.id ? homeTeam.name : awayTeam.name;
                  return (
                    <div key={player.id} className="p-3 rounded-lg bg-surface border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: teamColor }}
                        >
                          #{player.number}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{player.name}</div>
                          <div className="text-xs text-muted">
                            {player.position} · {player.year} · {teamName}
                          </div>
                        </div>
                        <div className="ml-auto">
                          {player.injuryStatus !== "healthy" ? (
                            <span className="badge bg-danger/20 border-danger/40 text-danger">
                              {player.injuryStatus.toUpperCase()}
                            </span>
                          ) : (
                            <span className="badge badge-elite">ACTIVE</span>
                          )}
                        </div>
                      </div>
                      {/* Quick stat preview */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {player.stats.passingYards !== undefined && (
                          <>
                            <div>
                              <span className="text-muted">Pass Yds: </span>
                              <span className="text-white font-semibold">{player.stats.passingYards}</span>
                            </div>
                            <div>
                              <span className="text-muted">TDs: </span>
                              <span className="text-white font-semibold">{player.stats.passingTDs}</span>
                            </div>
                            <div>
                              <span className="text-muted">INT: </span>
                              <span className="text-white font-semibold">{player.stats.interceptions}</span>
                            </div>
                            <div>
                              <span className="text-muted">Comp%: </span>
                              <span className="text-white font-semibold">{player.stats.completionPct}%</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column — Model breakdown + Social */}
        <div className="space-y-6">
          {/* Model breakdown */}
          <div className="card p-6">
            <div className="section-title">Model Breakdown</div>
            <div className="space-y-4">
              {breakdownItems.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">{item.label}</span>
                    <span className="text-white font-semibold">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team quick profiles */}
          <div className="card p-6">
            <div className="section-title">Coaching</div>
            <div className="space-y-4">
              {[
                { team: homeTeam, side: "Home" as const },
                { team: awayTeam, side: "Away" as const },
              ].map(({ team, side }) => (
                <div key={team.id} className="p-3 rounded-lg bg-surface border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded text-xs font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.abbreviation.slice(0, 2)}
                    </div>
                    <span className="text-sm font-bold text-white">{side}: {team.name}</span>
                  </div>
                  <div className="text-xs text-muted space-y-1">
                    <div>Coach: <span className="text-white">{team.coachName}</span></div>
                    <div>Record: <span className="text-white">{team.coachRecord}</span></div>
                    <div>Recruiting: <span className="text-primary">#{team.recruitingRank} nationally</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social buzz section */}
          <div className="card p-6">
            <div className="section-title">Social & Insider Intelligence</div>
            <SocialBuzz
              buzz={prediction.socialBuzz}
              homeTeamName={homeTeam.name}
              awayTeamName={awayTeam.name}
            />
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-surface border border-border text-xs text-muted text-center">
        Predictions generated by The Bet AI Model · For entertainment purposes only · Always gamble responsibly
      </div>
    </div>
  );
}
