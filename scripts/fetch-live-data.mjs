#!/usr/bin/env node
/**
 * fetch-live-data.mjs — FULL SCOPE
 *
 * Sources:
 *   1. CFBD         — schedule, lines, SP+, ELO, team stats, recruiting, weather, PPA
 *   2. ESPN         — live scores, network, venue, injury reports (all FBS)
 *   3. The Odds API — 20+ book line comparison, sharp-book vs public-book divergence
 *   4. Action Network (unofficial) — public betting %, handle counts
 *   5. OpenMeteo    — free game-day weather forecast (no key needed)
 *   6. Reddit CFB   — hot posts → team buzz + sentiment (free, no key)
 *   7. Google News  — per-matchup headlines → beat-writer cards (free, no key)
 *   8. Covers.com   — consensus public betting % fallback (scrape)
 *
 * GitHub Secrets used:
 *   CFBD_API_KEY  — required (already in repo)
 *   ODDS_API_KEY    — optional free at the-odds-api.com (500 req/month, US books)
 *   ODDSPAPI_KEY    — optional free at oddspapi.io (250 req/month, includes Pinnacle = sharp reference)
 */

import { writeFileSync, readFileSync, renameSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, "..", "data");
const SEASON    = 2026;

// Atomic write: write to a PID-unique .tmp then rename so neither a mid-write crash nor
// two concurrent script runs can corrupt data files.
function writeAtomic(filepath, content) {
  const tmp = `${filepath}.${process.pid}.tmp`;
  writeFileSync(tmp, content);
  renameSync(tmp, filepath);
}

const CFBD_BASE     = "https://api.collegefootballdata.com";
// ESPN has two APIs: site.api.espn.com (mobile) and site.web.api.espn.com (web).
// The web API is what ESPN.com's front-end uses and has fuller schedule coverage.
const ESPN_BASE     = "https://site.web.api.espn.com/apis/site/v2/sports/football/college-football";
const ESPN_CORE     = "https://sports.core.api.espn.com/v2/sports/football/leagues/college-football";
const ODDS_BASE     = "https://api.the-odds-api.com/v4";
const ODDSPAPI_BASE = "https://api.oddspapi.io";
const METEO_BASE    = "https://api.open-meteo.com/v1";
const ACTION_BASE   = "https://api.actionnetwork.com/web/v1";
const REDDIT_BASE   = "https://www.reddit.com";
const GNEWS_BASE    = "https://news.google.com/rss/search";

const CFBD_KEY     = process.env.CFBD_API_KEY;
if (!CFBD_KEY) { console.error("❌ CFBD_API_KEY not set — aborting fetch"); process.exit(1); }
const ODDS_KEY     = process.env.ODDS_API_KEY  || null;  // free at the-odds-api.com
const ODDSPAPI_KEY = process.env.ODDSPAPI_KEY  || null;  // free at oddspapi.io — includes Pinnacle (sharp reference)

// ── School → internal ID ────────────────────────────────────────────────────
const SCHOOL_TO_ID = {
  LSU:"lsu",Georgia:"georgia",Alabama:"alabama",Texas:"texas",
  "Notre Dame":"notre_dame","Penn State":"penn_state",Michigan:"michigan",
  Clemson:"clemson","Ohio State":"ohio_state",Oregon:"oregon",
  Tennessee:"tennessee",Miami:"miami",Auburn:"auburn",Florida:"florida",
  "Florida State":"florida_state",Wisconsin:"wisconsin",
  Illinois:"illinois",Indiana:"indiana",Iowa:"iowa",Maryland:"maryland",
  "Michigan State":"michigan_state",Minnesota:"minnesota",
  Nebraska:"nebraska",Northwestern:"northwestern",Purdue:"purdue",
  Rutgers:"rutgers",UCLA:"ucla",USC:"usc",Washington:"washington",
  "Oregon State":"oregon_state","Washington State":"washington_state",
  Arkansas:"arkansas",Kentucky:"kentucky",
  "Mississippi State":"mississippi_state",Missouri:"missouri",
  "Ole Miss":"ole_miss",Mississippi:"ole_miss",
  "South Carolina":"south_carolina","Texas A&M":"texas_am",Vanderbilt:"vanderbilt",
  "Boston College":"boston_college",California:"cal",
  Duke:"duke","Georgia Tech":"georgia_tech",Louisville:"louisville",
  "NC State":"nc_state","North Carolina State":"nc_state",
  "North Carolina":"north_carolina",Pittsburgh:"pittsburgh",
  Syracuse:"syracuse",Virginia:"virginia","Virginia Tech":"virginia_tech",
  "Wake Forest":"wake_forest",SMU:"smu",Stanford:"stanford",
  Arizona:"arizona","Arizona State":"arizona_state",Cal:"cal",Baylor:"baylor",
  BYU:"byu",Cincinnati:"cincinnati",Colorado:"colorado",
  Houston:"houston","Iowa State":"iowa_state",Kansas:"kansas",
  "Kansas State":"kansas_state","Oklahoma State":"oklahoma_state",
  TCU:"tcu","Texas Tech":"texas_tech",UCF:"ucf",Utah:"utah",
  "West Virginia":"west_virginia",
  Army:"army","East Carolina":"east_carolina",Memphis:"memphis",
  Navy:"navy","North Texas":"north_texas",Rice:"rice",
  "South Florida":"south_florida",Tulane:"tulane",Tulsa:"tulsa",
  UTSA:"utsa",UAB:"uab",Charlotte:"charlotte",
  "Florida Atlantic":"fau",FAU:"fau",
  "Air Force":"air_force","Boise State":"boise_state",
  "Colorado State":"colorado_state","Fresno State":"fresno_state",
  Hawaii:"hawaii",Nevada:"nevada","New Mexico":"new_mexico",
  "San Diego State":"san_diego_state","San Jose State":"san_jose_state",
  UNLV:"unlv","Utah State":"utah_state",Wyoming:"wyoming",
  "Appalachian State":"app_state","App State":"app_state",
  "Arkansas State":"arkansas_state","Coastal Carolina":"coastal_carolina",
  "Georgia Southern":"georgia_southern","Georgia State":"georgia_state",
  "James Madison":"james_madison",Louisiana:"louisiana",
  "Louisiana Monroe":"ul_monroe","UL Monroe":"ul_monroe",
  Marshall:"marshall","Old Dominion":"old_dominion",
  "South Alabama":"south_alabama","Texas State":"texas_state",Troy:"troy",
  Akron:"akron","Ball State":"ball_state",
  "Bowling Green":"bowling_green",Buffalo:"buffalo",
  "Central Michigan":"central_michigan","Eastern Michigan":"eastern_michigan",
  "Kent State":"kent_state","Miami (OH)":"miami_oh",
  "Northern Illinois":"northern_illinois",Ohio:"ohio",
  Toledo:"toledo","Western Michigan":"western_michigan",
  FIU:"fiu","Florida International":"fiu",
  "Jacksonville State":"jacksonville_state","Kennesaw State":"kennesaw_state",
  "La Tech":"la_tech","Louisiana Tech":"la_tech",Liberty:"liberty",
  "Middle Tennessee":"middle_tennessee","New Mexico State":"new_mexico_state",
  "Sam Houston":"sam_houston","Southern Miss":"southern_miss",
  UTEP:"utep","Western Kentucky":"western_kentucky",
  UConn:"uconn",Connecticut:"uconn",UMass:"umass",Massachusetts:"umass",
};

function schoolToId(name) {
  if (!name) return null;
  if (SCHOOL_TO_ID[name] !== undefined) return SCHOOL_TO_ID[name];
  return name.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"") || null;
}

