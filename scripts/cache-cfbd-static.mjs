#!/usr/bin/env node
/**
 * cache-cfbd-static.mjs — one-shot fetch of static prior-season CFBD data
 *
 * Run once at the end of each season (or via the cache-cfbd-static GitHub Actions
 * workflow). Writes data/cfbd-cache-2025.json so daily refreshes don't need to
 * re-fetch data that never changes:
 *
 *   Prior year saved: SP+, ELO, coaches, betting lines, game results, recruiting
 *   (2024 + 2025 classes)
 *
 * Without this cache, every 4-hour refresh makes ~13 CFBD calls for 2025 data
 * that hasn't changed since December.  With the cache those calls drop to 0.
 *
 * Expected quota cost to build cache: 7 CFBD calls (one-time per year).
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, "..", "data");
const CACHE_YEAR = 2025;
const CFBD_BASE  = "https://api.collegefootballdata.com";

const CFBD_KEY = process.env.CFBD_API_KEY;
if (!CFBD_KEY) { console.error("❌ CFBD_API_KEY not set"); process.exit(1); }

// Serialized queue + retries — same pattern as fetch-live-data.mjs
let _queue = Promise.resolve();
const SPACING_MS = 500;
const RETRIES_MS = [3000, 8000, 20000];

function cfbdFetch(endpoint) {
  const run = _queue.then(() => _fetchRaw(endpoint));
  _queue = run.then(
    () => new Promise(r => setTimeout(r, SPACING_MS)),
    () => new Promise(r => setTimeout(r, SPACING_MS)),
  );
  return run;
}

async function _fetchRaw(endpoint, attempt = 0) {
  try {
    const r = await fetch(`${CFBD_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${CFBD_KEY}` },
      signal: AbortSignal.timeout(20000),
    });
    if (r.status === 401 || r.status === 403) {
      const body = await r.text().catch(() => "");
      console.error(`❌ CFBD auth error ${r.status}: ${body.slice(0, 120)}`);
      process.exit(1);
    }
    if (r.status === 429) {
      if (attempt < RETRIES_MS.length) {
        const wait = RETRIES_MS[attempt];
        console.warn(`  429: ${endpoint} — retrying in ${wait / 1000}s (${attempt + 1}/${RETRIES_MS.length})`);
        await new Promise(r => setTimeout(r, wait));
        return _fetchRaw(endpoint, attempt + 1);
      }
      console.error(`  ❌ Exhausted retries on ${endpoint} — quota may be exhausted, try again later`);
      return null;
    }
    if (!r.ok) { console.warn(`  CFBD ${r.status}: ${endpoint}`); return null; }
    const data = await r.json();
    console.log(`  ✓ ${endpoint} — ${Array.isArray(data) ? data.length + " items" : "ok"}`);
    return data;
  } catch (e) {
    console.warn(`  CFBD fail: ${endpoint} — ${e.message}`);
    return null;
  }
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const start = Date.now();
  console.log(`\n[cache-cfbd-static] Caching ${CACHE_YEAR} static data — ${new Date().toUTCString()}`);
  console.log("These 7 endpoints never change after season end.  Run once per year.\n");

  // All 7 endpoints are truly static after the prior season ends.
  // They run through the serialized queue, so they're sequential (one per 500ms).
  const [sp, elo, coaches, lines, games, rec2025, rec2024] = await Promise.all([
    cfbdFetch(`/ratings/sp?year=${CACHE_YEAR}`),
    cfbdFetch(`/ratings/elo?year=${CACHE_YEAR}`),
    cfbdFetch(`/coaches?year=${CACHE_YEAR}`),
    cfbdFetch(`/lines?year=${CACHE_YEAR}`),
    cfbdFetch(`/games?year=${CACHE_YEAR}&seasonType=regular&classification=fbs`),
    cfbdFetch(`/recruiting/teams?year=${CACHE_YEAR}`),
    cfbdFetch(`/recruiting/teams?year=2024`),
  ]);

  const nullEndpoints = [
    !sp     && "/ratings/sp",
    !elo    && "/ratings/elo",
    !coaches && "/coaches",
    !lines  && "/lines",
    !games  && "/games",
    !rec2025 && "/recruiting/teams?year=2025",
    !rec2024 && "/recruiting/teams?year=2024",
  ].filter(Boolean);

  if (nullEndpoints.length >= 5) {
    console.error(`\n❌ Most endpoints returned null — CFBD quota likely exhausted.`);
    console.error("   Wait for quota reset (typically 1st of month) and re-run.");
    process.exit(1);
  }

  const cache = {
    generated:   new Date().toISOString(),
    cacheYear:   CACHE_YEAR,
    sp:          sp       || [],
    elo:         elo      || [],
    coaches:     coaches  || [],
    lines:       lines    || [],
    games:       games    || [],
    recruiting: {
      "2025": rec2025 || [],
      "2024": rec2024 || [],
    },
  };

  const outPath = join(DATA_DIR, `cfbd-cache-${CACHE_YEAR}.json`);
  writeFileSync(outPath, JSON.stringify(cache, null, 2));

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Written: data/cfbd-cache-${CACHE_YEAR}.json  (${elapsed}s)`);
  console.log(`   SP+ ratings:  ${cache.sp.length} teams`);
  console.log(`   ELO ratings:  ${cache.elo.length} entries`);
  console.log(`   Coaches:      ${cache.coaches.length} coaches`);
  console.log(`   Lines:        ${cache.lines.length} games`);
  console.log(`   Games:        ${cache.games.length} game results`);
  console.log(`   Recruiting:   ${CACHE_YEAR}=${cache.recruiting["2025"].length}  2024=${cache.recruiting["2024"].length}`);
  if (nullEndpoints.length) console.warn(`   ⚠️  Null endpoints: ${nullEndpoints.join(", ")}`);
  console.log(`\n   Daily refresh will now skip these 7 endpoints — ~3,500 fewer API calls/month.`);
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
