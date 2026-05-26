#!/usr/bin/env node
/**
 * post-picks.js
 * Auto-posts CFB picks to X (Twitter) using the X API v2.
 *
 * Env vars required (set as GitHub Actions secrets):
 *   X_API_KEY            — API Key (Consumer Key)
 *   X_API_SECRET         — API Secret (Consumer Secret)
 *   X_ACCESS_TOKEN       — Access Token (your account)
 *   X_ACCESS_TOKEN_SECRET — Access Token Secret (your account)
 *
 * Usage:
 *   node post-picks.js --type early    # Tuesday: early look
 *   node post-picks.js --type final    # Friday: locked picks
 *   node post-picks.js --type gameday  # Saturday: day-of
 *   node post-picks.js --type final --dry-run   # preview without posting
 */

const { getPicks } = require('./get-picks');

// ── Parse args ────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const type    = args[args.indexOf('--type') + 1] || 'final';
const dryRun  = args.includes('--dry-run');

// ── Tweet formatters ──────────────────────────────────────────────

function confLabel(conf) {
  if (conf === 'elite') return '🔒 ELITE PICK';
  if (conf === 'high')  return '✅ HIGH CONFIDENCE';
  return '📊 MODEL PICK';
}

function spreadDisplay(vegasSpread) {
  if (vegasSpread == null) return null;
  return vegasSpread > 0 ? `+${vegasSpread}` : `${vegasSpread}`;
}

function formatEarly(pick) {
  const spread = spreadDisplay(pick.vegasSpread);
  const lines = [
    `🔍 EARLY LOOK — Week ${pick.week}`,
    ``,
    `${pick.awayAbbr} @ ${pick.homeAbbr}`,
    `${confLabel(pick.conf)}: ${pick.pickTeam}${spread ? ` ${spread}` : ''}`,
    ``,
    `📊 Model Edge: +${pick.edge} pts`,
    `🎯 Cover Prob: ${pick.winProb}%`,
    pick.sharpAligns ? `💰 Sharp Money: Aligned ✓` : ``,
    ``,
    `Full analysis → thebetcfb.com`,
    ``,
    `#CFB #CollegeFootball ${pick.hashHome} ${pick.hashAway} #TheBet`,
  ].filter(l => l !== null && !(l === '' && lines && lines[lines.length - 1] === ''));

  return lines.join('\n').trim();
}

function formatFinal(pick) {
  const spread = spreadDisplay(pick.vegasSpread);
  const base = [
    `${confLabel(pick.conf)} 🏈 Week ${pick.week}`,
    ``,
    `${pick.awayAbbr} @ ${pick.homeAbbr}`,
    `THE BET: ${pick.pickTeam}${spread ? ` ${spread}` : ''}`,
    ``,
    `📈 Edge: +${pick.edge} pts | 🎯 ${pick.winProb}% cover prob`,
  ].join('\n');

  const optionalParts = [
    pick.publicPct != null
      ? `👥 ${pick.publicPct}% public on ${pick.pickTeam}` + (pick.publicPct >= 60 ? ' (fade alert)' : '')
      : null,
    pick.sharpAligns ? `💰 Sharp money aligned` : null,
    pick.reasoning
      ? `"${pick.reasoning.slice(0, 60)}${pick.reasoning.length > 60 ? '…' : ''}"`
      : null,
  ].filter(Boolean);

  const footer = `\nthebetcfb.com | #CFB ${pick.hashHome} ${pick.hashAway} #TheBet`;

  // Build tweet greedily — add optional parts until we'd exceed 280 chars
  // (X counts URLs as 23 chars regardless of length)
  const urlLen = 23;
  const footerNoUrl = footer.replace('thebetcfb.com', '');
  let tweet = base;
  for (const part of optionalParts) {
    const candidate = tweet + '\n' + part + footerNoUrl + ' '.repeat(urlLen);
    if (candidate.length <= 280) tweet += '\n' + part;
  }
  return (tweet + footer).trim();
}

function formatGameday(pick) {
  const spread = spreadDisplay(pick.vegasSpread);
  const lines = [
    `🏈 GAME DAY — Week ${pick.week}`,
    ``,
    `${pick.awayAbbr} @ ${pick.homeAbbr}`,
    `⏰ ${pick.time}${pick.network ? ` | ${pick.network}` : ''}`,
    ``,
    `${confLabel(pick.conf)}`,
    `THE BET: ${pick.pickTeam}${spread ? ` ${spread}` : ''} covers`,
    ``,
    `Good luck today 🙏`,
    `thebetcfb.com`,
    ``,
    `#CFB #GameDay ${pick.hashHome} ${pick.hashAway} #CollegeFootball`,
  ];

  return lines.join('\n').trim();
}

function buildTweet(pick, postType) {
  if (postType === 'early')   return formatEarly(pick);
  if (postType === 'gameday') return formatGameday(pick);
  return formatFinal(pick);
}

// ── X API posting ─────────────────────────────────────────────────

async function postTweet(text) {
  // Dynamic import so the script still works for --dry-run without the package installed
  const { TwitterApi } = await import('twitter-api-v2');

  const client = new TwitterApi({
    appKey:            process.env.X_API_KEY,
    appSecret:         process.env.X_API_SECRET,
    accessToken:       process.env.X_ACCESS_TOKEN,
    accessSecret:      process.env.X_ACCESS_TOKEN_SECRET,
  });

  const rwClient = client.readWrite;
  const { data } = await rwClient.v2.tweet(text);
  return data.id;
}

// ── Delay between tweets to avoid rate limits ─────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\n📣 The Bet — X Auto-Poster`);
  console.log(`Mode: ${type.toUpperCase()} | Dry run: ${dryRun}`);
  console.log(`─`.repeat(44));

  let picks;
  try {
    picks = getPicks('all');
  } catch (e) {
    console.error('Failed to load picks:', e.message);
    process.exit(1);
  }

  if (!picks.length) {
    console.log('No ELITE/HIGH picks found for the upcoming week. Nothing to post.');
    return;
  }

  // For gameday: post ALL picks (elite + high)
  // For early: post only ELITE picks (don't overhype everything on Tuesday)
  // For final: post all
  const filtered = type === 'early'
    ? picks.filter(p => p.conf === 'elite')
    : picks;

  if (!filtered.length) {
    console.log(`No ${type} picks to post (no ELITE picks for early look).`);
    return;
  }

  console.log(`Found ${filtered.length} pick(s) to post:\n`);

  for (let i = 0; i < filtered.length; i++) {
    const pick = filtered[i];
    const tweet = buildTweet(pick, type);

    console.log(`\n── Pick ${i + 1}/${filtered.length} ──────────────────────`);
    console.log(tweet);
    console.log(`\n[${tweet.length} chars]`);

    if (tweet.length > 280) {
      console.warn(`⚠️  Tweet exceeds 280 chars — truncating not yet implemented. Skipping.`);
      continue;
    }

    if (!dryRun) {
      try {
        if (!process.env.X_API_KEY) {
          console.error('❌ X_API_KEY not set. Run with --dry-run or set env vars.');
          process.exit(1);
        }
        const id = await postTweet(tweet);
        console.log(`✅ Posted! https://x.com/i/web/status/${id}`);
        // Wait 8 seconds between tweets (X rate limits: 300 posts/3hr on basic tier)
        if (i < filtered.length - 1) await sleep(8000);
      } catch (e) {
        console.error(`❌ Failed to post:`, e.message || e);
      }
    } else {
      console.log(`[DRY RUN — not posted]`);
    }
  }

  console.log(`\n✅ Done.`);
}

main().catch(e => { console.error(e); process.exit(1); });
