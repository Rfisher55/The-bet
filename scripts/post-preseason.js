#!/usr/bin/env node
/* post-preseason.js — preseason tweet generator for @TheBetCFB
   Covers all ~130 FBS teams. Opinion-first, data-backed.

   Angles:
     --angle intro        Account intro tweets (post first)
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
// Load AP ranks from games-2026.json and SP+/momentum from team-extras.json
// so tweets always show the same values as the website.
(function applyLiveOverrides() {
  // 1. AP ranks — games-2026.json is the authoritative live source (refreshed daily)
  try {
    const gamesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'games-2026.json'), 'utf8'));
    const apRanks = gamesData.apRanks || {};
    if (Object.keys(apRanks).length) {
      ALL_TEAMS.forEach(t => {
        if (t.id) t.apRank = apRanks[t.id] != null ? apRanks[t.id] : null;
      });
      console.log(`[LIVE] AP ranks loaded from games-2026.json (${Object.keys(apRanks).length} ranked)`);
    }
  } catch (_) { /* file missing — use data.js apRank fallback */ }

  // 2. SP+ ratings and Reddit momentum — from team-extras.json (populated in-season)
  try {
    const extras = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'team-extras.json'), 'utf8'));

    // SP+ ratings (in-season only; array is empty during preseason)
    const spList = extras.spRatings || [];
    if (spList.length) {
      const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const spMap = Object.fromEntries(spList.map(e => [norm(e.team), e.rating]));
      ALL_TEAMS.forEach(t => {
        const key = norm(t.name || '');
        if (spMap[key] != null) t.spRating = spMap[key];
      });
      console.log(`[LIVE] SP+ ratings loaded from team-extras.json (${spList.length} teams)`);
    }

    // Reddit momentum — maps sentiment → programMomentum
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
  } catch (_) { /* file missing — use data.js values */ }
}());

const sorted   = [...ALL_TEAMS].sort((a, b) => b.rating - a.rating);

// Actual sorted position (matches what the website shows)
const _rankMap  = new Map(sorted.map((t, i) => [t.id, i + 1]));
const modelRank = t => _rankMap.get(t.id) || Math.max(1, Math.round((100 - t.rating) * 1.5) + 1);

// ── Helpers ──────────────────────────────────────────────────────────────────
const fit = (core, extras, max = 280) => {
  let t = core;
  for (const p of extras) if (p && (t + p).length <= max) t += p;
  return t.trim();
};

const pct  = n  => `${Math.round(n * 100)}%`;
const rank = n  => { const s = ['th','st','nd','rd']; return `${n}${s[(n%100-10)*(n%100-10)<9?0:(n%10<4?n%10:0)]||'th'}`; };
const impliedRank = r => Math.max(1, Math.round((100 - r) * 1.5) + 1);
const winProjFromRating = r => {
  if (r >= 93) return '12-13';
  if (r >= 88) return '10-11';
  if (r >= 83) return '9-10';
  if (r >= 78) return '8-9';
  if (r >= 73) return '7-8';
  if (r >= 68) return '5-7';
  return '4-6';
};

// Opinion phrases keyed by momentum/rating tier
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
    [
      `Model: ${t.rating}/100 · SP+: ${t.spRating > 0 ? '+' : ''}${t.spRating}`,
      apLine,
      `\nProjected wins: ${wins}`,
      portalLine,
      atsLine,
      coach ? `\n${coach}` : '',
      `\n\n#CFB #${t.name.replace(/\s/g,'').replace(/[^a-zA-Z0-9]/g,'')} #TheBet`,
    ]
  );
}

