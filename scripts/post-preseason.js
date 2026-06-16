#!/usr/bin/env node
/* post-preseason.js — preseason tweet generator for @TheBetCFB
   Covers all ~130 FBS teams. Opinion-first, data-backed.

   Angles:
     --angle intro        Account intro tweets (manual/launch only — never auto-scheduled)
     --angle team         Spotlight on a specific team  --team "Boise State"
     --angle sleepers     Top sleeper picks
     --angle fades        Overrated teams to avoid
     --angle ats-value    Situational ATS trends
     --angle portal       Transfer portal winners
     --angle momentum     Rising vs declining programs
     --angle conference   Conference preview  --conf "Big Ten"
     --angle hot-takes    Bold predictions for any team
     --angle rotate       Rotate through all teams (offset with --offset N)
     --calendar           Print full preseason content calendar

   Flags:
     --dry-run            Print tweets, don't post
     --count N            How many tweets to generate (default 1)
*/

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');
// twitter-api-v2 loaded lazily below (only when not dry-run)

const ROOT = path.join(__dirname, '..');
const JS   = f => fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');

// ── Load all team data ───────────────────────────────────────────────────────
const sandbox = {
  console, Math, Date, parseInt, parseFloat, isNaN, Array, Object, JSON,
  window: { TEAM_INTEL: {} },
};
vm.runInNewContext(JS('data.js'), sandbox);
vm.runInNewContext(JS('data-fbs-stubs.js'), sandbox);

const ALL_TEAMS = Object.values(sandbox.TEAMS || {}).filter(t => t.conference !== 'FCS');

// ── Apply live data overrides ────────────────────────────────────────────────
(function applyLiveOverrides() {
  let liveApRanks = {};
  try {
    const extras = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'team-extras.json'), 'utf8'));
    if (extras.apRanks && Object.keys(extras.apRanks).length >= 5) liveApRanks = extras.apRanks;
  } catch (_) {}

  if (!Object.keys(liveApRanks).length) {
    try {
      const gamesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'games-2026.json'), 'utf8'));
      liveApRanks = gamesData.apRanks || {};
    } catch (_) {}
  }

  if (Object.keys(liveApRanks).length) {
    ALL_TEAMS.forEach(t => {
      if (!t.id) return;
      if (liveApRanks[t.id] != null) t.apRank = liveApRanks[t.id];
      else if (Object.keys(liveApRanks).length >= 25) t.apRank = null;
    });
    console.log(`[LIVE] AP ranks loaded (${Object.keys(liveApRanks).length} ranked)`);
  }

  try {
    const extras = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'team-extras.json'), 'utf8'));
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    const spList = extras.spRatings || [];
    if (spList.length) {
      const spById   = Object.fromEntries(spList.filter(e => e.id).map(e => [e.id, e.rating]));
      const spByName = Object.fromEntries(spList.map(e => [norm(e.team), e.rating]));
      ALL_TEAMS.forEach(t => {
        const rating = spById[t.id] ?? spByName[norm(t.name || '')];
        if (rating != null) t.spRating = rating;
      });
      console.log(`[LIVE] SP+ ratings loaded (${spList.length} teams)`);
    }

    const cmap = extras.coachMap || {};
    if (Object.keys(cmap).length) {
      ALL_TEAMS.forEach(t => {
        const entry = cmap[t.id] || cmap[t.name] || cmap[Object.keys(cmap).find(k => norm(k) === norm(t.name || '')) || ''];
        if (entry) {
          if (entry.name) t.coachName = entry.name;
          if (entry.record) t.coachRecord = entry.record;
        }
      });
      console.log(`[LIVE] Coach data loaded (${Object.keys(cmap).length} coaches)`);
    }

    const atsMap = extras.atsRecords || {};
    if (Object.keys(atsMap).length) {
      ALL_TEAMS.forEach(t => {
        const entry = atsMap[t.id] || atsMap[t.name] || atsMap[Object.keys(atsMap).find(k => norm(k) === norm(t.name || '')) || ''];
        if (entry && entry.wins + entry.losses >= 4) {
          t.atsRecord = entry;
          if (entry.home || entry.away || entry.fav || entry.dog) {
            if (!t.situational) t.situational = {};
            if (entry.home && entry.home.wins + entry.home.losses >= 3) t.situational.atsHome      = entry.home;
            if (entry.away && entry.away.wins + entry.away.losses >= 3) t.situational.atsAway      = entry.away;
            if (entry.fav  && entry.fav.wins  + entry.fav.losses  >= 3) t.situational.atsFavorite  = entry.fav;
            if (entry.dog  && entry.dog.wins  + entry.dog.losses  >= 3) t.situational.atsUnderdog  = entry.dog;
          }
        }
      });
      console.log(`[LIVE] ATS records loaded (${Object.keys(atsMap).length} teams)`);
    }

    const buzz = extras.redditBuzz || {};
    if (Object.keys(buzz).length) {
      ALL_TEAMS.forEach(t => {
        if (!t.id || !buzz[t.id]) return;
        const s = buzz[t.id].sentiment;
        if (s && t.programHealth) {
          t.programHealth.programMomentum =
            s === 'positive' ? 'rising' : s === 'negative' ? 'declining' : 'stable';
        }
      });
      console.log(`[LIVE] Momentum loaded from Reddit buzz (${Object.keys(buzz).length} teams)`);
    }
  } catch (_) {}
}());

