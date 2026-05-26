#!/usr/bin/env node
/**
 * post-picks.js — The Bet X auto-poster
 *
 * Env vars (GitHub Secrets):
 *   X_API_KEY  X_API_SECRET  X_ACCESS_TOKEN  X_ACCESS_TOKEN_SECRET
 *
 * Usage:
 *   node post-picks.js --type early      # Tue: teaser picks (ELITE only)
 *   node post-picks.js --type top5       # Wed: top 5 games thread
 *   node post-picks.js --type parlay     # Thu: parlay card thread
 *   node post-picks.js --type final      # Fri: locked picks
 *   node post-picks.js --type gameday    # Sat: day-of reminders
 *   node post-picks.js --type parlay --legs 4   # 4-leg parlay
 *   node post-picks.js --type top5 --dry-run    # preview without posting
 */

const { getPicks, getTop5, getParlays } = require('./get-picks');

// ── Args ──────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const type   = args[args.indexOf('--type') + 1] || 'final';
const dryRun = args.includes('--dry-run');
const legs   = args.includes('--legs') ? parseInt(args[args.indexOf('--legs') + 1]) : 3;

// ── Tweet helpers ─────────────────────────────────────────────────
const SITE = 'thebetcfb.com';

function confBadge(conf) {
  return conf === 'elite' ? '🔒 ELITE' : conf === 'high' ? '✅ HIGH CONF' : '📊 MODEL';
}

function spreadStr(n) {
  if (n == null) return '';
  return n > 0 ? `+${n}` : `${n}`;
}

// Build tweet from parts, dropping optional parts until it fits 280 chars
function buildFit(required, optional, footer) {
  let tweet = required;
  for (const part of optional) {
    const candidate = tweet + '\n' + part + '\n' + footer;
    if (candidate.length <= 280) tweet += '\n' + part;
  }
  return (tweet + '\n' + footer).trim();
}

// ── Format: single pick (early / final / gameday) ─────────────────
function fmtSinglePick(pick, mode) {
  const spread = spreadStr(pick.vegasSpread);
  const tag    = `${pick.hashHome} ${pick.hashAway} #CFB #TheBet`;

  if (mode === 'gameday') {
    return [
      `🏈 GAME DAY — Week ${pick.week}`,
      `${pick.awayAbbr} @ ${pick.homeAbbr}  ·  ${pick.time}${pick.network ? ` | ${pick.network}` : ''}`,
      ``,
      `${confBadge(pick.conf)} → ${pick.pickTeam}${spread ? ` ${spread}` : ''} covers`,
      ``,
      `Good luck 🙏  ${SITE}`,
      `${tag}`,
    ].join('\n').trim();
  }

  const required = [
    mode === 'early' ? `🔍 EARLY LOOK — Week ${pick.week}` : `${confBadge(pick.conf)} — Week ${pick.week}`,
    ``,
    `${pick.awayAbbr} @ ${pick.homeAbbr}`,
    `THE BET: ${pick.pickTeam}${spread ? ` ${spread}` : ''}`,
    ``,
    `📈 Edge +${pick.edge} pts  ·  🎯 ${pick.winProb}% cover prob`,
  ].join('\n');

  const optional = [
    pick.publicPct != null ? `👥 ${pick.publicPct}% public on ${pick.pickTeam}${pick.publicPct >= 60 ? ' (fade alert)' : ''}` : null,
    pick.sharpAligns ? `💰 Sharp money aligned ✓` : null,
    pick.reasoning ? `"${pick.reasoning.slice(0, 55)}${pick.reasoning.length > 55 ? '…' : ''}"` : null,
  ].filter(Boolean);

  return buildFit(required, optional, `${SITE}  ${tag}`);
}

// ── Format: top 5 thread ──────────────────────────────────────────
function fmtTop5Thread(picks) {
  if (!picks.length) return [];

  const week = picks[0].week;
  const rankEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];

  // Hook tweet (no site link — leaves room for full text)
  const hook = [
    `🏈 THE BET — WEEK ${week} TOP ${picks.length} PICKS`,
    ``,
    `Model ran every game on the board.`,
    `Only ${picks.length} made the cut.`,
    ``,
    `Here's where the edge is 👇`,
    `#CFB #CollegeFootball #TheBet`,
  ].join('\n').trim();

  // One tweet per pick
  const pickTweets = picks.map((pick, i) => {
    const spread = spreadStr(pick.vegasSpread);
    const required = [
      `${rankEmoji[i]} ${confBadge(pick.conf)}`,
      `${pick.awayAbbr} @ ${pick.homeAbbr}  ·  Wk${pick.week} ${pick.time || ''}`,
      ``,
      `THE BET: ${pick.pickTeam}${spread ? ` ${spread}` : ''}`,
      `📈 +${pick.edge} pts edge  ·  🎯 ${pick.winProb}% cover prob`,
    ].join('\n');

    const optional = [
      pick.publicPct != null ? `👥 ${pick.publicPct}% public on ${pick.pickTeam}` : null,
      pick.reasoning ? `"${pick.reasoning.slice(0, 60)}${pick.reasoning.length > 60 ? '…' : ''}"` : null,
    ].filter(Boolean);

    return buildFit(required, optional, `${pick.hashHome} ${pick.hashAway} #CFB`);
  });

  // Closer tweet
  const closer = [
    `Full breakdowns + parlay builder 👇`,
    ``,
    `${SITE}`,
    ``,
    `💬 Drop your picks below! #CFB #TheBet #CollegeFootball`,
  ].join('\n').trim();

  return [hook, ...pickTweets, closer];
}

