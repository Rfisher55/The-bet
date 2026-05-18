/* ═══════════════════════════════════════════════════
   THE BET — Prediction Engine
   ═══════════════════════════════════════════════════ */

const HOME_FIELD_ADV = 2.8;

function calcExpectedScore(team, opponent, isHome, neutralSite) {
  const base = team.stats.pointsPerGame * 0.58 + opponent.stats.pointsAllowedPerGame * 0.42;
  const homeAdj = neutralSite ? 0 : isHome ? HOME_FIELD_ADV : -(HOME_FIELD_ADV * 0.6);
  const ratingAdj = (team.rating - opponent.rating) * 0.08;
  const toMargin =
    (team.stats.turnoversForced - team.stats.turnoversPerGame) -
    (opponent.stats.turnoversForced - opponent.stats.turnoversPerGame);
  const toAdj = toMargin * 1.2;
  const effAdj =
    (team.stats.redZonePct - opponent.stats.redZonePct) * 4 +
    (team.stats.thirdDownPct - opponent.stats.thirdDownPct) * 3;
  return Math.max(7, Math.min(70, base + homeAdj + ratingAdj + toAdj + effAdj));
}

function calcWinProb(spread) {
  const prob = 1 / (1 + Math.exp(-spread * 0.15));
  return Math.round(Math.min(99, Math.max(1, prob * 100)));
}

function confidenceLevel(homeExp, awayExp, homeRating, awayRating) {
  const combined = Math.abs(homeExp - awayExp) * 0.7 + Math.abs(homeRating - awayRating) * 0.3;
  if (combined >= 18) return "elite";
  if (combined >= 10) return "high";
  if (combined >= 5)  return "medium";
  return "low";
}

function buildFactors(home, away, neutralSite) {
  const factors = [];

  // Offensive edge
  const offEdge = home.stats.pointsPerGame - away.stats.pointsPerGame;
  factors.push({
    name: "Offensive Firepower",
    description: `${Math.abs(offEdge) < 1.5 ? "PPG nearly equal" : (offEdge > 0 ? home.name : away.name) + " averages " + Math.abs(offEdge).toFixed(1) + " more PPG"}`,
    impact: Math.abs(offEdge) < 1.5 ? "neutral" : offEdge > 0 ? "positive" : "negative",
    favoredTeam: offEdge > 0 ? "home" : offEdge < 0 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(offEdge) / 2)),
  });

  // Defensive edge
  const defEdge = away.stats.pointsAllowedPerGame - home.stats.pointsAllowedPerGame;
  factors.push({
    name: "Defensive Dominance",
    description: `${Math.abs(defEdge) < 1.5 ? "Defenses comparable" : (defEdge > 0 ? home.name : away.name) + " allows " + Math.abs(defEdge).toFixed(1) + " fewer PPG"}`,
    impact: Math.abs(defEdge) < 1.5 ? "neutral" : defEdge > 0 ? "positive" : "negative",
    favoredTeam: defEdge > 0 ? "home" : defEdge < 0 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(defEdge) / 2)),
  });

  // Turnover margin
  const homeTOM = home.stats.turnoversForced - home.stats.turnoversPerGame;
  const awayTOM = away.stats.turnoversForced - away.stats.turnoversPerGame;
  const toEdge = homeTOM - awayTOM;
  factors.push({
    name: "Turnover Margin",
    description: toEdge > 0.3
      ? `${home.name} wins turnover battle (+${toEdge.toFixed(1)})`
      : toEdge < -0.3
      ? `${away.name} wins turnover battle (+${Math.abs(toEdge).toFixed(1)})`
      : "Turnover margins roughly equal",
    impact: Math.abs(toEdge) < 0.3 ? "neutral" : toEdge > 0 ? "positive" : "negative",
    favoredTeam: toEdge > 0.3 ? "home" : toEdge < -0.3 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(toEdge) * 3)),
  });

  // Home field
  if (!neutralSite) {
    factors.push({
      name: "Home Field Advantage",
      description: `${home.name} plays in front of home crowd — worth ~${HOME_FIELD_ADV} pts`,
      impact: "positive", favoredTeam: "home", magnitude: 5,
    });
  }

  // Recruiting
  const rEdge = away.recruitingRank - home.recruitingRank;
  factors.push({
    name: "Roster Talent (Recruiting)",
    description: Math.abs(rEdge) < 3
      ? `Recruiting classes comparable (#${home.recruitingRank} vs #${away.recruitingRank})`
      : (rEdge > 0 ? home.name : away.name) + ` recruiting advantage (#${rEdge > 0 ? home.recruitingRank : away.recruitingRank} nationally)`,
    impact: Math.abs(rEdge) < 3 ? "neutral" : rEdge > 0 ? "positive" : "negative",
    favoredTeam: rEdge > 3 ? "home" : rEdge < -3 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(rEdge) / 2)),
  });

  // Passing edge
  const passEdge = home.stats.passingYardsPerGame - away.stats.passingYardsPerGame;
  factors.push({
    name: "Passing Game Edge",
    description: Math.abs(passEdge) < 20
      ? "Passing attacks comparable"
      : `${passEdge > 0 ? home.name : away.name}'s passing attack leads by ${Math.abs(passEdge).toFixed(0)} yds/gm`,
    impact: Math.abs(passEdge) < 20 ? "neutral" : passEdge > 0 ? "positive" : "negative",
    favoredTeam: passEdge > 20 ? "home" : passEdge < -20 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(passEdge) / 15)),
  });

  // Coaching
  const hW = parseInt(home.coachRecord.split("-")[0]);
  const aW = parseInt(away.coachRecord.split("-")[0]);
  const cEdge = hW - aW;
  factors.push({
    name: "Coaching Experience",
    description: Math.abs(cEdge) < 20
      ? "Coaching experience comparable"
      : `${cEdge > 0 ? home.name : away.name}'s ${cEdge > 0 ? home.coachName : away.coachName} holds experience edge`,
    impact: Math.abs(cEdge) < 20 ? "neutral" : cEdge > 0 ? "positive" : "negative",
    favoredTeam: cEdge > 20 ? "home" : cEdge < -20 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(cEdge) / 15)),
  });

  return factors;
}

