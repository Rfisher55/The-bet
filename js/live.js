/* ═══════════════════════════════════════════════════════════════
   THE BET — Live Data Layer v5
   Sources: CFBD API, ESPN public API, Reddit r/CFB (public JSON)
   Key set via window.CFBD_DEFAULT_KEY in config.js (or user-entered).
   Pre-generated data: data/games-2026.json (refreshed by GitHub Actions)
   ═══════════════════════════════════════════════════════════════ */

const SEASON = 2026;

/* ── Pre-gen quickstart: load GitHub-Actions-generated game file ─────────────
   Runs immediately on page load, before the CFBD API fetch.
   Merges all ~800+ real FBS games into window.GAMES and fires liveDataReady
   so pages render instantly instead of waiting 5-10 s for API responses.
   The CFBD/ESPN API fetch still runs in the background for live scores/odds. */
(function _pregenQuickstart() {
  const base = window.location.pathname.includes("/pages/") ? "../" : "./";
  const url  = base + `data/games-${SEASON}.json`;

  fetch(url, { cache: "no-cache" })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      // Accept any non-empty games array; the automated pipeline fills it with
      // 800+ games once CFBD publishes the full season schedule (July/August).
      // During the preseason, a curated seed of marquee matchups is served instead.
      if (!d || !Array.isArray(d.games) || d.games.length < 1) return;

      // Ignore the stub file (generated before GitHub Actions ran)
      if (d.generated === "2026-01-01T00:00:00.000Z") return;

      // Warn if stale > 12 hours but still use the data — stale schedule is
      // better than waiting for a slow/unavailable API on every page load.
      const ageH = (Date.now() - new Date(d.generated).getTime()) / 3600000;
      if (ageH > 12) {
        console.log("[PREGEN] File is " + ageH.toFixed(1) + "h old — using anyway, API will refresh");
      }

      if (!window.GAMES) return;

      // Merge: don't overwrite curated games already in GAMES
      var existingIds  = new Set(GAMES.map(function(g) { return g.id; }));
      var existingKeys = new Set(GAMES.map(function(g) {
        return g.week + "|" + g.homeTeamId + "|" + g.awayTeamId;
      }));

      var added = 0;
      d.games.forEach(function(g) {
        if (existingIds.has(g.id)) return;
        var mk = g.week + "|" + g.homeTeamId + "|" + g.awayTeamId;
        if (existingKeys.has(mk)) {
          // Update betting lines on the curated version if it doesn't have them
          var existing = GAMES.find(function(x) {
            return x.week === g.week && x.homeTeamId === g.homeTeamId && x.awayTeamId === g.awayTeamId;
          });
          if (existing && !existing.bettingLines && g.bettingLines) {
            existing.bettingLines = g.bettingLines;
          }
          return;
        }
        GAMES.push(g);
        existingIds.add(g.id);
        existingKeys.add(mk);
        added++;
      });

      // Inject AP rankings into TEAMS; clear stale ranks if full poll is present
      if (d.apRanks && window.TEAMS) {
        const fullPoll = Object.keys(d.apRanks).length >= 25;
        Object.keys(d.apRanks).forEach(function(id) {
          if (TEAMS[id]) TEAMS[id].apRank = d.apRanks[id];
        });
        if (fullPoll) {
          Object.values(TEAMS).forEach(function(t) {
            if (t.id && d.apRanks[t.id] == null && t.apRank) t.apRank = null;
          });
        }
      }

      if (added === 0 && !window.__liveDataReady) {
        // Lines may have been updated on curated games only — still trigger render
      }

      console.log("[PREGEN] " + added + " games loaded instantly (" + d.totalGames + " in file, updated " + new Date(d.generated).toLocaleTimeString() + ")");

      // Fire liveDataReady so all pages render immediately with real data.
      // Always fire when games were added, even if __liveDataReady is already set
      // (cache path can set it before pregen completes, silencing pregen games).
      if (added > 0 || !window.__liveDataReady) {
        if (!window.__liveDataReady) {
          window.__liveDataReady = true;
          window.__pregenLoaded  = true;
        }
        window.dispatchEvent(new CustomEvent("liveDataReady", { detail: { _fromPregen: true, fetchedAt: d.generated } }));
      }
    })
    .catch(function() {
      // File doesn't exist yet (first deploy) — fall through to API fetch
    });
}());

/* ── Player data loader — merges data/players-2026.json into KEY_PLAYERS ──────
   Runs at startup. Curated entries keep their rich scout reports/analysis, but
   their stats + injury status are UPDATED from the API file so numbers are live.
   Completely new players (non-curated teams) are appended. ─────────────────── */
(function _loadPlayerData() {
  var base = window.location.pathname.includes("/pages/") ? "../" : "./";
  var url  = base + `data/players-${SEASON}.json`;

  fetch(url, { cache: "no-cache" })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (!d || !Array.isArray(d.players) || d.players.length === 0) return;
      if (typeof KEY_PLAYERS === "undefined" || !Array.isArray(KEY_PLAYERS)) return;

      // Build lookup maps so we can find curated players quickly
      var byId  = {};
      var byKey = {};
      KEY_PLAYERS.forEach(function(p) {
        byId[p.id] = p;
        var k = p.teamId + "|" + p.position + "|" + (p.name || "").toLowerCase();
        byKey[k] = p;
      });

      var added = 0, updated = 0;
      d.players.forEach(function(p) {
        if (!p || !p.id || !p.teamId) return;

        var k = p.teamId + "|" + p.position + "|" + (p.name || "").toLowerCase();
        var curated = byId[p.id] || byKey[k];

        if (curated) {
          // Inject live stats onto curated profile — API numbers always win
          if (p.stats && Object.keys(p.stats).length > 0) {
            curated.stats = Object.assign({}, curated.stats, p.stats);
          }
          // Propagate real injury status when player is actually hurt
          if (p.injuryStatus && p.injuryStatus !== "healthy") {
            curated.injuryStatus  = p.injuryStatus;
            curated.practiceStatus = p.practiceStatus || curated.practiceStatus;
            curated.injuryType    = p.injuryType    || curated.injuryType;
          }
          // Update physical/roster data that can change year-to-year
          if (p.year)         curated.year         = p.year;
          if (p.number)       curated.number       = p.number;
          if (p.heightWeight) curated.heightWeight = p.heightWeight;
          updated++;
          return;
        }

        // Brand-new player (non-curated team) — add to pool
        KEY_PLAYERS.push(p);
        byId[p.id] = p;
        byKey[k]   = p;
        added++;
      });

      window.KEY_PLAYERS = KEY_PLAYERS;
      console.log("[PLAYERS] +" + added + " new, " + updated + " stats refreshed from API (" + d.totalPlayers + " in file, generated " + new Date(d.generated).toLocaleDateString() + ")");
    })
    .catch(function() {
      // File may not exist yet (first deploy) — safe to ignore
    });
}());

/* ── Team extras loader — loads team-extras.json (Reddit buzz, SP+, team news) ──
   Fetched year-round by the workflow. Exposes window.__teamNews so the
   Social Intelligence Hub can show breaking news for any team at any time. ── */
(function _loadTeamExtras() {
  var base = window.location.pathname.includes("/pages/") ? "../" : "./";
  fetch(base + "data/team-extras.json", { cache: "no-cache" })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (!d) return;
      if (d.teamNews)   window.__teamNews      = d.teamNews;
      if (d.redditBuzz) window.__teamRedditBuzz = d.redditBuzz;
      if (d.spRatings)  window.__spRatings     = d.spRatings;
      if (d.injuries)   window.__teamInjuries  = d.injuries;
      if (d.coachMap)   window.__coachMap      = d.coachMap;
      window.dispatchEvent(new CustomEvent("teamExtrasReady", { detail: d }));
      console.log("[EXTRAS] Team news: " + Object.keys(d.teamNews||{}).length + " teams, SP+: " + (d.spRatings||[]).length + " teams");
    })
    .catch(function() {});
}());

/* ── Roster loader — loads data/rosters.json (pre-generated by GitHub Actions) ─────
   Runs at startup. Stores all ~130 FBS team rosters in window.__pregRosters so
   applyData() can merge them without requiring 130+ live ESPN API calls per page load.
   Live-fetched rosters (16 curated teams) override pre-generated ones when available. */
(function _loadRosters() {
  var base = window.location.pathname.includes("/pages/") ? "../" : "./";
  fetch(base + "data/rosters.json", { cache: "no-cache" })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (!d || !d.rosters) return;
      window.__pregRosters = d.rosters;
      console.log("[ROSTERS] Pre-generated: " + d.totalTeams + " teams, " + d.totalPlayers + " players (generated " + new Date(d.generated).toLocaleDateString() + ")");
    })
    .catch(function() {});
}());

/* ── Web intel loader — loads web-intel.json (scraped betting %, ATS trends, news) ──
   Updated every 20–120 min by scrape-web.yml. Supplements team-extras with
   TeamRankings ATS records, public betting %, Reddit sentiment, and critical alerts. */
(function _loadWebIntel() {
  var base = window.location.pathname.includes("/pages/") ? "../" : "./";
  fetch(base + "data/web-intel.json", { cache: "no-cache" })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (!d) return;
      window.__webIntel = d;
      // Merge Reddit sentiment into __teamRedditBuzz AND push it back into TEAMS
      if (d.redditSentiment) {
        window.__teamRedditBuzz = window.__teamRedditBuzz || {};
        Object.assign(window.__teamRedditBuzz, d.redditSentiment);
        // Update fanMorale and programMomentum from Reddit buzz so the predictor uses live sentiment
        Object.entries(d.redditSentiment).forEach(function(entry) {
          var teamId = entry[0], buzz = entry[1];
          var team = window.TEAMS && window.TEAMS[teamId];
          if (!team || !team.programHealth) return;
          var buzzScore  = (typeof buzz === "object" ? (buzz.buzz || 50) : 50);
          var sentiment  = (typeof buzz === "object" ? (buzz.avgSentiment || 0) : 0);
          // Blend: 65% existing data, 35% Reddit signal (Reddit is noisy but directionally useful)
          var existing = team.programHealth.fanMorale || 60;
          team.programHealth.fanMorale = Math.round(existing * 0.65 + buzzScore * 0.35);
          // Update programMomentum direction from sentiment
          if      (sentiment >  0.3) team.programHealth.programMomentum = "rising";
          else if (sentiment < -0.3) team.programHealth.programMomentum = "declining";
          team.programHealth._redditUpdated = true;
        });
      }
      // Merge team news (web-intel news supplements team-extras news)
      if (d.newsByTeam) {
        window.__teamNews = window.__teamNews || {};
        for (var tid in d.newsByTeam) {
          if (!window.__teamNews[tid]) window.__teamNews[tid] = [];
          // Prepend critical alerts from web-intel to the front of the news list
          var newItems = d.newsByTeam[tid].filter(function(n) {
            return !window.__teamNews[tid].some(function(e) { return e.title === n.title; });
          });
          window.__teamNews[tid] = newItems.concat(window.__teamNews[tid]).slice(0, 6);
        }
      }
      // Store ATS trends for use in predictor signal display
      if (d.atsRankings)  window.__atsRankings  = d.atsRankings;
      if (d.bettingPcts)  window.__bettingPcts  = d.bettingPcts;
      if (d.expertPicks)  window.__expertPicks  = d.expertPicks;
      if (d.criticalAlerts && d.criticalAlerts.length > 0) {
        window.__criticalAlerts = d.criticalAlerts;
        console.warn("[WEB-INTEL] " + d.criticalAlerts.length + " critical alert(s):", d.criticalAlerts.map(function(a){return a.title;}).join(" | "));
      }
      window.dispatchEvent(new CustomEvent("webIntelReady", { detail: d }));
      var age = d.generatedAt ? Math.round((Date.now() - new Date(d.generatedAt).getTime()) / 60000) : "?";
      console.log("[WEB-INTEL] Loaded — ATS: " + Object.keys(d.atsRankings||{}).length + " teams, Reddit: " + Object.keys(d.redditSentiment||{}).length + " teams, age: " + age + "min");
    })
    .catch(function() {});
}());

// Load pre-generated injury data
(function _loadInjuries() {
  var base = window.location.pathname.includes("/pages/") ? "../" : "./";
  fetch(base + "data/injuries.json", { cache: "no-cache" })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (!d || !Array.isArray(d.injuries)) return;
      window.__teamInjuries = d.injuries;
    })
    .catch(function() {}); // non-critical — fails silently
})();