const sorted   = [...ALL_TEAMS].sort((a, b) => b.rating - a.rating);
const _rankMap  = new Map(sorted.map((t, i) => [t.id, i + 1]));
const modelRank = t => _rankMap.get(t.id) || Math.max(1, Math.round((100 - t.rating) * 1.5) + 1);

// ── Deterministic daily RNG ──────────────────────────────────────────────────
// Same-day runs always pick identical teams. Seed changes each day.
const _daySeed = (() => {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let s = parseInt(d, 10) % 2147483647 || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
})();

// ── Team news (from live Google News pipeline in team-extras.json) ───────────
// Used to drive news-first hot takes and boost teams with active story lines.
const _teamNews = {};
try {
  const extras = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'team-extras.json'), 'utf8'));
  Object.assign(_teamNews, extras.teamNews || {});
} catch {}

function getNewsItems(teamId) {
  return (_teamNews[teamId] || []).filter(n => n.sentiment === 'critical' || n.sentiment === 'negative');
}

// ── Post-history deduplication (21-day cooldown per team × angle) ────────────
// Prevents the same team from appearing in the same angle within 3 weeks.
// Stored in data/post-history.json and committed after each successful post.
const HISTORY_FILE = path.join(ROOT, 'data', 'post-history.json');
const HISTORY_MS   = 21 * 86400000;

let _history = [];
try {
  const raw = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  const cutoff = Date.now() - HISTORY_MS;
  _history = (raw.entries || []).filter(e => new Date(e.ts).getTime() > cutoff);
} catch {}

function wasPostedRecently(teamId, angle) {
  return _history.some(e => e.id === teamId && e.a === angle);
}

// Call after posting — records team IDs + angle so next run skips them.
// Written to file by main() on successful post.
let _pendingHistory = [];
function markPosted(teams, angle) {
  const ts = new Date().toISOString();
  _pendingHistory.push(...teams.filter(t => t?.id).map(t => ({ id: t.id, a: angle, ts })));
}
function flushHistory() {
  if (!_pendingHistory.length) return;
  const all = [..._history, ..._pendingHistory].slice(-1000);
  try { fs.writeFileSync(HISTORY_FILE, JSON.stringify({ updated: new Date().toISOString(), entries: all })); } catch (e) { console.warn('post-history write failed:', e.message); }
}
const fit = (core, extras, max = 280) => {
  let t = core;
  for (const p of extras) if (p && (t + p).length <= max) t += p;
  return t.trim();
};

const toHashtag = name => '#' + (name || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-zA-Z0-9]/g, '');

const pct  = n  => `${Math.round(n * 100)}%`;
const winProjFromRating = (r, games = 12) => {
  const prob = 1 / (1 + Math.exp(-(r - 70) / 10));
  const wins = Math.round(prob * games);
  return `${wins}-${games - wins}`;
};

