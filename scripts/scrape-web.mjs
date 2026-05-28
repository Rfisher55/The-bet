#!/usr/bin/env node
/**
 * scrape-web.mjs — Supplemental web intelligence scraper
 *
 * Runs independently of fetch-live-data.mjs so it can be triggered more
 * frequently (every 2 hours weekdays, every 20 minutes on game day) without
 * burning CFBD API quota.
 *
 * Sources scraped:
 *   1. TeamRankings.com — ATS trends, line movement, public betting %
 *   2. ESPN RSS          — college football news & injury feed
 *   3. 247Sports RSS     — recruiting, transfers, coaching changes
 *   4. Athlon Sports RSS — injury & depth chart news
 *   5. Action Network    — public betting % (browser-like headers)
 *   6. OddsShark         — consensus picks & line history
 *   7. Reddit r/CFB      — expanded post scraping with comment depth
 *   8. Google News       — broad CFB news, team-specific searches
 *   9. BettingPros       — consensus expert picks
 *
 * Output: data/web-intel.json (merged atomically)
 */

import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, "..", "data");
const OUT_FILE  = join(DATA_DIR, "web-intel.json");

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function writeAtomic(filepath, content) {
  const tmp = `${filepath}.${process.pid}.tmp`;
  writeFileSync(tmp, content);
  renameSync(tmp, filepath);
}

async function safeFetch(url, opts = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, ...opts.headers },
        signal: AbortSignal.timeout(12000),
        ...opts,
      });
      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
          continue;
        }
        return opts.text ? null : null;
      }
      return opts.text ? await res.text() : await res.json();
    } catch {
      if (attempt < retries) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return null;
}

// ── 1. TeamRankings ATS Trends ──────────────────────────────────────────
async function scrapeTeamRankingsATS() {
  const html = await safeFetch("https://www.teamrankings.com/ncf/trends/ats_trends/", { text: true });
  if (!html) return {};
  const trends = {};
  // Extract rows: team name, ATS record, streak
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  for (const row of rows) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m =>
      m[1].replace(/<[^>]+>/g, "").trim()
    );
    if (cells.length < 4) continue;
    const name = cells[0].replace(/\s+/g, " ").trim();
    if (!name || name.length < 3 || /^[\d\s]+$/.test(name)) continue;
    // cells: [team, ats-record, streak, last5]
    const record = cells[1] || "";
    const streak = cells[2] || "";
    const last5  = cells[3] || "";
    const [w, l] = record.split("-").map(Number);
    if (!isNaN(w) && !isNaN(l)) {
      trends[name.toLowerCase()] = {
        atsW: w, atsL: l,
        atsPct: w + l > 0 ? Math.round(w / (w + l) * 100) : 50,
        streak: streak.replace(/\s+/g, " ").trim(),
        last5:  last5.replace(/\s+/g, " ").trim(),
      };
    }
  }
  console.log(`  TeamRankings ATS: ${Object.keys(trends).length} teams`);
  return trends;
}

// ── 2. TeamRankings — Public Betting % ─────────────────────────────────
async function scrapeTeamRankingsBetting() {
  const html = await safeFetch("https://www.teamrankings.com/ncf/trends/bet_pct_trends/", { text: true });
  if (!html) return {};
  const betting = {};
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  for (const row of rows) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m =>
      m[1].replace(/<[^>]+>/g, "").trim()
    );
    if (cells.length < 3) continue;
    const name = cells[0].trim();
    if (!name || name.length < 3) continue;
    const pct = parseFloat(cells[1]);
    if (!isNaN(pct)) {
      betting[name.toLowerCase()] = { spreadBetPct: Math.round(pct), source: "teamrankings" };
    }
  }
  console.log(`  TeamRankings betting %: ${Object.keys(betting).length} teams`);
  return betting;
}

// ── 3. ESPN College Football RSS ────────────────────────────────────────
async function scrapeESPNNews() {
  const feeds = [
    "https://www.espn.com/espn/rss/ncf/news",
    "https://www.espn.com/espn/rss/news?sections=ncf",
  ];
  const items = [];
  for (const url of feeds) {
    const xml = await safeFetch(url, { text: true });
    if (!xml) continue;
    const parsed = parseRSS(xml, 20);
    items.push(...parsed);
  }
  console.log(`  ESPN news: ${items.length} items`);
  return items;
}

