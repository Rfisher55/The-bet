import type { SocialBuzz as SocialBuzzType } from "@/lib/types";
import { reliabilityStars } from "@/lib/utils";

interface Props {
  buzz: SocialBuzzType;
  homeTeamName: string;
  awayTeamName: string;
}

const platformIcon: Record<string, string> = {
  twitter: "𝕏",
  reddit: "R",
  insider: "★",
  "beat-writer": "✎",
};

const platformColor: Record<string, string> = {
  twitter: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  reddit: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  insider: "text-primary bg-primary/10 border-primary/30",
  "beat-writer": "text-purple-400 bg-purple-400/10 border-purple-400/30",
};

const impactColor: Record<string, string> = {
  high: "text-danger",
  medium: "text-gold",
  low: "text-muted",
};

export default function SocialBuzz({ buzz, homeTeamName, awayTeamName }: Props) {
  return (
    <div className="space-y-6">
      {/* Social sentiment bars */}
      <div>
        <div className="section-title">Social Sentiment</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-surface border border-border">
            <div className="text-xs text-muted mb-2">{homeTeamName}</div>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-white">{buzz.homeTeamBuzz}</div>
              <div className="text-xs text-muted mb-1">/ 100</div>
            </div>
            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${buzz.homeTeamBuzz}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-muted">
              Sentiment: {buzz.sentimentHome > 0.5 ? "🔥 Bullish" : buzz.sentimentHome > 0 ? "🙂 Positive" : "😬 Mixed"}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border">
            <div className="text-xs text-muted mb-2">{awayTeamName}</div>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-white">{buzz.awayTeamBuzz}</div>
              <div className="text-xs text-muted mb-1">/ 100</div>
            </div>
            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${buzz.awayTeamBuzz}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-muted">
              Sentiment: {buzz.sentimentAway > 0.5 ? "🔥 Bullish" : buzz.sentimentAway > 0 ? "🙂 Positive" : "😬 Mixed"}
            </div>
          </div>
        </div>
      </div>

      {/* Trending topics */}
      <div>
        <div className="section-title">Trending</div>
        <div className="flex flex-wrap gap-2">
          {buzz.trendingTopics.map((topic) => (
            <span
              key={topic}
              className="text-xs bg-surface border border-border text-muted px-2.5 py-1 rounded-full hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Injury alerts */}
      {buzz.injuryAlerts.length > 0 && (
        <div>
          <div className="section-title">Injury Report</div>
          <div className="space-y-2">
            {buzz.injuryAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-danger/5 border border-danger/20">
                <span className="text-danger text-sm mt-0.5">⚠</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{alert.player}</span>
                    <span className="text-xs text-muted">{alert.position}</span>
                    <span className="text-xs bg-surface border border-border rounded px-1.5 py-0.5 text-muted">
                      {alert.team}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold uppercase text-danger">{alert.status}</span>
                    <span className="text-xs text-muted">·</span>
                    <span className={`text-xs font-semibold ${impactColor[alert.impact]}`}>
                      {alert.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">{alert.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insider tips */}
      <div>
        <div className="section-title">Insider Intel</div>
        <div className="space-y-3">
          {buzz.insiderTips.map((tip, i) => (
            <div key={i} className="p-3 rounded-lg bg-surface border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-bold border rounded px-1.5 py-0.5 ${platformColor[tip.platform]}`}
                >
                  {platformIcon[tip.platform]} {tip.platform}
                </span>
                <span className="text-xs font-semibold text-white">{tip.source}</span>
                <span className="text-xs text-muted">{tip.handle}</span>
                <span className="ml-auto text-xs text-muted">{tip.timestamp}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{tip.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted">
                  Reliability: <span className="text-gold">{reliabilityStars(tip.reliability)}</span>
                </span>
                <div className="flex gap-1">
                  {tip.tags.map((tag) => (
                    <span key={tag} className="text-xs text-muted bg-border/50 rounded px-1.5 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather */}
      {buzz.weatherImpact && (
        <div>
          <div className="section-title">Weather Impact</div>
          <div className="p-3 rounded-lg bg-surface border border-border flex items-center gap-4">
            <span className="text-3xl">
              {buzz.weatherImpact.condition.includes("Rain")
                ? "🌧"
                : buzz.weatherImpact.condition.includes("Snow")
                ? "❄️"
                : buzz.weatherImpact.condition.includes("Cloud")
                ? "⛅"
                : "☀️"}
            </span>
            <div>
              <div className="text-sm font-semibold text-white">{buzz.weatherImpact.condition}</div>
              <div className="text-xs text-muted">
                {buzz.weatherImpact.temperature}°F · Wind {buzz.weatherImpact.windSpeed} mph ·{" "}
                {buzz.weatherImpact.precipitation}" precip
              </div>
              <div className="text-xs text-muted mt-1">
                Impact score:{" "}
                <span
                  className={
                    buzz.weatherImpact.impactScore >= 7
                      ? "text-danger"
                      : buzz.weatherImpact.impactScore >= 4
                      ? "text-gold"
                      : "text-primary"
                  }
                >
                  {buzz.weatherImpact.impactScore}/10
                </span>{" "}
                · Favors:{" "}
                <span className="text-white capitalize">{buzz.weatherImpact.favors}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
