/* ═══════════════════════════════════════════════════════════════
   THE BET — Live Data Layer v4
   Fetches ALL FBS teams + ALL 2026 games from CFBD + ESPN APIs.
   Key set via window.CFBD_DEFAULT_KEY in config.js (or user-entered).
   ═══════════════════════════════════════════════════════════════ */

const LIVE = (() => {
  const CFBD      = "https://api.collegefootballdata.com";
  const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/football/college-football";
  const SEASON    = 2026;
  const KEY_STORE   = "theBet_cfbdKey";
  const CACHE_STORE = "theBet_liveCache_v6";   // v6 = 200-game threshold + 2025 fallback
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
  };

  function schoolToId(school) {
    if (!school) return "unknown";
    return SCHOOL_TO_ID[school] ||
      school.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .trim();
  }

  let state = { status: "idle", apiKey: null, lastUpdated: null, error: null, errorType: null, loadProgress: 0 };

  // Intervals stored so we can clear them if needed
  let _autoRefreshInterval  = null;
  let _relativeTimeInterval = null;
  let _rateLimitRetryTimer  = null;

  const ENDPOINT_COUNT = 12; // 9 CFBD + 1 ESPN + 2 potential 2025 fallback calls

  function getKey() { return localStorage.getItem(KEY_STORE) || window.CFBD_DEFAULT_KEY || null; }
  function setKey(k) { if (k) localStorage.setItem(KEY_STORE, k.trim()); else localStorage.removeItem(KEY_STORE); }
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
    const homeSchool = home.team.location || home.team.displayName || "";
    const awaySchool = away.team.location || away.team.displayName || "";

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

      // Launch ESPN fetch immediately — no API key needed, runs in parallel with CFBD
      const espnPromise = fetchESPNSchedule(SEASON).catch(() => []);

      const endpointPromises = [
        api("/teams/fbs",                                                        apiKey).then(v => { onEndpointDone(); return v; }),
        api(`/games?year=${SEASON}&seasonType=regular&classification=fbs`,       apiKey).then(v => { onEndpointDone(); return v; }),
        api(`/games?year=${SEASON}&seasonType=postseason&classification=fbs`,    apiKey).then(v => { onEndpointDone(); return v; }),
        api(`/ratings/sp?year=${SEASON}`,                                        apiKey).then(v => { onEndpointDone(); return v; }),
        api("/ratings/sp?year=2025",                                             apiKey).then(v => { onEndpointDone(); return v; }),
        api(`/talent?year=${SEASON}`,                                            apiKey).then(v => { onEndpointDone(); return v; }),
        api(`/coaches?year=${SEASON}`,                                           apiKey).then(v => { onEndpointDone(); return v; }),
        api(`/recruiting/teams?year=${SEASON}`,                                  apiKey).then(v => { onEndpointDone(); return v; }),
        api(`/lines?year=${SEASON}`,                                             apiKey).then(v => { onEndpointDone(); return v; }),
      ];

      // All primary data fetched in parallel — failures are caught individually
      const [teamsRes, regularRes, postRes, spRes, sp25Res, talentRes,
             coachesRes, recruitRes, linesRes] =
        await Promise.allSettled(endpointPromises);

      // Merge SP+ 2026 (preferred) with 2025 fallback
      const sp26  = spRes.status     === "fulfilled" ? (spRes.value   || []) : [];
      const sp25  = sp25Res.status   === "fulfilled" ? (sp25Res.value || []) : [];
      const spMerged = sp26.length > 0 ? sp26 : sp25;

      const games2026 = [
        ...(regularRes.status === "fulfilled" ? (regularRes.value || []) : []),
        ...(postRes.status    === "fulfilled" ? (postRes.value    || []) : []),
      ];

      // ESPN results (ran in parallel with CFBD calls above)
      const espnEvents = await espnPromise;
      onEndpointDone();
      const espnGames = espnEvents.map(e => mapESPNGame(e)).filter(Boolean);
      console.log(`[LIVE] ESPN: ${espnGames.length} events | CFBD ${SEASON}: ${games2026.length} games`);

      // Prefer ESPN when it has full season coverage (200+ = meaningful schedule)
      let gamesFromApi;
      if (espnGames.length >= 200) {
        gamesFromApi = espnGames;
        console.log(`[LIVE] Using ESPN as primary schedule (${espnGames.length} games)`);
      } else if (games2026.length >= 200) {
        gamesFromApi = games2026;
        console.log(`[LIVE] Using CFBD as primary schedule (${games2026.length} games)`);
      } else {
        // 2026 schedule not fully released — supplement with 2025 completed season data
        console.log(`[LIVE] 2026 thin (ESPN: ${espnGames.length}, CFBD: ${games2026.length}) — fetching 2025 season`);
        const [reg25, post25] = await Promise.allSettled([
          api("/games?year=2025&seasonType=regular&classification=fbs",    apiKey),
          api("/games?year=2025&seasonType=postseason&classification=fbs", apiKey),
        ]);
        const games2025 = [
          ...(reg25.status  === "fulfilled" ? (reg25.value  || []) : []),
          ...(post25.status === "fulfilled" ? (post25.value || []) : []),
        ];
        // ESPN + CFBD 2026 games first (deduplicate against static), then 2025 season
        gamesFromApi = [...espnGames, ...games2026, ...games2025];
        console.log(`[LIVE] Combined: ${gamesFromApi.length} total games`);
      }

      const payload = {
        fbsTeams:   teamsRes.status   === "fulfilled" ? (teamsRes.value   || []) : [],
        games:      gamesFromApi,
        spRatings:  spMerged,
        talent:     talentRes.status  === "fulfilled" ? (talentRes.value  || []) : [],
        coaches:    coachesRes.status === "fulfilled" ? (coachesRes.value || []) : [],
        recruiting: recruitRes.status === "fulfilled" ? (recruitRes.value || []) : [],
        lines:      linesRes.status   === "fulfilled" ? (linesRes.value   || []) : [],
        fetchedAt:  new Date().toISOString(),
      };

      console.log(`[LIVE] Fetched: ${payload.fbsTeams.length} teams, ${payload.games.length} games, ` +
                  `${payload.spRatings.length} SP+ ratings, ${payload.lines.length} line entries`);

      saveCache(payload);
      applyData(payload);
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
        if (stale && stale._stale) {
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
      // Signal badge that a refresh is in progress
      state = { ...state, status: "refreshing" };
      updateBadge();
      localStorage.removeItem(CACHE_STORE);
      fetchAll(key, true).catch(e => console.warn("[LIVE] Auto-refresh failed:", e.message));
    }, 5 * 60 * 1000);
  }

  // ── Update relative-time badge text every 30 s ───────────────
  function _startRelativeTimeInterval() {
    if (_relativeTimeInterval) return;
    _relativeTimeInterval = setInterval(() => {
      if (state.status === "live" || state.status === "stale") updateBadge();
    }, 30 * 1000);
  }

  // ── Apply fetched data to TEAMS + GAMES ─────────────────────
  function applyData(data) {
    // Build lookup maps
    const spMap = {};
    (data.spRatings || []).forEach(r => { if (r.team) spMap[r.team] = r; });

    const talentMap = {};
    (data.talent || []).forEach(t => { if (t.school) talentMap[t.school] = t.talent; });

    const coachMap = {};
    (data.coaches || []).forEach(c => {
      if (!Array.isArray(c.schools) || !c.schools.length) return;
      const cur = c.schools.find(s => s.year === SEASON) ||
                  c.schools.sort((a, b) => b.year - a.year)[0];
      if (cur?.school) coachMap[cur.school] = `${c.firstName} ${c.lastName}`;
    });

    const recruitMap = {};
    (data.recruiting || []).forEach(r => { if (r.team) recruitMap[r.team] = r.rank; });

    // Index betting lines by CFBD game ID (for CFBD-sourced games)
    // and by week+matchup key (for ESPN-sourced games that lack CFBD IDs)
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
      const lineEntry = {
        spread,
        total:         parseFloat(best.overUnder)     || 50,
        moneylineHome: best.homeMoneyline ? parseInt(best.homeMoneyline) : undefined,
        moneylineAway: best.awayMoneyline ? parseInt(best.awayMoneyline) : undefined,
      };
      linesMap[g.id] = lineEntry;
      // Secondary lookup by matchup for ESPN games
      if (g.home_team && g.away_team) {
        const mk = `${g.week}|${schoolToId(g.home_team)}|${schoolToId(g.away_team)}`;
        linesByMatchup[mk] = lineEntry;
      }
    });

    // ── 1. Inject / update teams ─────────────────────────────
    (data.fbsTeams || []).forEach(t => {
      if (!t.school) return;
      const id       = schoolToId(t.school);
      const sp       = spMap[t.school] || {};
      const spOverall = sp.rating || 0;
      const spRank   = sp.ranking || 80;
      const talent   = talentMap[t.school] || 850;
      const recruitRk = recruitMap[t.school] || spRank;
      const coach    = coachMap[t.school] || "Unknown";

      const derivedRating = Math.min(99, Math.max(35, Math.round(70 + spOverall)));
      const derivedStats  = spToStats(spOverall);

      // Normalize color string
      const fixColor = c => c ? (c.startsWith("#") ? c : "#" + c) : null;
      const color    = fixColor(t.color)     || "#1a1a2e";
      const altColor = fixColor(t.alt_color) || "#444444";

      if (window.TEAMS && TEAMS[id]) {
        // Update existing curated team with live SP+ and coach data
        const ex = TEAMS[id];
        ex.spRating  = spOverall;
        ex.spRank    = spRank;
        // Only overwrite coach if it wasn't manually set in data.js
        if (!ex.coachName || ex.coachName === "Unknown") ex.coachName = coach;
        // Blend stats: for curated teams keep their manually set stats,
        // but patch any missing fields with SP+-derived values
        if (ex.stats) {
          const s = ex.stats;
          if (!s.pointsPerGame)        s.pointsPerGame        = derivedStats.pointsPerGame;
          if (!s.pointsAllowedPerGame) s.pointsAllowedPerGame = derivedStats.pointsAllowedPerGame;
        } else {
          ex.stats = derivedStats;
        }
        // Update rating if SP+ data is significantly different (trust SP+)
        if (Math.abs(spOverall) > 1) {
          ex.rating          = derivedRating;
          ex.offensiveRating = Math.min(99, Math.max(35, Math.round(70 + spOverall * 0.9)));
          ex.defensiveRating = Math.min(99, Math.max(35, Math.round(70 + spOverall * 0.9)));
        }
        ex.recruitingRank = recruitRk;
      } else if (window.TEAMS) {
        // Add new stub team for every other FBS program
        TEAMS[id] = {
          id,
          name:           t.school,
          abbreviation:   t.abbreviation || id.toUpperCase().slice(0, 4),
          mascot:         t.mascot || "",
          conference:     t.conference || "Independent",
          color,
          altColor,
          wins: 0, losses: 0, lastSeasonRecord: "2025",
          rating:          derivedRating,
          offensiveRating: Math.min(99, Math.max(35, Math.round(70 + spOverall * 0.9))),
          defensiveRating: Math.min(99, Math.max(35, Math.round(70 + spOverall * 0.9))),
          spRating:        spOverall,
          spRank,
          recruitingRank:  recruitRk,
          coachName:       coach,
          coachRecord:     "0-0",
          stats:           derivedStats,
          // Minimum required fields so predictor never crashes
          atsRecord:       null,
          situational:     {},
          programHealth:   { nilStrength: 50, transferPortalRating: 50, coachHotSeat: 3,
                             programMomentum: "stable", fanMorale: 60,
                             lockerRoomCohesion: 65, depthChartStability: 65 },
          weatherProfile:  { isDome: false, coldWeatherAdvantage: 5 },
          schedule:        { daysSinceLastGame: 7, isComingOffBigWin: false,
                             isComingOffBigLoss: false, hasLookaheadGame: false,
                             consecutiveRoadGames: 0, travelBurdenRating: 4 },
          coachingProfile: {},
          fromLive: true,
        };
      }
    });

    // ── 2. Inject all games ──────────────────────────────────
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
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--danger)">${err.message}</span>`;
      updateModalStatus();
    }
  }

  function forceClear() {
    clearKey();
    localStorage.removeItem(CACHE_STORE);
    if (_autoRefreshInterval)  { clearInterval(_autoRefreshInterval);  _autoRefreshInterval  = null; }
    if (_relativeTimeInterval) { clearInterval(_relativeTimeInterval); _relativeTimeInterval = null; }
    if (_rateLimitRetryTimer)  { clearTimeout(_rateLimitRetryTimer);   _rateLimitRetryTimer  = null; }
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
          // Badge and state already set inside fetchAll's catch block
        });
      } else {
        state.status = "no-key";
        state.errorType = "no_key";
        updateBadge();
      }
    });
  }

  return { init, openSettings, closeSettings, saveAndFetch, forceClear, getStatus: () => state };
})();

LIVE.init();