// ── Format: parlay thread ─────────────────────────────────────────
function fmtParlayThread(combos, legCount) {
  if (!combos.length) return [];

  const week = combos[0].legs[0].week;
  const rankLabel = ['💎 #1 BEST BET', '🥈 #2 PICK', '🥉 #3 VALUE'];
  const evLabel   = ev => ev >= 0 ? `+$${ev.toFixed(0)} EV` : `-$${Math.abs(ev).toFixed(0)} EV`;

  const hook = [
    `💎 THE BET PARLAY CARD — WEEK ${week}`,
    ``,
    `${legCount}-leg combos ranked by expected value.`,
    `Model win probability verified against Vegas lines.`,
    ``,
    `Thread 👇  #CFB #Parlay #TheBet`,
  ].join('\n').trim();

  const comboTweets = combos.map((combo, i) => {
    const legLines = combo.legs.map(l =>
      `  • ${l.label}  (${l.odds > 0 ? '+' : ''}${l.odds})`
    ).join('\n');

    const evColor = combo.ev >= 0 ? '✅' : '⚠️';
    const required = [
      rankLabel[i],
      ``,
      legLines,
      ``,
      `Odds: ${combo.american}  ·  Win: ${combo.winPct}%`,
      `${evColor} ${evLabel(combo.ev)} per $100`,
    ].join('\n');

    return buildFit(
      required,
      [],
      `Build it → ${SITE}/pages/parlay.html  #CFB #Parlay`
    );
  });

  const closer = [
    `🧮 All combos built with real Vegas odds + model edge.`,
    ``,
    `Parlay builder (mix & match) 👇`,
    `${SITE}/pages/parlay.html`,
    ``,
    `Who's tailing? 👇 #CFB #Parlay #TheBet`,
  ].join('\n').trim();

  return [hook, ...comboTweets, closer];
}

// ── X API posting ─────────────────────────────────────────────────
async function getClient() {
  const { TwitterApi } = await import('twitter-api-v2');
  const client = new TwitterApi({
    appKey:    process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken:  process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  });
  return client.readWrite;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function postThread(tweets, client) {
  const ids = [];
  for (let i = 0; i < tweets.length; i++) {
    const opts = i === 0 ? {} : { reply: { in_reply_to_tweet_id: ids[i - 1] } };
    const { data } = await client.v2.tweet(tweets[i], opts);
    ids.push(data.id);
    if (i < tweets.length - 1) await sleep(3000);
  }
  return ids;
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\n📣 The Bet — X Auto-Poster`);
  console.log(`Mode: ${type.toUpperCase()} | Dry run: ${dryRun}`);
  console.log(`${'─'.repeat(44)}`);

  let tweets = [];

  if (type === 'top5') {
    const picks = getTop5();
    if (!picks.length) { console.log('No games found for top 5.'); return; }
    tweets = fmtTop5Thread(picks);
    console.log(`Top 5 thread — ${tweets.length} tweets\n`);

  } else if (type === 'parlay') {
    const combos = getParlays(legs);
    if (!combos.length) { console.log(`Not enough picks for a ${legs}-leg parlay.`); return; }
    tweets = fmtParlayThread(combos, legs);
    console.log(`Parlay thread (${legs}-leg) — ${tweets.length} tweets\n`);

  } else {
    // Individual picks: early / final / gameday
    const allPicks = getPicks('all');
    const filtered = type === 'early' ? allPicks.filter(p => p.conf === 'elite') : allPicks;
    if (!filtered.length) { console.log(`No picks to post for mode "${type}".`); return; }
    tweets = filtered.map(p => fmtSinglePick(p, type));
    console.log(`${filtered.length} individual tweet(s)\n`);
  }

  // Print all tweets
  tweets.forEach((t, i) => {
    console.log(`── Tweet ${i + 1}/${tweets.length} (${t.length} chars) ${'─'.repeat(20)}`);
    console.log(t);
    if (t.length > 280) console.warn(`\n⚠️  OVER 280 CHARS — will be skipped`);
    console.log();
  });

  if (dryRun) { console.log('[DRY RUN — nothing posted]'); return; }

  if (!process.env.X_API_KEY) {
    console.error('❌ X_API_KEY not set. Use --dry-run or set env vars.');
    process.exit(1);
  }

  const overLimit = tweets.filter(t => t.length > 280);
  if (overLimit.length) {
    console.error(`❌ ${overLimit.length} tweet(s) exceed 280 chars. Fix before posting.`);
    process.exit(1);
  }

  const client = await getClient();

  if (tweets.length === 1) {
    const { data } = await client.v2.tweet(tweets[0]);
    console.log(`✅ Posted! https://x.com/i/web/status/${data.id}`);
  } else {
    // Post as a thread
    console.log(`Posting thread of ${tweets.length} tweets...`);
    const ids = await postThread(tweets, client);
    console.log(`✅ Thread posted! https://x.com/i/web/status/${ids[0]}`);
    ids.forEach((id, i) => console.log(`  Tweet ${i + 1}: https://x.com/i/web/status/${id}`));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
