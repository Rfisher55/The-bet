#!/usr/bin/env node
/**
 * post-picks.js — The Bet X auto-poster (full account)
 *
 * Env vars (GitHub Secrets):
 *   X_API_KEY  X_API_SECRET  X_ACCESS_TOKEN  X_ACCESS_TOKEN_SECRET
 *
 * Usage:
 *   node post-picks.js --type early       Tue: teaser (ELITE only)
 *   node post-picks.js --type top5        Wed: top 5 thread
 *   node post-picks.js --type parlay      Thu: parlay card thread
 *   node post-picks.js --type final       Fri: locked picks w/ record badge
 *   node post-picks.js --type polls       Sat AM: "who covers?" polls
 *   node post-picks.js --type gameday     Sat: hype + kickoff reminders
 *   node post-picks.js --type results     Sun: weekly recap thread
 *   node post-picks.js --type [any] --dry-run
 */

const { getPicks, getTop5, getParlays, getBiggestMatchups, getLocks } = require('./get-picks');
const { updateResults, getRecord }       = require('./get-results');

// ── Args ──────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const type   = args[args.indexOf('--type') + 1] || 'final';
const dryRun = args.includes('--dry-run');
const legs   = args.includes('--legs') ? parseInt(args[args.indexOf('--legs') + 1]) : 3;

// ── Shared helpers ────────────────────────────────────────────────
const SITE = 'rfisher55.github.io/The-bet';

function confBadge(conf) {
  return conf === 'elite' ? '🔒 ELITE' : conf === 'high' ? '✅ HIGH CONF' : '📊 MODEL';
}

function spreadStr(n) {
  if (n == null) return '';
  return n > 0 ? `+${n}` : `${n}`;
}

// ATS record badge — appended to every pick tweet
function recordBadge() {
  const r = getRecord().record;
  const total = r.wins + r.losses + r.pushes;
  if (!total) return null; // no record yet — don't show 0-0
  const pct = total > 0 ? Math.round((r.wins / (r.wins + r.losses)) * 100) : 0;
  return `📊 Season: ${r.wins}-${r.losses}${r.pushes ? `-${r.pushes}` : ''} ATS (${pct}%)`;
}

// Build tweet fitting within 280 chars — drop optional parts greedily
function buildFit(required, optional, footer) {
  let body = required;
  for (const part of optional) {
    const candidate = body + '\n' + part;
    if ((candidate + '\n' + footer).length <= 280) body += '\n' + part;
  }
  return (body + '\n' + footer).trim();
}

// ── Format: single pick ───────────────────────────────────────────
function fmtSinglePick(pick, mode) {
  const spread = spreadStr(pick.vegasSpread);
  const badge  = recordBadge();
  const tags   = `${pick.hashHome} ${pick.hashAway} #CFB #TheBet`;

  if (mode === 'gameday') {
    const lines = [
      `🏈 GAME DAY — Week ${pick.week}`,
      `${pick.awayAbbr} @ ${pick.homeAbbr}  ·  ${pick.time}${pick.network ? ` | ${pick.network}` : ''}`,
      ``,
      `${confBadge(pick.conf)} → ${pick.pickTeam}${spread ? ` ${spread}` : ''} covers`,
    ];
    const optional = [badge, `Let's get it! 🙏`].filter(Boolean);
    return buildFit(lines.join('\n'), optional, `${SITE}  ${tags}`);
  }

  const required = [
    mode === 'early'
      ? `🔍 EARLY LOOK — Week ${pick.week}`
      : `${confBadge(pick.conf)} — Week ${pick.week}`,
    ``,
    `${pick.awayAbbr} @ ${pick.homeAbbr}`,
    `THE BET: ${pick.pickTeam}${spread ? ` ${spread}` : ''}`,
    ``,
    `📈 Edge +${pick.edge} pts  ·  🎯 ${pick.winProb}% cover prob`,
  ].join('\n');

  const optional = [
    badge,
    pick.publicPct != null
      ? `👥 ${pick.publicPct}% public on ${pick.pickTeam}${pick.publicPct >= 60 ? ' (fade)' : ''}`
      : null,
    pick.sharpAligns ? `💰 Sharp money aligned ✓` : null,
    pick.reasoning
      ? `"${pick.reasoning.slice(0, 52)}${pick.reasoning.length > 52 ? '…' : ''}"`
      : null,
  ].filter(Boolean);

  return buildFit(required, optional, `${SITE}  ${tags}`);
}

