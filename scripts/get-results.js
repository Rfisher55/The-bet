/**
 * get-results.js
 * Pulls CFB scores from ESPN's public API, matches them to our picks,
 * and calculates ATS results. No API key needed.
 */

const https = require('https');
const path  = require('path');
const fs    = require('fs');

const RECORD_FILE = path.resolve(__dirname, '..', 'data', 'season-record.json');

// ── ESPN fetch ────────────────────────────────────────────────────
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TheBetCFB/1.0' } }, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        reject(new Error(`ESPN HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Bad JSON from ESPN')); }
      });
    }).on('error', reject);
  });
}

async function fetchESPNScores(week, year = 2026) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?week=${week}&seasontype=2&year=${year}`;
  const data = await fetchJSON(url);
  return (data.events || []).map(event => {
    try {
      const comp = event.competitions?.[0];
      if (!comp) return null;
      const home = comp.competitors?.find(c => c.homeAway === 'home');
      const away = comp.competitors?.find(c => c.homeAway === 'away');
      if (!home || !away) return null;
      return {
        espnId:    event.id,
        completed: comp.status?.type?.completed || false,
        homeTeam:  home.team?.displayName || '',
        awayTeam:  away.team?.displayName || '',
        homeScore: parseInt(home.score) || 0,
        awayScore: parseInt(away.score) || 0,
      };
    } catch { return null; }
  }).filter(g => g?.completed);
}

// ── Team name matching ────────────────────────────────────────────
// ESPN sometimes uses different names than our data (e.g. "Notre Dame Fighting Irish" vs "Notre Dame")
function normalize(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\bstate\b/g, 'st')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function teamsMatch(ourName, espnName) {
  const a = normalize(ourName);
  const b = normalize(espnName);
  return a === b || b.includes(a) || a.includes(b);
}

function findESPNGame(ourGame, espnGames) {
  return espnGames.find(eg =>
    (teamsMatch(ourGame.homeTeam, eg.homeTeam) && teamsMatch(ourGame.awayTeam, eg.awayTeam)) ||
    (teamsMatch(ourGame.homeTeam, eg.awayTeam) && teamsMatch(ourGame.awayTeam, eg.homeTeam)) // neutral site
  ) || null;
}

// ── ATS result calculator ─────────────────────────────────────────
// bl.spread is Vegas from home team's perspective: negative = home favored
// adjusted = homeScore - awayScore + bl.spread
// pickIsHome: WIN if adjusted > 0, PUSH if 0, LOSS if < 0
// pickIsAway: WIN if adjusted < 0, PUSH if 0, LOSS if > 0
function calcATS(homeScore, awayScore, vegasSpread, pickIsHome) {
  const margin   = homeScore - awayScore;
  const adjusted = margin + vegasSpread; // vegasSpread from home perspective

  if (adjusted === 0) return 'P';
  if (pickIsHome)  return adjusted > 0 ? 'W' : 'L';
  return adjusted < 0 ? 'W' : 'L';
}

// ── Load / save record ────────────────────────────────────────────
function loadRecord() {
  try { return JSON.parse(fs.readFileSync(RECORD_FILE, 'utf8')); }
  catch { return { season: 2026, record: { wins: 0, losses: 0, pushes: 0 }, picks: [] }; }
}

function saveRecord(record) {
  record.lastUpdated = new Date().toISOString();
  fs.writeFileSync(RECORD_FILE, JSON.stringify(record, null, 2));
}

// ── Main: fetch + match + update ──────────────────────────────────
async function updateResults(ourPicks) {
  const record = loadRecord();
  const existingIds = new Set(record.picks.map(p => p.gameId));

  // Group picks by week to minimize ESPN calls
  const byWeek = {};
  for (const pick of ourPicks) {
    if (!existingIds.has(pick.gameId) && pick.date < new Date().toISOString().slice(0, 10)) {
      (byWeek[pick.week] = byWeek[pick.week] || []).push(pick);
    }
  }

  const newResults = [];

  for (const [week, picks] of Object.entries(byWeek)) {
    let espnGames;
    try {
      espnGames = await fetchESPNScores(parseInt(week));
      console.log(`  ESPN Week ${week}: ${espnGames.length} completed games`);
    } catch (e) {
      console.warn(`  ESPN fetch failed for week ${week}:`, e.message);
      continue;
    }

    for (const pick of picks) {
      const eg = findESPNGame(pick, espnGames);
      if (!eg) {
        console.log(`  No match for ${pick.awayTeam} @ ${pick.homeTeam} — skipping`);
        continue;
      }

      const pickIsHome = pick.pickTeam.toLowerCase() === pick.homeTeam.toLowerCase();
      // vegasSpread here is bl.spread from home team's perspective
      const blSpread = pickIsHome ? pick.vegasSpread : -pick.vegasSpread;
      const result = calcATS(eg.homeScore, eg.awayScore, blSpread, pickIsHome);

      const entry = {
        gameId:    pick.gameId,
        week:      pick.week,
        date:      pick.date,
        matchup:   `${pick.awayAbbr} @ ${pick.homeAbbr}`,
        pickTeam:  pick.pickTeam,
        spread:    pick.vegasSpread,
        conf:      pick.conf,
        result,
        homeScore: eg.homeScore,
        awayScore: eg.awayScore,
      };

      record.picks.push(entry);
      newResults.push(entry);
      console.log(`  ${entry.matchup}: ${pick.pickTeam} → ${result} (${eg.awayScore}-${eg.homeScore})`);
    }
  }

  // Recalculate running record from all picks
  record.record = record.picks.reduce((acc, p) => {
    if (p.result === 'W') acc.wins++;
    else if (p.result === 'L') acc.losses++;
    else if (p.result === 'P') acc.pushes++;
    return acc;
  }, { wins: 0, losses: 0, pushes: 0 });

  saveRecord(record);
  return { record, newResults };
}

function getRecord() {
  return loadRecord();
}

module.exports = { updateResults, getRecord };
