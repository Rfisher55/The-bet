# The Bet — Project Rules for Claude

## Core Design Principle: Everything Is Live

**Nothing is hardcoded unless absolutely necessary. All data is in constant motion.**

Every piece of data on this site — coaches, records, stats, spreads, rosters, injuries,
rankings, schedules, weather — changes constantly and must come from live sources.
When writing code, always ask: "will this break or go stale when real data changes?"
If yes, make it dynamic.

### Data Sources (always prefer these over hardcoded values)
- **Schedule, lines, SP+, ATS records** → CFBD API (`CFBD_API_KEY`)
- **Live scores, rosters, injuries** → ESPN public API (no key needed)
- **Betting lines (US books)** → The Odds API (`ODDS_API_KEY`)
- **Sharp money / Pinnacle lines** → OddsPAPI (`ODDSPAPI_KEY`)
- **Weather** → Open-Meteo (free, no key)
- **Public betting %** → Action Network (free)
- **News/sentiment** → Reddit r/CFB + Google News RSS

### What Is Allowed to Be Static
- HTML/CSS structure and layout
- Algorithm weights and formula logic in predictor.js
- UI copy and labels
- The `data/games-2026.json` seed (21 curated games) — temporary until CFBD publishes full schedule (~July/August). Once CFBD publishes 100+ games, the seed is auto-replaced.

### What Must Never Be Hardcoded
- Coach names or records → pull from CFBD or ESPN
- Team win/loss records → always from live API
- Player rosters, injury status → ESPN API refreshes these
- Betting spreads → Odds API
- AP/CFP rankings → CFBD API
- Weather conditions → Open-Meteo day-of
- ATS historical records → CFBD historical game data
- Public betting percentages → Action Network (mark `source: "default"` if estimated, never tweet as real)

### Automation Schedule
- **Weekdays** — data refresh every 4 hours
- **Saturday** — data refresh every 10 minutes (live game day)
- **Saturday night / Sunday morning** — every 10 minutes through midnight
- **Sunday** — every 30 minutes
- **X posts** — preseason daily Mon–Sat 10am ET; in-season by day of week on set schedule
- **Season gate** — flips automatically when CFBD publishes 100+ games (~July/August)

### Season Gate Logic
- `totalGames <= 100` in games-2026.json = preseason → `x-preseason-post.yml` runs, `x-auto-post.yml` skips
- `totalGames > 100` = season live → `x-auto-post.yml` runs, `x-preseason-post.yml` skips

### Key Files
- `scripts/fetch-live-data.mjs` — main data pipeline, runs in GitHub Actions
- `scripts/post-picks.js` — generates and posts picks to X
- `scripts/post-preseason.js` — preseason X posts from curated data
- `js/predictor.js` — prediction model (weights: baseModel 30%, playerImpact 20%, situational 15%, weather 10%, coaching 10%, momentum 8%, sharp 7%)
- `js/live.js` — frontend data fetcher, merges live API data into GAMES global
- `js/data.js` — team profiles (coaches/records update via CFBD; this file is the fallback skeleton)
- `data/games-2026.json` — preseason game seed (auto-replaced when season starts)

### When Adding Features
1. Always wire to a live API first
2. Use hardcoded values only as fallback when API is unavailable
3. Mark any estimated/default data with `source: "default"` so it's never presented as real
4. If data can change mid-season (coach fired, player transfer, injury), it must come from an API