// ── Format: top 5 thread ──────────────────────────────────────────
function fmtTop5Thread(picks) {
  const week      = picks[0].week;
  const badge     = recordBadge();
  const rankEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const hook = [
    `🏈 THE BET — WEEK ${week} TOP ${picks.length} PICKS`,
    ``,
    `Model ran every game on the board.`,
    `Only ${picks.length} made the cut.`,
    badge ? `\n${badge}` : '',
    ``,
    `Here's where the edge is 👇  (${today})`,
    `#CFB #CollegeFootball #TheBet`,
  ].filter(Boolean).join('\n').trim();

  const pickTweets = picks.map((pick, i) => {
    const spread   = spreadStr(pick.vegasSpread);
    const required = [
      `${rankEmoji[i]} ${confBadge(pick.conf)}`,
      `${pick.awayAbbr} @ ${pick.homeAbbr}  ·  Wk${pick.week} ${pick.time || ''}`,
      ``,
      `THE BET: ${pick.pickTeam}${spread ? ` ${spread}` : ''}`,
      `📈 +${pick.edge} pts edge  ·  🎯 ${pick.winProb}% cover prob`,
    ].join('\n');

    const optional = [
      pick.publicPct != null ? `👥 ${pick.publicPct}% public on ${pick.pickTeam}` : null,
      pick.reasoning
        ? `"${pick.reasoning.slice(0, 58)}${pick.reasoning.length > 58 ? '…' : ''}"`
        : null,
    ].filter(Boolean);

    return buildFit(required, optional, `${pick.hashHome} ${pick.hashAway} #CFB`);
  });

  const closer = [
    `Full breakdowns + parlay builder 👇`,
    `${SITE}`,
    ``,
    `💬 Drop your picks below! #CFB #TheBet`,
  ].join('\n').trim();

  return [hook, ...pickTweets, closer];
}

// ── Format: parlay thread ─────────────────────────────────────────
function fmtParlayThread(combos, legCount) {
  const week      = combos[0].legs[0].week;
  const badge     = recordBadge();
  const rankLabel = ['💎 #1 BEST BET', '🥈 #2 PICK', '🥉 #3 VALUE'];

  const hook = [
    `💎 THE BET PARLAY CARD — WEEK ${week}`,
    ``,
    `${legCount}-leg combos ranked by expected value.`,
    `Win prob verified against Vegas lines.`,
    badge ? badge : '',
    ``,
    `Thread 👇  #CFB #Parlay #TheBet`,
  ].filter(Boolean).join('\n').trim();

  const comboTweets = combos.map((combo, i) => {
    const legLines = combo.legs.map(l =>
      `  • ${l.label}  (${l.odds > 0 ? '+' : ''}${l.odds})`
    ).join('\n');
    const evSign = combo.ev >= 0 ? '✅ +' : '⚠️ ';
    const required = [
      rankLabel[i],
      ``,
      legLines,
      ``,
      `Odds: ${combo.american}  ·  Win: ${combo.winPct}%`,
      `${evSign}$${Math.abs(combo.ev).toFixed(0)} EV per $100`,
    ].join('\n');
    return buildFit(required, [], `Build it → ${SITE}/pages/parlay.html  #CFB #Parlay`);
  });

  const closer = [
    `🧮 All combos built with real Vegas odds + model edge.`,
    `Parlay builder → ${SITE}/pages/parlay.html`,
    ``,
    `Who's tailing? 👇 #CFB #Parlay #TheBet`,
  ].join('\n').trim();

  return [hook, ...comboTweets, closer];
}