const vibe = (t) => {
  const m = t.programHealth?.programMomentum || 'stable';
  const r = t.rating;
  if (m === 'rising' && r >= 85) return 'is built for a deep run';
  if (m === 'rising' && r >= 78) return 'is quietly becoming dangerous';
  if (m === 'rising') return 'is trending in the right direction';
  if (m === 'declining' && r >= 80) return 'is living on reputation right now';
  if (m === 'declining') return 'needs to prove it this season';
  if (r >= 88) return 'is the real deal';
  if (r >= 80) return 'is underrated by the market';
  return 'has something to prove';
};

const coachTake = (t) => {
  const hs = t.programHealth?.coachHotSeat || 0;
  if (!t.coachName) return null;
  if (hs >= 7) return `${t.coachName} is coaching for his job.`;
  if (hs >= 5) return `${t.coachName} needs a bounce-back year.`;
  if (t.programHealth?.programMomentum === 'rising') return `${t.coachName} has this program rolling.`;
  return null;
};

// ── Tweet builders ────────────────────────────────────────────────────────────

function buildTeamSpotlight(t) {
  const wins = winProjFromRating(t.rating);
  const mood = vibe(t);
  const coach = coachTake(t);
  const apLine = t.apRank ? ` AP #${t.apRank}.` : '';
  const portalLine = (t.programHealth?.transferPortalRating || 0) >= 82
    ? `\nPortal grade: ${t.programHealth.transferPortalRating}/100 — they upgraded this offseason.` : '';
  const atsLine = t.atsRecord
    ? `\nHistorical ATS: ${pct(t.atsRecord.pct)} (${t.atsRecord.wins}-${t.atsRecord.losses})` : '';
  return fit(
    `📊 ${t.name.toUpperCase()}\n${t.conference} · ${mood}\n`,
    [`Model: ${t.rating}/100 · SP+: ${t.spRating > 0 ? '+' : ''}${t.spRating}`, apLine,
     `\nProjected wins: ${wins}`, portalLine, atsLine,
     coach ? `\n${coach}` : '', `\n\n#CFB ${toHashtag(t.name)} #TheBet`]
  );
}

function buildHotTake(t) {
  const r = t.rating, ap = t.apRank, m = t.programHealth?.programMomentum || 'stable';
  const coach = t.coachName || 'their staff';
  const wins = winProjFromRating(r), iRank = modelRank(t);
  const hs = t.programHealth?.coachHotSeat || 0;

  // If the team has live news (gambling, suspension, controversy, injury, etc.) lead with that.
  // This is the primary freshness driver — static data can't compete with real headlines.
  const ni = getNewsItems(t.id || '');
  if (ni.length) {
    const top = ni[0];
    const isBreaking = top.sentiment === 'critical';
    const emoji = isBreaking ? '🚨' : '📰';
    const headline = top.report.length > 100 ? top.report.slice(0, 97) + '…' : top.report;
    const rankLine = ap ? `AP #${ap} | Model: #${iRank}` : `Model rank: #${iRank}`;
    return fit(
      `${emoji} ${t.name}: ${headline}\n\n`,
      [`${rankLine} · Rating: ${r}/100`,
       m !== 'stable' ? `\nMomentum: ${m.toUpperCase()}` : '',
       hs >= 5 ? `\nCoach hot seat: ${hs}/10` : '',
       `\n\n${isBreaking ? 'This changes the calculus on this program for 2026.' : 'Something to factor into your lines this season.'}\n\n#CFB ${toHashtag(t.name)} #TheBet`]
    );
  }

  const takes = [];
  if (ap && iRank < ap - 3)
    takes.push(`🔥 HOT TAKE: ${t.name} is more dangerous than their AP ranking suggests.\n\nAP: #${ap} | Our model: #${iRank}\n\nThe gap doesn't lie. ${t.name} is being underpriced by the market going into 2026.\n\n#CFB ${toHashtag(t.name)} #TheBet`);
  if (ap && iRank > ap + 3)
    takes.push(`⚠️ FADE ALERT: ${t.name} is overrated.\n\nAP: #${ap} | Our model: #${iRank}\n\nThe hype is ahead of the production. Be careful laying juice on this program early in the season.\n\n#CFB ${toHashtag(t.name)} #TheBet`);
  if (m === 'rising' && r < 80)
    takes.push(`📈 ${t.name} is this year's "where did they come from?"\n\nModel rating: ${r}/100 and trending UP.\n${coach} has quietly built something here. Don't sleep on them.\n\nProjected wins: ${wins}\n\n#CFB ${toHashtag(t.name)} #TheBet`);
  if (m === 'declining' && r >= 75)
    takes.push(`📉 ${t.name} — the fall is coming.\n\nProgram momentum: DECLINING. Rating: ${r}/100.\nThey'll still have wins, but ATS they're a trap every week.\n\nFade them as a heavy favorite.\n\n#CFB ${toHashtag(t.name)} #TheBet`);
  if (hs >= 7)
    takes.push(`🔥 ${t.name} is a powder keg.\n\n${coach} is on the hottest seat in ${t.conference}.\nCoach hot seat: ${hs}/10.\n\nA slow start and this program is in chaos. Bet accordingly.\n\n#CFB ${toHashtag(t.name)} #TheBet`);
  if (!takes.length)
    takes.push(`📊 The model on ${t.name}:\n\nRating: ${r}/100 · ${t.conference}\nMomentum: ${m}\nProjected wins: ${wins}\n\n${r >= 78 ? "There's real value here if the line is right." : 'Bet the talent, not the brand.'}\n\n#CFB ${toHashtag(t.name)} #TheBet`);
  return takes[0];
}