// ── Stadium coordinates (for weather) ──────────────────────────────────────
const STADIUM_COORDS = {
  ohio_state:      { lat:40.0017,  lon:-83.0197,  dome:false },
  alabama:         { lat:33.2087,  lon:-87.5502,  dome:false },
  georgia:         { lat:33.9497,  lon:-83.3736,  dome:false },
  michigan:        { lat:42.2659,  lon:-83.7487,  dome:false },
  texas:           { lat:30.2840,  lon:-97.7326,  dome:false },
  notre_dame:      { lat:41.6982,  lon:-86.2338,  dome:false },
  penn_state:      { lat:40.7982,  lon:-77.8597,  dome:false },
  clemson:         { lat:34.6782,  lon:-82.8437,  dome:false },
  lsu:             { lat:30.4122,  lon:-91.1837,  dome:false },
  oregon:          { lat:44.0565,  lon:-123.0690, dome:false },
  tennessee:       { lat:35.9549,  lon:-83.9251,  dome:false },
  miami:           { lat:25.9580,  lon:-80.2388,  dome:true  },
  auburn:          { lat:32.6012,  lon:-85.4910,  dome:false },
  florida:         { lat:29.6497,  lon:-82.3487,  dome:false },
  florida_state:   { lat:30.4390,  lon:-84.3070,  dome:false },
  wisconsin:       { lat:43.0706,  lon:-89.4125,  dome:false },
  texas_am:        { lat:30.6100,  lon:-96.3403,  dome:false },
  oklahoma_state:  { lat:36.1254,  lon:-97.0682,  dome:false },
  kansas_state:    { lat:39.2015,  lon:-96.5958,  dome:false },
  iowa:            { lat:41.6584,  lon:-91.5507,  dome:false },
  iowa_state:      { lat:42.0149,  lon:-93.6358,  dome:false },
  utah:            { lat:40.7610,  lon:-111.8484, dome:false },
  byu:             { lat:40.2574,  lon:-111.6546, dome:false },
  boise_state:     { lat:43.6033,  lon:-116.2008, dome:false },
  arizona_state:   { lat:33.4255,  lon:-111.9323, dome:false },
  arizona:         { lat:32.2287,  lon:-110.9481, dome:false },
  usc:             { lat:34.0141,  lon:-118.2877, dome:false },
  ucla:            { lat:34.1614,  lon:-118.1681, dome:false },
  washington:      { lat:47.6503,  lon:-122.3015, dome:false },
  colorado:        { lat:40.0097,  lon:-105.2668, dome:false },
  stanford:        { lat:37.4345,  lon:-122.1609, dome:false },
  smu:             { lat:32.8129,  lon:-96.7765,  dome:false },
  houston:         { lat:29.7200,  lon:-95.3413,  dome:true  },
  tulane:          { lat:29.9428,  lon:-90.1228,  dome:true  },
  army:            { lat:41.3896,  lon:-73.9941,  dome:false },
  navy:            { lat:38.9831,  lon:-76.4817,  dome:false },
  pittsburgh:      { lat:40.4415,  lon:-79.9584,  dome:false },
  virginia_tech:   { lat:37.2201,  lon:-80.4154,  dome:false },
  north_carolina:  { lat:35.9049,  lon:-79.0469,  dome:false },
  nc_state:        { lat:35.7762,  lon:-78.6749,  dome:false },
  duke:            { lat:36.0004,  lon:-78.9394,  dome:false },
  wake_forest:     { lat:36.1305,  lon:-80.2786,  dome:false },
  louisville:      { lat:38.2147,  lon:-85.7596,  dome:false },
  boston_college:  { lat:42.3347,  lon:-71.1675,  dome:false },
  syracuse:        { lat:43.0363,  lon:-76.1362,  dome:true  },
  virginia:        { lat:38.0313,  lon:-78.5094,  dome:false },
  georgia_tech:    { lat:33.7721,  lon:-84.3926,  dome:false },
  kentucky:        { lat:38.0220,  lon:-84.5018,  dome:false },
  arkansas:        { lat:36.0687,  lon:-94.1760,  dome:false },
  south_carolina:  { lat:33.9972,  lon:-81.0250,  dome:false },
  vanderbilt:      { lat:36.1440,  lon:-86.8137,  dome:false },
  ole_miss:        { lat:34.3634,  lon:-89.5309,  dome:false },
  mississippi_state:{ lat:33.4560, lon:-88.7896,  dome:false },
  missouri:        { lat:38.9356,  lon:-92.3338,  dome:false },
  west_virginia:   { lat:39.6497,  lon:-79.9554,  dome:false },
  nebraska:        { lat:40.8197,  lon:-96.7058,  dome:false },
  minnesota:       { lat:44.9778,  lon:-93.2296,  dome:false },
  maryland:        { lat:38.9894,  lon:-76.9445,  dome:false },
  indiana:         { lat:39.1840,  lon:-86.5258,  dome:false },
  purdue:          { lat:40.4593,  lon:-86.9986,  dome:false },
  illinois:        { lat:40.0993,  lon:-88.2340,  dome:false },
  northwestern:    { lat:42.0585,  lon:-87.6679,  dome:false },
  rutgers:         { lat:40.5076,  lon:-74.4497,  dome:false },
  michigan_state:  { lat:42.7276,  lon:-84.4840,  dome:false },
  tcu:             { lat:32.7096,  lon:-97.3677,  dome:false },
  texas_tech:      { lat:33.5913,  lon:-101.8748, dome:false },
  baylor:          { lat:31.5588,  lon:-97.1195,  dome:false },
  ucf:             { lat:28.6004,  lon:-81.1912,  dome:false },
  cincinnati:      { lat:39.1017,  lon:-84.5161,  dome:false },
  memphis:         { lat:35.1327,  lon:-90.0281,  dome:false },
};

// ── Team name aliases for Reddit sentiment matching ─────────────────────────
const TEAM_ALIASES = {
  ohio_state:["ohio state","buckeyes","osu"],
  alabama:["alabama","crimson tide","bama"],
  georgia:["georgia","bulldogs","uga"],
  michigan:["michigan","wolverines"],
  texas:["texas","longhorns","ut"],
  notre_dame:["notre dame","fighting irish","nd"],
  penn_state:["penn state","nittany lions","psu"],
  clemson:["clemson","tigers"],
  lsu:["lsu","tigers","louisiana state"],
  oregon:["oregon","ducks"],
  tennessee:["tennessee","vols","volunteers"],
  miami:["miami","hurricanes","the u"],
  auburn:["auburn","tigers"],
  florida:["florida","gators","uf"],
  florida_state:["florida state","seminoles","fsu"],
  texas_am:["texas a&m","aggies"],
  boise_state:["boise state","broncos"],
  iowa:["iowa","hawkeyes"],
  utah:["utah","utes"],
  washington:["washington","huskies","uw"],
  colorado:["colorado","buffaloes","buffs"],
  oklahoma_state:["oklahoma state","cowboys","okst"],
  kansas_state:["kansas state","wildcats","ksu"],
};

// ── HTTP helpers ──────────────────────────────────────────────────────────
const UA = "TheBet/2.0 (cfb-predictor; contact rfisher55@github.com)";

async function cfbdFetch(endpoint) {
  try {
    const r = await fetch(`${CFBD_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${CFBD_KEY}` },
      signal: AbortSignal.timeout(15000),
    });
    if (r.status === 401 || r.status === 403) {
      // Auth failure — bail immediately so the workflow log shows a clear error
      // instead of silently returning 0 games after dozens of failed requests.
      const body = await r.text().catch(() => '');
      console.error(`❌ CFBD auth error ${r.status} on ${endpoint}: ${body.slice(0,120)}`);
      console.error('   → Rotate CFBD_API_KEY at collegefootballdata.com and update the GitHub secret.');
      process.exit(1);
    }
    if (!r.ok) { console.warn(`  CFBD ${r.status}: ${endpoint}`); return null; }
    return await r.json();
  } catch (e) { console.warn(`  CFBD fail: ${endpoint} — ${e.message}`); return null; }
}

async function espnFetch(endpoint) {
  try {
    const r = await fetch(`${ESPN_BASE}${endpoint}`, { headers:{ "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) { console.warn(`  ESPN ${r.status}: ${endpoint}`); return null; }
    return await r.json();
  } catch (e) { console.warn(`  ESPN fail: ${endpoint} — ${e.message}`); return null; }
}

async function safeFetch(url, opts = {}) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, ...opts.headers }, signal: AbortSignal.timeout(15000), ...opts });
    if (!r.ok) return null;
    return opts.text ? await r.text() : await r.json();
  } catch { return null; }
}

// ── ESPN: parse a competition event into our byKey format ───────────────
function parseESPNEvent(ev, byKey) {
  const comp = ev.competitions?.[0];
  if (!comp) return;
  const home = comp.competitors?.find(c => c.homeAway === "home");
  const away = comp.competitors?.find(c => c.homeAway === "away");
  if (!home || !away) return;
  const statusName = ev.status?.type?.name || "STATUS_SCHEDULED";
  const completed  = statusName === "STATUS_FINAL";
  const inProgress = statusName === "STATUS_IN_PROGRESS";
  const homeDisplay = home.team?.displayName || "";
  const awayDisplay = away.team?.displayName || "";
  // location = school name without mascot (e.g. "LSU" not "LSU Tigers")
  const homeLocation = home.team?.location || homeDisplay;
  const awayLocation = away.team?.location || awayDisplay;
  const key = `${homeDisplay}|${awayDisplay}`;
  byKey[key] = {
    espnId:       ev.id,
    homeTeamName: homeDisplay,
    awayTeamName: awayDisplay,
    homeLocation,
    awayLocation,
    homeScore:    completed||inProgress ? parseInt(home.score)||null : null,
    awayScore:    completed||inProgress ? parseInt(away.score)||null : null,
    date:         (ev.date||"").slice(0,10),
    time:         completed||inProgress
      ? (ev.status?.type?.shortDetail||"Final")
      : toTime(ev.date, false),
    network:      comp.broadcasts?.[0]?.names?.[0] || comp.geoBroadcasts?.[0]?.media?.shortName || "TBD",
    status:       completed ? "final" : inProgress ? "in_progress" : "scheduled",
    week:         ev.week?.number || null,
    neutralSite:  comp.neutralSite || false,
    venue:        comp.venue?.fullName || "",
    venueCity:    comp.venue?.address?.city || "",
    venueState:   comp.venue?.address?.state || "",
  };
}

// CFB dates for 2026: Week 0 Saturday, then Thu/Fri/Sat every week,
// Thanksgiving week, conference championship weekend, and Army-Navy.
const CFB_DATES_2026 = [
  // Week 0
  "20260822",
  // Week 1
  "20260827","20260828","20260829",
  // Weeks 2-13: Thursday + Friday + Saturday
  "20260903","20260904","20260905",
  "20260910","20260911","20260912",
  "20260917","20260918","20260919",
  "20260924","20260925","20260926",
  "20261001","20261002","20261003",
  "20261008","20261009","20261010",
  "20261015","20261016","20261017",
  "20261022","20261023","20261024",
  "20261029","20261030","20261031",
  "20261105","20261106","20261107",
  "20261112","20261113","20261114",
  "20261119","20261120","20261121",
  // Thanksgiving week
  "20261124","20261125","20261126","20261127","20261128",
  // Conference championship weekend
  "20261203","20261204","20261205","20261206",
  // Army-Navy
  "20261212",
];

// ── ESPN: scoreboard using site.web.api.espn.com with specific YYYYMMDD dates ─
// ESPN.com's frontend uses site.web.api.espn.com (not site.api.espn.com).
// Querying specific dates rather than a year lets us get pre-published schedules.
async function fetchESPNScoreboard() {
  const byKey = {};
  const BATCH = 8;
  for (let i = 0; i < CFB_DATES_2026.length; i += BATCH) {
    const batch = CFB_DATES_2026.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(d => espnFetch(`/scoreboard?groups=80&limit=200&seasontype=2&dates=${d}`))
    );
    for (const r of results) {
      const events = r.status === "fulfilled" ? r.value?.events : null;
      if (!events) continue;
      for (const ev of events) parseESPNEvent(ev, byKey);
    }
    if (i + BATCH < CFB_DATES_2026.length) await new Promise(r => setTimeout(r, 200));
  }
  console.log(`  ESPN scoreboard (web API, ${CFB_DATES_2026.length} dates): ${Object.keys(byKey).length} games`);
  return byKey;
}