// ── 4. 247Sports RSS ────────────────────────────────────────────────────
async function scrape247Sports() {
  const xml = await safeFetch("https://247sports.com/college/football/RSS/", { text: true });
  const items = parseRSS(xml, 20);
  console.log(`  247Sports: ${items.length} items`);
  return items;
}

// ── 5. Athlon Sports RSS ────────────────────────────────────────────────
async function scrapeAthlonSports() {
  const xml = await safeFetch("https://athlonsports.com/feed", { text: true });
  const items = parseRSS(xml, 15);
  const cfb = items.filter(i =>
    /college|football|ncaa|cfb/i.test(i.title + " " + (i.category || ""))
  );
  console.log(`  Athlon Sports: ${cfb.length} CFB items`);
  return cfb;
}

// ── 6. OddsShark NCAAF Consensus ────────────────────────────────────────
async function scrapeOddsShark() {
  const html = await safeFetch("https://www.oddsshark.com/ncaaf/odds", {
    text: true,
    headers: { "Accept": "text/html", "Referer": "https://www.oddsshark.com/" },
  });
  if (!html) return {};

  const consensus = {};
  // OddsShark embeds JSON in a __NEXT_DATA__ script tag
  const jsonMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const games = data?.props?.pageProps?.oddsData?.games || [];
      for (const g of games) {
        const home = g.teams?.find(t => t.teamType === "home")?.abbreviation || "";
        const away = g.teams?.find(t => t.teamType === "away")?.abbreviation || "";
        if (!home || !away) continue;
        const key = `${home}|${away}`;
        consensus[key] = {
          spread:    g.consensus?.spread ?? null,
          total:     g.consensus?.total ?? null,
          pick:      g.expert?.pick ?? null,
          source:    "oddsshark",
        };
      }
    } catch {}
  }
  console.log(`  OddsShark: ${Object.keys(consensus).length} games`);
  return consensus;
}

// ── 7. Reddit r/CFB — expanded scraping ────────────────────────────────
const TEAM_KEYWORDS = {
  alabama: ["alabama","crimson tide","bama","nick saban","kalen deboer"],
  georgia: ["georgia","bulldogs","dawgs","kirby smart"],
  ohio_state: ["ohio state","buckeyes","osu","ryan day"],
  texas: ["texas","longhorns","horns","steve sarkisian"],
  notre_dame: ["notre dame","fighting irish","nd","marcus freeman"],
  penn_state: ["penn state","nittany lions","james franklin"],
  michigan: ["michigan","wolverines","sherrone moore"],
  clemson: ["clemson","tigers","dabo swinney"],
  lsu: ["lsu","tigers","brian kelly"],
  oregon: ["oregon","ducks","dan lanning"],
  tennessee: ["tennessee","volunteers","vols","josh heupel"],
  miami: ["miami","hurricanes","canes","mario cristobal"],
  florida_state: ["florida state","seminoles","fsu","mike norvell"],
  texas_am: ["texas a&m","aggies","jimbo fisher","mike elko"],
  auburn: ["auburn","tigers","hugh freeze"],
  florida: ["florida","gators","billy napier"],
  oklahoma: ["oklahoma","sooners","brent venables"],
  usc: ["usc","trojans","lincoln riley"],
  washington: ["washington","huskies","jedd fisch"],
  colorado: ["colorado","buffaloes","deion sanders","coach prime"],
  utah: ["utah","utes","kyle whittingham"],
  byu: ["byu","cougars","kalani sitake"],
  iowa_state: ["iowa state","cyclones","matt campbell"],
  kansas_state: ["kansas state","wildcats","chris klieman"],
  boise_state: ["boise state","broncos","spencer danielson"],
  ole_miss: ["ole miss","rebels","lane kiffin"],
  missouri: ["missouri","tigers","eli drinkwitz"],
  south_carolina: ["south carolina","gamecocks","shane beamer"],
  arkansas: ["arkansas","razorbacks","sam pittman"],
  kentucky: ["kentucky","wildcats","mark stoops"],
  west_virginia: ["west virginia","mountaineers","rich rodriguez","neal brown"],
  iowa: ["iowa","hawkeyes","kirk ferentz"],
  wisconsin: ["wisconsin","badgers","luke fickell"],
  michigan_state: ["michigan state","spartans","jonathan smith"],
  illinois: ["illinois","fighting illini","bret bielema"],
  indiana: ["indiana","hoosiers","curt cignetti"],
  purdue: ["purdue","boilermakers","ryan walters"],
  nebraska: ["nebraska","cornhuskers","matt rhule"],
  north_carolina: ["north carolina","tar heels","mack brown"],
  nc_state: ["nc state","wolfpack","dave doeren"],
  pittsburgh: ["pittsburgh","pitt","pat narduzzi"],
  virginia_tech: ["virginia tech","hokies","brent pry"],
  louisville: ["louisville","cardinals","jeff brohm"],
  duke: ["duke","blue devils","manny diaz"],
  smu: ["smu","mustangs","rhett lashlee"],
  tulane: ["tulane","green wave","willie fritz"],
  memphis: ["memphis","tigers","ryan silverfield"],
  army: ["army","black knights","jeff monken"],
  navy: ["navy","midshipmen","brian newberry"],
};

