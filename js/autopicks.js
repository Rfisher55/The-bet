/**
 * AutoPicks Engine — auto-publishes timestamped picks, grades results,
 * tracks CLV, calibration, ROI, and Kelly units.
 */
(function() {
  var STORAGE_KEY = 'theBet_publishedPicks';

  function getPublished() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e) { return []; }
  }

  function savePublished(picks) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(picks)); }
    catch(e) {}
  }

  function americanToDec(odds) {
    return odds >= 0 ? odds / 100 + 1 : 100 / Math.abs(odds) + 1;
  }

  function kellyPct(modelProb, odds) {
    var dec = americanToDec(odds);
    var b = dec - 1;
    var p = modelProb / 100;
    var kelly = (p * (b + 1) - 1) / b;
    return Math.max(0, Math.min(kelly * 0.5, 0.06)); // half-Kelly, cap 6%
  }

  function autoPublish() {
    if (!window.GAMES || !window.TEAMS) return getPublished();
    if (typeof predictGame !== 'function') return getPublished();

    var today = new Date().toISOString().slice(0, 10);
    var now   = new Date().toISOString();
    var published = getPublished();
    var publishedKeys = new Set(published.map(function(p) { return p.gameId + '|' + p.betType; }));
    var added = 0;

    GAMES.forEach(function(game) {
      if (!game.date || game.date <= today) return;
      if (!game.homeTeam || !game.awayTeam) return;

      var pred;
      try { pred = predictGame(game); } catch(e) { return; }

      // ── Spread pick ──
      var sk = game.id + '|spread';
      if (!publishedKeys.has(sk) && pred.spreadPick && pred.spreadPick.side !== 'no-bet' && pred.spreadPick.edge >= 1) {
        var spOdds = pred.spreadPick.side === 'home'
          ? (game.bettingLines && game.bettingLines.homeSpreadOdds || -110)
          : (game.bettingLines && game.bettingLines.awaySpreadOdds || -110);
        published.push({
          gameId:      game.id,
          betType:     'spread',
          publishedAt: now,
          gameDate:    game.date,
          gameTime:    game.time || '',
          homeTeam:    game.homeTeam.name,
          awayTeam:    game.awayTeam.name,
          side:        pred.spreadPick.side,
          team:        pred.spreadPick.team,
          vegasLine:   game.bettingLines ? game.bettingLines.spread : null,
          modelSpread: pred.predictedSpread,
          edge:        pred.spreadPick.edge,
          confidence:  pred.confidence,
          modelGrade:  pred.modelGrade,
          winProb:     pred.winProbability,
          kellyPct:    Math.round(kellyPct(pred.winProbability, spOdds) * 1000) / 10,
          odds:        spOdds,
          result:      null, closingLine: null, clv: null, homeScore: null, awayScore: null,
        });
        publishedKeys.add(sk);
        added++;
      }

      // ── Total pick ──
      var tk = game.id + '|total';
      if (!publishedKeys.has(tk) && pred.totalPick && pred.totalPick.side !== 'no-bet' && pred.totalPick.confidence >= 60) {
        var tpOdds = pred.totalPick.side === 'over'
          ? (game.bettingLines && game.bettingLines.overOdds || -110)
          : (game.bettingLines && game.bettingLines.underOdds || -110);
        published.push({
          gameId:      game.id,
          betType:     'total',
          publishedAt: now,
          gameDate:    game.date,
          gameTime:    game.time || '',
          homeTeam:    game.homeTeam.name,
          awayTeam:    game.awayTeam.name,
          side:        pred.totalPick.side,
          team:        pred.totalPick.side.toUpperCase(),
          vegasLine:   game.bettingLines ? game.bettingLines.total : null,
          modelTotal:  pred.predictedTotal,
          edge:        pred.totalPick.edge || 0,
          confidence:  pred.confidence,
          modelGrade:  pred.modelGrade,
          winProb:     pred.totalPick.confidence || 55,
          kellyPct:    1.5,
          odds:        tpOdds,
          result:      null, closingLine: null, clv: null, homeScore: null, awayScore: null,
        });
        publishedKeys.add(tk);
        added++;
      }
    });

    if (added > 0) {
      savePublished(published);
      console.log('[AutoPicks] Published ' + added + ' new picks');
    }
    return published;
  }

  function autoGrade(published) {
    var graded = 0;
    var liveScores = window.__espnLiveScores || [];

    published.forEach(function(pick) {
      if (pick.result !== null) return;
      var today = new Date().toISOString().slice(0, 10);
      if (pick.gameDate > today) return;

      // Find final score from ESPN live scores or GAMES
      var homeScore = null, awayScore = null;

      var espnGame = liveScores.find(function(s) {
        if (s.status !== 'STATUS_FINAL') return false;
        var h = (s.homeTeam || '').toLowerCase();
        var a = (s.awayTeam || '').toLowerCase();
        var ph = pick.homeTeam.split(' ').pop().toLowerCase();
        var pa = pick.awayTeam.split(' ').pop().toLowerCase();
        return (h.includes(ph) && a.includes(pa)) || (h.includes(pa) && a.includes(ph));
      });
      if (espnGame) { homeScore = parseInt(espnGame.homeScore); awayScore = parseInt(espnGame.awayScore); }

      if (homeScore == null && window.GAMES) {
        var g = GAMES.find(function(g) { return g.id === pick.gameId; });
        if (g && g.homeScore != null) { homeScore = parseInt(g.homeScore); awayScore = parseInt(g.awayScore); }
      }

      if (homeScore == null) return;

      pick.homeScore = homeScore;
      pick.awayScore = awayScore;

      if (pick.betType === 'spread') {
        var actualMargin = homeScore - awayScore;
        var vl = pick.vegasLine;
        if (vl == null) {
          pick.result = pick.side === 'home'
            ? (homeScore > awayScore ? 'W' : homeScore === awayScore ? 'P' : 'L')
            : (awayScore > homeScore ? 'W' : homeScore === awayScore ? 'P' : 'L');
        } else {
          // vegasLine: negative = home favored (e.g. -7 means home -7)
          var homeCover = actualMargin + vl; // positive = home covered
          if (pick.side === 'home') pick.result = homeCover > 0 ? 'W' : homeCover === 0 ? 'P' : 'L';
          else                      pick.result = homeCover < 0 ? 'W' : homeCover === 0 ? 'P' : 'L';
        }
        if (pick.closingLine != null && vl != null) {
          var mv = pick.closingLine - vl;
          pick.clv = pick.side === 'home' ? -mv : mv;
        }
      } else if (pick.betType === 'total') {
        var tot = homeScore + awayScore;
        var vt = pick.vegasLine;
        if (vt == null) { pick.result = 'P'; }
        else if (pick.side === 'over')  pick.result = tot > vt ? 'W' : tot === vt ? 'P' : 'L';
        else                            pick.result = tot < vt ? 'W' : tot === vt ? 'P' : 'L';
      }

      if (pick.result !== null) graded++;
    });

    if (graded > 0) {
      savePublished(published);
      console.log('[AutoPicks] Graded ' + graded + ' picks');
    }
    return published;
  }

  function computeStats(published) {
    var graded  = published.filter(function(p) { return p.result !== null && p.result !== 'P'; });
    var wins    = graded.filter(function(p) { return p.result === 'W'; }).length;
    var losses  = graded.filter(function(p) { return p.result === 'L'; }).length;
    var pushes  = published.filter(function(p) { return p.result === 'P'; }).length;
    var pending = published.filter(function(p) { return p.result === null; }).length;
    var winRate = graded.length ? (wins / graded.length * 100).toFixed(1) : null;

    var netUnits = 0;
    graded.forEach(function(p) {
      if (p.result === 'W') netUnits += americanToDec(p.odds || -110) - 1;
      else                  netUnits -= 1;
    });
    netUnits = Math.round(netUnits * 10) / 10;
    var roi = graded.length ? (netUnits / graded.length * 100).toFixed(1) : null;

    var clvPicks = published.filter(function(p) { return p.clv != null; });
    var avgClv   = clvPicks.length
      ? (clvPicks.reduce(function(s,p){return s+p.clv;},0) / clvPicks.length).toFixed(2)
      : null;

    var tiers = {
      elite:  { label:'Elite',  expected:72, w:0, l:0 },
      high:   { label:'High',   expected:62, w:0, l:0 },
      medium: { label:'Medium', expected:56, w:0, l:0 },
      low:    { label:'Low',    expected:52, w:0, l:0 },
    };
    graded.forEach(function(p) {
      var t = tiers[p.confidence];
      if (t) { if (p.result === 'W') t.w++; else t.l++; }
    });

    return { total:published.length, wins, losses, pushes, pending, winRate, netUnits, roi, avgClv, tiers };
  }

  window.AutoPicks = { getPublished, savePublished, autoPublish, autoGrade, computeStats };

  window.addEventListener('liveDataReady', function() {
    setTimeout(function() {
      try {
        var pub = autoPublish();
        pub = autoGrade(pub);
        if (typeof window.onAutoPicksReady === 'function') window.onAutoPicksReady(pub);
      } catch(e) { console.error('[AutoPicks]', e); }
    }, 200);
  });
})();
