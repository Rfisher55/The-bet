/* ═══════════════════════════════════════════════════
   THE BET — Prediction Engine v2.0
   Comprehensive Multi-Signal Prediction Model
   ═══════════════════════════════════════════════════ */

const HOME_FIELD_ADV = 2.8;

/* ─── WEIGHT CONSTANTS ────────────────────────────── */
const WEIGHTS = {
  baseModel:          0.30,
  playerImpact:       0.20,
  situational:        0.15,
  weather:            0.10,
  coachingEdge:       0.10,
  programMomentum:    0.08,
  sharpMoney:         0.07,
};

/* ─── UTILITY HELPERS ─────────────────────────────── */
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function safeGet(obj, path, fallback = 0) {
  return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj) ?? fallback;
}

/* ═══════════════════════════════════════════════════
   CORE BASE MODEL FUNCTIONS (upgraded)
   ═══════════════════════════════════════════════════ */

/**
 * Calculate raw expected score for a team.
 * Incorporates: PPG/PAPG blend, rating adj, turnover margin, efficiency stats.
 * Returns 7-70.
 */
function calcExpectedScore(team, opponent, isHome, neutralSite) {
  const base = team.stats.pointsPerGame * 0.58 + opponent.stats.pointsAllowedPerGame * 0.42;
  const homeAdj = neutralSite ? 0 : isHome ? HOME_FIELD_ADV : -(HOME_FIELD_ADV * 0.6);
  const ratingAdj = (team.rating - opponent.rating) * 0.08;

  const homeTOM = (team.stats.turnoversForced || 0) - (team.stats.turnoversPerGame || 0);
  const awayTOM = (opponent.stats.turnoversForced || 0) - (opponent.stats.turnoversPerGame || 0);
  const toAdj = (homeTOM - awayTOM) * 1.2;

  const effAdj =
    ((team.stats.redZonePct || 0.85) - (opponent.stats.redZonePct || 0.85)) * 4 +
    ((team.stats.thirdDownPct || 0.45) - (opponent.stats.thirdDownPct || 0.45)) * 3;

  // ATS record signal — teams beating the spread consistently tend to outperform
  let atsBonus = 0;
  if (team.atsRecord) {
    const atsWins = team.atsRecord.wins || 0;
    const atsTotal = (team.atsRecord.wins || 0) + (team.atsRecord.losses || 0);
    if (atsTotal > 0) {
      const atsPct = atsWins / atsTotal;
      atsBonus = (atsPct - 0.5) * 2.0; // max ±1.0 pt
    }
  }

  // Sack differential — team that creates pressure tends to suppress scoring
  const sackEdge = ((team.stats.sacks || 0) - (opponent.stats.sacks || 0)) * 0.15;

  return clamp(base + homeAdj + ratingAdj + toAdj + effAdj + atsBonus + sackEdge, 7, 70);
}

/**
 * Logistic win probability from spread.
 * Returns integer 1-99 representing home win %.
 */
function calcWinProb(spread) {
  const prob = 1 / (1 + Math.exp(-spread * 0.15));
  return Math.round(clamp(prob * 100, 1, 99));
}

/**
 * Confidence level — now factors in injury alerts and sharp money.
 * Returns "elite" / "high" / "medium" / "low"
 */
function confidenceLevel(homeExp, awayExp, homeRating, awayRating, opts = {}) {
  const rawCombined = Math.abs(homeExp - awayExp) * 0.7 + Math.abs(homeRating - awayRating) * 0.3;
  let combined = rawCombined;

  // Injury concerns reduce confidence
  if (opts.injuryAlert) combined -= 4;

  // Sharp money contradicting model reduces confidence
  if (opts.sharpContra) combined -= 3;

  // Weather uncertainty reduces confidence
  if (opts.severeWeather) combined -= 2;

  // Trap game — model may be overconfident
  if (opts.trapGame) combined -= 2;

  if (combined >= 18) return "elite";
  if (combined >= 10) return "high";
  if (combined >= 5)  return "medium";
  return "low";
}

/* ═══════════════════════════════════════════════════
   NEW SIGNAL: PLAYER IMPACT ADJUSTMENT
   ═══════════════════════════════════════════════════ */

/**
 * Calculate player impact adjustment for a team.
 * Examines injury status, distraction flags, performance metrics, and draft/portal risk.
 * Returns -5 to +5 pts adjustment.
 */
function calcPlayerImpactAdjustment(team, isHome) {
  const teamPlayers = KEY_PLAYERS.filter(p => p.teamId === team.id);
  if (!teamPlayers.length) return 0;

  let totalAdj = 0;

  for (const player of teamPlayers) {
    const impactWeight = player.impact === "high" ? 1.0
      : player.impact === "medium" ? 0.6
      : 0.3;

    // ── Injury status penalty ──────────────────────
    let injuryPenalty = 0;
    const status = (player.injuryStatus || "healthy").toLowerCase();
    if (status === "out") {
      injuryPenalty = player.position === "QB" ? -4.5 : player.position === "RB" ? -1.8 : -1.2;
    } else if (status === "doubtful") {
      injuryPenalty = player.position === "QB" ? -3.5 : player.position === "RB" ? -1.4 : -0.9;
    } else if (status === "questionable") {
      injuryPenalty = player.position === "QB" ? -2.2 : player.position === "RB" ? -0.9 : -0.6;
    }

    // Injury-prone players accumulate more uncertainty
    const injuryProne = safeGet(player, "injuryProneRating", 5);
    if (status !== "healthy" && injuryProne >= 7) {
      injuryPenalty *= 1.2; // compound fragility
    }

    // ── Personal distraction penalty ──────────────
    let distractionPenalty = 0;
    const distLevel = safeGet(player, "personalFlags.distractionLevel", 0);
    if (distLevel >= 8) {
      // Severe distraction (contract holdout, family issues, public controversy)
      distractionPenalty = -0.5 * impactWeight * ((distLevel - 7) * 1.5);
    } else if (distLevel >= 5) {
      distractionPenalty = -0.25 * impactWeight * (distLevel - 4);
    }

    // QB with distraction reduces team score additionally
    if (player.position === "QB" && distLevel >= 8) {
      distractionPenalty -= 1.0; // extra QB distraction tax
    }

    // ── NFL Draft status — checked-out seniors ────
    const nflStatus = safeGet(player, "personalFlags.nflDraftStatus", "");
    let draftAdj = 0;
    if (nflStatus === "top5pick" && status === "healthy") {
      // Elite talent, but potential self-preservation mode for non-rivalry games
      draftAdj = 0.3 * impactWeight; // still performing but slightly conservative
    } else if (nflStatus === "fringe") {
      draftAdj = 0.2 * impactWeight; // extra motivated to prove worth
    }

    // ── NIL Satisfaction ─────────────────────────
    const nilSatisfaction = safeGet(player, "personalFlags.nilSatisfaction", 5);
    let nilAdj = 0;
    if (nilSatisfaction <= 3) {
      nilAdj = -0.3 * impactWeight; // unhappy player, checked out
    } else if (nilSatisfaction >= 8) {
      nilAdj = 0.15 * impactWeight; // happy, motivated
    }

    // ── Transfer portal risk (current mood) ──────
    const portalRisk = safeGet(player, "personalFlags.transferPortalRisk", 0);
    let portalAdj = 0;
    if (portalRisk >= 7) {
      portalAdj = -0.4 * impactWeight; // one foot out the door
    }

    // ── Performance metrics context ───────────────
    let perfBonus = 0;
    if (player.performanceMetrics) {
      const pm = player.performanceMetrics;
      const clutch = (pm.clutchRating || 5) - 5;
      const consistency = (pm.consistencyRating || 5) - 5;
      perfBonus = (clutch * 0.08 + consistency * 0.05) * impactWeight;
    }

    const playerAdj = (injuryPenalty + distractionPenalty + draftAdj + nilAdj + portalAdj + perfBonus) * impactWeight;
    totalAdj += playerAdj;
  }

  return clamp(totalAdj, -5, 5);
}

/* ═══════════════════════════════════════════════════
   NEW SIGNAL: SITUATIONAL ADJUSTMENT
   ═══════════════════════════════════════════════════ */

/**
 * Calculate situational adjustment for a given team in this game.
 * Covers: trap games, emotional spots, travel burden, rest, revenge, rivalry.
 * Returns -4 to +4 pts.
 */
