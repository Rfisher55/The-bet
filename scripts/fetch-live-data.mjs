#!/usr/bin/env node
/**
 * fetch-live-data.mjs
 * Fetches the full 2026 FBS schedule + betting lines from CFBD + ESPN,
 * writes data/games-2026.json for instant page rendering.
 * Run by GitHub Actions every 6 hours (every 30 min on Saturdays).
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const SEASON = 2026;

const CFBD_BASE = "https://api.collegefootballdata.com";
const ESPN_BASE =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football";

// Use GitHub Secret → fall back to the key already in config.js
const CFBD_KEY =
  process.env.CFBD_API_KEY ||
  "PYpnlfCwGnHmml4BtUbvE0q+oafSE2BuqAREeEXnY+NUalkbuV6hYHoKO3udgFdB";

// ── Team name → internal ID map (matches data-fbs-stubs.js) ─────────────────
const SCHOOL_TO_ID = {
  LSU: "lsu", Georgia: "georgia", Alabama: "alabama", Texas: "texas",
  "Notre Dame": "notre_dame", "Penn State": "penn_state", Michigan: "michigan",
  Clemson: "clemson", "Ohio State": "ohio_state", Oregon: "oregon",
  Tennessee: "tennessee", Miami: "miami", Auburn: "auburn", Florida: "florida",
  "Florida State": "florida_state", Wisconsin: "wisconsin",
  Illinois: "illinois", Indiana: "indiana", Iowa: "iowa", Maryland: "maryland",
  "Michigan State": "michigan_state", Minnesota: "minnesota",
  Nebraska: "nebraska", Northwestern: "northwestern", Purdue: "purdue",
  Rutgers: "rutgers", UCLA: "ucla", USC: "usc", Washington: "washington",
  "Oregon State": "oregon_state", "Washington State": "washington_state",
  Arkansas: "arkansas", Kentucky: "kentucky",
  "Mississippi State": "mississippi_state", Missouri: "missouri",
  "Ole Miss": "ole_miss", Mississippi: "ole_miss",
  "South Carolina": "south_carolina", "Texas A&M": "texas_am",
  Vanderbilt: "vanderbilt",
  "Boston College": "boston_college", California: "california",
  Duke: "duke", "Georgia Tech": "georgia_tech", Louisville: "louisville",
  "NC State": "nc_state", "North Carolina State": "nc_state",
  "North Carolina": "north_carolina", Pittsburgh: "pittsburgh",
  Syracuse: "syracuse", Virginia: "virginia", "Virginia Tech": "virginia_tech",
  "Wake Forest": "wake_forest", SMU: "smu", Stanford: "stanford",
  Cal: "california",
  Arizona: "arizona", "Arizona State": "arizona_state", Baylor: "baylor",
  BYU: "byu", Cincinnati: "cincinnati", Colorado: "colorado",
  Houston: "houston", "Iowa State": "iowa_state", Kansas: "kansas",
  "Kansas State": "kansas_state", "Oklahoma State": "oklahoma_state",
  TCU: "tcu", "Texas Tech": "texas_tech", UCF: "ucf", Utah: "utah",
  "West Virginia": "west_virginia",
  Army: "army", "East Carolina": "east_carolina", Memphis: "memphis",
  Navy: "navy", "North Texas": "north_texas", Rice: "rice",
  "South Florida": "south_florida", Tulane: "tulane", Tulsa: "tulsa",
  UTSA: "utsa", UAB: "uab", Charlotte: "charlotte",
  "Florida Atlantic": "fau", FAU: "fau",
  "Air Force": "air_force", "Boise State": "boise_state",
  "Colorado State": "colorado_state", "Fresno State": "fresno_state",
  Hawaii: "hawaii", Nevada: "nevada", "New Mexico": "new_mexico",
  "San Diego State": "san_diego_state", "San Jose State": "san_jose_state",
  UNLV: "unlv", "Utah State": "utah_state", Wyoming: "wyoming",
  "Appalachian State": "app_state", "App State": "app_state",
  "Arkansas State": "arkansas_state", "Coastal Carolina": "coastal_carolina",
  "Georgia Southern": "georgia_southern", "Georgia State": "georgia_state",
  "James Madison": "james_madison", Louisiana: "louisiana",
  "Louisiana Monroe": "ul_monroe", "UL Monroe": "ul_monroe",
  Marshall: "marshall", "Old Dominion": "old_dominion",
  "South Alabama": "south_alabama", "Texas State": "texas_state",
  Troy: "troy",
  Akron: "akron", "Ball State": "ball_state",
  "Bowling Green": "bowling_green", Buffalo: "buffalo",
  "Central Michigan": "central_michigan",
  "Eastern Michigan": "eastern_michigan", "Kent State": "kent_state",
  "Miami (OH)": "miami_oh", "Northern Illinois": "northern_illinois",
  Ohio: "ohio", Toledo: "toledo", "Western Michigan": "western_michigan",
  FIU: "fiu", "Florida International": "fiu",
  "Jacksonville State": "jacksonville_state",
  "Kennesaw State": "kennesaw_state", "La Tech": "la_tech",
  "Louisiana Tech": "la_tech", Liberty: "liberty",
  "Middle Tennessee": "middle_tennessee",
  "New Mexico State": "new_mexico_state", "Sam Houston": "sam_houston",
  "Southern Miss": "southern_miss", UTEP: "utep",
  "Western Kentucky": "western_kentucky",
  UConn: "uconn", Connecticut: "uconn", UMass: "umass",
  Massachusetts: "umass",
};

function schoolToId(name) {
  if (!name) return null;
  if (SCHOOL_TO_ID[name] !== undefined) return SCHOOL_TO_ID[name];
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || null;
}

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
    const r = await fetch(`${ESPN_BASE}${endpoint}`);
    if (!r.ok) { console.warn(`  ESPN ${r.status}: ${endpoint}`); return null; }
    return r.json();
  } catch (e) { console.warn(`  ESPN fail: ${endpoint} — ${e.message}`); return null; }
}

// ── Parse helpers ────────────────────────────────────────────────────────────
function toDate(iso) {
  return iso ? iso.slice(0, 10) : null;
}

function toTime(iso, tbd) {
  if (tbd || !iso) return "TBD";
  try {
    return (
      new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
      }) + " ET"
    );
  } catch { return "TBD"; }
}

function bestLine(providers) {
  if (!providers?.length) return null;
  const p =
    providers.find((x) => /draftkings/i.test(x.provider)) ||
    providers.find((x) => /fanduel/i.test(x.provider)) ||
    providers.find((x) => /espn/i.test(x.provider)) ||
    providers[0];
  if (!p) return null;
  return {
    spread:        p.spread        != null ? parseFloat(p.spread)        : null,
    total:         p.overUnder     != null ? parseFloat(p.overUnder)     : null,
    moneylineHome: p.homeMoneyline != null ? parseInt(p.homeMoneyline)   : null,
    moneylineAway: p.awayMoneyline != null ? parseInt(p.awayMoneyline)   : null,
    provider:      p.provider || null,
    openingSpread: p.spreadOpen    != null ? parseFloat(p.spreadOpen)    : null,
    openingTotal:  p.overUnderOpen != null ? parseFloat(p.overUnderOpen) : null,
  };
}

// ── ESPN: full scoreboard (all weeks) ────────────────────────────────────────
async function fetchESPNScoreboard() {
  const WEEKS = Array.from({ length: 16 }, (_, i) => i + 1);
  const results = await Promise.allSettled(
    WEEKS.map((w) =>
      espnFetch(
        `/scoreboard?groups=80&limit=200&seasontype=2&week=${w}&dates=${SEASON}`
      )
    )
  );
  // Also grab postseason
  results.push(
    await Promise.resolve(
      espnFetch(`/scoreboard?groups=80&limit=100&seasontype=3&dates=${SEASON}`)
        .then((d) => ({ status: "fulfilled", value: d }))
        .catch(() => ({ status: "rejected" }))
    )
  );

  const byKey = {}; // "HomeName|AwayName" → espn game info
  for (const r of results) {
    const events = r.status === "fulfilled" ? r.value?.events : null;
    if (!events) continue;
    for (const ev of events) {
      const comp = ev.competitions?.[0];
      if (!comp) continue;
      const home = comp.competitors?.find((c) => c.homeAway === "home");
      const away = comp.competitors?.find((c) => c.homeAway === "away");
      if (!home || !away) continue;

      const statusName = ev.status?.type?.name || "STATUS_SCHEDULED";
      const completed  = statusName === "STATUS_FINAL";
      const inProgress = statusName === "STATUS_IN_PROGRESS";

      // Network: try broadcasts first, then geo broadcasts
      const network =
        comp.broadcasts?.[0]?.names?.[0] ||
        comp.geoBroadcasts?.[0]?.media?.shortName ||
        "TBD";

      const key = `${home.team?.displayName}|${away.team?.displayName}`;
      byKey[key] = {
        espnId:       ev.id,
        homeTeamName: home.team?.displayName || "",
        awayTeamName: away.team?.displayName || "",
        homeScore:    completed || inProgress ? parseInt(home.score) || null : null,
        awayScore:    completed || inProgress ? parseInt(away.score) || null : null,
        date:         toDate(ev.date),
        time:         completed || inProgress
                        ? (ev.status?.type?.shortDetail || "Final")
                        : toTime(ev.date, false),
        network,
        status:       completed ? "final" : inProgress ? "in_progress" : "scheduled",
        week:         ev.week?.number || null,
        neutralSite:  comp.neutralSite || false,
        venue:        comp.venue?.fullName || "",
      };
    }
  }
  return byKey;
}

// ── ESPN: injury reports for all FBS teams ───────────────────────────────────
async function fetchESPNInjuries() {
  // ESPN team IDs for FBS (major programs only — expand as needed)
  const ESPN_IDS = {
    alabama: 333, auburn: 2, florida: 57, georgia: 61, lsu: 99,
    ohio_state: 194, michigan: 130, penn_state: 213, clemson: 228,
    notre_dame: 87, texas: 251, oregon: 2483, "texas_am": 245,
    tennessee: 2633, miami: 2390, baylor: 239, iowa: 2294,
    wisconsin: 275, oklahoma_state: 197, kansas_state: 2306,
    utah: 254, byu: 252, cincinnati: 2132, ucf: 2116,
    "florida_state": 52, "north_carolina": 153, pittsburgh: 221,
    "virginia_tech": 259, louisville: 97, "wake_forest": 154,
    "boston_college": 103, duke: 150, syracuse: 183, virginia: 258,
    stanford: 24, california: 25, smu: SMU = 2567,
    "arizona_state": 9, arizona: 12, colorado: 38, "west_virginia": 277,
    "iowa_state": 66, kansas: 2305, "texas_tech": 2641, tcu: 2628,
    houston: 248, "north_texas": 249, memphis: 235, tulane: 2655, navy: 2426,
    army: 349, "south_florida": 58, "east_carolina": 151, rice: 242,
    "boise_state": 68, "fresno_state": 278, "san_diego_state": 21,
    nevada: 2440, unlv: 2439, wyoming: 2751, "air_force": 2005,
    "utah_state": 328, "new_mexico": 167, hawaii: 62, "colorado_state": 36,
  };
  const injuries = {};
  const entries = Object.entries(ESPN_IDS);
  // Batch in groups of 8 to avoid hammering ESPN
  for (let i = 0; i < entries.length; i += 8) {
    const batch = entries.slice(i, i + 8);
    await Promise.all(
      batch.map(async ([teamId, espnId]) => {
        try {
          const d = await espnFetch(`/teams/${espnId}?enable=injuries`);
          const injs = d?.team?.injuries || [];
          if (injs.length) {
            injuries[teamId] = injs.map((inj) => ({
              player:     inj.athlete?.displayName || "Unknown",
              position:   inj.athlete?.position?.abbreviation || "",
              status:     inj.status || "Questionable",
              detail:     inj.longComment || inj.shortComment || "",
              returnDate: inj.returnDate || null,
            }));
          }
        } catch {}
      })
    );
  }
  return injuries;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const startTime = Date.now();
  console.log(`\n🏈 Fetching ${SEASON} CFB data — ${new Date().toUTCString()}`);

  // ── Parallel fetches ────────────────────────────────────────────────────────
  console.log("  Fetching CFBD + ESPN in parallel...");
  const [gamesReg, gamesPost, linesRaw, rankings, espnByKey] = await Promise.all([
    cfbdFetch(`/games?year=${SEASON}&seasonType=regular`),
    cfbdFetch(`/games?year=${SEASON}&seasonType=postseason`),
    cfbdFetch(`/lines?year=${SEASON}`),
    cfbdFetch(`/rankings?year=${SEASON}&seasonType=regular`),
    fetchESPNScoreboard(),
  ]);

  // ── Build betting-lines lookup by CFBD game ID ───────────────────────────
  const linesById = {};
  for (const l of linesRaw || []) {
    if (l.id && l.lines?.length) linesById[l.id] = bestLine(l.lines);
  }

  // ── Build AP rankings lookup ─────────────────────────────────────────────
  // Use most recent week available
  const apRanks = {};
  const sortedRanks = (rankings || []).sort(
    (a, b) => (b.week || 0) - (a.week || 0)
  );
  const latestAP = sortedRanks.find((r) =>
    r.polls?.some((p) => p.poll === "AP Top 25")
  );
  if (latestAP) {
    const poll = latestAP.polls.find((p) => p.poll === "AP Top 25");
    for (const r of poll?.ranks || []) {
      const id = schoolToId(r.school);
      if (id) apRanks[id] = r.rank;
    }
  }

  // ── Merge CFBD + ESPN game data ──────────────────────────────────────────
  const allCfbd = [...(gamesReg || []), ...(gamesPost || [])];
  console.log(
    `  CFBD: ${allCfbd.length} games | ESPN scoreboard: ${Object.keys(espnByKey).length} games | Lines: ${Object.keys(linesById).length}`
  );

  const games = allCfbd
    .filter((g) => g.home_division === "fbs" || g.away_division === "fbs")
    .map((g) => {
      const espnKey = `${g.home_team}|${g.away_team}`;
      const espn = espnByKey[espnKey] || null;
      const line = linesById[g.id] || null;
      const homeId = schoolToId(g.home_team);
      const awayId = schoolToId(g.away_team);

      const status = g.completed
        ? "final"
        : espn?.status === "in_progress"
        ? "in_progress"
        : "scheduled";

      return {
        id:               `cfbd_${g.id}`,
        cfbdId:           g.id,
        week:             g.week || 1,
        seasonType:       g.season_type || "regular",
        date:             espn?.date || toDate(g.start_date) || `${SEASON}-09-05`,
        time:             espn?.time || toTime(g.start_date, g.start_time_tbd),
        homeTeamId:       homeId,
        awayTeamId:       awayId,
        homeTeamName:     g.home_team,
        awayTeamName:     g.away_team,
        homeConference:   g.home_conference || "",
        awayConference:   g.away_conference || "",
        network:          espn?.network || g.notes || "TBD",
        venue:            espn?.venue || g.venue || "",
        isConferenceGame: g.conference_game || false,
        neutralSite:      espn?.neutralSite ?? g.neutral_site ?? false,
        status,
        homeScore:  g.home_points ?? espn?.homeScore ?? null,
        awayScore:  g.away_points ?? espn?.awayScore ?? null,
        homeElo:    g.home_pregame_elo || null,
        awayElo:    g.away_pregame_elo || null,
        homeApRank: apRanks[homeId] || null,
        awayApRank: apRanks[awayId] || null,
        bettingLines: line,
        // Standard fields expected by predictor.js
        weather:       null,
        lineMovement:  null,
        situational:   {},
        xFactors:      [],
        socialIntel: {
          lineMovement:  [],
          publicBetting: { homePct: 50, awayPct: 50, overPct: 50, underPct: 50 },
          beatWriter:    [],
        },
        gamePreview: {
          headline: `${g.away_team} at ${g.home_team}`,
          synopsis: `Week ${g.week || 1} ${g.season_type || "regular"} season matchup.`,
          analysis: [],
          thePick:  { team: "", line: "", confidence: "LOW", unit: 1, reasoning: "" },
        },
        fromPregen: true,
      };
    });

  // ── Fetch injury reports (non-blocking, best effort) ─────────────────────
  console.log("  Fetching ESPN injury reports...");
  const injuries = await fetchESPNInjuries().catch(() => ({}));
  const injuryCount = Object.values(injuries).flat().length;

  // ── Write output files ───────────────────────────────────────────────────
  const metadata = {
    generated:      new Date().toISOString(),
    season:         SEASON,
    totalGames:     games.length,
    scheduledGames: games.filter((g) => g.status === "scheduled").length,
    completedGames: games.filter((g) => g.status === "final").length,
    liveGames:      games.filter((g) => g.status === "in_progress").length,
    gamesWithLines: games.filter((g) => g.bettingLines).length,
    rankedTeams:    Object.keys(apRanks).length,
    injuredPlayers: injuryCount,
    fetchDurationMs: Date.now() - startTime,
  };

  writeFileSync(
    join(DATA_DIR, "games-2026.json"),
    JSON.stringify({ ...metadata, apRanks, games }, null, 2)
  );

  writeFileSync(
    join(DATA_DIR, "injuries.json"),
    JSON.stringify({ generated: metadata.generated, injuries }, null, 2)
  );

  writeFileSync(
    join(DATA_DIR, "metadata.json"),
    JSON.stringify(metadata, null, 2)
  );

  console.log(`\n✅ Done in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log(
    `   ${metadata.totalGames} games (${metadata.scheduledGames} scheduled, ` +
    `${metadata.completedGames} final, ${metadata.liveGames} live)`
  );
  console.log(`   ${metadata.gamesWithLines} with betting lines`);
  console.log(`   ${metadata.rankedTeams} AP-ranked teams`);
  console.log(`   ${metadata.injuredPlayers} injury reports`);
}

main().catch((err) => { console.error("FATAL:", err); process.exit(1); });
