import Link from "next/link";
import type { Game } from "@/lib/types";
import type { GamePrediction } from "@/lib/types";
import TeamBadge from "./TeamBadge";
import ConfidenceMeter from "./ConfidenceMeter";
import { formatSpread, formatTotal, formatGameTime, confidenceBg, confidenceLabel } from "@/lib/utils";

interface Props {
  game: Game;
  prediction: GamePrediction;
}

export default function GameCard({ game, prediction }: Props) {
  const { homeTeam, awayTeam } = game;
  const isHomeFavored = prediction.predictedSpread >= 0;
  const winner = isHomeFavored ? homeTeam : awayTeam;
  const loser = isHomeFavored ? awayTeam : homeTeam;

  const spreadSide = prediction.spreadPick.side;
  const totalSide = prediction.totalPick.side;

  return (
    <Link href={`/game/${game.id}`} className="block group">
      <div className="card-glow p-5 hover:border-primary/40 transition-all duration-200 hover:-translate-y-0.5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Wk {game.week}</span>
            <span className="text-xs text-border">·</span>
            <span className="text-xs text-muted">{formatGameTime(game.date, game.time)}</span>
            {game.isConferenceGame && (
              <span className="text-xs bg-accent/20 text-accent border border-accent/30 rounded px-1.5 py-0.5">
                CONF
              </span>
            )}
          </div>
          <span className={`badge ${confidenceBg(prediction.confidence)}`}>
            {confidenceLabel(prediction.confidence)}
          </span>
        </div>

        {/* Teams matchup */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <TeamBadge team={awayTeam} size="md" showRecord />
          <div className="flex flex-col items-center text-center shrink-0">
            <span className="text-xl font-display tracking-widest text-muted">VS</span>
            <span className="text-xs text-muted mt-0.5">{game.network}</span>
          </div>
          <TeamBadge team={homeTeam} size="md" showRecord align="right" />
        </div>

        {/* Prediction row */}
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-surface border border-border">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: winner.color }}
          />
          <span className="text-sm font-semibold text-white">{winner.name} wins</span>
          <span className="text-xs text-muted ml-auto">{prediction.winProbability}% chance</span>
        </div>

        {/* Win probability bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>{awayTeam.abbreviation}</span>
            <span>{homeTeam.abbreviation}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex">
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

        {/* Pick chips */}
        <div className="grid grid-cols-3 gap-2">
          {/* Spread */}
          <div
            className={`rounded-lg p-2 text-center border ${
              spreadSide === "home"
                ? "bg-accent/10 border-accent/40"
                : spreadSide === "away"
                ? "bg-gold/10 border-gold/40"
                : "bg-surface border-border"
            }`}
          >
            <div className="text-xs text-muted mb-0.5">ATS Pick</div>
            {spreadSide === "no-bet" ? (
              <div className="text-xs text-muted font-semibold">No edge</div>
            ) : (
              <>
                <div
                  className={`text-xs font-bold ${spreadSide === "home" ? "text-accent" : "text-gold"}`}
                >
                  {prediction.spreadPick.team.split(" ").pop()}
                </div>
                {game.bettingLines && (
                  <div className="text-xs text-muted">
                    {formatSpread(
                      spreadSide === "home"
                        ? game.bettingLines.spread
                        : -game.bettingLines.spread
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Total */}
          <div
            className={`rounded-lg p-2 text-center border ${
              totalSide === "over"
                ? "bg-primary/10 border-primary/40"
                : totalSide === "under"
                ? "bg-danger/10 border-danger/40"
                : "bg-surface border-border"
            }`}
          >
            <div className="text-xs text-muted mb-0.5">Total</div>
            {totalSide === "no-bet" ? (
              <div className="text-xs text-muted font-semibold">No edge</div>
            ) : (
              <>
                <div
                  className={`text-xs font-bold ${totalSide === "over" ? "text-primary" : "text-danger"}`}
                >
                  {totalSide.toUpperCase()}
                </div>
                {game.bettingLines && (
                  <div className="text-xs text-muted">{formatTotal(game.bettingLines.total)}</div>
                )}
              </>
            )}
          </div>

          {/* Confidence */}
          <div className="rounded-lg p-2 text-center border border-border bg-surface">
            <div className="text-xs text-muted mb-0.5">Confidence</div>
            <ConfidenceMeter value={prediction.winProbability} showValue height="h-1.5" />
            <div className="text-xs text-muted mt-1">{prediction.winProbability}%</div>
          </div>
        </div>

        {/* Venue */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>{game.venue}</span>
          <span className="group-hover:text-primary transition-colors">View analysis →</span>
        </div>
      </div>
    </Link>
  );
}