function calcSituationalAdjustment(game, isHomeTeam, team, opponent) {
  let adj = 0;
  const gameSit = game.situational || {};
  const teamSit = team.schedule || {};
  const teamSituational = team.situational || {};

  // ── Trap Game Risk ────────────────────────────
  // A big favorite playing a weak opponent before/after a marquee game
  const trapRisk = gameSit.trapGameRisk || 0;
  if (isHomeTeam && trapRisk >= 8) {
    adj -= 2.5;
  } else if (isHomeTeam && trapRisk >= 5) {
    adj -= 1.2;
  }

  // ── Emotional Spot / Letdown ──────────────────
  const emotionalSpot = isHomeTeam
    ? (gameSit.homeTeamEmotionalSpot || gameSit.emotionalSpot || "")
    : (gameSit.awayTeamEmotionalSpot || gameSit.emotionalSpot || "");

  if (emotionalSpot === "letdown") {
    adj -= 1.8; // coming off big win, flat this week
  } else if (emotionalSpot === "revenge") {
    adj += 1.5; // revenge game, extra motivated
  } else if (emotionalSpot === "bounce_back") {
    adj += 1.2; // coming off bad loss, extra hungry
  } else if (emotionalSpot === "rivalry_hate") {
    adj += 1.0; // rivalry game surge
  } else if (emotionalSpot === "lookahead") {
    adj -= 2.0; // looking past this week to next week's big game
  } else if (emotionalSpot === "desperation") {
    adj += 0.8; // must-win situation
  }

  // ── Team situational records ──────────────────
  if (teamSit.isComingOffBigLoss) {
    const afterLossRecord = teamSituational.afterLoss || null;
    // Check ATS record after loss
    if (afterLossRecord) {
      const afterLossWins = afterLossRecord.wins || 0;
      const afterLossTotal = (afterLossRecord.wins || 0) + (afterLossRecord.losses || 0);
      if (afterLossTotal > 0) {
        const pct = afterLossWins / afterLossTotal;
        adj += (pct - 0.5) * 3.0; // max ±1.5 pt
      }
    } else {
      adj += 0.8; // generic bounce-back effect
    }
  }

  if (teamSit.isComingOffBigWin) {
    const afterBigWinRecord = teamSituational.afterBigWin || null;
    if (afterBigWinRecord) {
      const w = afterBigWinRecord.wins || 0;
      const t = (afterBigWinRecord.wins || 0) + (afterBigWinRecord.losses || 0);
      if (t > 0) {
        const pct = w / t;
        adj += (pct - 0.5) * 2.0;
      }
    } else {
      adj -= 0.7; // generic letdown risk
    }
  }

  // ── Lookahead Game ────────────────────────────
  if (teamSit.hasLookaheadGame) {
    adj -= 1.5; // players/coaches mentally focused on next week
  }

  // ── Rest Advantage ────────────────────────────
  const restAdv = gameSit.restAdvantage;
  if (restAdv === "home" && isHomeTeam) {
    adj += 1.0;
  } else if (restAdv === "away" && !isHomeTeam) {
    adj += 1.0;
  } else if (restAdv === "home" && !isHomeTeam) {
    adj -= 0.8;
  } else if (restAdv === "away" && isHomeTeam) {
    adj -= 0.8;
  }

  // Days since last game check
  const daysSince = teamSit.daysSinceLastGame || 7;
  if (daysSince >= 14) {
    adj += 0.5; // extra rest, well-prepared
  } else if (daysSince <= 5) {
    adj -= 1.0; // short week penalty
  }

  // ── Travel Burden ─────────────────────────────
  const travelBurden = teamSit.travelBurdenRating || gameSit.travelDistance || 0;
  if (!isHomeTeam) {
    // Away team always travels; high burden penalizes further
    if (travelBurden >= 8) {
      adj -= 1.5; // transcontinental, multiple time zones
    } else if (travelBurden >= 5) {
      adj -= 0.8;
    }
  }

  // ── Time Zone Change ──────────────────────────
  const tzChange = gameSit.timeZoneChange || 0;
  if (!isHomeTeam && Math.abs(tzChange) >= 2) {
    adj -= 0.7 * (Math.abs(tzChange) >= 3 ? 1.5 : 1.0);
  }

  // ── Rivalry Game Boost ────────────────────────
  if (gameSit.rivalryGame) {
    const vsRankedRecord = teamSituational.vsRanked || null;
    if (vsRankedRecord) {
      const w = vsRankedRecord.wins || 0;
      const t = (vsRankedRecord.wins || 0) + (vsRankedRecord.losses || 0);
      if (t > 0) adj += (w / t - 0.5) * 1.5;
    }
    // General rivalry uplift — players play harder
    adj += 0.5;
  }

  // ── Prime Time Game ───────────────────────────
  if (gameSit.primeTimeGame) {
    const nightGameRecord = teamSituational.nightGame || null;
    if (nightGameRecord) {
      const w = nightGameRecord.wins || 0;
      const t = (nightGameRecord.wins || 0) + (nightGameRecord.losses || 0);
      if (t > 0) adj += (w / t - 0.5) * 1.8;
    }
  }

  // ── Road Team Climate Mismatch (Week 1 special) ──
  // Cold-climate road team traveling to a warm-weather environment
  // gives a defensive edge to the warm-weather home team
  const homeColdWeather = safeGet(team, "weatherProfile.coldWeatherAdvantage", false);
  const awayColdWeather = safeGet(opponent, "weatherProfile.coldWeatherAdvantage", false);
  if (isHomeTeam && !homeColdWeather && awayColdWeather) {
    // Home (warm) team hosting away (cold-climate) team in warm weather early season
    adj += 1.2; // warm-weather home team has acclimatization edge
  }

  return clamp(adj, -4, 4);
}

/* ═══════════════════════════════════════════════════
   NEW SIGNAL: WEATHER IMPACT
   ═══════════════════════════════════════════════════ */

/**
 * Calculate weather impact on scoring.
 * Returns { homeAdj, awayAdj, totalAdj, note }
 * All adjustments are negative (weather suppresses scoring).
 */
function calcWeatherImpact(game, home, away) {
  const wx = game.weatherForecast || {};

  // Dome game — no weather impact
  if (wx.domeGame || safeGet(home, "weatherProfile.isDome", false)) {
    return { homeAdj: 0, awayAdj: 0, totalAdj: 0, note: "Dome game — weather not a factor." };
  }

  const temp       = wx.temp        ?? 65;    // °F
  const wind       = wx.wind        ?? 5;     // mph
  const precip     = wx.precipitation ?? 0;  // 0-1 scale or inches
  const condition  = (wx.condition  || "clear").toLowerCase();
  const humidity   = wx.humidity    ?? 50;    // percent

  let homeAdj  = 0;
  let awayAdj  = 0;
  let totalAdj = 0;
  const notes  = [];

  // ── Cold Weather ──────────────────────────────
  if (temp < 40) {
    const coldPenalty = temp < 20 ? 5.5 : temp < 30 ? 4.0 : 2.5;
    // Pass-heavy teams take extra hit in cold weather
    const homePassHeavy = (home.stats.passingYardsPerGame || 0) > 280;
    const awayPassHeavy = (away.stats.passingYardsPerGame || 0) > 280;
    const homeColdBonus = safeGet(home, "weatherProfile.coldWeatherAdvantage", false) ? 0.6 : 1.0;
    const awayColdBonus = safeGet(away, "weatherProfile.coldWeatherAdvantage", false) ? 0.6 : 1.0;

    homeAdj  -= coldPenalty * (homePassHeavy ? 1.15 : 0.85) * homeColdBonus;
    awayAdj  -= coldPenalty * (awayPassHeavy ? 1.15 : 0.85) * awayColdBonus;
    totalAdj -= coldPenalty * 1.8;
    notes.push(`Frigid conditions (${temp}°F) — passing game suppressed ~${(coldPenalty * 1.15).toFixed(1)} pts for pass-heavy attacks.`);
  } else if (temp < 50) {
    const coldPenalty = 1.2;
    homeAdj  -= coldPenalty * (safeGet(home, "weatherProfile.coldWeatherAdvantage", false) ? 0.5 : 1.0);
    awayAdj  -= coldPenalty * (safeGet(away, "weatherProfile.coldWeatherAdvantage", false) ? 0.5 : 1.0);
    totalAdj -= 2.0;
    notes.push(`Cold weather (${temp}°F) — minor scoring suppression expected.`);
  }

  // ── High Wind ─────────────────────────────────
  if (wind >= 30) {
    homeAdj  -= 3.0;
    awayAdj  -= 3.0;
    totalAdj -= 5.5;
    notes.push(`Strong winds (${wind} mph) — passing game severely disrupted, run-heavy game expected.`);
  } else if (wind >= 20) {
    homeAdj  -= 1.8;
    awayAdj  -= 1.8;
    totalAdj -= 3.5;
    notes.push(`Gusty winds (${wind} mph) — kicking game affected, passing efficiency down.`);
  } else if (wind >= 15) {
    homeAdj  -= 0.8;
    awayAdj  -= 0.8;
    totalAdj -= 1.5;
    notes.push(`Moderate wind (${wind} mph) — slight passing game impact.`);
  }

  // ── Precipitation ─────────────────────────────
  const isRain    = condition.includes("rain") || condition.includes("storm");
  const isSnow    = condition.includes("snow") || condition.includes("blizzard");
  const isSleet   = condition.includes("sleet") || condition.includes("freezing");

  // Normalize precipitation level (0-10 scale or inches)
  const precipLevel = precip > 1 ? Math.min(precip / 2, 5) : precip * 5;

  if (isSnow || isSleet) {
    const snowPenalty = 3.5 + precipLevel * 0.6;
    homeAdj  -= snowPenalty * 0.85; // home team more acclimated
    awayAdj  -= snowPenalty * 1.05;
    totalAdj -= snowPenalty * 1.8;
    notes.push(`Snow/ice (${condition}) — significant scoring suppression, ball-security premium.`);
  } else if (isRain) {
    const rainPenalty = 2.0 + precipLevel * 0.7;
    homeAdj  -= rainPenalty * 0.90;
    awayAdj  -= rainPenalty * 1.00;
    totalAdj -= rainPenalty * 1.7;
    notes.push(`Rain (${condition}) — reduced scoring expected, run game gains value.`);
  }

  // ── Extreme Heat / Humidity ───────────────────
  if (temp > 90 && humidity > 70) {
    // High heat and humidity especially hurts northern cold-climate teams on the road
    const heatPenalty = 1.0;
    const awayColdClimate = safeGet(away, "weatherProfile.coldWeatherAdvantage", false);
    awayAdj  -= awayColdClimate ? heatPenalty * 1.8 : heatPenalty;
    homeAdj  -= heatPenalty * 0.4; // home team more used to it
    totalAdj -= heatPenalty * 1.2;
    notes.push(`Extreme heat/humidity (${temp}°F, ${humidity}% humidity) — conditioning and endurance factor, especially for visiting cold-climate programs.`);
  }

  // Apply external weather impact on total from data.js if provided
  const dataWxImpact = wx.weatherImpactOnTotal || 0;
  if (dataWxImpact && !notes.length) {
    totalAdj += dataWxImpact; // data overrides if we computed nothing
  }

  const note = notes.length ? notes.join(" ") : (wx.weatherImpactNote || "Weather conditions clear — no significant impact.");

  return {
    homeAdj:  parseFloat(homeAdj.toFixed(2)),
    awayAdj:  parseFloat(awayAdj.toFixed(2)),
    totalAdj: parseFloat(totalAdj.toFixed(2)),
    note,
    conditions: { temp, wind, condition, humidity, precipitation: precip },
  };
}