function generateSocialBuzz(home, away) {
  const hNorm = home.rating / 100;
  const aNorm = away.rating / 100;

  const homeInjuries = KEY_PLAYERS
    .filter(p => p.teamId === home.id && p.injuryStatus !== "healthy")
    .map(p => ({
      player: p.name, team: home.name, position: p.position,
      status: p.injuryStatus, impact: p.impact,
      notes: `${p.name} listed as ${p.injuryStatus} — monitor through game week`,
    }));

  const awayInjuries = KEY_PLAYERS
    .filter(p => p.teamId === away.id && p.injuryStatus !== "healthy")
    .map(p => ({
      player: p.name, team: away.name, position: p.position,
      status: p.injuryStatus, impact: p.impact,
      notes: `${p.name} listed as ${p.injuryStatus} — monitor through game week`,
    }));

  return {
    homeTeamBuzz: Math.round(hNorm * 65 + 15),
    awayTeamBuzz: Math.round(aNorm * 55 + 15),
    sentimentHome: (hNorm * 0.6 + 0.1).toFixed(2),
    sentimentAway: (aNorm * 0.5 + 0.05).toFixed(2),
    trendingTopics: [
      `#${home.abbreviation}vs${away.abbreviation}`,
      `#${home.mascot.replace(/\s/g, "")}`,
      `#${away.mascot.replace(/\s/g, "")}`,
      "#CFB2026",
      `#${home.coachName.split(" ")[1]}`,
    ],
    insiderTips: [
      {
        source: "Pete Thamel", handle: "@PeteThamel", platform: "twitter",
        content: `${home.name} practiced in full pads Tuesday — offense looked sharp. ${home.coachName} mentioned the team is fully healthy heading into Week 1.`,
        reliability: 5, timestamp: "2h ago", tags: ["practice", "health", home.name],
      },
      {
        source: "r/cfb Insider", handle: "u/GridironGuru88", platform: "reddit",
        content: `Hearing ${away.name} has been working on a new defensive scheme specifically designed to stop ${home.name}'s spread attack.`,
        reliability: 3, timestamp: "4h ago", tags: ["defense", "scheme", away.name],
      },
      {
        source: "Brett McMurphy", handle: "@Brett_McMurphy", platform: "twitter",
        content: `Multiple sources tell me ${away.name} dealing with depth chart uncertainty this week. Changes expected by Friday.`,
        reliability: 4, timestamp: "6h ago", tags: ["depth chart", away.name, "insider"],
      },
    ],
    injuryAlerts: [...homeInjuries, ...awayInjuries],
    weatherImpact: null,
  };
}

