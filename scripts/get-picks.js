/**
 * get-picks.js
 * Loads data.js + stubs + predictor in a Node vm sandbox,
 * runs predictions, and returns formatted picks + parlay combos.
 */

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

const JS   = (...f) => fs.readFileSync(path.resolve(__dirname, '..', 'js', ...f), 'utf8');
const ROOT = path.resolve(__dirname, '..');

// ── Load sandbox (runs once per process invocation) ───────────────
let _cache = null;
function loadSandbox() {
  if (_cache) return _cache;
  const sandbox = {
    console, Math, Date, parseInt, parseFloat, isNaN, Array, Object, JSON,
    window: { TEAM_INTEL: {} },
  };
  vm.runInNewContext(JS('data.js'),             sandbox);
  vm.runInNewContext(JS('data-fbs-stubs.js'),   sandbox);
  vm.runInNewContext(JS('players-extended.js'), sandbox);

  // Enrich TEAMS with live SP+ from team-extras.json before predictor runs,
  // so the script model uses the same inputs as the website.
  try {
    const extras = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'data', 'team-extras.json'), 'utf8')
    );
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    // SP+ ratings — match by team ID first (handles Ole Miss/Mississippi, FIU, etc.),
    // fall back to normalized name for entries without an id field.
    const spList = extras.spRatings || [];
    if (spList.length && sandbox.TEAMS) {
      const spById   = Object.fromEntries(spList.filter(e => e.id).map(e => [e.id, e.rating]));
      const spByName = Object.fromEntries(spList.map(e => [norm(e.team), e.rating]));
      Object.values(sandbox.TEAMS).forEach(t => {
        const rating = spById[t.id] ?? spByName[norm(t.name || '')];
        if (rating != null) t.spRating = rating;
      });
      console.log(`[LIVE] SP+ enriched for ${spList.length} teams in predictor sandbox`);
    }

    // Coach names + career records from prior-year CFBD
    // coachMap is keyed by both CFBD school name AND team ID for name-mismatch teams.
    const cmap = extras.coachMap || {};
    if (Object.keys(cmap).length && sandbox.TEAMS) {
      Object.values(sandbox.TEAMS).forEach(t => {
        const entry = cmap[t.id] || cmap[t.name] || cmap[Object.keys(cmap).find(k => norm(k) === norm(t.name || '')) || ''];
        if (entry) {
          if (entry.name) t.coachName = entry.name;
          if (entry.record) t.coachRecord = entry.record;
        }
      });
    }

    // Historical ATS records from prior-year lines
    const atsMap = extras.atsRecords || {};
    if (Object.keys(atsMap).length && sandbox.TEAMS) {
      Object.values(sandbox.TEAMS).forEach(t => {
        const entry = atsMap[t.name] || atsMap[Object.keys(atsMap).find(k => norm(k) === norm(t.name || '')) || ''];
        if (entry && entry.wins + entry.losses >= 4) {
          t.atsRecord = entry;
        }
      });
      if (Object.keys(atsMap).length) console.log(`[LIVE] ATS records loaded for ${Object.keys(atsMap).length} teams from team-extras.json`);
    }
  } catch (_) { /* team-extras.json missing or empty — use data.js fallback */ }

  // Merge live player stats/injury updates from players-2026.json (mirrors live.js pattern).
  // During preseason the file is empty — no-op. During season: updates stats + injury status
  // so tweet predictions use the same player inputs as the website.
  try {
    const pd = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'players-2026.json'), 'utf8'));
    const livePlayers = pd.players || [];
    if (livePlayers.length && sandbox.KEY_PLAYERS) {
      const byId  = {};
      const byKey = {};
      sandbox.KEY_PLAYERS.forEach(p => {
        byId[p.id] = p;
        byKey[p.teamId + '|' + p.position + '|' + (p.name || '').toLowerCase()] = p;
      });
      let added = 0, updated = 0;
      livePlayers.forEach(p => {
        if (!p || !p.id || !p.teamId) return;
        const k = p.teamId + '|' + p.position + '|' + (p.name || '').toLowerCase();
        const curated = byId[p.id] || byKey[k];
        if (curated) {
          if (p.stats)        curated.stats        = p.stats;
          if (p.injuryStatus) curated.injuryStatus = p.injuryStatus;
          updated++;
        } else {
          sandbox.KEY_PLAYERS.push(p);
          added++;
        }
      });
      console.log(`[LIVE] Players merged: ${updated} updated, ${added} added from players-2026.json`);
    }
  } catch (_) { /* players-2026.json missing or empty — players-extended.js fallback */ }

  vm.runInNewContext(JS('predictor.js'),        sandbox);
  _cache = sandbox;
  return sandbox;
}