async function scrapeRedditCFB() {
  const sentiment = {};
  const posts = [];
  const POS = ["win","wins","beat","dominate","cover","lock","impressive","great","strong","destroy","ranked","undefeated"];
  const NEG = ["loss","lose","upset","injury","struggle","overrated","avoid","problem","concern","weak","suspended","arrested","out for"];

  for (const sub of ["CFB", "sportsbook", "sportsbetting", "CFBbetting"]) {
    for (const sort of ["hot", "new"]) {
      const data = await safeFetch(`https://www.reddit.com/r/${sub}/${sort}.json?limit=100`, {
        headers: { "User-Agent": "TheBet-CFB-Scraper/2.0" },
      });
      if (!data?.data?.children) continue;
      for (const { data: post } of data.data.children) {
        const text = `${post.title} ${post.selftext || ""}`.toLowerCase();
        posts.push({ title: post.title, ups: post.ups || 0, sub, url: post.url });
        for (const [teamId, keywords] of Object.entries(TEAM_KEYWORDS)) {
          if (!keywords.some(kw => text.includes(kw))) continue;
          if (!sentiment[teamId]) sentiment[teamId] = { score: 0, posts: 0, upvotes: 0, sentimentScore: 0, headlines: [] };
          sentiment[teamId].posts++;
          sentiment[teamId].upvotes += post.ups || 0;
          const posHits = POS.filter(w => text.includes(w)).length;
          const negHits = NEG.filter(w => text.includes(w)).length;
          sentiment[teamId].sentimentScore += posHits - negHits;
          if (sentiment[teamId].headlines.length < 3 && post.title.length > 20) {
            sentiment[teamId].headlines.push({ title: post.title, ups: post.ups || 0, sub });
          }
        }
      }
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Normalize scores
  const maxPosts = Math.max(1, ...Object.values(sentiment).map(b => b.posts));
  for (const teamId of Object.keys(sentiment)) {
    const b = sentiment[teamId];
    b.score = Math.min(100, Math.round((b.posts / maxPosts) * 100));
    b.sentiment = b.sentimentScore > 3 ? "positive" : b.sentimentScore < -3 ? "negative" : "neutral";
    b.buzz = b.upvotes;
  }

  console.log(`  Reddit: ${Object.keys(sentiment).length} teams, ${posts.length} total posts scanned`);
  return { teamSentiment: sentiment, recentPosts: posts.slice(0, 20) };
}

// ── 8. Google News — broader CFB coverage ──────────────────────────────
const CFB_NEWS_SEARCHES = [
  "college football injury",
  "college football transfer portal",
  "college football coaching change",
  "college football suspended",
  "college football depth chart",
  "NCAA college football",
  "CFB picks predictions",
  "college football spread odds",
];

async function scrapeGoogleNewsBroad() {
  const allItems = [];
  const BATCH = 3;
  for (let i = 0; i < CFB_NEWS_SEARCHES.length; i += BATCH) {
    await Promise.all(CFB_NEWS_SEARCHES.slice(i, i + BATCH).map(async query => {
      const q = encodeURIComponent(query);
      const xml = await safeFetch(
        `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`,
        { text: true }
      );
      const items = parseRSS(xml, 5);
      allItems.push(...items.map(item => ({ ...item, searchQuery: query })));
    }));
    if (i + BATCH < CFB_NEWS_SEARCHES.length) await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`  Google News broad: ${allItems.length} items`);
  return allItems;
}

// ── 9. BettingPros Expert Consensus ────────────────────────────────────
async function scrapeBettingPros() {
  const html = await safeFetch("https://www.bettingpros.com/ncaaf/picks/", {
    text: true,
    headers: { "Referer": "https://www.bettingpros.com/" },
  });
  if (!html) return [];

  const picks = [];
  // BettingPros uses React; try to find JSON data in script tags
  const scriptMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});\s*<\/script>/);
  if (scriptMatch) {
    try {
      const data = JSON.parse(scriptMatch[1]);
      const events = data?.events || data?.games || [];
      for (const event of events.slice(0, 30)) {
        const consensus = event.consensusPick || event.pick;
        if (consensus) {
          picks.push({
            homeTeam: event.homeTeam?.name || "",
            awayTeam: event.awayTeam?.name || "",
            consensusPick: consensus,
            expertCount: event.expertCount || null,
            spread: event.spread || null,
          });
        }
      }
    } catch {}
  }

  // Fallback: parse visible pick data from HTML
  if (!picks.length) {
    const pickBlocks = html.match(/data-pick="[^"]+"/g) || [];
    for (const block of pickBlocks.slice(0, 20)) {
      const pick = block.match(/data-pick="([^"]+)"/)?.[1];
      if (pick) picks.push({ rawPick: pick, source: "bettingpros" });
    }
  }

  console.log(`  BettingPros: ${picks.length} consensus picks`);
  return picks;
}