// ── ESPN: team schedule endpoint — returns full future-season schedules ───
// ESPN's scoreboard API only returns current/recent games.
// The team schedule endpoint returns the full schedule including future seasons.
// We fetch one team per FBS conference to cover all games without hitting every team.
// ESPN deduplicates by event ID so each game only appears once.
async function fetchESPNTeamSchedules() {
  // Representative FBS teams — covers all conferences and independent schedules.
  // Each game appears in both teams' schedules so ~30 teams covers all FBS matchups.
  const SAMPLE_ESPN_IDS = [
    99,   // LSU
    333,  // Alabama
    61,   // Georgia
    251,  // Texas
    87,   // Notre Dame
    213,  // Penn State
    130,  // Michigan
    228,  // Clemson
    194,  // Ohio State
    2483, // Oregon
    2633, // Tennessee
    2390, // Miami
    52,   // Florida State
    245,  // Texas A&M
    2,    // Auburn
    57,   // Florida
    30,   // USC
    264,  // Washington
    254,  // Utah
    252,  // BYU
    68,   // Boise State
    66,   // Iowa State
    2306, // Kansas State
    2628, // TCU
    248,  // Houston
    2655, // Tulane
    235,  // Memphis
    2026, // App State
    349,  // Army
    2426, // Navy
  ];

  const byKey = {};
  const seenIds = new Set();

  // Batch 6 at a time to avoid rate limits
  for (let i = 0; i < SAMPLE_ESPN_IDS.length; i += 6) {
    const batch = SAMPLE_ESPN_IDS.slice(i, i + 6);
    await Promise.all(batch.map(async espnId => {
      const data = await espnFetch(`/teams/${espnId}/schedule?season=${SEASON}`);
      const events = data?.events || [];
      for (const ev of events) {
        if (!ev.id || seenIds.has(ev.id)) continue;
        seenIds.add(ev.id);
        parseESPNEvent(ev, byKey);
      }
    }));
    if (i + 6 < SAMPLE_ESPN_IDS.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  console.log(`  ESPN team schedules: ${Object.keys(byKey).length} unique games from ${SAMPLE_ESPN_IDS.length} teams`);
  return byKey;
}

// ── ESPN: injuries — ALL FBS teams (full list) ───────────────────────────
async function fetchESPNInjuries() {
  const ESPN_TEAM_IDS = {
    alabama:333,auburn:2,florida:57,georgia:61,lsu:99,ohio_state:194,
    michigan:130,penn_state:213,clemson:228,notre_dame:87,texas:251,
    oregon:2483,texas_am:245,tennessee:2633,miami:2390,baylor:239,
    iowa:2294,wisconsin:275,oklahoma_state:197,kansas_state:2306,
    utah:254,byu:252,cincinnati:2132,ucf:2116,florida_state:52,
    north_carolina:153,pittsburgh:221,virginia_tech:259,louisville:97,
    wake_forest:154,boston_college:103,duke:150,syracuse:183,virginia:258,
    stanford:24,cal:25,smu:2567,arizona_state:9,arizona:12,
    colorado:38,west_virginia:277,iowa_state:66,kansas:2305,texas_tech:2641,
    tcu:2628,houston:248,north_texas:249,memphis:235,tulane:2655,navy:2426,
    army:349,south_florida:58,east_carolina:151,rice:242,boise_state:68,
    fresno_state:278,san_diego_state:21,nevada:2440,unlv:2439,wyoming:2751,
    air_force:2005,utah_state:328,new_mexico:167,hawaii:62,colorado_state:36,
    kentucky:96,arkansas:8,south_carolina:2579,vanderbilt:238,ole_miss:145,
    mississippi_state:344,missouri:142,nebraska:158,minnesota:135,maryland:120,
    indiana:84,purdue:2509,illinois:356,northwestern:77,rutgers:164,
    michigan_state:127,usc:30,ucla:26,washington:264,oregon_state:204,
    washington_state:265,georgia_tech:59,nc_state:152,
    app_state:2026,coastal_carolina:324,liberty:2335,marshall:276,
    old_dominion:295,james_madison:2259,western_kentucky:98,utsa:2636,
    uab:2629,fau:2226,fiu:2296,charlotte:2429,southern_miss:2572,
    troy:2653,south_alabama:6,louisiana:309,ul_monroe:2433,arkansas_state:2032,
    georgia_southern:290,georgia_state:2247,texas_state:326,middle_tennessee:2393,
    new_mexico_state:166,la_tech:2348,sam_houston:2534,utep:2638,
    akron:2006,ball_state:2050,bowling_green:189,buffalo:2084,
    central_michigan:2117,eastern_michigan:2199,kent_state:2307,miami_oh:193,
    northern_illinois:2459,ohio:195,toledo:2649,western_michigan:2711,
    uconn:41,umass:113,tulsa:202,
  };
  const injuries = {};
  const entries = Object.entries(ESPN_TEAM_IDS);
  for (let i = 0; i < entries.length; i += 10) {
    await Promise.all(entries.slice(i,i+10).map(async ([teamId, espnId]) => {
      try {
        const d = await espnFetch(`/teams/${espnId}?enable=injuries`);
        const injs = d?.team?.injuries || [];
        if (injs.length) {
          injuries[teamId] = injs.map(inj => ({
            player:     inj.athlete?.displayName || "Unknown",
            position:   inj.athlete?.position?.abbreviation || "",
            status:     inj.status || "Questionable",
            detail:     inj.longComment || inj.shortComment || "",
            returnDate: inj.returnDate || null,
          }));
        }
      } catch {}
    }));
  }
  return injuries;
}

// ── ESPN: fetch rosters for ALL FBS teams ─────────────────────────────────
async function fetchESPNRosters() {
  const ESPN_TEAM_IDS = {
    alabama:333,auburn:2,florida:57,georgia:61,lsu:99,ohio_state:194,
    michigan:130,penn_state:213,clemson:228,notre_dame:87,texas:251,
    oregon:2483,texas_am:245,tennessee:2633,miami:2390,baylor:239,
    iowa:2294,wisconsin:275,oklahoma_state:197,kansas_state:2306,
    utah:254,byu:252,cincinnati:2132,ucf:2116,florida_state:52,
    north_carolina:153,pittsburgh:221,virginia_tech:259,louisville:97,
    wake_forest:154,boston_college:103,duke:150,syracuse:183,virginia:258,
    stanford:24,cal:25,smu:2567,arizona_state:9,arizona:12,
    colorado:38,west_virginia:277,iowa_state:66,kansas:2305,texas_tech:2641,
    tcu:2628,houston:248,north_texas:249,memphis:235,tulane:2655,navy:2426,
    army:349,south_florida:58,east_carolina:151,rice:242,boise_state:68,
    fresno_state:278,san_diego_state:21,nevada:2440,unlv:2439,wyoming:2751,
    air_force:2005,utah_state:328,new_mexico:167,hawaii:62,colorado_state:36,
    kentucky:96,arkansas:8,south_carolina:2579,vanderbilt:238,ole_miss:145,
    mississippi_state:344,missouri:142,nebraska:158,minnesota:135,maryland:120,
    indiana:84,purdue:2509,illinois:356,northwestern:77,rutgers:164,
    michigan_state:127,usc:30,ucla:26,washington:264,oregon_state:204,
    washington_state:265,georgia_tech:59,nc_state:152,
    app_state:2026,coastal_carolina:324,liberty:2335,marshall:276,
    old_dominion:295,james_madison:2259,western_kentucky:98,utsa:2636,
    uab:2629,fau:2226,fiu:2296,charlotte:2429,southern_miss:2572,
    troy:2653,south_alabama:6,louisiana:309,ul_monroe:2433,arkansas_state:2032,
    georgia_southern:290,georgia_state:2247,texas_state:326,middle_tennessee:2393,
    new_mexico_state:166,la_tech:2348,sam_houston:2534,utep:2638,
    akron:2006,ball_state:2050,bowling_green:189,buffalo:2084,
    central_michigan:2117,eastern_michigan:2199,kent_state:2307,miami_oh:193,
    northern_illinois:2459,ohio:195,toledo:2649,western_michigan:2711,
    uconn:41,umass:113,tulsa:202,
  };
  const SKILL_POSITIONS = new Set(["QB","RB","WR","TE","EDGE","DE","DT","LB","OLB","ILB","CB","S","DB","FS","SS"]);
  const rosters = {};
  const entries = Object.entries(ESPN_TEAM_IDS);
  for (let i = 0; i < entries.length; i += 8) {
    await Promise.all(entries.slice(i, i + 8).map(async ([teamId, espnId]) => {
      try {
        const d = await espnFetch(`/teams/${espnId}/roster?limit=150`);
        const players = [];
        for (const group of (d?.athletes || [])) {
          for (const athlete of (group.items || group.athletes || [])) {
            const pos = athlete.position?.abbreviation || "";
            if (!SKILL_POSITIONS.has(pos)) continue;
            players.push({
              name:        (athlete.displayName || athlete.fullName || "").trim(),
              number:      (athlete.jersey || "").toString(),
              position:    pos,
              year:        athlete.experience?.displayValue || "",
              heightWeight:(athlete.displayHeight && athlete.displayWeight)
                ? `${athlete.displayHeight} / ${athlete.displayWeight}` : "",
              status:      (athlete.injuries?.[0]?.status || athlete.status?.type || "active").toLowerCase(),
              injuryType:  athlete.injuries?.[0]?.longComment || athlete.injuries?.[0]?.type || null,
            });
          }
        }
        if (players.length) rosters[teamId] = players;
      } catch {}
    }));
    if (i + 8 < entries.length) await new Promise(r => setTimeout(r, 300));
  }
  const total = Object.values(rosters).reduce((s, r) => s + r.length, 0);
  console.log(`  ESPN rosters: ${Object.keys(rosters).length} teams, ${total} skill-position players`);
  return rosters;
}

// ── The Odds API — multi-book line comparison ───────────────────────────
async function fetchOddsAPI() {
  if (!ODDS_KEY) { console.log("  Odds API: no key — skipping (add ODDS_API_KEY secret for 20+ book comparison)"); return {}; }
  const url = `${ODDS_BASE}/sports/americanfootball_ncaaf/odds/?apiKey=${ODDS_KEY}&regions=us&markets=spreads,totals,h2h&oddsFormat=american&bookmakers=draftkings,fanduel,betmgm,caesars,pointsbet,pinnacle,williamhill_us,betonlineag,bovada,lowvig,mybookieag`;
  const data = await safeFetch(url);
  if (!data || !Array.isArray(data)) return {};
  const byKey = {};
  for (const game of data) {
    const home = game.home_team, away = game.away_team;
    const key = `${home}|${away}`;
    // Sharp books (respected by sharps) vs public books
    const SHARP_BOOKS  = ["pinnacle","lowvig","mybookieag","betonlineag","bovada"];
    const PUBLIC_BOOKS = ["draftkings","fanduel","betmgm","caesars","pointsbet"];
    const spreadsByBook = {}, totalsByBook = {};
    for (const bm of game.bookmakers || []) {
      const spreads = bm.markets?.find(m => m.key === "spreads");
      const totals  = bm.markets?.find(m => m.key === "totals");
      const homeSpread = spreads?.outcomes?.find(o => o.name === home)?.point;
      const totalLine  = totals?.outcomes?.find(o => o.name === "Over")?.point;
      if (homeSpread != null) spreadsByBook[bm.key] = homeSpread;
      if (totalLine  != null) totalsByBook[bm.key]  = totalLine;
    }
    // Consensus spread across all books
    const allSpreads = Object.values(spreadsByBook);
    const consensus  = allSpreads.length ? allSpreads.reduce((a,b)=>a+b,0)/allSpreads.length : null;
    // Sharp vs public divergence
    const sharpSpreads  = SHARP_BOOKS.filter(b => spreadsByBook[b] != null).map(b => spreadsByBook[b]);
    const publicSpreads = PUBLIC_BOOKS.filter(b => spreadsByBook[b] != null).map(b => spreadsByBook[b]);
    const sharpAvg  = sharpSpreads.length  ? sharpSpreads.reduce((a,b)=>a+b,0)/sharpSpreads.length  : null;
    const publicAvg = publicSpreads.length ? publicSpreads.reduce((a,b)=>a+b,0)/publicSpreads.length : null;
    const divergence = sharpAvg != null && publicAvg != null ? sharpAvg - publicAvg : null;
    // If sharp books price home team lower (more points given) than public = sharp on home
    let sharpSignal = null;
    if (divergence != null && Math.abs(divergence) >= 1) {
      sharpSignal = divergence < 0 ? "home" : "away"; // sharp books give more points to away = sharp on away
    }
    byKey[key] = {
      bookCount:   Object.keys(spreadsByBook).length,
      consensus,
      sharpAvg,
      publicAvg,
      divergence,
      sharpSignal,
      byBook: spreadsByBook,
    };
  }
  console.log(`  Odds API: ${Object.keys(byKey).length} games from ${ODDS_KEY ? "live feed" : "no key"}`);
  return byKey;
}

// ── OddsPapi — Pinnacle lines as sharp reference ─────────────────────────
// Free at oddspapi.io (250 req/month). Pinnacle is the gold standard sharp book.
async function fetchOddsPapi() {
  if (!ODDSPAPI_KEY) { console.log("  OddsPapi: no key — skipping (add ODDSPAPI_KEY for Pinnacle sharp reference)"); return {}; }
  const url = `${ODDSPAPI_BASE}/v1/odds?apiKey=${ODDSPAPI_KEY}&sport=americanfootball_ncaaf&bookmaker=pinnacle&markets=spreads,totals`;
  const data = await safeFetch(url);
  if (!data?.data) return {};
  const byKey = {};
  for (const game of data.data) {
    const key = `${game.home_team}|${game.away_team}`;
    const spreads = game.bookmakers?.[0]?.markets?.find(m=>m.key==="spreads");
    const totals  = game.bookmakers?.[0]?.markets?.find(m=>m.key==="totals");
    byKey[key] = {
      pinnacleSpread: spreads?.outcomes?.find(o=>o.name===game.home_team)?.point ?? null,
      pinnacleTotal:  totals?.outcomes?.find(o=>o.name==="Over")?.point ?? null,
    };
  }
  console.log(`  OddsPapi (Pinnacle): ${Object.keys(byKey).length} games`);
  return byKey;
}

// ── Action Network (unofficial) — public betting % ──────────────────────
// Tries multiple endpoint patterns; Action Network frequently changes their API paths.
async function fetchActionNetworkBetting() {
  const results = {};
  const headers = {
    "User-Agent":      UA,
    "Origin":          "https://www.actionnetwork.com",
    "Referer":         "https://www.actionnetwork.com/ncaaf/picks",
    "Accept":          "application/json",
    "Accept-Language": "en-US,en;q=0.9",
  };

  // Try multiple date windows (today + next 7 days)
  const dates = [];
  for (let i = 0; i <= 7; i++) {
    dates.push(new Date(Date.now() + i*86400000).toISOString().slice(0,10));
  }

  // Try current endpoint patterns — AN rotates these occasionally
  const endpoints = [
    `${ACTION_BASE}/games?sport=ncaaf&include=odds,betting_percentages`,
    `${ACTION_BASE}/games?sport=ncaaf&date=${dates[0]}`,
    `${ACTION_BASE}/scoreboard?sport=ncaaf`,
  ];

  for (const url of endpoints) {
    const data = await safeFetch(url, { headers });
    if (!data?.games?.length) continue;
    for (const g of data.games) {
      const home = g.teams?.find(t => t.designation === "home");
      const away = g.teams?.find(t => t.designation === "away");
      if (!home || !away) continue;
      const hn = home.full_name || home.name || "";
      const an = away.full_name || away.name || "";
      const key = `${hn}|${an}`;
      const bp = g.game_detail?.betting_percentages || g.odds?.betting_percentages;
      const sp = g.game_detail?.spread_percentage   || g.odds?.spread_percentage;
      if (bp || sp) {
        results[key] = {
          homeBetPct:   bp?.home_spread ?? sp?.home ?? null,
          awayBetPct:   bp?.away_spread ?? sp?.away ?? null,
          overBetPct:   bp?.over ?? null,
          underBetPct:  bp?.under ?? null,
          homeMoneyPct: bp?.home_ml ?? null,
          totalHandles: g.game_detail?.total_bets ?? null,
        };
      }
    }
    if (Object.keys(results).length > 0) break; // got data — stop trying
  }

  const count = Object.keys(results).length;
  console.log(`  Action Network: ${count} games with public betting %${count === 0 ? " (no auth — Covers fallback will run)" : ""}`);
  return results;
}

// ── Covers.com — public betting % fallback (HTML scrape) ────────────────
async function fetchCoversBetting() {
  const html = await safeFetch("https://www.covers.com/sport/football/ncaaf/matchups", { text: true });
  if (!html) return {};
  const results = {};
  // Parse betting percentage spans
  // Covers uses patterns like: data-bet-pct="65" for home spread
  const gameBlocks = html.split(/class="[^"]*covers-game/g).slice(1);
  for (const block of gameBlocks.slice(0, 30)) {
    const teams  = [...block.matchAll(/class="[^"]*team-name[^"]*"[^>]*>([^<]+)</g)].map(m=>m[1].trim());
    const pcts   = [...block.matchAll(/data-bet-pct="(\d+)"/g)].map(m=>parseInt(m[1]));
    if (teams.length >= 2 && pcts.length >= 2) {
      const key = `${teams[0]}|${teams[1]}`;
      results[key] = { homeBetPct: pcts[0], awayBetPct: pcts[1] };
    }
  }
  console.log(`  Covers.com: ${Object.keys(results).length} games scraped`);
  return results;
}

// ── OpenMeteo — free game-day weather (hourly, game-time accurate) ────────
// Uses hourly data and picks the hour closest to a typical kickoff (6pm-8pm local)
async function fetchWeather(lat, lon, date, isDome, gameTime) {
  if (isDome) return { condition:"Dome", tempF:72, windMph:0, precipitation:0, indoors:true };
  if (!lat || !lon || !date) return null;
  const diffDays = (new Date(date) - new Date()) / 86400000;
  if (diffDays > 16 || diffDays < -3) return null; // OpenMeteo forecast limit + allow recent past
  const isHistorical = diffDays < 0;
  const endpoint = isHistorical ? "archive" : "forecast";
  const url = `${METEO_BASE}/${endpoint}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,precipitation,windspeed_10m,windgusts_10m,winddirection_10m,weathercode,relativehumidity_2m&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=auto&start_date=${date}&end_date=${date}`;
  const d = await safeFetch(url);
  if (!d?.hourly?.time) return null;
  const WX_CODE = { 0:"Clear",1:"Mostly Clear",2:"Partly Cloudy",3:"Overcast",45:"Foggy",48:"Foggy",51:"Light Drizzle",53:"Drizzle",55:"Heavy Drizzle",61:"Light Rain",63:"Rain",65:"Heavy Rain",71:"Light Snow",73:"Snow",75:"Heavy Snow",80:"Rain Showers",81:"Heavy Showers",82:"Violent Showers",95:"Thunderstorm",96:"Thunderstorm w/Hail",99:"Thunderstorm" };
  const DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  // Pick game-time hour: parse from "7:00 PM ET" → ~19h local; default 19 (7pm)
  let kickoffHour = 19;
  if (gameTime && typeof gameTime === "string") {
    const m = gameTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (m) {
      let h = parseInt(m[1]);
      if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
      if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
      kickoffHour = h;
    }
  }
  // Find the closest hour index
  const hours = d.hourly.time.map(t => parseInt(t.slice(11,13)));
  const idx = hours.reduce((best, h, i) => Math.abs(h - kickoffHour) < Math.abs(hours[best] - kickoffHour) ? i : best, 0);
  const code = d.hourly.weathercode[idx];
  return {
    condition:    WX_CODE[code] ?? "Unknown",
    tempF:        Math.round(d.hourly.temperature_2m[idx] ?? 65),
    windMph:      Math.round(d.hourly.windspeed_10m[idx] ?? 0),
    gusts:        Math.round(d.hourly.windgusts_10m[idx] ?? 0),
    windDir:      d.hourly.winddirection_10m[idx] != null ? DIRS[Math.round(d.hourly.winddirection_10m[idx]/22.5) % 16] : "N/A",
    precipitation:Math.round(d.hourly.precipitation_probability[idx] ?? 0) / 100,
    humidity:     Math.round(d.hourly.relativehumidity_2m[idx] ?? 50),
    indoors:      false,
    kickoffHour,
    code,
  };
}

// ── Reddit CFB — team buzz + sentiment ──────────────────────────────────
async function fetchRedditSentiment() {
  const buzz = {};
  const POS = ["win","wins","beat","dominate","cover","lock","impressive","great","strong","destroy"];
  const NEG = ["loss","lose","upset","injury","struggle","overrated","avoid","problem","concern","weak"];
  for (const subreddit of ["CFB", "sportsbook", "sportsbetting"]) {
    const data = await safeFetch(`${REDDIT_BASE}/r/${subreddit}/hot.json?limit=100`, {
      headers: { "User-Agent": UA },
    });
    if (!data?.data?.children) continue;
    for (const { data: post } of data.data.children) {
      const text = `${post.title} ${post.selftext||""}`.toLowerCase();
      for (const [teamId, aliases] of Object.entries(TEAM_ALIASES)) {
        if (!aliases.some(a => text.includes(a))) continue;
        if (!buzz[teamId]) buzz[teamId] = { score: 0, posts: 0, upvotes: 0, sentimentScore: 0 };
        buzz[teamId].posts++;
        buzz[teamId].upvotes += post.ups || 0;
        const posHits = POS.filter(w => text.includes(w)).length;
        const negHits = NEG.filter(w => text.includes(w)).length;
        buzz[teamId].sentimentScore += posHits - negHits;
      }
    }
  }
  // Normalize to 0–100 buzz score
  const maxPosts = Math.max(1, ...Object.values(buzz).map(b => b.posts));
  for (const teamId of Object.keys(buzz)) {
    const b = buzz[teamId];
    b.score = Math.min(100, Math.round((b.posts / maxPosts) * 100));
    b.sentiment = b.sentimentScore > 2 ? "positive" : b.sentimentScore < -2 ? "negative" : "neutral";
  }
  console.log(`  Reddit: sentiment data for ${Object.keys(buzz).length} teams`);
  return buzz;
}

// ── Google News RSS — shared parser ─────────────────────────────────────
const IMPACT_KEYWORDS = {
  critical: ["arrested","charged","indicted","suspended indefinitely","dismissed from team","expelled","guilty"],
  negative: ["injured","out for season","torn","surgery","suspended","dismissed","transfer portal","decommits","fired","resigned","investigation","allegations","banned"],
  positive: ["commits","enrolled","returns","promoted","extension","wins","ranked","signs","award","honor","drafted"],
};
function parseNewsXML(xml, maxItems = 5) {
  if (!xml) return [];
  const items = [];
  const itemRx = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRx.exec(xml)) !== null && items.length < maxItems) {
    const x = m[1];
    const title   = (x.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)||x.match(/<title>(.*?)<\/title>/))?.[1]?.trim() || "";
    const source  = (x.match(/<source[^>]*><!\[CDATA\[(.*?)\]\]>/)||x.match(/<source[^>]*>(.*?)<\/source>/))?.[1]?.trim() || "News";
    // Google News RSS uses bare <link> without closing tag; try CDATA href attr, then bare tag, then guid
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
    items.push({ reporter: source, outlet: source, report: title, link, sentiment, daysAgo, isCritical });
  }
  return items;
}