function buildHotTake(t) {
  const r     = t.rating;
  const ap    = t.apRank;
  const m     = t.programHealth?.programMomentum || 'stable';
  const coach = t.coachName || 'their staff';
  const wins  = winProjFromRating(r);
  const iRank = modelRank(t);

  // Pick the spiciest take based on the data
  const takes = [];

  if (ap && iRank < ap - 3)
    takes.push(`🔥 HOT TAKE: ${t.name} is more dangerous than their AP ranking suggests.\n\nAP: #${ap} | Our model: #${iRank}\n\nThe gap doesn't lie. ${t.name} is being underpriced by the market going into 2026.\n\n#CFB #${t.name.replace(/\s/g,'')} #TheBet`);

  if (ap && iRank > ap + 3)
    takes.push(`⚠️ FADE ALERT: ${t.name} is overrated.\n\nAP: #${ap} | Our model: #${iRank}\n\nThe hype is ahead of the production. Be careful laying juice on this program early in the season.\n\n#CFB #${t.name.replace(/\s/g,'')} #TheBet`);

  if (m === 'rising' && r < 80)
    takes.push(`📈 ${t.name} is this year's "where did they come from?"\n\nModel rating: ${r}/100 and trending UP.\n${coach} has quietly built something here. Don't sleep on them.\n\nProjected wins: ${wins}\n\n#CFB #${t.name.replace(/\s/g,'')} #TheBet`);

  if (m === 'declining' && r >= 75)
    takes.push(`📉 ${t.name} — the fall is coming.\n\nProgram momentum: DECLINING. Rating: ${r}/100.\nThey'll still have wins, but ATS they're a trap every week.\n\nFade them as a heavy favorite.\n\n#CFB #${t.name.replace(/\s/g,'')} #TheBet`);

  const hs = t.programHealth?.coachHotSeat || 0;
  if (hs >= 7)
    takes.push(`🔥 ${t.name} is a powder keg.\n\n${coach} is on the hottest seat in ${t.conference}.\nCoach hot seat: ${hs}/10.\n\nA slow start and this program is in chaos. Bet accordingly.\n\n#CFB #${t.name.replace(/\s/g,'')} #TheBet`);

  if (!takes.length)
    takes.push(`📊 The model on ${t.name}:\n\nRating: ${r}/100 · ${t.conference}\nMomentum: ${m}\nProjected wins: ${wins}\n\n${r >= 78 ? "There's real value here if the line is right." : 'Bet the talent, not the brand.'}\n\n#CFB #${t.name.replace(/\s/g,'')} #TheBet`);

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
  return sorted
    .filter(t => {
      const ap = t.apRank || 99;
      return t.rating >= 78 && (ap - modelRank(t)) >= 4;
    })
    .sort((a, b) => {
      const ag = (a.apRank || 99) - modelRank(a);
      const bg = (b.apRank || 99) - modelRank(b);
      return bg - ag;
    })
    .slice(0, count)
    .map(t => {
      const gap = (t.apRank || 99) - modelRank(t);
      return fit(
        `🔍 SLEEPER: ${t.name}\n\nModel rank: #${modelRank(t)} | AP: ${t.apRank ? '#' + t.apRank : 'unranked'}\nHidden by ${gap} spots.\n\nRating: ${t.rating}/100 · Momentum: ${t.programHealth?.programMomentum || 'stable'}`,
        [
          `\nPortal: ${t.programHealth?.transferPortalRating || 'N/A'}/100`,
          `\nProjected wins: ${winProjFromRating(t.rating)}`,
          `\n\nThe market hasn't caught up yet. Book it.\n\n#CFB #${t.name.replace(/\s/g,'')} #TheBet`,
        ]
      );
    });
}

function tweetFades(count = 5) {
  return sorted
    .filter(t => {
      const iR = modelRank(t);
      return t.apRank && (iR - t.apRank) >= 3;
    })
    .sort((a, b) => {
      const ag = modelRank(a) - (a.apRank || 99);
      const bg = modelRank(b) - (b.apRank || 99);
      return bg - ag;
    })
    .slice(0, count)
    .map(t => {
      const gap = modelRank(t) - t.apRank;
      const m   = t.programHealth?.programMomentum || 'stable';
      return fit(
        `⚠️ FADE: ${t.name} (AP #${t.apRank})\n\nModel rank: #${modelRank(t)}\nOvervalued by ${gap} spots.`,
        [
          m === 'declining' ? `\n📉 Program momentum: DECLINING` : '',
          `\nCoach hot seat: ${t.programHealth?.coachHotSeat || 0}/10`,
          `\nATS as favorite: ${t.situational?.atsFavorite ? pct(t.situational.atsFavorite.pct) : 'limited data'}`,
          `\n\nThe AP ballot is wrong. The model is not.\n\n#CFB #${t.name.replace(/\s/g,'')} #TheBet`,
        ]
      );
    });
}

