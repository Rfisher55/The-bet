import type {
  Team,
  Game,
  GamePrediction,
  PredictionFactor,
  SocialBuzz,
  InsiderTip,
  InjuryAlert,
  Player,
} from "./types";
import { FEATURED_PLAYERS } from "./mockData";

const HOME_FIELD_ADVANTAGE = 2.8;

function calcExpectedScore(
  team: Team,
  opponent: Team,
  isHome: boolean,
  neutralSite: boolean
): number {
  const offAvg = team.stats.pointsPerGame;
  const defAdj = opponent.stats.pointsAllowedPerGame;

  // Blend own offense with opponent's defensive tendency
  const base = offAvg * 0.58 + defAdj * 0.42;

  // Home field adjustment
  const homeAdj = neutralSite ? 0 : isHome ? HOME_FIELD_ADVANTAGE : -HOME_FIELD_ADVANTAGE * 0.6;

  // Rating differential bonus/penalty
  const ratingDiff = team.rating - opponent.rating;
  const ratingAdj = ratingDiff * 0.08;

  // Turnover margin impact
  const toMargin =
    team.stats.turnoversForced - team.stats.turnoversPerGame -
    (opponent.stats.turnoversForced - opponent.stats.turnoversPerGame);
  const toAdj = toMargin * 1.2;

  // Red zone and 3rd down efficiency
  const effAdj =
    (team.stats.redZonePct - opponent.stats.redZonePct) * 4 +
    (team.stats.thirdDownPct - opponent.stats.thirdDownPct) * 3;

  const raw = base + homeAdj + ratingAdj + toAdj + effAdj;
  return Math.max(7, Math.min(70, raw));
}

function calcWinProbability(spread: number): number {
  // Logistic curve: each point of spread ≈ 3% win probability shift
  const prob = 1 / (1 + Math.exp(-spread * 0.15));
  return Math.round(Math.min(99, Math.max(1, prob * 100)));
}

function confidenceLevel(
  homeExpected: number,
  awayExpected: number,
  homeRating: number,
  awayRating: number
): GamePrediction["confidence"] {
  const spreadGap = Math.abs(homeExpected - awayExpected);
  const ratingGap = Math.abs(homeRating - awayRating);
  const combined = spreadGap * 0.7 + ratingGap * 0.3;

  if (combined >= 18) return "elite";
  if (combined >= 10) return "high";
  if (combined >= 5) return "medium";
  return "low";
}

function buildFactors(home: Team, away: Team, neutralSite: boolean): PredictionFactor[] {
  const factors: PredictionFactor[] = [];

  // Offensive firepower
  const offEdge = home.stats.pointsPerGame - away.stats.pointsPerGame;
  factors.push({
    name: "Offensive Firepower",
    description: `${offEdge > 0 ? home.name : away.name} averages ${Math.abs(offEdge).toFixed(1)} more PPG`,
    impact: Math.abs(offEdge) < 1.5 ? "neutral" : offEdge > 0 ? "positive" : "negative",
    favoredTeam: offEdge > 0 ? "home" : offEdge < 0 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(offEdge) / 2)),
  });

  // Defensive strength
  const defEdge = away.stats.pointsAllowedPerGame - home.stats.pointsAllowedPerGame;
  factors.push({
    name: "Defensive Dominance",
    description: `${defEdge > 0 ? home.name : away.name} allows ${Math.abs(defEdge).toFixed(1)} fewer PPG`,
    impact: Math.abs(defEdge) < 1.5 ? "neutral" : defEdge > 0 ? "positive" : "negative",
    favoredTeam: defEdge > 0 ? "home" : defEdge < 0 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(defEdge) / 2)),
  });

  // Turnover margin
  const homeTOMgn = home.stats.turnoversForced - home.stats.turnoversPerGame;
  const awayTOMgn = away.stats.turnoversForced - away.stats.turnoversPerGame;
  const toEdge = homeTOMgn - awayTOMgn;
  factors.push({
    name: "Turnover Margin",
    description:
      toEdge > 0.3
        ? `${home.name} wins turnover battle (+${toEdge.toFixed(1)} margin)`
        : toEdge < -0.3
        ? `${away.name} wins turnover battle (+${Math.abs(toEdge).toFixed(1)} margin)`
        : "Turnover margins roughly equal",
    impact: Math.abs(toEdge) < 0.3 ? "neutral" : toEdge > 0 ? "positive" : "negative",
    favoredTeam: toEdge > 0.3 ? "home" : toEdge < -0.3 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(toEdge) * 3)),
  });

  // Home field advantage
  if (!neutralSite) {
    factors.push({
      name: "Home Field Advantage",
      description: `${home.name} plays in front of home crowd — worth ~${HOME_FIELD_ADVANTAGE} pts`,
      impact: "positive",
      favoredTeam: "home",
      magnitude: 5,
    });
  }

  // Recruiting / roster talent
  const recruitEdge = away.recruitingRank - home.recruitingRank; // lower rank = better
  factors.push({
    name: "Roster Talent (Recruiting)",
    description:
      recruitEdge > 3
        ? `${home.name} holds significant recruiting advantage (#${home.recruitingRank} vs #${away.recruitingRank})`
        : recruitEdge < -3
        ? `${away.name} holds significant recruiting advantage (#${away.recruitingRank} vs #${home.recruitingRank})`
        : `Recruiting classes comparable (#${home.recruitingRank} vs #${away.recruitingRank})`,
    impact: Math.abs(recruitEdge) < 3 ? "neutral" : recruitEdge > 0 ? "positive" : "negative",
    favoredTeam: recruitEdge > 3 ? "home" : recruitEdge < -3 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(recruitEdge) / 2)),
  });

  // Pass efficiency
  const passEdge = home.stats.passingYardsPerGame - away.stats.passingYardsPerGame;
  factors.push({
    name: "Passing Game Edge",
    description: `${Math.abs(passEdge) > 20 ? (passEdge > 0 ? home.name : away.name) + "'s air attack leads by " + Math.abs(passEdge).toFixed(0) + " yds/gm" : "Passing offenses comparable"}`,
    impact: Math.abs(passEdge) < 20 ? "neutral" : passEdge > 0 ? "positive" : "negative",
    favoredTeam: passEdge > 20 ? "home" : passEdge < -20 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(passEdge) / 15)),
  });

  // Coaching edge
  const homeCoachWins = parseInt(home.coachRecord.split("-")[0]);
  const awayCoachWins = parseInt(away.coachRecord.split("-")[0]);
  const coachEdge = homeCoachWins - awayCoachWins;
  factors.push({
    name: "Coaching Experience",
    description:
      coachEdge > 20
        ? `${home.name}'s ${home.coachName} holds coaching experience edge`
        : coachEdge < -20
        ? `${away.name}'s ${away.coachName} holds coaching experience edge`
        : "Coaching experience comparable",
    impact: Math.abs(coachEdge) < 20 ? "neutral" : coachEdge > 0 ? "positive" : "negative",
    favoredTeam: coachEdge > 20 ? "home" : coachEdge < -20 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(coachEdge) / 15)),
  });

  return factors;
}