// ── Google News RSS — game-specific headlines ────────────────────────────
async function fetchGameHeadlines(homeTeam, awayTeam, maxItems = 3) {
  const q = encodeURIComponent(`"${homeTeam}" "${awayTeam}" football`);
  const xml = await safeFetch(`${GNEWS_BASE}?q=${q}&hl=en-US&gl=US&ceid=US:en`, { text: true });
  return parseNewsXML(xml, maxItems);
}

// ── Google News RSS — per-team year-round news ──────────────────────────
// Covers arrests, injuries, spring practice, transfers, coaching changes.
// Runs on every workflow execution regardless of whether CFBD has games.
async function fetchAllTeamNews() {
  const FBS_TEAMS = [
    ["alabama","Alabama Crimson Tide"],["georgia","Georgia Bulldogs"],
    ["ohio_state","Ohio State Buckeyes"],["texas","Texas Longhorns"],
    ["notre_dame","Notre Dame Fighting Irish"],["penn_state","Penn State Nittany Lions"],
    ["michigan","Michigan Wolverines"],["clemson","Clemson Tigers"],
    ["lsu","LSU Tigers"],["oregon","Oregon Ducks"],
    ["tennessee","Tennessee Volunteers"],["miami","Miami Hurricanes"],
    ["florida_state","Florida State Seminoles"],["texas_am","Texas A&M Aggies"],
    ["auburn","Auburn Tigers"],["florida","Florida Gators"],
    ["usc","USC Trojans"],["ucla","UCLA Bruins"],
    ["washington","Washington Huskies"],["colorado","Colorado Buffaloes"],
    ["utah","Utah Utes"],["byu","BYU Cougars"],
    ["oklahoma_state","Oklahoma State Cowboys"],["kansas_state","Kansas State Wildcats"],
    ["iowa_state","Iowa State Cyclones"],["tcu","TCU Horned Frogs"],
    ["baylor","Baylor Bears"],["texas_tech","Texas Tech Red Raiders"],
    ["iowa","Iowa Hawkeyes"],["wisconsin","Wisconsin Badgers"],
    ["michigan_state","Michigan State Spartans"],["minnesota","Minnesota Gophers"],
    ["illinois","Illinois Fighting Illini"],["indiana","Indiana Hoosiers"],
    ["purdue","Purdue Boilermakers"],["nebraska","Nebraska Cornhuskers"],
    ["north_carolina","North Carolina Tar Heels"],["nc_state","NC State Wolfpack"],
    ["pittsburgh","Pittsburgh Panthers"],["virginia_tech","Virginia Tech Hokies"],
    ["louisville","Louisville Cardinals"],["duke","Duke Blue Devils"],
    ["wake_forest","Wake Forest Demon Deacons"],["smu","SMU Mustangs"],
    ["arizona_state","Arizona State Sun Devils"],["arizona","Arizona Wildcats"],
    ["boise_state","Boise State Broncos"],["fresno_state","Fresno State Bulldogs"],
    ["san_diego_state","San Diego State Aztecs"],["utah_state","Utah State Aggies"],
    ["ole_miss","Ole Miss Rebels"],["mississippi_state","Mississippi State Bulldogs"],
    ["arkansas","Arkansas Razorbacks"],["kentucky","Kentucky Wildcats"],
    ["south_carolina","South Carolina Gamecocks"],["vanderbilt","Vanderbilt Commodores"],
    ["missouri","Missouri Tigers"],["west_virginia","West Virginia Mountaineers"],
    ["tulane","Tulane Green Wave"],["memphis","Memphis Tigers"],
    ["ucf","UCF Knights"],["cincinnati","Cincinnati Bearcats"],
    ["houston","Houston Cougars"],["army","Army Black Knights"],
    ["navy","Navy Midshipmen"],["app_state","Appalachian State Mountaineers"],
    ["coastal_carolina","Coastal Carolina Chanticleers"],["liberty","Liberty Flames"],
  ];

  const teamNews = {};
  // Batch 4 at a time with a 1.5s gap to avoid Google News rate limits
  const BATCH = 4;
  for (let i = 0; i < FBS_TEAMS.length; i += BATCH) {
    await Promise.all(FBS_TEAMS.slice(i, i + BATCH).map(async ([teamId, teamName]) => {
      // Primary: team-specific search (catches arrests, injuries, spring practice, etc.)
      const q = encodeURIComponent(`"${teamName}" football`);
      const xml = await safeFetch(`${GNEWS_BASE}?q=${q}&hl=en-US&gl=US&ceid=US:en`, { text: true });
      const items = parseNewsXML(xml, 5);
      if (items.length) teamNews[teamId] = items;
    }));
    if (i + BATCH < FBS_TEAMS.length) await new Promise(r => setTimeout(r, 1500));
  }
  const count = Object.keys(teamNews).length;
  console.log(`  Team news: ${count} teams with headlines`);
  return teamNews;
}