/* ═══════════════════════════════════════════════════
   NEW SIGNAL: COACHING EDGE
   ═══════════════════════════════════════════════════ */

/**
 * Calculate coaching matchup edge.
 * Analyzes scheme matchups, adjustments, situational coaching, and tendencies.
 * Returns { winner: "home"/"away"/"neutral", pts, note, breakdown }
 */
function calcCoachingEdge(home, away) {
  const hCoach = home.coachingProfile || {};
  const aCoach = away.coachingProfile || {};

  let homeEdge = 0;
  let notes    = [];

  // ── Halftime Adjustment Rating ────────────────
  const hHalf = hCoach.halftimeAdjustmentRating || 6;
  const aHalf = aCoach.halftimeAdjustmentRating || 6;
  const halfEdge = (hHalf - aHalf) * 0.18;
  homeEdge += halfEdge;
  if (Math.abs(halfEdge) > 0.3) {
    notes.push(`${halfEdge > 0 ? home.coachName : away.coachName} holds halftime adjustment edge (${Math.max(hHalf, aHalf)}/10 rating).`);
  }

  // ── Close Game Record ─────────────────────────
  const hClose = hCoach.closeGameRecord || {};
  const aClose = aCoach.closeGameRecord || {};
  const hCloseW = hClose.wins || 0;
  const hCloseT = (hClose.wins || 0) + (hClose.losses || 0);
  const aCloseW = aClose.wins || 0;
  const aCloseT = (aClose.wins || 0) + (aClose.losses || 0);
  const hClosePct = hCloseT > 0 ? hCloseW / hCloseT : 0.5;
  const aClosePct = aCloseT > 0 ? aCloseW / aCloseT : 0.5;
  const closeEdge = (hClosePct - aClosePct) * 2.5;
  homeEdge += closeEdge;
  if (Math.abs(closeEdge) > 0.35) {
    notes.push(`${closeEdge > 0 ? home.coachName : away.coachName} excels in close games (${(Math.max(hClosePct, aClosePct) * 100).toFixed(0)}% win rate).`);
  }

  // ── Big Spot Record ───────────────────────────
  const hBig = hCoach.bigSpotRecord || {};
  const aBig = aCoach.bigSpotRecord || {};
  const hBigW = hBig.wins || 0;
  const hBigT = (hBig.wins || 0) + (hBig.losses || 0);
  const aBigW = aBig.wins || 0;
  const aBigT = (aBig.wins || 0) + (aBig.losses || 0);
  const hBigPct = hBigT > 0 ? hBigW / hBigT : 0.5;
  const aBigPct = aBigT > 0 ? aBigW / aBigT : 0.5;
  const bigEdge = (hBigPct - aBigPct) * 1.8;
  homeEdge += bigEdge;
  if (Math.abs(bigEdge) > 0.3) {
    notes.push(`${bigEdge > 0 ? home.coachName : away.coachName} performs better in high-stakes games.`);
  }

  // ── ATS Record as Favorite / Underdog ─────────
  const hATS = hCoach.atsRecord || {};
  const aATS = aCoach.atsRecord || {};
  const hAtsW = hATS.wins || 0;
  const hAtsT = (hATS.wins || 0) + (hATS.losses || 0);
  const aAtsW = aATS.wins || 0;
  const aAtsT = (aATS.wins || 0) + (aATS.losses || 0);
  const hAtsPct = hAtsT > 0 ? hAtsW / hAtsT : 0.5;
  const aAtsPct = aAtsT > 0 ? aAtsW / aAtsT : 0.5;
  const atsEdge = (hAtsPct - aAtsPct) * 1.5;
  homeEdge += atsEdge;

  // ── Scheme Matchup ────────────────────────────
  const hTend = hCoach.tendencies || {};
  const aTend = aCoach.tendencies || {};

  // Aggressive offense vs soft defense
  const hAgg = hTend.aggressiveness || 5;
  const aAgg = aTend.aggressiveness || 5;
  const aggEdge = (hAgg - aAgg) * 0.12;
  homeEdge += aggEdge;

  // Tempo mismatch — high-tempo offense vs slow defense
  const hTempo = hTend.tempoPreference || "moderate";
  const aTempo = aTend.tempoPreference || "moderate";
  if (hTempo === "hurry-up" && aTend.defensiveScheme === "complex") {
    homeEdge += 0.5; // fast offense exploits complex scheme
    notes.push(`${home.coachName}'s hurry-up tempo creates problems for ${away.coachName}'s complex defensive scheme.`);
  }
  if (aTempo === "hurry-up" && hTend.defensiveScheme === "complex") {
    homeEdge -= 0.5;
    notes.push(`${away.coachName}'s hurry-up tempo creates problems for ${home.coachName}'s complex defensive scheme.`);
  }

  // Blitz-heavy vs good protection
  const hBlitz = hTend.blitzRate || 5;
  const aBlitz = aTend.blitzRate || 5;
  // If home team blitzes more against away team with good protection
  if (hBlitz >= 7 && (away.stats.sacksAllowed || 2.0) <= 1.5) {
    homeEdge -= 0.4; // blitzing into good protection backfires
  } else if (hBlitz >= 7 && (away.stats.sacksAllowed || 2.0) >= 2.5) {
    homeEdge += 0.5; // blitzing vs leaky OL works
  }

  // ── Staff Stability ───────────────────────────
  const hStability = hCoach.staffStability || 7;
  const aStability = aCoach.staffStability || 7;
  const stabilityEdge = (hStability - aStability) * 0.15;
  homeEdge += stabilityEdge;

  // ── Hot Seat Penalty ──────────────────────────
  const hHotSeat = safeGet(home, "programHealth.coachHotSeat", false);
  const aHotSeat = safeGet(away, "programHealth.coachHotSeat", false);
  if (hHotSeat) homeEdge -= 0.6; // pressure affects decision-making
  if (aHotSeat) homeEdge += 0.6;

  // ── Raw Experience (W total) ──────────────────
  const hW = parseInt((home.coachRecord || "0-0").split("-")[0]) || 0;
  const aW = parseInt((away.coachRecord || "0-0").split("-")[0]) || 0;
  const expEdge = (hW - aW) * 0.008;
  homeEdge += expEdge;

  // Finalize
  homeEdge = clamp(homeEdge, -3, 3);
  const winner = homeEdge > 0.3 ? "home" : homeEdge < -0.3 ? "away" : "neutral";
  const winnerName = winner === "home" ? home.coachName : winner === "away" ? away.coachName : "Neither coach";

  if (!notes.length) {
    notes.push(`${winnerName} ${winner === "neutral" ? "— coaching matchup is a wash." : "holds a marginal coaching edge this week."}`);
  }

  return {
    winner,
    pts: parseFloat(Math.abs(homeEdge).toFixed(2)),
    rawEdge: parseFloat(homeEdge.toFixed(2)), // positive = home advantage
    note: notes.join(" "),
    breakdown: {
      halftimeAdjustments: parseFloat(halfEdge.toFixed(2)),
      closeGameRecord:     parseFloat(closeEdge.toFixed(2)),
      bigSpotRecord:       parseFloat(bigEdge.toFixed(2)),
      atsCoachRecord:      parseFloat(atsEdge.toFixed(2)),
      schemeMatchup:       parseFloat(aggEdge.toFixed(2)),
      experience:          parseFloat(expEdge.toFixed(2)),
    },
  };
}

/* ═══════════════════════════════════════════════════
   NEW SIGNAL: SHARP MONEY SIGNAL
   ═══════════════════════════════════════════════════ */

/**
 * Calculate sharp money signal from line movement data.
 * Returns { side: "home"/"away"/"neutral", strength: 1-10, note, reverseLineMovement }
 */
