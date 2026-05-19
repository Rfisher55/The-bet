/* ═══════════════════════════════════════════════════════════════
   THE BET — Live Data Layer
   Connects to College Football Data API (collegefootballdata.com)
   Free API key required — stores in localStorage, never sent to server.

   WHAT THIS DOES:
   1. Fetches live 2026 schedules for all tracked teams
   2. Adds new announced games to the GAMES array
   3. Fetches current rosters and updates player data
   4. Shows a LIVE badge when connected; STATIC when using built-in data
   ═══════════════════════════════════════════════════════════════ */

const LIVE = (() => {
  const CFBD = "https://api.collegefootballdata.com";
  const SEASON = 2026;
  const KEY_STORE = "theBet_cfbdKey";
  const CACHE_STORE = "theBet_liveCache";
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

  // Map CFBD team names → our internal IDs
  const NAME_TO_ID = {
    "LSU": "lsu", "Georgia": "georgia", "Alabama": "alabama",
    "Texas": "texas", "Notre Dame": "notre_dame", "Penn State": "penn_state",
    "Michigan": "michigan", "Clemson": "clemson", "Ohio State": "ohio_state",
    "Oregon": "oregon", "Tennessee": "tennessee", "Miami": "miami",
    "Auburn": "auburn", "Florida": "florida", "Florida State": "florida_state",
    "Wisconsin": "wisconsin",
  };
  const ID_TO_CFBD = Object.fromEntries(Object.entries(NAME_TO_ID).map(([k,v]) => [v,k]));
  const TRACKED = Object.keys(ID_TO_CFBD);

  let state = { status: "idle", apiKey: null, lastUpdated: null, error: null };

  // ── API key management ──────────────────────────────────
  // Set window.CFBD_DEFAULT_KEY in a <script> before live.js to embed a key for all visitors
  function getKey() { return localStorage.getItem(KEY_STORE) || window.CFBD_DEFAULT_KEY || null; }
  function setKey(k) { if (k) localStorage.setItem(KEY_STORE, k.trim()); else localStorage.removeItem(KEY_STORE); }
  function clearKey() { localStorage.removeItem(KEY_STORE); }

  // ── Fetch helper ────────────────────────────────────────
  async function api(endpoint, apiKey) {
    const r = await fetch(`${CFBD}${endpoint}`, {
      headers: { "Authorization": `Bearer ${apiKey}`, "Accept": "application/json" }
    });
    if (!r.ok) {
      if (r.status === 401) throw new Error("Invalid API key — check your CFBD key at collegefootballdata.com");
      if (r.status === 429) throw new Error("Rate limit hit — try again in a few minutes");
      throw new Error(`CFBD API error ${r.status}`);
    }
    return r.json();
  }

  // ── Cache helpers ───────────────────────────────────────
  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_STORE);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (Date.now() - c.ts > CACHE_TTL) { localStorage.removeItem(CACHE_STORE); return null; }
      return c.data;
    } catch { return null; }
  }
  function saveCache(data) {
    try { localStorage.setItem(CACHE_STORE, JSON.stringify({ ts: Date.now(), data })); } catch {}
  }

  // ── Convert CFBD game → our game stub ──────────────────
  function cfbdGameToStub(g) {
    const homeId = NAME_TO_ID[g.home_team];
    const awayId = NAME_TO_ID[g.away_team];
    if (!homeId || !awayId) return null;
    // Skip if already in GAMES
    if (window.GAMES && GAMES.some(x => x.id === "cfbd_" + g.id)) return null;
    const date = g.start_date ? g.start_date.slice(0, 10) : "2026-09-01";
    const time = g.start_time_tbd ? "TBD" : (g.start_date ? new Date(g.start_date).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:"America/New_York"})+' ET' : "TBD");
    return {
      id: "cfbd_" + g.id,
      week: g.week || 1,
      date,
      time,
      homeTeamId: homeId,
      awayTeamId: awayId,
      venue: g.venue || "TBD",
      network: g.broadcast || "TBD",
      isConferenceGame: g.conference_game || false,
      isRivalryGame: false,
      weather: { condition: "Clear", tempF: 72, windMph: 8, humidity: 55, indoors: false },
      bettingLines: { spread: 0, moneylineHome: -110, moneylineAway: -110, total: 52.5 },
      xFactors: [],
      gamePreview: {
        headline: `${g.away_team} @ ${g.home_team} — Week ${g.week||1}`,
        synopsis: "Live schedule data from CFBD. Full analysis will be generated as game approaches.",
        analysis: [],
        thePick: { team: "", line: "", confidence: "LOW", unit: 1, reasoning: "Awaiting analysis." }
      },
      socialIntel: {
        lineMovement: [],
        publicBetting: { homePct: 50, awayPct: 50, overPct: 50, underPct: 50 },
        beatWriter: []
      },
      _liveSource: true,
    };
  }

  // ── Convert CFBD roster player → KEY_PLAYERS entry ──────
  function cfbdPlayerToEntry(p, teamId) {
    if (!p.name || !p.position) return null;
    const posMap = { QB:1, RB:2, WR:3, TE:4, OL:5, DL:6, LB:7, DB:8, K:9, P:10 };
    const pos = p.position.toUpperCase();
    if (!posMap[pos]) return null;
    return {
      id: `cfbd_${teamId}_${p.id || p.name.replace(/\s/g,"_")}`,
      teamId,
      name: p.name,
      position: pos,
      jersey: p.jersey || "—",
      year: p.year || "Jr.",
      height: p.height ? `${Math.floor(p.height/12)}'${p.height%12}"` : "",
      weight: p.weight ? `${p.weight} lbs` : "",
      hometown: p.hometown || "",
      recruitingStars: p.recruit_ids ? 3 : null,
      injuryStatus: "Healthy",
      rating: 7.0,
      stats: {},
      performanceMetrics: { bigGameRating: 6, clutchRating: 6, coldWeatherRating: 6 },
      personalFlags: {},
      _liveSource: true,
    };
  }

  // ── Inject live players into KEY_PLAYERS ────────────────
  function injectPlayers(liveRosters) {
    if (!window.KEY_PLAYERS || !Array.isArray(KEY_PLAYERS)) return;
    let added = 0;
    for (const [teamId, players] of Object.entries(liveRosters)) {
      // Remove old live entries for this team
      const len = KEY_PLAYERS.length;
      KEY_PLAYERS.splice(0, KEY_PLAYERS.length, ...KEY_PLAYERS.filter(p => !(p._liveSource && p.teamId === teamId)));
      // Add new ones (skip duplicates by name)
      const existingNames = new Set(KEY_PLAYERS.filter(p => p.teamId === teamId).map(p => p.name));
      for (const p of players) {
        if (p && !existingNames.has(p.name)) {
          KEY_PLAYERS.push(p);
          added++;
        }
      }
    }
    return added;
  }

  // ── Inject live games into GAMES ────────────────────────
  function injectGames(liveGames) {
    if (!window.GAMES || !Array.isArray(GAMES)) return 0;
    // Remove stale live games
    GAMES.splice(0, GAMES.length, ...GAMES.filter(g => !g._liveSource));
    let added = 0;
    for (const g of liveGames) {
      if (g) { GAMES.push(g); added++; }
    }
    return added;
  }

  // ── Main fetch ──────────────────────────────────────────
  async function fetchAll(apiKey, force = false) {
    state = { ...state, status: "loading", error: null };
    updateBadge();

    if (!force) {
      const cached = loadCache();
      if (cached) {
        applyData(cached);
        state = { ...state, status: "live", lastUpdated: cached.fetchedAt };
        updateBadge();
        return;
      }
    }

    try {
      // Fetch all 2026 games involving our tracked teams
      const allGames = await api(`/games?year=${SEASON}&seasonType=regular`, apiKey);
      const liveGameStubs = allGames
        .filter(g => NAME_TO_ID[g.home_team] && NAME_TO_ID[g.away_team])
        .map(cfbdGameToStub)
        .filter(Boolean);

      // Fetch rosters for stub teams (ones with no KEY_PLAYERS)
      const stubTeamIds = ["auburn", "florida", "florida_state", "wisconsin"];
      const liveRosters = {};
      for (const teamId of stubTeamIds) {
        try {
          const cfbdName = ID_TO_CFBD[teamId];
          if (!cfbdName) continue;
          const roster = await api(`/roster?team=${encodeURIComponent(cfbdName)}&year=${SEASON}`, apiKey);
          if (Array.isArray(roster) && roster.length) {
            liveRosters[teamId] = roster
              .filter(p => ["QB","RB","WR","TE","OL","DL","LB","DB"].includes((p.position||"").toUpperCase()))
              .slice(0, 22)
              .map(p => cfbdPlayerToEntry(p, teamId))
              .filter(Boolean);
          }
        } catch (e) {
          console.warn(`Roster fetch failed for ${teamId}:`, e.message);
        }
      }

      // Fetch betting lines for tracked games
      const lineUpdates = {};
      try {
        const lines = await api(`/lines?year=${SEASON}`, apiKey);
        for (const line of lines) {
          if (line.lines && line.lines.length) {
            const best = line.lines.find(l => l.provider === "consensus") || line.lines[0];
            if (best) lineUpdates["cfbd_" + line.id] = {
              spread: parseFloat(best.spread) || 0,
              moneylineHome: parseInt(best.formattedSpread) || -110,
              moneylineAway: parseInt(best.awayMoneyline) || -110,
              total: parseFloat(best.overUnder) || 52.5,
            };
          }
        }
      } catch (e) {
        console.warn("Lines fetch failed:", e.message);
      }

      // Apply line data to stubs
      for (const stub of liveGameStubs) {
        if (lineUpdates[stub.id]) stub.bettingLines = lineUpdates[stub.id];
      }

      const payload = { liveGameStubs, liveRosters, lineUpdates, fetchedAt: new Date().toISOString() };
      saveCache(payload);
      applyData(payload);
      state = { ...state, status: "live", lastUpdated: payload.fetchedAt, apiKey };
      updateBadge();
      // Notify pages to re-render
      window.dispatchEvent(new CustomEvent("liveDataReady", { detail: payload }));

    } catch (err) {
      state = { ...state, status: "error", error: err.message };
      updateBadge();
      throw err;
    }
  }

  function applyData(data) {
    if (data.liveGameStubs?.length) {
      const added = injectGames(data.liveGameStubs);
      console.log(`[LIVE] Injected ${added} games from CFBD`);
    }
    if (data.liveRosters && Object.keys(data.liveRosters).length) {
      const added = injectPlayers(data.liveRosters);
      console.log(`[LIVE] Injected ${added} players from CFBD`);
    }
  }

  // ── Badge / UI ─────────────────────────────────────────
  function updateBadge() {
    const badges = document.querySelectorAll(".live-data-badge");
    const icon = document.querySelectorAll(".live-data-icon");
    const { status, lastUpdated, error } = state;
    const html = status === "live"
      ? `<span class="live-badge live-badge-on" title="Connected to CFBD — ${lastUpdated ? 'Updated: ' + new Date(lastUpdated).toLocaleString() : 'fresh data'}">⚡ LIVE</span>`
      : status === "loading"
      ? `<span class="live-badge live-badge-loading">⏳ Loading...</span>`
      : status === "error"
      ? `<span class="live-badge live-badge-err" title="${error || 'Error'}">⚠ Error</span>`
      : `<span class="live-badge live-badge-off" title="Connect API key for live schedule & roster updates">📋 Static</span>`;
    badges.forEach(b => { b.innerHTML = html; });

    // Update gear button tooltip
    icon.forEach(i => {
      i.title = status === "live"
        ? `Live data active — updated ${lastUpdated ? new Date(lastUpdated).toLocaleString() : "now"}`
        : "Connect CFBD API for live schedules & rosters";
    });
  }

  // ── Settings modal ─────────────────────────────────────
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
              <div style="font-size:.72rem;color:var(--muted-l);margin-top:2px">College Football Data API</div>
            </div>
            <button class="live-modal-close" onclick="LIVE.closeSettings()">✕</button>
          </div>

          <div style="font-size:.82rem;color:var(--text-soft);line-height:1.6;margin-bottom:16px">
            Connect a free API key to get <strong style="color:var(--primary)">live 2026 schedules</strong>,
            current rosters, and real-time betting lines — updated every 6 hours.
          </div>

          <div style="padding:12px 16px;border-radius:10px;background:rgba(16,185,129,.07);border:1px solid rgba(16,185,129,.2);margin-bottom:16px">
            <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--primary);margin-bottom:6px">How to get a free API key</div>
            <ol style="font-size:.78rem;color:var(--text-soft);line-height:1.8;margin-left:14px">
              <li>Go to <strong style="color:var(--text)">collegefootballdata.com</strong></li>
              <li>Create a free account (takes 30 seconds)</li>
              <li>Copy your API key from your profile</li>
              <li>Paste it below — it's stored only on your device</li>
            </ol>
          </div>

          <div style="margin-bottom:12px">
            <div style="font-size:.7rem;font-weight:700;color:var(--muted-l);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">Your CFBD API Key</div>
            <div style="position:relative">
              <input id="live-api-key-input" type="text"
                style="width:100%;padding:10px 42px 10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:.82rem;outline:none;font-family:monospace;box-sizing:border-box"
                placeholder="Paste your API key here..." autocomplete="off" autocorrect="off" spellcheck="false" />
              <button onclick="(function(){var i=document.getElementById('live-api-key-input');i.type=i.type==='text'?'password':'text';this.textContent=i.type==='text'?'🙈':'👁';}).call(this)"
                style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:1rem;cursor:pointer;padding:4px;opacity:.6" title="Show/hide key">👁</button>
            </div>
            <div id="live-key-status" style="font-size:.72rem;margin-top:6px;min-height:18px"></div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button onclick="LIVE.saveAndFetch()" style="flex:1;padding:11px;border-radius:10px;background:var(--primary);color:#fff;font-weight:800;font-size:.9rem;border:none;cursor:pointer">
              ⚡ Connect & Sync
            </button>
            <button onclick="LIVE.forceClear()" style="padding:11px 16px;border-radius:10px;background:var(--surface);color:var(--muted-l);font-weight:700;font-size:.85rem;border:1px solid var(--border);cursor:pointer">
              Clear Key
            </button>
          </div>

          <div style="margin-top:14px;padding:10px 14px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
            <div id="live-current-status" style="font-size:.75rem;color:var(--muted-l)">Status: checking...</div>
          </div>
        </div>`;
      document.body.appendChild(modal);

      // Add styles
      if (!document.getElementById("live-modal-css")) {
        const s = document.createElement("style");
        s.id = "live-modal-css";
        s.textContent = `
          #live-settings-modal { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px; }
          .live-modal-overlay { position:absolute;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px); }
          .live-modal-box { position:relative;background:var(--card);border:1px solid var(--border-l);border-radius:20px;padding:24px;width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.6); }
          .live-modal-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px; }
          .live-modal-close { background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--muted-l);font-size:.9rem;cursor:pointer;padding:4px 10px;transition:all .15s; }
          .live-modal-close:hover { color:var(--text);border-color:var(--border-l); }
          .live-badge { display:inline-flex;align-items:center;gap:4px;font-size:.58rem;font-weight:900;letter-spacing:1px;padding:2px 8px;border-radius:8px;border:1px solid;cursor:pointer;transition:all .15s; }
          .live-badge-on  { background:rgba(16,185,129,.15);border-color:rgba(16,185,129,.4);color:var(--primary); }
          .live-badge-off { background:rgba(139,157,187,.1);border-color:rgba(139,157,187,.3);color:var(--muted-l); }
          .live-badge-loading { background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3);color:var(--gold); }
          .live-badge-err { background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.3);color:var(--danger); }
          #live-api-key-input:focus { border-color:var(--primary); }
        `;
        document.head.appendChild(s);
      }
    }
    modal.style.display = "flex";

    // Populate current key (masked)
    const key = getKey();
    const input = document.getElementById("live-api-key-input");
    if (key && input) input.value = key;

    // Show current status
    updateModalStatus();
  }

  function updateModalStatus() {
    const el = document.getElementById("live-current-status");
    if (!el) return;
    const { status, lastUpdated, error } = state;
    const key = getKey();
    if (!key) {
      el.innerHTML = `<span style="color:var(--muted-l)">No API key set — using static data only</span>`;
    } else if (status === "live") {
      el.innerHTML = `<span style="color:var(--primary)">✓ Connected · Last updated: ${lastUpdated ? new Date(lastUpdated).toLocaleString() : "now"}</span>`;
    } else if (status === "error") {
      el.innerHTML = `<span style="color:var(--danger)">✗ Error: ${error}</span>`;
    } else if (status === "loading") {
      el.innerHTML = `<span style="color:var(--gold)">⏳ Fetching live data...</span>`;
    } else {
      el.innerHTML = `<span style="color:var(--muted-l)">API key set — click Connect to sync</span>`;
    }
  }

  function closeSettings() {
    const modal = document.getElementById("live-settings-modal");
    if (modal) modal.style.display = "none";
  }

  async function saveAndFetch() {
    const input = document.getElementById("live-api-key-input");
    const statusEl = document.getElementById("live-key-status");
    const key = input?.value?.trim();
    if (!key) {
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--danger)">Enter your API key first</span>`;
      return;
    }
    setKey(key);
    if (statusEl) statusEl.innerHTML = `<span style="color:var(--gold)">Connecting...</span>`;
    try {
      await fetchAll(key, true);
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--primary)">✓ Connected! Reloading data...</span>`;
      updateModalStatus();
      setTimeout(() => { window.location.reload(); }, 1200);
    } catch (err) {
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--danger)">${err.message}</span>`;
      updateModalStatus();
    }
  }

  function forceClear() {
    clearKey();
    localStorage.removeItem(CACHE_STORE);
    state = { status: "idle", apiKey: null, lastUpdated: null, error: null };
    updateBadge();
    const input = document.getElementById("live-api-key-input");
    if (input) input.value = "";
    const statusEl = document.getElementById("live-key-status");
    if (statusEl) statusEl.innerHTML = `<span style="color:var(--muted-l)">Cleared — using static data</span>`;
    updateModalStatus();
  }

  // ── Auto-init ───────────────────────────────────────────
  function init() {
    // Inject gear button and badge into nav
    document.addEventListener("DOMContentLoaded", () => {
      injectNavControls();
      const key = getKey();
      if (key) {
        state.apiKey = key;
        fetchAll(key).catch(e => console.warn("[LIVE] Auto-fetch failed:", e.message));
      } else {
        state.status = "no-key";
        updateBadge();
      }
    });
  }

  function injectNavControls() {
    const navInner = document.querySelector(".nav-inner");
    if (!navInner) return;

    // Don't double-inject
    if (document.getElementById("live-nav-controls")) return;

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

  return { init, openSettings, closeSettings, saveAndFetch, forceClear, getStatus: () => state };
})();

LIVE.init();