// ── Format: biggest matchups thread ──────────────────────────────
function fmtMatchupsThread(games) {
  const rankEmoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];
  const hook = [
    `🏟️ THE BET — WEEK ${games[0].week} TOP 5 MATCHUPS`,
    ``,
    `Biggest games on the board this week.`,
    `Model grade + our take on every one 👇`,
    `#CFB #CollegeFootball #TheBet`,
  ].join('\n');

  const gameTweets = games.map((g, i) => {
    const homeRank = g.homeRank ? `#${g.homeRank} ` : '';
    const awayRank = g.awayRank ? `#${g.awayRank} ` : '';
    const spread   = g.spread != null ? ` · ${spreadStr(g.spread)}` : '';
    const confBadge = g.ourConf === 'ELITE' ? '🔒 ELITE PICK' :
                      g.ourConf === 'HIGH'  ? '✅ HIGH CONF PICK' : null;
    const lines = [
      `${rankEmoji[i]} ${awayRank}${g.awayTeam} @ ${homeRank}${g.homeTeam}`,
      `${g.time || 'TBD'}${g.network ? ` | ${g.network}` : ''}${spread}`,
      g.isConf ? `📋 Conference game` : '',
      confBadge ? `\n${confBadge}: ${g.ourPick}` : g.ourPick ? `\nModel leans: ${g.ourPick}` : '',
    ].filter(Boolean).join('\n');
    return buildFit(lines, [`\n${g.hashHome} ${g.hashAway} #CFB`], '');
  });

  const closer = `Full analysis + parlay builder 👇\n${SITE}\n\n💬 Which game are you most locked in on? #CFB #TheBet`;
  return [hook, ...gameTweets, closer];
}

// ── Format: locks thread ──────────────────────────────────────────
function fmtLocksThread(picks) {
  const today  = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const badge  = recordBadge();
  const hook = [
    `🔒 THE BET — WEEK ${picks[0].week} LOCKS (${today})`,
    ``,
    `${picks.length} plays where the model is most confident.`,
    `These are the ones to bet.`,
    badge ? `\n${badge}` : '',
    ``,
    `Thread 👇 #CFB #TheBet`,
  ].filter(Boolean).join('\n');

  const lockTweets = picks.map((pick, i) => {
    const spread = spreadStr(pick.vegasSpread);
    const emoji  = pick.winProb >= 75 ? '🔒' : pick.winProb >= 65 ? '✅' : '📊';
    const required = [
      `${emoji} LOCK ${i + 1} of ${picks.length}`,
      `${pick.awayAbbr} @ ${pick.homeAbbr}  ·  Wk${pick.week} ${pick.time || ''}`,
      ``,
      `THE BET: ${pick.pickTeam}${spread ? ` ${spread}` : ''}`,
      `🎯 ${pick.winProb}% win prob  ·  📈 +${pick.edge} pts edge`,
    ].join('\n');
    const optional = [
      pick.sharpAligns ? `💰 Sharp money aligned` : null,
      pick.publicPct != null ? `👥 ${pick.publicPct}% public — ${pick.publicPct > 60 ? 'with the crowd' : 'fading the public'}` : null,
      pick.reasoning ? `"${pick.reasoning.slice(0, 60)}${pick.reasoning.length > 60 ? '…' : ''}"` : null,
    ].filter(Boolean);
    return buildFit(required, optional, `${pick.hashHome} ${pick.hashAway} #CFB #TheBet`);
  });

  const closer = `All ${picks.length} locks + parlay builder:\n${SITE}\n\n💬 Tailing? Drop it below. #CFB #TheBet`;
  return [hook, ...lockTweets, closer];
}

// ── Format: polls ("who covers tonight?") ────────────────────────
// Returns array of { text, poll } objects — one per game
function fmtPolls(picks) {
  return picks.map(pick => {
    const spread = spreadStr(pick.vegasSpread);
    const oppTeam = pick.pickTeam === pick.homeTeam ? pick.awayTeam : pick.homeTeam;
    const oppAbbr = pick.pickTeam === pick.homeTeam ? pick.awayAbbr : pick.homeAbbr;
    const spread2 = pick.vegasSpread != null ? spreadStr(-pick.vegasSpread) : '';
    return {
      text: [
        `🗳️ Week ${pick.week} — Who covers tonight?`,
        ``,
        `${pick.awayAbbr} @ ${pick.homeAbbr}  ·  ${pick.time || ''}`,
        ``,
        `Our model: ${pick.pickTeam}${spread ? ` ${spread}` : ''} 🔒`,
        ``,
        `#CFB ${pick.hashHome} ${pick.hashAway} #CollegeFootball`,
      ].join('\n').trim(),
      poll: {
        options: [
          { label: `${pick.pickTeam.slice(0, 25)}${spread ? ` ${spread}` : ''}` },
          { label: `${oppTeam.slice(0, 25)}${spread2 ? ` ${spread2}` : ''}` },
        ],
        duration_minutes: 1440, // 24 hours
      },
    };
  });
}

