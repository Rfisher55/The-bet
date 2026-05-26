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
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
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

function detectPickAlerts(currentGames, prevPicks, postedAlerts) {
  const alerts = [];
  if (!currentGames?.length) return alerts;

  for (const game of currentGames) {
    if (game.status !== 'scheduled') continue;
    const tp = game.gamePreview?.thePick;
    if (!tp?.team) continue;

    const gameKey = game.id;
    const prevPick = prevPicks[gameKey];
    const alertKey = `pick-flip|${gameKey}|${tp.team}`;

    if (postedAlerts.includes(alertKey)) continue;
    if (!prevPick) { /* first time seeing this game — just record, no alert */ continue; }
    if (prevPick.team === tp.team) continue;

    alerts.push({
      type: 'pick-flip',
      game,
      oldTeam: prevPick.team,
      newTeam: tp.team,
      spread:  game.bettingLines?.spread,
      key: alertKey,
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
    if (!bl?.spread) continue;

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
  const home      = game.homeTeamName || game.homeTeamId;
  const away      = game.awayTeamName || game.awayTeamId;
  const direction = newSpread < oldSpread ? 'moved toward home' : 'moved toward away';
  const tag1      = `#${(game.homeTeamName || '').replace(/[^a-zA-Z0-9]/g, '')}`;
  const tag2      = `#${(game.awayTeamName || '').replace(/[^a-zA-Z0-9]/g, '')}`;
  return `📈 LINE ALERT — Wk${game.week}: ${away} @ ${home}\n\nLine moved ${move.toFixed(1)} pts (${spreadStr(oldSpread)} → ${spreadStr(newSpread)})\n${direction} — sharp money or breaking news driving this.\n\nSite updated: rfisher55.github.io/The-bet\n\n${tag1} ${tag2} #CFB #TheBet`;
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

  // Build current picks/lines snapshot for state
  const newPicks = {};
  const newLines = {};
  for (const game of currentGames) {
    const tp = game.gamePreview?.thePick;
    if (tp?.team) newPicks[game.id] = { team: tp.team, conf: tp.confidence };
    if (game.bettingLines?.spread != null) newLines[game.id] = game.bettingLines.spread;
  }

  // Detect alerts
  const injuryAlerts = detectInjuryAlerts(currentInjuries, prevInjuries, postedAlerts);
  const pickAlerts   = detectPickAlerts(currentGames, prevPicks, postedAlerts);
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

    if (text && text.length <= 280) {
      await postTweet(client, text, dryRun);
      newPosted.push(alert.key);
    }
  }

  // Save updated state
  saveState({ injuries: currentInjuries, picks: newPicks, lines: newLines, postedAlerts: newPosted });
}

main().catch(err => { console.error('❌', err.message || err); process.exit(1); });