function calcSharpMoneySignal(game) {
  const lm = game.lineMovement || {};

  const openingLine    = lm.openingLine   ?? null;
  const currentLine    = lm.currentLine   ?? null;
  const movementPts    = lm.movementPts   ?? 0;
  const publicPct      = lm.publicBettingPct ?? 50;  // % on home
  const sharpMoneyOn   = (lm.sharpMoneyOn  || "").toLowerCase();
  const steamMoves     = lm.steamMoves    ?? 0;
  const openingTotal   = lm.openingTotal  ?? null;
  const currentTotal   = lm.currentTotal  ?? null;
  const totalMovement  = lm.totalMovement ?? 0;

  let strength = 5; // neutral baseline
  let side     = "neutral";
  const notes  = [];

  // ── Reverse Line Movement (RLM) ───────────────
  // Public is on one side but the line moves the other way = sharp action
  let reverseLineMovement = false;
  let rlmSide = "neutral";

  if (openingLine !== null && currentLine !== null) {
    const lineMovedInFavorOfHome = currentLine < openingLine; // spread decreased = home favored less = movement toward away
    // In standard format: negative = home favored; more negative = more favored
    const movedTowardHome = currentLine < openingLine;
    const publicOnHome    = publicPct > 55;
    const publicOnAway    = publicPct < 45;

    if (movedTowardHome && publicOnAway) {
      // Line moving toward home despite public on away = sharp on home
      reverseLineMovement = true;
      rlmSide = "home";
      notes.push(`RLM detected: public is ${100 - publicPct}% on ${game.awayTeam?.name || "away"} but line moving toward ${game.homeTeam?.name || "home"}.`);
    } else if (!movedTowardHome && publicOnHome) {
      // Line moving toward away despite public on home = sharp on away
      reverseLineMovement = true;
      rlmSide = "away";
      notes.push(`RLM detected: public is ${publicPct}% on ${game.homeTeam?.name || "home"} but line moving toward ${game.awayTeam?.name || "away"}.`);
    }
  }

  // ── Explicit Sharp Money Direction ────────────
  if (sharpMoneyOn === "home") {
    side = "home";
    strength += 2;
    notes.push("Sharp money identified on home team.");
  } else if (sharpMoneyOn === "away") {
    side = "away";
    strength += 2;
    notes.push("Sharp money identified on away team.");
  }

  // ── Steam Moves ───────────────────────────────
  if (steamMoves >= 3) {
    strength += 3;
    notes.push(`${steamMoves} steam moves detected — coordinated sharp action.`);
  } else if (steamMoves >= 1) {
    strength += 1.5;
    notes.push(`${steamMoves} steam move(s) — sharp syndicate activity.`);
  }

  // ── Line Movement Magnitude ───────────────────
  if (Math.abs(movementPts) >= 3) {
    strength += 2;
    notes.push(`Significant ${movementPts > 0 ? "home" : "away"}-side line movement (${Math.abs(movementPts)} pts).`);
    if (side === "neutral") {
      side = movementPts > 0 ? "home" : "away";
    }
  } else if (Math.abs(movementPts) >= 1.5) {
    strength += 1;
    if (side === "neutral") {
      side = movementPts > 0 ? "home" : "away";
    }
  }

  // ── Consensus Public Side (fade potential) ────
  if (publicPct >= 75 && side === "neutral") {
    // Heavily public side — may indicate fading opportunity
    side = "away"; // fade the public
    strength = Math.max(strength - 1, 3);
    notes.push(`${publicPct}% of public on home team — potential fade opportunity.`);
  } else if (publicPct <= 25 && side === "neutral") {
    side = "home";
    strength = Math.max(strength - 1, 3);
    notes.push(`${100 - publicPct}% of public on away team — potential fade opportunity.`);
  }

  // ── Reverse line movement confirms ───────────
  if (reverseLineMovement && rlmSide === side) {
    strength = Math.min(10, strength + 1.5);
  } else if (reverseLineMovement && rlmSide !== side && side !== "neutral") {
    // Contradicting signals — reduce confidence
    strength = Math.max(1, strength - 1);
  } else if (reverseLineMovement) {
    side = rlmSide;
  }

  // ── Steam note from data ──────────────────────
  if (lm.steamNote) notes.push(lm.steamNote);

  // Finalize strength
  strength = clamp(Math.round(strength), 1, 10);

  if (!notes.length) {
    notes.push("No significant sharp money movement detected — standard market action.");
    side = "neutral";
    strength = 3;
  }

  return {
    side,
    strength,
    note: notes.join(" "),
    reverseLineMovement,
    publicBettingPct: publicPct,
    steamMoves,
    lineMovement: movementPts,
    totalMovement,
  };
}

/* ═══════════════════════════════════════════════════
   NEW SIGNAL: PROGRAM MOMENTUM ADJUSTMENT
   ═══════════════════════════════════════════════════ */

/**
 * Calculate program momentum adjustment.
 * Evaluates NIL strength, transfer portal health, coach hot seat, morale, depth stability.
 * Returns -2 to +2 pts.
 */
function calcProgramMomentumAdj(team) {
  const ph = team.programHealth || {};
  let adj = 0;

  // ── NIL Strength ─────────────────────────────
  // Top NIL programs attract and retain elite talent
  const nil = ph.nilStrength || 5;
  adj += (nil - 5) * 0.15; // max ±0.75

  // ── Transfer Portal Rating ────────────────────
  // Programs winning the portal have depth and competition at every position
  const portal = ph.transferPortalRating || 5;
  adj += (portal - 5) * 0.12;

  // ── Coach Hot Seat ────────────────────────────
  const hotSeat = ph.coachHotSeat || false;
  if (hotSeat) {
    adj -= 0.5; // distraction, players uncertain
  }

  // ── Program Momentum ─────────────────────────
  const momentum = ph.programMomentum || 5;
  adj += (momentum - 5) * 0.10;

  // ── Fan Morale ───────────────────────────────
  const fanMorale = ph.fanMorale || 5;
  // Fan morale primarily impacts home performance
  adj += (fanMorale - 5) * 0.08;

  // ── Locker Room Cohesion ─────────────────────
  const cohesion = ph.lockerRoomCohesion || 7;
  adj += (cohesion - 5) * 0.14;

  // ── Depth Chart Stability ─────────────────────
  const depthStability = ph.depthChartStability || 7;
  if (depthStability <= 4) {
    adj -= 0.4; // shuffling roster = execution issues
  } else if (depthStability >= 8) {
    adj += 0.2;
  }

  return clamp(adj, -2, 2);
}

/* ═══════════════════════════════════════════════════
   NEW: BUILD X-FACTORS ARRAY
   ═══════════════════════════════════════════════════ */

/**
 * Build X-factors array — biggest game-specific wildcards.
 * Returns array of { title, description, severity (1-10), impactTeam, impactDirection, category }
 */