// ── CFBD: additional data endpoints ─────────────────────────────────────
async function fetchCFBDExtras() {
  console.log("  Fetching CFBD extras (SP+, ELO, stats, recruiting, PPA, coaches, ATS)...");
  const [spRatings, eloRatings, teamStats, recruiting, ppa, transfers, coaches,
         lines25, games25] = await Promise.all([
    cfbdFetch(`/ratings/sp?year=${SEASON}`),
    cfbdFetch(`/ratings/elo?year=${SEASON}&week=1`),
    cfbdFetch(`/stats/season?year=${SEASON}&seasonType=regular`),
    cfbdFetch(`/recruiting/teams?year=${SEASON}`),
    cfbdFetch(`/ppa/teams?year=${SEASON}&excludeGarbageTime=true`),
    cfbdFetch(`/player/transfer-portal?year=${SEASON}`),
    cfbdFetch(`/coaches?year=${SEASON - 1}`),      // prior-year coaches for career records
    cfbdFetch(`/lines?year=${SEASON - 1}`),         // prior-year lines for ATS computation
    cfbdFetch(`/games?year=${SEASON - 1}&seasonType=regular&classification=fbs`),
  ]);
  // Also get prior years recruiting for trend
  const [rec25, rec24] = await Promise.all([
    cfbdFetch(`/recruiting/teams?year=2025`),
    cfbdFetch(`/recruiting/teams?year=2024`),
  ]);

  // Build coach name + career record map (keyed by school name)
  const coachMap = {};
  (coaches || []).forEach(c => {
    if (!Array.isArray(c.schools) || !c.schools.length) return;
    const cur = c.schools.find(s => s.year === SEASON - 1) ||
                c.schools.sort((a, b) => b.year - a.year)[0];
    if (!cur?.school) return;
    const name = `${c.firstName} ${c.lastName}`;
    const totalW = c.schools.reduce((s, sc) => s + (sc.wins  || 0), 0);
    const totalL = c.schools.reduce((s, sc) => s + (sc.losses || 0), 0);
    coachMap[cur.school] = {
      name,
      record: totalW + totalL > 0 ? `${totalW}-${totalL}` : null,
    };
  });

  // Build overall ATS record per team from prior-year lines + game results
  const atsRecords = {};
  if ((lines25 || []).length && (games25 || []).length) {
    const spreadsById = {};
    (lines25 || []).forEach(g => {
      if (!g.lines?.length) return;
      const best = g.lines.find(l => l.provider === "consensus") || g.lines[0];
      const spread = parseFloat(best?.spread);
      if (!isNaN(spread)) spreadsById[g.id] = spread;
    });
    (games25 || []).forEach(g => {
      if (g.home_points == null || g.away_points == null) return;
      const spread = spreadsById[g.id];
      if (spread == null) return;
      // spread is from home team perspective (negative = home favored)
      const homeMargin = g.home_points - g.away_points;
      const adj = homeMargin + spread;
      const isPush = Math.abs(adj) <= 0.5;
      const homeCovered = !isPush && adj > 0;
      const awayCovered = !isPush && adj < 0;
      [[g.home_team, homeCovered], [g.away_team, awayCovered]].forEach(([school, covered]) => {
        if (!school) return;
        if (!atsRecords[school]) atsRecords[school] = { wins: 0, losses: 0, pushes: 0 };
        if (isPush) atsRecords[school].pushes++;
        else if (covered) atsRecords[school].wins++;
        else atsRecords[school].losses++;
      });
    });
    // Add pct field
    Object.values(atsRecords).forEach(r => {
      const total = r.wins + r.losses;
      r.pct = total > 0 ? Math.round((r.wins / total) * 1000) / 1000 : null;
    });
  }

  return {
    spRatings:   spRatings || [],
    eloRatings:  eloRatings || [],
    teamStats:   teamStats || [],
    recruiting:  recruiting || [],
    rec25:       rec25 || [],
    rec24:       rec24 || [],
    ppa:         ppa || [],
    transfers:   transfers || [],
    coachMap,
    atsRecords,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────
function toDate(iso) { return iso ? iso.slice(0,10) : null; }
function toTime(iso, tbd) {
  if (tbd || !iso) return "TBD";
  try {
    return new Date(iso).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:"America/New_York"}) + " ET";
  } catch { return "TBD"; }
}