// ── Angle generators ──────────────────────────────────────────────────────────

function tweetIntro() {
  return [
    `🏈 @TheBetCFB is live.\n\nAI-powered CFB model covering ALL 130+ FBS programs.\nEvery fan. Every conference. Every team.\n\nWe post:\n📊 Weekly picks (Tuesday)\n🏆 Top 5 thread\n💰 Parlay card\n🔒 Final locks\n📈 Results Sunday\n\nAll free. All model-backed. Follow now.\n\n#CFB #TheBet`,
    `Most CFB betting accounts only talk about the blue bloods.\n\nWe cover EVERYONE.\n\nArkansas? Yep.\nBoise State? Yep.\nMarshall? Absolutely.\n\nEvery team gets a shot in our model. No favorites.\n\nrfisher55.github.io/The-bet\n\n#CFB #TheBet`,
    `💡 How our model works:\n\n✅ SP+ ratings for all 130 FBS teams\n✅ Transfer portal grades\n✅ Coaching momentum scores\n✅ ATS situational trends\n✅ Line movement tracking\n✅ Weather edges\n\nWe turn all that into picks every Tuesday.\n\nFree. Transparent. Let the data cook.\n\n#CFB #TheBet`,
  ];
}

function tweetSleepers(count = 5) {
  const pool = sorted
    .filter(t => { const mr = modelRank(t); return t.apRank ? (t.apRank - mr) >= 4 : (t.rating >= 78 && mr <= 25); })
    .sort((a, b) => { const ag = a.apRank ? (a.apRank - modelRank(a)) : 0, bg = b.apRank ? (b.apRank - modelRank(b)) : 0; return ag !== bg ? bg - ag : modelRank(a) - modelRank(b); });
  // Skip teams tweeted about in this angle within 21 days; fall back to full pool if too few remain
  const eligible = pool.filter(t => !wasPostedRecently(t.id, 'sleepers'));
  const list = (eligible.length >= count ? eligible : pool).slice(0, count);
  markPosted(list, 'sleepers');
  return list.map(t => {
    const mr = modelRank(t), hasRank = t.apRank != null;
    return fit(
      `🔍 SLEEPER: ${t.name}\n\nModel rank: #${mr} | AP: ${hasRank ? '#' + t.apRank : 'unranked'}${hasRank ? `\nHidden by ${t.apRank - mr} spots in the AP poll.` : `\nNot in the AP Top 25 — but should be.`}\n\nRating: ${t.rating}/100 · Momentum: ${t.programHealth?.programMomentum || 'stable'}`,
      [t.programHealth?.transferPortalRating > 45 ? `\nPortal: ${t.programHealth.transferPortalRating}/100` : null,
       `\nProjected wins: ${winProjFromRating(t.rating)}`,
       `\n\nThe market hasn't caught up yet. Book it.\n\n#CFB ${toHashtag(t.name)} #TheBet`]
    );
  });
}