function buildXFactors(game, home, away, pred) {
  const xFactors = [];
  const gameSit  = game.situational || {};
  const wx       = game.weatherForecast || {};

  // ── Pre-defined x-factors from data ───────────
  if (Array.isArray(game.xFactors)) {
    for (const xf of game.xFactors) {
      xFactors.push({
        title:           xf.title || "Game Factor",
        description:     xf.description || "",
        severity:        xf.severity || 5,
        impactTeam:      xf.impactTeam || "both",
        impactDirection: xf.impactDirection || "neutral",
        category:        xf.category || "general",
      });
    }
  }

  // ── Trap Game Alert ───────────────────────────
  const trapRisk = gameSit.trapGameRisk || 0;
  if (trapRisk >= 7) {
    xFactors.push({
      title:           "Trap Game Alert",
      description:     `${home.name} faces a classic trap scenario — a weaker opponent sandwiched between marquee matchups. History shows these spots produce flat performances from favorites.`,
      severity:        Math.round(trapRisk),
      impactTeam:      "home",
      impactDirection: "negative",
      category:        "situational",
    });
  }

  // ── Rivalry Factor ────────────────────────────
  if (gameSit.rivalryGame) {
    xFactors.push({
      title:           "Rivalry Game",
      description:     gameSit.rivalryNote || `Deep-seated rivalry adds unquantifiable intensity. Records and rankings go out the window in this matchup.`,
      severity:        8,
      impactTeam:      "both",
      impactDirection: "equalizer",
      category:        "situational",
    });
  }

  // ── QB Injury / Status ────────────────────────
  const homeQB = KEY_PLAYERS.find(p => p.teamId === home.id && p.position === "QB");
  const awayQB = KEY_PLAYERS.find(p => p.teamId === away.id && p.position === "QB");

  if (homeQB && homeQB.injuryStatus !== "healthy") {
    const severity = homeQB.injuryStatus === "out" ? 9
      : homeQB.injuryStatus === "doubtful" ? 7 : 5;
    xFactors.push({
      title:           `${homeQB.name} Injury Concern`,
      description:     `${homeQB.name} is listed as ${homeQB.injuryStatus}. A game-day decision at QB creates significant uncertainty for ${home.name}'s offense.`,
      severity,
      impactTeam:      "home",
      impactDirection: "negative",
      category:        "injury",
    });
  }

  if (awayQB && awayQB.injuryStatus !== "healthy") {
    const severity = awayQB.injuryStatus === "out" ? 9
      : awayQB.injuryStatus === "doubtful" ? 7 : 5;
    xFactors.push({
      title:           `${awayQB.name} Injury Concern`,
      description:     `${awayQB.name} is listed as ${awayQB.injuryStatus}. Backup QB changes the entire offensive calculus for ${away.name}.`,
      severity,
      impactTeam:      "away",
      impactDirection: "negative",
      category:        "injury",
    });
  }

  // ── Weather X-Factor ──────────────────────────
  if (!wx.domeGame && (wx.wind >= 20 || wx.temp < 35 || ["rain","snow","blizzard","storm"].some(c => (wx.condition || "").includes(c)))) {
    const wxSeverity = wx.wind >= 30 ? 8 : wx.temp < 20 ? 8 : wx.wind >= 20 ? 6 : 5;
    xFactors.push({
      title:           "Weather Wildcard",
      description:     pred?.weatherImpact?.note || `${wx.condition || "Adverse"} conditions forecast (${wx.temp || "N/A"}°F, ${wx.wind || "N/A"} mph winds) — could negate traditional offensive advantages.`,
      severity:        wxSeverity,
      impactTeam:      "both",
      impactDirection: "suppressor",
      category:        "weather",
    });
  }

  // ── Sharp Money Divergence ────────────────────
  if (pred?.sharpMoneySignal?.strength >= 7) {
    const sharp = pred.sharpMoneySignal;
    xFactors.push({
      title:           "Heavy Sharp Action",
      description:     sharp.note,
      severity:        sharp.strength,
      impactTeam:      sharp.side,
      impactDirection: "positive",
      category:        "betting",
    });
  }

  // ── Locker Room Issues ────────────────────────
  const homeCohesion = safeGet(home, "programHealth.lockerRoomCohesion", 7);
  const awayCohesion = safeGet(away, "programHealth.lockerRoomCohesion", 7);
  if (homeCohesion <= 4) {
    xFactors.push({
      title:           `${home.name} Locker Room Concerns`,
      description:     `Reported internal friction within the ${home.name} program. Team chemistry issues at this level historically drag down on-field performance 2-4 pts.`,
      severity:        Math.round(7 - homeCohesion),
      impactTeam:      "home",
      impactDirection: "negative",
      category:        "program",
    });
  }
  if (awayCohesion <= 4) {
    xFactors.push({
      title:           `${away.name} Locker Room Concerns`,
      description:     `Internal cohesion rating for ${away.name} is below average. Dysfunction in the program can manifest in late-game decision-making and execution.`,
      severity:        Math.round(7 - awayCohesion),
      impactTeam:      "away",
      impactDirection: "negative",
      category:        "program",
    });
  }

  // ── NIL/Program Momentum Gap ──────────────────
  const homeNIL = safeGet(home, "programHealth.nilStrength", 5);
  const awayNIL = safeGet(away, "programHealth.nilStrength", 5);
  if (Math.abs(homeNIL - awayNIL) >= 3) {
    const strongerTeam = homeNIL > awayNIL ? home : away;
    const weakerTeam   = homeNIL > awayNIL ? away : home;
    xFactors.push({
      title:           "NIL Program Gap",
      description:     `${strongerTeam.name} has a significant NIL advantage over ${weakerTeam.name}. This talent-retention edge tends to compound as the season progresses.`,
      severity:        Math.min(9, Math.round(Math.abs(homeNIL - awayNIL) * 1.5)),
      impactTeam:      homeNIL > awayNIL ? "home" : "away",
      impactDirection: "positive",
      category:        "program",
    });
  }

  // ── Distracted Star Player ────────────────────
  for (const player of KEY_PLAYERS) {
    const teamId     = player.teamId;
    const distLevel  = safeGet(player, "personalFlags.distractionLevel", 0);
    if (distLevel >= 8 && player.impact === "high") {
      const isHomePlayer = teamId === home.id;
      xFactors.push({
        title:           `${player.name} Distraction Flag`,
        description:     `${player.name} (${player.position}, ${isHomePlayer ? home.name : away.name}) carries a high distraction rating (${distLevel}/10) — ${safeGet(player, "personalFlags.distractionType", "personal matters")} could affect focus and on-field production.`,
        severity:        distLevel,
        impactTeam:      isHomePlayer ? "home" : "away",
        impactDirection: "negative",
        category:        "player",
      });
    }
  }

  // ── Prime Time / Night Game factor ───────────
  if (gameSit.primeTimeGame) {
    xFactors.push({
      title:           "Prime Time Spotlight",
      description:     `National prime time exposure typically elevates performance for programs built for the big stage. Check each team's prime-time record.`,
      severity:        4,
      impactTeam:      "both",
      impactDirection: "amplifier",
      category:        "situational",
    });
  }

  // ── Emotional Spot Flags ──────────────────────
  const emotHome = gameSit.homeTeamEmotionalSpot || "";
  const emotAway = gameSit.awayTeamEmotionalSpot || "";
  if (emotHome === "lookahead" || emotAway === "lookahead") {
    const lookaheadTeam = emotHome === "lookahead" ? home : away;
    xFactors.push({
      title:           `${lookaheadTeam.name} Lookahead Risk`,
      description:     `${lookaheadTeam.name} may be mentally focused on an upcoming high-profile opponent rather than this week's game. Classic setup for an upset.`,
      severity:        6,
      impactTeam:      emotHome === "lookahead" ? "home" : "away",
      impactDirection: "negative",
      category:        "situational",
    });
  }

  // Sort by severity descending
  xFactors.sort((a, b) => b.severity - a.severity);

  return xFactors;
}

/* ═══════════════════════════════════════════════════
   NEW: PLAYER GAME INTEL
   ═══════════════════════════════════════════════════ */

/**
 * Generate enriched player intel object for this specific game context.
 * Returns enriched player object with game-specific notes, ratings, and flags.
 */
function getPlayerGameIntel(player, isHome, game) {
  const wx        = game.weatherForecast || {};
  const gameSit   = game.situational || {};
  const pm        = player.performanceMetrics || {};
  const pf        = player.personalFlags || {};

  const notes     = [];
  let gameRating  = 7.0; // baseline out of 10
  const flags     = [];

  // ── Injury Status ─────────────────────────────
  const status = (player.injuryStatus || "healthy").toLowerCase();
  let injuryNote = "";
  if (status === "out") {
    gameRating -= 4.0;
    injuryNote = `${player.name} is OUT — full absence expected.`;
    flags.push("OUT");
  } else if (status === "doubtful") {
    gameRating -= 2.8;
    injuryNote = `${player.name} is DOUBTFUL — unlikely to play, monitor final injury report.`;
    flags.push("DOUBTFUL");
  } else if (status === "questionable") {
    gameRating -= 1.5;
    injuryNote = `${player.name} is QUESTIONABLE — game-time decision, potential significant impact on team scoring.`;
    flags.push("QUESTIONABLE");
  }
  if (injuryNote) notes.push(injuryNote);

  // ── Injury Prone ──────────────────────────────
  const injuryProne = player.injuryProneRating || 5;
  if (injuryProne >= 8 && status === "healthy") {
    notes.push(`Injury-prone history (${injuryProne}/10 risk rating) — monitor throughout game week.`);
    flags.push("INJURY_PRONE");
  }

  // ── Weather Impact on Player ──────────────────
  if (!wx.domeGame) {
    const temp = wx.temp ?? 65;
    const wind = wx.wind ?? 5;
    const condition = (wx.condition || "clear").toLowerCase();

    if (player.position === "QB" || player.position === "WR") {
      const coldRating   = pm.coldWeatherRating || 5;
      if (temp < 35) {
        const coldPenalty = (6 - coldRating) * 0.25;
        gameRating -= coldPenalty;
        notes.push(`Cold conditions (${temp}°F) affect ${player.position} performance — player cold-weather rating: ${coldRating}/10.`);
      }
      if (wind >= 20) {
        gameRating -= 0.5;
        notes.push(`High winds (${wind} mph) will affect throwing/catching accuracy.`);
      }
    }
  }

  // ── Road Game Performance ─────────────────────
  if (!isHome) {
    const roadRating = pm.roadGameRating || 5;
    const roadAdj = (roadRating - 5) * 0.15;
    gameRating += roadAdj;
    if (roadRating >= 8) {
      notes.push(`${player.name} is a proven road warrior (${roadRating}/10 road rating).`);
    } else if (roadRating <= 3) {
      notes.push(`${player.name} has historically struggled on the road (${roadRating}/10).`);
      flags.push("ROAD_CONCERN");
    }
  }

  // ── Prime Time Performance ────────────────────
  if (gameSit.primeTimeGame) {
    const primeRating = pm.primeTimeRating || 5;
    const primeAdj = (primeRating - 5) * 0.18;
    gameRating += primeAdj;
    if (primeRating >= 8) {
      notes.push(`${player.name} thrives under the lights (${primeRating}/10 prime-time rating).`);
      flags.push("PRIME_TIME_PERFORMER");
    } else if (primeRating <= 3) {
      notes.push(`${player.name} has underperformed in prime-time games (${primeRating}/10).`);
      flags.push("PRIME_TIME_CONCERN");
    }
  }

  // ── Clutch Rating ─────────────────────────────
  const clutchRating = pm.clutchRating || 5;
  if (clutchRating >= 8) {
    notes.push(`Elite clutch performer (${clutchRating}/10) — expect to step up in big moments.`);
    flags.push("CLUTCH");
  } else if (clutchRating <= 3) {
    notes.push(`Below-average clutch rating (${clutchRating}/10) — may shrink in pressure situations.`);
    flags.push("CLUTCH_CONCERN");
  }

  // ── Distraction Flags ─────────────────────────
  const distLevel = pf.distractionLevel || 0;
  const distType  = pf.distractionType  || "";
  if (distLevel >= 8) {
    gameRating -= (distLevel - 7) * 0.5;
    notes.push(`ALERT: High distraction level (${distLevel}/10) — ${distType || "external factors"} may affect focus.`);
    flags.push("DISTRACTED");
  } else if (distLevel >= 5) {
    gameRating -= 0.3;
    notes.push(`Minor distraction flag (${distLevel}/10) — ${distType || "personal situation"} worth monitoring.`);
  }

  // ── NFL Draft Status ──────────────────────────
  const nflDraft = pf.nflDraftStatus || "";
  if (nflDraft === "top5pick") {
    notes.push(`Projected top-5 NFL Draft pick — elite talent, but may be in self-preservation mode.`);
    flags.push("TOP_DRAFT_PROSPECT");
  } else if (nflDraft === "fringe") {
    notes.push(`Fringe draft prospect — extra motivated to boost stock.`);
    flags.push("PROVING_GROUND");
  }

  // ── NIL Satisfaction ──────────────────────────
  const nilSat = pf.nilSatisfaction || 5;
  if (nilSat <= 3) {
    notes.push(`NIL dissatisfaction (${nilSat}/10) — may be exploring options.`);
    flags.push("NIL_UNHAPPY");
  }

  // ── Transfer Portal Risk ──────────────────────
  const portalRisk = pf.transferPortalRisk || 0;
  if (portalRisk >= 7) {
    notes.push(`High transfer portal risk (${portalRisk}/10) — commitment to program questionable.`);
    flags.push("PORTAL_RISK");
  }

  // ── Big Game Rating ───────────────────────────
  const bigGameRating = pm.bigGameRating || 5;
  if (gameSit.rivalryGame || gameSit.primeTimeGame) {
    const bigAdj = (bigGameRating - 5) * 0.2;
    gameRating += bigAdj;
    if (bigGameRating >= 8) {
      notes.push(`Elevates in big games (${bigGameRating}/10 big-game rating).`);
    } else if (bigGameRating <= 3) {
      notes.push(`Has underperformed in marquee matchups (${bigGameRating}/10 big-game rating).`);
      flags.push("BIG_GAME_CONCERN");
    }
  }

  // ── Explosive Play Rating ─────────────────────
  const explosiveRating = pm.explosivePlayRating || 5;
  if (explosiveRating >= 8 && (player.position === "WR" || player.position === "RB" || player.position === "QB")) {
    notes.push(`Elite explosive play ability (${explosiveRating}/10) — has game-breaking upside.`);
    flags.push("EXPLOSIVE");
  }

  // ── Pressure Rating ───────────────────────────
  const pressureRating = pm.pressureRating || 5;
  if (pressureRating >= 8 && player.position === "QB") {
    notes.push(`Handles pressure well (${pressureRating}/10 pressure rating) — won't be rattled by crowd noise or blitz packages.`);
  } else if (pressureRating <= 3 && player.position === "QB") {
    notes.push(`Struggles under pressure (${pressureRating}/10) — heavy blitz packages could disrupt this offense.`);
    flags.push("PRESSURE_CONCERN");
  }

  // Clamp game rating
  gameRating = parseFloat(clamp(gameRating, 0, 10).toFixed(1));

  return {
    ...player,
    gameRating,
    gameSpecificNotes: notes,
    gameFlags: flags,
    gameContext: {
      isHome,
      weatherImpact: (!wx.domeGame && (wx.temp < 40 || wx.wind >= 20)) ? "significant" : "minimal",
      primeTime:     gameSit.primeTimeGame || false,
      rivalry:       gameSit.rivalryGame || false,
    },
  };
}

