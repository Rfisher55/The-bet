#!/usr/bin/env node
/**
 * live-game-alerts.js — Real-time Saturday game coverage for @TheBetCFB
 *
 * Runs every 10 minutes during Saturday game hours (wired into refresh-data.yml).
 * Detects and posts:
 *   - Halftime checks on our picks (covering or trailing)
 *   - Upset alerts (unranked beating ranked, big dogs covering)
 *   - Pick results when games go final (did we cover?)
 *   - Overtime alerts
 *   - Big comeback alerts (team down 17+ stages comeback)
 *
 * State saved in data/live-state.json to avoid duplicate alerts.
 */

const fs   = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');

const ROOT       = path.join(__dirname, '..');
const DATA       = p => path.join(ROOT, 'data', p);
const STATE_FILE = DATA('live-state.json');

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}
function saveState(s) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}
function loadState() {
  return loadJSON(STATE_FILE) || { posted: [], lastScores: {} };
}
function spreadStr(n) {
  if (n == null) return '';
  return n > 0 ? `+${n}` : `${n}`;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Check if our pick is covering based on current score ──────────────────────
function isCovering(game, pickIsHome) {
  const { homeScore, awayScore, bettingLines } = game;
  if (homeScore == null || awayScore == null || !bettingLines?.spread) return null;
  const spread = bettingLines.spread; // negative = home favored
  const margin = homeScore - awayScore;
  // Pick covers if: home pick → margin > -spread; away pick → margin < -spread
  return pickIsHome ? margin > -spread : margin < -spread;
}

function scoreLine(game) {
  const h = game.homeTeamName || game.homeTeamId || 'Home';
  const a = game.awayTeamName || game.awayTeamId || 'Away';
  return `${a} ${game.awayScore ?? '?'} @ ${h} ${game.homeScore ?? '?'}`;
}

function rankStr(rank) { return rank ? `#${rank} ` : ''; }
function tag(name) { return `#${((name||'').replace(/[^a-zA-Z0-9]/g,'') || 'CFB')}`; }

// ── Tweet builders ────────────────────────────────────────────────────────────
function buildHalftimeTweet(game, pick) {
  const covering  = isCovering(game, pick.pickIsHome);
  const score     = scoreLine(game);
  const pickStr   = `${pick.pickTeam} ${spreadStr(pick.spread)}`;
  const status    = covering === true  ? '✅ COVERING' :
                    covering === false ? '⚠️ TRAILING' : '🔄 PUSH';

  return `🏈 HALFTIME — Wk${game.week}\n${score}\n\nTHE BET: ${pickStr}\nStatus: ${status} at the half\n\nSecond half incoming. Stay locked 👀\n\n${tag(game.homeTeamName)} ${tag(game.awayTeamName)} #CFB #TheBet`;
}

function buildFinalTweet(game, pick) {
  const covered   = isCovering(game, pick.pickIsHome);
  const score     = scoreLine(game);
  const pickStr   = `${pick.pickTeam} ${spreadStr(pick.spread)}`;
  const result    = covered === true ? '✅ COVERED' : covered === false ? '❌ MISSED' : '➖ PUSH';
  const emoji     = covered === true ? '💰' : covered === false ? '📉' : '➖';

  return `${emoji} FINAL — Wk${game.week}\n${score}\n\nTHE BET: ${pickStr} → ${result}\n\nFull recap Sunday with season record update.\n\n${tag(game.homeTeamName)} ${tag(game.awayTeamName)} #CFB #TheBet`;
}

function buildUpsetTweet(game) {
  const homeRank  = game.homeApRank;
  const awayRank  = game.awayApRank;
  const score     = scoreLine(game);
  const isFinal   = game.status === 'final';

  // Determine who's pulling the upset
  const homeWin = game.homeScore > game.awayScore;
  let upsetTeam, rankedTeam;
  if (homeWin && awayRank && !homeRank) {
    upsetTeam = game.homeTeamName; rankedTeam = `#${awayRank} ${game.awayTeamName}`;
  } else if (!homeWin && homeRank && !awayRank) {
    upsetTeam = game.awayTeamName; rankedTeam = `#${homeRank} ${game.homeTeamName}`;
  } else {
    upsetTeam = homeWin ? game.homeTeamName : game.awayTeamName;
    rankedTeam = homeWin ? `#${awayRank} ${game.awayTeamName}` : `#${homeRank} ${game.homeTeamName}`;
  }

  const verb = isFinal ? 'UPSETS' : 'LEADING';
  return `🚨 UPSET ${isFinal ? 'ALERT' : 'IN PROGRESS'} — Wk${game.week}\n\n${upsetTeam} ${verb} ${rankedTeam}!\n${score}\n\nCFB chaos is alive. ${isFinal ? 'What a result.' : 'Second half still to play.'}\n\n${tag(game.homeTeamName)} ${tag(game.awayTeamName)} #CFB #TheBet #Upset`;
}

function buildOvertimeTweet(game, pick) {
  const score   = scoreLine(game);
  const pickStr = pick ? `THE BET had ${pick.pickTeam} ${spreadStr(pick.spread)}` : '';
  return `⚡️ OVERTIME — Wk${game.week}\n\n${score} — going to OT!\n${pickStr ? `${pickStr} — pick is LIVE.\n` : ''}\nAnything can happen. 👀\n\n${tag(game.homeTeamName)} ${tag(game.awayTeamName)} #CFB #TheBet #OT`;
}

function buildComebackTweet(game, deficit) {
  const trailing  = game.homeScore < game.awayScore ? game.homeTeamName : game.awayTeamName;
  const leading   = game.homeScore > game.awayScore ? game.homeTeamName : game.awayTeamName;
  const score     = scoreLine(game);
  return `😤 COMEBACK WATCH — Wk${game.week}\n\n${trailing} is down ${deficit} to ${leading}\n${score}\n\nNever count them out. CFB lives in the 4th quarter.\n\n${tag(game.homeTeamName)} ${tag(game.awayTeamName)} #CFB #TheBet`;
}

// ── Get our picks keyed by game id ────────────────────────────────────────────
function getOurPicks() {
  try {
    const { getPicks } = require('./get-picks');
    return getPicks('all').reduce((acc, p) => {
      acc[p.gameId] = {
        pickTeam:   p.pickTeam,
        pickIsHome: p.pickTeam.toLowerCase() === (p.homeTeam || '').toLowerCase(),
        spread:     p.vegasSpread,
        conf:       p.conf,
      };
      return acc;
    }, {});
  } catch { return {}; }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const today  = new Date().toISOString().slice(0, 10);

  const gamesData = loadJSON(DATA('games-2026.json'));
  if (!gamesData?.games?.length) {
    console.log('No games data yet — skipping live alerts');
    return;
  }

  // Reset state on Sundays (clear stale Saturday game data)
  const dayOfWeek = new Date().getDay(); // 0=Sun
  let state = loadState();
  if (dayOfWeek === 0 && state.posted?.length > 0) {
    console.log('Sunday reset — clearing live-state.json');
    state = { posted: [], lastScores: {} };
  }
  const ourPicks  = getOurPicks();
  const alerts    = [];

  for (const game of gamesData.games) {
    if (game.date !== today) continue;
    if (game.status === 'scheduled') continue;

    const gid   = game.id;
    const pick  = ourPicks[gid] || null;
    const prev  = state.lastScores[gid] || {};
    const hS    = game.homeScore ?? 0;
    const aS    = game.awayScore ?? 0;
    const margin = Math.abs(hS - aS);

    // ── Halftime check (score changed and we crossed the half)
    const halfKey = `half|${gid}`;
    if (!state.posted.includes(halfKey) && game.status === 'in_progress') {
      // Treat as halftime if: we have scores, game was previously 0-0 or no score
      const hadScore = (prev.homeScore ?? 0) + (prev.awayScore ?? 0) > 0;
      const hasScore = hS + aS > 0;
      if (pick && hasScore && hadScore && hS + aS >= 14) {
        alerts.push({ key: halfKey, text: buildHalftimeTweet(game, pick) });
      }
    }

    // ── Final result
    const finalKey = `final|${gid}`;
    if (!state.posted.includes(finalKey) && game.status === 'final') {
      if (pick) {
        alerts.push({ key: finalKey, text: buildFinalTweet(game, pick) });
      }
    }

    // ── Upset alert (unranked beating ranked by 7+, or ranked team trailing by 10+)
    const upsetKey = `upset|${gid}`;
    if (!state.posted.includes(upsetKey)) {
      const homeRanked = !!game.homeApRank;
      const awayRanked = !!game.awayApRank;
      const homeLeading = hS > aS;
      const isUpset = (homeRanked && !awayRanked && !homeLeading && margin >= 7) ||
                      (!homeRanked && awayRanked && homeLeading && margin >= 7);
      if (isUpset) {
        alerts.push({ key: upsetKey, text: buildUpsetTweet(game) });
      }
    }

    // ── Overtime
    const otKey = `ot|${gid}`;
    if (!state.posted.includes(otKey) && game.status === 'in_progress' && hS === aS && hS > 0 && prev.homeScore === hS && prev.awayScore === aS) {
      alerts.push({ key: otKey, text: buildOvertimeTweet(game, pick) });
    }

    // ── Comeback (team down 17+ and closing gap from last check)
    const combackKey = `comeback|${gid}`;
    if (!state.posted.includes(combackKey) && game.status === 'in_progress') {
      const prevMargin = Math.abs((prev.homeScore ?? 0) - (prev.awayScore ?? 0));
      if (prevMargin >= 17 && margin < prevMargin && margin <= 10) {
        const deficit = prevMargin;
        alerts.push({ key: combackKey, text: buildComebackTweet(game, deficit) });
      }
    }

    // Update last known score
    state.lastScores[gid] = { homeScore: hS, awayScore: aS, status: game.status };
  }

  console.log(`\n🏈 Live alert check: ${alerts.length} alert(s) to post`);

  if (!alerts.length) {
    saveState(state);
    return;
  }

  // Post alerts
  let client = null;
  if (!dryRun) {
    const authClient = new TwitterApi({
      clientId:     process.env.X_OAUTH2_CLIENT_ID,
      clientSecret: process.env.X_OAUTH2_CLIENT_SECRET,
    });
    const { client: c, refreshToken: newRefresh } =
      await authClient.refreshOAuth2Token(process.env.X_OAUTH2_REFRESH_TOKEN);
    client = c;
    if (newRefresh) fs.writeFileSync('/tmp/new_refresh_token', newRefresh, 'utf8');
  }

  for (const alert of alerts) {
    if (alert.text.length > 280) {
      console.warn(`⚠️ Alert too long (${alert.text.length} chars) — skipping: ${alert.key}`);
      continue;
    }
    if (dryRun) {
      console.log(`\n[DRY RUN] ${alert.key}:\n${alert.text}`);
    } else {
      const { data } = await client.v2.tweet({ text: alert.text });
      console.log(`✅ Posted ${alert.key}: https://x.com/TheBetCFB/status/${data.id}`);
      await sleep(2000);
    }
    state.posted.push(alert.key);
  }

  saveState(state);
}

main().catch(err => { console.error('❌', err.message || err); process.exit(1); });
