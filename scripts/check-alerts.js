#!/usr/bin/env node
/**
 * check-alerts.js — Breaking news tweet alerts for @TheBetCFB
 *
 * Runs after every data refresh. Compares current state to last known state
 * and posts to X if anything significant changed:
 *   - Key player injured (QB always, other positions if Out/Doubtful)
 *   - Player suspended or declared ineligible
 *   - Pick flips (model changes which team it likes)
 *   - Major line movement (3+ points)
 *
 * State is saved in data/alert-state.json between runs.
 */

const fs   = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');
const { getPastPicks } = require('./get-picks');

const ROOT       = path.join(__dirname, '..');
const DATA       = p => path.join(ROOT, 'data', p);
const STATE_FILE = DATA('alert-state.json');

// Positions that always trigger an alert if Out/Doubtful
const KEY_POSITIONS = new Set(['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'DE', 'LB', 'CB', 'S']);
const CRITICAL_POSITIONS = new Set(['QB']);

// Keywords in injury detail that mean eligibility/suspension
const ELIGIBILITY_KEYWORDS = [
  'ineligible', 'suspended', 'dismissed', 'expelled', 'banned',
  'arrested', 'charged', 'ruled out indefinitely', 'dismissed from team',
];

// ── Load files ────────────────────────────────────────────────────────────────
function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function loadState() {
  return loadJSON(STATE_FILE) || { injuries: {}, picks: {}, lines: {}, postedAlerts: [] };
}

function saveState(state) {
  // Atomic write: write to .tmp then rename so a mid-write crash can't corrupt state
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, STATE_FILE);
}

// ── Alert detection ───────────────────────────────────────────────────────────
function detectInjuryAlerts(currentInjuries, prevInjuries, postedAlerts) {
  const alerts = [];

  for (const [teamId, players] of Object.entries(currentInjuries)) {
    const prevPlayers = prevInjuries[teamId] || [];
    const prevKeys    = new Set(prevPlayers.map(p => `${p.player}|${p.status}`));

    for (const inj of players) {
      const key       = `${teamId}|${inj.player}|${inj.status}`;
      const detail    = (inj.detail || '').toLowerCase();
      const isEligibility = ELIGIBILITY_KEYWORDS.some(kw => detail.includes(kw));
      const isCritical    = CRITICAL_POSITIONS.has(inj.position);
      const isKey         = KEY_POSITIONS.has(inj.position);
      const isSevere      = ['Out', 'Doubtful', 'Injured Reserve', 'Suspended'].includes(inj.status);

      // Skip if already alerted, or not new, or not important enough
      if (postedAlerts.includes(key)) continue;
      if (prevKeys.has(`${inj.player}|${inj.status}`)) continue;
      if (!isEligibility && !isCritical && !(isKey && isSevere)) continue;

      alerts.push({ type: isEligibility ? 'eligibility' : 'injury', teamId, inj, key });
    }
  }
  return alerts;
}

// modelPicksMap: { [gameId]: { team, conf, homeTeam, awayTeam, week, spread } }
// Built from get-picks.js getPastPicks() — the actual model output, not thePick stubs.
function detectPickAlerts(modelPicksMap, currentGames, prevPicks, postedAlerts) {
  const alerts = [];
  if (!modelPicksMap) return alerts;

  // Build a lookup for game details (spread, team names) from currentGames
  const gameDetails = {};
  for (const g of (currentGames || [])) {
    gameDetails[g.id] = g;
  }

  for (const [gameId, pick] of Object.entries(modelPicksMap)) {
    const prevPick = prevPicks[gameId];
    const alertKey = `pick-flip|${gameId}|${pick.team}`;

    if (postedAlerts.includes(alertKey)) continue;
    if (!prevPick) continue; // first time seeing this game — record only, no alert
    if (prevPick.team === pick.team) continue; // no change

    const game = gameDetails[gameId] || {};
    alerts.push({
      type:    'pick-flip',
      game: {
        id:          gameId,
        week:        pick.week,
        homeTeamName: pick.homeTeam,
        awayTeamName: pick.awayTeam,
        bettingLines: game.bettingLines,
      },
      oldTeam: prevPick.team,
      newTeam: pick.team,
      spread:  pick.vegasSpread,
      key:     alertKey,
    });
  }
  return alerts;
}

function detectLineAlerts(currentGames, prevLines, postedAlerts) {
  const alerts = [];
  if (!currentGames?.length) return alerts;

  for (const game of currentGames) {
    if (game.status !== 'scheduled') continue;
    const bl = game.bettingLines;
    if (bl?.spread == null) continue;

    const gameKey   = game.id;
    const prevSpread = prevLines[gameKey];
    const move       = prevSpread != null ? Math.abs(bl.spread - prevSpread) : 0;
    const alertKey   = `line|${gameKey}|${bl.spread}`;

    if (postedAlerts.includes(alertKey)) continue;
    if (prevSpread == null) { /* first time — record only */ continue; }
    if (move < 3) continue;

    alerts.push({
      type: 'line',
      game,
      oldSpread: prevSpread,
      newSpread: bl.spread,
      move,
      key: alertKey,
    });
  }
  return alerts;
}

// ── Tweet builders ────────────────────────────────────────────────────────────
function teamName(teamId) {
  // Capitalize and clean the ID for display
  return teamId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function spreadStr(n) {
  if (n == null) return '';
  return n > 0 ? `+${n}` : `${n}`;
}

function buildInjuryTweet({ type, teamId, inj }) {
  const team   = teamName(teamId);
  const tag    = `#${teamId.replace(/_/g, '').replace(/[^a-zA-Z0-9]/g, '')}`;
  const detail = inj.detail ? `\n"${inj.detail.slice(0, 100)}${inj.detail.length > 100 ? '…' : ''}"` : '';

  if (type === 'eligibility') {
    return `⚠️ ELIGIBILITY ALERT — ${team}\n\n${inj.player} (${inj.position}) — ${inj.status}${detail}\n\nThis changes the outlook. Model is adjusting. Watch for line movement.\n\n${tag} #CFB #TheBet`;
  }

  const severity = inj.status === 'Injured Reserve' ? '🚨 SEASON INJURY' :
                   inj.status === 'Out'              ? '🚨 INJURY ALERT' :
                                                      '⚠️ INJURY UPDATE';
  const qbNote = inj.position === 'QB'
    ? `\nQuarterback loss is the biggest single factor in model adjustment.`
    : '';

  return `${severity} — ${team}\n\n${inj.player} (${inj.position}) — ${inj.status}${detail}${qbNote}\n\nLine will move. Adjust your bets accordingly.\n\n${tag} #CFB #TheBet`;
}

function buildPickFlipTweet({ game, oldTeam, newTeam, spread }) {
  const home = game.homeTeamName || game.homeTeamId;
  const away = game.awayTeamName || game.awayTeamId;
  const sp   = spread != null ? ` ${spreadStr(spread)}` : '';
  return `🔄 PICK UPDATE — Wk${game.week}: ${away} @ ${home}\n\nPrevious pick: ${oldTeam}\nUpdated pick: ${newTeam}${sp}\n\nNew information changed the model. Trust the data, not the hype.\n\n#CFB #TheBet`;
}

function buildLineTweet({ game, oldSpread, newSpread, move }) {
  const home      = (game.homeTeamName || game.homeTeamId || '').slice(0, 22);
  const away      = (game.awayTeamName || game.awayTeamId || '').slice(0, 22);
  const direction = newSpread < oldSpread ? 'toward home' : 'toward away';
  const tag1      = `#${(game.homeTeamName || '').replace(/[^a-zA-Z0-9]/g, '')}`;
  const tag2      = `#${(game.awayTeamName || '').replace(/[^a-zA-Z0-9]/g, '')}`;
  return `📈 LINE MOVE — Wk${game.week}: ${away} @ ${home}\n\n${move.toFixed(1)} pts ${direction} (${spreadStr(oldSpread)} → ${spreadStr(newSpread)})\nSharp money or breaking news.\n\n${tag1} ${tag2} #CFB #TheBet`;
}

// ── Post to X ─────────────────────────────────────────────────────────────────
async function getClient() {
  const authClient = new TwitterApi({
    clientId:     process.env.X_OAUTH2_CLIENT_ID,
    clientSecret: process.env.X_OAUTH2_CLIENT_SECRET,
  });
  const { client, refreshToken: newRefresh } =
    await authClient.refreshOAuth2Token(process.env.X_OAUTH2_REFRESH_TOKEN);
  if (newRefresh) {
    fs.writeFileSync('/tmp/new_refresh_token', newRefresh, 'utf8');
  }
  return client;
}

async function postTweet(client, text, dryRun) {
  if (dryRun) {
    console.log('\n[DRY RUN] Would post:');
    console.log(text);
    return 'dry-run-id';
  }
  const { data } = await client.v2.tweet({ text });
  console.log(`✅ Posted: https://x.com/TheBetCFB/status/${data.id}`);
  await new Promise(r => setTimeout(r, 2000));
  return data.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const isTest = process.argv.includes('--test');

  // Test mode: fire one sample of each alert type so you can see how they look on X
  if (isTest) {
    console.log('\n🧪 TEST MODE — posting one sample alert tweet\n');
    const sampleText = `🚨 INJURY ALERT — Notre Dame\n\nRiley Leonard (QB) — Doubtful (knee)\n"Limited in practice Wednesday, did not participate Thursday."\nQuarterback loss is the biggest single factor in model adjustment.\n\nLine will move. Adjust your bets accordingly.\n\n#NotreDame #CFB #TheBet`;
    console.log('Sample tweet:');
    console.log(sampleText);
    console.log(`\n(${sampleText.length} chars)`);
    if (!dryRun) {
      const client = await getClient();
      await postTweet(client, sampleText, false);
    }
    return;
  }

  const injuryData  = loadJSON(DATA('injuries.json'));
  const gamesData   = loadJSON(DATA('games-2026.json'));
  const state       = loadState();

  const currentInjuries = injuryData?.injuries || {};
  const currentGames    = gamesData?.games || [];
  const prevInjuries    = state.injuries || {};
  const prevPicks       = state.picks    || {};
  const prevLines       = state.lines    || {};
  const postedAlerts    = state.postedAlerts || [];

  // Build model picks map from get-picks.js (real predictor output, not stub thePick fields)
  let modelPicksMap = null;
  try {
    const allPicks = getPastPicks();
    modelPicksMap = {};
    for (const pick of allPicks) {
      modelPicksMap[pick.gameId] = {
        team:     pick.pickTeam,
        conf:     pick.conf,
        week:     pick.week,
        homeTeam: pick.homeTeam,
        awayTeam: pick.awayTeam,
        vegasSpread: pick.vegasSpread,
      };
    }
    console.log(`  Model picks loaded: ${Object.keys(modelPicksMap).length} games`);
  } catch (e) {
    console.warn('  Could not load model picks (off-season or sandbox error):', e.message);
  }

  // Build current picks/lines snapshot for state
  // Picks come from real model output; lines from games-2026.json
  const newPicks = modelPicksMap || {};
  const newLines = {};
  for (const game of currentGames) {
    if (game.bettingLines?.spread != null) newLines[game.id] = game.bettingLines.spread;
  }

  // Detect alerts
  const injuryAlerts = detectInjuryAlerts(currentInjuries, prevInjuries, postedAlerts);
  const pickAlerts   = detectPickAlerts(modelPicksMap, currentGames, prevPicks, postedAlerts);
  const lineAlerts   = detectLineAlerts(currentGames, prevLines, postedAlerts);

  const allAlerts = [...injuryAlerts, ...pickAlerts, ...lineAlerts];

  console.log(`\n🔔 Alert check: ${injuryAlerts.length} injury, ${pickAlerts.length} pick flip, ${lineAlerts.length} line move`);

  if (!allAlerts.length) {
    console.log('No new alerts — saving state.');
    saveState({ injuries: currentInjuries, picks: newPicks, lines: newLines, postedAlerts });
    return;
  }

  // Post alerts
  const client = dryRun ? null : await getClient();
  const newPosted = [...postedAlerts];

  for (const alert of allAlerts) {
    let text;
    if (alert.type === 'injury' || alert.type === 'eligibility') text = buildInjuryTweet(alert);
    else if (alert.type === 'pick-flip') text = buildPickFlipTweet(alert);
    else if (alert.type === 'line') text = buildLineTweet(alert);

    if (!text) continue;
    // If over 280 chars, trim the detail excerpt rather than dropping the alert entirely.
    // A missed QB injury alert is worse than a slightly shorter tweet.
    if (text.length > 280) {
      const over = text.length - 280;
      // detail excerpt is always in quotes; shorten it first
      text = text.replace(/"([^"]{20,})"/, (match, inner) => {
        const trimmed = inner.slice(0, Math.max(20, inner.length - over - 1));
        return `"${trimmed}…"`;
      });
      if (text.length > 280) {
        console.warn(`⚠️  Alert tweet still too long (${text.length} chars) after trim — skipping ${alert.key}`);
        continue;
      }
    }
    await postTweet(client, text, dryRun);
    newPosted.push(alert.key);
  }

  // Save updated state — cap postedAlerts to last 500 to prevent unbounded growth
  const trimmedAlerts = newPosted.length > 500 ? newPosted.slice(-500) : newPosted;
  saveState({ injuries: currentInjuries, picks: newPicks, lines: newLines, postedAlerts: trimmedAlerts });
}

main().catch(err => { console.error('❌', err.message || err); process.exit(1); });
