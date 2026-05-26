/**
 * get-picks.js
 * Loads data.js + stubs + predictor in a Node vm sandbox,
 * runs predictions, and returns formatted picks for the given week/type.
 *
 * Usage: const { getPicks } = require('./get-picks');
 */

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

const JS = (...f) => fs.readFileSync(path.resolve(__dirname, '..', 'js', ...f), 'utf8');

function loadPicks() {
  // Stub browser globals that predictor.js references
  const sandbox = {
    console, Math, Date, parseInt, parseFloat, isNaN, Array, Object, JSON,
    window: { TEAM_INTEL: {} },
  };

  // Execute each data/engine file in order (same as index.html script tags)
  vm.runInNewContext(JS('data.js'),              sandbox);
  vm.runInNewContext(JS('data-fbs-stubs.js'),    sandbox);
  vm.runInNewContext(JS('players-extended.js'),  sandbox);
  vm.runInNewContext(JS('predictor.js'),         sandbox);

  const { GAMES, TEAMS, predictGame, resolveGame } = sandbox;

  const predictions = GAMES
    .map(g => {
      try {
        const game = resolveGame ? resolveGame(g) : {
          ...g,
          homeTeam: TEAMS[g.homeTeamId] || { name: g.homeTeamId, abbreviation: g.homeTeamId, color: '#444' },
          awayTeam: TEAMS[g.awayTeamId] || { name: g.awayTeamId, abbreviation: g.awayTeamId, color: '#444' },
        };
        const prediction = predictGame(game);
        return { game, prediction };
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  return predictions;
}

/**
 * Returns picks for the earliest upcoming week.
 * type: 'elite' | 'high' | 'all' (default: returns ELITE + HIGH)
 */
function getPicks(type = 'all') {
  const predictions = loadPicks();
  const today = new Date().toISOString().slice(0, 10);

  // Find earliest upcoming week
  const upcoming = predictions.filter(p => p.game.date >= today);
  const weeks = upcoming.map(p => p.game.week).filter(Boolean);
  const minWeek = weeks.length ? Math.min(...weeks) : null;

  return predictions
    .filter(p => {
      if (minWeek && p.game.week !== minWeek) return false;
      if (p.game.date < today) return false;
      const tp = p.game.gamePreview && p.game.gamePreview.thePick;
      const conf = (tp && tp.confidence ? tp.confidence.toLowerCase() : null) || p.prediction.confidence;
      if (type === 'elite') return conf === 'elite';
      if (type === 'high')  return conf === 'high';
      return conf === 'elite' || conf === 'high';
    })
    .map(p => {
      const { game, prediction: pred } = p;
      const tp  = game.gamePreview && game.gamePreview.thePick;
      const sp  = pred.spreadPick || {};
      const bl  = game.bettingLines || {};
      const si  = game.socialIntel || {};
      const pb  = si.publicBetting || {};

      const conf        = (tp && tp.confidence ? tp.confidence.toLowerCase() : null) || pred.confidence;
      const pickTeam    = (tp && tp.team) ? tp.team : (sp.side === 'home' ? game.homeTeam.name : game.awayTeam.name);
      const pickIsHome  = pickTeam.toLowerCase() === (game.homeTeam.name || '').toLowerCase();
      const vegasSpread = bl.spread != null ? (pickIsHome ? bl.spread : -bl.spread) : null;
      const edge        = sp.edge || 0;
      const winProb     = sp.confidence || pred.winProbability || 0;
      const smSig       = pred.sharpMoneySignal || {};
      const sharpAligns = smSig.side && smSig.side !== 'neutral' &&
                          ((smSig.side === 'home') === pickIsHome);
      const publicPct   = pickIsHome ? pb.homePct : pb.awayPct;

      // Hashtags: team names → remove spaces/special chars
      const hashHome = '#' + game.homeTeam.name.replace(/[^a-zA-Z]/g, '');
      const hashAway = '#' + game.awayTeam.name.replace(/[^a-zA-Z]/g, '');

      return {
        gameId:      game.id,
        week:        game.week,
        date:        game.date,
        time:        game.time,
        network:     game.network,
        homeTeam:    game.homeTeam.name,
        awayTeam:    game.awayTeam.name,
        homeAbbr:    game.homeTeam.abbreviation,
        awayAbbr:    game.awayTeam.abbreviation,
        pickTeam,
        vegasSpread,
        edge:        parseFloat(edge.toFixed(1)),
        winProb:     Math.round(winProb),
        conf,
        sharpAligns,
        publicPct:   publicPct != null ? Math.round(publicPct) : null,
        hashHome,
        hashAway,
        reasoning:   tp && tp.reasoning ? tp.reasoning : null,
      };
    });
}

module.exports = { getPicks };