function predictGame(game) {
  const home = game.homeTeam;
  const away = game.awayTeam;
  const neutral = game.neutralSite;

  const homeExp = calcExpectedScore(home, away, true, neutral);
  const awayExp  = calcExpectedScore(away, home, false, neutral);

  const predSpread = homeExp - awayExp; // positive = home wins by this
  const predTotal  = homeExp + awayExp;
  const winProb    = calcWinProb(predSpread);

  const confidence = confidenceLevel(homeExp, awayExp, home.rating, away.rating);
  const factors    = buildFactors(home, away, neutral);
  const socialBuzz = generateSocialBuzz(home, away);

  const predictedWinner = predSpread >= 0 ? home.name : away.name;

  let spreadPick  = { side: "no-bet", team: "", confidence: 0, edge: 0 };
  let totalPick   = { side: "no-bet", confidence: 0, edge: 0 };
  let mlValue     = "no-value";

  if (game.bettingLines) {
    const vegasSpread = game.bettingLines.spread; // negative = home favored
    const modelSpread = -predSpread;              // same convention
    const sEdge = vegasSpread - modelSpread;      // positive = we like home more than Vegas

    if (sEdge > 2) {
      spreadPick = { side: "home", team: home.name, confidence: Math.min(95, Math.round(50 + sEdge * 5)), edge: parseFloat(Math.abs(sEdge).toFixed(1)) };
    } else if (sEdge < -2) {
      spreadPick = { side: "away", team: away.name, confidence: Math.min(95, Math.round(50 + Math.abs(sEdge) * 5)), edge: parseFloat(Math.abs(sEdge).toFixed(1)) };
    }

    const tEdge = predTotal - game.bettingLines.total;
    if (tEdge > 3) {
      totalPick = { side: "over", confidence: Math.min(95, Math.round(50 + tEdge * 4)), edge: parseFloat(tEdge.toFixed(1)) };
    } else if (tEdge < -3) {
      totalPick = { side: "under", confidence: Math.min(95, Math.round(50 + Math.abs(tEdge) * 4)), edge: parseFloat(Math.abs(tEdge).toFixed(1)) };
    }

    if (predSpread > 7 && game.bettingLines.homeMoneyline > -300) mlValue = "home";
    else if (predSpread < -7 && game.bettingLines.awayMoneyline < 300) mlValue = "away";
  }

  const homeW = (home.wins / (home.wins + home.losses) * 100) | 0;
  const coachW = parseInt(home.coachRecord.split("-")[0]);
  const coachT = coachW + parseInt(home.coachRecord.split("-")[1]);

  return {
    gameId: game.id,
    generatedAt: new Date().toISOString(),
    predictedWinner,
    winProbability: predSpread >= 0 ? winProb : 100 - winProb,
    predictedSpread: predSpread,
    predictedTotal: predTotal,
    homeExpected: homeExp,
    awayExpected: awayExp,
    confidence,
    spreadPick,
    totalPick,
    moneylineValue: mlValue,
    factors,
    socialBuzz,
    modelBreakdown: {
      offenseVsDefense:    Math.round((home.offensiveRating + away.defensiveRating) / 2),
      recentForm:          homeW,
      homeFieldAdvantage:  neutral ? 0 : 65,
      headToHead:          52,
      coachingEdge:        coachT > 0 ? Math.round(coachW / coachT * 100) : 60,
      recruitingEdge:      Math.round(((20 - home.recruitingRank) / 20) * 100),
      socialSignal:        socialBuzz.homeTeamBuzz,
    },
  };
}