function tweetPortal(count = 6) {
  return [...ALL_TEAMS]
    .filter(t => (t.programHealth?.transferPortalRating || 0) >= 80)
    .sort((a, b) => (b.programHealth?.transferPortalRating || 0) - (a.programHealth?.transferPortalRating || 0))
    .slice(0, count)
    .map((t, i) => {
      const pr  = t.programHealth.transferPortalRating;
      const nil = t.programHealth?.nilStrength || 0;
      const m   = t.programHealth?.programMomentum || 'stable';
      return fit(
        `${i === 0 ? '🏆' : i <= 2 ? '🔥' : '📈'} PORTAL WIN: ${t.name}\n\nTransfer grade: ${pr}/100\nNIL war chest: ${nil}/100\nMomentum: ${m}`,
        [
          `\nRating: ${t.rating}/100`,
          `\nProjected wins: ${winProjFromRating(t.rating)}`,
          `\n\nThey won the offseason. Now let's see if they win the season.\n\n#CFB #TransferPortal #${t.name.replace(/\s/g,'')} #TheBet`,
        ]
      );
    });
}

function tweetATSValue() {
  const tweets = [];

  const dogs = [...ALL_TEAMS]
    .filter(t => (t.situational?.atsUnderdog?.pct || 0) >= 0.60)
    .sort((a, b) => (b.situational.atsUnderdog.pct) - (a.situational.atsUnderdog.pct))
    .slice(0, 5);

  if (dogs.length) {
    const lines = dogs.map(t =>
      `${t.name}: ${pct(t.situational.atsUnderdog.pct)} (${t.situational.atsUnderdog.wins}-${t.situational.atsUnderdog.losses})`
    ).join('\n');
    tweets.push(fit(
      `🐶 UNDERDOG KINGS — these teams cover when they're supposed to lose:\n\n${lines}`,
      [`\n\nBack them as dogs all season. The model doesn't lie.\n\n#CFB #ATS #TheBet`]
    ));
  }

  const bouncebacks = [...ALL_TEAMS]
    .filter(t => (t.situational?.afterLoss?.pct || 0) >= 0.72)
    .sort((a, b) => (b.situational.afterLoss.pct) - (a.situational.afterLoss.pct))
    .slice(0, 5);

  if (bouncebacks.length) {
    const lines = bouncebacks.map(t =>
      `${t.name}: ${pct(t.situational.afterLoss.pct)} ATS after a loss`
    ).join('\n');
    tweets.push(fit(
      `💪 BOUNCE-BACK TEAMS — buy them the week after a loss:\n\n${lines}`,
      [`\n\nElite programs respond. These are the ones to back when they're down.\n\n#CFB #ATS #TheBet`]
    ));
  }

  const homeTeams = [...ALL_TEAMS]
    .filter(t => (t.situational?.atsHome?.pct || 0) >= 0.65)
    .sort((a, b) => (b.situational.atsHome.pct) - (a.situational.atsHome.pct))
    .slice(0, 5);

  if (homeTeams.length) {
    const lines = homeTeams.map(t =>
      `${t.name}: ${pct(t.situational.atsHome.pct)} ATS at home`
    ).join('\n');
    tweets.push(fit(
      `🏠 HOME FIELD LOCKS — these teams print money at home:\n\n${lines}`,
      [`\n\nSchedule a trip to any of these stadiums and the host covers.\n\n#CFB #ATS #TheBet`]
    ));
  }

  return tweets;
}