// ── Format: weekly results thread ────────────────────────────────
function fmtResultsThread(newResults, fullRecord) {
  if (!newResults.length) return [];

  const week   = newResults[0].week;
  const wins   = newResults.filter(r => r.result === 'W').length;
  const losses = newResults.filter(r => r.result === 'L').length;
  const pushes = newResults.filter(r => r.result === 'P').length;
  const rec    = fullRecord.record;
  const emoji  = wins > losses ? '🔥' : wins === losses ? '😤' : '📉';

  const hook = [
    `${emoji} WEEK ${week} RESULTS — THE BET`,
    ``,
    `This week: ${wins}-${losses}${pushes ? `-${pushes}` : ''} ATS`,
    `Season:    ${rec.wins}-${rec.losses}${rec.pushes ? `-${rec.pushes}` : ''} ATS`,
    ``,
    `Full breakdown 👇  #CFB #TheBet`,
  ].join('\n').trim();

  const resultTweets = newResults.map(r => {
    const icon     = r.result === 'W' ? '✅' : r.result === 'L' ? '❌' : '➖';
    const score    = r.homeScore != null ? `Final: ${r.awayScore}-${r.homeScore}` : '';
    const spread   = r.spread != null ? spreadStr(r.spread) : '';
    return [
      `${icon} ${r.matchup}`,
      `${r.pickTeam}${spread ? ` ${spread}` : ''} — ${r.result === 'W' ? 'COVERED ✅' : r.result === 'L' ? 'NO COVER ❌' : 'PUSH ➖'}`,
      score ? score : '',
      `#CFB`,
    ].filter(Boolean).join('\n').trim();
  });

  const seasonPct = (rec.wins + rec.losses) > 0
    ? Math.round(rec.wins / (rec.wins + rec.losses) * 100) : 0;

  const closer = [
    `📊 Season record: ${rec.wins}-${rec.losses}${rec.pushes ? `-${rec.pushes}` : ''} ATS (${seasonPct}%)`,
    ``,
    `Next week's picks drop Tuesday 👀`,
    `${SITE}  #CFB #TheBet #CollegeFootball`,
  ].join('\n').trim();

  return [hook, ...resultTweets, closer];
}