// ── RSS Parser (shared) ─────────────────────────────────────────────────
const IMPACT_KEYWORDS = {
  critical: ["arrested","charged","indicted","suspended indefinitely","dismissed from team","expelled","guilty","dui","assault"],
  negative: ["injured","out for season","torn acl","torn","surgery","suspended","dismissed","transfer portal","decommits","fired","resigned","investigation","allegations","banned","out vs","will miss"],
  positive: ["commits","enrolled","returns from","promoted","extension","ranked","honor","drafted","signed","award"],
};

function parseRSS(xml, max = 10) {
  if (!xml) return [];
  const items = [];
  const itemRx = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRx.exec(xml)) !== null && items.length < max) {
    const x = m[1];
    const title   = (x.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || x.match(/<title>(.*?)<\/title>/))?.[1]?.trim() || "";
    const source  = (x.match(/<source[^>]*>(.*?)<\/source>/))?.[1]?.trim() || "News";
    const link    = (x.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/) ||
                     x.match(/<link>(https?:\/\/[^<\s]+)/) ||
                     x.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/))?.[1]?.trim() || "";
    const pubDate = x.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
    if (!title || title.length < 10) continue;
    const lower = title.toLowerCase();
    const isCritical = IMPACT_KEYWORDS.critical.some(w => lower.includes(w));
    const isNegative = IMPACT_KEYWORDS.negative.some(w => lower.includes(w));
    const isPositive = IMPACT_KEYWORDS.positive.some(w => lower.includes(w));
    const sentiment  = isCritical ? "critical" : isNegative ? "negative" : isPositive ? "positive" : "neutral";
    const daysAgo    = pubDate ? Math.max(0, Math.round((Date.now() - new Date(pubDate).getTime()) / 86400000)) : 1;
    items.push({ title, source, link, sentiment, daysAgo, isCritical, pubDate });
  }
  return items;
}