function tweetConference(confFilter, count = 1) {
  const confs = confFilter
    ? [confFilter]
    : ['SEC', 'Big Ten', 'Big 12', 'ACC', 'Mountain West', 'Sun Belt', 'MAC', 'C-USA', 'American', 'Independent'];

  return confs.flatMap(conf => {
    const confTeams = [...ALL_TEAMS]
      .filter(t => t.conference === conf)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count === 1 ? 8 : count);

    if (!confTeams.length) return [];

    const top = confTeams[0];
    const sleeper = confTeams.find(t => {
      const gap = (t.apRank || 99) - modelRank(t);
      return gap >= 3 && t !== top;
    });
    const fade = confTeams.find(t => {
      const gap = modelRank(t) - (t.apRank || 99);
      return gap >= 3 && t !== top && t.apRank;
    });

    const ranked = confTeams.slice(0, 6).map((t, i) =>
      `${i + 1}. ${t.name} (${t.rating}/100${t.apRank ? ` · AP #${t.apRank}` : ''})`
    ).join('\n');

    return [fit(
      `📊 ${conf.toUpperCase()} POWER RANKINGS\nModel, not vibes\n\n${ranked}`,
      [
        sleeper ? `\n\n🔍 Sleeper: ${sleeper.name}` : '',
        fade ? `\n⚠️ Fade: ${fade.name}` : '',
        `\n\nFull breakdown: rfisher55.github.io/The-bet\n\n#CFB #${conf.replace(/\s/g,'')} #TheBet`,
      ]
    )];
  });
}

function tweetMomentum() {
  const rising = [...ALL_TEAMS]
    .filter(t => t.programHealth?.programMomentum === 'rising')
    .sort((a, b) => b.rating - a.rating);
  const declining = [...ALL_TEAMS]
    .filter(t => t.programHealth?.programMomentum === 'declining')
    .sort((a, b) => b.rating - a.rating);

  const tweets = [];
  if (rising.length) {
    const lines = rising.slice(0, 6).map(t =>
      `📈 ${t.name} (${t.rating}/100 · ${t.conference})`
    ).join('\n');
    tweets.push(fit(
      `🚀 RISING PROGRAMS in 2026 — model has these trending UP:\n\n${lines}`,
      [`\n\nBuy before the market catches on. These teams are getting better and Vegas hasn't adjusted.\n\n#CFB #TheBet`]
    ));
  }
  if (declining.length) {
    const lines = declining.slice(0, 6).map(t =>
      `📉 ${t.name} — hot seat: ${t.programHealth?.coachHotSeat || 0}/10`
    ).join('\n');
    tweets.push(fit(
      `⚠️ DECLINING PROGRAMS — model flags these as overvalued in 2026:\n\n${lines}`,
      [`\n\nBe careful giving these programs money early in the year. The hype hasn't met the results.\n\n#CFB #TheBet`]
    ));
  }
  return tweets;
}