function generateSocialBuzz(home: Team, away: Team): SocialBuzz {
  const homeRatingNorm = home.rating / 100;
  const awayRatingNorm = away.rating / 100;

  const insiderTips: InsiderTip[] = [
    {
      source: "Pete Thamel",
      handle: "@PeteThamel",
      platform: "twitter",
      content: `${home.name} practiced in full pads Tuesday — offense looked sharp. ${home.coachName} mentioned the team is fully healthy heading into Week 1.`,
      reliability: 5,
      timestamp: "2h ago",
      tags: ["practice", "health", home.name],
    },
    {
      source: `r/cfb Insider`,
      handle: "u/GridironGuru88",
      platform: "reddit",
      content: `Hearing ${away.name} has been working on a new defensive scheme specifically designed to stop ${home.name}'s spread attack. Defensive coordinator confirmed 3-4 base going forward.`,
      reliability: 3,
      timestamp: "4h ago",
      tags: ["defense", "scheme", away.name],
    },
    {
      source: "Brett McMurphy",
      handle: "@Brett_McMurphy",
      platform: "twitter",
      content: `Multiple sources tell me ${away.name} has been dealing with internal issues this week. Depth chart changes expected.`,
      reliability: 4,
      timestamp: "6h ago",
      tags: ["depth chart", away.name, "insider"],
    },
  ];

  const injuryAlerts: InjuryAlert[] = [];

  const homePlayers = FEATURED_PLAYERS.filter((p) => p.teamId === home.id);
  homePlayers.forEach((p) => {
    if (p.injuryStatus !== "healthy") {
      injuryAlerts.push({
        player: p.name,
        team: home.name,
        position: p.position,
        status: p.injuryStatus,
        impact: p.impact,
        notes: `${p.name} listed as ${p.injuryStatus} — monitor through game week`,
      });
    }
  });

  return {
    homeTeamBuzz: Math.round(homeRatingNorm * 65 + Math.random() * 25),
    awayTeamBuzz: Math.round(awayRatingNorm * 55 + Math.random() * 30),
    trendingTopics: [
      `#${home.abbreviation}vs${away.abbreviation}`,
      `#${home.mascot.replace(/\s/g, "")}`,
      `#${away.mascot.replace(/\s/g, "")}`,
      "#CFB2026",
      `#${home.coachName.split(" ")[1]}`,
    ],
    sentimentHome: parseFloat((homeRatingNorm * 0.6 + 0.1).toFixed(2)),
    sentimentAway: parseFloat((awayRatingNorm * 0.5 + 0.05).toFixed(2)),
    insiderTips,
    injuryAlerts,
    weatherImpact:
      home.venueState === "WI" || home.venueState === "MI" || home.venueState === "OH"
        ? {
            condition: "Partly Cloudy",
            temperature: 72,
            windSpeed: 12,
            precipitation: 0.1,
            impactScore: 2,
            favors: "none",
          }
        : null,
  };
}