function tweetFades(count = 5) {
  const pool = sorted
    .filter(t => t.apRank && (modelRank(t) - t.apRank) >= 3)
    .sort((a, b) => (modelRank(b) - (b.apRank || 99)) - (modelRank(a) - (a.apRank || 99)));
  const eligible = pool.filter(t => !wasPostedRecently(t.id, 'fades'));
  const list = (eligible.length >= count ? eligible : pool).slice(0, count);
  markPosted(list, 'fades');
  return list.map(t => fit(
    `⚠️ FADE: ${t.name} (AP #${t.apRank})\n\nModel rank: #${modelRank(t)}\nOvervalued by ${modelRank(t) - t.apRank} spots.`,
    [t.programHealth?.programMomentum === 'declining' ? `\n📉 Program momentum: DECLINING` : '',
     `\nCoach hot seat: ${t.programHealth?.coachHotSeat || 0}/10`,
     `\nATS as favorite: ${t.situational?.atsFavorite ? pct(t.situational.atsFavorite.pct) : 'limited data'}`,
     `\n\nThe AP ballot is wrong. The model is not.\n\n#CFB ${toHashtag(t.name)} #TheBet`]
  ));
}

function tweetPortal(count = 6) {
  const pool = [...ALL_TEAMS]
    .filter(t => (t.programHealth?.transferPortalRating || 0) >= 80)
    .sort((a, b) => (b.programHealth?.transferPortalRating || 0) - (a.programHealth?.transferPortalRating || 0));
  const eligible = pool.filter(t => !wasPostedRecently(t.id, 'portal'));
  const list = (eligible.length >= count ? eligible : pool).slice(0, count);
  markPosted(list, 'portal');
  return list.map((t, i) => fit(
    `${i === 0 ? '🏆' : i <= 2 ? '🔥' : '📈'} PORTAL WIN: ${t.name}\n\nTransfer grade: ${t.programHealth.transferPortalRating}/100\nNIL war chest: ${t.programHealth?.nilStrength || 0}/100\nMomentum: ${t.programHealth?.programMomentum || 'stable'}`,
    [`\nRating: ${t.rating}/100`, `\nProjected wins: ${winProjFromRating(t.rating)}`,
     `\n\nThey won the offseason. Now let's see if they win the season.\n\n#CFB #TransferPortal ${toHashtag(t.name)} #TheBet`]
  ));
}

function tweetATSValue() {
  const tweets = [];
  const dogs = [...ALL_TEAMS].filter(t => (t.situational?.atsUnderdog?.pct || 0) >= 0.60)
    .sort((a, b) => b.situational.atsUnderdog.pct - a.situational.atsUnderdog.pct).slice(0, 5);
  if (dogs.length) {
    tweets.push(fit(`🐶 UNDERDOG KINGS — these teams cover when they're supposed to lose:\n\n${dogs.map(t => `${t.name}: ${pct(t.situational.atsUnderdog.pct)} (${t.situational.atsUnderdog.wins}-${t.situational.atsUnderdog.losses})`).join('\n')}`,
      [`\n\nBack them as dogs all season. The model doesn't lie.\n\n#CFB #ATS #TheBet`]));
  }
  const bouncebacks = [...ALL_TEAMS].filter(t => (t.situational?.afterLoss?.pct || 0) >= 0.72)
    .sort((a, b) => b.situational.afterLoss.pct - a.situational.afterLoss.pct).slice(0, 5);
  if (bouncebacks.length) {
    tweets.push(fit(`💪 BOUNCE-BACK TEAMS — buy them the week after a loss:\n\n${bouncebacks.map(t => `${t.name}: ${pct(t.situational.afterLoss.pct)} ATS after a loss`).join('\n')}`,
      [`\n\nElite programs respond. These are the ones to back when they're down.\n\n#CFB #ATS #TheBet`]));
  }
  const homeTeams = [...ALL_TEAMS].filter(t => (t.situational?.atsHome?.pct || 0) >= 0.65)
    .sort((a, b) => b.situational.atsHome.pct - a.situational.atsHome.pct).slice(0, 5);
  if (homeTeams.length) {
    tweets.push(fit(`🏠 HOME FIELD LOCKS — these teams print money at home:\n\n${homeTeams.map(t => `${t.name}: ${pct(t.situational.atsHome.pct)} ATS at home`).join('\n')}`,
      [`\n\nSchedule a trip to any of these stadiums and the host covers.\n\n#CFB #ATS #TheBet`]));
  }
  return tweets;
}

