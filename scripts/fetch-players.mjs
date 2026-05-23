#!/usr/bin/env node
/**
 * fetch-players.mjs
 *
 * Fetches FBS rosters + player season stats from CFBD, merges ESPN injury
 * data, then writes data/players-2026.json with one profile per top-10
 * positional player per team.
 *
 * Positions per team:
 *   QB (1), RB (1), WR (2), TE (1), OL (1), Edge/DE (1), LB (1), CB (1), S (1)
 *
 * GitHub Secrets: CFBD_API_KEY (required)
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, "..", "data");
const SEASON    = 2026;

const CFBD_BASE = "https://api.collegefootballdata.com";
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/football/college-football";

const CFBD_KEY = process.env.CFBD_API_KEY ||
  "PYpnlfCwGnHmml4BtUbvE0q+oafSE2BuqAREeEXnY+NUalkbuV6hYHoKO3udgFdB";

const UA = "TheBet/2.0 (cfb-predictor; contact rfisher55@github.com)";

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function cfbdFetch(endpoint) {
  try {
    const r = await fetch(`${CFBD_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${CFBD_KEY}` },
    });
    if (!r.ok) { console.warn(`  CFBD ${r.status}: ${endpoint}`); return null; }
    return r.json();
  } catch (e) { console.warn(`  CFBD fail: ${endpoint} — ${e.message}`); return null; }
}

async function espnFetch(endpoint) {
  try {
    const r = await fetch(`${ESPN_BASE}${endpoint}`, { headers: { "User-Agent": UA } });
    if (!r.ok) { console.warn(`  ESPN ${r.status}: ${endpoint}`); return null; }
    return r.json();
  } catch (e) { console.warn(`  ESPN fail: ${endpoint} — ${e.message}`); return null; }
}

// ── School name → internal ID ────────────────────────────────────────────────
// Mirrors the mapping in fetch-live-data.mjs / live.js
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
  "Boston College":"boston_college",California:"california",Cal:"california",
  Duke:"duke","Georgia Tech":"georgia_tech",Louisville:"louisville",
  "NC State":"nc_state","North Carolina State":"nc_state",
  "North Carolina":"north_carolina",Pittsburgh:"pittsburgh",
  Syracuse:"syracuse",Virginia:"virginia","Virginia Tech":"virginia_tech",
  "Wake Forest":"wake_forest",SMU:"smu",Stanford:"stanford",
  Arizona:"arizona","Arizona State":"arizona_state",Baylor:"baylor",
  BYU:"byu",Cincinnati:"cincinnati",Colorado:"colorado",
  Houston:"houston","Iowa State":"iowa_state",Kansas:"kansas",
  "Kansas State":"kansas_state","Oklahoma State":"oklahoma_state",
  TCU:"tcu","Texas Tech":"texas_tech",UCF:"ucf",Utah:"utah",
  "West Virginia":"west_virginia",
  Army:"army","East Carolina":"east_carolina",Memphis:"memphis",
  Navy:"navy","North Texas":"north_texas",Rice:"rice",
  "South Florida":"south_florida",Tulane:"tulane",Tulsa:"tulsa",
  UTSA:"utsa","UT San Antonio":"utsa",UAB:"uab",Charlotte:"charlotte",
  "Florida Atlantic":"fau",FAU:"fau","Florida International":"fiu",FIU:"fiu",
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
  UConn:"uconn",Connecticut:"uconn",UMass:"umass",Massachusetts:"umass",
  Liberty:"liberty","Middle Tennessee":"middle_tennessee",
  "New Mexico State":"new_mexico_state","Sam Houston":"sam_houston",
  "Southern Miss":"southern_miss","La Tech":"la_tech","Louisiana Tech":"la_tech",
  UTEP:"utep","Western Kentucky":"western_kentucky",
  "Jacksonville State":"jacksonville_state","Kennesaw State":"kennesaw_state",
  "La Tech":"la_tech",
};

function schoolToId(name) {
  if (!name) return null;
  if (SCHOOL_TO_ID[name] !== undefined) return SCHOOL_TO_ID[name];
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || null;
}

// ── ESPN injury fetch for all FBS teams ──────────────────────────────────────
const ESPN_TEAM_IDS = {
  alabama:333,auburn:2,florida:57,georgia:61,lsu:99,ohio_state:194,
  michigan:130,penn_state:213,clemson:228,notre_dame:87,texas:251,
  oregon:2483,texas_am:245,tennessee:2633,miami:2390,baylor:239,
  iowa:2294,wisconsin:275,oklahoma_state:197,kansas_state:2306,
  utah:254,byu:252,cincinnati:2132,ucf:2116,florida_state:52,
  north_carolina:153,pittsburgh:221,virginia_tech:259,louisville:97,
  wake_forest:154,boston_college:103,duke:150,syracuse:183,virginia:258,
  stanford:24,california:25,smu:2567,arizona_state:9,arizona:12,
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
  old_dominion:295,western_kentucky:98,utsa:2636,uab:2629,
  fau:2226,fiu:2296,charlotte:2429,troy:2653,south_alabama:6,
  louisiana:309,ul_monroe:2433,arkansas_state:2032,
  georgia_southern:290,georgia_state:2247,texas_state:326,
  middle_tennessee:2393,new_mexico_state:166,la_tech:2348,
  sam_houston:2534,utep:2638,southern_miss:239,
  akron:2006,ball_state:2050,bowling_green:189,buffalo:2084,
  central_michigan:2117,eastern_michigan:2199,kent_state:2307,
  miami_oh:193,northern_illinois:2459,ohio:195,toledo:2649,
  western_michigan:2711,uconn:41,umass:113,tulsa:202,
};

async function fetchESPNInjuries() {
  console.log("  Fetching ESPN injury reports...");
  const injuries = {};
  const entries = Object.entries(ESPN_TEAM_IDS);
  for (let i = 0; i < entries.length; i += 10) {
    await Promise.all(entries.slice(i, i + 10).map(async ([teamId, espnId]) => {
      try {
        const d = await espnFetch(`/teams/${espnId}?enable=injuries`);
        const injs = d?.team?.injuries || [];
        if (injs.length) {
          injuries[teamId] = injs.map(inj => ({
            player: inj.athlete?.displayName || "Unknown",
            position: inj.athlete?.position?.abbreviation || "",
            status: (inj.status || "Questionable").toLowerCase(),
          }));
        }
      } catch {}
    }));
  }
  console.log(`  ESPN injuries: data for ${Object.keys(injuries).length} teams`);
  return injuries;
}

// ── Pivot flat CFBD stat rows into nested lookup ─────────────────────────────
// { [teamName]: { [playerName]: { [statType]: value, ...meta } } }
function pivotStats(rows) {
  const dest = {};
  for (const row of rows || []) {
    if (!row.team || !row.player) continue;
    if (!dest[row.team]) dest[row.team] = {};
    if (!dest[row.team][row.player]) {
      dest[row.team][row.player] = {
        _id:    row.playerId,
        _year:  row.year || row.class,
      };
    }
    if (row.statType !== undefined) {
      dest[row.team][row.player][row.statType] = row.stat;
    }
  }
  return dest;
}

// Return top-N entries from a team's stat map sorted by statKey descending
function topN(teamMap, teamName, statKey, n) {
  return Object.entries(teamMap[teamName] || {})
    .filter(([, s]) => (s[statKey] || 0) > 0)
    .sort((a, b) => (b[1][statKey] || 0) - (a[1][statKey] || 0))
    .slice(0, n)
    .map(([name, stats]) => ({ name, stats }));
}

// ── Build a player profile ────────────────────────────────────────────────────

let _globalIdx = 0;

function makePlayer(name, position, teamId, stats, rosterEntry, injStatus, overrides = {}) {
  _globalIdx++;
  const id = `p_api_${teamId.slice(0, 6)}_${position.toLowerCase()}_${_globalIdx}`;

  const year  = rosterEntry?.year        || stats._year || null;
  const num   = rosterEntry?.jersey      || null;
  const ht    = rosterEntry?.height      || null;
  const wt    = rosterEntry?.weight      || null;
  const home  = rosterEntry?.hometown
    ? `${rosterEntry.hometown}${rosterEntry.homeState ? ", " + rosterEntry.homeState : ""}`
    : null;

  // NFL draft projection based on position + stat thresholds
  const nflDraftStatus = (() => {
    if (!year || year === "FR" || year === "SO") return "not eligible";
    if (position === "QB") {
      const yds = stats.YDS || 0;
      if (yds > 3500) return "projected round 1";
      if (yds > 2800) return "projected round 2-3";
      if (yds > 2000) return "projected round 4-5";
      return "undrafted";
    }
    if (position === "RB") {
      const yds = stats.YDS || 0;
      if (yds > 1400) return "projected round 2-3";
      if (yds > 900)  return "projected round 4-5";
      return "undrafted";
    }
    if (position === "WR" || position === "TE") {
      const yds = stats.YDS || 0;
      if (yds > 1200) return "projected round 2-3";
      if (yds > 700)  return "projected round 4-5";
      return "undrafted";
    }
    if (position === "EDGE" || position === "DE") {
      const sacks = stats.SACKS || 0;
      if (sacks > 12) return "projected round 1";
      if (sacks > 7)  return "projected round 2-3";
      if (sacks > 4)  return "projected round 4-5";
      return "undrafted";
    }
    if (position === "LB" || position === "CB" || position === "S") {
      const tck = stats.TACKLES || stats.TOT || stats.SOLO || 0;
      if (tck > 80)   return "projected round 2-3";
      if (tck > 50)   return "projected round 4-5";
      return "undrafted";
    }
    return "undrafted";
  })();

  // Distraction level: 1-5, higher for high-profile players
  const distractionLevel = (() => {
    if (nflDraftStatus === "projected round 1") return 4;
    if (nflDraftStatus === "projected round 2-3") return 3;
    if (overrides.isHighProfile) return 4;
    return 2;
  })();

  const impact = overrides.impact || "medium";

  const player = {
    id,
    teamId,
    name,
    position,
    number:    num   || "",
    year:      year  || "",
    height:    ht    || null,
    weight:    wt    || null,
    hometown:  home  || "",
    injuryStatus: injStatus,
    impact,
    isStarter:      true,
    depthPosition:  overrides.depthPosition || 1,
    nflDraftStatus,
    distractionLevel,
    _fromApi: true,
  };

  // Position-specific stats
  if (position === "QB") {
    const yds = stats.YDS || 0, tds = stats.TD || 0, ints = stats.INT || 0;
    const att = stats.ATT || 1, comp = stats.COMPLETIONS || 0;
    player.stats = {
      passingYards: yds, passingTDs: tds, interceptions: ints,
      completionPct: att > 0 ? +((comp / att * 100).toFixed(1)) : 0,
      attempts: att,
    };
  } else if (position === "RB") {
    const yds = stats.YDS || 0, tds = stats.TD || 0, car = stats.CAR || 1;
    player.stats = {
      rushingYards: yds, rushingTDs: tds, carries: car,
      yardsPerCarry: car > 0 ? +(yds / car).toFixed(1) : 0,
    };
  } else if (position === "WR" || position === "TE") {
    const yds = stats.YDS || 0, tds = stats.TD || 0, rec = stats.REC || 0;
    player.stats = {
      receivingYards: yds, receivingTDs: tds, receptions: rec,
      yardsPerReception: rec > 0 ? +(yds / rec).toFixed(1) : 0,
    };
  } else if (position === "OL") {
    player.stats = {};
  } else if (position === "EDGE" || position === "DE") {
    player.stats = {
      sacks:          stats.SACKS || 0,
      tacklesForLoss: stats.TFL   || 0,
      qbHurries:      stats.QB_HUR || 0,
    };
  } else if (position === "LB") {
    const tot = stats.TACKLES || stats.TOT || 0;
    player.stats = {
      tackles:        tot,
      soloTackles:    stats.SOLO || 0,
      sacks:          stats.SACKS || 0,
      tacklesForLoss: stats.TFL  || 0,
    };
  } else if (position === "CB") {
    player.stats = {
      passBreakups: stats.PBU || stats.PD || 0,
      interceptions: stats.INT || 0,
      tackles: stats.TACKLES || stats.TOT || 0,
    };
  } else if (position === "S") {
    const tot = stats.TACKLES || stats.TOT || 0;
    player.stats = {
      tackles:       tot,
      interceptions: stats.INT || 0,
      passBreakups:  stats.PBU || stats.PD || 0,
    };
  }

  return player;
}

// ── Get injury status for a named player on a team ──────────────────────────
function getInjuryStatus(name, teamInjuries) {
  if (!teamInjuries?.length) return "healthy";
  const lower = name.toLowerCase();
  const inj = teamInjuries.find(i => i.player.toLowerCase() === lower ||
    i.player.toLowerCase().includes(lower.split(" ").pop()));
  if (!inj) return "healthy";
  const s = inj.status;
  if (s.includes("out")) return "out";
  if (s.includes("doubt")) return "doubtful";
  return "questionable";
}

// ── Build OL profile from roster (no stats) ──────────────────────────────────
// Strategy: pick the OL with the highest jersey number as a proxy for seniority
// (linemen commonly wear 50-79 range; larger numbers within that range = more exp)
function pickOL(rosterByTeam, teamName, teamId, teamInjuries) {
  const roster = rosterByTeam[teamName] || [];
  const OL_POSITIONS = new Set(["OL","OT","OG","C","LS","IOL"]);
  const ols = roster.filter(p => OL_POSITIONS.has(p.position));
  if (!ols.length) return null;
  // Sort by year class seniority, then by jersey number desc as tiebreaker
  const ORDER = { SR: 4, JR: 3, SO: 2, FR: 1 };
  ols.sort((a, b) => {
    const ya = ORDER[a.year] || 0, yb = ORDER[b.year] || 0;
    if (yb !== ya) return yb - ya;
    return (parseInt(b.jersey) || 0) - (parseInt(a.jersey) || 0);
  });
  const top = ols[0];
  const injStatus = getInjuryStatus(top.fullName || top.name || "", teamInjuries);
  return makePlayer(
    top.fullName || top.name || "OL Player",
    "OL",
    teamId,
    { _year: top.year },
    top,
    injStatus,
    { impact: "medium" }
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const startTime = Date.now();
  console.log(`\n[fetch-players] Starting — ${new Date().toUTCString()}\n`);

  // Phase 1: fetch all data in parallel
  console.log("Phase 1: Fetching rosters, stats, and injuries in parallel...");
  const [
    rosterRaw,
    passingRaw,
    rushingRaw,
    receivingRaw,
    defensiveRaw,
    espnInjuries,
  ] = await Promise.all([
    cfbdFetch(`/roster?year=${SEASON}`),
    cfbdFetch(`/stats/player/season?year=${SEASON}&classification=fbs&category=passing`),
    cfbdFetch(`/stats/player/season?year=${SEASON}&classification=fbs&category=rushing`),
    cfbdFetch(`/stats/player/season?year=${SEASON}&classification=fbs&category=receiving`),
    cfbdFetch(`/stats/player/season?year=${SEASON}&classification=fbs&category=defensive`),
    fetchESPNInjuries(),
  ]);

  // Phase 2: fallback to 2025 when 2026 season data not available yet (pre-season)
  const statYear = 2025;
  let passingData = passingRaw || [];
  let rushingData = rushingRaw || [];
  let receivingData = receivingRaw || [];
  let defensiveData = defensiveRaw || [];

  if (!passingData.length && !rushingData.length) {
    console.log(`  No ${SEASON} stats found — falling back to ${statYear} season stats...`);
    const [p, r, rec, d] = await Promise.all([
      cfbdFetch(`/stats/player/season?year=${statYear}&classification=fbs&category=passing`),
      cfbdFetch(`/stats/player/season?year=${statYear}&classification=fbs&category=rushing`),
      cfbdFetch(`/stats/player/season?year=${statYear}&classification=fbs&category=receiving`),
      cfbdFetch(`/stats/player/season?year=${statYear}&classification=fbs&category=defensive`),
    ]);
    passingData   = p   || [];
    rushingData   = r   || [];
    receivingData = rec || [];
    defensiveData = d   || [];
    console.log(`  Fallback stats: P:${passingData.length} R:${rushingData.length} Rec:${receivingData.length} D:${defensiveData.length}`);
  }

  // Phase 3: build lookups
  console.log("Phase 2: Building stat lookups...");
  const passingMap   = pivotStats(passingData);
  const rushingMap   = pivotStats(rushingData);
  const receivingMap = pivotStats(receivingData);
  const defensiveMap = pivotStats(defensiveData);

  // Roster: use 2026 if available, fall back to 2025 (transfer portal may not be in 2026 yet)
  let rosterRaw2 = rosterRaw;
  if (!rosterRaw2 || rosterRaw2.length < 100) {
    console.log(`  Thin/missing ${SEASON} roster (${rosterRaw2?.length || 0} players) — falling back to ${statYear} roster...`);
    rosterRaw2 = await cfbdFetch(`/roster?year=${statYear}`) || [];
    console.log(`  Fallback roster: ${rosterRaw2.length} players`);
  }

  const rosterByTeam = {};
  for (const p of rosterRaw2) {
    const t = p.team || p.school;
    if (!t) continue;
    if (!rosterByTeam[t]) rosterByTeam[t] = [];
    rosterByTeam[t].push(p);
  }

  // Build set of all team names across all stat maps + rosters
  const allTeamNames = new Set([
    ...Object.keys(passingMap),
    ...Object.keys(rushingMap),
    ...Object.keys(receivingMap),
    ...Object.keys(defensiveMap),
    ...Object.keys(rosterByTeam),
  ]);

  console.log(`  Teams with data: ${allTeamNames.size}`);

  // Phase 4: generate player profiles
  console.log("Phase 3: Building player profiles...");
  const players = [];

  for (const teamName of allTeamNames) {
    const teamId = schoolToId(teamName);
    if (!teamId) { console.warn(`  [skip] Could not map team: ${teamName}`); continue; }

    const teamInjuries = espnInjuries[teamId] || [];
    const roster       = rosterByTeam[teamName] || [];

    // Build a name → roster entry map for metadata lookups
    const rosterByName = {};
    for (const p of roster) {
      const n = (p.fullName || p.name || "").toLowerCase();
      if (n) rosterByName[n] = p;
    }

    function rosterEntry(name) {
      return rosterByName[name.toLowerCase()] || null;
    }

    // ── QB (1): most passing yards ──────────────────────────
    const qbs = topN(passingMap, teamName, "YDS", 1);
    for (const { name, stats } of qbs) {
      const yds = stats.YDS || 0;
      players.push(makePlayer(name, "QB", teamId, stats, rosterEntry(name),
        getInjuryStatus(name, teamInjuries),
        { impact: yds > 2000 ? "high" : "medium" }
      ));
    }

    // ── RB (1): most rushing yards ──────────────────────────
    const rbs = topN(rushingMap, teamName, "YDS", 1);
    for (const { name, stats } of rbs) {
      const yds = stats.YDS || 0;
      players.push(makePlayer(name, "RB", teamId, stats, rosterEntry(name),
        getInjuryStatus(name, teamInjuries),
        { impact: yds > 800 ? "high" : "medium" }
      ));
    }

    // ── WR (2): most receiving yards, excluding TEs from roster ─
    const receivers = topN(receivingMap, teamName, "YDS", 4);
    let wrCount = 0;
    for (const { name, stats } of receivers) {
      if (wrCount >= 2) break;
      const re = rosterEntry(name);
      const pos = re?.position || "WR";
      if (pos === "TE") continue; // save TEs for their own slot
      const yds = stats.YDS || 0;
      players.push(makePlayer(name, "WR", teamId, stats, re,
        getInjuryStatus(name, teamInjuries),
        { impact: yds > 600 ? "high" : "medium", depthPosition: wrCount + 1 }
      ));
      wrCount++;
    }

    // ── TE (1): most receiving yards from TE-position players ──
    const tes = topN(receivingMap, teamName, "YDS", 5)
      .filter(({ name }) => {
        const re = rosterEntry(name);
        return !re || re.position === "TE";
      });
    if (tes.length) {
      const { name, stats } = tes[0];
      const yds = stats.YDS || 0;
      players.push(makePlayer(name, "TE", teamId, stats, rosterEntry(name),
        getInjuryStatus(name, teamInjuries),
        { impact: yds > 500 ? "high" : "medium" }
      ));
    }

    // ── OL (1): most experienced OL from roster ─────────────
    const olPlayer = pickOL(rosterByTeam, teamName, teamId, teamInjuries);
    if (olPlayer) players.push(olPlayer);

    // ── Edge/DE (1): most sacks; fall back to TFL ───────────
    let edges = topN(defensiveMap, teamName, "SACKS", 1);
    if (!edges.length) edges = topN(defensiveMap, teamName, "TFL", 1);
    for (const { name, stats } of edges) {
      const sacks = stats.SACKS || 0;
      players.push(makePlayer(name, "EDGE", teamId, stats, rosterEntry(name),
        getInjuryStatus(name, teamInjuries),
        { impact: sacks > 6 ? "high" : "medium" }
      ));
    }

    // ── LB (1): most tackles ────────────────────────────────
    const defByTackles = topN(defensiveMap, teamName, "TACKLES", 3)
      .concat(topN(defensiveMap, teamName, "TOT", 3));
    // Deduplicate by name and prefer LB-position players
    const seenDef = new Set();
    const lbCandidates = [];
    for (const entry of defByTackles) {
      if (seenDef.has(entry.name)) continue;
      seenDef.add(entry.name);
      lbCandidates.push(entry);
    }
    // Filter to LBs if possible
    const lbOnly = lbCandidates.filter(({ name }) => {
      const re = rosterEntry(name);
      return !re || ["LB","ILB","OLB","MLB"].includes(re.position);
    });
    const lbPool = lbOnly.length ? lbOnly : lbCandidates;
    if (lbPool.length) {
      const { name, stats } = lbPool[0];
      const tck = stats.TACKLES || stats.TOT || 0;
      players.push(makePlayer(name, "LB", teamId, stats, rosterEntry(name),
        getInjuryStatus(name, teamInjuries),
        { impact: tck > 70 ? "high" : "medium" }
      ));
    }

    // ── CB (1): most PBUs + INTs ────────────────────────────
    const cbCandidates = Object.entries(defensiveMap[teamName] || {})
      .filter(([name]) => {
        const re = rosterEntry(name);
        return !re || ["CB","DB"].includes(re.position);
      })
      .map(([name, s]) => ({ name, stats: s, score: (s.PBU || s.PD || 0) + (s.INT || 0) * 2 }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
    if (cbCandidates.length) {
      const { name, stats } = cbCandidates[0];
      players.push(makePlayer(name, "CB", teamId, stats, rosterEntry(name),
        getInjuryStatus(name, teamInjuries),
        { impact: cbCandidates[0].score > 6 ? "high" : "medium" }
      ));
    }

    // ── S (1): most tackles + INTs ──────────────────────────
    const sCandidates = Object.entries(defensiveMap[teamName] || {})
      .filter(([name]) => {
        const re = rosterEntry(name);
        return !re || ["S","FS","SS","DB"].includes(re.position);
      })
      .map(([name, s]) => ({
        name, stats: s,
        score: (s.TACKLES || s.TOT || 0) + (s.INT || 0) * 3,
      }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
    // Avoid duplicating the CB pick
    const usedCBName = cbCandidates[0]?.name;
    const sFinal = sCandidates.filter(c => c.name !== usedCBName);
    if (sFinal.length) {
      const { name, stats } = sFinal[0];
      players.push(makePlayer(name, "S", teamId, stats, rosterEntry(name),
        getInjuryStatus(name, teamInjuries),
        { impact: sFinal[0].score > 60 ? "high" : "medium" }
      ));
    }
  }

  // Phase 5: write output
  console.log(`\nPhase 4: Writing output...`);
  const output = {
    generated:    new Date().toISOString(),
    season:       SEASON,
    totalPlayers: players.length,
    players,
  };

  writeFileSync(join(DATA_DIR, "players-2026.json"), JSON.stringify(output, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n[fetch-players] Done in ${elapsed}s`);
  console.log(`  Teams processed: ${allTeamNames.size}`);
  console.log(`  Total players:   ${players.length}`);
  console.log(`  With injuries:   ${players.filter(p => p.injuryStatus !== "healthy").length}`);
  console.log(`  Round 1 projections: ${players.filter(p => p.nflDraftStatus === "projected round 1").length}`);
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