function bestLine(providers) {
  if (!providers?.length) return null;
  const p = providers.find(x=>/draftkings/i.test(x.provider))
    || providers.find(x=>/fanduel/i.test(x.provider))
    || providers.find(x=>/espn/i.test(x.provider))
    || providers[0];
  if (!p) return null;
  return {
    spread:        p.spread        != null ? parseFloat(p.spread)      : null,
    total:         p.overUnder     != null ? parseFloat(p.overUnder)   : null,
    moneylineHome: p.homeMoneyline != null ? parseInt(p.homeMoneyline) : null,
    moneylineAway: p.awayMoneyline != null ? parseInt(p.awayMoneyline) : null,
    provider:      p.provider || null,
    openingSpread: p.spreadOpen    != null ? parseFloat(p.spreadOpen)  : null,
    openingTotal:  p.overUnderOpen != null ? parseFloat(p.overUnderOpen): null,
  };
}

// Build line movement from opening vs current spread
function buildLineMovement(line, oddsData) {
  if (!line) return [];
  const moves = [];
  if (line.openingSpread != null) {
    moves.push({ time: "Open", spread: line.openingSpread, total: line.openingTotal, note: "Opening line" });
  }
  if (oddsData?.consensus != null) {
    moves.push({ time: "Consensus", spread: oddsData.consensus, total: null, note: `${oddsData.bookCount} books` });
  }
  if (line.spread != null) {
    const diff = line.openingSpread != null ? Math.abs(line.spread - line.openingSpread) : 0;
    moves.push({
      time: "Current", spread: line.spread, total: line.total,
      note: diff >= 1 ? `Moved ${diff.toFixed(1)} pts from open` : `${line.provider||"consensus"}`,
    });
  }
  return moves;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const startTime = Date.now();
  console.log(`\n🏈 Full-scope CFB data fetch — ${new Date().toUTCString()}\n`);

  // ── Phase 1: Parallel primary fetches ────────────────────────────────
  console.log("Phase 1: Schedule + scores + extras...");
  const [
    gamesReg, gamesPost, linesRaw, rankings, espnScoreboard,
    cfbdExtras,
  ] = await Promise.all([
    cfbdFetch(`/games?year=${SEASON}&seasonType=regular`),
    cfbdFetch(`/games?year=${SEASON}&seasonType=postseason`),
    cfbdFetch(`/lines?year=${SEASON}`),
    cfbdFetch(`/rankings?year=${SEASON}&seasonType=regular`),
    fetchESPNScoreboard(),
    fetchCFBDExtras(),
  ]);

  // If date-specific scoreboard queries still return 0 games, fall back to per-team
  // schedule endpoints — each team's full schedule for the season.
  let espnByKey = espnScoreboard;
  if (Object.keys(espnScoreboard).length === 0) {
    console.log("  ESPN scoreboard returned 0 games — trying per-team schedule endpoints...");
    espnByKey = await fetchESPNTeamSchedules();
  }

  // ── Phase 2: Betting intel (parallel) ────────────────────────────────
  console.log("Phase 2: Betting intel (Odds API + OddsPapi/Pinnacle + Action Network + Covers)...");
  const [oddsData, pinnacleData, actionBetting, coversBetting] = await Promise.all([
    fetchOddsAPI(),
    fetchOddsPapi(),
    fetchActionNetworkBetting(),
    fetchCoversBetting(),
  ]);

  // ── Phase 3: Social signals + rosters (parallel) ─────────────────────
  console.log("Phase 3: Social signals + ESPN rosters (Reddit + injuries + rosters + team news)...");
  const [redditBuzz, injuries, teamNews, rosters] = await Promise.all([
    fetchRedditSentiment(),
    fetchESPNInjuries(),
    fetchAllTeamNews(),   // year-round: arrests, spring injuries, transfers, coaching
    fetchESPNRosters(),   // skill-position players for all ~130 FBS teams
  ]);

  // ── Build betting-lines lookup ────────────────────────────────────────
  const linesById = {};
  for (const l of linesRaw || []) {
    if (l.id && l.lines?.length) linesById[l.id] = bestLine(l.lines);
  }

  // ── AP Rankings ───────────────────────────────────────────────────────
  const apRanks = {};
  const latestAP = [...(rankings||[])].sort((a,b)=>(b.week||0)-(a.week||0))
    .find(r => r.polls?.some(p => p.poll === "AP Top 25"));
  if (latestAP) {
    const poll = latestAP.polls.find(p => p.poll === "AP Top 25");
    for (const r of poll?.ranks||[]) {
      const id = schoolToId(r.school);
      if (id) apRanks[id] = r.rank;
    }
  }

  // ── Merge betting % sources (Action Network > Covers) ────────────────
  function getPublicBetting(homeTeam, awayTeam) {
    const key = `${homeTeam}|${awayTeam}`;
    const an = actionBetting[key];
    const cv = coversBetting[key];
    if (an?.homeBetPct != null) {
      return {
        homePct:  an.homeBetPct,
        awayPct:  an.awayBetPct ?? 100 - an.homeBetPct,
        overPct:  an.overBetPct ?? 50,
        underPct: an.underBetPct ?? 50,
        source: "action_network",
      };
    }
    if (cv?.homeBetPct != null) {
      return { homePct: cv.homeBetPct, awayPct: cv.awayBetPct ?? 100-cv.homeBetPct, overPct:50, underPct:50, source:"covers" };
    }
    return { homePct:50, awayPct:50, overPct:50, underPct:50, source:"default" };
  }

  // ── Phase 4: Build game objects ───────────────────────────────────────
  console.log("Phase 4: Building game objects with weather...");
  const allCfbd = [...(gamesReg||[]), ...(gamesPost||[])];
  const fbsGames = allCfbd.filter(g => g.home_division==="fbs" || g.away_division==="fbs");
  console.log(`  ${fbsGames.length} FBS games to process`);

  // Weather: batch per unique venue-date combos (avoid duplicate API calls)
  const weatherCache = {};
  async function getWeather(homeId, date, gameTime) {
    const coords = STADIUM_COORDS[homeId];
    if (!coords || !date) return null;
    const key = `${homeId}|${date}`;
    if (weatherCache[key] === undefined) {
      weatherCache[key] = await fetchWeather(coords.lat, coords.lon, date, coords.dome, gameTime);
    }
    return weatherCache[key];
  }

  // Fetch news for top games — increased to 50 (top 25 by combined AP rank + all ranked-vs-ranked)
  const TOP_GAME_KEYS = new Set();
  const sortedGames = [...fbsGames].sort((a,b) => {
    const ar = (apRanks[schoolToId(a.home_team)]||99) + (apRanks[schoolToId(a.away_team)]||99);
    const br = (apRanks[schoolToId(b.home_team)]||99) + (apRanks[schoolToId(b.away_team)]||99);
    return ar - br;
  });
  for (const g of sortedGames.slice(0,50)) {
    TOP_GAME_KEYS.add(`${g.home_team}|${g.away_team}`);
  }
  // Always include games where both teams are ranked (marquee matchups)
  for (const g of fbsGames) {
    const hRank = apRanks[schoolToId(g.home_team)];
    const aRank = apRanks[schoolToId(g.away_team)];
    if (hRank && aRank) TOP_GAME_KEYS.add(`${g.home_team}|${g.away_team}`);
  }

  // Process games in batches with weather + news
  const games = [];
  const BATCH = 15;
  for (let i = 0; i < fbsGames.length; i += BATCH) {
    const batch = fbsGames.slice(i, i+BATCH);
    const batchResults = await Promise.all(batch.map(async g => {
      const homeId  = schoolToId(g.home_team);
      const awayId  = schoolToId(g.away_team);
      const espnKey = `${g.home_team}|${g.away_team}`;
      const espn    = espnByKey[espnKey] || null;
      const line    = linesById[g.id] || null;
      const gameDate = espn?.date || toDate(g.start_date) || `${SEASON}-09-05`;
      const oddsKey  = `${g.home_team}|${g.away_team}`;
      const odds     = oddsData[oddsKey] || null;
      const pinnacle = pinnacleData[oddsKey] || null;
      const pubBet   = getPublicBetting(g.home_team, g.away_team);
      const homeBuzz = redditBuzz[homeId] || null;
      const awayBuzz = redditBuzz[awayId] || null;
      const gameTime = espn?.time || toTime(g.start_date, g.start_time_tbd);

      const status = g.completed ? "final"
        : espn?.status === "in_progress" ? "in_progress"
        : "scheduled";

      // Weather (scheduled games within OpenMeteo's 16-day window)
      const weather = status === "scheduled" ? await getWeather(homeId, gameDate, gameTime) : null;

      // News for top games only
      const newsItems = TOP_GAME_KEYS.has(espnKey)
        ? await fetchGameHeadlines(g.home_team, g.away_team)
        : [];

      // Line movement
      const lineMovement = buildLineMovement(line, odds);

      // Sharp signal: Pinnacle vs public book divergence is the gold standard
      // Pinnacle = sharp money book; DK/FD = public money books
      // If Pinnacle prices team X cheaper than public books → sharps on X
      let sharpSignal = null;
      if (pinnacle?.pinnacleSpread != null && line?.spread != null) {
        const divergence = pinnacle.pinnacleSpread - line.spread;
        if (Math.abs(divergence) >= 1) {
          // Pinnacle giving fewer points to home than public = sharp on home (public inflated away)
          sharpSignal = divergence < 0 ? "home" : "away";
        }
      } else if (odds?.sharpSignal) {
        sharpSignal = odds.sharpSignal; // multi-book divergence fallback
      } else if (line?.openingSpread != null && line?.spread != null) {
        const move = line.spread - line.openingSpread;
        if (Math.abs(move) >= 1.5) {
          const favoredSide = line.spread <= 0 ? "home" : "away";
          const movedAgainst = move < 0 ? "away" : "home";
          sharpSignal = movedAgainst !== favoredSide ? favoredSide : null;
        }
      }

      // Beat writer entries from news + a public betting note
      const beatWriter = [...newsItems.map(n => ({
        ...n,
        team: homeId, // approximate — will be shown with home team badge
      }))];
      if (pubBet.source !== "default" && pubBet.homePct !== 50) {
        const favSide = pubBet.homePct > 50 ? g.home_team : g.away_team;
        const pct     = pubBet.homePct > 50 ? pubBet.homePct : pubBet.awayPct;
        beatWriter.push({
          reporter: "Public Betting Data",
          outlet:   pubBet.source === "action_network" ? "Action Network" : "Covers.com",
          report:   `${pct}% of public bets on ${favSide} — ${pct >= 70 ? "heavy public lean, watch for sharp counter" : "moderate public leaning"}.`,
          sentiment: pubBet.homePct > 50 ? "positive" : "negative",
          daysAgo:  0,
          team: pubBet.homePct > 50 ? homeId : awayId,
        });
      }

      // Social buzz
      const socialBuzz = {
        homeTeamBuzz: Math.min(100, (homeBuzz?.score||0) + (apRanks[homeId] ? Math.max(0, 25-apRanks[homeId]) : 0)),
        awayTeamBuzz: Math.min(100, (awayBuzz?.score||0) + (apRanks[awayId] ? Math.max(0, 25-apRanks[awayId]) : 0)),
        sentimentHome: homeBuzz?.sentiment === "positive" ? 0.65 : homeBuzz?.sentiment === "negative" ? 0.35 : 0.50,
        sentimentAway: awayBuzz?.sentiment === "positive" ? 0.65 : awayBuzz?.sentiment === "negative" ? 0.35 : 0.50,
        trendingTopics: [...new Set([
          weather?.windMph > 20 ? `💨 Wind ${weather.windMph}mph` : null,
          weather?.precipitation > 0.5 ? `🌧 Rain ${Math.round(weather.precipitation * 100)}%` : null,
          weather?.tempF < 35 ? `🥶 Cold Weather` : null,
          apRanks[homeId] ? `#${apRanks[homeId]} ${g.home_team}` : null,
          apRanks[awayId] ? `#${apRanks[awayId]} ${g.away_team}` : null,
          sharpSignal ? `💰 Sharp Signal` : null,
        ].filter(Boolean))].slice(0, 5),
      };

      return {
        id:               `cfbd_${g.id}`,
        cfbdId:           g.id,
        week:             g.week || 1,
        seasonType:       g.season_type || "regular",
        date:             gameDate,
        time:             espn?.time || toTime(g.start_date, g.start_time_tbd),
        homeTeamId:       homeId,
        awayTeamId:       awayId,
        homeTeamName:     g.home_team,
        awayTeamName:     g.away_team,
        homeConference:   g.home_conference || "",
        awayConference:   g.away_conference || "",
        network:          espn?.network || g.notes || "TBD",
        venue:            espn?.venue || g.venue || "",
        venueCity:        espn?.venueCity || "",
        venueState:       espn?.venueState || "",
        isConferenceGame: g.conference_game || false,
        neutralSite:      espn?.neutralSite ?? g.neutral_site ?? false,
        status,
        homeScore:  g.home_points ?? espn?.homeScore ?? null,
        awayScore:  g.away_points ?? espn?.awayScore ?? null,
        homeElo:    g.home_pregame_elo || null,
        awayElo:    g.away_pregame_elo || null,
        homeApRank: apRanks[homeId] || null,
        awayApRank: apRanks[awayId] || null,
        bettingLines: line ? {
          ...line,
          sharpSignal,
          multiBookConsensus:  odds?.consensus       ?? null,
          bookCount:           odds?.bookCount        ?? null,
          pinnacleSpread:      pinnacle?.pinnacleSpread ?? null,
          pinnacleTotal:       pinnacle?.pinnacleTotal  ?? null,
          publicVsSharpGap:    pinnacle?.pinnacleSpread != null && line.spread != null
            ? +(pinnacle.pinnacleSpread - line.spread).toFixed(1) : null,
        } : null,
        weather,
        lineMovement,
        situational: {},
        xFactors:    [],
        socialBuzz,
        socialIntel: {
          lineMovement,
          publicBetting: pubBet,
          beatWriter,
          sharpSignal,
          oddsBookCount: odds?.bookCount || 0,
        },
        gamePreview: {
          headline: `${g.away_team} at ${g.home_team}`,
          synopsis: `Week ${g.week||1} ${g.season_type||"regular"} season matchup. ${weather ? `Weather: ${weather.condition}, ${weather.tempF}°F, wind ${weather.windMph}mph.` : ""}`,
          analysis: [],
          thePick: { team:"", line:"", confidence:"LOW", unit:1, reasoning:"" },
        },
        fromPregen: true,
      };
    }));
    games.push(...batchResults);
    if (i + BATCH < fbsGames.length) {
      await new Promise(r => setTimeout(r, 300)); // brief pause between batches
    }
  }

  // ── ESPN fallback: if CFBD returned 0 games but ESPN has the schedule ────────
  // CFBD typically doesn't publish the upcoming season's schedule until July/August.
  // ESPN has the full schedule posted months earlier — use it as primary source
  // when CFBD is empty, so the site shows real game data during the preseason.
  if (games.length === 0 && Object.keys(espnByKey).length > 0) {
    console.log(`  CFBD returned 0 games — using ESPN schedule as primary source (${Object.keys(espnByKey).length} games found)`);

    // Build SP+ / ELO lookups for enriching ESPN-sourced games
    const spLookup = {};
    for (const sp of cfbdExtras.spRatings) {
      const id = schoolToId(sp.team);
      if (id) spLookup[id] = sp;
    }
    const eloLookup = {};
    for (const elo of cfbdExtras.eloRatings) {
      const id = schoolToId(elo.school);
      if (id) eloLookup[id] = elo.elo;
    }

    for (const [key, espn] of Object.entries(espnByKey)) {
      if (!espn.date || espn.week == null) continue; // keep week:0 (Week 0 games)

      const homeId = schoolToId(espn.homeLocation);
      const awayId = schoolToId(espn.awayLocation);
      const oddsKey = key; // Odds API uses displayName-based keys too

      const odds       = oddsData[oddsKey]     || null;
      const pinnacle   = pinnacleData[oddsKey] || null;
      const pubBet     = getPublicBetting(espn.homeTeamName, espn.awayTeamName);
      const lineMovement = buildLineMovement(null, odds);

      let sharpSignal = odds?.sharpSignal || null;
      if (!sharpSignal && pinnacle?.pinnacleSpread != null) {
        // Pinnacle vs consensus divergence as sharp signal
        const allSpreads = Object.values(odds?.byBook || {});
        const consensus  = allSpreads.length ? allSpreads.reduce((a,b)=>a+b,0)/allSpreads.length : null;
        if (consensus != null) {
          const div = pinnacle.pinnacleSpread - consensus;
          if (Math.abs(div) >= 1) sharpSignal = div < 0 ? "home" : "away";
        }
      }

      // Weather only available for games within 16-day forecast window
      const weather = espn.status === "scheduled"
        ? await getWeather(homeId, espn.date, espn.time)
        : null;

      const beatWriter = [];
      if (pubBet.source !== "default" && pubBet.homePct !== 50) {
        const favSide = pubBet.homePct > 50 ? espn.homeTeamName : espn.awayTeamName;
        const pct     = pubBet.homePct > 50 ? pubBet.homePct   : pubBet.awayPct;
        beatWriter.push({
          reporter: "Public Betting Data",
          outlet:   pubBet.source === "action_network" ? "Action Network" : "Covers.com",
          report:   `${pct}% of public bets on ${favSide} — ${pct >= 70 ? "heavy public lean, watch for sharp counter" : "moderate public leaning"}.`,
          sentiment: "neutral", daysAgo: 0,
          team: pubBet.homePct > 50 ? homeId : awayId,
        });
      }

      const homeSP = spLookup[homeId];
      const awaySP = spLookup[awayId];

      const socialBuzz = {
        homeTeamBuzz: Math.min(100, (redditBuzz[homeId]?.score||0) + (apRanks[homeId] ? Math.max(0, 25-apRanks[homeId]) : 0)),
        awayTeamBuzz: Math.min(100, (redditBuzz[awayId]?.score||0) + (apRanks[awayId] ? Math.max(0, 25-apRanks[awayId]) : 0)),
        sentimentHome: redditBuzz[homeId]?.sentiment === "positive" ? 0.65 : redditBuzz[homeId]?.sentiment === "negative" ? 0.35 : 0.50,
        sentimentAway: redditBuzz[awayId]?.sentiment === "positive" ? 0.65 : redditBuzz[awayId]?.sentiment === "negative" ? 0.35 : 0.50,
        trendingTopics: [
          weather?.windMph > 20 ? `💨 Wind ${weather.windMph}mph` : null,
          weather?.precipitation > 0.5 ? `🌧 Rain ${Math.round(weather.precipitation * 100)}%` : null,
          weather?.tempF < 35 ? `🥶 Cold Weather` : null,
          apRanks[homeId] ? `#${apRanks[homeId]} ${espn.homeTeamName}` : null,
          apRanks[awayId] ? `#${apRanks[awayId]} ${espn.awayTeamName}` : null,
          sharpSignal ? `💰 Sharp Signal` : null,
        ].filter(Boolean).slice(0, 5),
      };

      games.push({
        id:               `espn_${espn.espnId}`,
        espnId:           espn.espnId,
        week:             espn.week,
        seasonType:       "regular",
        date:             espn.date,
        time:             espn.time || "TBD",
        homeTeamId:       homeId,
        awayTeamId:       awayId,
        homeTeamName:     espn.homeTeamName,
        awayTeamName:     espn.awayTeamName,
        homeConference:   "",
        awayConference:   "",
        network:          espn.network || "TBD",
        venue:            espn.venue || "",
        venueCity:        espn.venueCity || "",
        venueState:       espn.venueState || "",
        isConferenceGame: false,
        neutralSite:      espn.neutralSite || false,
        status:           espn.status || "scheduled",
        homeScore:        espn.homeScore ?? null,
        awayScore:        espn.awayScore ?? null,
        homeApRank:       apRanks[homeId] || null,
        awayApRank:       apRanks[awayId] || null,
        homeSP:           homeSP?.rating ?? null,
        awaySP:           awaySP?.rating ?? null,
        homeSpRank:       homeSP?.ranking ?? null,
        awaySpRank:       awaySP?.ranking ?? null,
        homeElo:          eloLookup[homeId] || null,
        awayElo:          eloLookup[awayId] || null,
        bettingLines:     null, // populated once sportsbooks post lines (closer to season)
        weather,
        lineMovement,
        situational:      {},
        xFactors:         [],
        socialBuzz,
        socialIntel: {
          lineMovement,
          publicBetting: pubBet,
          beatWriter,
          sharpSignal,
          oddsBookCount: odds?.bookCount || 0,
        },
        gamePreview: {
          headline:  `${espn.awayTeamName} at ${espn.homeTeamName}`,
          synopsis:  `Week ${espn.week} matchup. Lines and preview analysis update as game week approaches.`,
          analysis:  [],
          thePick:   { team:"", line:"", confidence:"LOW", unit:1, reasoning:"" },
        },
        fromESPN: true, // flag so live.js / predictor knows CFBD data is not yet available
      });
    }
    console.log(`  ESPN fallback: ${games.length} game objects built`);
  }

  const weatherCount = games.filter(g => g.weather && !g.weather.indoors).length;
  console.log(`  Weather fetched for ${weatherCount} outdoor games`);

  const now = new Date().toISOString();
  console.log("\nPhase 5: Writing output files...");

  // Always write social/team data — Reddit buzz, SP+, injuries don't need game data.
  // Always write team-extras.json so the timestamp stays fresh and downstream
  // scripts can tell when the pipeline last ran, even if CFBD has no 2026 data yet.
  writeAtomic(join(DATA_DIR,"team-extras.json"),
    JSON.stringify({ generated: now, ...cfbdExtras, redditBuzz, teamNews }, null, 2));
  console.log(`  Team extras written — SP+: ${cfbdExtras.spRatings.length}, coaches: ${Object.keys(cfbdExtras.coachMap).length}, ATS: ${Object.keys(cfbdExtras.atsRecords).length} teams, Reddit: ${Object.keys(redditBuzz).length} teams`);

  const hasInjury  = Object.values(injuries).flat().length > 0;
  const hasReddit  = Object.keys(redditBuzz).length > 0;
  if (hasInjury) {
    writeAtomic(join(DATA_DIR,"injuries.json"),
      JSON.stringify({ generated: now, injuries }, null, 2));
  }

  const hasRosters = Object.keys(rosters).length > 0;
  if (hasRosters) {
    const totalPlayers = Object.values(rosters).reduce((s, r) => s + r.length, 0);
    writeAtomic(join(DATA_DIR,"rosters.json"),
      JSON.stringify({ generated: now, totalTeams: Object.keys(rosters).length, totalPlayers, rosters }, null, 2));
    console.log(`  Rosters written — ${Object.keys(rosters).length} teams, ${totalPlayers} players`);
  }

  // Patch AP ranks into games-2026.json even in preseason so tweets and website
  // always show the latest AP poll — the curated game seed is preserved, only
  // apRanks and rankedTeams fields are overwritten.
  if (Object.keys(apRanks).length > 0) {
    try {
      const gamesPath = join(DATA_DIR, "games-2026.json");
      const existing  = JSON.parse(readFileSync(gamesPath, "utf8"));
      existing.apRanks    = apRanks;
      existing.rankedTeams = Object.keys(apRanks).length;
      writeAtomic(gamesPath, JSON.stringify(existing, null, 2));
      console.log(`  AP ranks patched into games-2026.json (${Object.keys(apRanks).length} teams ranked)`);
    } catch (e) {
      console.warn(`  Warning: could not patch AP ranks into games-2026.json: ${e.message}`);
    }
  }

  // Guard 1: no data at all — preserve curated seed
  if (games.length === 0) {
    console.log("  No game data from CFBD or ESPN yet — preserving curated seed in games-2026.json");
    return;
  }
  // Guard 2: partial data (CFBD sometimes publishes a handful of games before the full
  // schedule) — require at least 100 games before overwriting the curated seed so we
  // don't replace 21 well-curated marquee matchups with 15 skeleton stubs.
  const MIN_SCHEDULE_GAMES = 100;
  if (games.length < MIN_SCHEDULE_GAMES) {
    console.log(`  Only ${games.length} games found (threshold: ${MIN_SCHEDULE_GAMES}) — preserving curated seed until full schedule is available`);
    writeAtomic(join(DATA_DIR, "metadata.json"), JSON.stringify({
      generated:      now,
      season:         SEASON,
      preseason:      true,
      totalGames:     games.length,
      spTeams:        cfbdExtras.spRatings.length,
      rankedTeams:    Object.keys(apRanks).length,
      injuredPlayers: Object.values(injuries).flat().length,
      dataSourcesActive: [
        cfbdExtras.spRatings.length > 0 ? "CFBD (SP+ ratings)" : null,
        hasReddit ? "Reddit CFB+sportsbook (sentiment)" : null,
        "GoogleNews (game headlines)",
      ].filter(Boolean),
      fetchDurationMs: Date.now() - startTime,
    }, null, 2));
    return;
  }

  const metadata = {
    generated:      now,
    season:         SEASON,
    totalGames:     games.length,
    scheduledGames: games.filter(g=>g.status==="scheduled").length,
    completedGames: games.filter(g=>g.status==="final").length,
    liveGames:      games.filter(g=>g.status==="in_progress").length,
    gamesWithLines: games.filter(g=>g.bettingLines).length,
    gamesWithWeather:weatherCount,
    gamesWithBettingPct: games.filter(g=>g.socialIntel.publicBetting.source!=="default").length,
    gamesWithOdds:  games.filter(g=>g.bettingLines?.bookCount>1).length,
    rankedTeams:    Object.keys(apRanks).length,
    injuredPlayers: Object.values(injuries).flat().length,
    spTeams:        cfbdExtras.spRatings.length,
    ppaTeams:       cfbdExtras.ppa.length,
    recruitingTeams:cfbdExtras.recruiting.length,
    transferCount:  cfbdExtras.transfers.length,
    espnFallback:   games.some(g => g.fromESPN) && !games.some(g => g.fromPregen),
    dataSourcesActive: [
      games.some(g => g.fromPregen) ? "CFBD (schedule+lines+SP++ELO+stats+recruiting+PPA)" : null,
      games.some(g => g.fromESPN)   ? "ESPN (schedule — CFBD preseason fallback)"           : "ESPN (scores+injuries)",
      cfbdExtras.spRatings.length > 0 && games.some(g=>g.fromESPN) ? "CFBD (SP++ELO+recruiting+PPA)" : null,
      Object.keys(oddsData).length > 0    ? "TheOddsAPI (20+ US books)"              : null,
      Object.keys(pinnacleData).length > 0? "OddsPapi/Pinnacle (sharp reference)"    : null,
      Object.keys(actionBetting).length > 0?"ActionNetwork (public betting %)"       : null,
      Object.keys(coversBetting).length > 0?"Covers (public betting % fallback)"     : null,
      weatherCount > 0                    ? "OpenMeteo (hourly game-time weather)"    : null,
      hasReddit                           ? "Reddit CFB+sportsbook (sentiment)"      : null,
      "GoogleNews (game headlines)",
    ].filter(Boolean),
    fetchDurationMs: Date.now() - startTime,
  };

  writeAtomic(join(DATA_DIR,"games-2026.json"),
    JSON.stringify({ ...metadata, apRanks, games }, null, 2));

  writeAtomic(join(DATA_DIR,"metadata.json"),
    JSON.stringify(metadata, null, 2));

  console.log(`\n✅ Done in ${((Date.now()-startTime)/1000).toFixed(1)}s`);
  console.log(`   ${metadata.totalGames} games (${metadata.scheduledGames} scheduled, ${metadata.completedGames} final, ${metadata.liveGames} live)`);
  console.log(`   ${metadata.gamesWithLines} with betting lines · ${metadata.gamesWithOdds} with multi-book data`);
  console.log(`   ${metadata.gamesWithBettingPct} with public betting % · ${weatherCount} with weather`);
  console.log(`   SP+: ${metadata.spTeams} teams · PPA: ${metadata.ppaTeams} · Recruiting: ${metadata.recruitingTeams}`);
  console.log(`   ${metadata.injuredPlayers} injuries · ${metadata.transferCount} transfers`);
  console.log(`   Active sources: ${metadata.dataSourcesActive.join(", ")}`);
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