function allPredictions() {
  const { GAMES, predictGame, resolveGame } = loadSandbox();

  // Use live games-2026.json when populated; fall back to data.js stubs
  let games = GAMES;
  try {
    const liveData = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '..', 'data', 'games-2026.json'), 'utf8')
    );
    if (liveData.games && liveData.games.length > 0) games = liveData.games;
  } catch { /* no live file yet — use data.js stubs */ }

  // Merge scraped public betting % from web-intel.json into game socialIntel
  // web-intel is keyed by team name (lowercase). games-2026.json uses homeTeam.name.
  let webIntelBetting = {};
  try {
    const wi = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '..', 'data', 'web-intel.json'), 'utf8')
    );
    webIntelBetting = wi.bettingPcts || {};
  } catch {}

  games = games.map(g => {
    const homeKey = (g.homeTeam?.name || g.home_team || "").toLowerCase();
    const awayKey = (g.awayTeam?.name || g.away_team || "").toLowerCase();
    const wib = webIntelBetting[homeKey] || webIntelBetting[awayKey];
    // Only override if current source is "default" and we have real data
    const currentSource = g.socialIntel?.publicBetting?.source;
    if (wib && wib.spreadBetPct != null && currentSource === "default") {
      const homePct = webIntelBetting[homeKey]?.spreadBetPct ?? (100 - (webIntelBetting[awayKey]?.spreadBetPct ?? 50));
      return {
        ...g,
        socialIntel: {
          ...(g.socialIntel || {}),
          publicBetting: {
            ...(g.socialIntel?.publicBetting || {}),
            homePct,
            awayPct: 100 - homePct,
            source: "teamrankings",
          },
        },
      };
    }
    return g;
  });

  return games.map(g => {
    try {
      const game = resolveGame(g);
      return { game, prediction: predictGame(game) };
    } catch { return null; }
  }).filter(Boolean);
}

// ── Helpers ───────────────────────────────────────────────────────
function pickConf(p) {
  const tp = p.game.gamePreview && p.game.gamePreview.thePick;
  return (tp && tp.confidence ? tp.confidence.toLowerCase() : null) || p.prediction.confidence;
}

function formatSpread(n) {
  if (n == null) return null;
  return n > 0 ? `+${n}` : `${n}`;
}

function upcomingWeek(predictions) {
  const today = new Date().toISOString().slice(0, 10);
  const weeks = predictions.filter(p => p.game.date >= today).map(p => p.game.week).filter(w => w != null);
  return weeks.length ? Math.min(...weeks) : null;
}

// ── modelProb: same logic as parlay.html ─────────────────────────
function modelProb(p, side) {
  const pred = p.prediction;
  const sp   = pred.spreadPick || {};
  const homeWinProb = pred.winProbability / 100;
  const tp   = p.game.gamePreview && p.game.gamePreview.thePick;

  if (side === 'home') {
    if (sp.side === 'home' && sp.confidence > 50) return sp.confidence / 100;
    if (tp && tp.team && tp.team.toLowerCase() === (p.game.homeTeam.name || '').toLowerCase())
      return tp.confidence === 'ELITE' ? 0.72 : tp.confidence === 'HIGH' ? 0.64 : homeWinProb;
    return homeWinProb;
  }
  if (side === 'away') {
    if (sp.side === 'away' && sp.confidence > 50) return sp.confidence / 100;
    if (tp && tp.team && tp.team.toLowerCase() === (p.game.awayTeam.name || '').toLowerCase())
      return tp.confidence === 'ELITE' ? 0.72 : tp.confidence === 'HIGH' ? 0.64 : (1 - homeWinProb);
    return 1 - homeWinProb;
  }
  return 0.5;
}

// American odds → decimal multiplier
function americanToDecimal(american) {
  if (american >= 0) return (american / 100) + 1;
  return (100 / Math.abs(american)) + 1;
}