export function predictGame(game: Game): GamePrediction {
  const { homeTeam, awayTeam, neutralSite } = game;

  const homeExpected = calcExpectedScore(homeTeam, awayTeam, true, neutralSite);
  const awayExpected = calcExpectedScore(awayTeam, homeTeam, false, neutralSite);

  const predictedSpread = homeExpected - awayExpected; // positive = home wins by this much
  const predictedTotal = homeExpected + awayExpected;
  const winProb = calcWinProbability(predictedSpread);

  const confidence = confidenceLevel(homeExpected, awayExpected, homeTeam.rating, awayTeam.rating);
  const factors = buildFactors(homeTeam, awayTeam, neutralSite);
  const socialBuzz = generateSocialBuzz(homeTeam, awayTeam);

  const predictedWinner = predictedSpread >= 0 ? homeTeam.name : awayTeam.name;

  // Spread pick: compare predicted spread to Vegas spread
  let spreadPick: GamePrediction["spreadPick"];
  if (game.bettingLines) {
    const vegasSpread = game.bettingLines.spread; // negative = home favored
    const modelSpread = -predictedSpread; // convert to Vegas convention (negative = home favored)
    const edge = vegasSpread - modelSpread; // positive = model says home is better than Vegas thinks

    if (edge > 2) {
      // Model likes home even more than Vegas — bet home (cover spread)
      spreadPick = {
        side: "home",
        team: homeTeam.name,
        confidence: Math.min(95, Math.round(50 + edge * 5)),
        edge: Math.abs(edge),
      };
    } else if (edge < -2) {
      // Model likes away more than Vegas — bet away
      spreadPick = {
        side: "away",
        team: awayTeam.name,
        confidence: Math.min(95, Math.round(50 + Math.abs(edge) * 5)),
        edge: Math.abs(edge),
      };
    } else {
      spreadPick = { side: "no-bet", team: "", confidence: 0, edge: Math.abs(edge) };
    }

    // Total pick
    const vegasTotal = game.bettingLines.total;
    const totalEdge = predictedTotal - vegasTotal;
    const totalPick: GamePrediction["totalPick"] =
      totalEdge > 3
        ? { side: "over", confidence: Math.min(95, Math.round(50 + totalEdge * 4)), edge: totalEdge }
        : totalEdge < -3
        ? { side: "under", confidence: Math.min(95, Math.round(50 + Math.abs(totalEdge) * 4)), edge: Math.abs(totalEdge) }
        : { side: "no-bet", confidence: 0, edge: Math.abs(totalEdge) };

    const homePlayers = FEATURED_PLAYERS.filter((p) => p.teamId === homeTeam.id);
    const awayPlayers = FEATURED_PLAYERS.filter((p) => p.teamId === awayTeam.id);

    return {
      gameId: game.id,
      generatedAt: new Date().toISOString(),
      predictedWinner,
      winProbability: predictedSpread >= 0 ? winProb : 100 - winProb,
      predictedSpread,
      predictedTotal,
      confidence,
      spreadPick,
      totalPick,
      moneylineValue:
        predictedSpread > 7 && game.bettingLines.homeMoneyline > -300
          ? "home"
          : predictedSpread < -7 && game.bettingLines.awayMoneyline < 300
          ? "away"
          : "no-value",
      factors,
      keyPlayers: [...homePlayers, ...awayPlayers].slice(0, 4),
      socialBuzz,
      modelBreakdown: {
        offenseVsDefense: Math.round((homeTeam.offensiveRating + awayTeam.defensiveRating) / 2),
        recentForm: Math.round((homeTeam.wins / (homeTeam.wins + homeTeam.losses)) * 100),
        homeFieldAdvantage: neutralSite ? 0 : 65,
        headToHead: 52,
        coachingEdge: Math.round(
          (parseInt(homeTeam.coachRecord.split("-")[0]) /
            (parseInt(homeTeam.coachRecord.split("-")[0]) +
              parseInt(homeTeam.coachRecord.split("-")[1]))) *
            100
        ),
        recruitingEdge: Math.round(((20 - homeTeam.recruitingRank) / 20) * 100),
        socialSignal: socialBuzz.homeTeamBuzz,
      },
    };
  }

  // No betting lines — still return prediction without picks
  return {
    gameId: game.id,
    generatedAt: new Date().toISOString(),
    predictedWinner,
    winProbability: predictedSpread >= 0 ? winProb : 100 - winProb,
    predictedSpread,
    predictedTotal,
    confidence,
    spreadPick: { side: "no-bet", team: "", confidence: 0, edge: 0 },
    totalPick: { side: "no-bet", confidence: 0, edge: 0 },
    moneylineValue: "no-value",
    factors,
    keyPlayers: FEATURED_PLAYERS.filter(
      (p) => p.teamId === homeTeam.id || p.teamId === awayTeam.id
    ).slice(0, 4),
    socialBuzz,
    modelBreakdown: {
      offenseVsDefense: Math.round((homeTeam.offensiveRating + awayTeam.defensiveRating) / 2),
      recentForm: Math.round((homeTeam.wins / (homeTeam.wins + homeTeam.losses)) * 100),
      homeFieldAdvantage: neutralSite ? 0 : 65,
      headToHead: 52,
      coachingEdge: 60,
      recruitingEdge: 55,
      socialSignal: 60,
    },
  };
}
