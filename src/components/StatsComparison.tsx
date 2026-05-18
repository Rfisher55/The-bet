import type { Team } from "@/lib/types";

interface StatRow {
  label: string;
  home: number;
  away: number;
  format?: (v: number) => string;
  higherIsBetter?: boolean;
}

interface Props {
  home: Team;
  away: Team;
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const pts = (v: number) => v.toFixed(1);
const yds = (v: number) => v.toFixed(0);

export default function StatsComparison({ home, away }: Props) {
  const rows: StatRow[] = [
    { label: "Points / Game", home: home.stats.pointsPerGame, away: away.stats.pointsPerGame, format: pts },
    { label: "Points Allowed / Game", home: home.stats.pointsAllowedPerGame, away: away.stats.pointsAllowedPerGame, format: pts, higherIsBetter: false },
    { label: "Total Yards / Game", home: home.stats.yardsPerGame, away: away.stats.yardsPerGame, format: yds },
    { label: "Yards Allowed / Game", home: home.stats.yardsAllowedPerGame, away: away.stats.yardsAllowedPerGame, format: yds, higherIsBetter: false },
    { label: "Passing Yards / Game", home: home.stats.passingYardsPerGame, away: away.stats.passingYardsPerGame, format: yds },
    { label: "Rushing Yards / Game", home: home.stats.rushingYardsPerGame, away: away.stats.rushingYardsPerGame, format: yds },
    { label: "3rd Down %", home: home.stats.thirdDownPct, away: away.stats.thirdDownPct, format: pct },
    { label: "Red Zone %", home: home.stats.redZonePct, away: away.stats.redZonePct, format: pct },
    { label: "Turnover Margin", home: home.stats.turnoversForced - home.stats.turnoversPerGame, away: away.stats.turnoversForced - away.stats.turnoversPerGame, format: (v) => v.toFixed(1) },
    { label: "Sacks / Game", home: home.stats.sacks, away: away.stats.sacks, format: (v) => v.toFixed(1) },
  ];

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const hib = row.higherIsBetter !== false;
        const homeWins = hib ? row.home > row.away : row.home < row.away;
        const awayWins = hib ? row.away > row.home : row.away < row.home;
        const fmt = row.format ?? pts;

        // Normalize bar widths
        const max = Math.max(Math.abs(row.home), Math.abs(row.away), 1);
        const homePct = Math.min(100, (Math.abs(row.home) / max) * 100);
        const awayPct = Math.min(100, (Math.abs(row.away) / max) * 100);

        return (
          <div key={row.label}>
            <div className="flex justify-between text-xs text-muted mb-1">
              <span
                className={`font-semibold ${homeWins ? "text-white" : ""}`}
                style={{ color: homeWins ? home.color : undefined }}
              >
                {fmt(row.home)}
              </span>
              <span className="text-center text-muted">{row.label}</span>
              <span
                className={`font-semibold text-right ${awayWins ? "text-white" : ""}`}
                style={{ color: awayWins ? away.color : undefined }}
              >
                {fmt(row.away)}
              </span>
            </div>
            <div className="flex gap-1 h-1.5">
              {/* Home bar (grows left-to-right) */}
              <div className="flex-1 flex justify-end rounded-l-full overflow-hidden bg-border">
                <div
                  className="h-full rounded-l-full"
                  style={{ width: `${homePct}%`, backgroundColor: homeWins ? home.color : "#334155" }}
                />
              </div>
              {/* Away bar (grows right-to-left) */}
              <div className="flex-1 flex justify-start rounded-r-full overflow-hidden bg-border">
                <div
                  className="h-full rounded-r-full"
                  style={{ width: `${awayPct}%`, backgroundColor: awayWins ? away.color : "#334155" }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