const LIVE = (() => {
  const CFBD      = "https://api.collegefootballdata.com";
  const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/football/college-football";
  // SEASON is defined at module scope (top of file)
  const KEY_STORE   = "theBet_cfbdKey";
  const CACHE_STORE = "theBet_liveCache_v11";  // v11 = ESPN rosters/injuries/team news/stats/live scores for all 16 curated teams
  const CACHE_TTL   = 30 * 60 * 1000;          // 30 minutes

  // ── Explicit school-name → internal-ID mapping ──────────────
  // All names must match exactly what CFBD returns in their API
  const SCHOOL_TO_ID = {
    "LSU":"lsu","Georgia":"georgia","Alabama":"alabama","Texas":"texas",
    "Notre Dame":"notre_dame","Penn State":"penn_state","Michigan":"michigan",
    "Clemson":"clemson","Ohio State":"ohio_state","Oregon":"oregon",
    "Tennessee":"tennessee","Miami":"miami","Auburn":"auburn","Florida":"florida",
    "Florida State":"florida_state","Wisconsin":"wisconsin",
    // Big Ten
    "Illinois":"illinois","Indiana":"indiana","Iowa":"iowa","Maryland":"maryland",
    "Michigan State":"michigan_state","Minnesota":"minnesota","Nebraska":"nebraska",
    "Northwestern":"northwestern","Purdue":"purdue","Rutgers":"rutgers","UCLA":"ucla",
    "USC":"usc","Washington":"washington","UCLA Bruins":"ucla",
    // Pac-2
    "Oregon State":"oregon_state","Washington State":"washington_state",
    // SEC
    "Arkansas":"arkansas","Kentucky":"kentucky","Mississippi State":"mississippi_state",
    "Missouri":"missouri","Ole Miss":"ole_miss","Mississippi":"ole_miss",
    "South Carolina":"south_carolina","Texas A&M":"texas_am","Vanderbilt":"vanderbilt",
    // ACC
    "Boston College":"boston_college","California":"cal","Duke":"duke",
    "Georgia Tech":"georgia_tech","Louisville":"louisville","Miami (FL)":"miami",
    "NC State":"nc_state","North Carolina":"north_carolina","Pittsburgh":"pittsburgh",
    "SMU":"smu","Stanford":"stanford","Syracuse":"syracuse","Virginia":"virginia",
    "Virginia Tech":"virginia_tech","Wake Forest":"wake_forest",
    // Big 12
    "Arizona":"arizona","Arizona State":"arizona_state","Baylor":"baylor",
    "BYU":"byu","Cincinnati":"cincinnati","Colorado":"colorado",
    "Houston":"houston","Iowa State":"iowa_state","Kansas":"kansas",
    "Kansas State":"kansas_state","Oklahoma State":"oklahoma_state",
    "TCU":"tcu","Texas Tech":"texas_tech","UCF":"ucf","Utah":"utah",
    "West Virginia":"west_virginia",
    // American / CUSA / MWC / Sun Belt / MAC / Independents
    "Air Force":"air_force","Akron":"akron","Alabama A&M":"alabama_am",
    "Appalachian State":"app_state","App State":"app_state",
    "Arkansas State":"arkansas_state","Army":"army","Ball State":"ball_state",
    "Bowling Green":"bowling_green","Buffalo":"buffalo","Central Michigan":"central_michigan",
    "Charlotte":"charlotte","Coastal Carolina":"coastal_carolina",
    "Colorado State":"colorado_state","Connecticut":"uconn","UConn":"uconn",
    "East Carolina":"east_carolina","Eastern Michigan":"eastern_michigan",
    "FAU":"fau","Florida Atlantic":"fau","FIU":"fiu",
    "Florida International":"fiu","Fresno State":"fresno_state",
    "Georgia Southern":"georgia_southern","Georgia State":"georgia_state",
    "Hawaii":"hawaii","Jacksonville State":"jacksonville_state",
    "James Madison":"james_madison","Kent State":"kent_state",
    "Kentucky":"kentucky","La Tech":"la_tech","Louisiana Tech":"la_tech",
    "Liberty":"liberty","Louisiana":"louisiana",
    "Louisiana Monroe":"ul_monroe","UL Monroe":"ul_monroe",
    "Marshall":"marshall","Memphis":"memphis","Miami (OH)":"miami_oh",
    "Middle Tennessee":"middle_tennessee","Nevada":"nevada",
    "New Mexico":"new_mexico","New Mexico State":"new_mexico_state",
    "North Texas":"north_texas","Northern Illinois":"northern_illinois",
    "Ohio":"ohio","Old Dominion":"old_dominion","Rice":"rice",
    "Sam Houston":"sam_houston","San Diego State":"san_diego_state",
    "San Jose State":"san_jose_state","South Alabama":"south_alabama",
    "South Florida":"south_florida","Southern Miss":"southern_miss",
    "Texas State":"texas_state","Toledo":"toledo","Troy":"troy",
    "Tulane":"tulane","Tulsa":"tulsa","UNLV":"unlv",
    "UT San Antonio":"utsa","UTSA":"utsa","UTEP":"utep","Utah State":"utah_state",
    "UAB":"uab","Wake Forest":"wake_forest","Western Kentucky":"western_kentucky",
    "Western Michigan":"western_michigan","Wyoming":"wyoming",
    "Navy":"navy","Massachusetts":"umass","UMass":"umass",
    // Explicit "State" mappings to prevent partial-string confusion (e.g. "Tennessee" ≠ "Tennessee State")
    "Tennessee State":"tennessee_state","Florida State":"florida_state",
    "Michigan State":"michigan_state","Ohio State":"ohio_state","Penn State":"penn_state",
    "Kansas State":"kansas_state","Iowa State":"iowa_state","Oklahoma State":"oklahoma_state",
    "Arizona State":"arizona_state","Colorado State":"colorado_state",
    "Mississippi State":"mississippi_state","Utah State":"utah_state",
    "San Diego State":"san_diego_state","San Jose State":"san_jose_state","San José State":"san_jose_state",
    "Boise State":"boise_state","Montana State":"montana_state",
    "Idaho State":"idaho_state","Weber State":"weber_state",
    "Portland State":"portland_state","Sacramento State":"sacramento_state",
    "Fresno State":"fresno_state","Kennesaw State":"kennesaw_state",
    "Murray State":"murray_state","Murray":"murray_state",
    "Ball State":"ball_state","Kent State":"kent_state",
    "Georgia State":"georgia_state","Georgia Southern":"georgia_southern",
    "Louisiana State":"lsu","LSU":"lsu",
    "North Carolina State":"nc_state","NC State":"nc_state",
    "Arkansas State":"arkansas_state","Alabama State":"alabama_state",
    "Texas State":"texas_state","Texas Southern":"texas_southern",
    "Bowling Green State":"bowling_green","Bowling Green":"bowling_green",
    "South Carolina State":"south_carolina_state",
    "Alcorn State":"alcorn_state","Grambling State":"grambling_state",
    "Prairie View A&M":"prairie_view","Delaware State":"delaware_state",
    "Indiana State":"indiana_state","Illinois State":"illinois_state",
    "Western Illinois":"western_illinois","Eastern Illinois":"eastern_illinois",
    "Northern Iowa":"northern_iowa","Southern Illinois":"southern_illinois",
    "North Dakota State":"north_dakota_state","South Dakota State":"south_dakota_state",
    "Jacksonville State":"jacksonville_state",
  };

  function schoolToId(school) {
    if (!school) return "unknown";
    // Normalize Unicode: é→e, ñ→n, etc. before lookup and slug generation
    const norm = school.normalize("NFD").replace(/[̀-ͯ]/g, "");
    return SCHOOL_TO_ID[norm] || SCHOOL_TO_ID[school] ||
      norm.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .trim();
  }

  let state = { status: "idle", apiKey: null, lastUpdated: null, error: null, errorType: null, loadProgress: 0 };

  // Intervals stored so we can clear them if needed
  let _autoRefreshInterval  = null;
  let _relativeTimeInterval = null;
  let _rateLimitRetryTimer  = null;
  let _pregenRefreshInterval = null;
  let _liveScoreInterval     = null;
  let _oddsPollingInterval   = null;

  const ENDPOINT_COUNT = 32; // 28 CFBD + 1 ESPN schedule + 1 ESPN news + 1 Reddit + 1 spare

  function getKey() { return localStorage.getItem(KEY_STORE) || window.CFBD_DEFAULT_KEY || null; }
  function setKey(k) { if (k) { try { localStorage.setItem(KEY_STORE, k.trim()); } catch {} } else localStorage.removeItem(KEY_STORE); }
  function clearKey() { localStorage.removeItem(KEY_STORE); }

  // ── Per-endpoint fetch with one automatic retry after 2 s ───
  function fetchWithRetry(url, opts) {
    return fetch(url, opts).catch(() =>
      new Promise(r => setTimeout(r, 2000)).then(() => fetch(url, opts))
    );
  }

  // ── API fetch helper ────────────────────────────────────────
  async function api(endpoint, apiKey) {
    const r = await fetchWithRetry(`${CFBD}${endpoint}`, {
      headers: { "Authorization": `Bearer ${apiKey}`, "Accept": "application/json" }
    });
    if (!r.ok) {
      if (r.status === 401) {
        const err = new Error("Invalid API key — get one free at collegefootballdata.com");
        err.errorType = "invalid_key";
        throw err;
      }
      if (r.status === 429) {
        const err = new Error("Rate limited — retrying in 60 seconds");
        err.errorType = "rate_limit";
        throw err;
      }
      const err = new Error(`CFBD API error ${r.status} on ${endpoint}`);
      err.errorType = "network";
      throw err;
    }
    return r.json();
  }

  // ── Cache helpers ────────────────────────────────────────────
  // loadCache(strict=false) returns null only if no cache exists at all.
  // When strict=true it also returns null for expired caches.
  function loadCache(strict = true) {
    try {
      const raw = localStorage.getItem(CACHE_STORE);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (strict && Date.now() - c.ts > CACHE_TTL) {
        localStorage.removeItem(CACHE_STORE);
        return null;
      }
      // For non-strict loads (stale fallback) attach metadata so callers can warn
      c.data._stale = strict ? false : (Date.now() - c.ts > CACHE_TTL);
      c.data._cacheTs = c.ts;
      return c.data;
    } catch { return null; }
  }
  function saveCache(data) {
    try { localStorage.setItem(CACHE_STORE, JSON.stringify({ ts: Date.now(), data })); } catch {}
  }
  function cacheAgeMinutes() {
    try {
      const raw = localStorage.getItem(CACHE_STORE);
      if (!raw) return null;
      const c = JSON.parse(raw);
      return Math.floor((Date.now() - c.ts) / 60000);
    } catch { return null; }
  }
  function cacheTtlMinutes() {
    try {
      const raw = localStorage.getItem(CACHE_STORE);
      if (!raw) return null;
      const c = JSON.parse(raw);
      const remainMs = CACHE_TTL - (Date.now() - c.ts);
      return Math.max(0, Math.floor(remainMs / 60000));
    } catch { return null; }
  }

  // ── Relative-time formatter ──────────────────────────────────
  function relativeTime(dateOrStr) {
    if (!dateOrStr) return "just now";
    const d = typeof dateOrStr === "string" ? new Date(dateOrStr) : dateOrStr;
    const secs = Math.floor((Date.now() - d.getTime()) / 1000);
    if (secs < 10)  return "just now";
    if (secs < 60)  return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60)  return `${mins}m ago`;
    const hrs  = Math.floor(mins / 60);
    return `${hrs}h ago`;
  }

  // ── SP+ → derived team stats ─────────────────────────────────
  // Converts SP+ overall rating (range ~-30 to +35) to stat estimates.
  // National FBS averages are the baseline (28 PPG, etc.).
  function spToStats(spOverall) {
    const r = spOverall || 0;
    return {
      pointsPerGame:        Math.max(10,  +(28 + r * 0.58).toFixed(1)),
      pointsAllowedPerGame: Math.max(10,  +(28 - r * 0.58).toFixed(1)),
      yardsPerGame:         Math.max(260, +(400 + r * 5.5).toFixed(0)),
      yardsAllowedPerGame:  Math.max(260, +(400 - r * 5.5).toFixed(0)),
      passingYardsPerGame:  Math.max(130, +(230 + r * 3.2).toFixed(0)),
      rushingYardsPerGame:  Math.max(80,  +(155 + r * 2.0).toFixed(0)),
      turnoversPerGame:     Math.max(0.4, +(1.5 - r * 0.016).toFixed(2)),
      turnoversForced:      Math.max(0.4, +(1.5 + r * 0.016).toFixed(2)),
      thirdDownPct:         Math.min(0.62, Math.max(0.28, +(0.41 + r * 0.005).toFixed(3))),
      redZonePct:           Math.min(0.97, Math.max(0.68, +(0.87 + r * 0.003).toFixed(3))),
      sacks:                Math.max(0.5, +(2.2 + r * 0.04).toFixed(1)),
      sacksAllowed:         Math.max(0.5, +(2.2 - r * 0.04).toFixed(1)),
    };
  }

  // ── ESPN team IDs for the 16 curated teams ──────────────────
  const ESPN_TEAM_IDS = {
    alabama:333, auburn:2, clemson:228, florida:57, florida_state:52,
    georgia:61, lsu:99, miami:2390, michigan:130, notre_dame:87,
    ohio_state:194, oregon:2483, penn_state:213, tennessee:2633,
    texas:251, wisconsin:275,
  };

  // ── ESPN: fetch current rosters for all 16 curated teams ────
  async function fetchESPNRosters() {
    const results = {};
    await Promise.allSettled(
      Object.entries(ESPN_TEAM_IDS).map(async ([teamId, espnId]) => {
        try {
          const r = await fetch(`${ESPN_BASE}/teams/${espnId}/roster?limit=150`);
          if (!r.ok) return;
          const d = await r.json();
          const players = [];
          // ESPN returns athletes in position groups
          for (const group of (d.athletes || [])) {
            for (const athlete of (group.items || group.athletes || [])) {
              players.push({
                name:        (athlete.displayName || athlete.fullName || "").trim(),
                number:      (athlete.jersey || "").toString(),
                position:    athlete.position?.abbreviation || "",
                year:        athlete.experience?.displayValue || "",
                heightWeight: (athlete.displayHeight && athlete.displayWeight)
                  ? `${athlete.displayHeight} / ${athlete.displayWeight}` : "",
                status:      (athlete.injuries?.[0]?.status || athlete.status?.type || "active").toLowerCase(),
                injuryType:  athlete.injuries?.[0]?.longComment || athlete.injuries?.[0]?.type || null,
              });
            }
          }
          results[teamId] = players;
        } catch {}
      })
    );
    return results;
  }

  // ── ESPN: fetch injury reports for all 16 curated teams ─────
  async function fetchESPNInjuries() {
    const results = {};
    await Promise.allSettled(
      Object.entries(ESPN_TEAM_IDS).map(async ([teamId, espnId]) => {
        try {
          const r = await fetch(`${ESPN_BASE}/teams/${espnId}?enable=injuries`);
          if (!r.ok) return;
          const d = await r.json();
          const injuries = (d.team?.injuries || []).map(inj => ({
            name:       (inj.athlete?.displayName || "").trim(),
            status:     (inj.status || "questionable").toLowerCase(),
            injuryType: inj.longComment || inj.type || "",
          }));
          if (injuries.length) results[teamId] = injuries;
        } catch {}
      })
    );
    return results;
  }

  // ── ESPN: fetch recent team news for curated teams ───────────
  async function fetchESPNTeamNews() {
    const allNews = [];
    await Promise.allSettled(
      Object.entries(ESPN_TEAM_IDS).map(async ([teamId, espnId]) => {
        try {
          const r = await fetch(`${ESPN_BASE}/teams/${espnId}/news?limit=5`);
          if (!r.ok) return;
          const d = await r.json();
          for (const a of (d.articles || [])) {
            allNews.push({
              teamId,
              headline:    a.headline || "",
              description: a.description || "",
              url:         a.links?.web?.href || "",
              published:   a.published || "",
            });
          }
        } catch {}
      })
    );
    return allNews;
  }

  // ── ESPN: fetch team-specific stats for curated teams ───────
  async function fetchESPNTeamStats() {
    const results = {};
    await Promise.allSettled(
      Object.entries(ESPN_TEAM_IDS).map(async ([teamId, espnId]) => {
        try {
          const r = await fetch(`${ESPN_BASE}/teams/${espnId}/statistics`);
          if (!r.ok) return;
          const d = await r.json();
          const cats = {};
          for (const cat of (d.results?.stats?.categories || [])) {
            for (const stat of (cat.stats || [])) {
              cats[stat.abbreviation || stat.name] = stat.value;
            }
          }
          if (Object.keys(cats).length) results[teamId] = cats;
        } catch {}
      })
    );
    return results;
  }

  // ── ESPN: fetch scoreboard with live game status ─────────────
  // ── ESPN AP/CFP Rankings (public, no key) ────────────────────
  async function fetchESPNRankings() {
    try {
      const r = await fetch(`${ESPN_BASE}/rankings`, { cache: "no-cache" });
      if (!r.ok) return {};
      const d = await r.json();
      const polls = d.rankings || [];
      const apPoll = polls.find(p => p.name?.includes("AP") || p.shortName?.includes("AP")) || polls[0];
      if (!apPoll?.ranks) return {};
      const rankMap = {};
      apPoll.ranks.forEach(entry => {
        const teamName = entry.team?.displayName || entry.team?.name || "";
        const teamId   = entry.team?.slug?.replace(/-/g,"_") || "";
        const rank     = entry.current;
        if (teamName) rankMap[teamName] = rank;
        if (teamId)   rankMap[teamId]   = rank;
      });
      return rankMap;
    } catch { return {}; }
  }

  // ── ESPN all-team season records (current season) ────────────
  async function fetchESPNAllTeamRecords() {
    try {
      const r = await fetch(`${ESPN_BASE}/teams?groups=80&limit=500`, { cache: "no-cache" });
      if (!r.ok) return {};
      const d = await r.json();
      const map = {};
      (d.sports?.[0]?.leagues?.[0]?.teams || d.teams || []).forEach(entry => {
        const t = entry.team || entry;
        const id = (t.slug||"").replace(/-/g,"_") || t.abbreviation?.toLowerCase();
        const rec = t.record?.items?.[0];
        if (!id || !rec) return;
        const wins   = parseInt(rec.stats?.find(s=>s.name==="wins")?.value ?? 0);
        const losses = parseInt(rec.stats?.find(s=>s.name==="losses")?.value ?? 0);
        if (wins + losses > 0) map[id] = `${wins}-${losses}`;
      });
      return map;
    } catch { return {}; }
  }

  async function fetchESPNLiveScores() {
    try {
      const r = await fetch(`${ESPN_BASE}/scoreboard?groups=80&limit=50`);
      if (!r.ok) return [];
      const d = await r.json();
      return (d.events || []).map(e => ({
        id:       e.id,
        status:   e.status?.type?.name || "pre",
        clock:    e.status?.displayClock || "",
        period:   e.status?.period || 0,
        homeTeam: e.competitions?.[0]?.competitors?.find(c => c.homeAway === "home")?.team?.location,
        homeScore:e.competitions?.[0]?.competitors?.find(c => c.homeAway === "home")?.score,
        awayTeam: e.competitions?.[0]?.competitors?.find(c => c.homeAway === "away")?.team?.location,
        awayScore:e.competitions?.[0]?.competitors?.find(c => c.homeAway === "away")?.score,
      }));
    } catch { return []; }
  }

  // ── ESPN: fetch all FBS games for a season (no API key required) ──
  async function fetchESPNSchedule(season) {
    // Fetch all weeks (0–17 covers regular season + conf championships)
    // ESPN groups=80 = FBS; seasontype=2 = regular season
    const weeks = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
    const [regularResults, bowlResult] = await Promise.all([
      Promise.allSettled(weeks.map(w =>
        fetch(`${ESPN_BASE}/scoreboard?groups=80&limit=100&seasontype=2&week=${w}&dates=${season}`)
          .then(r => r.ok ? r.json() : null).catch(() => null)
      )),
      // Also grab bowl/postseason games (seasontype=3)
      fetch(`${ESPN_BASE}/scoreboard?groups=80&limit=200&seasontype=3&dates=${season}`)
        .then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    const events = [];
    regularResults.forEach(r => {
      if (r.status === "fulfilled" && r.value?.events) events.push(...r.value.events);
    });
    if (bowlResult?.events) events.push(...bowlResult.events);

    // Deduplicate by ESPN event ID
    const seen = new Set();
    return events.filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true; });
  }

  // ── Twitter/X insider intel via Cloudflare Worker proxy ─────
  async function fetchTwitterIntel() {
    const proxyUrl = window.TWITTER_PROXY_URL;
    if (!proxyUrl) return [];
    try {
      const endpoints = ["cfb_news", "cfb_injuries", "cfb_portal", "cfb_coaching", "cfb_insider"];
      const results = await Promise.allSettled(
        endpoints.map(ep =>
          fetch(`${proxyUrl}?endpoint=${ep}`, { cache: "no-cache" })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );
      const tweets = [];
      results.forEach(r => {
        if (r.status === "fulfilled" && r.value?.tweets) tweets.push(...r.value.tweets);
      });
      const seen = new Set();
      return tweets
        .filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch { return []; }
  }

  // ── ESPN News: returns recent CFB articles ───────────────────
  async function fetchESPNNews() {
    try {
      const r = await fetch(`${ESPN_BASE}/news?limit=50`);
      if (!r.ok) return [];
      const d = await r.json();
      return (d.articles || []).map(a => ({
        headline:    a.headline    || "",
        description: a.description || "",
        url:         a.links?.web?.href || "",
        published:   a.published   || "",
        teams: (a.categories || [])
          .filter(c => c.team?.displayName)
          .map(c => c.team.displayName),
      }));
    } catch { return []; }
  }

  // ── Reddit r/CFB: public JSON, no key needed ─────────────────
  async function fetchRedditCFB() {
    try {
      // Fetch both "new" and "hot" in parallel for broader coverage
      const [newRes, hotRes] = await Promise.all([
        fetch("https://www.reddit.com/r/CFB/new.json?limit=100", {
          headers: { "Accept": "application/json" }
        }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("https://www.reddit.com/r/CFB/hot.json?limit=50", {
          headers: { "Accept": "application/json" }
        }).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      const posts = [];
      const seen = new Set();
      for (const res of [newRes, hotRes]) {
        if (!res?.data?.children) continue;
        for (const c of res.data.children) {
          const p = c.data;
          if (!p?.title || seen.has(p.id)) continue;
          seen.add(p.id);
          posts.push({
            id:          p.id,
            title:       p.title,
            score:       p.score       || 0,
            upvoteRatio: p.upvote_ratio || 0.5,
            comments:    p.num_comments || 0,
            url:         "https://reddit.com" + (p.permalink || ""),
            created:     p.created_utc  || 0,
            flair:       p.link_flair_text || "",
          });
        }
      }
      return posts;
    } catch { return []; }
  }

  // ── ESPN event → CFBD-compatible game object ─────────────────
  function mapESPNGame(event) {
    const comp = event.competitions?.[0];
    if (!comp) return null;
    const home = comp.competitors?.find(c => c.homeAway === "home");
    const away = comp.competitors?.find(c => c.homeAway === "away");
    if (!home?.team || !away?.team) return null;

    const weekNum = event.week?.number || 1;
    const rawDate = event.date || comp.date || "";
    const dateStr = rawDate.slice(0, 10);

    let time = "TBD";
    try {
      if (rawDate) {
        time = new Date(rawDate).toLocaleTimeString("en-US", {
          hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
        }) + " ET";
      }
    } catch {}

    const broadcasts = comp.broadcasts || [];
    const network = broadcasts[0]?.names?.join("/") || "TBD";

    // Use team location (school name) for ID mapping — strips nickname
    // Normalize accented chars (e.g. "San José State" → "San Jose State") so names
    // match CFBD which uses unaccented ASCII throughout.
    const _norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
    const homeSchool = _norm(home.team.location || home.team.displayName || "");
    const awaySchool = _norm(away.team.location || away.team.displayName || "");

    // Store ESPN colors so applyData can patch the team entry
    const homeColor = home.team.color ? "#" + home.team.color.replace(/^#/, "") : null;
    const awayColor = away.team.color ? "#" + away.team.color.replace(/^#/, "") : null;

    return {
      id:               parseInt(event.id) || 0,
      home_team:        homeSchool,
      away_team:        awaySchool,
      start_date:       dateStr ? dateStr + "T12:00:00.000Z" : null,
      start_time_tbd:   !rawDate,
      week:             weekNum,
      venue:            comp.venue?.fullName || "",
      neutral_site:     comp.neutralSite || false,
      conference_game:  comp.conferenceCompetition || false,
      notes:            network,
      _espnId:          event.id,
      _homeColor:       homeColor,
      _awayColor:       awayColor,
      _source:          "espn",
    };
  }

  // ── Main fetch ───────────────────────────────────────────────
  async function fetchAll(apiKey, force = false) {
    state = { ...state, status: "loading", error: null, errorType: null, loadProgress: 0 };
    updateBadge();

    // Serve from cache if fresh
    if (!force) {
      const cached = loadCache(true);
      if (cached) {
        applyData(cached);
        state = { ...state, status: "live", lastUpdated: cached.fetchedAt };
        window.__liveLastUpdated = new Date(cached.fetchedAt);
        _setLiveStats();
        updateBadge();
        _startRelativeTimeInterval();
        window.__liveDataReady = true;
        window.dispatchEvent(new CustomEvent("liveDataReady", { detail: cached }));
        _startAutoRefresh(apiKey);
        return;
      }
    }

    // Count resolved endpoints for progress display
    let resolved = 0;
    function onEndpointDone() {
      resolved++;
      state = { ...state, loadProgress: resolved };
      updateBadge();
    }

    try {
      updateModalStatus();

      // Launch all no-key sources immediately in parallel with CFBD
      const espnPromise          = fetchESPNSchedule(SEASON).catch(() => []);
      const espnNewsPromise      = fetchESPNNews().catch(() => []);
      const espnRankingsPromise  = fetchESPNRankings().catch(() => ({}));
      const espnAllTeamsPromise  = fetchESPNAllTeamRecords().catch(() => ({}));
      const redditPromise        = fetchRedditCFB().catch(() => []);
      const twitterPromise       = fetchTwitterIntel().catch(() => []);
      // ESPN team-specific sources (rosters, injuries, team news, stats, live scores)
      const espnRostersPromise   = fetchESPNRosters().catch(() => ({}));
      const espnInjuriesPromise  = fetchESPNInjuries().catch(() => ({}));
      const espnTeamNewsPromise  = fetchESPNTeamNews().catch(() => []);
      const espnTeamStatsPromise = fetchESPNTeamStats().catch(() => ({}));
      const espnLivePromise      = fetchESPNLiveScores().catch(() => []);

      // All CFBD endpoints in one parallel batch — any failure is silently skipped
      const cfbdDefs = [
        // Core team + schedule data
        ["/teams/fbs",                                                       "teams"],
        [`/games?year=${SEASON}&seasonType=regular&classification=fbs`,      "reg26"],
        [`/games?year=${SEASON}&seasonType=postseason&classification=fbs`,   "post26"],
        // SP+ ratings — 2026 preferred, 2025 fallback
        [`/ratings/sp?year=${SEASON}`,                                       "sp26"],
        ["/ratings/sp?year=2025",                                            "sp25"],
        // Talent, coaches, recruiting (3 years for trend)
        [`/talent?year=${SEASON}`,                                           "talent"],
        [`/coaches?year=${SEASON}`,                                          "coaches"],
        [`/recruiting/teams?year=${SEASON}`,                                 "rec26"],
        ["/recruiting/teams?year=2025",                                      "rec25"],
        ["/recruiting/teams?year=2024",                                      "rec24"],
        // Betting lines (current + 2025 for ATS calc)
        [`/lines?year=${SEASON}`,                                            "lines26"],
        ["/lines?year=2025",                                                 "lines25"],
        // Real 2025 season data for team calibration
        ["/records?year=2025&classification=fbs",                            "records25"],
        ["/stats/season?year=2025&classification=fbs",                       "stats25"],
        ["/stats/season/advanced?year=2025&classification=fbs",              "advStats25"],
        ["/ratings/elo?year=2025",                                           "elo25"],
        // 2025 actual game results (for ATS record calculation)
        ["/games?year=2025&seasonType=regular&classification=fbs",           "games25reg"],
        ["/games?year=2025&seasonType=postseason&classification=fbs",        "games25post"],
        // 2026 program data
        [`/portal?year=${SEASON}`,                                           "portal"],
        [`/returning?year=${SEASON}`,                                        "returning"],
        // NFL Draft pipeline — 2 years shows talent production trend
        ["/draft/picks?year=2025",                                           "draft25"],
        ["/draft/picks?year=2026",                                           "draft26"],
        // AP/CFP weekly rankings for vsRanked computation
        ["/rankings?year=2025&seasonType=regular",                           "rankings25"],
        // Conference standings
        ["/standings?year=2025",                                             "standings25"],
        // Player stats — builds KEY_PLAYERS entries for all 130+ FBS teams
        ["/stats/player/season?year=2025&classification=fbs&category=passing",   "playersPassing"],
        ["/stats/player/season?year=2025&classification=fbs&category=rushing",   "playersRushing"],
        ["/stats/player/season?year=2025&classification=fbs&category=receiving", "playersReceiving"],
        ["/stats/player/season?year=2025&classification=fbs&category=defensive", "playersDefensive"],
      ];

      const cfbdResults = await Promise.allSettled(
        cfbdDefs.map(([ep]) => api(ep, apiKey).then(v => { onEndpointDone(); return v; }))
      );

      // Map results → named object; failures default to []
      const cfbd = {};
      cfbdDefs.forEach(([, name], i) => {
        cfbd[name] = cfbdResults[i].status === "fulfilled" ? (cfbdResults[i].value || []) : [];
      });

      // SP+: prefer 2026 data, fall back to 2025
      const spMerged = cfbd.sp26.length > 0 ? cfbd.sp26 : cfbd.sp25;

      // 2026 schedule (CFBD)
      const games2026 = [...cfbd.reg26, ...cfbd.post26];

      // ESPN schedule + news + Reddit + rosters/injuries/team data (all ran in parallel)
      const espnEvents     = await espnPromise;
      const espnNews        = await espnNewsPromise;
      const espnRankings    = await espnRankingsPromise;
      const espnAllRecords  = await espnAllTeamsPromise;
      const redditPosts     = await redditPromise;
      const espnRosters     = await espnRostersPromise;
      const espnInjuries    = await espnInjuriesPromise;
      const espnTeamNews    = await espnTeamNewsPromise;
      const espnTeamStats   = await espnTeamStatsPromise;
      const espnLiveScores  = await espnLivePromise;
      const twitterTweets   = await twitterPromise;
      onEndpointDone();

      // Apply ESPN rankings to all TEAMS immediately (no CFBD key needed)
      if (Object.keys(espnRankings).length && window.TEAMS) {
        const fullPoll = Object.keys(espnRankings).length >= 25;
        Object.values(TEAMS).forEach(t => {
          const rank = espnRankings[t.name] || espnRankings[t.id] || espnRankings[t.abbreviation];
          if (rank) {
            t.apRank = rank;
          } else if (fullPoll && t.apRank) {
            // Full poll loaded and team is absent — definitively unranked, clear stale rank
            t.apRank = null;
          }
        });
      }
      // Apply current season records to all TEAMS immediately
      if (Object.keys(espnAllRecords).length && window.TEAMS) {
        Object.values(TEAMS).forEach(t => {
          const rec = espnAllRecords[t.id] || espnAllRecords[(t.abbreviation||"").toLowerCase()];
          if (rec) {
            t.currentRecord = rec;
            const m = rec.match(/^(\d+)-(\d+)/);
            if (m) { t.wins = +m[1]; t.losses = +m[2]; }
          }
        });
      }

      const espnGames = espnEvents.map(e => mapESPNGame(e)).filter(Boolean);
      const rosterCount = Object.values(espnRosters).reduce((s,r)=>s+r.length,0);
      console.log(`[LIVE] ESPN: ${espnGames.length} games | CFBD 2026: ${games2026.length} | Reddit: ${redditPosts.length} posts | Rosters: ${rosterCount} players | AP Rankings: ${Object.keys(espnRankings).length} teams`);

      // Choose primary schedule source: ESPN if full, CFBD if full, else merge with 2025 data
      let gamesFromApi;
      if (espnGames.length >= 200) {
        gamesFromApi = espnGames;
      } else if (games2026.length >= 200) {
        gamesFromApi = games2026;
      } else {
        // 2026 schedule not fully released — use already-fetched 2025 data
        const games2025 = [...cfbd.games25reg, ...cfbd.games25post];
        gamesFromApi = [...espnGames, ...games2026, ...games2025];
        console.log(`[LIVE] Thin 2026 — merged with 2025: ${gamesFromApi.length} total`);
      }

      const payload = {
        fbsTeams:    cfbd.teams,
        games:       gamesFromApi,
        spRatings:   spMerged,
        talent:      cfbd.talent,
        coaches:     cfbd.coaches,
        recruiting:  cfbd.rec26,
        rec25:       cfbd.rec25,
        rec24:       cfbd.rec24,
        lines:       cfbd.lines26,
        lines25:     cfbd.lines25,
        records25:   cfbd.records25,
        stats25:     cfbd.stats25,
        advStats:    cfbd.advStats25,
        eloRatings:  cfbd.elo25,
        games25:     [...cfbd.games25reg, ...cfbd.games25post],
        portal:      cfbd.portal,
        returning:   cfbd.returning,
        draft25:     cfbd.draft25,
        draft26:     cfbd.draft26,
        rankings25:   cfbd.rankings25,
        standings25:  cfbd.standings25,
        playersPassing:   cfbd.playersPassing,
        playersRushing:   cfbd.playersRushing,
        playersReceiving: cfbd.playersReceiving,
        playersDefensive: cfbd.playersDefensive,
        espnNews,
        espnTeamNews,
        espnRosters,
        espnInjuries,
        espnTeamStats,
        espnLiveScores,
        redditPosts,
        twitterTweets,
        fetchedAt:   new Date().toISOString(),
      };

      console.log(`[LIVE] Fetched: ${payload.fbsTeams.length} teams, ${payload.games.length} games, ` +
                  `SP+:${payload.spRatings.length} ELO:${payload.eloRatings.length} ` +
                  `AdvStats:${payload.advStats.length} Records:${payload.records25.length} ` +
                  `Portal:${payload.portal.length} Returning:${payload.returning.length} ` +
                  `Draft:${payload.draft25.length + payload.draft26.length} ` +
                  `Players: P:${(payload.playersPassing||[]).length} R:${(payload.playersRushing||[]).length} ` +
                  `Rec:${(payload.playersReceiving||[]).length} D:${(payload.playersDefensive||[]).length} ` +
                  `News:${espnNews.length} Reddit:${redditPosts.length}`);

      saveCache(payload);
      applyData(payload);
      buildTeamIntel(payload);
      state = { ...state, status: "live", lastUpdated: payload.fetchedAt, apiKey };
      window.__liveLastUpdated = new Date(payload.fetchedAt);
      _setLiveStats();
      updateBadge();
      updateModalStatus();
      _startRelativeTimeInterval();
      _startAutoRefresh(apiKey);
      window.__liveDataReady = true;
      window.dispatchEvent(new CustomEvent("liveDataReady", { detail: payload }));

    } catch (err) {
      const errType = err.errorType || "network";

      // Rate-limit: wait 60 s then auto-retry
      if (errType === "rate_limit") {
        state = { ...state, status: "error", error: "Rate limited — retrying in 60s", errorType: "rate_limit" };
        updateBadge();
        updateModalStatus();
        if (_rateLimitRetryTimer) clearTimeout(_rateLimitRetryTimer);
        _rateLimitRetryTimer = setTimeout(() => {
          const key = apiKey || getKey();
          if (key) fetchAll(key, true);
        }, 60 * 1000);
        return;
      }

      // For any other network failure, try stale cache as graceful fallback
      if (errType !== "invalid_key") {
        const stale = loadCache(false);
        if (stale) {  // use any cache (stale or not) when all API calls fail
          applyData(stale);
          const cacheDate = stale._cacheTs ? new Date(stale._cacheTs).toLocaleDateString() : "earlier";
          state = { ...state, status: "stale", lastUpdated: stale.fetchedAt,
                    error: `Using cached data from ${cacheDate}`, errorType: "stale" };
          window.__liveLastUpdated = stale._cacheTs ? new Date(stale._cacheTs) : null;
          _setLiveStats();
          updateBadge();
          updateModalStatus();
          window.__liveDataReady = true;
          window.dispatchEvent(new CustomEvent("liveDataReady", { detail: stale }));
          return;
        }
      }

      state = { ...state, status: "error", error: err.message, errorType: errType };
      updateBadge();
      updateModalStatus();
      throw err;
    }
  }

  // ── Set global stats object ──────────────────────────────────
  function _setLiveStats() {
    window.__liveStats = {
      gameCount:   window.GAMES ? GAMES.length : 0,
      teamCount:   window.TEAMS ? Object.keys(TEAMS).length : 0,
      lastUpdated: window.__liveLastUpdated || new Date(),
      apiConnected: state.status === "live",
    };
  }

  // ── Auto-refresh every 5 minutes ────────────────────────────
  function _startAutoRefresh(apiKey) {
    if (_autoRefreshInterval) return; // already running
    _autoRefreshInterval = setInterval(() => {
      const key = apiKey || getKey();
      if (!key) return;
      state = { ...state, status: "refreshing" };
      updateBadge();
      localStorage.removeItem(CACHE_STORE);
      fetchAll(key, true).catch(e => console.warn("[LIVE] Auto-refresh failed:", e.message));
    }, 5 * 60 * 1000);

    // Real-time supplements — run regardless of API key
    _startPregenRefresh();    // pick up GitHub Actions commits automatically
    _startLiveScorePolling(); // 60-second ESPN score updates when games are live
    _startOddsPolling();      // live line movements if ODDS API key is saved
  }

  // ── Update relative-time badge text every 30 s ───────────────
  function _startRelativeTimeInterval() {
    if (_relativeTimeInterval) return;
    _relativeTimeInterval = setInterval(() => {
      if (state.status === "live" || state.status === "stale") updateBadge();
    }, 30 * 1000);
  }

  // ── Re-fetch data/games-2026.json every 10 min (picks up GitHub Actions commits) ──
  function _startPregenRefresh() {
    if (_pregenRefreshInterval) return;
    _pregenRefreshInterval = setInterval(() => {
      const base = window.location.pathname.includes("/pages/") ? "../" : "./";
      fetch(base + `data/games-${SEASON}.json`, { cache: "no-cache" })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d || !Array.isArray(d.games) || d.games.length < 1) return;
          if (d.generated === "2026-01-01T00:00:00.000Z") return;
          const ageH = (Date.now() - new Date(d.generated).getTime()) / 3600000;
          if (ageH > 12) return;
          if (!window.GAMES) return;
          // Skip if we already have this version
          if (window.__pregenGeneratedAt && d.generated <= window.__pregenGeneratedAt) return;
          window.__pregenGeneratedAt = d.generated;

          const idxById  = new Map(GAMES.map((g, i) => [g.id, i]));
          const idxByKey = new Map(GAMES.map((g, i) => [g.week + "|" + g.homeTeamId + "|" + g.awayTeamId, i]));
          let updated = 0, added = 0;
          d.games.forEach(g => {
            if (idxById.has(g.id)) {
              const i = idxById.get(g.id);
              if (g.bettingLines && JSON.stringify(g.bettingLines) !== JSON.stringify(GAMES[i].bettingLines)) {
                GAMES[i].bettingLines = g.bettingLines; updated++;
              }
              if (g.homeScore != null) { GAMES[i].homeScore = g.homeScore; GAMES[i].awayScore = g.awayScore; updated++; }
              return;
            }
            const mk = g.week + "|" + g.homeTeamId + "|" + g.awayTeamId;
            if (idxByKey.has(mk)) {
              const i = idxByKey.get(mk);
              if (g.bettingLines && !GAMES[i].bettingLines) { GAMES[i].bettingLines = g.bettingLines; updated++; }
              return;
            }
            GAMES.push(g); added++;
          });
          if (d.apRanks && window.TEAMS) {
            const fullPoll = Object.keys(d.apRanks).length >= 25;
            Object.keys(d.apRanks).forEach(id => { if (TEAMS[id]) TEAMS[id].apRank = d.apRanks[id]; });
            if (fullPoll) {
              Object.values(TEAMS).forEach(t => {
                if (t.id && d.apRanks[t.id] == null && t.apRank) t.apRank = null;
              });
            }
          }
          if (updated > 0 || added > 0) {
            console.log(`[PREGEN REFRESH] +${added} games, ${updated} updated — from Actions commit ${new Date(d.generated).toLocaleTimeString()}`);
            window.dispatchEvent(new CustomEvent("liveDataReady", { detail: { _fromPregen: true, fetchedAt: d.generated } }));
          }
        })
        .catch(() => {});
    }, 10 * 60 * 1000); // every 10 minutes
  }

  // ── Poll ESPN live scores every 60 s when games are in progress ──
  function _startLiveScorePolling() {
    if (_liveScoreInterval) return;
    let consecutiveEmpty = 0;

    async function pollOnce() {
      try {
        const r = await fetch(`${ESPN_BASE}/scoreboard?groups=80&limit=50`, { cache: "no-cache" });
        if (!r.ok) return;
        const d = await r.json();
        const scores = (d.events || []).map(e => {
          const comps = e.competitions?.[0];
          const home  = comps?.competitors?.find(c => c.homeAway === "home");
          const away  = comps?.competitors?.find(c => c.homeAway === "away");
          return {
            id:        e.id,
            status:    e.status?.type?.name || "pre",
            clock:     e.status?.displayClock || "",
            period:    e.status?.period || 0,
            homeTeam:  home?.team?.location || "",
            homeScore: home?.score || "0",
            awayTeam:  away?.team?.location || "",
            awayScore: away?.score || "0",
          };
        });
        const live = scores.filter(s => s.status === "STATUS_IN_PROGRESS");
        if (!live.length) {
          consecutiveEmpty++;
          // After 10 consecutive empty polls (~10 min), stop polling to save quota
          if (consecutiveEmpty >= 10) {
            clearInterval(_liveScoreInterval);
            _liveScoreInterval = null;
            console.log("[LIVE SCORES] No active games — paused polling");
          }
          return;
        }
        consecutiveEmpty = 0;
        window.__espnLiveScores = scores;
        window.dispatchEvent(new CustomEvent("liveScoreUpdate", { detail: { scores, liveCount: live.length } }));
        console.log(`[LIVE SCORES] ${live.length} game(s) in progress`);
      } catch {}
    }

    _liveScoreInterval = setInterval(pollOnce, 60 * 1000);
    pollOnce(); // check immediately
  }

  // ── Poll The Odds API for live line movements (requires user key in localStorage) ──
  function _startOddsPolling() {
    const ODDS_KEY_STORE = "theBet_oddsApiKey";
    const oddsKey = localStorage.getItem(ODDS_KEY_STORE);
    if (!oddsKey || _oddsPollingInterval) return;

    async function pollOdds() {
      try {
        const url = `https://api.the-odds-api.com/v4/sports/americanfootball_ncaaf/odds/?apiKey=${oddsKey}&regions=us&markets=spreads,totals&oddsFormat=american`;
        const r = await fetch(url, { cache: "no-cache" });
        if (r.status === 401 || r.status === 403) {
          clearInterval(_oddsPollingInterval); _oddsPollingInterval = null; return;
        }
        if (!r.ok) return;
        const events = await r.json();
        if (!Array.isArray(events)) return;

        const linesMap = {};
        events.forEach(ev => {
          const books = ev.bookmakers || [];
          const primary = books.find(b => b.key === "draftkings") || books.find(b => b.key === "fanduel") || books[0];
          if (!primary) return;
          const spreads = primary.markets?.find(m => m.key === "spreads")?.outcomes || [];
          const totals  = primary.markets?.find(m => m.key === "totals")?.outcomes  || [];
          const homeSpread = spreads.find(o => o.name === ev.home_team)?.point;
          const total      = totals.find(o => o.name === "Over")?.point;
          const mk = [ev.home_team, ev.away_team].sort().join("|");
          linesMap[mk] = { homeSpread, total, homeTeam: ev.home_team, awayTeam: ev.away_team };
        });

        if (Object.keys(linesMap).length) {
          window.__liveOddsLines = linesMap;
          window.dispatchEvent(new CustomEvent("liveOddsUpdate", { detail: { linesMap, count: Object.keys(linesMap).length } }));
          console.log(`[ODDS API] ${Object.keys(linesMap).length} live lines updated`);
        }
      } catch {}
    }

    _oddsPollingInterval = setInterval(pollOdds, 5 * 60 * 1000);
    pollOdds();
  }

  // ── Rating helpers using real data ──────────────────────────
  function ppaToOffRating(ppa) {
    // PPA (Predicted Points Added per play): +0.3 = elite, 0 = avg, -0.3 = poor
    if (ppa === null || ppa === undefined) return null;
    return Math.min(99, Math.max(40, Math.round(72 + ppa * 95)));
  }
  function ppaToDefRating(ppa) {
    // Defense PPA: negative = fewer points allowed = better defense
    if (ppa === null || ppa === undefined) return null;
    return Math.min(99, Math.max(40, Math.round(72 - ppa * 95)));
  }
  function eloToRating(elo) {
    // CFBD Elo typically ranges 1200 (weak G5) → 2000 (national champ level)
    if (!elo) return null;
    return Math.min(99, Math.max(40, Math.round((elo - 1200) / 800 * 55 + 44)));
  }

  // ── Apply fetched data to TEAMS + GAMES ─────────────────────
  function buildTeamIntel(data) {
    const intel = {};
    const teams = window.TEAMS ? Object.values(window.TEAMS) : [];

    // Index ESPN injuries by team
    Object.entries(data.espnInjuries || {}).forEach(([teamId, players]) => {
      if (!intel[teamId]) intel[teamId] = { injuries: [], tweets: [], insiderAlerts: [] };
      intel[teamId].injuries = players;
      intel[teamId].outCount = players.filter(p => /\bout\b/i.test(p.status || "")).length;
      intel[teamId].qCount   = players.filter(p => /questionable|doubtful/i.test(p.status || "")).length;
    });

    // Match tweets to teams by name / abbreviation / mascot
    (data.twitterTweets || []).forEach(tweet => {
      const text = (tweet.text || "").toLowerCase();
      const isInsider = /arrest|suspend|dismiss|violation|fight|bar|party|dui|incident|spotted|altercation/i.test(tweet.text || "");
      teams.forEach(team => {
        const tName   = (team.name        || "").toLowerCase();
        const tAbbr   = (team.abbreviation|| "").toLowerCase();
        const tMascot = (team.mascot       || "").toLowerCase();
        if (
          (tName.length   >= 4 && text.includes(tName))   ||
          (tAbbr.length   >= 3 && text.includes(tAbbr))   ||
          (tMascot.length >= 5 && text.includes(tMascot))
        ) {
          if (!intel[team.id]) intel[team.id] = { injuries: [], tweets: [], insiderAlerts: [] };
          intel[team.id].tweets.push(tweet);
          if (isInsider) intel[team.id].insiderAlerts.push(tweet);
        }
      });
    });

    window.TEAM_INTEL = intel;

    // Flat sorted list of all insider alerts for home page banner
    const allAlerts = [];
    Object.entries(intel).forEach(([teamId, d]) => {
      const team = window.TEAMS && window.TEAMS[teamId];
      (d.insiderAlerts || []).forEach(tw => {
        allAlerts.push({ teamId, teamName: team ? team.name : teamId, tweet: tw });
      });
    });
    allAlerts.sort((a, b) => new Date(b.tweet.created_at) - new Date(a.tweet.created_at));
    window.INSIDER_ALERTS = allAlerts;

    window.dispatchEvent(new CustomEvent("teamIntelReady", { detail: intel }));
  }

  function applyData(data) {

    // ── Build all lookup maps ────────────────────────────────
    const spMap = {};
    (data.spRatings || []).forEach(r => { if (r.team) spMap[r.team] = r; });
    // If CFBD SP+ is unavailable, use team-extras.json cache loaded at startup
    if (!Object.keys(spMap).length && window.__spRatings) {
      (window.__spRatings || []).forEach(r => { if (r.team) spMap[r.team] = r; });
      if (Object.keys(spMap).length) console.log("[LIVE] SP+ fallback: using cached team-extras.json (" + Object.keys(spMap).length + " teams)");
    }

    const talentMap = {};
    (data.talent || []).forEach(t => { if (t.school) talentMap[t.school] = t.talent; });

    // Coach name + career record
    const coachMap = {};
    const coachRecordMap = {};
    (data.coaches || []).forEach(c => {
      if (!Array.isArray(c.schools) || !c.schools.length) return;
      const cur = c.schools.find(s => s.year === SEASON) ||
                  c.schools.sort((a, b) => b.year - a.year)[0];
      if (!cur?.school) return;
      const name = `${c.firstName} ${c.lastName}`;
      coachMap[cur.school] = name;
      // Sum all seasons for career W/L record
      const totalW = c.schools.reduce((s, sc) => s + (sc.wins  || 0), 0);
      const totalL = c.schools.reduce((s, sc) => s + (sc.losses|| 0), 0);
      if (totalW + totalL > 0) coachRecordMap[cur.school] = `${totalW}-${totalL}`;
    });
    // If CFBD coaches API returned nothing, use cached team-extras.json coachMap
    if (!Object.keys(coachMap).length && window.__coachMap) {
      Object.entries(window.__coachMap).forEach(([k, v]) => {
        if (v?.name) { coachMap[k] = v.name; if (v.record) coachRecordMap[k] = v.record; }
      });
      if (Object.keys(coachMap).length) console.log("[LIVE] Coach fallback: using cached team-extras.json (" + Object.keys(coachMap).length + " entries)");
    }

    const recruitMap = {};
    (data.recruiting  || []).forEach(r => { if (r.team) recruitMap[r.team]  = r.rank; });
    const recruit25Map = {};
    (data.rec25 || []).forEach(r => { if (r.team) recruit25Map[r.team] = r.rank; });
    const recruit24Map = {};
    (data.rec24 || []).forEach(r => { if (r.team) recruit24Map[r.team] = r.rank; });

    // 2025 actual win/loss records
    const recordsMap = {};
    (data.records25 || []).forEach(r => { if (r.team) recordsMap[r.team] = r; });

    // 2025 raw season stats — CFBD may return { statName, statValue } rows OR nested objects
    const rawStatsMap = {};
    (data.stats25 || []).forEach(row => {
      if (!row.team) return;
      if (!rawStatsMap[row.team]) rawStatsMap[row.team] = {};
      if (row.statName !== undefined) {
        rawStatsMap[row.team][row.statName] = row.statValue;
        if (row.games) rawStatsMap[row.team]._games = row.games;
      } else {
        Object.assign(rawStatsMap[row.team], row);
      }
    });

    // 2025 advanced stats → PPA per team
    const advStatsMap = {};
    (data.advStats || []).forEach(s => { if (s.team) advStatsMap[s.team] = s; });

    // Elo → keep most recent week per team
    const eloMap = {};
    (data.eloRatings || []).forEach(e => {
      if (!e.team) return;
      if (!eloMap[e.team] || (e.week || 0) > (eloMap[e.team].week || 0)) eloMap[e.team] = e;
    });

    // Returning production 2026
    const returningMap = {};
    (data.returning || []).forEach(r => { if (r.team) returningMap[r.team] = r; });

    // NFL Draft picks (2025 + 2026) by school
    const draftMap = {};
    [...(data.draft25 || []), ...(data.draft26 || [])].forEach(p => {
      if (!p.college) return;
      if (!draftMap[p.college]) draftMap[p.college] = { total: 0, firstRound: 0, rounds: [] };
      draftMap[p.college].total++;
      draftMap[p.college].rounds.push(p.round || 7);
      if ((p.round || 7) <= 1) draftMap[p.college].firstRound++;
    });

    // Transfer portal → in/out per school name
    const portalIn  = {};
    const portalOut = {};
    (data.portal || []).forEach(p => {
      if (p.destination) { if (!portalIn[p.destination])  portalIn[p.destination]  = []; portalIn[p.destination].push(p);  }
      if (p.origin)      { if (!portalOut[p.origin])      portalOut[p.origin]      = []; portalOut[p.origin].push(p);      }
    });
    window.__portalIn  = portalIn;
    window.__portalOut = portalOut;

    // 2025 betting lines → spread + total by game ID
    const lines25Map = {};
    const totals25Map = {};
    (data.lines25 || []).forEach(g => {
      if (!g.lines?.length) return;
      const best = g.lines.find(l => l.provider === "consensus") || g.lines[0];
      const spread = parseFloat(best?.spread);
      if (!isNaN(spread)) lines25Map[g.id] = spread;
      const total = parseFloat(best?.overUnder);
      if (!isNaN(total)) totals25Map[g.id] = total;
    });

    // Conference standings map
    const standingsMap = {};
    (data.standings25 || []).forEach(s => { if (s.team) standingsMap[s.team] = s; });

    // Weekly AP rankings → which teams were ranked each week (for vsRanked calc)
    const rankedByWeek = {}; // week → Set of teamIds
    (data.rankings25 || []).forEach(wkEntry => {
      const week = wkEntry.week;
      const ap = (wkEntry.polls || []).find(p => p.poll === "AP Top 25");
      if (!ap) return;
      if (!rankedByWeek[week]) rankedByWeek[week] = new Set();
      (ap.ranks || []).forEach(r => {
        if (r.school) rankedByWeek[week].add(schoolToId(r.school));
      });
    });

    // Build per-team 2025 game history (for situational records)
    const teamGameHistory = {}; // teamId → [{week,isHome,isNight,isConf,isNeutral,won,margin,myPoints,oppPoints,gameId,opponentId,spread,total}]
    (data.games25 || []).forEach(g => {
      if (g.home_points == null || g.away_points == null) return;
      const homeId = schoolToId(g.home_team);
      const awayId = schoolToId(g.away_team);
      const isNight = (() => {
        if (!g.start_date) return false;
        try { const h = new Date(g.start_date).getUTCHours(); return h >= 22 || h < 6; } catch { return false; }
      })();
      const base = {
        week: g.week || 0, gameId: g.id, isNight, isConf: g.conference_game || false,
        isNeutral: g.neutral_site || false, spread: lines25Map[g.id] ?? null, total: totals25Map[g.id] ?? null,
      };
      const homeG = { ...base, isHome: true,  opponentId: awayId, myPoints: g.home_points, oppPoints: g.away_points, won: g.home_points > g.away_points, margin: g.home_points - g.away_points };
      const awayG = { ...base, isHome: false, opponentId: homeId, myPoints: g.away_points, oppPoints: g.home_points, won: g.away_points > g.home_points, margin: g.away_points - g.home_points };
      if (!teamGameHistory[homeId]) teamGameHistory[homeId] = [];
      if (!teamGameHistory[awayId]) teamGameHistory[awayId] = [];
      teamGameHistory[homeId].push(homeG);
      teamGameHistory[awayId].push(awayG);
    });
    Object.keys(teamGameHistory).forEach(id => teamGameHistory[id].sort((a, b) => a.week - b.week));

    // Per-game ATS result helper
    function gameATS(g) {
      if (g.spread === null) return null;
      const homeMargin = g.isHome ? g.margin : -g.margin;
      const adj = homeMargin + g.spread;
      if (Math.abs(adj) <= 0.5) return "push";
      return (g.isHome ? adj > 0 : adj < 0) ? "win" : "loss";
    }

    // Compute comprehensive situational records per team from game history
    const situationalRecords = {};
    const atsMap = {}; // teamId → aggregate { wins, losses, pushes, pct, homeW, homeL, awayW, awayL }

    Object.entries(teamGameHistory).forEach(([teamId, games]) => {
      function nr() { return { wins: 0, losses: 0, pushes: 0 }; }
      const s = {
        atsFavorite: nr(), atsUnderdog: nr(), nightGame: nr(),
        afterLoss: nr(), afterBigWin: nr(), vsRanked: nr(),
        confGame: nr(), road: nr(), closeGame: nr(), ouOver: nr(),
      };
      const agg = { wins: 0, losses: 0, pushes: 0, homeW: 0, homeL: 0, awayW: 0, awayL: 0 };

      function addATS(cat, ats) {
        if (!ats) return;
        if (ats === "push") s[cat].pushes++;
        else if (ats === "win") s[cat].wins++;
        else s[cat].losses++;
      }

      games.forEach((g, i) => {
        const ats = gameATS(g);

        // Aggregate ATS
        if (ats) {
          if (ats === "win") { agg.wins++; if (g.isHome) agg.homeW++; else agg.awayW++; }
          else if (ats === "loss") { agg.losses++; if (g.isHome) agg.homeL++; else agg.awayL++; }
          else agg.pushes++;
        }

        // Favourite / underdog (negative spread = home favoured)
        if (g.spread !== null) {
          const isFav = g.isHome ? g.spread <= 0 : g.spread >= 0;
          addATS(isFav ? "atsFavorite" : "atsUnderdog", ats);
        }

        if (g.isNight) addATS("nightGame", ats);

        if (i > 0) {
          const prev = games[i - 1];
          if (g.week - prev.week <= 2) {
            if (!prev.won)                         addATS("afterLoss",   ats);
            if (prev.won && prev.margin >= 21)     addATS("afterBigWin", ats);
          }
        }

        if (rankedByWeek[g.week]?.has(g.opponentId)) addATS("vsRanked", ats);
        if (g.isConf) addATS("confGame", ats);
        if (!g.isHome && !g.isNeutral) addATS("road", ats);

        // Close game (straight-up margin ≤7)
        if (Math.abs(g.margin) <= 7) { if (g.won) s.closeGame.wins++; else s.closeGame.losses++; }

        // Over / Under
        if (g.total !== null) {
          const diff = (g.myPoints + g.oppPoints) - g.total;
          if (Math.abs(diff) <= 0.5) s.ouOver.pushes++;
          else if (diff > 0) s.ouOver.wins++;
          else s.ouOver.losses++;
        }
      });

      Object.values(s).forEach(r => { const t = r.wins + r.losses; r.pct = t > 0 ? +(r.wins / t).toFixed(3) : null; });
      const at = agg.wins + agg.losses;
      agg.pct = at > 0 ? +(agg.wins / at).toFixed(3) : 0.5;
      atsMap[teamId] = agg;
      situationalRecords[teamId] = s;
    });

    // Also build simple W/L map from game history
    const wlMap = {};
    (data.games25 || []).forEach(g => {
      if (g.home_points == null || g.away_points == null) return;
      const homeId = schoolToId(g.home_team);
      const awayId = schoolToId(g.away_team);
      if (!wlMap[homeId]) wlMap[homeId] = { wins:0, losses:0, homeW:0, homeL:0, awayW:0, awayL:0, confW:0, confL:0 };
      if (!wlMap[awayId]) wlMap[awayId] = { wins:0, losses:0, homeW:0, homeL:0, awayW:0, awayL:0, confW:0, confL:0 };
      if (g.home_points > g.away_points) { wlMap[homeId].wins++; wlMap[homeId].homeW++; wlMap[awayId].losses++; wlMap[awayId].awayL++; }
      else                               { wlMap[homeId].losses++; wlMap[homeId].homeL++; wlMap[awayId].wins++; wlMap[awayId].awayW++; }
      if (g.conference_game) {
        if (g.home_points > g.away_points) { wlMap[homeId].confW++; wlMap[awayId].confL++; }
        else                               { wlMap[homeId].confL++; wlMap[awayId].confW++; }
      }
    });
    Object.values(atsMap).forEach(r => { if (!r.pct) { const t = r.wins + r.losses; r.pct = t > 0 ? +(r.wins / t).toFixed(3) : 0.5; } });

    // ESPN News → index by team name
    const newsByTeam = {};
    (data.espnNews || []).forEach(article => {
      (article.teams || []).forEach(teamName => {
        if (!newsByTeam[teamName]) newsByTeam[teamName] = [];
        newsByTeam[teamName].push(article);
      });
    });
    window.__espnNewsByTeam = newsByTeam;

    // Reddit posts → index by team name mention in title/flair
    // Build regex per team that excludes prefix matches:
    // e.g., "Tennessee" gets (?!\s+State) so it won't match "Tennessee State"
    const redditByTeam = {};
    const teamNamesList = window.TEAMS
      ? Object.values(TEAMS).map(t => ({ name: t.name, id: t.id }))
      : [];
    const allTeamNamesLower = teamNamesList.map(t => (t.name || "").toLowerCase());
    const teamRegexCache = {};
    teamNamesList.forEach(({ name }) => {
      if (!name || name.length < 4) return;
      const lower  = name.toLowerCase();
      const esc    = lower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Find other names that extend this one (e.g., "Tennessee State" extends "Tennessee")
      const extensions = allTeamNamesLower.filter(n => n !== lower && n.startsWith(lower + " "));
      let pattern = "\\b" + esc;
      if (extensions.length > 0) {
        const firstWords = [...new Set(extensions.map(n => {
          const suffix = n.slice(lower.length).trim();
          return suffix.split(/\s+/)[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }))];
        pattern += "(?!\\s+(?:" + firstWords.join("|") + ")\\b)";
      }
      pattern += "\\b";
      teamRegexCache[lower] = new RegExp(pattern, "i");
    });
    (data.redditPosts || []).forEach(post => {
      const text = (post.title + " " + (post.flair || "")).toLowerCase();
      teamNamesList.forEach(({ name, id }) => {
        if (!name || name.length < 4) return;
        const re = teamRegexCache[name.toLowerCase()];
        if (re && re.test(text)) {
          if (!redditByTeam[id]) redditByTeam[id] = [];
          redditByTeam[id].push(post);
        }
      });
    });
    window.__redditByTeam = redditByTeam;

    // 2026 betting lines — by game ID and by week+matchup
    const linesMap = {};
    const linesByMatchup = {};
    (data.lines || []).forEach(g => {
      if (!g.lines?.length) return;
      const best = g.lines.find(l => l.provider === "consensus") ||
                   g.lines.find(l => l.provider === "ESPN Bet")  ||
                   g.lines.find(l => l.provider === "DraftKings")||
                   g.lines[0];
      if (!best) return;
      const spread = parseFloat(best.spread);
      if (isNaN(spread)) return;
      const mlHome = best.homeMoneyline ? parseInt(best.homeMoneyline) : undefined;
      const mlAway = best.awayMoneyline ? parseInt(best.awayMoneyline) : undefined;
      const lineEntry = {
        spread,
        total:            parseFloat(best.overUnder) || 50,
        moneylineHome:    mlHome,
        moneylineAway:    mlAway,
        homeSpreadOdds:   best.homeSpreadOdds  ? parseInt(best.homeSpreadOdds)  : -110,
        awaySpreadOdds:   best.awaySpreadOdds  ? parseInt(best.awaySpreadOdds)  : -110,
        overOdds:         best.overOdds        ? parseInt(best.overOdds)        : -110,
        underOdds:        best.underOdds       ? parseInt(best.underOdds)       : -110,
      };
      linesMap[g.id] = lineEntry;
      if (g.home_team && g.away_team) {
        const mk = `${g.week}|${schoolToId(g.home_team)}|${schoolToId(g.away_team)}`;
        linesByMatchup[mk] = lineEntry;
      }
    });

    // ── 1. Inject / update teams ─────────────────────────────
    (data.fbsTeams || []).forEach(t => {
      if (!t.school) return;
      const id        = schoolToId(t.school);
      const sp        = spMap[t.school] || {};
      // Use ?? null so teams without SP+ (FCS programs, untracked schools) get null,
      // not 0. detectMismatch() uses SP+ asymmetry to flag these as FCS-level.
      const spOverall = sp.rating  ?? null;
      const spRank    = sp.ranking || 80;
      const recruitRk = recruitMap[t.school] || spRank;
      const coach     = coachMap[t.school]  || "Unknown";
      const coachRec  = coachRecordMap[t.school] || null;

      const derivedRating = Math.min(99, Math.max(35, Math.round(70 + spOverall)));
      const derivedStats  = spToStats(spOverall);

      const fixColor = c => c ? (c.startsWith("#") ? c : "#" + c) : null;
      const color    = fixColor(t.color)     || "#1a1a2e";
      const altColor = fixColor(t.alt_color) || "#444444";
      const logo     = t.logos?.[0] || null;
      const isDome   = t.location?.dome || false;
      const capacity = t.location?.capacity || null;
      const timezone = t.location?.timezone || null;

      // Rating sources (real data preferred, SP+ proxy as fallback)
      const adv         = advStatsMap[t.school] || null;
      const offPPA      = adv?.offense?.ppa;
      const defPPA      = adv?.defense?.ppa;
      const eloEntry    = eloMap[t.school] || null;
      const eloRating   = eloEntry ? eloToRating(eloEntry.elo) : null;
      const realOffRating = ppaToOffRating(offPPA);
      const realDefRating = ppaToDefRating(defPPA);
      const sp_off_rating = Math.min(99, Math.max(35, Math.round(70 + spOverall * 0.9)));
      const sp_def_rating = Math.min(99, Math.max(35, Math.round(70 + spOverall * 0.9)));

      // Transfer portal balance
      const ins  = portalIn[t.school]  || [];
      const outs = portalOut[t.school] || [];
      const avgStarsIn  = ins.length  ? ins.reduce((s, p) => s + (p.stars || 2.5), 0) / ins.length  : 0;
      const avgStarsOut = outs.length ? outs.reduce((s, p) => s + (p.stars || 2.5), 0) / outs.length : 0;
      const netPortalStars = avgStarsIn - avgStarsOut;
      const eliteIns = ins.filter(p => (p.stars || 0) >= 4).length;
      const portalRating = (ins.length > 0 || outs.length > 0)
        ? Math.min(90, Math.max(20, Math.round(55 + netPortalStars * 8)))
        : null;

      // Returning production 2026
      const ret    = returningMap[t.school] || null;
      const retPct = ret ? (ret.percentPPA || ret.usage || 0.5) : null;

      // NFL Draft talent pipeline (recent 2 years)
      const draft = draftMap[t.school] || null;

      // Recruiting trend (3 years)
      const rk26 = recruitMap[t.school]   || null;
      const rk25 = recruit25Map[t.school] || null;
      const rk24 = recruit24Map[t.school] || null;

      // Real 2025 W/L record
      const rec25  = recordsMap[t.school] || null;
      const wl25   = wlMap[schoolToId(t.school)] || null;

      // Computed season record string
      function seasonRecordStr() {
        if (rec25?.total) {
          const w = rec25.total.wins || 0, l = rec25.total.losses || 0;
          const cw = rec25.conferenceGames?.wins || 0, cl = rec25.conferenceGames?.losses || 0;
          return `${w}-${l}${cw+cl > 0 ? ` (${cw}-${cl} conf)` : ""}`;
        }
        if (wl25 && wl25.wins + wl25.losses > 0) {
          return `${wl25.wins}-${wl25.losses}`;
        }
        return null;
      }

      // Real raw stats from 2025 — CFBD returns season totals; divide by games
      function buildRealStats() {
        const raw = rawStatsMap[t.school] || {};
        const g_  = raw._games || 13; // default to 13-game season
        function pg(field) { return raw[field] != null ? +(raw[field] / g_).toFixed(2) : null; }
        const base = { ...derivedStats };

        // Scoring
        const ppg  = pg("points");          if (ppg  != null) base.pointsPerGame        = ppg;
        const papg = pg("pointsAgainst");   if (papg != null) base.pointsAllowedPerGame = papg;

        // Yardage
        const ypg  = pg("totalYards");      if (ypg  != null) base.yardsPerGame         = ypg;
        const yapg = pg("yardsAllowed") ?? pg("totalYardsAllowed");
                                            if (yapg != null) base.yardsAllowedPerGame  = yapg;
        const pypg = pg("netPassingYards"); if (pypg != null) base.passingYardsPerGame  = pypg;
        const rypg = pg("rushingYards");    if (rypg != null) base.rushingYardsPerGame  = rypg;

        // Turnovers (offensive = lost, defensive = forced)
        const intThrown  = pg("interceptionsThrown");
        const fumLost    = pg("fumblesLost");
        const intForced  = pg("interceptions");   // defensive INTs
        const fumRec     = pg("fumblesRecovered");
        if (intThrown != null || fumLost   != null) base.turnoversPerGame  = +((intThrown || 0) + (fumLost || 0)).toFixed(2);
        if (intForced != null || fumRec    != null) base.turnoversForced   = +((intForced || 0) + (fumRec  || 0)).toFixed(2);

        // Third down: prefer raw rate, else advanced success rate
        const td3 = raw["thirdDownConversions"], td3a = raw["thirdDownAttempts"];
        if (td3 != null && td3a > 0) base.thirdDownPct = +(td3 / td3a).toFixed(3);
        else if (adv?.offense?.successRate) base.thirdDownPct = +adv.offense.successRate.toFixed(3);

        // Red zone (CFBD stat names vary)
        const rzConv = raw["redZoneConversions"], rzAtt = raw["redZoneAttempts"];
        if (rzConv != null && rzAtt > 0) base.redZonePct = +(rzConv / rzAtt).toFixed(3);

        // Sacks
        const sks  = pg("sacks");          if (sks  != null) base.sacks        = sks;
        const sksa = pg("sacksAllowed");   if (sksa != null) base.sacksAllowed  = sksa;

        // Advanced overrides
        if (adv?.defense?.havocTotal) base.turnoversForced = +((adv.defense.havocTotal * g_) / g_).toFixed(2);

        // Run/pass tendency from yardage split (for coaching profile)
        if (rypg != null && pypg != null && rypg + pypg > 0) {
          base._runPct = Math.round(rypg / (rypg + pypg) * 100);
        }
        return base;
      }

      // Program health computed from real signals
      function computeProgramHealth(existing) {
        const base = existing || { nilStrength: 50, transferPortalRating: 50, coachHotSeat: 3,
                                    programMomentum: "stable", fanMorale: 60,
                                    lockerRoomCohesion: 65, depthChartStability: 65 };

        if (portalRating !== null) base.transferPortalRating = portalRating;

        // NIL strength: SP+ standing + recruiting prestige + draft pipeline
        if (!base._manualNil) {
          const spBoost    = Math.min(30, Math.max(-20, Math.round(spOverall * 1.3)));
          const recBoost   = recruitRk ? Math.round((130 - Math.min(130, recruitRk)) / 130 * 15) : 0;
          const draftBoost = draft ? Math.min(25, draft.total * 4 + draft.firstRound * 6) : 0;
          const newNil     = Math.min(99, Math.max(20, Math.round(50 + spBoost + recBoost + draftBoost * 0.4)));
          base.nilStrength = existing ? Math.min(99, Math.round((base.nilStrength || 50) * 0.5 + newNil * 0.5)) : newNil;
        }

        // Fan morale from real 2025 win/loss record
        if (wl25 && !base._manualMorale) {
          const gp = wl25.wins + wl25.losses;
          const winPct = gp > 0 ? wl25.wins / gp : 0.5;
          base.fanMorale = Math.min(95, Math.max(15, Math.round(30 + winPct * 65)));
        }

        // Locker room cohesion: portal balance (net stars in vs out) + returning production
        if (!base._manualCohesion) {
          const portalBalance  = ins.length - outs.length;
          const cohPortal      = Math.min(15, Math.max(-20, Math.round(portalBalance * 1.5)));
          const cohReturn      = retPct != null ? Math.round((retPct - 0.5) * 30) : 0;
          base.lockerRoomCohesion = Math.min(95, Math.max(15, Math.round(65 + cohPortal + cohReturn)));
        }

        // Momentum from portal elite adds + returning pct
        if (!base._manualMomentum) {
          if      (eliteIns >= 3 || (retPct != null && retPct > 0.78)) base.programMomentum = "rising";
          else if (retPct != null && retPct < 0.38)                    base.programMomentum = "rebuilding";
          else if (retPct != null && retPct > 0.65)                    base.programMomentum = "stable";
        }

        if (retPct != null)
          base.depthChartStability = Math.min(95, Math.max(30, Math.round(45 + retPct * 55)));

        return base;
      }

      if (window.TEAMS && TEAMS[id]) {
        const ex = TEAMS[id];
        ex.spRating = spOverall;
        ex.spRank   = spRank;
        if (logo && !ex.logo) ex.logo = logo;
        if (isDome) ex.weatherProfile = { ...(ex.weatherProfile || {}), isDome: true };
        if (capacity && !ex.stadiumCapacity) ex.stadiumCapacity = capacity;
        if (timezone && !ex.timezone) ex.timezone = timezone;
        if (coach) ex.coachName = coach; // CFBD is authoritative — always overwrite stale fallback
        if (coachRec) ex.coachRecord = coachRec;

        // Ratings — real data wins over estimates
        ex.offensiveRating = realOffRating || sp_off_rating;
        ex.defensiveRating = realDefRating || sp_def_rating;
        if (eloRating) ex.rating = eloRating;
        else if (Math.abs(spOverall) > 1) ex.rating = derivedRating;

        // Real stats (patch existing object)
        ex.stats = buildRealStats();

        // Real 2025 record
        const recStr = seasonRecordStr();
        if (recStr) ex.lastSeasonRecord = recStr;

        // Real ATS record + comprehensive situational records
        const atsEntry = atsMap[id];
        if (atsEntry && atsEntry.wins + atsEntry.losses > 3) {
          ex.atsRecord = { wins: atsEntry.wins, losses: atsEntry.losses, pushes: atsEntry.pushes, pct: atsEntry.pct };
        }
        // Current ATS win streak (consecutive ATS wins from most recent games)
        const tgh = teamGameHistory[id];
        if (tgh && tgh.length > 0) {
          let streak = 0;
          for (let gi = tgh.length - 1; gi >= 0; gi--) {
            const r = gameATS(tgh[gi]);
            if (r === "win") streak++;
            else if (r === "push") continue; // pushes don't break the streak
            else break;
          }
          if (streak >= 2) ex.atsCurrentStreak = streak;
        }
        const sit = situationalRecords[id];
        if (sit) {
          if (!ex.situational) ex.situational = {};
          // Core situational records used directly by predictor
          if (sit.afterLoss.wins  + sit.afterLoss.losses  > 1) ex.situational.afterLoss   = sit.afterLoss;
          if (sit.afterBigWin.wins+ sit.afterBigWin.losses> 1) ex.situational.afterBigWin  = sit.afterBigWin;
          if (sit.vsRanked.wins   + sit.vsRanked.losses   > 1) ex.situational.vsRanked     = sit.vsRanked;
          if (sit.nightGame.wins  + sit.nightGame.losses  > 1) ex.situational.nightGame    = sit.nightGame;
          // Favourite / underdog ATS
          if (sit.atsFavorite.wins + sit.atsFavorite.losses > 1) ex.situational.atsFavorite = sit.atsFavorite;
          if (sit.atsUnderdog.wins + sit.atsUnderdog.losses > 1) ex.situational.atsUnderdog = sit.atsUnderdog;
          // Home/away ATS from aggregate
          if (atsEntry) {
            if (atsEntry.homeW + atsEntry.homeL > 1) ex.situational.atsHome = { wins: atsEntry.homeW, losses: atsEntry.homeL, pct: +(atsEntry.homeW / (atsEntry.homeW + atsEntry.homeL)).toFixed(3) };
            if (atsEntry.awayW + atsEntry.awayL > 1) ex.situational.atsAway = { wins: atsEntry.awayW, losses: atsEntry.awayL, pct: +(atsEntry.awayW / (atsEntry.awayW + atsEntry.awayL)).toFixed(3) };
          }
          // Additional situational
          if (sit.road.wins     + sit.road.losses     > 1) ex.situational.road     = sit.road;
          if (sit.confGame.wins + sit.confGame.losses > 1) ex.situational.confGame  = sit.confGame;
          if (sit.closeGame.wins+ sit.closeGame.losses> 1) ex.situational.closeGame = sit.closeGame;
          if (sit.ouOver.wins   + sit.ouOver.losses   > 1) ex.situational.ouRecord  = sit.ouOver;
        }

        // Coaching profile — patch with real data
        const realStats = buildRealStats();
        ex.stats = realStats;
        if (!ex.coachingProfile) ex.coachingProfile = {};
        if (atsEntry && atsEntry.wins + atsEntry.losses > 3) {
          ex.coachingProfile.atsRecord = `${atsEntry.wins}-${atsEntry.losses}`;
          if (sit?.atsFavorite.wins + (sit?.atsFavorite.losses||0) > 1)
            ex.coachingProfile.atsAsFavorite = `${sit.atsFavorite.wins}-${sit.atsFavorite.losses}`;
          if (sit?.atsUnderdog.wins + (sit?.atsUnderdog.losses||0) > 1)
            ex.coachingProfile.atsAsUnderdog = `${sit.atsUnderdog.wins}-${sit.atsUnderdog.losses}`;
        }
        if (sit?.closeGame.wins + (sit?.closeGame.losses||0) > 1)
          ex.coachingProfile.closeGameRecord = `${sit.closeGame.wins}-${sit.closeGame.losses} (games decided by ≤7)`;
        if (sit?.vsRanked.wins + (sit?.vsRanked.losses||0) > 1)
          ex.coachingProfile.bigSpotRecord = `${sit.vsRanked.wins}-${sit.vsRanked.losses} (vs ranked)`;
        if (realStats._runPct != null) {
          const tend = ex.coachingProfile.tendencies || {};
          if (!tend.runPassRatio)    tend.runPassRatio    = realStats._runPct;
          if (!tend.offensiveScheme) tend.offensiveScheme = realStats._runPct > 55 ? "run-heavy" : realStats._runPct < 40 ? "pass-heavy" : "balanced";
          if (!tend.tempoPreference && adv?.offense?.explosiveness != null)
            tend.tempoPreference = adv.offense.explosiveness > 1.1 ? "uptempo" : adv.offense.explosiveness < 0.9 ? "deliberate" : "moderate";
          if (!tend.aggressiveness)  tend.aggressiveness  = Math.round(Math.min(10, Math.max(1, 5 + spOverall * 0.15)));
          ex.coachingProfile.tendencies = tend;
        }

        // Conference standing
        const standing = standingsMap[t.school];
        if (standing) {
          ex.conferenceStanding = {
            confWins:    standing.wins,
            confLosses:  standing.losses,
            homeRecord:  standing.home  ? `${standing.home.wins}-${standing.home.losses}`   : null,
            awayRecord:  standing.away  ? `${standing.away.wins}-${standing.away.losses}`    : null,
            pointsFor:   standing.points,
            pointsAgainst: standing.points_against,
          };
        }

        // Recruiting trend
        ex.recruitingRank  = recruitRk;
        ex.recruitingTrend = { rank2024: rk24, rank2025: rk25, rank2026: rk26 };
        if (draft) ex.nflDraftRecent = { total: draft.total, firstRound: draft.firstRound };
        if (retPct != null) ex._returningPct = retPct;

        // Program health — real signals
        ex.programHealth = computeProgramHealth(ex.programHealth);

      } else if (window.TEAMS) {
        const atsEntry = atsMap[id];
        const sit      = situationalRecords[id] || {};
        const realStats = buildRealStats();
        const standing  = standingsMap[t.school];
        const stubSituational = {};
        if (atsEntry) {
          if (atsEntry.homeW + atsEntry.homeL > 1) stubSituational.atsHome = { wins: atsEntry.homeW, losses: atsEntry.homeL, pct: +(atsEntry.homeW / (atsEntry.homeW + atsEntry.homeL)).toFixed(3) };
          if (atsEntry.awayW + atsEntry.awayL > 1) stubSituational.atsAway = { wins: atsEntry.awayW, losses: atsEntry.awayL, pct: +(atsEntry.awayW / (atsEntry.awayW + atsEntry.awayL)).toFixed(3) };
        }
        ['afterLoss','afterBigWin','vsRanked','nightGame','atsFavorite','atsUnderdog','road','confGame','closeGame'].forEach(k => {
          if (sit[k] && sit[k].wins + sit[k].losses > 1) stubSituational[k] = sit[k];
        });
        if (sit.ouOver && sit.ouOver.wins + sit.ouOver.losses > 1) stubSituational.ouRecord = sit.ouOver;

        const stubCoachingProfile = {};
        if (atsEntry && atsEntry.wins + atsEntry.losses > 3) {
          stubCoachingProfile.atsRecord = `${atsEntry.wins}-${atsEntry.losses}`;
          if (sit.atsFavorite?.wins + (sit.atsFavorite?.losses||0) > 1) stubCoachingProfile.atsAsFavorite = `${sit.atsFavorite.wins}-${sit.atsFavorite.losses}`;
          if (sit.atsUnderdog?.wins + (sit.atsUnderdog?.losses||0) > 1) stubCoachingProfile.atsAsUnderdog = `${sit.atsUnderdog.wins}-${sit.atsUnderdog.losses}`;
        }
        if (sit.closeGame?.wins + (sit.closeGame?.losses||0) > 1) stubCoachingProfile.closeGameRecord = `${sit.closeGame.wins}-${sit.closeGame.losses} (games decided by ≤7)`;
        if (sit.vsRanked?.wins  + (sit.vsRanked?.losses||0)  > 1) stubCoachingProfile.bigSpotRecord   = `${sit.vsRanked.wins}-${sit.vsRanked.losses} (vs ranked)`;
        if (realStats._runPct != null) {
          stubCoachingProfile.tendencies = {
            runPassRatio:    realStats._runPct,
            offensiveScheme: realStats._runPct > 55 ? "run-heavy" : realStats._runPct < 40 ? "pass-heavy" : "balanced",
            aggressiveness:  Math.round(Math.min(10, Math.max(1, 5 + spOverall * 0.15))),
            ...(adv?.offense?.explosiveness != null ? {
              tempoPreference: adv.offense.explosiveness > 1.1 ? "uptempo" : adv.offense.explosiveness < 0.9 ? "deliberate" : "moderate",
            } : {}),
          };
        }

        TEAMS[id] = {
          id,
          name:            t.school,
          abbreviation:    t.abbreviation || id.toUpperCase().slice(0, 4),
          mascot:          t.mascot || "",
          conference:      t.conference || "Independent",
          color, altColor, logo,
          wins:  rec25?.total?.wins   || wlMap[id]?.wins   || 0,
          losses: rec25?.total?.losses || wlMap[id]?.losses || 0,
          lastSeasonRecord: seasonRecordStr() || "2025",
          rating:          eloRating  || derivedRating,
          offensiveRating: realOffRating || sp_off_rating,
          defensiveRating: realDefRating || sp_def_rating,
          spRating:   spOverall, spRank,
          recruitingRank:  recruitRk,
          recruitingTrend: { rank2024: rk24, rank2025: rk25, rank2026: rk26 },
          coachName:  coach,
          coachRecord: coachRec || "0-0",
          stadiumCapacity: capacity, timezone,
          nflDraftRecent:  draft ? { total: draft.total, firstRound: draft.firstRound } : null,
          _returningPct:   retPct,
          stats:           realStats,
          atsRecord:       atsEntry && atsEntry.wins + atsEntry.losses > 3
            ? { wins: atsEntry.wins, losses: atsEntry.losses, pushes: atsEntry.pushes, pct: atsEntry.pct } : null,
          situational:     stubSituational,
          conferenceStanding: standing ? {
            confWins: standing.wins, confLosses: standing.losses,
            homeRecord: standing.home ? `${standing.home.wins}-${standing.home.losses}` : null,
            awayRecord: standing.away ? `${standing.away.wins}-${standing.away.losses}` : null,
            pointsFor: standing.points, pointsAgainst: standing.points_against,
          } : null,
          programHealth:   computeProgramHealth(null),
          weatherProfile:  { isDome, coldWeatherAdvantage: (() => {
            const lat = t.location?.latitude || 38;
            return lat > 44 ? 9 : lat > 42 ? 7 : lat > 40 ? 5 : lat > 37 ? 3 : 2;
          })() },
          schedule:        { daysSinceLastGame: 7, isComingOffBigWin: false, isComingOffBigLoss: false,
                             hasLookaheadGame: false, consecutiveRoadGames: 0, travelBurdenRating: 4 },
          coachingProfile: stubCoachingProfile,
          fromLive: true,
        };
      }
    });

    // ── 1b. Merge ESPN rosters + injuries into KEY_PLAYERS for curated teams ──
    if (typeof KEY_PLAYERS !== "undefined" && Array.isArray(KEY_PLAYERS)) {
      // Merge: pre-generated rosters (all 130+ teams) overridden by live-fetched (16 curated)
      const espnRosters   = Object.assign({}, window.__pregRosters || {}, data.espnRosters || {});
      const espnInjuries  = data.espnInjuries  || {};

      // For each curated team that has ESPN roster data, update player info
      Object.entries(espnRosters).forEach(([teamId, rosterPlayers]) => {
        const teamKPs = KEY_PLAYERS.filter(p => p.teamId === teamId);
        if (!teamKPs.length || !rosterPlayers.length) return;

        // Build a name-lookup from ESPN (last name → player record)
        const espnByLast = {};
        const espnByFull = {};
        rosterPlayers.forEach(ep => {
          const words = ep.name.split(" ");
          const last  = words[words.length - 1].toLowerCase();
          if (!espnByLast[last]) espnByLast[last] = [];
          espnByLast[last].push(ep);
          espnByFull[ep.name.toLowerCase()] = ep;
        });

        // Pull ESPN injury data for this team
        const injMap = {};
        (espnInjuries[teamId] || []).forEach(inj => {
          injMap[inj.name.toLowerCase()] = inj;
        });

        teamKPs.forEach(kp => {
          const kpWords  = kp.name.split(" ");
          const kpLast   = kpWords[kpWords.length - 1].toLowerCase();
          const kpFull   = kp.name.toLowerCase();

          // Try exact name match first, then last-name match
          const ep = espnByFull[kpFull] ||
            (espnByLast[kpLast]?.length === 1 ? espnByLast[kpLast][0] : null);

          if (ep) {
            // Found in ESPN roster — update metadata and mark verified
            if (ep.number)      kp.number = ep.number;
            if (ep.year)        kp.year   = ep.year;
            if (ep.heightWeight && !kp.heightWeight) kp.heightWeight = ep.heightWeight;
            kp._espnVerified = true;

            // Check ESPN injury status
            const injEntry = injMap[kp.name.toLowerCase()];
            if (injEntry) {
              const s = injEntry.status.toLowerCase();
              kp.injuryStatus = s.includes("out") ? "out" : s.includes("doubt") ? "doubtful" : "questionable";
              if (injEntry.injuryType) kp.injuryType = injEntry.injuryType;
            }
          } else {
            // Not found in ESPN roster — player may have left
            kp._espnNotFound = true;
          }
        });

        // Add any ESPN roster players who are NOT yet in KEY_PLAYERS for this team
        const kpNames = new Set(teamKPs.map(p => p.name.toLowerCase()));
        const teamObj = window.TEAMS ? TEAMS[teamId] : null;
        let liveIdx   = KEY_PLAYERS.filter(p => p.teamId === teamId && p._espnVerified).length;
        rosterPlayers.forEach(ep => {
          if (kpNames.has(ep.name.toLowerCase())) return; // already curated
          if (!ep.position || !ep.name) return;
          // Only add skilled-position players (QB/RB/WR/TE/EDGE/LB/CB/S/DE/DT)
          const incl = ["QB","RB","WR","TE","EDGE","DE","DT","LB","OLB","ILB","CB","S","DB","FS","SS"];
          if (!incl.includes(ep.position)) return;
          const injEntry = injMap[ep.name.toLowerCase()];
          const injStatus = injEntry
            ? (injEntry.status.includes("out") ? "out" : injEntry.status.includes("doubt") ? "doubtful" : "questionable")
            : (ep.status !== "active" ? "questionable" : "healthy");
          KEY_PLAYERS.push({
            id: `p_live_${teamId.slice(0,6)}_${ep.position}_espn${++liveIdx}`,
            name:        ep.name,
            position:    ep.position,
            teamId,
            year:        ep.year        || "",
            number:      ep.number      || "",
            heightWeight:ep.heightWeight|| "",
            hometown:    "",
            injuryStatus: injStatus,
            practiceStatus: injStatus === "healthy" ? "full" : "limited",
            injuryType:  injEntry?.injuryType || ep.injuryType || null,
            injuryHistory:[], injuryProneRating:3, impact:"medium",
            personalFlags:{ distractionLevel:2, distractionNote:"", socialMediaPattern:"normal",
                            nflDraftStatus:"", agentContact:false, nilSatisfaction:"medium", transferPortalRisk:"low" },
            performanceMetrics:null, stats:null, scoutReport:"",
            _espnVerified: true,
          });
        });
      });

      // Expose ESPN team stats + team news on TEAMS
      if (window.TEAMS) {
        Object.entries(data.espnTeamStats || {}).forEach(([teamId, stats]) => {
          if (TEAMS[teamId]) TEAMS[teamId]._espnStats = stats;
        });
        const teamNewsMap = {};
        (data.espnTeamNews || []).forEach(n => {
          if (!teamNewsMap[n.teamId]) teamNewsMap[n.teamId] = [];
          teamNewsMap[n.teamId].push(n);
        });
        Object.entries(teamNewsMap).forEach(([teamId, articles]) => {
          if (TEAMS[teamId]) TEAMS[teamId]._espnNews = articles;
        });
      }

      // Expose live scores globally
      if ((data.espnLiveScores || []).length) {
        window.__espnLiveScores = data.espnLiveScores;
      }

      console.log(`[LIVE] ESPN roster merge: ${Object.keys(espnRosters).length} teams | verified: ${KEY_PLAYERS.filter(p=>p._espnVerified).length} | notFound: ${KEY_PLAYERS.filter(p=>p._espnNotFound).length}`);
    }

    // ── 2. Build KEY_PLAYERS for all FBS teams without curated entries ──
    if (typeof KEY_PLAYERS !== "undefined" && Array.isArray(KEY_PLAYERS)) {
      // Set of teamIds that already have hand-curated player entries
      const curatedTeamIds = new Set(KEY_PLAYERS.map(p => p.teamId));

      // Pivot flat player-stat rows → playersByTeam[teamName][playerName][statType]
      function pivotStatRows(rows, dest) {
        (rows || []).forEach(row => {
          if (!row.team || !row.player) return;
          if (!dest[row.team]) dest[row.team] = {};
          if (!dest[row.team][row.player]) dest[row.team][row.player] = {};
          if (row.statType !== undefined) dest[row.team][row.player][row.statType] = row.stat;
        });
      }
      const passingPlayers  = {};
      const rushingPlayers  = {};
      const receivingPlayers = {};
      const defensivePlayers = {};
      pivotStatRows(data.playersPassing,   passingPlayers);
      pivotStatRows(data.playersRushing,   rushingPlayers);
      pivotStatRows(data.playersReceiving, receivingPlayers);
      pivotStatRows(data.playersDefensive, defensivePlayers);

      // Return top N players from a team's stat map, sorted descending by statKey
      function topN(teamMap, teamName, statKey, n) {
        return Object.entries(teamMap[teamName] || {})
          .filter(([, s]) => (s[statKey] || 0) > 0)
          .sort((a, b) => (b[1][statKey] || 0) - (a[1][statKey] || 0))
          .slice(0, n)
          .map(([name, stats]) => ({ name, stats }));
      }

      // Derive performance metrics from team's real situational data
      function deriveMetrics(teamId, position) {
        const sit = situationalRecords[teamId] || {};
        const agg = atsMap[teamId] || null;
        function pct(r) { const t = r.wins + r.losses; return t > 0 ? r.wins / t : 0.5; }
        const basePct  = agg ? (agg.pct || 0.5) : 0.5;
        const clutch   = Math.round(60 + pct(sit.closeGame   || { wins: 0, losses: 0 }) * 35);
        const bigGame  = Math.round(55 + pct(sit.vsRanked    || { wins: 0, losses: 0 }) * 40);
        const road     = Math.round(58 + pct(sit.road        || { wins: 0, losses: 0 }) * 36);
        const prime    = Math.round(58 + pct(sit.nightGame   || { wins: 0, losses: 0 }) * 36);
        const consist  = Math.round(60 + basePct * 35);
        const pressure = Math.round((clutch + bigGame + road) / 3);
        // Position-specific explosive-play boost
        const expBoost = { QB: 4, RB: 7, WR: 13, TE: 2, EDGE: 0, DL: 0, LB: 0, CB: 2, S: 1 };
        return {
          clutchRating:        Math.min(95, Math.max(50, clutch)),
          bigGameRating:       Math.min(95, Math.max(45, bigGame)),
          coldWeatherRating:   Math.min(90, Math.max(50, 65)),
          roadGameRating:      Math.min(95, Math.max(48, road)),
          primeTimeRating:     Math.min(95, Math.max(48, prime)),
          consistencyRating:   Math.min(95, Math.max(52, consist)),
          pressureRating:      Math.min(95, Math.max(48, pressure)),
          explosivePlayRating: Math.min(95, Math.max(50, 66 + (expBoost[position] || 0))),
        };
      }

      // Generate a brief scout report from real stats
      function scoutReport(name, pos, teamName, stats) {
        const fn = name.split(" ")[0];
        if (pos === "QB") {
          const yds = stats.YDS || 0, tds = stats.TD || 0, ints = stats.INT || 0;
          const att = stats.ATT || 1, comp = stats.COMPLETIONS || 0;
          const cmpPct = att > 0 ? Math.round(comp / att * 100) : 0;
          return `${fn} posted ${yds.toLocaleString()} passing yards, ${tds} TDs and ${ints} INTs on ${cmpPct}% completion in 2025. Operating as ${teamName}'s primary signal-caller, his ability to make pre-snap adjustments and extend plays under pressure will be critical to the offense's efficiency.`;
        }
        if (pos === "RB") {
          const yds = stats.YDS || 0, tds = stats.TD || 0, car = stats.CAR || 1;
          const ypc = (yds / car).toFixed(1);
          return `${fn} rushed for ${yds.toLocaleString()} yards at ${ypc} YPC with ${tds} TDs in 2025. A physical presence who gives ${teamName} a reliable ground game and consistent short-yardage option.`;
        }
        if (pos === "WR") {
          const yds = stats.YDS || 0, tds = stats.TD || 0, rec = stats.REC || 0;
          const ypr = rec > 0 ? (yds / rec).toFixed(1) : "0.0";
          return `${fn} hauled in ${rec} catches for ${yds} yards (${ypr} per target) and ${tds} TDs in 2025. A reliable option who creates separation at the stem of his routes and gives the QB a consistent outlet downfield.`;
        }
        if (pos === "EDGE" || pos === "DL") {
          const sacks = stats.SACKS || 0, tfl = stats.TFL || 0;
          return `${fn} generated consistent pressure for ${teamName}'s defense in 2025 (${sacks} sacks, ${tfl} TFL). His pass-rush ability disrupts offensive rhythm and forces opposing QBs into uncomfortable, early decisions.`;
        }
        return `${fn} is a key defensive contributor for ${teamName}, bringing consistent effort and positional discipline in 2025.`;
      }

      // Loop every FBS team and inject KEY_PLAYERS for those without curated data
      (data.fbsTeams || []).forEach(t => {
        if (!t.school) return;
        const id = schoolToId(t.school);
        if (curatedTeamIds.has(id)) return;   // already curated — skip

        const teamId  = id;
        let pIdx = 0;
        const mkId = pos => `p_live_${id.slice(0, 6)}_${pos}_${++pIdx}`;

        // QB — top passer by yards
        topN(passingPlayers, t.school, "YDS", 1).forEach(({ name, stats }) => {
          const yds = stats.YDS || 0, tds = stats.TD || 0, ints = stats.INT || 0;
          const att = stats.ATT || 1, comp = stats.COMPLETIONS || 0;
          KEY_PLAYERS.push({
            id: mkId("QB"), name, position: "QB", teamId, year: "", number: "",
            heightWeight: "", hometown: "",
            injuryStatus: "healthy", practiceStatus: "full", injuryType: null,
            injuryHistory: [], injuryProneRating: 3, impact: "high",
            personalFlags: {
              distractionLevel: 3,
              distractionNote: `${name} is ${t.school}'s starting QB heading into 2026, coming off a 2025 season in which he threw for ${yds} yards and ${tds} TDs. Returns as the face of the offense.`,
              socialMediaPattern: "normal",
              nflDraftStatus: yds > 2500 ? "projected round 3-5" : "undrafted",
              agentContact: yds > 3200,
              nilSatisfaction: "medium",
              transferPortalRisk: "low",
            },
            performanceMetrics: deriveMetrics(teamId, "QB"),
            stats: {
              gamesPlayed: 0, passingYards: yds, passingTDs: tds, interceptions: ints,
              completionPct: att > 0 ? +((comp / att * 100).toFixed(1)) : 0, qbr: 0,
            },
            scoutReport: scoutReport(name, "QB", t.school, stats),
          });
        });

        // RB — top rusher by yards
        topN(rushingPlayers, t.school, "YDS", 1).forEach(({ name, stats }) => {
          const yds = stats.YDS || 0, tds = stats.TD || 0, car = stats.CAR || 1;
          KEY_PLAYERS.push({
            id: mkId("RB"), name, position: "RB", teamId, year: "", number: "",
            heightWeight: "", hometown: "",
            injuryStatus: "healthy", practiceStatus: "full", injuryType: null,
            injuryHistory: [], injuryProneRating: 3, impact: yds > 800 ? "high" : "medium",
            personalFlags: {
              distractionLevel: 2,
              distractionNote: `${name} returns as ${t.school}'s lead back after rushing for ${yds} yards and ${tds} TDs in 2025.`,
              socialMediaPattern: "normal",
              nflDraftStatus: yds > 1000 ? "projected round 4-6" : "undrafted",
              agentContact: yds > 1200,
              nilSatisfaction: "medium",
              transferPortalRisk: "low",
            },
            performanceMetrics: deriveMetrics(teamId, "RB"),
            stats: {
              gamesPlayed: 0, rushingYards: yds, rushingTDs: tds,
              yardsPerCarry: car > 0 ? +(yds / car).toFixed(1) : 0,
              receivingYards: 0, receivingTDs: 0, receptions: 0,
            },
            scoutReport: scoutReport(name, "RB", t.school, stats),
          });
        });

        // WR — top 2 receivers by yards
        topN(receivingPlayers, t.school, "YDS", 2).forEach(({ name, stats }) => {
          const yds = stats.YDS || 0, tds = stats.TD || 0, rec = stats.REC || 0;
          KEY_PLAYERS.push({
            id: mkId("WR"), name, position: "WR", teamId, year: "", number: "",
            heightWeight: "", hometown: "",
            injuryStatus: "healthy", practiceStatus: "full", injuryType: null,
            injuryHistory: [], injuryProneRating: 2, impact: yds > 600 ? "high" : "medium",
            personalFlags: {
              distractionLevel: 2,
              distractionNote: `${name} provides a key receiving option for ${t.school}'s passing game, recording ${rec} catches for ${yds} yards in 2025.`,
              socialMediaPattern: "normal",
              nflDraftStatus: yds > 900 ? "projected round 4-7" : "undrafted",
              agentContact: yds > 1100,
              nilSatisfaction: "medium",
              transferPortalRisk: "low",
            },
            performanceMetrics: deriveMetrics(teamId, "WR"),
            stats: {
              gamesPlayed: 0, receivingYards: yds, receivingTDs: tds, receptions: rec,
              yardsPerReception: rec > 0 ? +(yds / rec).toFixed(1) : 0,
            },
            scoutReport: scoutReport(name, "WR", t.school, stats),
          });
        });

        // Defender — top pass rusher by sacks; fall back to TFL if no sacks data
        const defPlayers = topN(defensivePlayers, t.school, "SACKS", 1);
        const tflPlayers = defPlayers.length === 0 ? topN(defensivePlayers, t.school, "TFL", 1) : defPlayers;
        tflPlayers.forEach(({ name, stats }) => {
          const sacks = stats.SACKS || 0, tfl = stats.TFL || 0;
          KEY_PLAYERS.push({
            id: mkId("EDGE"), name, position: "EDGE", teamId, year: "", number: "",
            heightWeight: "", hometown: "",
            injuryStatus: "healthy", practiceStatus: "full", injuryType: null,
            injuryHistory: [], injuryProneRating: 3, impact: sacks > 6 ? "high" : "medium",
            personalFlags: {
              distractionLevel: 2,
              distractionNote: `${name} leads ${t.school}'s pass rush, providing consistent pressure from the edge. Recorded ${sacks} sacks and ${tfl} TFL in 2025.`,
              socialMediaPattern: "normal",
              nflDraftStatus: sacks > 8 ? "projected round 3-5" : "undrafted",
              agentContact: sacks > 10,
              nilSatisfaction: "medium",
              transferPortalRisk: "low",
            },
            performanceMetrics: deriveMetrics(teamId, "EDGE"),
            stats: {
              gamesPlayed: 0, sacks, tacklesForLoss: tfl, qbHurries: 0,
              forcedFumbles: 0, passDeflections: 0,
            },
            scoutReport: scoutReport(name, "EDGE", t.school, stats),
          });
        });
      });

      console.log(`[LIVE] KEY_PLAYERS: ${KEY_PLAYERS.length} total entries (${KEY_PLAYERS.filter(p => !curatedTeamIds.has(p.teamId)).length} live-generated)`);
    }

    // ── 3. Inject all games ──────────────────────────────────
    if (!window.GAMES) return;

    const existingIds     = new Set(GAMES.map(g => g.id));
    const existingMatchups = new Set(
      GAMES.map(g => `${g.week}|${g.homeTeamId}|${g.awayTeamId}`)
    );

    let added = 0;
    (data.games || []).forEach(g => {
      if (!g.home_team || !g.away_team) return;
      const homeId = schoolToId(g.home_team);
      const awayId = schoolToId(g.away_team);
      const cfbdId = "cfbd_" + g.id;

      // Skip if already present (either by ID or by same matchup+week)
      if (existingIds.has(cfbdId)) return;
      const key = `${g.week}|${homeId}|${awayId}`;
      if (existingMatchups.has(key)) {
        // Update betting lines on the curated version instead
        const curated = GAMES.find(x =>
          x.week === g.week && x.homeTeamId === homeId && x.awayTeamId === awayId
        );
        if (curated && !curated.bettingLines && linesMap[g.id]) {
          curated.bettingLines = linesMap[g.id];
        }
        return;
      }

      // Parse time
      let time = "TBD";
      if (!g.start_time_tbd && g.start_date) {
        try {
          time = new Date(g.start_date).toLocaleTimeString("en-US", {
            hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
          }) + " ET";
        } catch {}
      }

      const lineKey = `${g.week || 1}|${homeId}|${awayId}`;
      const stub = {
        id:               cfbdId,
        week:             g.week || 1,
        date:             g.start_date ? g.start_date.slice(0, 10) : `${SEASON}-09-01`,
        time,
        homeTeamId:       homeId,
        awayTeamId:       awayId,
        homeTeamName:     g.home_team,
        awayTeamName:     g.away_team,
        venue:            g.venue || "",
        network:          g.notes || "TBD",
        isConferenceGame: g.conference_game || false,
        isRivalryGame:    false,
        neutralSite:      g.neutral_site || false,
        weather:          null,
        bettingLines:     linesMap[g.id] || linesByMatchup[lineKey] || null,
        xFactors:         [],
        gamePreview:      {
          headline: `${g.away_team} at ${g.home_team}`,
          synopsis: `Week ${g.week || 1} matchup. Full analysis generated as game approaches.`,
          analysis: [],
          thePick:  { team: "", line: "", confidence: "LOW", unit: 1, reasoning: "" },
        },
        socialIntel: {
          lineMovement:  [],
          publicBetting: { homePct: 50, awayPct: 50, overPct: 50, underPct: 50 },
          beatWriter:    [],
        },
        fromLive: true,
      };

      // Patch ESPN team colors onto newly-created live stubs
      if (g._homeColor && window.TEAMS && TEAMS[homeId]?.fromLive) TEAMS[homeId].color = g._homeColor;
      if (g._awayColor && window.TEAMS && TEAMS[awayId]?.fromLive) TEAMS[awayId].color = g._awayColor;

      GAMES.push(stub);
      existingIds.add(cfbdId);
      existingMatchups.add(key);
      added++;
    });

    console.log(`[LIVE] ${added} new games injected. Total GAMES: ${GAMES.length}, TEAMS: ${Object.keys(TEAMS).length}`);
  }

  // ── Badge / UI ───────────────────────────────────────────────
  function updateBadge() {
    const badges = document.querySelectorAll(".live-data-badge");
    const icons  = document.querySelectorAll(".live-data-icon");
    const { status, lastUpdated, error, errorType, loadProgress } = state;

    let html;
    if (status === "live") {
      const rel = relativeTime(window.__liveLastUpdated || lastUpdated);
      html = `<span class="live-badge live-badge-on" title="Connected — Updated: ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "now"}">LIVE · ${rel}</span>`;
    } else if (status === "refreshing") {
      html = `<span class="live-badge live-badge-loading">Refreshing...</span>`;
    } else if (status === "loading") {
      const prog = loadProgress > 0 ? ` ${loadProgress}/${ENDPOINT_COUNT}` : "";
      html = `<span class="live-badge live-badge-loading">Loading${prog}...</span>`;
    } else if (status === "stale") {
      const rel = relativeTime(window.__liveLastUpdated);
      html = `<span class="live-badge live-badge-stale" title="${error || "Stale cache"}">Cached · ${rel}</span>`;
    } else if (status === "error") {
      if (errorType === "invalid_key") {
        html = `<span class="live-badge live-badge-err" title="${error || "Invalid key"}">Invalid Key</span>`;
      } else if (errorType === "rate_limit") {
        html = `<span class="live-badge live-badge-err" title="${error || "Rate limited"}">Rate Limited</span>`;
      } else if (errorType === "no_key") {
        html = `<span class="live-badge live-badge-off" title="Connect API key for live data">Static</span>`;
      } else {
        html = `<span class="live-badge live-badge-err" title="${error || "Network error"}">Offline — Static</span>`;
      }
    } else {
      html = `<span class="live-badge live-badge-off" title="Connect API key for live data">Static</span>`;
    }

    badges.forEach(b => { b.innerHTML = html; });
    icons.forEach(i => {
      i.title = (status === "live" || status === "stale")
        ? `Live data active — ${GAMES?.length || 0} games, ${Object.keys(TEAMS || {}).length} teams`
        : "Connect CFBD API for live schedules & rosters";
    });
  }

  // ── Settings modal ───────────────────────────────────────────
  function openSettings() {
    let modal = document.getElementById("live-settings-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "live-settings-modal";
      modal.innerHTML = `
        <div class="live-modal-overlay" onclick="LIVE.closeSettings()"></div>
        <div class="live-modal-box">
          <div class="live-modal-header">
            <div>
              <div style="font-size:1rem;font-weight:900;color:var(--text)">Live Data Settings</div>
              <div style="font-size:.72rem;color:var(--muted-l);margin-top:2px">College Football Data API — All FBS Teams &amp; Games</div>
            </div>
            <button class="live-modal-close" onclick="LIVE.closeSettings()">✕</button>
          </div>

          <div style="font-size:.82rem;color:var(--text-soft);line-height:1.6;margin-bottom:16px">
            Connect to get <strong style="color:var(--primary)">all 800+ FBS games</strong>,
            live betting lines, SP+ ratings, and rosters for every D1 program — refreshed every 30 minutes.
          </div>

          <div style="padding:12px 16px;border-radius:10px;background:rgba(16,185,129,.07);border:1px solid rgba(16,185,129,.2);margin-bottom:16px">
            <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--primary);margin-bottom:6px">Get a free API key</div>
            <ol style="font-size:.78rem;color:var(--text-soft);line-height:1.8;margin-left:14px">
              <li>Go to <strong style="color:var(--text)">collegefootballdata.com</strong></li>
              <li>Create a free account (30 seconds)</li>
              <li>Copy your API key from your profile</li>
              <li>Paste it below — saved only on this device</li>
            </ol>
          </div>

          <div style="margin-bottom:12px">
            <div style="font-size:.7rem;font-weight:700;color:var(--muted-l);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">CFBD API Key</div>
            <div style="position:relative">
              <input id="live-api-key-input" type="text"
                style="width:100%;padding:10px 42px 10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:.82rem;outline:none;font-family:monospace;box-sizing:border-box"
                placeholder="Paste your API key here..." autocomplete="off" autocorrect="off" spellcheck="false" />
              <button onclick="(function(){var i=document.getElementById('live-api-key-input');i.type=i.type==='text'?'password':'text';this.textContent=i.type==='text'?'Hide':'Show';}).call(this)"
                style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:.65rem;font-weight:700;cursor:pointer;padding:4px 6px;color:var(--muted-l)" title="Show/hide key">Show</button>
            </div>
            <div id="live-key-status" style="font-size:.72rem;margin-top:6px;min-height:18px"></div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
            <button onclick="LIVE.saveAndFetch()"
              style="flex:1;padding:11px;border-radius:10px;background:var(--primary);color:#fff;font-weight:800;font-size:.9rem;border:none;cursor:pointer">
              Connect &amp; Sync All Data
            </button>
            <button onclick="LIVE.forceClear()"
              style="padding:11px 16px;border-radius:10px;background:var(--surface);color:var(--muted-l);font-weight:700;font-size:.85rem;border:1px solid var(--border);cursor:pointer">
              Clear
            </button>
          </div>

          <div style="margin-bottom:12px">
            <button onclick="window.__refreshLiveData && window.__refreshLiveData()"
              style="width:100%;padding:9px;border-radius:10px;background:var(--surface);color:var(--text-soft);font-weight:700;font-size:.82rem;border:1px solid var(--border);cursor:pointer">
              Refresh Now
            </button>
          </div>

          <div style="margin-top:4px;padding:10px 14px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
            <div id="live-current-status" style="font-size:.75rem;color:var(--muted-l)">Status: checking...</div>
          </div>
        </div>`;
      document.body.appendChild(modal);

      if (!document.getElementById("live-modal-css")) {
        const s = document.createElement("style");
        s.id = "live-modal-css";
        s.textContent = `
          #live-settings-modal { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px; }
          .live-modal-overlay { position:absolute;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px); }
          .live-modal-box { position:relative;background:var(--card);border:1px solid var(--border-l);border-radius:20px;padding:24px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.6);max-height:90vh;overflow-y:auto; }
          .live-modal-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px; }
          .live-modal-close { background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--muted-l);font-size:.9rem;cursor:pointer;padding:4px 10px;transition:all .15s; }
          .live-modal-close:hover { color:var(--text);border-color:var(--border-l); }
          .live-badge { display:inline-flex;align-items:center;gap:4px;font-size:.58rem;font-weight:900;letter-spacing:1px;padding:2px 8px;border-radius:8px;border:1px solid;cursor:pointer;transition:all .15s; }
          .live-badge-on    { background:rgba(16,185,129,.15);border-color:rgba(16,185,129,.4);color:var(--primary); }
          .live-badge-off   { background:rgba(139,157,187,.1);border-color:rgba(139,157,187,.3);color:var(--muted-l); }
          .live-badge-stale { background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.35);color:var(--gold); }
          .live-badge-loading { background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3);color:var(--gold); animation:badgePulse 1.2s ease-in-out infinite; }
          .live-badge-err   { background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.3);color:var(--danger); }
          @keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:.5} }
          #live-api-key-input:focus { border-color:var(--primary); }
        `;
        document.head.appendChild(s);
      }
    }
    modal.style.display = "flex";

    const key = getKey();
    const input = document.getElementById("live-api-key-input");
    if (key && input) input.value = key;
    updateModalStatus();
  }

  function updateModalStatus() {
    const el = document.getElementById("live-current-status");
    if (!el) return;
    const { status, lastUpdated, error, errorType } = state;
    const key = getKey();
    const gameCount  = window.GAMES  ? GAMES.length : 0;
    const teamCount  = window.TEAMS  ? Object.keys(TEAMS).length : 0;
    const ttlMins    = cacheTtlMinutes();
    const ageMins    = cacheAgeMinutes();

    let lines = [];

    if (!key) {
      lines.push(`<span style="color:var(--muted-l)">No API key — using built-in data only</span>`);
    } else if (status === "live") {
      const rel = relativeTime(window.__liveLastUpdated || lastUpdated);
      lines.push(`<span style="color:var(--primary)">Connected · ${gameCount} games · ${teamCount} teams loaded</span>`);
      lines.push(`<span style="color:var(--muted-l)">Last updated: ${rel}</span>`);
      if (ttlMins !== null) lines.push(`<span style="color:var(--muted-l)">Cache expires in: ${ttlMins} min</span>`);
    } else if (status === "stale") {
      lines.push(`<span style="color:var(--gold)">${error}</span>`);
      lines.push(`<span style="color:var(--muted-l)">${gameCount} games · ${teamCount} teams loaded from cache</span>`);
    } else if (status === "error") {
      if (errorType === "invalid_key") {
        lines.push(`<span style="color:var(--danger)">Invalid API key — get a fresh key at collegefootballdata.com and re-enter it below.</span>`);
      } else if (errorType === "rate_limit") {
        lines.push(`<span style="color:var(--danger)">Rate limited — will retry automatically in 60 seconds.</span>`);
      } else {
        lines.push(`<span style="color:var(--danger)">${error}</span>`);
      }
    } else if (status === "loading" || status === "refreshing") {
      lines.push(`<span style="color:var(--gold)">Fetching data...</span>`);
    } else {
      lines.push(`<span style="color:var(--muted-l)">Key saved — click Connect to sync</span>`);
    }

    el.innerHTML = lines.join("<br>");
  }

  function closeSettings() {
    const modal = document.getElementById("live-settings-modal");
    if (modal) modal.style.display = "none";
  }

  async function saveAndFetch() {
    const input    = document.getElementById("live-api-key-input");
    const statusEl = document.getElementById("live-key-status");
    const key      = input?.value?.trim();
    if (!key) {
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--danger)">Enter your API key first</span>`;
      return;
    }
    setKey(key);
    if (statusEl) statusEl.innerHTML = `<span style="color:var(--gold)">Connecting...</span>`;
    updateModalStatus();
    try {
      await fetchAll(key, true);
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--primary)">Connected! Refreshing...</span>`;
      updateModalStatus();
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      if (statusEl) { statusEl.innerHTML = '<span style="color:var(--danger)"></span>'; statusEl.firstChild.textContent = err.message; }
      updateModalStatus();
    }
  }

  function forceClear() {
    clearKey();
    localStorage.removeItem(CACHE_STORE);
    if (_autoRefreshInterval)   { clearInterval(_autoRefreshInterval);   _autoRefreshInterval   = null; }
    if (_relativeTimeInterval)  { clearInterval(_relativeTimeInterval);  _relativeTimeInterval  = null; }
    if (_rateLimitRetryTimer)   { clearTimeout(_rateLimitRetryTimer);    _rateLimitRetryTimer   = null; }
    if (_pregenRefreshInterval) { clearInterval(_pregenRefreshInterval); _pregenRefreshInterval = null; }
    if (_liveScoreInterval)     { clearInterval(_liveScoreInterval);     _liveScoreInterval     = null; }
    if (_oddsPollingInterval)   { clearInterval(_oddsPollingInterval);   _oddsPollingInterval   = null; }
    state = { status: "idle", apiKey: null, lastUpdated: null, error: null, errorType: null, loadProgress: 0 };
    window.__liveLastUpdated = null;
    window.__liveStats = null;
    updateBadge();
    const input = document.getElementById("live-api-key-input");
    if (input) input.value = "";
    const statusEl = document.getElementById("live-key-status");
    if (statusEl) statusEl.innerHTML = `<span style="color:var(--muted-l)">Cleared</span>`;
    updateModalStatus();
  }

  // ── Nav controls ─────────────────────────────────────────────
  function injectNavControls() {
    const navInner = document.querySelector(".nav-inner");
    if (!navInner || document.getElementById("live-nav-controls")) return;

    const wrap = document.createElement("div");
    wrap.id = "live-nav-controls";
    wrap.style.cssText = "display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0";
    wrap.innerHTML = `
      <div class="live-data-badge" onclick="LIVE.openSettings()" style="cursor:pointer"></div>
      <button class="live-data-icon" onclick="LIVE.openSettings()" title="Data settings"
        style="background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--muted-l);font-size:.9rem;cursor:pointer;padding:5px 9px;transition:all .15s;line-height:1"
        onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--muted-l)'">⚙</button>`;
    navInner.appendChild(wrap);
    updateBadge();
  }

  // ── Expose public refresh function ───────────────────────────
  window.__refreshLiveData = () => {
    const key = getKey();
    if (!key) return;
    localStorage.removeItem(CACHE_STORE);
    fetchAll(key, true).catch(e => console.warn("[LIVE] Manual refresh failed:", e.message));
  };

  // ── Auto-init ────────────────────────────────────────────────
  function init() {
    document.addEventListener("DOMContentLoaded", () => {
      injectNavControls();
      const key = getKey();
      if (key) {
        state.apiKey = key;
        fetchAll(key).catch(e => {
          console.warn("[LIVE] Auto-fetch failed:", e.message);
          // If the API completely failed and no pregen fired, fall back to static data
          if (!window.__liveDataReady) {
            window.__liveDataReady = true;
            window.dispatchEvent(new CustomEvent("liveDataReady", { detail: { _fromPregen: true, _static: true } }));
          }
        });
      } else {
        state.status = "no-key";
        state.errorType = "no_key";
        updateBadge();
        // Even without a CFBD key, start real-time supplements once pregen data is loaded
        window.addEventListener("liveDataReady", function _onFirstReady() {
          window.removeEventListener("liveDataReady", _onFirstReady);
          _startPregenRefresh();
          _startLiveScorePolling();
          _startOddsPolling();
        }, { once: true });
        // If pregen never fires liveDataReady (e.g. 0-game stub file), fire it from
        // static data after 2 s so game pages & home page always render.
        setTimeout(function() {
          if (!window.__liveDataReady) {
            console.log("[LIVE] No API key & no pregen — firing liveDataReady from static data");
            window.__liveDataReady = true;
            window.dispatchEvent(new CustomEvent("liveDataReady", { detail: { _fromPregen: true, _static: true } }));
          }
        }, 2000);
      }
    });
  }

  return { init, openSettings, closeSettings, saveAndFetch, forceClear, getStatus: () => state };
})();

LIVE.init();
