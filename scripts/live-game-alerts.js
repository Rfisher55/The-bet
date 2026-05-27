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
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2));
  fs.renameSync(tmp, STATE_FILE);
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
  if (homeScore == null || awayScore == null || bettingLines?.spread == null) return null;
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

  // Determine who's pulling the upset (only called when exactly one team is ranked)
  const homeWin = game.homeScore > game.awayScore;
  let upsetTeam, rankedTeam;
  if (homeWin && awayRank && !homeRank) {
    upsetTeam = game.homeTeamName; rankedTeam = `#${awayRank} ${game.awayTeamName}`;
  } else {
    upsetTeam = game.awayTeamName; rankedTeam = `#${homeRank} ${game.homeTeamName}`;
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

  // Reset state on Sunday afternoon (not midnight) so late-night Saturday
  // games (finishing after midnight) still get their final-result tweet.
  // Reset at 14:00 UTC Sunday (10am ET) — all games will be long done by then.
  const nowUtc = new Date();
  const dayOfWeek = nowUtc.getUTCDay(); // 0=Sun
  const hourUtc   = nowUtc.getUTCHours();
  let state = loadState();
  if (dayOfWeek === 0 && hourUtc >= 14 && state.posted?.length > 0) {
    console.log('Sunday 14 UTC reset — clearing live-state.json');
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

    // ── Halftime check
    // We can't read the actual period from the current data pipeline, so use a
    // conservative heuristic: combined score ≥ 21 AND score is unchanged from
    // the last 10-min check (scoring has paused → likely halftime or late Q4,
    // neither of which we want to miss). Gate on pick so we don't spam.
    // False-positive risk (regulation tie/late-game stall) is low given the
    // unchanged-score requirement; we accept it until period data is available.
    const halfKey = `half|${gid}`;
    if (!state.posted.includes(halfKey) && game.status === 'in_progress') {
      const prevTotal = (prev.homeScore ?? -1) + (prev.awayScore ?? -1);
      const currTotal = hS + aS;
      const scoreUnchanged = prevTotal >= 0 && prevTotal === currTotal;
      if (pick && currTotal >= 21 && scoreUnchanged) {
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
    // Heuristic: tied AND score was also tied last check AND enough points to
    // suggest late-game (≥28 combined). Two consecutive tied readings at high
    // scores makes a mid-game pause far less likely than OT/end of regulation.
    const otKey = `ot|${gid}`;
    const prevTied = prev.homeScore != null && prev.homeScore === prev.awayScore;
    if (!state.posted.includes(otKey) && game.status === 'in_progress'
        && hS === aS && hS > 0 && hS + aS >= 28 && prevTied) {
      alerts.push({ key: otKey, text: buildOvertimeTweet(game, pick) });
    }

    // ── Comeback (team down 17+ at peak and now within 10)
    // Track peak deficit across all intervals so a slow comeback isn't undersold.
    const combackKey = `comeback|${gid}`;
    const peakDeficit = Math.max(
      prev.peakDeficit ?? 0,
      margin
    );
    if (!state.posted.includes(combackKey) && game.status === 'in_progress') {
      if (peakDeficit >= 17 && margin <= 10) {
        alerts.push({ key: combackKey, text: buildComebackTweet(game, peakDeficit) });
      }
    }

    // Update last known score (persist peakDeficit for accurate comeback tracking)
    state.lastScores[gid] = { homeScore: hS, awayScore: aS, status: game.status, peakDeficit };
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