// ── X API client ──────────────────────────────────────────────────
async function getClient() {
  const { TwitterApi } = require('twitter-api-v2');
  const authClient = new TwitterApi({
    clientId:     process.env.X_OAUTH2_CLIENT_ID,
    clientSecret: process.env.X_OAUTH2_CLIENT_SECRET,
  });
  const { client, refreshToken: newRefresh } =
    await authClient.refreshOAuth2Token(process.env.X_OAUTH2_REFRESH_TOKEN);
  require('fs').writeFileSync('/tmp/new_refresh_token', newRefresh, 'utf8');
  return client;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function postThread(tweets, client) {
  const ids = [];
  for (let i = 0; i < tweets.length; i++) {
    const text = typeof tweets[i] === 'string' ? tweets[i] : tweets[i].text;
    const payload = { text };
    if (i > 0) payload.reply = { in_reply_to_tweet_id: ids[i - 1] };
    const { data } = await client.v2.tweet(payload);
    ids.push(data.id);
    console.log(`  ✅ Tweet ${i + 1}: https://x.com/i/web/status/${data.id}`);
    if (i < tweets.length - 1) await sleep(4000);
  }
  return ids;
}

// ── Print preview ─────────────────────────────────────────────────
function printTweets(items) {
  items.forEach((item, i) => {
    const text = typeof item === 'string' ? item : item.text;
    const poll = typeof item === 'object' && item.poll
      ? `\n[POLL: ${item.poll.options.map(o => o.label).join(' / ')}]` : '';
    console.log(`\n── Tweet ${i + 1} (${text.length} chars) ${'─'.repeat(22)}`);
    console.log(text + poll);
    if (text.length > 280) console.warn(`⚠️  OVER 280 CHARS`);
  });
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\n📣 The Bet — X Auto-Poster`);
  console.log(`Mode: ${type.toUpperCase()} | Dry run: ${dryRun}\n${'─'.repeat(44)}`);

  let items = []; // array of strings or poll objects

  // ── Results (Sunday) ─────────────────────────────────────────
  if (type === 'results') {
    const allPicks = getPicks('all');
    // Include past picks too — updateResults handles the "already recorded" check
    const { getPastPicks } = require('./get-picks');
    const allPicksWithPast = getPastPicks ? getPastPicks() : allPicks;
    console.log('Fetching ESPN scores...');
    const { record, newResults } = await updateResults(allPicksWithPast.length ? allPicksWithPast : allPicks);
    if (!newResults.length) {
      console.log('No new results to post (either off-season or already recorded).');
      return;
    }
    items = fmtResultsThread(newResults, record).map(t => t); // strings
    console.log(`Results thread — ${items.length} tweets`);

  // ── Polls (Saturday AM) ───────────────────────────────────────
  } else if (type === 'polls') {
    const picks = getPicks('all');
    if (!picks.length) { console.log('No picks for polls.'); return; }
    items = fmtPolls(picks); // poll objects
    console.log(`${items.length} poll tweet(s)`);

  // ── Top 5 biggest matchups (Tuesday) ─────────────────────────
  } else if (type === 'matchups') {
    const games = getBiggestMatchups();
    if (!games.length) { console.log('No matchups found.'); return; }
    items = fmtMatchupsThread(games);
    console.log(`Matchups thread — ${items.length} tweets`);

  // ── 5 locks (Friday) ──────────────────────────────────────────
  } else if (type === 'locks') {
    const locks = getLocks();
    if (!locks.length) { console.log('No locks found.'); return; }
    items = fmtLocksThread(locks);
    console.log(`Locks thread — ${items.length} tweets`);

  // ── Top 5 thread (Wednesday) ──────────────────────────────────
  } else if (type === 'top5') {
    const picks = getTop5();
    if (!picks.length) { console.log('No games found for top 5.'); return; }
    items = fmtTop5Thread(picks);
    console.log(`Top 5 thread — ${items.length} tweets`);

  // ── Parlay thread (Thursday) ──────────────────────────────────
  } else if (type === 'parlay') {
    const combos = getParlays(legs);
    if (!combos.length) {
      console.log(`Not enough picks for a ${legs}-leg parlay. Trying ${legs - 1}-leg...`);
      const fallback = legs > 2 ? getParlays(legs - 1) : [];
      if (!fallback.length) { console.log('No parlay combos available.'); return; }
      items = fmtParlayThread(fallback, legs - 1);
    } else {
      items = fmtParlayThread(combos, legs);
    }
    console.log(`Parlay thread — ${items.length} tweets`);

  // ── Individual picks: early / final / gameday ─────────────────
  } else {
    const allPicks = getPicks('all');
    const filtered = type === 'early' ? allPicks.filter(p => p.conf === 'elite') : allPicks;
    if (!filtered.length) { console.log(`No picks for "${type}".`); return; }
    items = filtered.map(p => fmtSinglePick(p, type));
    console.log(`${filtered.length} individual tweet(s)`);
  }

  printTweets(items);

  if (dryRun) { console.log('\n[DRY RUN — nothing posted]'); return; }

  if (!process.env.X_OAUTH2_CLIENT_ID) {
    console.error('\n❌ X_OAUTH2_CLIENT_ID not set. Add GitHub secrets or use --dry-run.');
    process.exit(1);
  }

  const overLimit = items.filter(t => {
    const text = typeof t === 'string' ? t : t.text;
    return text.length > 280;
  });
  if (overLimit.length) {
    console.error(`\n❌ ${overLimit.length} tweet(s) over 280 chars. Fix before posting.`);
    process.exit(1);
  }

  const client = await getClient();

  if (type === 'polls') {
    // Each poll must post individually with poll options — not as a thread
    for (const item of items) {
      const payload = { text: typeof item === 'string' ? item : item.text };
      if (item.poll) payload.poll = item.poll;
      const { data } = await client.v2.tweet(payload);
      console.log(`✅ Poll posted: https://x.com/i/web/status/${data.id}`);
      await sleep(2000);
    }
  } else if (items.length === 1) {
    const text = typeof items[0] === 'string' ? items[0] : items[0].text;
    const { data } = await client.v2.tweet({ text });
    console.log(`\n✅ Posted! https://x.com/i/web/status/${data.id}`);
  } else {
    console.log(`\nPosting thread of ${items.length} tweets...`);
    const ids = await postThread(items, client);
    console.log(`\n✅ Done! Thread: https://x.com/i/web/status/${ids[0]}`);
  }
}

main().catch(e => { console.error('\n❌', e.message || e); process.exit(1); });