function tweetConference(confFilter, count = 1) {
  const confs = confFilter ? [confFilter]
    : ['SEC', 'Big Ten', 'Big 12', 'ACC', 'Mountain West', 'Sun Belt', 'MAC',
       'Conference USA', 'American Athletic', 'FBS Independents', 'Pac-2'];
  return confs.flatMap(conf => {
    const confTeams = [...ALL_TEAMS].filter(t => t.conference === conf)
      .sort((a, b) => b.rating - a.rating).slice(0, count === 1 ? 8 : count);
    if (!confTeams.length) return [];
    const top = confTeams[0];
    const sleeper = confTeams.find(t => t !== top && (t.apRank ? (t.apRank - modelRank(t)) >= 3 : modelRank(t) <= 30));
    const fade = confTeams.find(t => t !== top && t.apRank && (modelRank(t) - t.apRank) >= 3);
    const ranked = confTeams.slice(0, 6).map((t, i) =>
      `${i + 1}. ${t.name} (${t.rating}/100${t.apRank ? ` · AP #${t.apRank}` : ''})`).join('\n');
    return [fit(
      `📊 ${conf.toUpperCase()} POWER RANKINGS\nModel, not vibes\n\n${ranked}`,
      [sleeper ? `\n\n🔍 Sleeper: ${sleeper.name}` : '', fade ? `\n⚠️ Fade: ${fade.name}` : '',
       `\n\nFull breakdown: rfisher55.github.io/The-bet\n\n#CFB ${toHashtag(conf)} #TheBet`]
    )];
  });
}

function tweetMomentum() {
  const rising = [...ALL_TEAMS].filter(t => t.programHealth?.programMomentum === 'rising').sort((a, b) => b.rating - a.rating);
  const declining = [...ALL_TEAMS].filter(t => t.programHealth?.programMomentum === 'declining' && (t.rating || 0) >= 72).sort((a, b) => b.rating - a.rating);
  const tweets = [];
  if (rising.length) tweets.push(fit(
    `🚀 RISING PROGRAMS in 2026 — model has these trending UP:\n\n${rising.slice(0, 6).map(t => `📈 ${t.name} (${t.rating}/100 · ${t.conference})`).join('\n')}`,
    [`\n\nBuy before the market catches on. These teams are getting better and Vegas hasn't adjusted.\n\n#CFB #TheBet`]
  ));
  if (declining.length) tweets.push(fit(
    `⚠️ DECLINING PROGRAMS — model flags these as overvalued in 2026:\n\n${declining.slice(0, 6).map(t => `📉 ${t.name} — hot seat: ${t.programHealth?.coachHotSeat || 0}/10`).join('\n')}`,
    [`\n\nBe careful giving these programs money early in the year. The hype hasn't met the results.\n\n#CFB #TheBet`]
  ));
  return tweets;
}

function tweetHotTakes(count = 5) {
  const scored = [...ALL_TEAMS].map(t => {
    const iRank = modelRank(t), r = t.rating || 70, m = t.programHealth?.programMomentum || 'stable', hs = t.programHealth?.coachHotSeat || 0;
    const ni = getNewsItems(t.id || '');
    // News-first: critical news (gambling, arrest, suspension) gets heavy boost so the account
    // always covers breaking stories before generic model takes.
    const newsBoost = ni.some(n => n.sentiment === 'critical') ? 10 : ni.length ? 4 : 0;
    // Penalize teams already featured in this angle within 21 days.
    const recentPenalty = wasPostedRecently(t.id, 'hot-takes') ? -6 : 0;
    let score = _daySeed() * 0.5;
    if (t.apRank && Math.abs(iRank - t.apRank) >= 3) score += 3;
    if (m === 'rising' && r < 80) score += 2;
    if (m === 'declining' && r >= 75) score += 2;
    if (hs >= 7) score += 2;
    score += newsBoost + recentPenalty;
    return { t, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const list = scored.slice(0, count).map(({ t }) => t);
  markPosted(list, 'hot-takes');
  return list.map(t => buildHotTake(t));
}

function tweetRotate(offset = 0, count = 5) {
  // Start at offset, then skip any teams featured in this angle within 21 days.
  // Wrap around the full sorted list if needed so we always get `count` tweets.
  const base = [...sorted.slice(offset), ...sorted.slice(0, offset)]; // wrap-around rotation
  const eligible = base.filter(t => !wasPostedRecently(t.id, 'rotate'));
  const list = (eligible.length >= count ? eligible : base).slice(0, count);
  markPosted(list, 'rotate');
  return list.map(buildTeamSpotlight);
}

function tweetTeam(nameQuery) {
  const q = nameQuery.toLowerCase();
  const t = ALL_TEAMS.find(t => t.name.toLowerCase().includes(q) || (t.abbreviation || '').toLowerCase() === q || t.id?.toLowerCase().includes(q.replace(/\s/g,'_')));
  if (!t) return [`Team not found: "${nameQuery}". Check the name and try again.`];
  return [buildTeamSpotlight(t), buildHotTake(t)];
}

function printCalendar() {
  const cal = [
    { week: 'May 26 – Jun 1',  theme: 'Launch Week',           posts: ['intro ×3 (manual only)', 'how the model works', 'G5 fan shoutout'] },
    { week: 'Jun 2 – Jun 8',   theme: 'Conference Power Rankings', posts: ['SEC', 'Big Ten', 'Big 12', 'ACC + G5'] },
    { week: 'Jun 9 – Jun 15',  theme: 'Sleepers',              posts: ['top 5 sleepers', 'team spotlight ×2', 'G5 sleeper'] },
    { week: 'Jun 16 – Jun 22', theme: 'Fade Candidates',       posts: ['top 5 fades', 'hot take: overrated team', 'declining programs'] },
    { week: 'Jun 23 – Jun 29', theme: 'ATS Value',             posts: ['underdog kings', 'bounce-back teams', 'home field locks'] },
    { week: 'Jun 30 – Jul 6',  theme: 'Transfer Portal',       posts: ['portal winners ×2', 'NIL leaders', 'team spotlight'] },
    { week: 'Jul 7 – Jul 13',  theme: 'Program Momentum',      posts: ['rising programs', 'declining programs', 'hot takes ×2'] },
    { week: 'Jul 14 – Jul 20', theme: 'Mid-Major Spotlight',   posts: ['Boise State', 'Liberty', 'Tulane', 'UTSA', 'James Madison'] },
    { week: 'Jul 21 – Jul 27', theme: 'Win Total Predictions', posts: ['over candidates', 'under candidates', 'team spotlight ×2'] },
    { week: 'Jul 28 – Aug 3',  theme: 'Dark Horse CFP Picks',  posts: ['CFP sleeper thread', 'conference champ takes', 'team spotlights'] },
    { week: 'Aug 4 – Aug 10',  theme: 'Final Rankings',        posts: ['updated power rankings', 'biggest risers/fallers', 'team spotlights ×2'] },
    { week: 'Aug 11 – Aug 17', theme: 'Week 0/1 Preview',      posts: ['early game previews', 'opening week ATS value', 'team spotlights'] },
    { week: 'Aug 18 – Aug 24', theme: 'Season Hype',           posts: ['bold predictions thread', 'parlay guide', 'how to use the picks'] },
    { week: 'Aug 25 – Sep 1',  theme: '🏈 SEASON LAUNCH',     posts: ['first ELITE picks', 'top 5 thread', 'parlay card', 'polls go live'] },
  ];
  console.log('\n' + '═'.repeat(55));
  console.log('   @TheBetCFB — PRESEASON CONTENT CALENDAR');
  console.log('═'.repeat(55) + '\n');
  cal.forEach(({ week, theme, posts }) => {
    console.log(`📅 ${week}  |  ${theme}`);
    posts.forEach(p => console.log(`   • ${p}`));
    console.log('');
  });
}

// ── CLI ───────────────────────────────────────────────────────────────────────
async function main() {
  const args   = process.argv.slice(2);
  const get    = f => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
  const has    = f => args.includes(f);
  const conf   = get('--conf');
  const team   = get('--team');
  const offset = parseInt(get('--offset') || '0', 10);
  const count  = parseInt(get('--count') || '5', 10);
  const dryRun = has('--dry-run');

  if (has('--calendar')) { printCalendar(); return; }

  // --angle is REQUIRED. No default — prevents silent wrong-angle posts.
  const angle = get('--angle');
  if (!angle) {
    console.error('❌ --angle is required. Auto-schedule must always pass an explicit angle.');
    console.error('   Valid angles: hot-takes conference rotate sleepers fades ats-value portal momentum hot-takes intro team');
    process.exit(1);
  }

  let tweets = [];
  switch (angle) {
    case 'intro':       tweets = tweetIntro(); break;
    case 'team':        tweets = tweetTeam(team || ''); break;
    case 'sleepers':    tweets = tweetSleepers(count); break;
    case 'fades':       tweets = tweetFades(count); break;
    case 'portal':      tweets = tweetPortal(count); break;
    case 'ats-value':   tweets = tweetATSValue(); break;
    case 'conference':  tweets = tweetConference(conf, count); break;
    case 'momentum':    tweets = tweetMomentum(); break;
    case 'hot-takes':   tweets = tweetHotTakes(count); break;
    case 'rotate':      tweets = tweetRotate(offset, count); break;
    default: console.error(`Unknown angle: ${angle}`); process.exit(1);
  }

  if (!tweets.length) { console.log('No tweets generated.'); return; }

  console.log(`\n[${angle.toUpperCase()}] ${tweets.length} tweet(s)${dryRun ? ' — DRY RUN' : ''}\n`);
  tweets.forEach((t, i) => {
    console.log(`── Tweet ${i + 1}/${tweets.length} (${t.length} chars) ──`);
    console.log(t); console.log('');
  });

  if (dryRun) return;

  const { TwitterApi } = require('twitter-api-v2');
  let refreshToken = process.env.X_OAUTH2_REFRESH_TOKEN;
  try {
    const xauth = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'x-auth.json'), 'utf8'));
    if (xauth.refreshToken) refreshToken = xauth.refreshToken;
  } catch {}
  if (!process.env.X_OAUTH2_CLIENT_ID || !process.env.X_OAUTH2_CLIENT_SECRET || !refreshToken) {
    console.error('❌ Missing OAuth credentials. Run x-oauth2-setup workflow to regenerate.');
    process.exit(1);
  }
  const authClient = new TwitterApi({
    clientId:     process.env.X_OAUTH2_CLIENT_ID,
    clientSecret: process.env.X_OAUTH2_CLIENT_SECRET,
  });
  let client;
  try {
    const { client: xClient, refreshToken: newRefresh } = await authClient.refreshOAuth2Token(refreshToken);
    client = xClient;
    if (newRefresh && typeof newRefresh === 'string')
      fs.writeFileSync('/tmp/new_refresh_token', newRefresh, 'utf8');
  } catch (err) {
    console.error(`❌ OAuth token refresh failed: ${err.message}`);
    console.error('Run x-oauth2-setup workflow to regenerate the token.');
    process.exit(1);
  }

  let prevId = null;
  for (let text of tweets) {
    if (text.length > 280) text = text.slice(0, 277) + '...';
    const payload = { text };
    if (prevId) payload.reply = { in_reply_to_tweet_id: prevId };
    const { data } = await client.v2.tweet(payload);
    prevId = data.id;
    console.log(`✅ Posted: https://x.com/TheBetCFB/status/${data.id}`);
    await new Promise(r => setTimeout(r, 1500));
  }

  // Persist post-history so next run skips recently-used teams
  flushHistory();

  // Write success marker — workflow reads this to set postedAt (not updatedAt)
  fs.writeFileSync('/tmp/post_succeeded', new Date().toISOString(), 'utf8');
  console.log('✅ All tweets posted successfully.');
}

main().catch(err => { console.error(err); process.exit(1); });