// ── Tag news items to teams ─────────────────────────────────────────────
function tagNewsToTeams(newsItems) {
  const byTeam = {};
  for (const item of newsItems) {
    const lower = item.title.toLowerCase();
    for (const [teamId, keywords] of Object.entries(TEAM_KEYWORDS)) {
      if (keywords.some(kw => lower.includes(kw))) {
        if (!byTeam[teamId]) byTeam[teamId] = [];
        if (byTeam[teamId].length < 5) {
          byTeam[teamId].push(item);
        }
      }
    }
  }
  return byTeam;
}

// ── Load existing web-intel to merge (avoid full overwrite) ─────────────
function loadExisting() {
  try {
    if (existsSync(OUT_FILE)) {
      return JSON.parse(readFileSync(OUT_FILE, "utf8"));
    }
  } catch {}
  return {};
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const startTime = Date.now();
  console.log(`\n🔍 Web intelligence scrape — ${new Date().toUTCString()}\n`);

  // Run all scrapers in parallel (independent sources)
  const [
    atsRankings,
    bettingPcts,
    espnNews,
    sports247,
    athlonNews,
    oddsShark,
    reddit,
    googleNews,
    bettingPros,
  ] = await Promise.allSettled([
    scrapeTeamRankingsATS(),
    scrapeTeamRankingsBetting(),
    scrapeESPNNews(),
    scrape247Sports(),
    scrapeAthlonSports(),
    scrapeOddsShark(),
    scrapeRedditCFB(),
    scrapeGoogleNewsBroad(),
    scrapeBettingPros(),
  ]).then(results => results.map(r => r.status === "fulfilled" ? r.value : null));

  // Merge all news sources into per-team map
  const allNews = [
    ...(espnNews   || []),
    ...(sports247  || []),
    ...(athlonNews || []),
    ...(googleNews || []),
  ];
  const newsByTeam = tagNewsToTeams(allNews);

  // Merge with existing data (keep fresh data, preserve fields we didn't fetch)
  const existing = loadExisting();

  const output = {
    generatedAt:    new Date().toISOString(),
    elapsedMs:      Date.now() - startTime,

    // ATS trends — used by predictor to adjust team quality signals
    atsRankings:    atsRankings   || existing.atsRankings   || {},

    // Public betting % by team name (lowercase)
    bettingPcts:    bettingPcts   || existing.bettingPcts   || {},

    // Consensus expert picks (OddsShark + BettingPros)
    oddsShark:      oddsShark     || existing.oddsShark     || {},
    expertPicks:    bettingPros   || existing.expertPicks   || [],

    // Social intelligence
    redditSentiment: (reddit?.teamSentiment) || existing.redditSentiment || {},
    redditPosts:     (reddit?.recentPosts)   || existing.redditPosts     || [],

    // News feeds by team (tagged)
    newsByTeam:     newsByTeam,
    allNews:        allNews.slice(0, 100),

    // Critical alerts (arrests, suspensions, key injuries from news)
    criticalAlerts: allNews.filter(i => i.isCritical).slice(0, 20),
  };

  writeAtomic(OUT_FILE, JSON.stringify(output, null, 2));

  const ms = Date.now() - startTime;
  console.log(`\n✅ web-intel.json written — ${ms}ms`);
  console.log(`   ATS trends: ${Object.keys(output.atsRankings).length} teams`);
  console.log(`   Betting %: ${Object.keys(output.bettingPcts).length} teams`);
  console.log(`   Reddit: ${Object.keys(output.redditSentiment).length} teams`);
  console.log(`   News: ${allNews.length} items across ${Object.keys(output.newsByTeam).length} teams`);
  console.log(`   Critical alerts: ${output.criticalAlerts.length}`);
  if (output.criticalAlerts.length > 0) {
    console.log("   ⚠️  CRITICAL:", output.criticalAlerts.map(a => a.title).join(" | "));
  }
}

main().catch(err => {
  console.error("❌ scrape-web.mjs failed:", err);
  process.exit(1);
});