/* ═══════════════════════════════════════════════════
   UPGRADED: buildFactors
   ═══════════════════════════════════════════════════ */

function buildFactors(home, away, neutralSite) {
  const factors = [];

  // ── Offensive Firepower ───────────────────────
  const offEdge = home.stats.pointsPerGame - away.stats.pointsPerGame;
  factors.push({
    name: "Offensive Firepower",
    description: Math.abs(offEdge) < 1.5
      ? "PPG nearly equal between both offenses"
      : `${offEdge > 0 ? home.name : away.name} averages ${Math.abs(offEdge).toFixed(1)} more PPG`,
    impact: Math.abs(offEdge) < 1.5 ? "neutral" : offEdge > 0 ? "positive" : "negative",
    favoredTeam: offEdge > 0 ? "home" : offEdge < 0 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(offEdge) / 2)),
  });

  // ── Defensive Dominance ───────────────────────
  const defEdge = away.stats.pointsAllowedPerGame - home.stats.pointsAllowedPerGame;
  factors.push({
    name: "Defensive Dominance",
    description: Math.abs(defEdge) < 1.5
      ? "Both defenses are statistically comparable"
      : `${defEdge > 0 ? home.name : away.name} allows ${Math.abs(defEdge).toFixed(1)} fewer PPG`,
    impact: Math.abs(defEdge) < 1.5 ? "neutral" : defEdge > 0 ? "positive" : "negative",
    favoredTeam: defEdge > 0 ? "home" : defEdge < 0 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(defEdge) / 2)),
  });

  // ── Turnover Margin ───────────────────────────
  const homeTOM = (home.stats.turnoversForced || 0) - (home.stats.turnoversPerGame || 0);
  const awayTOM = (away.stats.turnoversForced || 0) - (away.stats.turnoversPerGame || 0);
  const toEdge  = homeTOM - awayTOM;
  factors.push({
    name: "Turnover Margin",
    description: toEdge > 0.3
      ? `${home.name} wins the turnover battle (+${toEdge.toFixed(1)} per game)`
      : toEdge < -0.3
      ? `${away.name} wins the turnover battle (+${Math.abs(toEdge).toFixed(1)} per game)`
      : "Turnover margins roughly equal",
    impact: Math.abs(toEdge) < 0.3 ? "neutral" : toEdge > 0 ? "positive" : "negative",
    favoredTeam: toEdge > 0.3 ? "home" : toEdge < -0.3 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(toEdge) * 3)),
  });

  // ── Home Field Advantage ──────────────────────
  if (!neutralSite) {
    factors.push({
      name: "Home Field Advantage",
      description: `${home.name} plays in front of home crowd — historically worth ~${HOME_FIELD_ADV} pts`,
      impact: "positive", favoredTeam: "home", magnitude: 5,
    });
  }

  // ── Roster Talent (Recruiting) ────────────────
  const rEdge = away.recruitingRank - home.recruitingRank;
  factors.push({
    name: "Roster Talent (Recruiting)",
    description: Math.abs(rEdge) < 3
      ? `Recruiting classes comparable (#${home.recruitingRank} vs #${away.recruitingRank})`
      : `${rEdge > 0 ? home.name : away.name} recruiting advantage (#${rEdge > 0 ? home.recruitingRank : away.recruitingRank} nationally)`,
    impact: Math.abs(rEdge) < 3 ? "neutral" : rEdge > 0 ? "positive" : "negative",
    favoredTeam: rEdge > 3 ? "home" : rEdge < -3 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(rEdge) / 2)),
  });

  // ── Passing Game Edge ─────────────────────────
  const passEdge = home.stats.passingYardsPerGame - away.stats.passingYardsPerGame;
  factors.push({
    name: "Passing Game Edge",
    description: Math.abs(passEdge) < 20
      ? "Passing attacks are comparable"
      : `${passEdge > 0 ? home.name : away.name}'s passing attack leads by ${Math.abs(passEdge).toFixed(0)} yds/gm`,
    impact: Math.abs(passEdge) < 20 ? "neutral" : passEdge > 0 ? "positive" : "negative",
    favoredTeam: passEdge > 20 ? "home" : passEdge < -20 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(passEdge) / 15)),
  });

  // ── Rushing Game Edge ─────────────────────────
  const rushEdge = home.stats.rushingYardsPerGame - away.stats.rushingYardsPerGame;
  factors.push({
    name: "Ground Game Control",
    description: Math.abs(rushEdge) < 15
      ? "Rushing attacks nearly equivalent"
      : `${rushEdge > 0 ? home.name : away.name} runs the ball ${Math.abs(rushEdge).toFixed(0)} more yds/gm`,
    impact: Math.abs(rushEdge) < 15 ? "neutral" : rushEdge > 0 ? "positive" : "negative",
    favoredTeam: rushEdge > 15 ? "home" : rushEdge < -15 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(rushEdge) / 12)),
  });

  // ── Pressure/Sack Edge ────────────────────────
  const pressEdge = (home.stats.sacks || 0) - (away.stats.sacks || 0);
  const protEdge  = (away.stats.sacksAllowed || 0) - (home.stats.sacksAllowed || 0);
  const sackNet   = pressEdge * 0.5 + protEdge * 0.5;
  factors.push({
    name: "Pressure & Protection",
    description: Math.abs(sackNet) < 0.4
      ? "Pass rush and protection matchup is even"
      : `${sackNet > 0 ? home.name : away.name} holds the edge in the trenches`,
    impact: Math.abs(sackNet) < 0.4 ? "neutral" : sackNet > 0 ? "positive" : "negative",
    favoredTeam: sackNet > 0.4 ? "home" : sackNet < -0.4 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(sackNet) * 2)),
  });

  // ── Red Zone Efficiency ───────────────────────
  const rzEdge = (home.stats.redZonePct || 0) - (away.stats.redZonePct || 0);
  factors.push({
    name: "Red Zone Efficiency",
    description: Math.abs(rzEdge) < 0.04
      ? "Red zone efficiency is nearly identical"
      : `${rzEdge > 0 ? home.name : away.name} converts ${(Math.abs(rzEdge) * 100).toFixed(0)}% more in the red zone`,
    impact: Math.abs(rzEdge) < 0.04 ? "neutral" : rzEdge > 0 ? "positive" : "negative",
    favoredTeam: rzEdge > 0.04 ? "home" : rzEdge < -0.04 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(rzEdge) * 80)),
  });

  // ── Coaching Experience ───────────────────────
  const hW = parseInt((home.coachRecord || "0-0").split("-")[0]) || 0;
  const aW = parseInt((away.coachRecord || "0-0").split("-")[0]) || 0;
  const cEdge = hW - aW;
  factors.push({
    name: "Coaching Experience",
    description: Math.abs(cEdge) < 20
      ? "Coaching experience is comparable"
      : `${cEdge > 0 ? home.name : away.name}'s ${cEdge > 0 ? home.coachName : away.coachName} holds an experience edge`,
    impact: Math.abs(cEdge) < 20 ? "neutral" : cEdge > 0 ? "positive" : "negative",
    favoredTeam: cEdge > 20 ? "home" : cEdge < -20 ? "away" : "neither",
    magnitude: Math.min(10, Math.round(Math.abs(cEdge) / 15)),
  });

  // ── ATS Historical Edge ───────────────────────
  const homeATS = home.atsRecord || null;
  const awayATS = away.atsRecord || null;
  if (homeATS && awayATS) {
    const homeAtsPct = (homeATS.wins || 0) / Math.max(1, (homeATS.wins || 0) + (homeATS.losses || 0));
    const awayAtsPct = (awayATS.wins || 0) / Math.max(1, (awayATS.wins || 0) + (awayATS.losses || 0));
    const atsEdge    = homeAtsPct - awayAtsPct;
    factors.push({
      name: "ATS Historical Track Record",
      description: Math.abs(atsEdge) < 0.08
        ? `Both teams cover at similar rates`
        : `${atsEdge > 0 ? home.name : away.name} covers the spread at a higher rate historically (${(Math.max(homeAtsPct, awayAtsPct) * 100).toFixed(0)}% ATS)`,
      impact: Math.abs(atsEdge) < 0.08 ? "neutral" : atsEdge > 0 ? "positive" : "negative",
      favoredTeam: atsEdge > 0.08 ? "home" : atsEdge < -0.08 ? "away" : "neither",
      magnitude: Math.min(10, Math.round(Math.abs(atsEdge) * 30)),
    });
  }

  return factors;
}

