import type { Team } from "@/lib/types";

interface Props {
  team: Team;
  size?: "sm" | "md" | "lg";
  showRecord?: boolean;
  showName?: boolean;
  align?: "left" | "right" | "center";
}

export default function TeamBadge({
  team,
  size = "md",
  showRecord = false,
  showName = true,
  align = "left",
}: Props) {
  const dims = { sm: "w-8 h-8 text-xs", md: "w-12 h-12 text-sm", lg: "w-16 h-16 text-base" }[size];
  const nameSize = { sm: "text-sm", md: "text-base", lg: "text-lg" }[size];

  const alignClass =
    align === "right"
      ? "flex-row-reverse text-right"
      : align === "center"
      ? "flex-col items-center text-center"
      : "flex-row text-left";

  return (
    <div className={`flex items-center gap-3 ${alignClass}`}>
      {/* Color swatch / logo placeholder */}
      <div
        className={`${dims} rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg`}
        style={{ backgroundColor: team.color }}
      >
        {team.abbreviation.slice(0, 3)}
      </div>
      {showName && (
        <div>
          <div className={`font-bold ${nameSize} text-white leading-tight`}>{team.name}</div>
          <div className="text-xs text-muted">
            {team.mascot}
            {showRecord && ` · ${team.wins}-${team.losses}`}
          </div>
        </div>
      )}
    </div>
  );
}