function tweetHotTakes(count = 5) {
  const shuffled = [...ALL_TEAMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(buildHotTake);
}

function tweetRotate(offset = 0, count = 5) {
  const chunk = sorted.slice(offset, offset + count);
  if (!chunk.length) {
    const wrapped = sorted.slice(0, count);
    return wrapped.map(buildTeamSpotlight);
  }
  return chunk.map(buildTeamSpotlight);
}

function tweetTeam(nameQuery) {
  const q = nameQuery.toLowerCase();
  const t = ALL_TEAMS.find(t =>
    t.name.toLowerCase().includes(q) ||
    (t.abbreviation || '').toLowerCase() === q ||
    t.id?.toLowerCase().includes(q.replace(/\s/g,'_'))
  );
  if (!t) return [`Team not found: "${nameQuery}". Check the name and try again.`];
  return [buildTeamSpotlight(t), buildHotTake(t)];
}

// ── Content calendar ─────────────────────────────────────────────────────────
function printCalendar() {
  const cal = [
    { week: 'May 26 – Jun 1',  theme: 'Launch Week',           posts: ['intro ×3', 'how the model works', 'G5 fan shoutout (everyone is covered)'] },
    { week: 'Jun 2 – Jun 8',   theme: 'Conference Power Rankings', posts: ['SEC rankings', 'Big Ten rankings', 'Big 12 rankings', 'ACC + G5 rankings'] },
    { week: 'Jun 9 – Jun 15',  theme: 'Sleepers',              posts: ['top 5 sleepers thread', 'team spotlight ×2', 'G5 sleeper (e.g. Boise State)'] },
    { week: 'Jun 16 – Jun 22', theme: 'Fade Candidates',       posts: ['top 5 fades thread', 'hot take: overrated team', 'declining programs list'] },
    { week: 'Jun 23 – Jun 29', theme: 'ATS Value',             posts: ['underdog kings', 'bounce-back teams', 'home field locks', 'team spotlight'] },
    { week: 'Jun 30 – Jul 6',  theme: 'Transfer Portal',       posts: ['portal winners ×2', 'NIL leaders', 'team spotlight (portal winner)'] },
    { week: 'Jul 7 – Jul 13',  theme: 'Program Momentum',      posts: ['rising programs', 'declining programs', 'hot takes ×2', 'team spotlight'] },
    { week: 'Jul 14 – Jul 20', theme: 'Mid-Major Spotlight',   posts: ['Boise State', 'Liberty', 'Tulane', 'UTSA', 'James Madison'] },
    { week: 'Jul 21 – Jul 27', theme: 'Win Total Predictions', posts: ['over candidates', 'under candidates', 'team spotlight ×2', 'hot take'] },
    { week: 'Jul 28 – Aug 3',  theme: 'Dark Horse CFP Picks',  posts: ['CFP sleeper thread', 'conference champ takes', 'team spotlights'] },
    { week: 'Aug 4 – Aug 10',  theme: 'Final Rankings',        posts: ['updated power rankings', 'biggest risers/fallers', 'team spotlights ×2'] },
    { week: 'Aug 11 – Aug 17', theme: 'Week 0/1 Preview',      posts: ['early game previews', 'opening week ATS value', 'team spotlights'] },
    { week: 'Aug 18 – Aug 24', theme: 'Season Hype',           posts: ['bold predictions thread', 'parlay guide', 'how to use the picks'] },
    { week: 'Aug 25 – Sep 1',  theme: '🏈 SEASON LAUNCH',     posts: ['first ELITE picks', 'top 5 thread', 'parlay card', 'polls go live'] },
  ];

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   @TheBetCFB — PRESEASON CONTENT CALENDAR (5-7/wk)');
  console.log('═══════════════════════════════════════════════════════\n');
  cal.forEach(({ week, theme, posts }) => {
    console.log(`📅 ${week}  |  ${theme}`);
    posts.forEach(p => console.log(`   • ${p}`));
    console.log('');
  });
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Run any angle:');
  console.log('  node scripts/post-preseason.js --angle <angle> --dry-run');
  console.log('  node scripts/post-preseason.js --angle team --team "Boise State" --dry-run');
  console.log('  node scripts/post-preseason.js --angle rotate --offset 20 --dry-run');
  console.log('═══════════════════════════════════════════════════════\n');
}

// ── CLI ──────────────────────────────────────────────────────────────────────
async function main() {
  const args   = process.argv.slice(2);
  const get    = f => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
  const has    = f => args.includes(f);
  const angle  = get('--angle') || 'intro';
  const conf   = get('--conf');
  const team   = get('--team');
  const offset = parseInt(get('--offset') || '0', 10);
  const count  = parseInt(get('--count') || '5', 10);
  const dryRun = has('--dry-run');

  if (has('--calendar')) { printCalendar(); return; }

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
    default:
      console.error(`Unknown angle: ${angle}`); process.exit(1);
  }

  if (!tweets.length) { console.log('No tweets generated.'); return; }

  console.log(`\n[${angle.toUpperCase()}] ${tweets.length} tweet(s)${dryRun ? ' — DRY RUN' : ''}\n`);
  tweets.forEach((t, i) => {
    console.log(`── Tweet ${i + 1}/${tweets.length} (${t.length} chars) ──`);
    console.log(t);
    console.log('');
  });

  if (dryRun) return;

  // Refresh OAuth 2.0 token
  const { TwitterApi } = require('twitter-api-v2');
  const authClient = new TwitterApi({
    clientId:     process.env.X_OAUTH2_CLIENT_ID,
    clientSecret: process.env.X_OAUTH2_CLIENT_SECRET,
  });
  const { client, refreshToken: newRefresh } =
    await authClient.refreshOAuth2Token(process.env.X_OAUTH2_REFRESH_TOKEN);

  // Save new refresh token for the workflow to update in GitHub secrets
  if (newRefresh && typeof newRefresh === 'string') {
    require('fs').writeFileSync('/tmp/new_refresh_token', newRefresh, 'utf8');
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
}

main().catch(err => { console.error(err); process.exit(1); });