/* ═══════════════════════════════════════════════════
   UPGRADED: generateSocialBuzz
   ═══════════════════════════════════════════════════ */

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

  // Build distraction buzz
  const distractionBuzz = KEY_PLAYERS
    .filter(p => (p.teamId === home.id || p.teamId === away.id) && safeGet(p, "personalFlags.distractionLevel", 0) >= 6)
    .map(p => ({
      player: p.name,
      team: p.teamId === home.id ? home.name : away.name,
      distractionType: safeGet(p, "personalFlags.distractionType", "personal matter"),
      level: safeGet(p, "personalFlags.distractionLevel", 0),
    }));

  return {
    homeTeamBuzz: Math.round(hNorm * 65 + 15),
    awayTeamBuzz: Math.round(aNorm * 55 + 15),
    sentimentHome: (hNorm * 0.6 + 0.1).toFixed(2),
    sentimentAway: (aNorm * 0.5 + 0.05).toFixed(2),
    trendingTopics: [
      `#${home.abbreviation}vs${away.abbreviation}`,
      `#${(home.mascot || "").replace(/\s/g, "")}`,
      `#${(away.mascot || "").replace(/\s/g, "")}`,
      "#CFB2026",
      `#${(home.coachName || "").split(" ")[1] || home.abbreviation}`,
    ],
    insiderTips: [
      {
        source: "Pete Thamel", handle: "@PeteThamel", platform: "twitter",
        content: `${home.name} practiced in full pads Tuesday — offense looked sharp. ${home.coachName} mentioned the team is fully healthy heading into this week.`,
        reliability: 5, timestamp: "2h ago", tags: ["practice", "health", home.name],
      },
      {
        source: "r/cfb Insider", handle: "u/GridironGuru88", platform: "reddit",
        content: `Hearing ${away.name} has been installing a new defensive wrinkle specifically targeting ${home.name}'s spread attack tendencies.`,
        reliability: 3, timestamp: "4h ago", tags: ["defense", "scheme", away.name],
      },
      {
        source: "Brett McMurphy", handle: "@Brett_McMurphy", platform: "twitter",
        content: `Multiple sources tell me ${away.name} dealing with depth chart uncertainty this week. Changes expected by Friday.`,
        reliability: 4, timestamp: "6h ago", tags: ["depth chart", away.name, "insider"],
      },
    ],
    injuryAlerts: [...homeInjuries, ...awayInjuries],
    distractionAlerts: distractionBuzz,
    weatherImpact: null,
  };
}

/* ═══════════════════════════════════════════════════
   MAIN: predictGame (COMPREHENSIVE REWRITE)
   ═══════════════════════════════════════════════════ */

/**
 * Main prediction function.
 * Incorporates all signals with weighted composite scoring.
 */