// Decimal multiplier → American odds
function decimalToAmerican(decimal) {
  if (!decimal || decimal <= 1) return -99999;
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

function calcParlayOdds(legOdds) {
  const decimal = legOdds.reduce((acc, o) => acc * americanToDecimal(o), 1);
  return { decimal, american: decimalToAmerican(decimal) };
}

// ── getPicks ──────────────────────────────────────────────────────
function getPicks(type = 'all') {
  const today = new Date().toISOString().slice(0, 10);
  const predictions = allPredictions();
  const minWeek = upcomingWeek(predictions);

  return predictions
    .filter(p => {
      if (minWeek && p.game.week !== minWeek) return false;
      if (p.game.date < today) return false;
      const conf = pickConf(p);
      if (type === 'elite') return conf === 'elite';
      if (type === 'high')  return conf === 'high';
      return conf === 'elite' || conf === 'high';
    })
    .map(p => {
      const { game, prediction: pred } = p;
      const tp  = game.gamePreview && game.gamePreview.thePick;
      const sp  = pred.spreadPick || {};
      const bl  = game.bettingLines || {};
      const si  = game.socialIntel || {};
      const pb  = si.publicBetting || {};

      const conf       = pickConf(p);
      const pickTeam   = (tp && tp.team) ? tp.team : (sp.side === 'home' ? game.homeTeam.name : game.awayTeam.name);
      const pickIsHome = pickTeam.toLowerCase() === (game.homeTeam.name || '').toLowerCase();
      const vegasLine  = bl.spread != null ? (pickIsHome ? bl.spread : -bl.spread) : null;
      const smSig      = pred.sharpMoneySignal || {};

      return {
        gameId:     game.id,
        week:       game.week,
        date:       game.date,
        time:       game.time,
        network:    game.network,
        homeTeam:   game.homeTeam.name,
        awayTeam:   game.awayTeam.name,
        homeAbbr:   game.homeTeam.abbreviation,
        awayAbbr:   game.awayTeam.abbreviation,
        pickTeam,
        vegasSpread: vegasLine,
        edge:       parseFloat((sp.edge || 0).toFixed(1)),
        winProb:    Math.round(sp.confidence || pred.winProbability || 0),
        conf,
        sharpAligns: smSig.side && smSig.side !== 'neutral' && ((smSig.side === 'home') === pickIsHome),
        publicPct:  (pickIsHome ? pb.homePct : pb.awayPct) != null
                      ? Math.round(pickIsHome ? pb.homePct : pb.awayPct) : null,
        hashHome:   '#' + game.homeTeam.name.replace(/[^a-zA-Z]/g, ''),
        hashAway:   '#' + game.awayTeam.name.replace(/[^a-zA-Z]/g, ''),
        reasoning:  tp && tp.reasoning ? tp.reasoning : null,
      };
    });
}

// ── getTop5 ───────────────────────────────────────────────────────
// Returns top 5 picks for the week ranked by conf tier then edge.
function getTop5() {
  const today = new Date().toISOString().slice(0, 10);
  const predictions = allPredictions();
  const minWeek = upcomingWeek(predictions);
  const confRank = { elite: 3, high: 2, medium: 1, low: 0 };

  return predictions
    .filter(p => {
      if (minWeek && p.game.week !== minWeek) return false;
      return p.game.date >= today;
    })
    .sort((a, b) => {
      const ca = confRank[pickConf(a)] || 0;
      const cb = confRank[pickConf(b)] || 0;
      if (cb !== ca) return cb - ca;
      return (b.prediction.spreadPick?.edge || 0) - (a.prediction.spreadPick?.edge || 0);
    })
    .slice(0, 5)
    .map(p => {
      const { game, prediction: pred } = p;
      const tp  = game.gamePreview && game.gamePreview.thePick;
      const sp  = pred.spreadPick || {};
      const bl  = game.bettingLines || {};
      const si  = game.socialIntel || {};
      const pb  = si.publicBetting || {};

      const conf       = pickConf(p);
      const pickTeam   = (tp && tp.team) ? tp.team : (sp.side === 'home' ? game.homeTeam.name : game.awayTeam.name);
      const pickIsHome = pickTeam.toLowerCase() === (game.homeTeam.name || '').toLowerCase();
      const vegasLine  = bl.spread != null ? (pickIsHome ? bl.spread : -bl.spread) : null;

      return {
        gameId:     game.id,
        week:       game.week,
        date:       game.date,
        time:       game.time,
        network:    game.network,
        homeTeam:   game.homeTeam.name,
        awayTeam:   game.awayTeam.name,
        homeAbbr:   game.homeTeam.abbreviation,
        awayAbbr:   game.awayTeam.abbreviation,
        pickTeam,
        vegasSpread: vegasLine,
        edge:       parseFloat((sp.edge || 0).toFixed(1)),
        winProb:    Math.round(sp.confidence || pred.winProbability || 0),
        conf,
        publicPct:  (pickIsHome ? pb.homePct : pb.awayPct) != null
                      ? Math.round(pickIsHome ? pb.homePct : pb.awayPct) : null,
        hashHome:   '#' + game.homeTeam.name.replace(/[^a-zA-Z]/g, ''),
        hashAway:   '#' + game.awayTeam.name.replace(/[^a-zA-Z]/g, ''),
        reasoning:  tp && tp.reasoning ? tp.reasoning : null,
        total:      bl.total,
        totalPick:  pred.totalPick,
      };
    });
}

// ── getBiggestMatchups ────────────────────────────────────────────
// Top 5 games of the week by excitement score (ranked teams, close
// spread, high public interest) — regardless of whether we have a pick.
function getBiggestMatchups() {
  const today = new Date().toISOString().slice(0, 10);
  const predictions = allPredictions();
  const minWeek = upcomingWeek(predictions);

  return predictions
    .filter(p => {
      if (minWeek && p.game.week !== minWeek) return false;
      return p.game.date >= today;
    })
    .map(p => {
      const { game, prediction: pred } = p;
      const bl  = game.bettingLines || {};
      const pb  = (game.socialIntel || {}).publicBetting || {};

      // Excitement score: ranked teams + close spread + high public interest
      let score = 0;
      if (game.homeApRank) score += Math.max(0, 26 - game.homeApRank) * 2;
      if (game.awayApRank) score += Math.max(0, 26 - game.awayApRank) * 2;
      if (bl.spread != null) score += Math.max(0, 14 - Math.abs(bl.spread)) * 1.5; // closer = better
      if (pb.homePct) score += Math.abs(50 - pb.homePct) * 0.5; // public interest
      if (game.isConferenceGame) score += 8;
      // neutralSite is top-level in live data; nested in stub data — check both
      if (game.neutralSite || game.situational?.neutralSite) score += 5;

      const tp = game.gamePreview?.thePick;
      return {
        gameId:    game.id,
        week:      game.week,
        date:      game.date,
        time:      game.time,
        network:   game.network,
        homeTeam:  game.homeTeam?.name || game.homeTeamName,
        awayTeam:  game.awayTeam?.name || game.awayTeamName,
        homeAbbr:  game.homeTeam?.abbreviation || game.homeTeamId,
        awayAbbr:  game.awayTeam?.abbreviation || game.awayTeamId,
        homeRank:  game.homeApRank || null,
        awayRank:  game.awayApRank || null,
        spread:    bl.spread,
        total:     bl.total,
        publicPct: pb.homePct || null,
        ourPick:   tp?.team || null,
        ourConf:   tp?.confidence || null,
        isConf:    game.isConferenceGame,
        excitementScore: score,
        hashHome:  '#' + (game.homeTeam?.name || '').replace(/[^a-zA-Z]/g, ''),
        hashAway:  '#' + (game.awayTeam?.name || '').replace(/[^a-zA-Z]/g, ''),
      };
    })
    .sort((a, b) => b.excitementScore - a.excitementScore)
    .slice(0, 5);
}

// ── getLocks ──────────────────────────────────────────────────────
// Top 5 highest-confidence picks — the "money plays" with highest
// win probability and edge. These are the ones to bet.
function getLocks() {
  const today = new Date().toISOString().slice(0, 10);
  const predictions = allPredictions();
  const minWeek = upcomingWeek(predictions);

  return predictions
    .filter(p => {
      if (minWeek && p.game.week !== minWeek) return false;
      if (p.game.date < today) return false;
      const conf = pickConf(p);
      if (conf !== 'elite' && conf !== 'high') return false;
      // Must have genuine edge — cover prob ≥ 55% AND at least 1pt model edge.
      // A 50%/0-edge pick is a coin flip; calling it a "lock" is misleading.
      const sp = p.prediction.spreadPick || {};
      const prob = modelProb(p, sp.side || 'home') * 100;
      const edge = sp.edge || 0;
      return prob >= 55 && edge >= 1;
    })
    .sort((a, b) => {
      // Sort by win prob first, then edge
      const aProb = modelProb(a, a.prediction.spreadPick?.side || 'home') * 100;
      const bProb = modelProb(b, b.prediction.spreadPick?.side || 'home') * 100;
      if (Math.abs(bProb - aProb) > 2) return bProb - aProb;
      return (b.prediction.spreadPick?.edge || 0) - (a.prediction.spreadPick?.edge || 0);
    })
    .slice(0, 5)
    .map(p => {
      const { game, prediction: pred } = p;
      const tp  = game.gamePreview?.thePick;
      const sp  = pred.spreadPick || {};
      const bl  = game.bettingLines || {};
      const si  = game.socialIntel || {};
      const pb  = si.publicBetting || {};
      const pickIsHome = (tp?.team || '').toLowerCase() === (game.homeTeam?.name || '').toLowerCase();
      const pickTeam   = tp?.team || (sp.side === 'home' ? game.homeTeam?.name : game.awayTeam?.name);
      const vegasLine  = bl.spread != null ? (pickIsHome ? bl.spread : -bl.spread) : null;
      const winProb    = Math.round(modelProb(p, sp.side || 'home') * 100);

      return {
        gameId:     game.id,
        week:       game.week,
        date:       game.date,
        time:       game.time,
        network:    game.network,
        homeTeam:   game.homeTeam?.name,
        awayTeam:   game.awayTeam?.name,
        homeAbbr:   game.homeTeam?.abbreviation,
        awayAbbr:   game.awayTeam?.abbreviation,
        pickTeam,
        vegasSpread: vegasLine,
        edge:       parseFloat((sp.edge || 0).toFixed(1)),
        winProb,
        conf:       pickConf(p),
        sharpAligns: (pred.sharpMoneySignal?.side && pred.sharpMoneySignal.side !== 'neutral' &&
                     (pred.sharpMoneySignal.side === 'home') === pickIsHome),
        publicPct:  (pickIsHome ? pb.homePct : pb.awayPct) != null
                      ? Math.round(pickIsHome ? pb.homePct : pb.awayPct) : null,
        reasoning:  tp?.reasoning || null,
        hashHome:   '#' + (game.homeTeam?.name || '').replace(/[^a-zA-Z]/g, ''),
        hashAway:   '#' + (game.awayTeam?.name || '').replace(/[^a-zA-Z]/g, ''),
      };
    });
}

// ── getParlays ────────────────────────────────────────────────────
// Returns top 3 optimal parlay combos (mirrors parlay.html logic).
function getParlays(legCount = 3) {
  const today = new Date().toISOString().slice(0, 10);
  const predictions = allPredictions();
  const minWeek = upcomingWeek(predictions);

  // Build pool — same logic as renderOptimalSuggestions in parlay.html
  const pool = [];
  const confWeights = { elite: 4, high: 3 };

  predictions
    .filter(p => minWeek ? p.game.week === minWeek : true)
    .filter(p => p.game.date >= today)
    .forEach(p => {
      const { game, prediction: pred } = p;
      const tp  = game.gamePreview && game.gamePreview.thePick;
      const sp  = pred.spreadPick || {};
      const bl  = game.bettingLines || {};

      if (tp && tp.team && tp.confidence) {
        const conf     = tp.confidence.toLowerCase();
        if (conf !== 'elite' && conf !== 'high') return;
        const pickIsHome = tp.team.toLowerCase() === (game.homeTeam.name || '').toLowerCase();
        const side     = pickIsHome ? 'home' : 'away';
        const odds     = pickIsHome ? (bl.homeSpreadOdds || -110) : (bl.awaySpreadOdds || -110);
        const spProb   = modelProb(p, side);
        pool.push({
          label:       `${tp.team} covers`,
          teamAbbr:    pickIsHome ? game.homeTeam.abbreviation : game.awayTeam.abbreviation,
          matchup:     `${game.awayTeam.abbreviation} @ ${game.homeTeam.abbreviation}`,
          odds,
          spProb,
          conf,
          confWeight:  confWeights[conf] || 2,
          week:        game.week,
          date:        game.date,
          time:        game.time,
          network:     game.network,
        });
      } else if (sp.side && sp.side !== 'no-bet' && (sp.edge || 0) >= 2.5) {
        const side     = sp.side;
        const team     = side === 'home' ? game.homeTeam : game.awayTeam;
        const odds     = side === 'home' ? (bl.homeSpreadOdds || -110) : (bl.awaySpreadOdds || -110);
        const spProb   = modelProb(p, side);
        pool.push({
          label:       `${team.name} covers`,
          teamAbbr:    team.abbreviation,
          matchup:     `${game.awayTeam.abbreviation} @ ${game.homeTeam.abbreviation}`,
          odds,
          spProb,
          conf:        'model',
          confWeight:  2,
          week:        game.week,
          date:        game.date,
          time:        game.time,
          network:     game.network,
        });
      }
    });

  pool.sort((a, b) => b.confWeight - a.confWeight || b.spProb - a.spProb);
  const top = pool.slice(0, 8);
  if (top.length < legCount) return [];

  // Generate all C(n, legCount) combinations
  function combinate(arr, r) {
    const results = [];
    function helper(start, curr) {
      if (curr.length === r) { results.push([...curr]); return; }
      for (let i = start; i <= arr.length - (r - curr.length); i++) {
        curr.push(arr[i]); helper(i + 1, curr); curr.pop();
      }
    }
    helper(0, []);
    return results;
  }

  return combinate(top, legCount)
    .map(legs => {
      const combinedWinP = legs.reduce((acc, l) => acc * l.spProb, 1);
      const parlay       = calcParlayOdds(legs.map(l => l.odds));
      const payout       = parlay.decimal * 100 - 100;
      const ev           = combinedWinP * payout - (1 - combinedWinP) * 100;
      const eliteBonus   = legs.filter(l => l.conf === 'elite').length * 5;
      const score        = combinedWinP * 100 + eliteBonus + Math.max(ev, 0) * 0.3;
      return { legs, combinedWinP, parlay, ev, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((combo, i) => ({
      rank:       i + 1,
      legs:       combo.legs,
      winPct:     Math.round(combo.combinedWinP * 100),
      american:   combo.parlay.american > 0 ? `+${combo.parlay.american}` : `${combo.parlay.american}`,
      ev:         parseFloat(combo.ev.toFixed(1)),
      legCount,
    }));
}

// Returns ALL picks including past weeks (for results matching)
function getPastPicks() {
  const predictions = allPredictions();
  return predictions
    .filter(p => {
      const conf = pickConf(p);
      return conf === 'elite' || conf === 'high';
    })
    .map(p => {
      const { game, prediction: pred } = p;
      const tp  = game.gamePreview && game.gamePreview.thePick;
      const sp  = pred.spreadPick || {};
      const bl  = game.bettingLines || {};
      const conf       = pickConf(p);
      const pickTeam   = (tp && tp.team) ? tp.team : (sp.side === 'home' ? game.homeTeam.name : game.awayTeam.name);
      const pickIsHome = pickTeam.toLowerCase() === (game.homeTeam.name || '').toLowerCase();
      const vegasLine  = bl.spread != null ? (pickIsHome ? bl.spread : -bl.spread) : null;
      return {
        gameId:     game.id,
        week:       game.week,
        date:       game.date,
        time:       game.time,
        network:    game.network,
        homeTeam:   game.homeTeam.name,
        awayTeam:   game.awayTeam.name,
        homeAbbr:   game.homeTeam.abbreviation,
        awayAbbr:   game.awayTeam.abbreviation,
        pickTeam,
        vegasSpread: vegasLine,
        conf,
        hashHome:   '#' + game.homeTeam.name.replace(/[^a-zA-Z]/g, ''),
        hashAway:   '#' + game.awayTeam.name.replace(/[^a-zA-Z]/g, ''),
        reasoning:  tp && tp.reasoning ? tp.reasoning : null,
      };
    });
}

module.exports = { getPicks, getTop5, getParlays, getPastPicks, getBiggestMatchups, getLocks };