function predictGame(game) {
  const home    = game.homeTeam;
  const away    = game.awayTeam;
  const neutral = game.neutralSite;

  /* ── Step 1: Base Expected Scores (30% weight) ── */
  const homeBaseExp = calcExpectedScore(home, away, true,  neutral);
  const awayBaseExp = calcExpectedScore(away, home, false, neutral);

  /* ── Step 2: Player Impact Adjustments (20%) ──── */
  const homePlayerAdj = calcPlayerImpactAdjustment(home, true);
  const awayPlayerAdj = calcPlayerImpactAdjustment(away, false);

  /* ── Step 3: Situational Adjustments (15%) ─────── */
  const homeSitAdj = calcSituationalAdjustment(game, true,  home, away);
  const awaySitAdj = calcSituationalAdjustment(game, false, away, home);

  /* ── Step 4: Weather Impact (10%) ──────────────── */
  const weatherImpact = calcWeatherImpact(game, home, away);

  /* ── Step 5: Coaching Edge (10%) ────────────────── */
  const coachingEdge = calcCoachingEdge(home, away);
  const homeCoachAdj = coachingEdge.rawEdge > 0 ? coachingEdge.pts : 0;
  const awayCoachAdj = coachingEdge.rawEdge < 0 ? coachingEdge.pts : 0;

  /* ── Step 6: Program Momentum (8%) ─────────────── */
  const homeMomentumAdj = calcProgramMomentumAdj(home);
  const awayMomentumAdj = calcProgramMomentumAdj(away);

  /* ── Step 7: Sharp Money Signal (7%) ────────────── */
  const sharpMoneySignal = calcSharpMoneySignal(game);
  let homeSharpAdj = 0;
  let awaySharpAdj = 0;
  if (sharpMoneySignal.strength >= 6) {
    const sharpBonus = (sharpMoneySignal.strength - 5) * 0.4; // 0.4-2.0 pts
    if (sharpMoneySignal.side === "home") {
      homeSharpAdj = sharpBonus;
    } else if (sharpMoneySignal.side === "away") {
      awaySharpAdj = sharpBonus;
    }
  }

  /* ── Composite Score Assembly ────────────────────
     Each adjustment is applied to the base score with its appropriate weight factor.
     Base model already accounts for 30% of confidence; the adjustments are additive
     signals that shift the final expected scores. ─── */

  const homeComposite =
    homeBaseExp                                    // base (already weighted internally)
    + homePlayerAdj   * (WEIGHTS.playerImpact   / WEIGHTS.baseModel * 1.2)
    + homeSitAdj      * (WEIGHTS.situational    / WEIGHTS.baseModel * 1.1)
    + weatherImpact.homeAdj
    + homeCoachAdj    * (WEIGHTS.coachingEdge   / WEIGHTS.baseModel * 1.0)
    + homeMomentumAdj * (WEIGHTS.programMomentum/ WEIGHTS.baseModel * 0.9)
    + homeSharpAdj    * (WEIGHTS.sharpMoney     / WEIGHTS.baseModel * 1.0);

  const awayComposite =
    awayBaseExp
    + awayPlayerAdj   * (WEIGHTS.playerImpact   / WEIGHTS.baseModel * 1.2)
    + awaySitAdj      * (WEIGHTS.situational    / WEIGHTS.baseModel * 1.1)
    + weatherImpact.awayAdj
    + awayCoachAdj    * (WEIGHTS.coachingEdge   / WEIGHTS.baseModel * 1.0)
    + awayMomentumAdj * (WEIGHTS.programMomentum/ WEIGHTS.baseModel * 0.9)
    + awaySharpAdj    * (WEIGHTS.sharpMoney     / WEIGHTS.baseModel * 1.0);

  const homeFinal = clamp(homeComposite, 7, 70);
  const awayFinal = clamp(awayComposite, 7, 70);

  /* ── Derived Predictions ─────────────────────── */
  const predSpread = homeFinal - awayFinal;   // positive = home wins by this
  const predTotal  = homeFinal + awayFinal;

  /* ── Alert Flags ──────────────────────────────── */
  const trapGameAlert = (game.situational?.trapGameRisk || 0) >= 7;
  const injuryAlert   = KEY_PLAYERS.some(p =>
    (p.teamId === home.id || p.teamId === away.id) &&
    p.impact === "high" &&
    ["questionable","doubtful","out"].includes((p.injuryStatus || "").toLowerCase())
  );
  const sharpAlert = sharpMoneySignal.strength >= 7 && sharpMoneySignal.side !== "neutral";

  /* ── Win Probability ──────────────────────────── */
  const winProb = calcWinProb(predSpread);

  /* ── Confidence Level (now nuanced) ─────────────  */
  const confidence = confidenceLevel(homeFinal, awayFinal, home.rating, away.rating, {
    injuryAlert,
    sharpContra: sharpAlert && (
      (sharpMoneySignal.side === "home" && predSpread < 0) ||
      (sharpMoneySignal.side === "away" && predSpread > 0)
    ),
    severeWeather: Math.abs(weatherImpact.totalAdj) > 4,
    trapGame: trapGameAlert,
  });

  /* ── Model Grade ──────────────────────────────── */
  function computeModelGrade() {
    // Factors that increase confidence → better grade
    let score = 0;
    const spreadMag = Math.abs(predSpread);
    if (spreadMag >= 14) score += 3;
    else if (spreadMag >= 10) score += 2;
    else if (spreadMag >= 7) score += 1.5;
    else if (spreadMag >= 4) score += 1;

    // Rating gap
    const ratingGap = Math.abs(home.rating - away.rating);
    if (ratingGap >= 10) score += 2;
    else if (ratingGap >= 5) score += 1;

    // Data richness
    if (game.lineMovement) score += 0.5;
    if (game.weatherForecast) score += 0.5;
    if (home.coachingProfile && away.coachingProfile) score += 0.5;
    if (home.programHealth && away.programHealth) score += 0.5;
    if (home.situational && away.situational) score += 0.5;

    // Deductions
    if (injuryAlert)   score -= 1.5;
    if (trapGameAlert) score -= 1.0;
    if (sharpAlert && sharpMoneySignal.side !== (predSpread > 0 ? "home" : "away")) score -= 1.5;
    if (Math.abs(weatherImpact.totalAdj) > 4) score -= 0.5;

    if (score >= 7.5) return "A+";
    if (score >= 6.0) return "A";
    if (score >= 4.0) return "B";
    if (score >= 2.5) return "C";
    return "D";
  }
  const modelGrade = computeModelGrade();

  /* ── Betting Picks ───────────────────────────── */
  let spreadPick = { side: "no-bet", team: "", confidence: 0, edge: 0 };
  let totalPick  = { side: "no-bet", confidence: 0, edge: 0 };
  let mlValue    = "no-value";

  if (game.bettingLines) {
    const vegasSpread = game.bettingLines.spread; // negative = home favored
    const modelSpread = -predSpread;              // same convention
    const sEdge = vegasSpread - modelSpread;      // positive = we like home vs Vegas

    // Confidence multiplier from sharp money
    const sharpConfBoost = sharpAlert
      ? (sharpMoneySignal.side === "home" ? 5 : -5) // boost confidence if sharp agrees with model
      : 0;

    if (sEdge > 2) {
      spreadPick = {
        side:       "home",
        team:       home.name,
        confidence: clamp(Math.round(50 + sEdge * 5 + sharpConfBoost), 51, 95),
        edge:       parseFloat(Math.abs(sEdge).toFixed(1)),
      };
    } else if (sEdge < -2) {
      spreadPick = {
        side:       "away",
        team:       away.name,
        confidence: clamp(Math.round(50 + Math.abs(sEdge) * 5 - sharpConfBoost), 51, 95),
        edge:       parseFloat(Math.abs(sEdge).toFixed(1)),
      };
    }

    const tEdge = predTotal - game.bettingLines.total;
    if (tEdge > 3) {
      totalPick = { side: "over",  confidence: clamp(Math.round(50 + tEdge * 4), 51, 95), edge: parseFloat(tEdge.toFixed(1)) };
    } else if (tEdge < -3) {
      totalPick = { side: "under", confidence: clamp(Math.round(50 + Math.abs(tEdge) * 4), 51, 95), edge: parseFloat(Math.abs(tEdge).toFixed(1)) };
    }

    if (predSpread > 7 && game.bettingLines.homeMoneyline > -300) mlValue = "home";
    else if (predSpread < -7 && game.bettingLines.awayMoneyline < 300) mlValue = "away";
  }

  /* ── Predicted Winner ────────────────────────── */
  const predictedWinner = predSpread >= 0 ? home.name : away.name;

  /* ── Factors & Social Buzz ───────────────────── */
  const factors    = buildFactors(home, away, neutral);
  const socialBuzz = generateSocialBuzz(home, away);

  /* ── Player Profiles for this game ──────────── */
  const playerProfiles = KEY_PLAYERS
    .filter(p => p.teamId === home.id || p.teamId === away.id)
    .map(p => getPlayerGameIntel(p, p.teamId === home.id, game));

  /* ── Overall Edge Summary ────────────────────── */
  const overallEdge = {
    side:   predSpread > 0.5 ? "home" : predSpread < -0.5 ? "away" : "push",
    pts:    parseFloat(Math.abs(predSpread).toFixed(1)),
    breakdown: {
      baseModelEdge:      parseFloat((homeBaseExp - awayBaseExp).toFixed(2)),
      playerImpactEdge:   parseFloat((homePlayerAdj - awayPlayerAdj).toFixed(2)),
      situationalEdge:    parseFloat((homeSitAdj - awaySitAdj).toFixed(2)),
      weatherEdge:        parseFloat((weatherImpact.homeAdj - weatherImpact.awayAdj).toFixed(2)),
      coachingEdgePts:    parseFloat(coachingEdge.rawEdge.toFixed(2)),
      programMomentumEdge:parseFloat((homeMomentumAdj - awayMomentumAdj).toFixed(2)),
      sharpMoneyEdge:     parseFloat((homeSharpAdj - awaySharpAdj).toFixed(2)),
    },
  };

  /* ── X-Factors (needs pred partial for weather note) ── */
  const predPartial = { weatherImpact, sharpMoneySignal };
  const xFactors = buildXFactors(game, home, away, predPartial);

  /* ── Model Breakdown (backward-compatible) ────── */
  const homeW  = (home.wins / Math.max(1, home.wins + home.losses) * 100) | 0;
  const hCoachW = parseInt((home.coachRecord || "0-0").split("-")[0]) || 0;
  const hCoachT = hCoachW + (parseInt((home.coachRecord || "0-0").split("-")[1]) || 0);

  const modelBreakdown = {
    offenseVsDefense:   Math.round((home.offensiveRating + away.defensiveRating) / 2),
    recentForm:         homeW,
    homeFieldAdvantage: neutral ? 0 : 65,
    headToHead:         52,
    coachingEdge:       hCoachT > 0 ? Math.round(hCoachW / hCoachT * 100) : 60,
    recruitingEdge:     Math.round(((20 - home.recruitingRank) / 20) * 100),
    socialSignal:       socialBuzz.homeTeamBuzz,
    // New breakdown fields
    playerImpact: {
      homeAdj: parseFloat(homePlayerAdj.toFixed(2)),
      awayAdj: parseFloat(awayPlayerAdj.toFixed(2)),
    },
    situational: {
      homeAdj: parseFloat(homeSitAdj.toFixed(2)),
      awayAdj: parseFloat(awaySitAdj.toFixed(2)),
    },
    weatherSuppression: parseFloat(weatherImpact.totalAdj.toFixed(2)),
    sharpMoneyStrength: sharpMoneySignal.strength,
    programMomentum: {
      homeAdj: parseFloat(homeMomentumAdj.toFixed(2)),
      awayAdj: parseFloat(awayMomentumAdj.toFixed(2)),
    },
  };

  /* ── Return Full Prediction Object ──────────── */
  return {
    // Identity
    gameId:          game.id,
    generatedAt:     new Date().toISOString(),

    // Core predictions
    predictedWinner,
    winProbability:  predSpread >= 0 ? winProb : 100 - winProb,
    predictedSpread: parseFloat(predSpread.toFixed(2)),
    predictedTotal:  parseFloat(predTotal.toFixed(2)),
    homeExpected:    parseFloat(homeFinal.toFixed(2)),
    awayExpected:    parseFloat(awayFinal.toFixed(2)),

    // Base expected (pre-adjustments)
    homeBaseExpected: parseFloat(homeBaseExp.toFixed(2)),
    awayBaseExpected: parseFloat(awayBaseExp.toFixed(2)),

    // Confidence & grade
    confidence,
    modelGrade,

    // Picks
    spreadPick,
    totalPick,
    moneylineValue: mlValue,

    // ── New multi-signal outputs ──────────────────
    playerImpactAdj: {
      home: parseFloat(homePlayerAdj.toFixed(2)),
      away: parseFloat(awayPlayerAdj.toFixed(2)),
    },

    situationalAdj: {
      home: parseFloat(homeSitAdj.toFixed(2)),
      away: parseFloat(awaySitAdj.toFixed(2)),
    },

    weatherImpact: {
      homeAdj:  weatherImpact.homeAdj,
      awayAdj:  weatherImpact.awayAdj,
      totalAdj: weatherImpact.totalAdj,
      note:     weatherImpact.note,
      conditions: weatherImpact.conditions,
    },

    coachingEdge: {
      winner: coachingEdge.winner,
      pts:    coachingEdge.pts,
      note:   coachingEdge.note,
      breakdown: coachingEdge.breakdown,
    },

    sharpMoneySignal: {
      side:                sharpMoneySignal.side,
      strength:            sharpMoneySignal.strength,
      note:                sharpMoneySignal.note,
      reverseLineMovement: sharpMoneySignal.reverseLineMovement,
      publicBettingPct:    sharpMoneySignal.publicBettingPct,
      steamMoves:          sharpMoneySignal.steamMoves,
    },

    programMomentumAdj: {
      home: parseFloat(homeMomentumAdj.toFixed(2)),
      away: parseFloat(awayMomentumAdj.toFixed(2)),
    },

    xFactors,
    playerProfiles,

    compositeScore: {
      home: parseFloat(homeFinal.toFixed(2)),
      away: parseFloat(awayFinal.toFixed(2)),
    },

    overallEdge,

    // Alert flags
    trapGameAlert,
    injuryAlert,
    sharpAlert,

    // Factors & social
    factors,
    socialBuzz,
    modelBreakdown,
  };
}
