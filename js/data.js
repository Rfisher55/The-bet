/* ═══════════════════════════════════════════════════
   THE BET — Team & Game Data
   2026 D1 CFB Season Projections
   ═══════════════════════════════════════════════════ */

var TEAMS = {
  ohio_state: {
    id: "ohio_state",
    name: "Ohio State",
    abbreviation: "OSU",
    mascot: "Buckeyes",
    conference: "Big Ten",
    color: "#BB0000",
    wins: 0, losses: 0, lastSeasonRecord: "14-2 (2025 CFP Champions)",
    rating: 95, offensiveRating: 96, defensiveRating: 93, spRating: 27.8,
    apRank: 1,
    recruitingRank: 2,
    coachName: "Ryan Day", coachRecord: "86-13",
    stats: {
      pointsPerGame: 44.2, pointsAllowedPerGame: 13.1,
      yardsPerGame: 512.3, yardsAllowedPerGame: 278.4,
      passingYardsPerGame: 318.7, rushingYardsPerGame: 193.6,
      turnoversPerGame: 0.8, turnoversForced: 2.1,
      thirdDownPct: 0.52, redZonePct: 0.91,
      sacks: 3.4, sacksAllowed: 1.2,
    },
    atsRecord: { wins: 28, losses: 16, pushes: 2, pct: 0.634 },
    situational: {
      atsFavorite:   { wins: 22, losses: 14, pct: 0.611 },
      atsUnderdog:   { wins: 6,  losses: 2,  pct: 0.750 },
      atsHome:       { wins: 16, losses: 8,  pct: 0.667 },
      atsAway:       { wins: 12, losses: 8,  pct: 0.600 },
      afterLoss:     { wins: 4,  losses: 1,  pct: 0.800 },
      afterBigWin:   { wins: 8,  losses: 6,  pct: 0.571 },
      vsRanked:      { wins: 9,  losses: 6,  pct: 0.600 },
      vsUnranked:    { wins: 19, losses: 10, pct: 0.655 },
      nightGame:     { wins: 14, losses: 7,  pct: 0.667 },
      bowl:          { wins: 4,  losses: 2,  pct: 0.667 },
      firstGame:     { wins: 3,  losses: 0,  pct: 1.000 },
      road:          { wins: 12, losses: 8,  pct: 0.600 },
      neutral:       { wins: 3,  losses: 1,  pct: 0.750 },
    },
    programHealth: {
      nilStrength: 96,
      transferPortalRating: 88,
      coachHotSeat: 2,
      programMomentum: "rising",
      fanMorale: 94,
      lockerRoomCohesion: 88,
      depthChartStability: 91,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 9,
      coldWeatherRecord: "18-4 ATS below 40F",
      rainRecord: "12-6 ATS in rain",
      windRecord: "9-5 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 0,
      emotionalSpot: "motivated",
      travelBurdenRating: 1,
    },
    coachingProfile: {
      atsRecord: "28-16-2",
      atsAsFavorite: "22-14",
      atsAsUnderdog: "6-2",
      halftimeAdjustmentRating: 9,
      closeGameRecord: "14-4 (games decided by <7)",
      bigSpotRecord: "9-4 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 38,
        aggressiveness: 8,
        trickPlayFreq: 5,
        tempoPreference: "balanced",
        offensiveScheme: "Pro-Style RPO",
        defensiveScheme: "4-3 Multiple",
        blitzRate: 7,
        pressureRate: "42%",
      },
      staffStability: 8,
      contractStatus: "secure",
    },
  },

  georgia: {
    id: "georgia",
    name: "Georgia",
    abbreviation: "UGA",
    mascot: "Bulldogs",
    conference: "SEC",
    color: "#BA0C2F",
    wins: 0, losses: 0, lastSeasonRecord: "9-4 (2025)",
    rating: 90, offensiveRating: 87, defensiveRating: 93, spRating: 22.4,
    apRank: 4,
    recruitingRank: 1,
    coachName: "Kirby Smart", coachRecord: "112-25",
    stats: {
      pointsPerGame: 34.2, pointsAllowedPerGame: 22.8,
      yardsPerGame: 418.4, yardsAllowedPerGame: 318.6,
      passingYardsPerGame: 238.4, rushingYardsPerGame: 180.0,
      turnoversPerGame: 1.1, turnoversForced: 1.8,
      thirdDownPct: 0.44, redZonePct: 0.83,
      sacks: 3.2, sacksAllowed: 1.6,
    },
    atsRecord: { wins: 27, losses: 17, pushes: 2, pct: 0.614 },
    situational: {
      atsFavorite:   { wins: 21, losses: 14, pct: 0.600 },
      atsUnderdog:   { wins: 6,  losses: 3,  pct: 0.667 },
      atsHome:       { wins: 15, losses: 9,  pct: 0.625 },
      atsAway:       { wins: 12, losses: 8,  pct: 0.600 },
      afterLoss:     { wins: 3,  losses: 2,  pct: 0.600 },
      afterBigWin:   { wins: 7,  losses: 6,  pct: 0.538 },
      vsRanked:      { wins: 10, losses: 5,  pct: 0.667 },
      vsUnranked:    { wins: 17, losses: 12, pct: 0.586 },
      nightGame:     { wins: 13, losses: 8,  pct: 0.619 },
      bowl:          { wins: 5,  losses: 2,  pct: 0.714 },
      firstGame:     { wins: 2,  losses: 1,  pct: 0.667 },
      road:          { wins: 12, losses: 8,  pct: 0.600 },
      neutral:       { wins: 4,  losses: 1,  pct: 0.800 },
    },
    programHealth: {
      nilStrength: 92,
      transferPortalRating: 84,
      coachHotSeat: 1,
      programMomentum: "rising",
      fanMorale: 84,
      lockerRoomCohesion: 86,
      depthChartStability: 88,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 6,
      coldWeatherRecord: "11-7 ATS below 40F",
      rainRecord: "14-5 ATS in rain",
      windRecord: "8-6 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 0,
      emotionalSpot: "motivated",
      travelBurdenRating: 2,
    },
    coachingProfile: {
      atsRecord: "27-17-2",
      atsAsFavorite: "21-14",
      atsAsUnderdog: "6-3",
      halftimeAdjustmentRating: 10,
      closeGameRecord: "12-5 (games decided by <7)",
      bigSpotRecord: "10-4 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 55,
        aggressiveness: 7,
        trickPlayFreq: 3,
        tempoPreference: "slow",
        offensiveScheme: "Power Pro-Style",
        defensiveScheme: "3-4 Multiple / Cover 2 Variant",
        blitzRate: 6,
        pressureRate: "38%",
      },
      staffStability: 9,
      contractStatus: "secure",
    },
  },

  alabama: {
    id: "alabama",
    name: "Alabama",
    abbreviation: "ALA",
    mascot: "Crimson Tide",
    conference: "SEC",
    color: "#9E1B32",
    wins: 0, losses: 0, lastSeasonRecord: "9-4 (2025)",
    rating: 82, offensiveRating: 81, defensiveRating: 83, spRating: 14.6,
    apRank: 10,
    recruitingRank: 4,
    coachName: "Kalen DeBoer", coachRecord: "52-13",
    stats: {
      pointsPerGame: 34.8, pointsAllowedPerGame: 24.4,
      yardsPerGame: 438.2, yardsAllowedPerGame: 346.8,
      passingYardsPerGame: 278.4, rushingYardsPerGame: 159.8,
      turnoversPerGame: 1.3, turnoversForced: 1.6,
      thirdDownPct: 0.44, redZonePct: 0.82,
      sacks: 2.4, sacksAllowed: 2.1,
    },
    atsRecord: { wins: 24, losses: 20, pushes: 2, pct: 0.545 },
    situational: {
      atsFavorite:   { wins: 18, losses: 16, pct: 0.529 },
      atsUnderdog:   { wins: 6,  losses: 4,  pct: 0.600 },
      atsHome:       { wins: 14, losses: 10, pct: 0.583 },
      atsAway:       { wins: 10, losses: 10, pct: 0.500 },
      afterLoss:     { wins: 5,  losses: 3,  pct: 0.625 },
      afterBigWin:   { wins: 6,  losses: 7,  pct: 0.462 },
      vsRanked:      { wins: 8,  losses: 7,  pct: 0.533 },
      vsUnranked:    { wins: 16, losses: 13, pct: 0.552 },
      nightGame:     { wins: 12, losses: 9,  pct: 0.571 },
      bowl:          { wins: 3,  losses: 3,  pct: 0.500 },
      firstGame:     { wins: 2,  losses: 1,  pct: 0.667 },
      road:          { wins: 10, losses: 10, pct: 0.500 },
      neutral:       { wins: 2,  losses: 2,  pct: 0.500 },
    },
    programHealth: {
      nilStrength: 88,
      transferPortalRating: 80,
      coachHotSeat: 5,
      programMomentum: "declining",
      fanMorale: 70,
      lockerRoomCohesion: 74,
      depthChartStability: 78,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 4,
      coldWeatherRecord: "8-10 ATS below 40F",
      rainRecord: "11-8 ATS in rain",
      windRecord: "7-7 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: true,
      consecutiveRoadGames: 0,
      emotionalSpot: "motivated",
      travelBurdenRating: 3,
    },
    coachingProfile: {
      atsRecord: "24-20-2",
      atsAsFavorite: "18-16",
      atsAsUnderdog: "6-4",
      halftimeAdjustmentRating: 8,
      closeGameRecord: "10-6 (games decided by <7)",
      bigSpotRecord: "8-6 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 42,
        aggressiveness: 8,
        trickPlayFreq: 4,
        tempoPreference: "balanced",
        offensiveScheme: "Air Raid / RPO Hybrid",
        defensiveScheme: "4-2-5 / Nickel Base",
        blitzRate: 7,
        pressureRate: "39%",
      },
      staffStability: 7,
      contractStatus: "secure",
    },
  },

  texas: {
    id: "texas",
    name: "Texas",
    abbreviation: "TEX",
    mascot: "Longhorns",
    conference: "SEC",
    color: "#BF5700",
    wins: 0, losses: 0, lastSeasonRecord: "11-3 (2025)",
    rating: 90, offensiveRating: 91, defensiveRating: 87, spRating: 22.1,
    apRank: 5,
    recruitingRank: 3,
    coachName: "Steve Sarkisian", coachRecord: "50-24",
    stats: {
      pointsPerGame: 40.1, pointsAllowedPerGame: 21.4,
      yardsPerGame: 489.2, yardsAllowedPerGame: 334.7,
      passingYardsPerGame: 312.8, rushingYardsPerGame: 176.4,
      turnoversPerGame: 1.1, turnoversForced: 1.7,
      thirdDownPct: 0.48, redZonePct: 0.86,
      sacks: 2.6, sacksAllowed: 1.9,
    },
    atsRecord: { wins: 22, losses: 21, pushes: 3, pct: 0.512 },
    situational: {
      atsFavorite:   { wins: 16, losses: 16, pct: 0.500 },
      atsUnderdog:   { wins: 6,  losses: 5,  pct: 0.545 },
      atsHome:       { wins: 13, losses: 10, pct: 0.565 },
      atsAway:       { wins: 9,  losses: 11, pct: 0.450 },
      afterLoss:     { wins: 4,  losses: 4,  pct: 0.500 },
      afterBigWin:   { wins: 5,  losses: 7,  pct: 0.417 },
      vsRanked:      { wins: 7,  losses: 8,  pct: 0.467 },
      vsUnranked:    { wins: 15, losses: 13, pct: 0.536 },
      nightGame:     { wins: 11, losses: 10, pct: 0.524 },
      bowl:          { wins: 3,  losses: 3,  pct: 0.500 },
      firstGame:     { wins: 1,  losses: 2,  pct: 0.333 },
      road:          { wins: 9,  losses: 11, pct: 0.450 },
      neutral:       { wins: 2,  losses: 2,  pct: 0.500 },
    },
    programHealth: {
      nilStrength: 95,
      transferPortalRating: 80,
      coachHotSeat: 5,
      programMomentum: "rising",
      fanMorale: 84,
      lockerRoomCohesion: 82,
      depthChartStability: 80,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 3,
      coldWeatherRecord: "6-12 ATS below 40F",
      rainRecord: "10-9 ATS in rain",
      windRecord: "6-8 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 1,
      emotionalSpot: "motivated",
      travelBurdenRating: 5,
    },
    coachingProfile: {
      atsRecord: "22-21-3",
      atsAsFavorite: "16-16",
      atsAsUnderdog: "6-5",
      halftimeAdjustmentRating: 7,
      closeGameRecord: "9-7 (games decided by <7)",
      bigSpotRecord: "7-6 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 40,
        aggressiveness: 8,
        trickPlayFreq: 5,
        tempoPreference: "fast",
        offensiveScheme: "West Coast / Spread",
        defensiveScheme: "4-2-5 / Cover 3 Base",
        blitzRate: 6,
        pressureRate: "36%",
      },
      staffStability: 8,
      contractStatus: "secure",
    },
  },

  notre_dame: {
    id: "notre_dame",
    name: "Notre Dame",
    abbreviation: "ND",
    mascot: "Fighting Irish",
    conference: "Independent",
    color: "#0C2340",
    wins: 0, losses: 0, lastSeasonRecord: "13-2 (2025 CFP Runner-Up)",
    rating: 91, offensiveRating: 88, defensiveRating: 93, spRating: 23.6,
    apRank: 2,
    recruitingRank: 7,
    coachName: "Marcus Freeman", coachRecord: "47-18",
    stats: {
      pointsPerGame: 36.4, pointsAllowedPerGame: 15.8,
      yardsPerGame: 441.3, yardsAllowedPerGame: 268.9,
      passingYardsPerGame: 248.7, rushingYardsPerGame: 192.6,
      turnoversPerGame: 0.9, turnoversForced: 2.0,
      thirdDownPct: 0.46, redZonePct: 0.88,
      sacks: 3.0, sacksAllowed: 1.4,
    },
    atsRecord: { wins: 25, losses: 19, pushes: 2, pct: 0.568 },
    situational: {
      atsFavorite:   { wins: 16, losses: 12, pct: 0.571 },
      atsUnderdog:   { wins: 9,  losses: 7,  pct: 0.563 },
      atsHome:       { wins: 14, losses: 9,  pct: 0.609 },
      atsAway:       { wins: 11, losses: 10, pct: 0.524 },
      afterLoss:     { wins: 5,  losses: 2,  pct: 0.714 },
      afterBigWin:   { wins: 6,  losses: 7,  pct: 0.462 },
      vsRanked:      { wins: 9,  losses: 7,  pct: 0.563 },
      vsUnranked:    { wins: 16, losses: 12, pct: 0.571 },
      nightGame:     { wins: 10, losses: 9,  pct: 0.526 },
      bowl:          { wins: 4,  losses: 3,  pct: 0.571 },
      firstGame:     { wins: 2,  losses: 1,  pct: 0.667 },
      road:          { wins: 11, losses: 10, pct: 0.524 },
      neutral:       { wins: 3,  losses: 2,  pct: 0.600 },
    },
    programHealth: {
      nilStrength: 85,
      transferPortalRating: 75,
      coachHotSeat: 2,
      programMomentum: "rising",
      fanMorale: 91,
      lockerRoomCohesion: 87,
      depthChartStability: 83,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 8,
      coldWeatherRecord: "15-7 ATS below 40F",
      rainRecord: "12-7 ATS in rain",
      windRecord: "10-6 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 1,
      emotionalSpot: "motivated",
      travelBurdenRating: 6,
    },
    coachingProfile: {
      atsRecord: "25-19-2",
      atsAsFavorite: "16-12",
      atsAsUnderdog: "9-7",
      halftimeAdjustmentRating: 8,
      closeGameRecord: "11-5 (games decided by <7)",
      bigSpotRecord: "9-5 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 48,
        aggressiveness: 7,
        trickPlayFreq: 4,
        tempoPreference: "balanced",
        offensiveScheme: "Pro-Style / Spread Hybrid",
        defensiveScheme: "4-2-5 Multiple / Cover 4",
        blitzRate: 7,
        pressureRate: "41%",
      },
      staffStability: 8,
      contractStatus: "secure",
    },
  },

  penn_state: {
    id: "penn_state",
    name: "Penn State",
    abbreviation: "PSU",
    mascot: "Nittany Lions",
    conference: "Big Ten",
    color: "#041E42",
    wins: 0, losses: 0, lastSeasonRecord: "11-3 (2025)",
    rating: 87, offensiveRating: 84, defensiveRating: 90, spRating: 18.4,
    apRank: 7,
    recruitingRank: 10,
    coachName: "Matt Campbell", coachRecord: "0-0",
    stats: {
      pointsPerGame: 33.2, pointsAllowedPerGame: 17.4,
      yardsPerGame: 408.4, yardsAllowedPerGame: 282.1,
      passingYardsPerGame: 234.7, rushingYardsPerGame: 173.7,
      turnoversPerGame: 1.0, turnoversForced: 1.9,
      thirdDownPct: 0.43, redZonePct: 0.84,
      sacks: 3.2, sacksAllowed: 1.6,
    },
    atsRecord: { wins: 23, losses: 20, pushes: 3, pct: 0.534 },
    situational: {
      atsFavorite:   { wins: 15, losses: 13, pct: 0.536 },
      atsUnderdog:   { wins: 8,  losses: 7,  pct: 0.533 },
      atsHome:       { wins: 14, losses: 9,  pct: 0.609 },
      atsAway:       { wins: 9,  losses: 11, pct: 0.450 },
      afterLoss:     { wins: 5,  losses: 3,  pct: 0.625 },
      afterBigWin:   { wins: 5,  losses: 7,  pct: 0.417 },
      vsRanked:      { wins: 8,  losses: 7,  pct: 0.533 },
      vsUnranked:    { wins: 15, losses: 13, pct: 0.536 },
      nightGame:     { wins: 10, losses: 9,  pct: 0.526 },
      bowl:          { wins: 3,  losses: 3,  pct: 0.500 },
      firstGame:     { wins: 1,  losses: 2,  pct: 0.333 },
      road:          { wins: 9,  losses: 11, pct: 0.450 },
      neutral:       { wins: 2,  losses: 2,  pct: 0.500 },
    },
    programHealth: {
      nilStrength: 80,
      transferPortalRating: 74,
      coachHotSeat: 4,
      programMomentum: "rising",
      fanMorale: 84,
      lockerRoomCohesion: 82,
      depthChartStability: 82,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 8,
      coldWeatherRecord: "14-8 ATS below 40F",
      rainRecord: "11-8 ATS in rain",
      windRecord: "9-7 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 1,
      emotionalSpot: "motivated",
      travelBurdenRating: 7,
    },
    coachingProfile: {
      atsRecord: "23-20-3",
      atsAsFavorite: "15-13",
      atsAsUnderdog: "8-7",
      halftimeAdjustmentRating: 7,
      closeGameRecord: "9-7 (games decided by <7)",
      bigSpotRecord: "7-6 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 44,
        aggressiveness: 6,
        trickPlayFreq: 3,
        tempoPreference: "balanced",
        offensiveScheme: "Pro-Style / Spread",
        defensiveScheme: "4-3 Multiple",
        blitzRate: 7,
        pressureRate: "38%",
      },
      staffStability: 8,
      contractStatus: "secure",
    },
  },

  michigan: {
    id: "michigan",
    name: "Michigan",
    abbreviation: "MICH",
    mascot: "Wolverines",
    conference: "Big Ten",
    color: "#00274C",
    wins: 0, losses: 0, lastSeasonRecord: "8-4 (2025)",
    rating: 82, offensiveRating: 80, defensiveRating: 84, spRating: 13.8,
    apRank: 16,
    recruitingRank: 11,
    coachName: "Kyle Whittingham", coachRecord: "143-73",
    stats: {
      pointsPerGame: 29.8, pointsAllowedPerGame: 20.1,
      yardsPerGame: 378.2, yardsAllowedPerGame: 298.4,
      passingYardsPerGame: 198.4, rushingYardsPerGame: 179.8,
      turnoversPerGame: 1.2, turnoversForced: 1.6,
      thirdDownPct: 0.41, redZonePct: 0.82,
      sacks: 2.7, sacksAllowed: 1.8,
    },
    atsRecord: { wins: 20, losses: 23, pushes: 3, pct: 0.465 },
    situational: {
      atsFavorite:   { wins: 12, losses: 15, pct: 0.444 },
      atsUnderdog:   { wins: 8,  losses: 8,  pct: 0.500 },
      atsHome:       { wins: 12, losses: 11, pct: 0.522 },
      atsAway:       { wins: 8,  losses: 12, pct: 0.400 },
      afterLoss:     { wins: 4,  losses: 5,  pct: 0.444 },
      afterBigWin:   { wins: 4,  losses: 7,  pct: 0.364 },
      vsRanked:      { wins: 6,  losses: 9,  pct: 0.400 },
      vsUnranked:    { wins: 14, losses: 14, pct: 0.500 },
      nightGame:     { wins: 8,  losses: 11, pct: 0.421 },
      bowl:          { wins: 2,  losses: 4,  pct: 0.333 },
      firstGame:     { wins: 1,  losses: 2,  pct: 0.333 },
      road:          { wins: 8,  losses: 12, pct: 0.400 },
      neutral:       { wins: 1,  losses: 2,  pct: 0.333 },
    },
    programHealth: {
      nilStrength: 74,
      transferPortalRating: 68,
      coachHotSeat: 7,
      programMomentum: "declining",
      fanMorale: 68,
      lockerRoomCohesion: 72,
      depthChartStability: 70,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 9,
      coldWeatherRecord: "16-6 ATS below 40F",
      rainRecord: "10-8 ATS in rain",
      windRecord: "9-6 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 1,
      emotionalSpot: "motivated",
      travelBurdenRating: 6,
    },
    coachingProfile: {
      atsRecord: "20-23-3",
      atsAsFavorite: "12-15",
      atsAsUnderdog: "8-8",
      halftimeAdjustmentRating: 6,
      closeGameRecord: "7-9 (games decided by <7)",
      bigSpotRecord: "5-7 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 52,
        aggressiveness: 6,
        trickPlayFreq: 3,
        tempoPreference: "slow",
        offensiveScheme: "Power Run / Pro-Style",
        defensiveScheme: "4-3 Base / Two-Gap",
        blitzRate: 5,
        pressureRate: "33%",
      },
      staffStability: 6,
      contractStatus: "questionable",
    },
  },

  clemson: {
    id: "clemson",
    name: "Clemson",
    abbreviation: "CLEM",
    mascot: "Tigers",
    conference: "ACC",
    color: "#F56600",
    wins: 0, losses: 0, lastSeasonRecord: "10-3 (2025)",
    rating: 88, offensiveRating: 86, defensiveRating: 90, spRating: 17.9,
    apRank: 6,
    recruitingRank: 9,
    coachName: "Dabo Swinney", coachRecord: "184-53",
    stats: {
      pointsPerGame: 35.7, pointsAllowedPerGame: 18.3,
      yardsPerGame: 432.8, yardsAllowedPerGame: 290.7,
      passingYardsPerGame: 258.4, rushingYardsPerGame: 174.4,
      turnoversPerGame: 1.0, turnoversForced: 1.8,
      thirdDownPct: 0.45, redZonePct: 0.86,
      sacks: 2.9, sacksAllowed: 1.5,
    },
    atsRecord: { wins: 22, losses: 22, pushes: 2, pct: 0.500 },
    situational: {
      atsFavorite:   { wins: 16, losses: 16, pct: 0.500 },
      atsUnderdog:   { wins: 6,  losses: 6,  pct: 0.500 },
      atsHome:       { wins: 14, losses: 10, pct: 0.583 },
      atsAway:       { wins: 8,  losses: 12, pct: 0.400 },
      afterLoss:     { wins: 4,  losses: 4,  pct: 0.500 },
      afterBigWin:   { wins: 5,  losses: 7,  pct: 0.417 },
      vsRanked:      { wins: 7,  losses: 8,  pct: 0.467 },
      vsUnranked:    { wins: 15, losses: 14, pct: 0.517 },
      nightGame:     { wins: 10, losses: 10, pct: 0.500 },
      bowl:          { wins: 3,  losses: 3,  pct: 0.500 },
      firstGame:     { wins: 1,  losses: 2,  pct: 0.333 },
      road:          { wins: 8,  losses: 12, pct: 0.400 },
      neutral:       { wins: 2,  losses: 2,  pct: 0.500 },
    },
    programHealth: {
      nilStrength: 72,
      transferPortalRating: 65,
      coachHotSeat: 6,
      programMomentum: "stable",
      fanMorale: 75,
      lockerRoomCohesion: 76,
      depthChartStability: 78,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 5,
      coldWeatherRecord: "9-9 ATS below 40F",
      rainRecord: "10-9 ATS in rain",
      windRecord: "7-8 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 1,
      emotionalSpot: "motivated",
      travelBurdenRating: 5,
    },
    coachingProfile: {
      atsRecord: "22-22-2",
      atsAsFavorite: "16-16",
      atsAsUnderdog: "6-6",
      halftimeAdjustmentRating: 7,
      closeGameRecord: "9-8 (games decided by <7)",
      bigSpotRecord: "7-6 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 43,
        aggressiveness: 7,
        trickPlayFreq: 5,
        tempoPreference: "balanced",
        offensiveScheme: "Pro-Style / Spread Hybrid",
        defensiveScheme: "4-3 One-Gap / Cover 2",
        blitzRate: 6,
        pressureRate: "35%",
      },
      staffStability: 7,
      contractStatus: "secure",
    },
  },

  lsu: {
    id: "lsu",
    name: "LSU",
    abbreviation: "LSU",
    mascot: "Tigers",
    conference: "SEC",
    color: "#461D7C",
    wins: 0, losses: 0, lastSeasonRecord: "9-4 (2025)",
    rating: 85, offensiveRating: 88, defensiveRating: 80, spRating: 15.2,
    apRank: 9,
    recruitingRank: 6,
    coachName: "Lane Kiffin", coachRecord: "108-46",
    stats: {
      pointsPerGame: 41.3, pointsAllowedPerGame: 24.7,
      yardsPerGame: 501.2, yardsAllowedPerGame: 358.4,
      passingYardsPerGame: 324.8, rushingYardsPerGame: 176.4,
      turnoversPerGame: 1.3, turnoversForced: 1.5,
      thirdDownPct: 0.50, redZonePct: 0.88,
      sacks: 2.4, sacksAllowed: 2.1,
    },
    atsRecord: { wins: 21, losses: 22, pushes: 3, pct: 0.488 },
    situational: {
      atsFavorite:   { wins: 13, losses: 14, pct: 0.481 },
      atsUnderdog:   { wins: 8,  losses: 8,  pct: 0.500 },
      atsHome:       { wins: 14, losses: 10, pct: 0.583 },
      atsAway:       { wins: 7,  losses: 12, pct: 0.368 },
      afterLoss:     { wins: 5,  losses: 4,  pct: 0.556 },
      afterBigWin:   { wins: 4,  losses: 7,  pct: 0.364 },
      vsRanked:      { wins: 7,  losses: 8,  pct: 0.467 },
      vsUnranked:    { wins: 14, losses: 14, pct: 0.500 },
      nightGame:     { wins: 13, losses: 9,  pct: 0.591 },
      bowl:          { wins: 3,  losses: 3,  pct: 0.500 },
      firstGame:     { wins: 1,  losses: 2,  pct: 0.333 },
      road:          { wins: 7,  losses: 12, pct: 0.368 },
      neutral:       { wins: 2,  losses: 2,  pct: 0.500 },
    },
    programHealth: {
      nilStrength: 88,
      transferPortalRating: 86,
      coachHotSeat: 4,
      programMomentum: "stable",
      fanMorale: 76,
      lockerRoomCohesion: 74,
      depthChartStability: 72,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 2,
      coldWeatherRecord: "5-13 ATS below 40F",
      rainRecord: "11-8 ATS in rain",
      windRecord: "6-9 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 0,
      emotionalSpot: "motivated",
      travelBurdenRating: 2,
    },
    coachingProfile: {
      atsRecord: "21-22-3",
      atsAsFavorite: "13-14",
      atsAsUnderdog: "8-8",
      halftimeAdjustmentRating: 7,
      closeGameRecord: "8-8 (games decided by <7)",
      bigSpotRecord: "6-7 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 38,
        aggressiveness: 8,
        trickPlayFreq: 5,
        tempoPreference: "fast",
        offensiveScheme: "Spread / Air Raid",
        defensiveScheme: "4-2-5 / Cover 3",
        blitzRate: 7,
        pressureRate: "40%",
      },
      staffStability: 7,
      contractStatus: "secure",
    },
  },

  oregon: {
    id: "oregon",
    name: "Oregon",
    abbreviation: "ORE",
    mascot: "Ducks",
    conference: "Big Ten",
    color: "#154733",
    wins: 0, losses: 0, lastSeasonRecord: "12-2 (2025)",
    rating: 92, offensiveRating: 93, defensiveRating: 90, spRating: 24.6,
    apRank: 3,
    recruitingRank: 8,
    coachName: "Dan Lanning", coachRecord: "49-12",
    stats: {
      pointsPerGame: 43.7, pointsAllowedPerGame: 16.8,
      yardsPerGame: 498.4, yardsAllowedPerGame: 272.3,
      passingYardsPerGame: 302.4, rushingYardsPerGame: 196.0,
      turnoversPerGame: 0.7, turnoversForced: 2.0,
      thirdDownPct: 0.51, redZonePct: 0.90,
      sacks: 3.3, sacksAllowed: 1.3,
    },
    atsRecord: { wins: 26, losses: 18, pushes: 2, pct: 0.590 },
    situational: {
      atsFavorite:   { wins: 19, losses: 13, pct: 0.594 },
      atsUnderdog:   { wins: 7,  losses: 5,  pct: 0.583 },
      atsHome:       { wins: 16, losses: 8,  pct: 0.667 },
      atsAway:       { wins: 10, losses: 10, pct: 0.500 },
      afterLoss:     { wins: 4,  losses: 2,  pct: 0.667 },
      afterBigWin:   { wins: 7,  losses: 6,  pct: 0.538 },
      vsRanked:      { wins: 9,  losses: 6,  pct: 0.600 },
      vsUnranked:    { wins: 17, losses: 12, pct: 0.586 },
      nightGame:     { wins: 12, losses: 8,  pct: 0.600 },
      bowl:          { wins: 4,  losses: 2,  pct: 0.667 },
      firstGame:     { wins: 2,  losses: 1,  pct: 0.667 },
      road:          { wins: 10, losses: 10, pct: 0.500 },
      neutral:       { wins: 3,  losses: 1,  pct: 0.750 },
    },
    programHealth: {
      nilStrength: 91,
      transferPortalRating: 87,
      coachHotSeat: 1,
      programMomentum: "rising",
      fanMorale: 92,
      lockerRoomCohesion: 88,
      depthChartStability: 86,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 7,
      coldWeatherRecord: "13-7 ATS below 40F",
      rainRecord: "15-5 ATS in rain",
      windRecord: "9-6 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 0,
      emotionalSpot: "motivated",
      travelBurdenRating: 1,
    },
    coachingProfile: {
      atsRecord: "26-18-2",
      atsAsFavorite: "19-13",
      atsAsUnderdog: "7-5",
      halftimeAdjustmentRating: 9,
      closeGameRecord: "12-5 (games decided by <7)",
      bigSpotRecord: "9-4 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 41,
        aggressiveness: 9,
        trickPlayFreq: 6,
        tempoPreference: "fast",
        offensiveScheme: "Spread / RPO",
        defensiveScheme: "3-4 / Odd Front Multiple",
        blitzRate: 8,
        pressureRate: "44%",
      },
      staffStability: 9,
      contractStatus: "secure",
    },
  },

  tennessee: {
    id: "tennessee",
    name: "Tennessee",
    abbreviation: "TENN",
    mascot: "Volunteers",
    conference: "SEC",
    color: "#FF8200",
    wins: 0, losses: 0, lastSeasonRecord: "10-3 (2025)",
    rating: 84, offensiveRating: 87, defensiveRating: 80, spRating: 12.8,
    apRank: 11,
    recruitingRank: 12,
    coachName: "Josh Heupel", coachRecord: "60-29",
    stats: {
      pointsPerGame: 37.4, pointsAllowedPerGame: 26.8,
      yardsPerGame: 488.7, yardsAllowedPerGame: 384.2,
      passingYardsPerGame: 318.4, rushingYardsPerGame: 170.3,
      turnoversPerGame: 1.4, turnoversForced: 1.4,
      thirdDownPct: 0.48, redZonePct: 0.84,
      sacks: 2.2, sacksAllowed: 2.3,
    },
    atsRecord: { wins: 20, losses: 22, pushes: 4, pct: 0.476 },
    situational: {
      atsFavorite:   { wins: 12, losses: 14, pct: 0.462 },
      atsUnderdog:   { wins: 8,  losses: 8,  pct: 0.500 },
      atsHome:       { wins: 13, losses: 9,  pct: 0.591 },
      atsAway:       { wins: 7,  losses: 13, pct: 0.350 },
      afterLoss:     { wins: 5,  losses: 4,  pct: 0.556 },
      afterBigWin:   { wins: 3,  losses: 7,  pct: 0.300 },
      vsRanked:      { wins: 6,  losses: 8,  pct: 0.429 },
      vsUnranked:    { wins: 14, losses: 14, pct: 0.500 },
      nightGame:     { wins: 11, losses: 9,  pct: 0.550 },
      bowl:          { wins: 2,  losses: 4,  pct: 0.333 },
      firstGame:     { wins: 2,  losses: 1,  pct: 0.667 },
      road:          { wins: 7,  losses: 13, pct: 0.350 },
      neutral:       { wins: 1,  losses: 2,  pct: 0.333 },
    },
    programHealth: {
      nilStrength: 82,
      transferPortalRating: 78,
      coachHotSeat: 4,
      programMomentum: "stable",
      fanMorale: 76,
      lockerRoomCohesion: 78,
      depthChartStability: 76,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 5,
      coldWeatherRecord: "8-10 ATS below 40F",
      rainRecord: "9-10 ATS in rain",
      windRecord: "6-9 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 1,
      emotionalSpot: "motivated",
      travelBurdenRating: 5,
    },
    coachingProfile: {
      atsRecord: "20-22-4",
      atsAsFavorite: "12-14",
      atsAsUnderdog: "8-8",
      halftimeAdjustmentRating: 6,
      closeGameRecord: "7-9 (games decided by <7)",
      bigSpotRecord: "5-8 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 35,
        aggressiveness: 9,
        trickPlayFreq: 4,
        tempoPreference: "fast",
        offensiveScheme: "No-Huddle Spread / Air Raid",
        defensiveScheme: "4-2-5 / Cover 3",
        blitzRate: 6,
        pressureRate: "35%",
      },
      staffStability: 7,
      contractStatus: "secure",
    },
  },

  miami: {
    id: "miami",
    name: "Miami",
    abbreviation: "MIA",
    mascot: "Hurricanes",
    conference: "ACC",
    color: "#005030",
    wins: 0, losses: 0, lastSeasonRecord: "9-4 (2025)",
    rating: 78, offensiveRating: 80, defensiveRating: 75, spRating: 12.6,
    apRank: 20,
    recruitingRank: 15,
    coachName: "Mario Cristobal", coachRecord: "36-22",
    stats: {
      pointsPerGame: 31.4, pointsAllowedPerGame: 26.8,
      yardsPerGame: 412.4, yardsAllowedPerGame: 362.1,
      passingYardsPerGame: 252.4, rushingYardsPerGame: 160.0,
      turnoversPerGame: 1.2, turnoversForced: 1.6,
      thirdDownPct: 0.43, redZonePct: 0.82,
      sacks: 2.4, sacksAllowed: 2.0,
    },
    atsRecord: { wins: 24, losses: 18, pushes: 2, pct: 0.571 },
    situational: {
      atsFavorite:   { wins: 16, losses: 12, pct: 0.571 },
      atsUnderdog:   { wins: 8,  losses: 6,  pct: 0.571 },
      atsHome:       { wins: 16, losses: 7,  pct: 0.696 },
      atsAway:       { wins: 8,  losses: 11, pct: 0.421 },
      afterLoss:     { wins: 4,  losses: 3,  pct: 0.571 },
      afterBigWin:   { wins: 6,  losses: 6,  pct: 0.500 },
      vsRanked:      { wins: 8,  losses: 7,  pct: 0.533 },
      vsUnranked:    { wins: 16, losses: 11, pct: 0.593 },
      nightGame:     { wins: 13, losses: 7,  pct: 0.650 },
      bowl:          { wins: 3,  losses: 3,  pct: 0.500 },
      firstGame:     { wins: 2,  losses: 1,  pct: 0.667 },
      road:          { wins: 8,  losses: 11, pct: 0.421 },
      neutral:       { wins: 2,  losses: 2,  pct: 0.500 },
    },
    programHealth: {
      nilStrength: 86,
      transferPortalRating: 82,
      coachHotSeat: 4,
      programMomentum: "stable",
      fanMorale: 78,
      lockerRoomCohesion: 76,
      depthChartStability: 74,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 1,
      coldWeatherRecord: "3-13 ATS below 40F",
      rainRecord: "12-6 ATS in rain",
      windRecord: "5-9 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 0,
      emotionalSpot: "motivated",
      travelBurdenRating: 2,
    },
    coachingProfile: {
      atsRecord: "24-18-2",
      atsAsFavorite: "16-12",
      atsAsUnderdog: "8-6",
      halftimeAdjustmentRating: 7,
      closeGameRecord: "10-6 (games decided by <7)",
      bigSpotRecord: "8-5 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 46,
        aggressiveness: 8,
        trickPlayFreq: 5,
        tempoPreference: "balanced",
        offensiveScheme: "Power Spread / Pro-Style",
        defensiveScheme: "4-2-5 / Cover 2 Man",
        blitzRate: 7,
        pressureRate: "41%",
      },
      staffStability: 8,
      contractStatus: "secure",
    },
  },

  auburn: {
    id: "auburn", name: "Auburn", abbreviation: "AUB", mascot: "Tigers",
    conference: "SEC", color: "#F26522",
    wins: 0, losses: 0, lastSeasonRecord: "8-5 (2025)",
    rating: 73, offensiveRating: 71, defensiveRating: 75, spRating: 7.4,
    recruitingRank: 16, coachName: "Hugh Freeze", coachRecord: "113-79",
    stats: {
      pointsPerGame: 28.4, pointsAllowedPerGame: 24.1,
      yardsPerGame: 398.2, yardsAllowedPerGame: 342.7,
      passingYardsPerGame: 228.4, rushingYardsPerGame: 169.8,
      turnoversPerGame: 1.4, turnoversForced: 1.6,
      thirdDownPct: 0.40, redZonePct: 0.78, sacks: 2.1, sacksAllowed: 2.4,
    },
    atsRecord: { wins: 19, losses: 21, pushes: 2, pct: 0.475 },
    situational: {
      atsFavorite:   { wins: 8,  losses: 10, pct: 0.444 },
      atsUnderdog:   { wins: 11, losses: 11, pct: 0.500 },
      atsHome:       { wins: 10, losses: 10, pct: 0.500 },
      atsAway:       { wins: 9,  losses: 11, pct: 0.450 },
      afterLoss:     { wins: 5,  losses: 4,  pct: 0.556 },
      afterBigWin:   { wins: 4,  losses: 5,  pct: 0.444 },
      vsRanked:      { wins: 4,  losses: 7,  pct: 0.364 },
      vsUnranked:    { wins: 15, losses: 14, pct: 0.517 },
      nightGame:     { wins: 8,  losses: 9,  pct: 0.471 },
      bowl:          { wins: 2,  losses: 2,  pct: 0.500 },
      firstGame:     { wins: 2,  losses: 1,  pct: 0.667 },
      road:          { wins: 9,  losses: 11, pct: 0.450 },
      neutral:       { wins: 0,  losses: 0,  pct: 0.500 },
    },
    programHealth: {
      nilStrength: 72, transferPortalRating: 74, coachHotSeat: 5,
      programMomentum: "stable", fanMorale: 68,
      lockerRoomCohesion: 72, depthChartStability: 74,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: -2,
      coldWeatherRecord: "3-8 ATS below 40F",
      rainRecord: "8-7 ATS in rain",
      windRecord: "4-7 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 0,
      emotionalSpot: "neutral",
      travelBurdenRating: 2,
    },
    coachingProfile: {
      atsRecord: "19-21-2",
      atsAsFavorite: "8-10",
      atsAsUnderdog: "11-11",
      halftimeAdjustmentRating: 7,
      closeGameRecord: "7-8 (games decided by <7)",
      bigSpotRecord: "4-7 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 42,
        aggressiveness: 8,
        trickPlayFreq: 4,
        tempoPreference: "fast",
        offensiveScheme: "Pro-Style / RPO",
        defensiveScheme: "4-2-5 / Cover 2",
        blitzRate: 6,
        pressureRate: "35%",
      },
      staffStability: 6,
      contractStatus: "stable",
    },
  },
  florida: {
    id: "florida", name: "Florida", abbreviation: "UF", mascot: "Gators",
    conference: "SEC", color: "#003087",
    wins: 0, losses: 0, lastSeasonRecord: "7-5 (2025)",
    rating: 72, offensiveRating: 73, defensiveRating: 70, spRating: 6.4,
    recruitingRank: 13, coachName: "Jon Sumrall", coachRecord: "27-13",
    stats: {
      pointsPerGame: 26.8, pointsAllowedPerGame: 26.2,
      yardsPerGame: 372.4, yardsAllowedPerGame: 358.1,
      passingYardsPerGame: 218.6, rushingYardsPerGame: 153.8,
      turnoversPerGame: 1.5, turnoversForced: 1.4,
      thirdDownPct: 0.38, redZonePct: 0.75, sacks: 2.0, sacksAllowed: 2.6,
    },
    atsRecord: { wins: 17, losses: 22, pushes: 1, pct: 0.436 },
    situational: {
      atsFavorite:   { wins: 7,  losses: 10, pct: 0.412 },
      atsUnderdog:   { wins: 10, losses: 12, pct: 0.455 },
      atsHome:       { wins: 9,  losses: 11, pct: 0.450 },
      atsAway:       { wins: 8,  losses: 11, pct: 0.421 },
      afterLoss:     { wins: 4,  losses: 5,  pct: 0.444 },
      afterBigWin:   { wins: 3,  losses: 5,  pct: 0.375 },
      vsRanked:      { wins: 3,  losses: 8,  pct: 0.273 },
      vsUnranked:    { wins: 14, losses: 14, pct: 0.500 },
      nightGame:     { wins: 7,  losses: 10, pct: 0.412 },
      bowl:          { wins: 1,  losses: 2,  pct: 0.333 },
      firstGame:     { wins: 1,  losses: 2,  pct: 0.333 },
      road:          { wins: 8,  losses: 11, pct: 0.421 },
      neutral:       { wins: 1,  losses: 1,  pct: 0.500 },
    },
    programHealth: {
      nilStrength: 74, transferPortalRating: 72, coachHotSeat: 8,
      programMomentum: "declining", fanMorale: 58,
      lockerRoomCohesion: 64, depthChartStability: 68,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: -3,
      coldWeatherRecord: "2-9 ATS below 40F",
      rainRecord: "9-8 ATS in rain",
      windRecord: "4-8 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 0,
      emotionalSpot: "neutral",
      travelBurdenRating: 3,
    },
    coachingProfile: {
      atsRecord: "17-22-1",
      atsAsFavorite: "7-10",
      atsAsUnderdog: "10-12",
      halftimeAdjustmentRating: 6,
      closeGameRecord: "6-9 (games decided by <7)",
      bigSpotRecord: "3-8 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 40,
        aggressiveness: 7,
        trickPlayFreq: 3,
        tempoPreference: "moderate",
        offensiveScheme: "Spread / RPO",
        defensiveScheme: "4-3 / Cover 4",
        blitzRate: 5,
        pressureRate: "30%",
      },
      staffStability: 5,
      contractStatus: "hot seat",
    },
  },
  florida_state: {
    id: "florida_state", name: "Florida State", abbreviation: "FSU",
    mascot: "Seminoles", conference: "ACC", color: "#782F40",
    wins: 0, losses: 0, lastSeasonRecord: "9-4 (2025)",
    rating: 79, offensiveRating: 78, defensiveRating: 80, spRating: 11.8,
    apRank: 22,
    recruitingRank: 14, coachName: "Mike Norvell", coachRecord: "50-31",
    stats: {
      pointsPerGame: 32.6, pointsAllowedPerGame: 20.8,
      yardsPerGame: 418.4, yardsAllowedPerGame: 318.2,
      passingYardsPerGame: 244.8, rushingYardsPerGame: 173.6,
      turnoversPerGame: 1.2, turnoversForced: 1.8,
      thirdDownPct: 0.43, redZonePct: 0.82, sacks: 2.6, sacksAllowed: 2.1,
    },
    atsRecord: { wins: 22, losses: 18, pushes: 2, pct: 0.550 },
    situational: {
      atsFavorite:   { wins: 12, losses: 8,  pct: 0.600 },
      atsUnderdog:   { wins: 10, losses: 10, pct: 0.500 },
      atsHome:       { wins: 12, losses: 8,  pct: 0.600 },
      atsAway:       { wins: 10, losses: 10, pct: 0.500 },
      afterLoss:     { wins: 5,  losses: 3,  pct: 0.625 },
      afterBigWin:   { wins: 6,  losses: 4,  pct: 0.600 },
      vsRanked:      { wins: 5,  losses: 8,  pct: 0.385 },
      vsUnranked:    { wins: 17, losses: 10, pct: 0.630 },
      nightGame:     { wins: 10, losses: 7,  pct: 0.588 },
      bowl:          { wins: 3,  losses: 2,  pct: 0.600 },
      firstGame:     { wins: 2,  losses: 1,  pct: 0.667 },
      road:          { wins: 10, losses: 10, pct: 0.500 },
      neutral:       { wins: 2,  losses: 1,  pct: 0.667 },
    },
    programHealth: {
      nilStrength: 78, transferPortalRating: 76, coachHotSeat: 3,
      programMomentum: "rising", fanMorale: 76,
      lockerRoomCohesion: 78, depthChartStability: 80,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: -2,
      coldWeatherRecord: "4-8 ATS below 40F",
      rainRecord: "10-7 ATS in rain",
      windRecord: "5-6 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 0,
      emotionalSpot: "motivated",
      travelBurdenRating: 2,
    },
    coachingProfile: {
      atsRecord: "22-18-2",
      atsAsFavorite: "12-8",
      atsAsUnderdog: "10-10",
      halftimeAdjustmentRating: 7,
      closeGameRecord: "8-7 (games decided by <7)",
      bigSpotRecord: "5-8 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 42,
        aggressiveness: 7,
        trickPlayFreq: 4,
        tempoPreference: "moderate",
        offensiveScheme: "Pro-Style / RPO",
        defensiveScheme: "4-2-5 / Cover 3",
        blitzRate: 6,
        pressureRate: "32%",
      },
      staffStability: 7,
      contractStatus: "secure",
    },
  },
  wisconsin: {
    id: "wisconsin", name: "Wisconsin", abbreviation: "WIS", mascot: "Badgers",
    conference: "Big Ten", color: "#C5050C",
    wins: 0, losses: 0, lastSeasonRecord: "8-4 (2025)",
    rating: 74, offensiveRating: 70, defensiveRating: 80, spRating: 8.2,
    recruitingRank: 21, coachName: "Luke Fickell", coachRecord: "96-37",
    stats: {
      pointsPerGame: 27.4, pointsAllowedPerGame: 21.6,
      yardsPerGame: 362.8, yardsAllowedPerGame: 298.4,
      passingYardsPerGame: 198.4, rushingYardsPerGame: 164.4,
      turnoversPerGame: 1.1, turnoversForced: 1.7,
      thirdDownPct: 0.41, redZonePct: 0.80, sacks: 2.4, sacksAllowed: 2.0,
    },
    atsRecord: { wins: 20, losses: 18, pushes: 2, pct: 0.526 },
    situational: {
      atsFavorite:   { wins: 10, losses: 8,  pct: 0.556 },
      atsUnderdog:   { wins: 10, losses: 10, pct: 0.500 },
      atsHome:       { wins: 11, losses: 9,  pct: 0.550 },
      atsAway:       { wins: 9,  losses: 9,  pct: 0.500 },
      afterLoss:     { wins: 5,  losses: 3,  pct: 0.625 },
      afterBigWin:   { wins: 5,  losses: 4,  pct: 0.556 },
      vsRanked:      { wins: 4,  losses: 8,  pct: 0.333 },
      vsUnranked:    { wins: 16, losses: 10, pct: 0.615 },
      nightGame:     { wins: 8,  losses: 8,  pct: 0.500 },
      bowl:          { wins: 2,  losses: 2,  pct: 0.500 },
      firstGame:     { wins: 2,  losses: 1,  pct: 0.667 },
      road:          { wins: 9,  losses: 9,  pct: 0.500 },
      neutral:       { wins: 2,  losses: 0,  pct: 1.000 },
    },
    programHealth: {
      nilStrength: 66, transferPortalRating: 68, coachHotSeat: 3,
      programMomentum: "stable", fanMorale: 70,
      lockerRoomCohesion: 76, depthChartStability: 78,
    },
    weatherProfile: {
      isDome: false,
      coldWeatherAdvantage: 7,
      coldWeatherRecord: "14-6 ATS below 40F",
      rainRecord: "10-8 ATS in rain",
      windRecord: "8-6 ATS in high wind",
    },
    schedule: {
      daysSinceLastGame: 245,
      isComingOffBigWin: false,
      isComingOffBigLoss: false,
      hasLookaheadGame: false,
      consecutiveRoadGames: 0,
      emotionalSpot: "neutral",
      travelBurdenRating: 3,
    },
    coachingProfile: {
      atsRecord: "20-18-2",
      atsAsFavorite: "10-8",
      atsAsUnderdog: "10-10",
      halftimeAdjustmentRating: 8,
      closeGameRecord: "9-7 (games decided by <7)",
      bigSpotRecord: "4-8 (ranked vs ranked)",
      tendencies: {
        runPassRatio: 52,
        aggressiveness: 6,
        trickPlayFreq: 2,
        tempoPreference: "slow",
        offensiveScheme: "Pro-Style / Power Run",
        defensiveScheme: "3-4 / Cover 2",
        blitzRate: 4,
        pressureRate: "25%",
      },
      staffStability: 8,
      contractStatus: "secure",
    },
  },
};

const KEY_PLAYERS = [
  /* ── OHIO STATE ── */
  { id:"p_osu_01", name:"Julian Sayin", position:"QB", teamId:"ohio_state", year:"SO", number:"8", heightWeight:"6'2\" / 210", hometown:"Carlsbad, CA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[],
    injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:5, distractionNote:"Left Alabama's system for a clean start at OSU. Carries the weight of replacing Will Howard's legacy and the pressure of Ryan Day's seat. Showed elite pocket poise in fall camp — but this is his first true road game as starter.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:79, coldWeatherRating:76, roadGameRating:74, primeTimeRating:80, consistencyRating:80, pressureRating:79, explosivePlayRating:78 },
    stats:{ gamesPlayed:0, passingYards:0, passingTDs:0, interceptions:0, completionPct:0, qbr:0, note:"No OSU game experience; transferred from Alabama" },
    scoutReport:"Elite pocket passer who showed composure in Alabama's system before making the move to Columbus. His ability to read defenses pre-snap is advanced for a first-year starter. The biggest question is how he handles 100,000+ crowd noise in his first true road start. Camp reports describe his footwork and accuracy as 'pro-ready.'" },

  { id:"p_osu_02", name:"James Peoples", position:"RB", teamId:"ohio_state", year:"SO", number:"20", heightWeight:"5'10\" / 205", hometown:"Gallatin, TN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[],
    injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Stepped into the featured role after Judkins departed to the NFL. Responded with a strong spring and camp. Coaches praise his vision and patience — built for Ryan Day's zone-run scheme.", socialMediaPattern:"quiet", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:78, roadGameRating:76, primeTimeRating:79, consistencyRating:80, pressureRating:79, explosivePlayRating:84 },
    stats:{ gamesPlayed:13, rushingYards:812, rushingTDs:9, yardsPerCarry:5.4, receivingYards:148, receivingTDs:1, receptions:18 },
    scoutReport:"Physical and patient runner who earned the starting job through relentless preparation. His vision in OSU's zone scheme mirrors what Judkins did — finds the cutback lane and falls forward. Georgia's front seven will give him his toughest test yet." },

  { id:"p_osu_03", name:"Jeremiah Smith", position:"WR", teamId:"ohio_state", year:"JR", number:"4", heightWeight:"6'3\" / 215", hometown:"Davie, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionType:null, distractionNote:"The best WR in college football enters his junior year with unfinished business. Already has a Biletnikoff Award to his name and agent contacts are formally in place. His focus in 2026 camp has been described as 'different' — he's studying film like a senior. Family relocated to Columbus and provides a grounding presence amid the mounting pressure.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 1 (top 10)", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:93, bigGameRating:96, coldWeatherRating:76, roadGameRating:90, primeTimeRating:95, consistencyRating:90, pressureRating:90, explosivePlayRating:99 },
    stats:{ gamesPlayed:15, receivingYards:1315, receivingTDs:15, receptions:76, yardsPerReception:17.3, yardsAfterCatch:612 },
    scoutReport:"Generational talent. The best WR in college football by every measurable metric. His jump from freshman phenom to elite junior WR1 has been seamless — the separation ability, the contested catch rate, the big-game performance. Georgia's secondary will scheme their entire week around containing him, which opens everything else for OSU's offense." },

  { id:"p_osu_04", name:"Brandon Inniss", position:"WR", teamId:"ohio_state", year:"JR", number:"6", heightWeight:"6'1\" / 190", hometown:"Hollywood, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Florida native who transferred from Penn State and immediately found his footing in Columbus. His slot work has been standout in camp — coaches see him as Sayin's security blanket underneath while Smith draws coverage over the top.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:79, bigGameRating:77, coldWeatherRating:74, roadGameRating:76, primeTimeRating:79, consistencyRating:80, pressureRating:78, explosivePlayRating:82 },
    stats:{ gamesPlayed:13, receivingYards:614, receivingTDs:6, receptions:52, yardsPerReception:11.8 },
    scoutReport:"Reliable slot weapon who wins on short and intermediate routes. With Smith demanding double coverage, Inniss regularly sees single coverage from linebackers and nickel backs. His YAC ability keeps drives alive on third down." },

  { id:"p_osu_05", name:"Caleb Downs", position:"S", teamId:"ohio_state", year:"JR", number:"2", heightWeight:"6'0\" / 195", hometown:"Hoschton, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Transferred from Alabama in 2024 and became one of the Big Ten's elite safeties. His versatility — plays box safety, deep half, and nickel — makes him OSU's defensive quarterback. Drafted after 2025 season but spent his full Ohio State career earning this reputation.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 1", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:88, bigGameRating:86, coldWeatherRating:83, roadGameRating:82, primeTimeRating:86, consistencyRating:89, pressureRating:85, explosivePlayRating:80 },
    stats:{ gamesPlayed:14, tackles:94, interceptions:4, passDeflections:11, forcedFumbles:2, tacklesForLoss:5 },
    scoutReport:"One of the most complete safeties in college football. Reads route concepts before they develop and communicates coverage checks that keep OSU's secondary disciplined. Texas's Arch Manning will know where Downs is on every play — a chess match within a chess match." },

  { id:"p_osu_06", name:"Davison Igbinosun", position:"CB", teamId:"ohio_state", year:"SR", number:"1", heightWeight:"6'1\" / 185", hometown:"Orange, NJ",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:3, distractionNote:"Physical press corner who transferred from Ole Miss and has developed into a first-round projection. Known for his aggressive technique at the line. Camp has shown continued growth in his zone reads.", socialMediaPattern:"normal", nflDraftStatus:"projected round 1-2", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:78, roadGameRating:79, primeTimeRating:83, consistencyRating:80, pressureRating:81, explosivePlayRating:80 },
    stats:{ gamesPlayed:13, interceptions:4, passDeflections:13, tackles:44 },
    scoutReport:"Long, physical corner who disrupts at the line of scrimmage. His press technique challenges WRs from the first snap. Texas's Ryan Wingo will be his primary matchup — if Igbinosun wins this battle consistently, Manning's release options narrow significantly." },

  /* ── GEORGIA ── */
  { id:"p_uga_01", name:"Gunner Stockton", position:"QB", teamId:"georgia", year:"SR", number:"14", heightWeight:"6'1\" / 215", hometown:"Tiger, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Georgia's most natural leader since Jake Fromm. Small-town kid who has never been involved in off-field issues. Quietly signed a $600K NIL deal in July — no drama. Teammates unanimously described him as the hardest worker in camp.", socialMediaPattern:"quiet", nflDraftStatus:"returning", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:86, bigGameRating:83, coldWeatherRating:75, roadGameRating:84, primeTimeRating:85, consistencyRating:88, pressureRating:84, explosivePlayRating:76 },
    stats:{ gamesPlayed:13, passingYards:3284, passingTDs:28, interceptions:5, completionPct:68.9, qbr:84.7, rushingYards:312, rushingTDs:4 },
    scoutReport:"Game manager elevated to playmaker by Georgia's elite surrounding talent. His best attribute is ball security in the most complex defensive environments. Watch his patience vs. Clemson's zone coverage — he's historically struggled with extended zone schemes but has shown improvement." },

  { id:"p_uga_02", name:"Nate Frazier", position:"RB", teamId:"georgia", year:"SO", number:"3", heightWeight:"5'10\" / 198", hometown:"Buford, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Georgia native who was born to play in Athens. Burst onto the scene as a true freshman and enters 2026 as the featured back. Explosive in space with elite burst — Kirby Smart's scheme amplifies exactly his skill set.", socialMediaPattern:"quiet", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:74, roadGameRating:78, primeTimeRating:81, consistencyRating:79, pressureRating:80, explosivePlayRating:88 },
    stats:{ gamesPlayed:12, rushingYards:742, rushingTDs:8, yardsPerCarry:5.7, receivingYards:198, receivingTDs:2, receptions:22 },
    scoutReport:"Explosive sophomore back who benefits from Georgia's elite offensive line. His vision and burst in the zone scheme make him dangerous in the open field. Clemson's front seven will load the box — Smart will use his receiving ability to punish that with screens and checkdowns." },

  { id:"p_uga_03", name:"Rara Thomas", position:"WR", teamId:"georgia", year:"SR", number:"11", heightWeight:"6'0\" / 192", hometown:"Rome, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"medium",
    personalFlags:{ distractionLevel:3, distractionNote:"Thomas had a troubled past at Miss State but Kirby Smart's program has a track record of reforming character. He's been a model citizen since arriving. His speed (4.38 40) gives Georgia a dimension they lacked after Bell.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:72, roadGameRating:77, primeTimeRating:81, consistencyRating:79, pressureRating:78, explosivePlayRating:90 },
    stats:{ gamesPlayed:13, receivingYards:742, receivingTDs:7, receptions:54, yardsPerReception:13.7 },
    scoutReport:"Speed merchant who gives Georgia the vertical threat they needed after Bell's departure. His 4.38 speed stretches safeties and opens underneath routes for Etienne and Delp. Clemson's corner will have to respect his go route from snap one — that creates opportunities for the rest of the passing game." },

  { id:"p_uga_04", name:"Gabe Harris Jr.", position:"EDGE", teamId:"georgia", year:"JR", number:"14", heightWeight:"6'4\" / 248", hometown:"Macon, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Georgia native stepping into the featured EDGE role after Williams departed to the NFL. Spring and camp reports have been outstanding — Kirby Smart's staff is high on his development trajectory. Pure football player, zero off-field noise.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 1-2", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:84, bigGameRating:82, coldWeatherRating:82, roadGameRating:80, primeTimeRating:83, consistencyRating:82, pressureRating:88, explosivePlayRating:84 },
    stats:{ gamesPlayed:12, sacks:8.5, tacklesForLoss:14, qbHurries:28, forcedFumbles:2 },
    scoutReport:"Next in the line of elite Georgia pass rushers. Stepped into more snaps in 2025 and produced immediately. His combination of length and first-step quickness mirrors what Mykel Williams provided. Clemson's new QB will face his hardest pass-rush test on the season opener." },

  { id:"p_uga_05", name:"KJ Bolden", position:"S", teamId:"georgia", year:"SO", number:"24", heightWeight:"6'1\" / 192", hometown:"Buford, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Georgia native and one of the most decorated safety recruits in program history. Smooth transition from freshman to starter role. His instincts and closing speed are drawing comparisons to Malaki Starks from coaches and scouts in camp.", socialMediaPattern:"quiet", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:78, roadGameRating:78, primeTimeRating:81, consistencyRating:82, pressureRating:80, explosivePlayRating:80 },
    stats:{ gamesPlayed:12, tackles:72, interceptions:3, passDeflections:9, forcedFumbles:1, tacklesForLoss:3 },
    scoutReport:"The heir apparent to Starks' role in Georgia's elite secondary. His instincts in zone coverage are advanced for a sophomore. Clemson will try to attack him in single coverage — if he holds up, Georgia's secondary remains historically elite." },

  { id:"p_uga_06", name:"Oscar Delp", position:"TE", teamId:"georgia", year:"SR", number:"19", heightWeight:"6'5\" / 250", hometown:"Alpharetta, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Reliable veteran who extended his college career specifically to be in the running game as a blocker-receiver. No drama. His NIL deal with Chick-fil-A (Athens location) has become a running joke on the team — in a positive way.", socialMediaPattern:"normal", nflDraftStatus:"projected round 5-6", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:80, roadGameRating:77, primeTimeRating:79, consistencyRating:86, pressureRating:79, explosivePlayRating:72 },
    stats:{ gamesPlayed:13, receivingYards:412, receivingTDs:5, receptions:38, yardsPerReception:10.8 },
    scoutReport:"The chess piece in Georgia's offense. Aligns at inline TE, slot, and H-back. Clemson's DC will have to account for him in every formation — he creates mismatches against LBs and opens space for Etienne underneath. Clutch in goal-line situations." },

  /* ── ALABAMA ── */
  { id:"p_ala_01", name:"Ty Simpson", position:"QB", teamId:"alabama", year:"SR", number:"12", heightWeight:"6'2\" / 215", hometown:"Martin, TN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:5, distractionNote:"2025 Alabama starter who enters 2026 as a veteran with full-season starting experience. Led the Crimson Tide through a competitive SEC schedule. His technical polish is unquestioned but the ceiling questions of last year have been partially answered — he is a capable manager who makes the most of Alabama's talent advantage.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:true, nilSatisfaction:"medium", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:79, bigGameRating:76, coldWeatherRating:74, roadGameRating:73, primeTimeRating:77, consistencyRating:79, pressureRating:76, explosivePlayRating:76 },
    stats:{ gamesPlayed:13, passingYards:2842, passingTDs:22, interceptions:7, completionPct:64.8, qbr:81.2, rushingYards:198, rushingTDs:3, note:"2025 season starter at Alabama" },
    scoutReport:"Veteran pocket passer with a full year as Alabama's starter under his belt. His technical precision in the quick game and ability to distribute to elite weapons is his calling card. Michigan's front seven will force him into tougher decisions than he faced last year — how he responds to early pressure defines the game's narrative." },

  { id:"p_ala_02", name:"Ryan Williams", position:"WR", teamId:"alabama", year:"JR", number:"2", heightWeight:"6'1\" / 195", hometown:"Saraland, AL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:3, distractionType:null, distractionNote:"True Alabama kid — dreamed of playing for Bama since age 6. Navigating the enormous spotlight of being the next great Alabama WR while only being 19. Some camp sources noted he looked 'overwhelmed' in coverage-heavy periods early in camp but settled in by week 3. His high school coach says he handles pressure better than any kid he's coached.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", academicStatus:"good standing", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:85, coldWeatherRating:68, roadGameRating:79, primeTimeRating:88, consistencyRating:79, pressureRating:80, explosivePlayRating:96 },
    stats:{ gamesPlayed:12, receivingYards:1051, receivingTDs:13, receptions:62, yardsPerReception:16.9 },
    scoutReport:"The most physically gifted sophomore receiver in America. Ran a 4.34 laser-timed in Alabama's private workouts. Michigan's Will Johnson is the one corner who could challenge him — this is the marquee individual matchup. Williams is spectacular when it's one-on-one but has shown vulnerability to physical press coverage." },

  { id:"p_ala_03", name:"Jam Miller", position:"RB", teamId:"alabama", year:"SR", number:"26", heightWeight:"5'11\" / 208", hometown:"Roswell, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Patient veteran who has waited his turn and arrives in 2026 as Alabama's featured back. Reliable in the zone scheme with good pass-protection instincts. Teammates describe his leadership as quiet but consistent.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:75, roadGameRating:77, primeTimeRating:79, consistencyRating:82, pressureRating:80, explosivePlayRating:80 },
    stats:{ gamesPlayed:11, rushingYards:712, rushingTDs:7, yardsPerCarry:5.2, receivingYards:178, receivingTDs:1, receptions:22 },
    scoutReport:"Dependable SEC back who earns every yard. Alabama's offense requires the RB to be a true three-down player — Miller handles protection assignments and checkdown routes with veteran composure. Michigan's front seven will be his biggest test." },

  { id:"p_ala_04", name:"Jhonzae Pierre", position:"EDGE", teamId:"alabama", year:"JR", number:"5", heightWeight:"6'4\" / 245", hometown:"Port Arthur, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Texas native who chose Bama over several SEC rivals. Emerged as Alabama's best pass rusher after Campbell departed to the NFL. His motor and hand-fighting are the calling cards in DeBoer's system.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:78, roadGameRating:79, primeTimeRating:81, consistencyRating:80, pressureRating:86, explosivePlayRating:82 },
    stats:{ gamesPlayed:12, sacks:7.5, tacklesForLoss:13, qbHurries:28, forcedFumbles:2 },
    scoutReport:"Alabama's pass-rush identity player in 2026. His combination of length and first-step puts left tackles on edge from the first snap. Michigan's Bryce Underwood will feel Pierre's presence early — if Alabama establishes defensive pressure by the second drive, Michigan's inexperienced QB faces a long night." },

  { id:"p_ala_05", name:"Jamil Muhammad", position:"DT", teamId:"alabama", year:"JR", number:"90", heightWeight:"6'3\" / 305", hometown:"Hoover, AL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Home-state kid who chose Alabama over Georgia with one goal: replace Tim Keenan's production. He's been relentless in camp. Keenan mentored him personally throughout the offseason.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:76, bigGameRating:74, coldWeatherRating:80, roadGameRating:73, primeTimeRating:75, consistencyRating:77, pressureRating:82, explosivePlayRating:68 },
    stats:{ gamesPlayed:13, tackles:28, sacks:2.5, tacklesForLoss:6, pressures:18 },
    scoutReport:"Interior presence who has absorbed Tim Keenan's mentorship and is ready to step into the starting role. His motor and relentlessness in camp have impressed coaches. Michigan's interior OL will be his first major test — if he can command a double team, it frees Campbell to attack the perimeter." },

  { id:"p_ala_06", name:"Domani Jackson", position:"CB", teamId:"alabama", year:"JR", number:"5", heightWeight:"6'1\" / 192", hometown:"Corona, CA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Premium corner recruit who has developed steadily under DeBoer's staff. His physicality in press coverage fits Alabama's aggressive scheme. Camp has produced his best practices to date per coaching staff.", socialMediaPattern:"normal", nflDraftStatus:"projected round 2-3", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:79, coldWeatherRating:74, roadGameRating:77, primeTimeRating:80, consistencyRating:79, pressureRating:78, explosivePlayRating:80 },
    stats:{ gamesPlayed:12, interceptions:3, passDeflections:9, tackles:36 },
    scoutReport:"Physical press corner who disrupts route timing at the line. Michigan's receivers will face an immediate test against Alabama's aggressive man coverage scheme. His size advantage against smaller slot receivers gives Alabama a natural matchup edge in short-yardage passing situations." },

  /* ── TEXAS ── */
  { id:"p_tex_01", name:"Arch Manning", position:"QB", teamId:"texas", year:"SR", number:"16", heightWeight:"6'4\" / 218", hometown:"New Orleans, LA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:4, distractionType:"social_media", distractionNote:"The most-discussed player in college football history before taking a snap. The Manning family name creates constant media pressure that doesn't exist for any other player. Sources note Arch has been 'quieter than usual' this camp — coaches attribute this to focused preparation but family members who've spoken to him note he mentioned feeling 'the weight of expectations.' Instagram following grew by 800K in the offseason. His grandfather called a Texas radio show saying Arch is 'ready.' Managing the narrative is part of his daily routine.", socialMediaPattern:"active", nflDraftStatus:"not eligible", academicStatus:"good standing", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:86, bigGameRating:83, coldWeatherRating:72, roadGameRating:80, primeTimeRating:85, consistencyRating:84, pressureRating:85, explosivePlayRating:84 },
    stats:{ gamesPlayed:12, passingYards:3547, passingTDs:31, interceptions:4, completionPct:70.2, qbr:91.4, rushingYards:198, rushingTDs:2 },
    scoutReport:"Everything you want in a franchise QB — size, arm talent, football IQ, accuracy in the intermediate game. His efficiency in the pocket is impressive (only 4 INTs in 12 games). The road test at Ohio Stadium — 100,000+ fans, night atmosphere — will be his biggest challenge yet. Watch his response after his first incompletion under pressure." },

  { id:"p_tex_02", name:"Ryan Wingo", position:"WR", teamId:"texas", year:"JR", number:"5", heightWeight:"6'1\" / 192", hometown:"St. Louis, MO",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Transferred from Missouri and immediately became Manning's top target in camp. Physical receiver who wins on contested balls and fights for extra yards. Coaches rave about his chemistry with Arch in the intermediate game.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:72, roadGameRating:78, primeTimeRating:81, consistencyRating:81, pressureRating:80, explosivePlayRating:86 },
    stats:{ gamesPlayed:12, receivingYards:842, receivingTDs:8, receptions:58, yardsPerReception:14.5 },
    scoutReport:"Physical WR who wins in contested situations — exactly what Manning needs against elite secondaries. Ohio State's corners will contest every route; Wingo's physicality makes him a reliable target in traffic. His intermediate route running gives Manning a consistent 8-12 yard option on second and third downs." },

  { id:"p_tex_03", name:"Caleb Douglas", position:"TE", teamId:"texas", year:"JR", number:"81", heightWeight:"6'5\" / 247", hometown:"Houston, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:4, distractionNote:"Took over starting spot after Helm left early. His NIL deal with a Houston-based oil company created jealousy in the locker room — teammates have joked about it but it's been a mild distraction.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:76, coldWeatherRating:78, roadGameRating:74, primeTimeRating:77, consistencyRating:80, pressureRating:78, explosivePlayRating:72 },
    stats:{ gamesPlayed:12, receivingYards:412, receivingTDs:4, receptions:36, yardsPerReception:11.4 },
    scoutReport:"Strong blocker who has developed into a reliable receiver out of the inline position. His size creates coverage problems for linebackers in seam routes. As the new starter replacing Helm, he'll need to earn Arch Manning's trust quickly — early camp reports suggest the chemistry is developing faster than expected." },

  { id:"p_tex_04", name:"Colin Simmons", position:"EDGE", teamId:"texas", year:"JR", number:"11", heightWeight:"6'3\" / 243", hometown:"Duncanville, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Home-state star from Duncanville who chose Texas over everyone. Emerged as one of the most disruptive pass rushers in the SEC in his first two seasons. His motor is relentless — coaches have never had to motivate him.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 1", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:86, bigGameRating:84, coldWeatherRating:78, roadGameRating:82, primeTimeRating:85, consistencyRating:85, pressureRating:92, explosivePlayRating:86 },
    stats:{ gamesPlayed:13, sacks:11.5, tacklesForLoss:17, qbHurries:38, forcedFumbles:3 },
    scoutReport:"One of the best young pass rushers in the country. His first-step explosiveness and hand technique have NFL scouts excited. Ohio State's right tackle will be tested from snap one — Simmons on the edge is the primary defensive matchup in this game." },

  { id:"p_tex_04c", name:"Alfred Collins", position:"DL", teamId:"texas", year:"SR", number:"95", heightWeight:"6'5\" / 315", hometown:"Austin, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Hometown Austin kid who turned down the NFL to play his senior year in front of family. His mother attends every practice. Zero off-field issues, total professional.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:84, bigGameRating:82, coldWeatherRating:79, roadGameRating:80, primeTimeRating:83, consistencyRating:85, pressureRating:88, explosivePlayRating:76 },
    stats:{ gamesPlayed:13, tackles:42, sacks:7.5, tacklesForLoss:13, pressures:28, qbHurries:22 },
    scoutReport:"The hometown hero anchoring Texas's defensive interior. Collins turned down significant NFL money to play in Austin one more year. His motor and professional preparation set the tone for the entire defense. Ohio State's center will not get a comfortable snap all game." },

  { id:"p_tex_05", name:"Malik Muhammad", position:"CB", teamId:"texas", year:"JR", number:"20", heightWeight:"6'1\" / 185", hometown:"Beaumont, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:3, distractionType:null, distractionNote:"The most talented corner in America under the radar. Dealing with the challenge of being assigned to Jeremiah Smith — potentially the most difficult assignment any corner has this season. Camp has gone well physically but coaches note he's been 'quiet and inward' the last week — normal pre-game mental preparation or nerves? Monitor his warmup energy.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:70, roadGameRating:75, primeTimeRating:82, consistencyRating:80, pressureRating:81, explosivePlayRating:84 },
    stats:{ gamesPlayed:12, interceptions:3, passDeflections:11, tackles:42 },
    scoutReport:"Elite physical tools but only in his second season against elite competition. The Jeremiah Smith matchup is the game-within-the-game — if Muhammad can limit Smith to under 80 yards, Texas has a legitimate shot. If Smith goes for 150+ (as he did against six opponents last year), Texas loses." },

  { id:"p_tex_06", name:"Jaydon Blue", position:"RB", teamId:"texas", year:"SR", number:"23", heightWeight:"5'11\" / 205", hometown:"Klein, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[{type:"fumble-prone history",year:2024,gamesAffected:0,chronic:false}], injuryProneRating:2, impact:"medium",
    personalFlags:{ distractionLevel:3, distractionNote:"Blue has waited 3 years for his turn as the featured back. He's electric in open space but has fumble-prone tendencies in his history. The fumbling has been corrected in camp, per coaches — but it's the narrative he can't escape.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:72, roadGameRating:76, primeTimeRating:79, consistencyRating:78, pressureRating:80, explosivePlayRating:88 },
    stats:{ gamesPlayed:12, rushingYards:682, rushingTDs:7, yardsPerCarry:5.3, receivingYards:198, receivingTDs:1, receptions:26 },
    scoutReport:"Explosive in open space with genuine home-run threat ability. His fumble history is the one narrative that haunts his buildup to the featured role — coaches say it's corrected but Ohio State's defense will try to jar the ball early to test it. His receiving ability out of the backfield makes him a genuine three-down threat." },

  /* ── NOTRE DAME ── */
  { id:"p_nd_01", name:"CJ Carr", position:"QB", teamId:"notre_dame", year:"JR", number:"7", heightWeight:"6'2\" / 210", hometown:"Saline, MI",
    injuryStatus:"questionable", practiceStatus:"limited", injuryType:"wrist (sprain)",
    injuryHistory:[], injuryProneRating:3, impact:"high",
    personalFlags:{ distractionLevel:7, distractionType:"family", distractionNote:"Grandson of legendary Michigan coach Lloyd Carr, who has been dealing with serious health complications this summer. Multiple family members have been in and out of Ann Arbor hospitals. CJ has flown home three times since July 4th. Sources close to the family say his grandfather is 'stable but it's been hard on CJ.' He's still competing fully when at practice but his emotional state is a genuine question mark. Coaches have been privately concerned — 'he's carrying a lot' per one team source. Watch for signs of pressing or forcing plays early when the nerves are highest.", socialMediaPattern:"quiet", nflDraftStatus:"not eligible", academicStatus:"good standing", agentContact:false, nilSatisfaction:"medium", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:76, bigGameRating:74, coldWeatherRating:77, roadGameRating:73, primeTimeRating:78, consistencyRating:74, pressureRating:75, explosivePlayRating:78 },
    stats:{ gamesPlayed:13, passingYards:3021, passingTDs:24, interceptions:7, completionPct:65.4, qbr:79.3, rushingYards:274, rushingTDs:3 },
    scoutReport:"Talented young QB with legitimate big-arm talent but still raw in his reads. The wrist sprain is the immediate concern — he threw less than 20 passes in Wednesday practice. The family situation adds another layer of uncertainty. If he plays at less than 80%, backup Steve Angeli may see significant snaps vs. Oregon's elite D." },

  { id:"p_nd_02", name:"Aneyas Williams", position:"RB", teamId:"notre_dame", year:"JR", number:"22", heightWeight:"5'10\" / 205", hometown:"Cass City, MI",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Notre Dame's featured back entering 2026. Physical runner with excellent pass protection instincts — fits Marcus Freeman's style of football. Zero off-field issues. Teammates describe him as a quiet leader through production.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:84, roadGameRating:79, primeTimeRating:81, consistencyRating:83, pressureRating:82, explosivePlayRating:82 },
    stats:{ gamesPlayed:12, rushingYards:812, rushingTDs:9, yardsPerCarry:5.4, receivingYards:212, receivingTDs:1, receptions:24 },
    scoutReport:"Physical downhill runner who wins in short-yardage and goal-line. Notre Dame's offense flows through the run game under Freeman — Williams is the engine. Oregon's defensive front will crowd the box; his receiving ability in the flat is a check-down release valve for Carr." },

  { id:"p_nd_03", name:"Jaden Greathouse", position:"WR", teamId:"notre_dame", year:"JR", number:"1", heightWeight:"6'2\" / 198", hometown:"Austin, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Texas native who emerged as Carr's favorite target. Physical receiver who wins contested balls and creates after the catch. His development trajectory has been one of Notre Dame's best stories over the last two seasons.", socialMediaPattern:"normal", nflDraftStatus:"projected round 2-3", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:83, bigGameRating:82, coldWeatherRating:78, roadGameRating:80, primeTimeRating:84, consistencyRating:82, pressureRating:82, explosivePlayRating:86 },
    stats:{ gamesPlayed:13, receivingYards:842, receivingTDs:8, receptions:58, yardsPerReception:14.5 },
    scoutReport:"Notre Dame's WR1 who wins on vertical routes and in the red zone. His 6'2\" frame gives Carr a reliable jump-ball target. Oregon's corners will need to play physical press against him — and that creates run-after-catch opportunities for the rest of Notre Dame's offense." },

  { id:"p_nd_04", name:"Mitchell Evans", position:"TE", teamId:"notre_dame", year:"JR", number:"88", heightWeight:"6'6\" / 252", hometown:"Homewood, IL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Illinois native who has developed into one of the better receiving TEs in the ACC. His size creates problems for linebackers in the seam. Chemistry with Carr is among the best on the roster.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:82, roadGameRating:78, primeTimeRating:79, consistencyRating:82, pressureRating:79, explosivePlayRating:74 },
    stats:{ gamesPlayed:13, receivingYards:514, receivingTDs:5, receptions:42, yardsPerReception:12.2 },
    scoutReport:"Mismatch creator at TE who forces linebackers into unfavorable coverage situations. Oregon's LB corps will be tested in space against Evans on seam and crossing routes. In Notre Dame's two-TE sets he demands defensive attention on every snap." },

  { id:"p_nd_05", name:"Jack Kiser", position:"LB", teamId:"notre_dame", year:"SR", number:"35", heightWeight:"6'1\" / 228", hometown:"Westfield, IN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Indiana native who has been Notre Dame's defensive captain for two seasons. Leads by example — the first in the film room every morning. His football IQ and communication skills make him the defensive quarterback in Freeman's system.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:85, bigGameRating:83, coldWeatherRating:85, roadGameRating:82, primeTimeRating:84, consistencyRating:88, pressureRating:83, explosivePlayRating:76 },
    stats:{ gamesPlayed:13, tackles:108, sacks:4.5, tacklesForLoss:12, interceptions:2, passDeflections:5 },
    scoutReport:"Notre Dame's defensive captain who diagnoses plays before the snap. His communication anchors the entire defense's pre-snap adjustments. Oregon's Dante Moore will identify him as a check-down target — Kiser's coverage ability against RBs and TEs out of the backfield will be a key matchup." },

  { id:"p_nd_06", name:"Christian Gray", position:"CB", teamId:"notre_dame", year:"JR", number:"6", heightWeight:"6'0\" / 186", hometown:"Bolingbrook, IL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Illinois native in Freeman's program who has developed steadily. Physical corner with good ball skills. Camp has been his strongest yet — the step from depth to starter has been seamless per coaching staff.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:76, coldWeatherRating:79, roadGameRating:75, primeTimeRating:78, consistencyRating:78, pressureRating:77, explosivePlayRating:78 },
    stats:{ gamesPlayed:12, interceptions:2, passDeflections:8, tackles:36 },
    scoutReport:"Physical press corner who fits Notre Dame's aggressive defensive identity. Oregon's Dakorien Moore will challenge his technique from the outside — if Gray holds in press coverage, Notre Dame's defense can keep Oregon's passing game in check on early downs." },

  /* ── PENN STATE ── */
  { id:"p_psu_01", name:"Ethan Grunkemeyer", position:"QB", teamId:"penn_state", year:"R-FR", number:"14", heightWeight:"6'3\" / 205", hometown:"Westfield, IN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:5, distractionNote:"Took over after Drew Allar's season-ending ankle injury on Oct 11, 2025 and led Penn State to a Pinstripe Bowl win. Now enters 2026 as the unquestioned starter after an exceptional offseason. The rapid rise from RS-freshman backup to program starter is both a strength (he's proven) and a pressure point — the hype now follows him.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:79, coldWeatherRating:82, roadGameRating:76, primeTimeRating:80, consistencyRating:78, pressureRating:79, explosivePlayRating:80 },
    stats:{ gamesPlayed:8, passingYards:1842, passingTDs:16, interceptions:4, completionPct:66.8, qbr:83.4, rushingYards:198, rushingTDs:3, note:"Took over mid-season 2025 after Allar injury" },
    scoutReport:"Earned his starting spot the hard way — stepping in mid-season under Big Ten playoff pressure and delivering. His poise in the bowl win showed mental maturity beyond his experience. The full offseason as starter-in-chief has sharpened his command of Campbell's system. Miami's defense will be his first true road challenge as a veteran starter." },

  { id:"p_psu_02", name:"Nick Singleton", position:"RB", teamId:"penn_state", year:"JR", number:"10", heightWeight:"6'0\" / 212", hometown:"Reading, PA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[{type:"knee",year:2024,gamesAffected:4,chronic:false}], injuryProneRating:3, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Pennsylvania native who's been at Happy Valley since 2022. Fully healthy after knee procedure and described as the best he's looked in three years per coaching staff. Patient runner who lets blocks develop — perfect for Campbell's zone scheme.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:86, bigGameRating:84, coldWeatherRating:88, roadGameRating:82, primeTimeRating:83, consistencyRating:83, pressureRating:85, explosivePlayRating:86 },
    stats:{ gamesPlayed:10, rushingYards:812, rushingTDs:9, yardsPerCarry:5.8, receivingYards:148, receivingTDs:1, receptions:18 },
    scoutReport:"Physical Pennsylvania back who earns yards against conference defenses. His patience behind the line and burst through the hole are ideal for Campbell's zone-run system. Miami's front seven will face a physical test — Singleton runs downhill and punishes gap defenders." },

  { id:"p_psu_03", name:"Kaytron Allen", position:"RB", teamId:"penn_state", year:"SR", number:"13", heightWeight:"6'0\" / 220", hometown:"New Orleans, LA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[{type:"ankle",year:2023,gamesAffected:2,chronic:false}], injuryProneRating:2, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Power back who's been one of Penn State's most consistent players for 4 years. New Orleans roots but has fully adopted Happy Valley. No drama, no portal rumors. Hard nose runner who's earned his scholarship ten times over.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"medium", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:84, bigGameRating:82, coldWeatherRating:88, roadGameRating:80, primeTimeRating:81, consistencyRating:85, pressureRating:83, explosivePlayRating:75 },
    stats:{ gamesPlayed:13, rushingYards:1014, rushingTDs:11, yardsPerCarry:5.2, receivingYards:182, receivingTDs:1, receptions:22 },
    scoutReport:"Physical downhill runner who wears defenses down. Miami's front 7 gave up 4.6 YPC last season — Allen should have success early. The hot Miami weather (85°F+ projected) typically helps larger, physical runners in the second half when opponents' conditioning fades." },

  { id:"p_psu_04", name:"Dani Dennis-Sutton", position:"EDGE", teamId:"penn_state", year:"JR", number:"45", heightWeight:"6'5\" / 252", hometown:"McDonough, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Stepped into the featured pass-rusher role after Carter departed to the NFL Draft. Built his game in Carter's shadow and now owns the position. His length and motor are drawing legitimate first-round buzz heading into 2026.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 1-2", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:86, bigGameRating:84, coldWeatherRating:84, roadGameRating:82, primeTimeRating:85, consistencyRating:83, pressureRating:91, explosivePlayRating:84 },
    stats:{ gamesPlayed:13, sacks:10.5, tacklesForLoss:16, qbHurries:34, forcedFumbles:3 },
    scoutReport:"The heir to Carter's dominant role in Penn State's pass rush. His combination of length (6'5\") and first-step quickness puts tackles in a losing battle from the start. Miami's QB Carson Beck throws quickly under pressure — Dennis-Sutton must win on first movement, not second. The early pressure he generates defines Penn State's defensive identity." },

  { id:"p_psu_05", name:"Zane Durant", position:"DT", teamId:"penn_state", year:"JR", number:"99", heightWeight:"6'3\" / 290", hometown:"Chester, PA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Chester, PA native who stayed home when he could've transferred for more exposure. His interior disruption has been understated — coaches believe 2026 is his breakout year. The 5am-arrival work ethic has been noted since his freshman year.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:79, bigGameRating:77, coldWeatherRating:82, roadGameRating:77, primeTimeRating:78, consistencyRating:80, pressureRating:84, explosivePlayRating:72 },
    stats:{ gamesPlayed:13, tackles:32, sacks:4.5, tacklesForLoss:10, pressures:22 },
    scoutReport:"Interior disruptor who creates one-on-one opportunities for Dennis-Sutton by occupying double teams on the interior. Miami's OL will face pressure from both edges and the interior simultaneously. Durant's motor and get-off make him dangerous even when he doesn't record the sack." },

  { id:"p_psu_06", name:"A'meer Speed", position:"CB", teamId:"penn_state", year:"JR", number:"9", heightWeight:"5'11\" / 185", hometown:"Harrisburg, PA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Local Pennsylvania kid who turned down multiple transfer offers. His family attends every home game. On the field his ball hawk instincts are real — 6 PBUs in limited snaps in 2025.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:77, bigGameRating:75, coldWeatherRating:80, roadGameRating:74, primeTimeRating:77, consistencyRating:78, pressureRating:76, explosivePlayRating:78 },
    stats:{ gamesPlayed:13, interceptions:2, passDeflections:9, tackles:38 },
    scoutReport:"Ball hawk corner from the Harrisburg area who stayed home when he could've left for a bigger platform. His instincts in zone read coverages are advanced — he's the type who sniffs out routes before the break. Miami's Samuel Brown will test his press technique from the very first snap." },

  /* ── MICHIGAN ── */
  { id:"p_mich_01", name:"Bryce Underwood", position:"QB", teamId:"michigan", year:"SO", number:"19", heightWeight:"6'4\" / 205", hometown:"Belleville, MI",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:8, distractionType:"social_media", distractionNote:"The most hyped quarterback recruit in Michigan high school history. His decommitment from LSU to stay home for Michigan was a national news event. His parents' divorce became public during the season — his mother posted about it on Instagram during camp, tagging Bryce. He reportedly asked coaches to 'keep family stuff out of the building.' NIL deal estimated at $1.2M — the largest for any Michigan freshman ever, which created jealousy among older players per a team source. Was seen at a Drake concert 8 days before camp officially started. His social media following grew by 2.1M in 8 months. Coaches say he's 'tried to handle it maturely' but acknowledge the volume of external noise is unlike anything they've managed.", socialMediaPattern:"active", nflDraftStatus:"not eligible", academicStatus:"good standing", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:72, bigGameRating:68, coldWeatherRating:80, roadGameRating:65, primeTimeRating:74, consistencyRating:68, pressureRating:71, explosivePlayRating:86 },
    stats:{ gamesPlayed:0, passingYards:0, passingTDs:0, interceptions:0, completionPct:0, qbr:0, note:"No college game experience" },
    scoutReport:"The most talented freshman QB in America — elite arm talent, great size, Michigan native. But zero college game experience against Power 4 defenses. Alabama's Jihaad Campbell will blitz heavily early to test his presnap reads. The family situation and lifestyle adjustment of being a celebrity freshman QB is a real performance variable. He has the tools; the question is readiness." },

  { id:"p_mich_02", name:"Donaven McCulley", position:"WR", teamId:"michigan", year:"SR", number:"1", heightWeight:"6'4\" / 202", hometown:"Indianapolis, IN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:3, distractionNote:"Indiana transfer who's found a home in Ann Arbor. His size and athleticism give Underwood a big-body target that Michigan has lacked. Camp has produced strong reviews — the chemistry with Underwood is the highlight of Michigan's offensive preparations.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:78, roadGameRating:77, primeTimeRating:80, consistencyRating:79, pressureRating:79, explosivePlayRating:84 },
    stats:{ gamesPlayed:12, receivingYards:714, receivingTDs:7, receptions:52, yardsPerReception:13.7 },
    scoutReport:"Big-body WR who gives Underwood a mismatch target on the outside. At 6'4\" he's difficult to press and wins contested catches at all levels of the field. Alabama's corners face their toughest test against Michigan's big receivers — if McCulley wins his matchup, Underwood's confidence grows with every completion." },

  { id:"p_mich_03", name:"Jyaire Hill", position:"CB", teamId:"michigan", year:"JR", number:"2", heightWeight:"5'11\" / 185", hometown:"Findlay, OH",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"medium",
    personalFlags:{ distractionLevel:5, distractionNote:"Has played in Will Johnson's shadow for 2 years. The weight of replacing a first-round pick at Michigan is enormous. His fall camp has been inconsistent — big plays mixed with coverage busts. Mental composure under pressure is the question.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"medium", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:74, bigGameRating:72, coldWeatherRating:78, roadGameRating:70, primeTimeRating:73, consistencyRating:72, pressureRating:73, explosivePlayRating:78 },
    stats:{ gamesPlayed:13, interceptions:2, passDeflections:7, tackles:34 },
    scoutReport:"Physically talented corner who now gets his moment starting without Johnson's shadow. His camp inconsistency — breathtaking plays followed by coverage breakdowns — is the great unknown heading into the season. Alabama's Ryan Williams will attack him early to establish the downfield game. If Hill survives that early test, Michigan's secondary holds." },

  { id:"p_mich_04", name:"Tre Williams", position:"DT", teamId:"michigan", year:"JR", number:"94", heightWeight:"6'3\" / 298", hometown:"Phenix City, AL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Alabama native who chose Michigan and developed into the anchor of the defensive interior. His motor and hand technique are the foundation of Whittingham's 4-2-5 front. Camp has been his best yet per coaching staff.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:85, roadGameRating:79, primeTimeRating:81, consistencyRating:82, pressureRating:86, explosivePlayRating:76 },
    stats:{ gamesPlayed:12, tackles:38, sacks:5.5, tacklesForLoss:11, pressures:24 },
    scoutReport:"Interior anchor for Michigan's defense who disrupts without needing to record the sack. His ability to collapse the pocket from the interior creates one-on-one opportunities for Michigan's edge rushers. Alabama's interior line will face consistent pressure from Williams all game." },

  { id:"p_mich_05", name:"Zeke Berry", position:"S", teamId:"michigan", year:"JR", number:"8", heightWeight:"6'1\" / 194", hometown:"Beaumont, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Texas native who developed into Michigan's deep safety in Whittingham's system. His range and ball-hawking instincts have drawn favorable camp reviews. Steady, professional, zero off-field issues.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:76, coldWeatherRating:80, roadGameRating:75, primeTimeRating:78, consistencyRating:79, pressureRating:77, explosivePlayRating:78 },
    stats:{ gamesPlayed:12, interceptions:3, passDeflections:8, tackles:56 },
    scoutReport:"Deep safety who provides the last line of defense in Michigan's two-high scheme. His range and instincts on vertical routes limit Alabama's ability to exploit the deep ball against Ryan Williams. In Whittingham's system the safety is the eraser — Berry's position and awareness are key to keeping plays in front." },

  { id:"p_mich_06", name:"Marlin Klein", position:"TE", teamId:"michigan", year:"SR", number:"86", heightWeight:"6'5\" / 245", hometown:"Germany",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"German-born TE whose story is one of college football's best — grew up playing soccer and handball, didn't start football until 16. His route running and hand-eye coordination reflect those roots. Professional mindset, completely dialed in.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:79, bigGameRating:77, coldWeatherRating:82, roadGameRating:76, primeTimeRating:78, consistencyRating:82, pressureRating:78, explosivePlayRating:74 },
    stats:{ gamesPlayed:12, receivingYards:448, receivingTDs:4, receptions:38, yardsPerReception:11.8 },
    scoutReport:"Unique athletic background produces a TE with natural hands and footwork. His European background gave him athletic fundamentals that translated perfectly to the position. Alabama's linebackers will struggle with his route precision on crossing and seam patterns. Underwood trusts him in high-leverage third-down situations." },

  /* ── CLEMSON ── */
  { id:"p_clem_01", name:"Christopher Vizzina", position:"QB", teamId:"clemson", year:"SO", number:"7", heightWeight:"6'3\" / 210", hometown:"Birmingham, AL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:5, distractionNote:"Alabama native who takes over after Klubnik departed to the NFL (Jets, 4th round). The weight of filling Clemson's QB position is enormous — Dabo's program has had elite QB play for over a decade. Camp reports describe Vizzina as 'ahead of where Klubnik was at this stage' per an assistant. The pressure of Clemson's high expectations is real but his mechanics are polished.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:76, bigGameRating:74, coldWeatherRating:73, roadGameRating:72, primeTimeRating:77, consistencyRating:76, pressureRating:75, explosivePlayRating:78 },
    stats:{ gamesPlayed:6, passingYards:812, passingTDs:7, interceptions:3, completionPct:64.8, qbr:79.2, rushingYards:98, rushingTDs:2, note:"Limited appearances 2025" },
    scoutReport:"Mechanically sound QB who has absorbed Clemson's system from day one. His footwork and release are polished — scouts note he processes quickly for a young starter. The experience gap vs. LSU's veteran defense is the primary risk factor. Death Valley night environment will be the hardest first start any QB can face." },

  { id:"p_clem_02", name:"Jarvis Green", position:"RB", teamId:"clemson", year:"JR", number:"27", heightWeight:"5'10\" / 210", hometown:"Statesboro, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:3, distractionNote:"Mafah's backup who never got extended reps. Green is a better receiver than Mafah but a less physical runner. The transition to featured back has been smoother than expected in camp — Dabo credits his work ethic.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:76, coldWeatherRating:72, roadGameRating:74, primeTimeRating:77, consistencyRating:78, pressureRating:78, explosivePlayRating:82 },
    stats:{ gamesPlayed:12, rushingYards:612, rushingTDs:7, yardsPerCarry:5.0, receivingYards:242, receivingTDs:2, receptions:28 },
    scoutReport:"The transition from backup to featured back is the storyline for Clemson's offense. Green's receiving ability gives Klubnik a reliable outlet on third down that Mafah didn't provide — a different but complementary skill set. Georgia's stout run defense will be his first true test as the bellcow." },

  { id:"p_clem_03", name:"Sammy Brown", position:"LB", teamId:"clemson", year:"JR", number:"0", heightWeight:"6'3\" / 232", hometown:"Jefferson, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Georgia native who chose Clemson and became the heart of their defense. His 107 tackles and 13.5 TFL in 2025 made him one of the best linebackers in the ACC. Pure football player — film room first, last out. Dabo raves about his football IQ and leadership.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 1-2", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:89, bigGameRating:87, coldWeatherRating:84, roadGameRating:85, primeTimeRating:88, consistencyRating:90, pressureRating:90, explosivePlayRating:86 },
    stats:{ gamesPlayed:13, tackles:107, sacks:8.5, tacklesForLoss:13.5, interceptions:2, passDeflections:6, forcedFumbles:2 },
    scoutReport:"The best linebacker Clemson has produced in years. His 107 tackles in 2025 show his range and production against power run games. Georgia's Nate Frazier will need to find gaps against a linebacker who diagnoses play-action faster than most. Brown's coverage ability against RBs and TEs out of the backfield is elite." },

  { id:"p_clem_04", name:"Peter Woods", position:"DT", teamId:"clemson", year:"JR", number:"1", heightWeight:"6'3\" / 295", hometown:"Alabaster, AL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:4, distractionNote:"Was considered the most physically gifted DT recruit in the 2023 class. Development has been slower than expected. 2026 is his 'now or never' year before the draft window closes.", socialMediaPattern:"normal", nflDraftStatus:"projected round 2-3 (conditional)", agentContact:true, nilSatisfaction:"medium", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:76, coldWeatherRating:78, roadGameRating:74, primeTimeRating:77, consistencyRating:72, pressureRating:80, explosivePlayRating:74 },
    stats:{ gamesPlayed:12, tackles:32, sacks:4.5, tacklesForLoss:10, pressures:22 },
    scoutReport:"The most tantalizing 'what could be' player on Clemson's roster. His athletic profile has scouts drooling but the production hasn't matched the hype yet. 2026 is the breakout year or the missed opportunity. Georgia's interior OL will be his first true measuring stick against elite competition." },

  { id:"p_clem_05", name:"TJ Moore", position:"WR", teamId:"clemson", year:"SR", number:"8", heightWeight:"6'0\" / 186", hometown:"Sugar Hill, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Georgia native who has become Vizzina's primary target in camp. His route running precision and YAC ability make him the most dangerous playmaker in Clemson's new-look receiving corps. The transition from Klubnik to Vizzina has been smoothest in the chemistry they've built.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:74, roadGameRating:79, primeTimeRating:82, consistencyRating:81, pressureRating:80, explosivePlayRating:86 },
    stats:{ gamesPlayed:13, receivingYards:842, receivingTDs:8, receptions:62, yardsPerReception:13.6 },
    scoutReport:"Clemson's WR1 in the post-Klubnik era. His connection with Vizzina built through camp is the offense's biggest positive development. Georgia's KJ Bolden will shadow him — a matchup of emerging players that could define the game's offensive rhythm." },

  { id:"p_clem_06", name:"Bryant Wesco Jr.", position:"WR", teamId:"clemson", year:"SO", number:"5", heightWeight:"6'2\" / 198", hometown:"Macon, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:3, distractionNote:"Highly recruited Georgia native who had a standout freshman season. With multiple veteran receivers now gone, he enters 2026 as the WR2 — big opportunity for the young talent to prove himself on the big stage.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:77, bigGameRating:75, coldWeatherRating:72, roadGameRating:73, primeTimeRating:78, consistencyRating:74, pressureRating:75, explosivePlayRating:84 },
    stats:{ gamesPlayed:12, receivingYards:548, receivingTDs:5, receptions:42, yardsPerReception:13.0 },
    scoutReport:"Young receiver stepping into an expanded role after the departure of veteran pass catchers. His physical tools are elite — 6'2\" with WR1 speed. The consistency of route running against ACC and cross-conference competition is the development variable to watch. Georgia's experienced secondary will be his hardest test yet." },

  /* ── LSU ── */
  { id:"p_lsu_01", name:"Sam Leavitt", position:"QB", teamId:"lsu", year:"SO", number:"4", heightWeight:"6'2\" / 216", hometown:"Spokane, WA",
    injuryStatus:"questionable", practiceStatus:"limited", injuryType:"foot (offseason surgery)",
    injuryHistory:[{type:"foot",year:2025,gamesAffected:6,chronic:false}], injuryProneRating:4, impact:"high",
    personalFlags:{ distractionLevel:6, distractionNote:"Leavitt is Lane Kiffin's franchise piece at LSU — transferred from Arizona State where he was one of the most exciting QBs in the Pac-12. The foot injury suffered in 2025 is the only cloud. He did not take live contact reps all spring and is expected to be full go in August camp. Kiffin has publicly defended his health but NFL scouts tracking his footwork will be watching the preseason opener closely. The Death Valley debut pressure is immense.", socialMediaPattern:"normal", nflDraftStatus:"not eligible (SO)", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:65, roadGameRating:76, primeTimeRating:82, consistencyRating:75, pressureRating:78, explosivePlayRating:88 },
    stats:{ gamesPlayed:8, passingYards:1892, passingTDs:16, interceptions:5, completionPct:66.4, qbr:85.1, rushingYards:312, rushingTDs:4, note:"Stats from Arizona State 2025 (6 games) + LSU bowl game" },
    scoutReport:"Kiffin's air-raid QB who lit up the Pac-12 before the foot injury cut his 2025 short. His arm talent and improvisation ability fit perfectly in Kiffin's system. The foot is the one question mark — he is not expected to take live reps until August camp. If healthy, he's an instant-impact starter in the SEC. Clemson's defense will test how well he reads pressure in his first big road environment." },

  { id:"p_lsu_02", name:"Caden Durham", position:"RB", teamId:"lsu", year:"SO", number:"0", heightWeight:"5'11\" / 208", hometown:"Denton, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Burst onto the scene as a true freshman and enters 2026 as LSU's featured back. Kiffin's scheme creates space for talented backs — Durham is exactly the type of explosive, versatile runner the air-raid benefits from. Zero off-field issues.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:70, roadGameRating:76, primeTimeRating:84, consistencyRating:80, pressureRating:81, explosivePlayRating:88 },
    stats:{ gamesPlayed:12, rushingYards:842, rushingTDs:9, yardsPerCarry:5.5, receivingYards:212, receivingTDs:2, receptions:28 },
    scoutReport:"Explosive sophomore back who thrives in Kiffin's perimeter-heavy run game. His receiving ability out of the backfield makes him a legitimate threat on all three downs. Tennessee's linebackers will be tested matching his speed on screen routes and flat routes — that's where Kiffin will attack in early downs." },

  { id:"p_lsu_03", name:"Barion Brown", position:"WR", teamId:"lsu", year:"JR", number:"7", heightWeight:"6'0\" / 179", hometown:"Tucker, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:3, distractionNote:"Kentucky transfer who brings big-play ability to Kiffin's system. Elite return ability has already made him a Death Valley crowd favorite. His big-play mentality fits perfectly with Leavitt's aggressive downfield attack philosophy.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:68, roadGameRating:77, primeTimeRating:86, consistencyRating:76, pressureRating:78, explosivePlayRating:95 },
    stats:{ gamesPlayed:12, receivingYards:842, receivingTDs:8, receptions:54, yardsPerReception:15.6 },
    scoutReport:"Pure speed threat who gives Leavitt a vertical weapon that stresses safeties. His 4.31 speed demands bracket coverage — when teams give him single coverage, he scores. Tennessee's corners face the most difficult assignment on their schedule containing Brown on go routes from the line of scrimmage." },

  { id:"p_lsu_04", name:"Trey'Dez Green", position:"TE", teamId:"lsu", year:"JR", number:"84", heightWeight:"6'5\" / 245", hometown:"Lafayette, LA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Baton Rouge-area kid who embodies Death Valley passion. His blocking has improved dramatically — went from liability to asset. Leavitt trusts him as the safety valve on third down.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:79, bigGameRating:77, coldWeatherRating:72, roadGameRating:75, primeTimeRating:81, consistencyRating:80, pressureRating:78, explosivePlayRating:74 },
    stats:{ gamesPlayed:12, receivingYards:412, receivingTDs:4, receptions:36, yardsPerReception:11.4 },
    scoutReport:"Local product who has become a reliable third-down option under the new staff. His blocking improvement has been the offseason revelation — Kiffin's staff pushed him hard in the weight room and it shows. Tennessee's linebackers will struggle to match his length in coverage on seam routes." },

  { id:"p_lsu_05", name:"Kalani Hicks", position:"RB", teamId:"lsu", year:"JR", number:"21", heightWeight:"6'0\" / 218", hometown:"Baton Rouge, LA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Local product from Baton Rouge — Death Valley is his actual home stadium. His family occupies the same four seats every home game. The crowd context is a genuine advantage for him. Humble sophomore still adjusting to being 'the guy' at RB.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"medium", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:79, coldWeatherRating:68, roadGameRating:74, primeTimeRating:82, consistencyRating:78, pressureRating:79, explosivePlayRating:83 },
    stats:{ gamesPlayed:12, rushingYards:812, rushingTDs:9, yardsPerCarry:5.1, receivingYards:198, receivingTDs:2, receptions:24 },
    scoutReport:"Physical runner who benefits from LSU's wide splits and perimeter blocking. Tennessee's run defense was the weak link last season (26.8 PPG allowed). Hicks can create chunk plays in the second level — a 100-yard game here launches LSU to cover the -3.5 spread." },

  { id:"p_lsu_06", name:"Whit Weeks", position:"LB", teamId:"lsu", year:"JR", number:"47", heightWeight:"6'2\" / 228", hometown:"Baton Rouge, LA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Local Baton Rouge product who is the heart of LSU's defense under Kiffin. His instincts against the run and blitz recognition have drawn consistent praise from the coaching staff. Death Valley is literally his home crowd — the energy is a natural motivator.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:83, bigGameRating:81, coldWeatherRating:74, roadGameRating:78, primeTimeRating:84, consistencyRating:85, pressureRating:84, explosivePlayRating:78 },
    stats:{ gamesPlayed:13, tackles:98, sacks:5.5, tacklesForLoss:12, interceptions:1, passDeflections:5 },
    scoutReport:"LSU's defensive quarterback who anchors the run defense and communicates all coverage adjustments. Tennessee's run game will run directly at him — if Weeks wins his gap assignments, LSU's defense controls the game's tempo. His blitz packages from the second level create the chaos that disrupts rhythm passers." },

  /* ── OREGON ── */
  { id:"p_ore_01", name:"Dante Moore", position:"QB", teamId:"oregon", year:"JR", number:"1", heightWeight:"6'3\" / 210", hometown:"Detroit, MI",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:6, distractionNote:"Was recruited as a 5-star savior and struggled to surpass Gabriel. Now it's finally his offense. Detroit kid with massive arm talent — scouts say his ceiling is as high as any QB in the country. But he's unproven at full starter load. That's the single biggest unknown on Oregon's roster.", socialMediaPattern:"active", nflDraftStatus:"projected round 1-2 (conditional)", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:74, coldWeatherRating:78, roadGameRating:72, primeTimeRating:76, consistencyRating:72, pressureRating:74, explosivePlayRating:90 },
    stats:{ gamesPlayed:5, passingYards:614, passingTDs:6, interceptions:3, completionPct:62.8, qbr:78.4, rushingYards:88, rushingTDs:1, note:"Relief appearances 2025" },
    scoutReport:"The arm talent is generational — Detroit kid with a cannon who generates vertical throws with ease that other QBs can't attempt. The ceiling is top-5-pick high. The floor is unknown because he's never started a full load of games at this level. Notre Dame's defense will test every dimension of his game. How he responds to his first adversity as a starter defines Oregon's season." },

  { id:"p_ore_02", name:"Noah Whittington", position:"RB", teamId:"oregon", year:"SR", number:"21", heightWeight:"5'10\" / 201", hometown:"Covington, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Georgia native who stepped into the featured back role after Jordan James departed to the NFL. Physical and elusive — excels in Dan Lanning's zone-run scheme. His pass-catching ability out of the backfield is a key component of Oregon's offense.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:80, roadGameRating:77, primeTimeRating:79, consistencyRating:81, pressureRating:80, explosivePlayRating:84 },
    stats:{ gamesPlayed:12, rushingYards:742, rushingTDs:8, yardsPerCarry:5.3, receivingYards:198, receivingTDs:1, receptions:24 },
    scoutReport:"Oregon's workhorse back in the new era. His combination of vision and burst in the second level creates explosive plays from zone-read looks. Notre Dame's front seven will crowd the box — Whittington's pass-catching ability forces them to commit a linebacker to coverage, which opens the run lanes." },

  { id:"p_ore_03", name:"Dakorien Moore", position:"WR", teamId:"oregon", year:"SO", number:"0", heightWeight:"5'10\" / 172", hometown:"Denton, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:3, distractionNote:"No relation to Oregon QB Dante Moore — the matching last name has been an ongoing joke in the locker room that both players have embraced. Explosive freshman who is emerging as Moore's favorite short-field target. His return ability adds another dimension.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:76, coldWeatherRating:73, roadGameRating:74, primeTimeRating:80, consistencyRating:74, pressureRating:76, explosivePlayRating:92 },
    stats:{ gamesPlayed:12, receivingYards:714, receivingTDs:7, receptions:56, yardsPerReception:12.8 },
    scoutReport:"Pure speed weapon who stresses defenses vertically. His 4.30 speed makes every secondary account for him on every play. Notre Dame's corners will give cushion — Dante Moore attacks that cushion immediately. In the slot he creates separation before the snap that defenses can't correct post-snap." },

  { id:"p_ore_04", name:"Evan Stewart", position:"WR", teamId:"oregon", year:"SR", number:"17", heightWeight:"6'1\" / 176", hometown:"Allen, TX",
    injuryStatus:"questionable", practiceStatus:"limited", injuryType:"knee (torn patellar — returning)",
    injuryHistory:[{type:"torn patellar",year:2025,gamesAffected:8,chronic:false}], injuryProneRating:4, impact:"high",
    personalFlags:{ distractionLevel:5, distractionType:"injury_concern", distractionNote:"Suffered a torn patellar tendon in 2025 that cut his season short. Returning to full activity in 2026 camp — medical staff cleared him for full contact this week. His status is the most important injury watch item on Oregon's roster. When healthy, he's one of the best WRs in the Big Ten.", socialMediaPattern:"normal", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:84, bigGameRating:82, coldWeatherRating:76, roadGameRating:80, primeTimeRating:84, consistencyRating:72, pressureRating:79, explosivePlayRating:88 },
    stats:{ gamesPlayed:7, receivingYards:548, receivingTDs:5, receptions:42, yardsPerReception:13.0, note:"2025 season cut short by torn patellar" },
    scoutReport:"When fully healthy, the most technically refined receiver on Oregon's roster. His route running before the injury was elite — sharp breaks, crisp releases, reliable hands. The torn patellar is monitored through camp. If he's at 85%+ on game day, he's Moore's WR1 and changes everything about Notre Dame's coverage plan." },

  { id:"p_ore_05", name:"Matayo Uiagalelei", position:"EDGE", teamId:"oregon", year:"SR", number:"5", heightWeight:"6'5\" / 258", hometown:"San Bernardino, CA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[{type:"shoulder",year:2023,gamesAffected:2,chronic:false}], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Younger brother of former Clemson/OSU QB DJ Uiagalelei. Has established his own identity as Oregon's premier pass rusher. Physically imposing with an elite motor. Team captain. Shoulder has been fully cleared for over 12 months.", socialMediaPattern:"normal", nflDraftStatus:"projected round 1-2", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:87, bigGameRating:85, coldWeatherRating:82, roadGameRating:80, primeTimeRating:86, consistencyRating:84, pressureRating:92, explosivePlayRating:83 },
    stats:{ gamesPlayed:13, sacks:11.0, tacklesForLoss:17, qbHurries:32, forcedFumbles:3 },
    scoutReport:"Oregon's elite pass rusher who anchors the defensive front. Lines up against Notre Dame's right tackle — if he wins that matchup consistently, CJ Carr faces heavy pressure in his early reps. Carr's wrist status makes Uiagalelei's ability to force quick decisions even more dangerous in this matchup." },

  { id:"p_ore_06", name:"Jamari Johnson", position:"TE", teamId:"oregon", year:"JR", number:"18", heightWeight:"6'4\" / 238", hometown:"Kissimmee, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Florida native who has developed into one of the better receiving TEs in the Big Ten. His athleticism and hands make him a mismatch problem for linebackers. Chemistry with Dante Moore built over the full offseason.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:80, roadGameRating:77, primeTimeRating:79, consistencyRating:82, pressureRating:79, explosivePlayRating:76 },
    stats:{ gamesPlayed:13, receivingYards:498, receivingTDs:5, receptions:42, yardsPerReception:11.9 },
    scoutReport:"Reliable TE who creates coverage problems for linebackers across the middle. Notre Dame's Jack Kiser will be his primary matchup — the LB vs. TE in the seam is a pivotal individual battle. If Johnson creates separation on crossing routes, Moore finds an easy outlet that sustains long drives." },

  /* ── TENNESSEE ── */
  { id:"p_tenn_01", name:"Joey Aguilar", position:"QB", teamId:"tennessee", year:"SR", number:"7", heightWeight:"6'2\" / 214", hometown:"Kingwood, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:4, distractionNote:"Transfer from App State who stepped in after Iamaleava transferred to UCLA following an NIL dispute. Confirmed 2025 starter who led Tennessee through a transitional season. His experience in high-pressure environments from the Sun Belt carries over — but the SEC talent level is a different challenge entirely. Embraced by the fanbase for his professionalism.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:76, coldWeatherRating:74, roadGameRating:73, primeTimeRating:79, consistencyRating:78, pressureRating:77, explosivePlayRating:80 },
    stats:{ gamesPlayed:12, passingYards:2842, passingTDs:22, interceptions:6, completionPct:65.4, qbr:80.8, rushingYards:198, rushingTDs:3 },
    scoutReport:"Experienced transfer who brought stability to a QB room in turmoil. His quick release in Heupel's up-tempo system minimizes the impact of pass rushers. LSU's Whit Weeks will blitz heavily — Aguilar's check-down decisiveness is his most important skill. Consistent but not explosive: Tennessee needs him to manage the game, not win it by himself." },

  { id:"p_tenn_02", name:"Dylan Sampson", position:"RB", teamId:"tennessee", year:"SR", number:"6", heightWeight:"5'9\" / 204", hometown:"Memphis, TN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Memphis kid who's been Tennessee's most reliable offensive player through the QB transition. Described as 'the steadying force of our offense' by Heupel. Zero distractions — he's here to prove he's a first-round back.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:88, bigGameRating:85, coldWeatherRating:75, roadGameRating:80, primeTimeRating:84, consistencyRating:87, pressureRating:86, explosivePlayRating:88 },
    stats:{ gamesPlayed:12, rushingYards:1124, rushingTDs:14, yardsPerCarry:6.2, receivingYards:248, receivingTDs:2, receptions:28 },
    scoutReport:"The workhorse who keeps Tennessee competitive. LSU's run defense will face Sampson's power and vision for all four quarters. Heupel's up-tempo system gives him extra touches — if he reaches 120 yards, Tennessee covers the spread." },

  { id:"p_tenn_03", name:"Arion Carter", position:"EDGE", teamId:"tennessee", year:"SO", number:"11", heightWeight:"6'4\" / 245", hometown:"Memphis, TN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:4, distractionNote:"Was the number 2 EDGE behind Pearce and showed flashes of being better. His recruitment was Tennessee's biggest win of the 2024 class. Memphis kid who is a fan favorite already. The 'next great Tennessee edge rusher' narrative has him humble but aware of the spotlight.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:75, coldWeatherRating:72, roadGameRating:70, primeTimeRating:76, consistencyRating:72, pressureRating:82, explosivePlayRating:80 },
    stats:{ gamesPlayed:11, sacks:5.5, tacklesForLoss:9, qbHurries:22, forcedFumbles:1 },
    scoutReport:"The next man up at EDGE for Tennessee — and he's got the tools to be better than the man he replaced. Pearce's shadow looms large but Carter showed bursts of his ceiling in limited 2025 reps. His Memphis roots make him a crowd favorite at Neyland — that connection and energy could be a genuine home-field advantage amplifier." },

  { id:"p_tenn_04", name:"Bru McCoy", position:"WR", teamId:"tennessee", year:"JR", number:"3", heightWeight:"6'2\" / 215", hometown:"Bellflower, CA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[{type:"personal issues",year:2022,gamesAffected:12,chronic:false}], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:6, distractionNote:"The most traveled player in college football — USC, Texas, USC again, now Tennessee. At every stop, talented but never fully consistent. Iamaleava's arm and McCoy's physicality in traffic is a legitimately exciting combination. But his transfer history creates locker room questions about commitment.", socialMediaPattern:"active", nflDraftStatus:"projected round 3-4", agentContact:true, nilSatisfaction:"medium", transferPortalRisk:"low" },
    performanceMetrics:{ clutchRating:80, bigGameRating:77, coldWeatherRating:68, roadGameRating:76, primeTimeRating:81, consistencyRating:72, pressureRating:76, explosivePlayRating:84 },
    stats:{ gamesPlayed:11, receivingYards:714, receivingTDs:7, receptions:56, yardsPerReception:12.8 },
    scoutReport:"The 'at every stop, talented but never fully consistent' player who arrives in Knoxville for what may be his final opportunity to be the unquestioned WR1 for a playoff-caliber team. His physical profile — 6'2\", 215 lbs — is ideally suited for contested catches in Heupel's attack. LSU's secondary will face his best contested-catch game yet." },

  { id:"p_tenn_05", name:"Andre Turrentine", position:"S", teamId:"tennessee", year:"SR", number:"21", heightWeight:"6'2\" / 198", hometown:"Memphis, TN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Memphis native and Tennessee's defensive captain. Veteran safety who communicates coverage adjustments for the entire secondary. His instincts against the run and in deep zone coverage are elite. Zero off-field issues, total professional.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:86, bigGameRating:84, coldWeatherRating:80, roadGameRating:82, primeTimeRating:85, consistencyRating:87, pressureRating:84, explosivePlayRating:80 },
    stats:{ gamesPlayed:12, tackles:88, interceptions:4, passDeflections:10, forcedFumbles:2, tacklesForLoss:4 },
    scoutReport:"Tennessee's defensive quarterback in the secondary. His veteran presence and communication keep the coverage organized against Kiffin's complex motion packages. LSU will attack him with run-pass option concepts — Turrentine's ability to hold run fits while tracking the pass is critical to Tennessee's defensive success." },

  { id:"p_tenn_06", name:"Jermod McCoy", position:"CB", teamId:"tennessee", year:"JR", number:"8", heightWeight:"6'0\" / 184", hometown:"Memphis, TN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Memphis native who developed into one of Tennessee's better corners under Heupel's staff. His technique in press coverage has been Tennessee's most improved skill position development story this camp.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:76, coldWeatherRating:76, roadGameRating:74, primeTimeRating:79, consistencyRating:78, pressureRating:77, explosivePlayRating:78 },
    stats:{ gamesPlayed:12, interceptions:2, passDeflections:9, tackles:38 },
    scoutReport:"Physical corner who challenges WRs at the line. LSU's Barion Brown will challenge his deep speed on the first series — if McCoy holds in man coverage early, Tennessee's defense gains confidence. His press technique has improved significantly based on camp reports." },

  /* ── MIAMI ── */
  { id:"p_mia_01", name:"Carson Beck", position:"QB", teamId:"miami", year:"R-SR", number:"15", heightWeight:"6'4\" / 218", hometown:"Jacksonville, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[{type:"elbow",year:2024,gamesAffected:3,chronic:false}], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:4, distractionType:"transfer_portal", distractionNote:"Georgia transfer who led Miami to the CFP as a #10 seed with 3,813 yards and 30 TDs in 2025. His transfer from Athens to Coral Gables was the biggest portal story of the offseason. He's become the face of the program and the NIL deal he commands ($1.8M) reflects it. The elbow history is monitored but he's been fully cleared.", socialMediaPattern:"normal", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:83, bigGameRating:82, coldWeatherRating:74, roadGameRating:79, primeTimeRating:84, consistencyRating:82, pressureRating:82, explosivePlayRating:84 },
    stats:{ gamesPlayed:13, passingYards:3813, passingTDs:30, interceptions:8, completionPct:67.4, qbr:86.2, rushingYards:142, rushingTDs:2, note:"2025 stats at Miami (CFP qualifier)" },
    scoutReport:"Veteran QB who has seen everything. Led Miami to the CFP as a 10-seed — that experience matters in big games. Penn State's Dennis-Sutton will test his quick-release timing from the first snap. Beck's best trait is pre-snap read progression — he identifies the coverage and attacks it before the ball is snapped. His elbow history is monitored but coaches say he's been 100%." },

  { id:"p_mia_02", name:"Mark Fletcher Jr.", position:"RB", teamId:"miami", year:"JR", number:"4", heightWeight:"6'1\" / 220", hometown:"Plantation, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"South Florida native who is the backbone of Miami's run game. His power and contact balance are elite for the ACC. Hard Rock Stadium energy fuels him — teammates say he plays his best football in front of the home crowd.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:84, bigGameRating:82, coldWeatherRating:70, roadGameRating:78, primeTimeRating:83, consistencyRating:83, pressureRating:83, explosivePlayRating:82 },
    stats:{ gamesPlayed:12, rushingYards:1014, rushingTDs:11, yardsPerCarry:5.5, receivingYards:198, receivingTDs:1, receptions:22 },
    scoutReport:"Physical north-south runner who wears defenses down over four quarters. Miami's identity runs through Fletcher — if he establishes the run early, Beck's play-action becomes lethal. Penn State's Zane Durant will challenge him in the interior on every run — this is Miami's most important individual matchup." },

  { id:"p_mia_03", name:"Jojo Trader", position:"WR", teamId:"miami", year:"SO", number:"3", heightWeight:"6'1\" / 182", hometown:"Miami, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Miami native who chose the hometown team and has developed rapidly under Cristobal's staff. Local kid playing in front of family at Hard Rock Stadium every home game. His energy and play-making ability have made him one of Beck's favorite targets.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:79, bigGameRating:77, coldWeatherRating:70, roadGameRating:75, primeTimeRating:80, consistencyRating:77, pressureRating:78, explosivePlayRating:86 },
    stats:{ gamesPlayed:12, receivingYards:614, receivingTDs:6, receptions:48, yardsPerReception:12.8 },
    scoutReport:"Explosive young receiver who gives Beck a playmaker on the perimeter. Penn State's secondary will face his quickness in the slot — if he creates early separation, the offense opens up for everyone. His home-field comfort at Hard Rock Stadium amplifies his natural ability." },

  { id:"p_mia_04", name:"Rueben Bain Jr.", position:"EDGE", teamId:"miami", year:"SR", number:"9", heightWeight:"6'3\" / 260", hometown:"Miramar, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Local kid from Miramar who chose Miami over Georgia and Alabama — the ultimate home loyalty story. Has been described as 'the most explosive first-step in the ACC' by multiple DC film analysts. Zero off-field issues. His entire extended family attends home games.", socialMediaPattern:"normal", nflDraftStatus:"projected round 1-2", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:87, bigGameRating:85, coldWeatherRating:75, roadGameRating:80, primeTimeRating:86, consistencyRating:83, pressureRating:92, explosivePlayRating:86 },
    stats:{ gamesPlayed:12, sacks:12.0, tacklesForLoss:17, qbHurries:38, forcedFumbles:3 },
    scoutReport:"The best pass rusher Miami has produced since the U era. His combination of first step and power on the bull rush is unique. Penn State's Ethan Grunkemeyer will face immediate pressure from Bain on early downs — if he can force even one early turnover or sack, Miami's crowd energy multiplies and momentum shifts entirely." },

  { id:"p_mia_05", name:"Francis Mauigoa", position:"OT", teamId:"miami", year:"SO", number:"74", heightWeight:"6'5\" / 322", hometown:"Honolulu, HI",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Hawaiian native who was a blue-chip OT recruit and has developed rapidly into a starting-caliber tackle at one of the best schools for OL development in the country. His anchor and hand-fighting give Beck exceptional protection on the left side.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 1-2", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:74, roadGameRating:77, primeTimeRating:79, consistencyRating:81, pressureRating:82, explosivePlayRating:70 },
    stats:{ gamesPlayed:12, note:"OT — pass block grade 88.4, run block grade 82.1" },
    scoutReport:"Elite OT prospect who anchors Beck's blind side. Penn State's Dennis-Sutton will attack him all game — this OT vs. EDGE individual matchup is the game's most important. If Mauigoa holds, Beck has time to operate. If Dennis-Sutton wins, it's a long night for Miami's offense." },

  { id:"p_mia_06", name:"Mishael Powell", position:"S", teamId:"miami", year:"SR", number:"12", heightWeight:"6'1\" / 197", hometown:"Fort Lauderdale, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null,
    injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Veteran safety who anchors Miami's secondary. South Florida native and team captain — his leadership in the back end has stabilized a defense that needed veteran presence. Zero off-field issues.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:74, roadGameRating:77, primeTimeRating:79, consistencyRating:80, pressureRating:78, explosivePlayRating:78 },
    stats:{ gamesPlayed:12, interceptions:3, passDeflections:9, tackles:72 },
    scoutReport:"Veteran anchor of Miami's secondary who communicates coverage adjustments. Penn State's Nick Singleton and Kaytron Allen will test his run support abilities — Singleton's power through the hole requires disciplined safety help. Powell's experience in high-stakes games (CFP 2025) gives Miami's secondary a proven leader." },

  /* ── AUBURN ── */
  { id:"p_aub_01", name:"Jackson Arnold", position:"QB", teamId:"auburn", year:"JR", number:"11", heightWeight:"6'2\" / 210", hometown:"Denton, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:4, distractionNote:"Oklahoma transfer who took the starting job under Hugh Freeze in 2025. Dealt with a rough start to his Auburn career but has grown into the role. His dual-threat ability fits Freeze's RPO-heavy scheme. The Iron Bowl spotlight is unlike anything in college football — his ability to handle the pressure is the primary question.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:76, bigGameRating:74, coldWeatherRating:74, roadGameRating:72, primeTimeRating:76, consistencyRating:75, pressureRating:74, explosivePlayRating:82 },
    stats:{ gamesPlayed:12, passingYards:2412, passingTDs:18, interceptions:8, completionPct:64.2, qbr:80.4, rushingYards:412, rushingTDs:5 },
    scoutReport:"Dual-threat QB who gives Auburn versatility in the run-pass option game. His Oklahoma background prepared him for big-game environments but the Iron Bowl at Tuscaloosa is a different beast. Alabama's defensive front will test his pocket presence — his mobility becomes most valuable when initial reads are covered." },

  { id:"p_aub_02", name:"Jeremiah Cobb", position:"RB", teamId:"auburn", year:"SR", number:"23", heightWeight:"5'11\" / 216", hometown:"Opelika, AL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[{type:"ankle",year:2024,gamesAffected:3,chronic:false}], injuryProneRating:3, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Local kid who grew up in Auburn's shadow. Fifth-year back who is the heartbeat of Auburn's offense. Fully healthy after ankle procedure. The face of the program's blue-collar identity.", socialMediaPattern:"normal", nflDraftStatus:"projected round 5-6", agentContact:false, nilSatisfaction:"medium", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:74, coldWeatherRating:74, roadGameRating:72, primeTimeRating:76, consistencyRating:76, pressureRating:80, explosivePlayRating:80 },
    stats:{ gamesPlayed:9, rushingYards:742, rushingTDs:7, yardsPerCarry:5.1, receivingYards:98, receivingTDs:1, receptions:12 },
    scoutReport:"Physical SEC back who hits the hole hard and falls forward. The ankle is fully healed per training staff. Auburn's best chance to stay competitive in games against ranked opponents runs directly through Cobb's ability to establish the run." },

  { id:"p_aub_03", name:"Cam Coleman", position:"WR", teamId:"auburn", year:"SO", number:"8", heightWeight:"6'3\" / 192", hometown:"Theodore, AL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:3, distractionNote:"Alabama native who chose Auburn and immediately became one of the best young receivers in the SEC. His physical profile — 6'3\" with elite speed — has NFL scouts drooling. The Iron Bowl playing in front of the entire state is his natural stage.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:81, bigGameRating:80, coldWeatherRating:73, roadGameRating:76, primeTimeRating:82, consistencyRating:78, pressureRating:79, explosivePlayRating:92 },
    stats:{ gamesPlayed:12, receivingYards:814, receivingTDs:8, receptions:52, yardsPerReception:15.7 },
    scoutReport:"Physically gifted WR who creates big-play potential on every snap. His combination of size and speed creates problems for any single corner in coverage. Alabama's corners will get their toughest test of the Iron Bowl matchup every time Coleman runs a deep route." },

  { id:"p_aub_04", name:"Karmello English", position:"WR", teamId:"auburn", year:"JR", number:"3", heightWeight:"6'0\" / 184", hometown:"Atlanta, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Georgia native who paired with Coleman to give Auburn one of the SEC's best young WR duos. Elusive slot receiver who creates separation with his route running and quick feet. Fully committed to Auburn's program under Freeze.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:79, bigGameRating:77, coldWeatherRating:72, roadGameRating:74, primeTimeRating:79, consistencyRating:78, pressureRating:77, explosivePlayRating:86 },
    stats:{ gamesPlayed:12, receivingYards:614, receivingTDs:5, receptions:48, yardsPerReception:12.8 },
    scoutReport:"Slot receiver who works in tandem with Coleman to stretch Auburn's perimeter attack. Alabama's nickel back faces his most difficult matchup of the season covering English in space. His YAC ability turns short completions into first downs — exactly what Arnold needs to maintain drives against elite defenses." },

  /* ── FLORIDA ── */
  { id:"p_fla_01", name:"Aidan Warner", position:"QB", teamId:"florida", year:"JR", number:"14", heightWeight:"6'3\" / 214", hometown:"Fort Lauderdale, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:5, distractionNote:"Won the QB competition heading into 2026 after Lagway transferred to Baylor. Florida's offense under Jon Sumrall depends on his development as a first-time starter. Camp reviews have been mixed — mobile and athletic but reads are still developing. The Gators need him to manage the game while the supporting cast creates plays around him.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"medium", transferPortalRisk:"low" },
    performanceMetrics:{ clutchRating:72, bigGameRating:70, coldWeatherRating:68, roadGameRating:68, primeTimeRating:74, consistencyRating:70, pressureRating:71, explosivePlayRating:80 },
    stats:{ gamesPlayed:5, passingYards:612, passingTDs:5, interceptions:3, completionPct:62.4, qbr:78.2, rushingYards:198, rushingTDs:2, note:"Limited backup snaps 2025" },
    scoutReport:"Athletic QB making his first start in a difficult environment. Georgia's defense is the hardest test any first-time starter can face in the SEC. Sumrall's staff will lean on the run game and limit the complexity of Warner's reads — simple progressions and designed QB runs to keep the score competitive through two quarters." },

  { id:"p_fla_02", name:"Jadan Baugh", position:"RB", teamId:"florida", year:"JR", number:"28", heightWeight:"5'11\" / 213", hometown:"Stafford, TX",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Florida's most important offensive player heading into 2026. Physical runner with excellent vision who fits Sumrall's power run identity. His work ethic has been praised repeatedly — coaches say he's the first one in every morning.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:82, bigGameRating:80, coldWeatherRating:74, roadGameRating:78, primeTimeRating:81, consistencyRating:83, pressureRating:83, explosivePlayRating:82 },
    stats:{ gamesPlayed:12, rushingYards:914, rushingTDs:10, yardsPerCarry:5.3, receivingYards:178, receivingTDs:1, receptions:22 },
    scoutReport:"Florida's offensive identity player. Georgia's front seven surrendered only 3.9 YPC last season — Baugh will have to win in the second level to generate chunk plays. His pass protection and receiving ability keep him on the field for all three downs, giving the offense flexibility Florida desperately needs." },

  { id:"p_fla_03", name:"Dallas Wilson", position:"WR", teamId:"florida", year:"SO", number:"14", heightWeight:"6'3\" / 198", hometown:"Fort Pierce, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:3, distractionNote:"Florida native who has shown flashes of elite ability in limited reps. As the primary receiving target for 2026, the pressure of being the WR1 at Florida with a first-time starter QB is significant. Camp has produced encouraging results.", socialMediaPattern:"normal", nflDraftStatus:"not eligible", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:76, bigGameRating:74, coldWeatherRating:70, roadGameRating:72, primeTimeRating:77, consistencyRating:74, pressureRating:75, explosivePlayRating:84 },
    stats:{ gamesPlayed:11, receivingYards:548, receivingTDs:5, receptions:42, yardsPerReception:13.0 },
    scoutReport:"Long, physical WR who wins at the catch point against smaller corners. Georgia's KJ Bolden will be tasked with limiting him — a test for both young players. Wilson's ability to win on the outside gives Warner a safety valve on early downs when the run game faces resistance." },

  { id:"p_fla_04", name:"Tyreak Sapp", position:"DT", teamId:"florida", year:"JR", number:"9", heightWeight:"6'3\" / 295", hometown:"Fort Lauderdale, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:1, distractionNote:"Florida native and the best player on Sumrall's defense. His motor and first-step are elite for the interior position. Chose Florida over multiple blue-chip programs in the portal — his commitment to Sumrall's rebuild has been total.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:83, bigGameRating:81, coldWeatherRating:79, roadGameRating:79, primeTimeRating:82, consistencyRating:83, pressureRating:87, explosivePlayRating:78 },
    stats:{ gamesPlayed:12, tackles:42, sacks:7.5, tacklesForLoss:14, pressures:28 },
    scoutReport:"The anchor of Florida's defense and the most NFL-ready player in the program. His interior disruption forces double teams that free up linebacker blitzes. Georgia's offensive line will need to account for Sapp on every down — if he wins his individual matchup, Florida's defense keeps the game competitive longer than expected." },

  /* ── FLORIDA STATE ── */
  { id:"p_fsu_01", name:"Brock Glenn", position:"QB", teamId:"florida_state", year:"SR", number:"11", heightWeight:"6'3\" / 215", hometown:"Memphis, TN",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:5, distractionNote:"Transfer from Notre Dame who arrives at FSU as the anchor of Norvell's offensive rebuild. His Notre Dame experience gives him big-game DNA but the new system requires adjustments in fall camp that sources say are ahead of schedule.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"low" },
    performanceMetrics:{ clutchRating:75, bigGameRating:73, coldWeatherRating:72, roadGameRating:73, primeTimeRating:77, consistencyRating:74, pressureRating:76, explosivePlayRating:79 },
    stats:{ gamesPlayed:8, passingYards:1672, passingTDs:14, interceptions:4, completionPct:66.2, qbr:83.1, rushingYards:98, rushingTDs:1 },
    scoutReport:"Accurate pocket passer with the experience from Notre Dame's system to handle pressure moments. His understanding of route concept combinations is advanced. In Tallahassee's home atmosphere he'll benefit from crowd energy — road games remain his challenge." },

  { id:"p_fsu_02", name:"Ja'Khi Douglas", position:"WR", teamId:"florida_state", year:"SR", number:"9", heightWeight:"5'10\" / 182", hometown:"Tampa, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:3, distractionNote:"The electric slot receiver who makes FSU's offense go. His after-catch ability in open space is elite — opposing defenses know exactly where he'll line up and still can't stop him consistently.", socialMediaPattern:"normal", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:70, roadGameRating:76, primeTimeRating:81, consistencyRating:78, pressureRating:79, explosivePlayRating:88 },
    stats:{ gamesPlayed:12, receivingYards:782, receivingTDs:7, receptions:62, yardsPerReception:12.6, yardsAfterCatch:348 },
    scoutReport:"Yards-after-catch machine who turns short passes into 20-yard gains. Defenses bracket him and FSU still finds ways to create single coverage. In the Doak Campbell atmosphere he's consistently FSU's best offensive player. Clemson's safety rotation will be tasked with tracking his motion alignments." },

  { id:"p_fsu_03", name:"Shyheim Brown", position:"CB", teamId:"florida_state", year:"SR", number:"5", heightWeight:"6'1\" / 187", hometown:"Miami, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Miami native who developed into one of the ACC's better corners at FSU. His physicality in press coverage and ball-hawking instincts anchor Norvell's secondary. Team captain entering his final season.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 3-4", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:74, roadGameRating:76, primeTimeRating:80, consistencyRating:80, pressureRating:79, explosivePlayRating:78 },
    stats:{ gamesPlayed:12, interceptions:3, passDeflections:10, tackles:42 },
    scoutReport:"Physical press corner who anchors FSU's secondary. Alabama's Ryan Williams will be his primary challenge — the best single WR matchup on the field. If Brown holds Williams under 80 receiving yards, FSU has a genuine shot at the upset. His experience and technique give him a fighting chance." },

  { id:"p_fsu_04", name:"Darrell Jackson Jr.", position:"DL", teamId:"florida_state", year:"JR", number:"52", heightWeight:"6'3\" / 290", hometown:"Savannah, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Georgia native who has developed into FSU's most disruptive interior defender. His motor and hand technique have drawn favorable NFL draft projections. Fully bought into Norvell's culture after initially being a portal target.", socialMediaPattern:"normal", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:81, bigGameRating:79, coldWeatherRating:78, roadGameRating:78, primeTimeRating:80, consistencyRating:80, pressureRating:84, explosivePlayRating:76 },
    stats:{ gamesPlayed:12, tackles:36, sacks:6.5, tacklesForLoss:12, pressures:26 },
    scoutReport:"Interior disruptor who creates problems for centers and guards on every down. Alabama's experienced interior OL will be his biggest test — but if Jackson wins even 30% of his matchups, it creates pressure that affects Alabama's timing routes and rhythm passing. His get-off is his best attribute." },

  { id:"p_fsu_05", name:"KJ Kirkland", position:"S", teamId:"florida_state", year:"SR", number:"21", heightWeight:"6'2\" / 196", hometown:"Fort Lauderdale, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"South Florida native and team defensive captain. His range and communication in FSU's secondary keep the back end organized. Coaches describe him as 'the quarterback of the defense.' Zero off-field issues entering his senior year.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:74, roadGameRating:76, primeTimeRating:80, consistencyRating:82, pressureRating:79, explosivePlayRating:76 },
    stats:{ gamesPlayed:12, tackles:78, interceptions:3, passDeflections:8, forcedFumbles:1 },
    scoutReport:"Veteran safety who anchors FSU's secondary communication. Alabama's aerial attack will test his range in deep zone coverage — if Kirkland holds his coverage assignments, FSU's secondary can limit the big play. His experience in big games (3 prior bowl games) gives him composure that matters in Tuscaloosa." },

  { id:"p_fsu_06", name:"Omar Graham Jr.", position:"LB", teamId:"florida_state", year:"JR", number:"1", heightWeight:"6'2\" / 228", hometown:"Miami, FL",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Miami native who chose FSU and has developed into a productive linebacker for Norvell's defense. His athleticism and blitz ability have been standouts in camp. Fully committed to the program through his junior year.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:76, coldWeatherRating:75, roadGameRating:74, primeTimeRating:78, consistencyRating:78, pressureRating:80, explosivePlayRating:76 },
    stats:{ gamesPlayed:12, tackles:88, sacks:4.5, tacklesForLoss:10, interceptions:1, passDeflections:4 },
    scoutReport:"Athletic linebacker who does his damage in the run game and on delayed blitzes. Alabama's interior OL will face Graham's blitz packages from the second level throughout the game. His coverage ability against running backs on screen routes is a key variable in containing Alabama's short passing game." },

  /* ── WISCONSIN ── */
  { id:"p_wis_01", name:"Colton Joseph", position:"QB", teamId:"wisconsin", year:"JR", number:"12", heightWeight:"6'3\" / 218", hometown:"Virginia Beach, VA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:4, distractionNote:"Old Dominion transfer who was the Sun Belt Offensive Player of the Year (2,624 pass yards + 1,007 rush yards, 34 total TDs). His dual-threat ability is unlike anything Wisconsin has had in years under Fickell. The adjustment from the Sun Belt to the Big Ten is the primary risk factor — the defensive talent level is a significant jump.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:78, bigGameRating:75, coldWeatherRating:80, roadGameRating:74, primeTimeRating:76, consistencyRating:77, pressureRating:76, explosivePlayRating:86 },
    stats:{ gamesPlayed:12, passingYards:2624, passingTDs:26, interceptions:6, completionPct:66.8, qbr:84.2, rushingYards:1007, rushingTDs:8, note:"2025 stats at Old Dominion (Sun Belt POY)" },
    scoutReport:"Dynamic dual-threat QB who brings a dimension Wisconsin hasn't had in years. His rushing ability alone demands defensive respect — linebackers must honor his keep read on every zone option. Notre Dame's defense will assign a spy, which opens passing windows. The talent gap vs. Notre Dame is real, but Joseph's mobility makes Wisconsin unpredictable." },

  { id:"p_wis_02", name:"Abu Sama", position:"RB", teamId:"wisconsin", year:"SR", number:"2", heightWeight:"5'10\" / 212", hometown:"West Hartford, CT",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Iowa State transfer who arrives with Big 12 experience. Power runner who fits Wisconsin's physical identity. His north-south style and short-yardage reliability make him the feature of Fickell's run game. Fully acclimated after a spring in Madison.", socialMediaPattern:"normal", nflDraftStatus:"projected round 4-5", agentContact:false, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:79, bigGameRating:77, coldWeatherRating:84, roadGameRating:76, primeTimeRating:78, consistencyRating:80, pressureRating:82, explosivePlayRating:78 },
    stats:{ gamesPlayed:12, rushingYards:942, rushingTDs:10, yardsPerCarry:5.1, receivingYards:112, receivingTDs:1, receptions:16 },
    scoutReport:"Wisconsin's featured back in the physical power run game. Fickell's offense runs through the RB position — Sama's ability to reach 100 yards determines Wisconsin's ability to stay competitive in Lambeau. Notre Dame's Jack Kiser will be his primary stopper. If Sama breaks tackles for chunk plays, the game script stays manageable for Wisconsin." },

  { id:"p_wis_03", name:"Will Pauling", position:"WR", teamId:"wisconsin", year:"JR", number:"11", heightWeight:"6'1\" / 188", hometown:"Roseville, CA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:1, impact:"medium",
    personalFlags:{ distractionLevel:2, distractionNote:"Wisconsin's top target who leads the team in both receptions and receiving yards. Mettauer clearly trusts him as the chain-mover. Limited recruiting pedigree but has developed into a reliable possession receiver.", socialMediaPattern:"normal", nflDraftStatus:"undrafted", agentContact:false, nilSatisfaction:"medium", transferPortalRisk:"low" },
    performanceMetrics:{ clutchRating:72, bigGameRating:70, coldWeatherRating:78, roadGameRating:70, primeTimeRating:73, consistencyRating:75, pressureRating:73, explosivePlayRating:72 },
    stats:{ gamesPlayed:11, receivingYards:584, receivingTDs:4, receptions:52, yardsPerReception:11.2 },
    scoutReport:"Wisconsin's chain-mover — third-down receiver who creates yards on crossing routes and out-routes against zone. His YAC after the catch is the limiting factor. In South Bend's atmosphere this is a legitimate test of his big-game composure in the biggest road environment of his career." },

  { id:"p_wis_04", name:"T.J. Bollers", position:"EDGE", teamId:"wisconsin", year:"SR", number:"18", heightWeight:"6'4\" / 254", hometown:"Conyers, GA",
    injuryStatus:"healthy", practiceStatus:"full", injuryType:null, injuryHistory:[], injuryProneRating:2, impact:"high",
    personalFlags:{ distractionLevel:2, distractionNote:"Fickell's best edge rusher who returned for a senior year NFL showcase. His versatility — standing up or hand down — creates alignment confusion for offenses. Viewed as a draft darling among NFL scouts tracking Wisconsin.", socialMediaPattern:"quiet", nflDraftStatus:"projected round 2-3", agentContact:true, nilSatisfaction:"high", transferPortalRisk:"none" },
    performanceMetrics:{ clutchRating:80, bigGameRating:78, coldWeatherRating:82, roadGameRating:78, primeTimeRating:80, consistencyRating:80, pressureRating:84, explosivePlayRating:80 },
    stats:{ gamesPlayed:11, sacks:9.5, tacklesForLoss:14, qbHurries:28, forcedFumbles:3 },
    scoutReport:"The most NFL-ready player on Wisconsin's defense. His motor and hand technique are already at the next level. Notre Dame's left tackle will be tested from the first snap — if Bollers creates early disruption, Wisconsin's defense can keep the game competitive deep into the second half." }
];

var GAMES = [
  /* ═══════════════════════════════════════════════════
     WEEK 1 — Sept 5-6, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g01", week: 1,
    date: "2026-09-05", time: "8:00 PM ET",
    homeTeamId: "lsu", awayTeamId: "clemson",
    venue: "Tiger Stadium, Baton Rouge, LA",
    network: "ABC", isConferenceGame: false, isRivalryGame: false,
    weather: { condition: "Clear", tempF: 88, windMph: 5, humidity: 72, indoors: false },
    bettingLines: { spread: -3.5, moneylineHome: -175, moneylineAway: 148, total: 55.5 },
    xFactors: [
      { title: "Death Valley Night Opener", description: "Tiger Stadium at 8 PM is the most electric opener in college football. LSU holds a 91-27 all-time home record in night games. Visiting teams average 1.8 additional false starts and a 12% higher three-and-out rate in this environment.", impactTeam: "lsu", impactDirection: "positive", severity: 9, category: "environment" },
      { title: "Clemson QB Uncertainty", description: "Clemson enters with questions at quarterback heading into 2026. Their signal-caller has limited experience in hostile road environments at this scale. Tiger Stadium at night represents the most difficult road opener any team faces.", impactTeam: "clemson", impactDirection: "negative", severity: 8, category: "player" },
      { title: "Kiffin Home Opener at Tiger Stadium", description: "Lane Kiffin opens his LSU tenure on the biggest stage in college football. His Ole Miss teams were explosive and aggressive — Death Valley night gives him an immediate recruiting and psychological weapon. New staff energy often produces Day 1 over-performance.", impactTeam: "lsu", impactDirection: "positive", severity: 7, category: "coaching" },
      { title: "LSU Blue Chip Ratio", description: "LSU returns 7 four-star or higher players in the starting lineup on each side of the ball. Their talent advantage over Clemson in this game is significant at the skill positions and secondary.", impactTeam: "lsu", impactDirection: "positive", severity: 7, category: "recruiting" }
    ],
    gamePreview: {
      headline: "Bayou Brawl: Season Opener Under the Lights",
      synopsis: "LSU opens the 2026 season hosting Clemson in one of the most electric environments in college football. Death Valley at night is a different animal — 102,000+ fans create a wall of sound that has broken opposing offenses for decades. Clemson arrives with questions at quarterback while LSU returns a veteran offense hungry to prove last year was no fluke.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "LSU holds the clear offensive advantage. With a veteran offensive line and weapons at every skill position, the Tigers have the firepower to score early and build a cushion. Clemson's secondary has shown vulnerability against spread-option concepts — expect LSU to attack the slot and exploit mismatches on early downs." },
        { section: "DEFENSIVE BATTLEGROUND", text: "LSU's defensive front will test Clemson's offensive line from the first snap. The Tigers have four potential first-round picks on defense. If Clemson can establish their run game, they stay competitive — if LSU's front shuts that down, this becomes a long night for the Tigers' offense." },
        { section: "KEY X-FACTOR", text: "The Death Valley night atmosphere. Visiting teams average 1.8 more false starts and a 12% higher three-and-out rate in this building after dark. If Clemson's offense gets rattled on their first two drives, LSU covers by double digits." },
        { section: "COACHING EDGE", text: "Lane Kiffin is one of the most aggressive offensive minds in college football, and Death Valley gives him an immediate home advantage on Day 1 as LSU's coach. Dabo Swinney is brilliant but historically vulnerable in true hostile road environments, especially in season openers away from Death Valley." },
        { section: "THE PICK", text: "LSU -3.5 is the play. Tiger Stadium at night plus a veteran LSU roster versus a Clemson team with real quarterback questions is a perfect storm for the home team. Expect LSU to build a lead by halftime and cover." }
      ],
      thePick: { team: "LSU", line: "-3.5", confidence: "HIGH", unit: 2, reasoning: "Death Valley night game + Clemson QB questions + Kiffin home opener energy = LSU cover" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -3.5, total: 56.0, note: "LSU opened as 3.5-point home favorites Sunday night; immediate sharp action on the Tigers" },
        { time: "Mid-week", spread: -3.5, total: 55.5, note: "Total ticked down half-point — books shading under on high-temperature night game" },
        { time: "Current (Fri)", spread: -4.0, total: 55.0, note: "Line moved to -4 after Clemson's starting center listed limited on Thursday injury report" }
      ],
      publicBetting: { homePct: 58, awayPct: 42, overPct: 54, underPct: 46 },
      beatWriter: [
        { reporter: "Pete Thamel", outlet: "ESPN", report: "LSU ran their crowd-noise drill for the third straight day — Lane Kiffin clearly wants zero mental errors in his debut as Tigers head coach. The secondary looks elite and two freshmen WRs are drawing rave reviews from scouts in camp.", team: "lsu", sentiment: "positive", daysAgo: 2 },
        { reporter: "David Hood", outlet: "TigerNet", report: "Clemson's starting center was limited in Thursday practice with an undisclosed lower-body issue. Dabo held an extended film session specifically on LSU's defensive stunts and twists. QB reps look sharp but the OL depth is a real concern heading into Death Valley.", team: "clemson", sentiment: "negative", daysAgo: 1 }
      ]
    }
  },
  {
    id: "g02", week: 1,
    date: "2026-09-06", time: "7:30 PM ET",
    homeTeamId: "notre_dame", awayTeamId: "wisconsin",
    venue: "Lambeau Field, Green Bay, WI",
    network: "NBC", isConferenceGame: false, isRivalryGame: false,
    weather: { condition: "Clear", tempF: 68, windMph: 8, humidity: 55, indoors: false },
    bettingLines: { spread: -7, moneylineHome: -310, moneylineAway: 255, total: 48.5 },
    xFactors: [
      { title: "Shamrock Series Home Field Effect", description: "The Shamrock Series acts as a neutral-site game that Notre Dame turns into a home game. The Fighting Irish fanbase typically buys 60-70% of available tickets at neutral-site games, creating de-facto home crowd conditions.", impactTeam: "notre_dame", impactDirection: "positive", severity: 8, category: "environment" },
      { title: "Wisconsin Run Defense vs Notre Dame Power", description: "Wisconsin arrives with one of the Big Ten's elite run defenses, holding opponents to under 108 yards per game. Notre Dame's identity is physical football — if Wisconsin stuffs the run, the Irish must rely on their passing game.", impactTeam: "notre_dame", impactDirection: "negative", severity: 7, category: "matchup" },
      { title: "Marcus Freeman Neutral-Site Record", description: "Freeman is 8-2 in neutral-site and bowl games. He specifically prepares his team for non-standard environments and excels at eliminating the travel/distraction factors that affect some programs.", impactTeam: "notre_dame", impactDirection: "positive", severity: 7, category: "coaching" },
      { title: "Wisconsin's Road Struggles", description: "Luke Fickell's Badgers have been inconsistent away from Madison. At premium neutral-site venues with 60,000+ fans, Wisconsin has gone 3-6 ATS in the last four seasons.", impactTeam: "wisconsin", impactDirection: "negative", severity: 6, category: "situational" }
    ],
    gamePreview: {
      headline: "Shamrock at Lambeau: The Green Bay Classic",
      synopsis: "Notre Dame and Wisconsin face off at historic Lambeau Field in one of college football's signature neutral-site games. The Shamrock Series gives Notre Dame a natural home-away advantage with their massive national fanbase — the Fighting Irish essentially treat this as a road home game. Wisconsin brings elite Big Ten defense but will be playing in front of what amounts to a hostile crowd.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Notre Dame has the offensive weapons and versatility advantage. The Irish can attack through the air or on the ground with equal effectiveness, while Wisconsin relies heavily on their power run game. Notre Dame's offensive line depth is a significant advantage against Wisconsin's proven defensive front." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Wisconsin's defense is legitimately elite. Luke Fickell has built a unit that limits explosive plays and forces opponents to earn every yard. Notre Dame must execute their two-minute drill efficiently and avoid mental errors — the Badgers will be physical and disciplined." },
        { section: "KEY X-FACTOR", text: "Crowd composition at Lambeau. Approximately 60% of the crowd will be Notre Dame fans, creating home-game conditions for the Irish. This psychological edge is worth 3-4 points in terms of pre-snap communication, false start vulnerability, and referee inclination." },
        { section: "COACHING EDGE", text: "Marcus Freeman has proven he delivers in big spots and thrives in neutral-site environments. He runs a detailed travel protocol to eliminate distractions. Luke Fickell is excellent but Wisconsin is a decided talent underdog here." },
        { section: "THE PICK", text: "Notre Dame -7 reflects the talent gap accurately. The Irish win comfortably as the de-facto home team with superior overall talent and a coach who prepares perfectly for these moments. Cover expected by double digits." }
      ],
      thePick: { team: "Notre Dame", line: "-7", confidence: "HIGH", unit: 2, reasoning: "Neutral site becomes home game for Notre Dame fanbase + talent gap + Freeman neutral-site record" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -7.0, total: 49.0, note: "Notre Dame opened as 7-point favorites at Lambeau; respected number from the jump" },
        { time: "Mid-week", spread: -7.0, total: 48.5, note: "Total eased half-point on Wisconsin defensive film review; no spread movement" },
        { time: "Current (Fri)", spread: -7.5, total: 48.5, note: "Line crept to -7.5 after sharp ticket count confirms Irish money dominating the window" }
      ],
      publicBetting: { homePct: 62, awayPct: 38, overPct: 48, underPct: 52 },
      beatWriter: [
        { reporter: "Matt Fortuna", outlet: "The Athletic", report: "Marcus Freeman held a full-pads walkthrough at Lambeau on Friday morning. The Irish travel party was unusually relaxed — players hit the field with genuine excitement. Freeman's logistics team handled every detail and the program looks completely dialed in.", team: "notre_dame", sentiment: "positive", daysAgo: 1 },
        { reporter: "Jesse Temple", outlet: "The Athletic", report: "Wisconsin's offensive line had its lowest-graded practice of camp on Wednesday. Luke Fickell is leaning on the defense to set the tone but privately the offensive staff is wrestling with scheme adjustments needed to counter Notre Dame's front seven.", team: "wisconsin", sentiment: "negative", daysAgo: 2 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 2 — Sept 12, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g03", week: 2,
    date: "2026-09-12", time: "7:30 PM ET",
    homeTeamId: "texas", awayTeamId: "ohio_state",
    venue: "Darrell K Royal-Texas Memorial Stadium, Austin, TX",
    network: "ABC", isConferenceGame: false, isRivalryGame: false,
    weather: { condition: "Clear", tempF: 92, windMph: 7, humidity: 68, indoors: false },
    bettingLines: { spread: -3.5, moneylineHome: -175, moneylineAway: 148, total: 58.5 },
    xFactors: [
      { title: "DKR Night Game Chaos", description: "Texas Memorial Stadium holds 100,119 fans and the atmosphere in a primetime home game against a top-5 opponent creates one of the loudest environments in college football. Ohio State's offense has averaged 4.1 more false starts per game in venues over 100,000 capacity as a road team.", impactTeam: "texas", impactDirection: "positive", severity: 9, category: "environment" },
      { title: "Quarterback Storyline", description: "This game will be defined by the quarterback duel. Texas and Ohio State both return experienced signal-callers who thrive in high-pressure environments. The QB who avoids big mistakes will determine the outcome.", impactTeam: "texas", impactDirection: "positive", severity: 8, category: "player" },
      { title: "Ohio State Road Record vs Elite Venues", description: "Ohio State is 12-8 ATS as a road team against venues with 90,000+ capacity over the last six seasons. The Buckeyes struggle to match their neutral-site performance when truly on the road.", impactTeam: "ohio_state", impactDirection: "negative", severity: 7, category: "situational" },
      { title: "Texas Home Record at DKR", description: "Texas is 31-5 at home over the last four years, an 86% home win rate. In primetime games at DKR against ranked opponents, Texas is 8-2.", impactTeam: "texas", impactDirection: "positive", severity: 7, category: "situational" }
    ],
    gamePreview: {
      headline: "The Showdown: Texas Hosts Ohio State in the Biggest Week 2 Game in Years",
      synopsis: "In what could preview a College Football Playoff matchup, Texas hosts Ohio State in a game that will define both programs' national championship aspirations. DKR Memorial Stadium with 100,000+ fans creates one of the loudest environments in the sport, and Texas has a home-field advantage that the computer models consistently undervalue. Ohio State arrives as one of the most talented teams in college football but faces a legitimately hostile road environment.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Texas holds the home-field offensive edge. The Longhorns attack with multiple weapons and a mobile quarterback who extends plays and scrambles for key third-down conversions. Ohio State is equally loaded but must execute in an environment unlike any Big Ten road game they face." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Ohio State's defense is elite and will test Texas's offensive line. The Buckeyes have first-round talent at every level of their defense. Texas must establish the run on first down to open the passing game — if they fall into third-and-long, Ohio State's pass rush will be disruptive." },
        { section: "KEY X-FACTOR", text: "DKR home-field advantage at night. Texas is 31-5 at home over the last four years. Ohio State's offense averages 4.1 more false starts per game at venues over 100K capacity — that communication breakdown alone can change field position and momentum." },
        { section: "COACHING EDGE", text: "Steve Sarkisian has Texas operating at peak efficiency and has specifically built this game into his team's preparation since spring. Ryan Day is battle-tested but has shown he can be vulnerable in high-pressure true road environments." },
        { section: "THE PICK", text: "Texas -3.5 at home is the play. The home-field edge at DKR combined with a motivated Longhorn team that circled this game all offseason gives Texas the slight advantage. Expect a close game that Texas wins by 7." }
      ],
      thePick: { team: "Texas", line: "-3.5", confidence: "HIGH", unit: 2, reasoning: "DKR night game advantage + Texas home fortress record + Ohio State road struggles at 100K venues" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -3.5, total: 58.5, note: "Texas opened as 3.5-point home favorites; sharp books came in quickly under the total" },
        { time: "Mid-week", spread: -4.0, total: 58.0, note: "Line moved to -4 as local Texas money flooded the market; total edged down" },
        { time: "Current (Fri)", spread: -3.5, total: 57.5, note: "Line reverse-moved back to -3.5 as Ohio State sharp money arrived Thursday evening" }
      ],
      publicBetting: { homePct: 55, awayPct: 45, overPct: 61, underPct: 39 },
      beatWriter: [
        { reporter: "Chris Hummer", outlet: "247Sports", report: "Texas held a spirited closed practice Thursday — camp sources say the energy on the defensive side is at a season-high after film review of Ohio State's tendencies. Sarkisian is installing two new red-zone packages specifically for this game.", team: "texas", sentiment: "positive", daysAgo: 1 },
        { reporter: "Dan Hope", outlet: "Eleven Warriors", report: "Ryan Day confirmed Ohio State's starting QB is fully healthy and running the full playbook after a minor camp shoulder issue. The Buckeyes practiced in heat simulation for three consecutive days to prepare for Austin conditions in September.", team: "ohio_state", sentiment: "positive", daysAgo: 2 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 3 — Sept 19, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g04", week: 3,
    date: "2026-09-19", time: "3:30 PM ET",
    homeTeamId: "alabama", awayTeamId: "florida_state",
    venue: "Bryant-Denny Stadium, Tuscaloosa, AL",
    network: "ESPN", isConferenceGame: false, isRivalryGame: false,
    weather: { condition: "Partly Cloudy", tempF: 86, windMph: 6, humidity: 65, indoors: false },
    bettingLines: { spread: -13.5, moneylineHome: -680, moneylineAway: 500, total: 56.5 },
    xFactors: [
      { title: "Alabama Depth Advantage", description: "Alabama has 17 four-star or higher players projected to see significant time. Florida State has 9. By the fourth quarter, Alabama rotates fresh talent while FSU's starters are fatigued — the depth advantage alone is worth 7+ points in the second half.", impactTeam: "alabama", impactDirection: "positive", severity: 9, category: "recruiting" },
      { title: "Bryant-Denny Afternoon Heat", description: "Alabama hosts in September heat that regularly exceeds 100 degrees on the field surface. Alabama is accustomed to these conditions; Florida State players from the Florida coast are not. Heat conditioning is a legitimate performance factor.", impactTeam: "alabama", impactDirection: "positive", severity: 7, category: "environment" },
      { title: "FSU Transfer Portal Upgrades", description: "Mike Norvell has used the transfer portal aggressively to rebuild FSU's roster. Several key portal additions from SEC schools bring experience with this level of competition and should keep FSU competitive in the first half.", impactTeam: "florida_state", impactDirection: "positive", severity: 6, category: "recruiting" },
      { title: "Alabama Non-Conference Home Record", description: "Alabama is 48-2 in non-conference home games over the last decade. Their preparation for what they consider tune-up games is thorough but their motivation levels can occasionally drop against non-power opponents.", impactTeam: "alabama", impactDirection: "positive", severity: 7, category: "situational" }
    ],
    gamePreview: {
      headline: "Crimson Tide Opener: Alabama's Talent Advantage on Full Display",
      synopsis: "Alabama hosts Florida State in a marquee non-conference matchup at Bryant-Denny Stadium. The Crimson Tide should win comfortably, but FSU under Mike Norvell has used the transfer portal to build a roster capable of keeping early games competitive. The question is not whether Alabama wins — it is whether FSU can keep this from becoming an embarrassing blowout.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Alabama's offense is overwhelming. The Tide average 38+ points per game at home and have multiple first-round NFL Draft talents. Florida State's pass defense has shown vulnerability against pro-style attacks that flood zones with underneath routes — Alabama will exploit this systematically and establish the score early." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Alabama's defensive line will dominate. The Tide have NFL-caliber players at every position on their defense. The key question is whether FSU's offensive line — which has improved significantly under Norvell — can generate any push and keep the score respectable." },
        { section: "KEY X-FACTOR", text: "Alabama's depth rotation. By the third quarter, the Tide will have rotated in fresh backups while FSU's starters are grinding. Alabama's depth chart depth is worth 7-10 points in the second half of games like this." },
        { section: "COACHING EDGE", text: "Kalen DeBoer has Alabama running with precision and depth. Mike Norvell is a solid offensive-minded coach doing good work at FSU, but outgunned in resources and overall talent here. The coaching gap is secondary to the talent gap." },
        { section: "THE PICK", text: "Alabama -13.5 is real value. At home against an ACC program still in the building phase, Alabama's depth and talent advantage is decisive. Expect Alabama to win by 21+ and cover comfortably." }
      ],
      thePick: { team: "Alabama", line: "-13.5", confidence: "HIGH", unit: 2, reasoning: "Alabama talent depth overwhelming + home fortress + FSU still in rebuild = Tide cover convincingly" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -13.5, total: 57.0, note: "Alabama opened as massive 13.5-point home favorites; books set high expecting square money on Bama" },
        { time: "Mid-week", spread: -14.0, total: 56.5, note: "Line inflated to -14 on Tide ticket volume; total slid on heat weather forecast" },
        { time: "Current (Fri)", spread: -13.5, total: 56.5, note: "Sharp fade-the-public money trimmed the line back to -13.5 by Friday afternoon" }
      ],
      publicBetting: { homePct: 71, awayPct: 29, overPct: 52, underPct: 48 },
      beatWriter: [
        { reporter: "Cecil Hurt", outlet: "Tuscaloosa News", report: "Alabama's depth chart is set and Kalen DeBoer appears fully comfortable calling plays in Bryant-Denny after two full years in Tuscaloosa. Practice tempo was the highest of fall camp this week with pads coming out Thursday.", team: "alabama", sentiment: "positive", daysAgo: 2 },
        { reporter: "Ira Schoffel", outlet: "Warchant", report: "Florida State's offensive coordinator confirmed the starting QB will play despite a minor knee scope in July. The Seminoles arrived in Tuscaloosa Friday morning and held a walkthrough but sideline sources note the defense looks thin at linebacker depth.", team: "florida_state", sentiment: "negative", daysAgo: 1 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 4 — Sept 26, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g05", week: 4,
    date: "2026-09-26", time: "7:30 PM ET",
    homeTeamId: "texas", awayTeamId: "tennessee",
    venue: "Darrell K Royal-Texas Memorial Stadium, Austin, TX",
    network: "ABC", isConferenceGame: true, isRivalryGame: false,
    weather: { condition: "Clear", tempF: 85, windMph: 8, humidity: 62, indoors: false },
    bettingLines: { spread: -4.5, moneylineHome: -210, moneylineAway: 178, total: 59.5 },
    xFactors: [
      { title: "Heupel Tempo vs Texas Defense", description: "Josh Heupel's offense runs the fastest pace in the SEC — averaging under 18 seconds between snaps. No amount of game-planning fully prepares a defense for Tennessee's tempo. Texas's defense averages 2.4 more blown assignments per game against high-tempo offenses.", impactTeam: "tennessee", impactDirection: "positive", severity: 9, category: "scheme" },
      { title: "Nico Iamaleava Mobility Creates Third Dimension", description: "Iamaleava's ability to extend plays with his legs turns incomplete passes into first downs. Texas's scheme is built to stop the run — Nico's scramble ability exploits that defensive assignment structure when the pocket collapses.", impactTeam: "tennessee", impactDirection: "positive", severity: 8, category: "player" },
      { title: "Texas SEC Road Warrior Status", description: "Texas is adjusting to SEC road environments. Their home record is elite but their first SEC road games have occasionally featured adjustment penalties and false starts from crowd noise unfamiliarity.", impactTeam: "tennessee", impactDirection: "positive", severity: 6, category: "situational" },
      { title: "Tennessee Vertical Passing Game", description: "Tennessee ranked top 5 nationally in yards per attempt last season. Against Texas zone coverage, the Vols will attack the deep ball early to test whether the Longhorns can carry coverage over the top for 60 minutes.", impactTeam: "tennessee", impactDirection: "positive", severity: 7, category: "matchup" }
    ],
    gamePreview: {
      headline: "QB Showdown in Austin: Tennessee +4.5 Is the Value Side",
      synopsis: "Two of college football's most compelling quarterbacks face off as Tennessee visits DKR Memorial Stadium. This is a chess match between two programs with legitimate national championship aspirations. Texas is a 4.5-point home favorite, but Heupel's tempo attack and Nico Iamaleava's improvisation make Tennessee the value play regardless of where the game is played.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Both offenses are elite, but the edge goes to Tennessee's scheme. Heupel's high-tempo system generates favorable down-and-distance situations that no defense can fully simulate in preparation. Texas's defense will be well-prepared but will still face tempo they cannot fully account for." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Tennessee's defense is underrated and physical. The Vols held opponents to under 19 PPG last season and bring elite pass rushers who can disrupt Texas's timing routes. If Tennessee wins the turnover battle, they win the game outright." },
        { section: "KEY X-FACTOR", text: "Nico Iamaleava's mobility. Texas's defensive scheme is built to contain the run — Iamaleava's scramble ability exploits those assignments when the pocket collapses, turning would-be incompletions into 15-yard scrambles that change field position dramatically." },
        { section: "COACHING EDGE", text: "Heupel's tempo is a built-in coaching advantage that is impossible to fully neutralize through game planning. The pace alone generates 3-5 extra possessions per game that accumulate into points by the fourth quarter." },
        { section: "THE PICK", text: "Tennessee +4.5 is the value side. Heupel's tempo attack, Iamaleava's mobility, and Tennessee's physical defense make this game a coin flip regardless of location. Take the Vols with the points." }
      ],
      thePick: { team: "Tennessee", line: "+4.5", confidence: "HIGH", unit: 2, reasoning: "Heupel tempo impossible to simulate + Iamaleava mobility creates third dimension + underdog value" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -3.0, total: 60.5, note: "Texas opened as 3-point home favorites in this SEC showdown; high total reflects both offenses" },
        { time: "Mid-week", spread: -3.5, total: 61.0, note: "Texas money pushed spread to -3.5; total climbed as sharp over-bettors targeted both QBs" },
        { time: "Current (Fri)", spread: -3.5, total: 61.5, note: "Total continued upward — two respected sharps confirmed over plays on Friday" }
      ],
      publicBetting: { homePct: 54, awayPct: 46, overPct: 66, underPct: 34 },
      beatWriter: [
        { reporter: "Brian Davis", outlet: "Austin American-Statesman", report: "Texas's offense produced its best red-zone efficiency of fall camp in Thursday's inside-run period. The Longhorns appear to have sorted their OL rotation and Sarkisian's tempo package looks ready to deploy against Tennessee's fast defensive substitution scheme.", team: "texas", sentiment: "positive", daysAgo: 1 },
        { reporter: "John Brice", outlet: "Vol Report", report: "Tennessee's defensive backfield has been the most-discussed unit in Knoxville all week. Josh Heupel held extra film sessions on Texas's slot receiver tendencies and the Vols are expected to play nickel-heavy to counter the Longhorns' speed.", team: "tennessee", sentiment: "neutral", daysAgo: 2 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 5 — Oct 3, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g06", week: 5,
    date: "2026-10-03", time: "8:00 PM ET",
    homeTeamId: "miami", awayTeamId: "clemson",
    venue: "Hard Rock Stadium, Miami Gardens, FL",
    network: "ESPN", isConferenceGame: true, isRivalryGame: false,
    weather: { condition: "Clear", tempF: 82, windMph: 10, humidity: 78, indoors: false },
    bettingLines: { spread: -3.5, moneylineHome: -175, moneylineAway: 148, total: 52.5 },
    xFactors: [
      { title: "Miami NIL and Facilities Surge", description: "Cristobal has leveraged Miami's South Florida market to build one of the top NIL programs in the ACC. The Hurricanes have signed 14 four-star or higher portal transfers in the last 18 months — the talent gap over Clemson at skill positions is now measurable.", impactTeam: "miami", impactDirection: "positive", severity: 8, category: "recruiting" },
      { title: "Clemson Defense Holds Despite Transition", description: "Even in rebuilding years, Dabo Swinney's defensive units consistently outperform expectations. Clemson ranked 14th nationally in points allowed last season — their defense will keep them competitive.", impactTeam: "clemson", impactDirection: "positive", severity: 8, category: "defense" },
      { title: "Hard Rock Stadium Home Atmosphere", description: "Miami's NFL-caliber venue and South Florida fanbase create a premium home game experience. Clemson has not played at Hard Rock in five years — the game-night environment will be an adjustment.", impactTeam: "miami", impactDirection: "positive", severity: 7, category: "environment" },
      { title: "Cristobal Home Record", description: "Mario Cristobal is 24-6 at home across his coaching career. He prepares his home games as premium events and his teams consistently outperform expectations as home favorites.", impactTeam: "miami", impactDirection: "positive", severity: 6, category: "coaching" }
    ],
    gamePreview: {
      headline: "The U Is Back: Hurricanes Assert ACC Dominance at Hard Rock",
      synopsis: "Mario Cristobal's Miami Hurricanes have returned to national relevance and they host Clemson in a game that carries major ACC standings implications. Miami has the talent, the facilities investment, and the South Florida recruiting pipeline to be a legitimate playoff contender. Clemson arrives with a strong defense but real questions about offensive horsepower.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Miami has the clear offensive talent edge. Their offensive line is the best in the ACC and they have skill players who create in the open field after the catch. Clemson's offense has been inconsistent and will face a Miami defense that has added elite portal talent in the secondary." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Clemson's defense remains legitimately elite. The Tigers held opponents to under 18 PPG in conference play last year. Miami's offense must establish the run to keep Clemson's pass rush manageable and create play-action opportunities." },
        { section: "KEY X-FACTOR", text: "Miami's South Florida recruiting pipeline. The Hurricanes have 8 top-150 recruits from South Florida in the current two-deep — homegrown talent with everything to prove in front of their own community on a Saturday night at Hard Rock." },
        { section: "COACHING EDGE", text: "Cristobal is on an upward trajectory and has Miami's program pointed in the right direction. Dabo is an all-time great, but Clemson is in a relative rebuild while Miami is ascending. The momentum indicator favors Miami." },
        { section: "THE PICK", text: "Miami -3.5 is solid value. Hurricane momentum, superior recruiting, and home-field advantage make this a comfortable home win. Expect Miami to control the second half." }
      ],
      thePick: { team: "Miami", line: "-3.5", confidence: "HIGH", unit: 2, reasoning: "Miami ascending trajectory + Clemson offensive transition + South Florida home game" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -4.5, total: 55.5, note: "Miami opened as 4.5-point home favorites in this ACC heavyweight matchup" },
        { time: "Mid-week", spread: -5.0, total: 55.0, note: "Spread moved to -5 as Miami home money dominated; total slid on Clemson defensive film" },
        { time: "Current (Fri)", spread: -4.5, total: 55.0, note: "Reverse-line movement as sharp Clemson money arrived — worth noting for live betting" }
      ],
      publicBetting: { homePct: 60, awayPct: 40, overPct: 51, underPct: 49 },
      beatWriter: [
        { reporter: "Shehan Jeyarajah", outlet: "CBS Sports", report: "Miami's pass rush group had its most impressive practice of the year on Thursday. Mario Cristobal is stressing execution fundamentals this week — the Hurricanes have won eight of their last nine home games against ranked opponents.", team: "miami", sentiment: "positive", daysAgo: 1 },
        { reporter: "David Hood", outlet: "TigerNet", report: "Clemson installed significant new run-game wrinkles this week specifically designed to attack Miami's edge defenders. Dabo Swinney confirmed both starting tackles are healthy after recent camp concerns. The Tigers' bye-week preparation appears focused and disciplined.", team: "clemson", sentiment: "positive", daysAgo: 2 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 6 — Oct 10, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g07", week: 6,
    date: "2026-10-10", time: "8:00 PM ET",
    homeTeamId: "alabama", awayTeamId: "georgia",
    venue: "Bryant-Denny Stadium, Tuscaloosa, AL",
    network: "CBS", isConferenceGame: true, isRivalryGame: true,
    weather: { condition: "Clear", tempF: 78, windMph: 6, humidity: 58, indoors: false },
    bettingLines: { spread: -3.5, moneylineHome: -175, moneylineAway: 148, total: 53.5 },
    xFactors: [
      { title: "Bryant-Denny October Night Game", description: "Alabama at home in October under the lights is one of college football's signature events. The Crimson Tide are 18-2 at Bryant-Denny in night games over the last decade, and Georgia has won just 2 of their last 6 visits to Tuscaloosa.", impactTeam: "alabama", impactDirection: "positive", severity: 9, category: "environment" },
      { title: "Georgia December-Style October Football", description: "Kirby Smart's teams famously play their best football in October and November. The Bulldogs have the talent and depth to grind through a four-quarter battle — this is not a game Georgia will sleepwalk through.", impactTeam: "georgia", impactDirection: "positive", severity: 8, category: "coaching" },
      { title: "Alabama Defensive Front", description: "Alabama's defensive line has four NFL-caliber players. Georgia's offensive line is elite but will face their most physical challenge of the season. The trench battle between these two elite programs will determine the tempo of the entire game.", impactTeam: "alabama", impactDirection: "positive", severity: 8, category: "matchup" },
      { title: "SEC Championship Preview Stakes", description: "Both teams know this game has SEC Championship Game implications. The loser must run the table in conference play — elevating the pressure and intensity to playoff-level motivation for both sides.", impactTeam: "alabama", impactDirection: "positive", severity: 7, category: "motivation" }
    ],
    gamePreview: {
      headline: "SEC Power Summit: Alabama vs Georgia for SEC West Supremacy",
      synopsis: "The game that decides SEC supremacy takes place at Bryant-Denny Stadium. Both Alabama and Georgia are national championship caliber programs, and neither team will back down. In a game this close in talent, home field is often the deciding factor — and Bryant-Denny in October at night is as significant a home advantage as exists in college football.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Both offenses are elite and well-designed. Georgia's offense is more balanced, using the run to set up the pass. Alabama attacks through the air first. Alabama's home crowd creates defensive alignment problems that favor the home team's offense — the slight edge goes to the Tide." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Georgia's defense is elite regardless of personnel changes. The Bulldogs recruit and develop defensive talent at a rate that keeps the unit stocked with NFL-ready players. Alabama's offensive line faces their toughest test of the season — if Georgia wins the trench battle, they control the game." },
        { section: "KEY X-FACTOR", text: "Alabama's home record vs Georgia. The Tide are 38-5 at Bryant-Denny over the last four seasons, and Georgia has won just 2 of their last 6 visits to Tuscaloosa. The history says the home team covers in this matchup." },
        { section: "COACHING EDGE", text: "Both coaches are elite. DeBoer has established program continuity and motivation at Alabama. Smart is tactically brilliant but his record at Bryant-Denny is 2-4. That specific matchup history is a meaningful edge." },
        { section: "THE PICK", text: "Alabama -3.5 at home is the lean. Home field advantage in a rivalry game where both teams are equal in talent gives us the slight edge to the Tide. Expect a close, physical game with Alabama winning by a field goal to a touchdown." }
      ],
      thePick: { team: "Alabama", line: "-3.5", confidence: "HIGH", unit: 2, reasoning: "Bryant-Denny home fortress + Smart 2-4 in Tuscaloosa + night game October advantage" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -3.0, total: 48.5, note: "Alabama opened as 3-point home favorites in what may be the most anticipated regular-season game of 2026" },
        { time: "Mid-week", spread: -3.5, total: 48.0, note: "Spread pushed to -3.5 on Alabama home money; total dropped as sharp under-bettors targeted the defensive matchup" },
        { time: "Current (Fri)", spread: -3.5, total: 47.5, note: "Total crept further down — both Vegas and sharp books fading the over in this defensive identity game" }
      ],
      publicBetting: { homePct: 52, awayPct: 48, overPct: 44, underPct: 56 },
      beatWriter: [
        { reporter: "Cecil Hurt", outlet: "Tuscaloosa News", report: "Alabama's defensive preparation this week has been the most elaborate of the DeBoer era. The Tide held a full-speed, live-tackling session Thursday focused entirely on stopping Georgia's power run game. Camp buzz is that the linebacker rotation has finally found its depth.", team: "alabama", sentiment: "positive", daysAgo: 1 },
        { reporter: "Seth Emerson", outlet: "The Athletic", report: "Kirby Smart has been characteristically tight-lipped but Georgia's practice tempo this week was notably intense. The Bulldogs' offensive line had its sharpest week of camp and camp sources indicate Carson Beck has been locked in during film sessions.", team: "georgia", sentiment: "positive", daysAgo: 2 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 7 — Oct 17, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g08", week: 7,
    date: "2026-10-17", time: "3:30 PM ET",
    homeTeamId: "tennessee", awayTeamId: "alabama",
    venue: "Neyland Stadium, Knoxville, TN",
    network: "CBS", isConferenceGame: true, isRivalryGame: true,
    weather: { condition: "Partly Cloudy", tempF: 65, windMph: 9, humidity: 52, indoors: false },
    bettingLines: { spread: 3.5, moneylineHome: 148, moneylineAway: -175, total: 54.5 },
    xFactors: [
      { title: "Neyland Stadium Third Saturday Tradition", description: "The Third Saturday in October is the most anticipated regular-season game in the SEC every year. Neyland Stadium holds 102,455 fans and the decibel level during key defensive stands has been measured above jet engine noise. Visiting quarterbacks average 15% more incompletions here than their season average.", impactTeam: "tennessee", impactDirection: "positive", severity: 10, category: "environment" },
      { title: "James Pearce Jr. Edge Rush Motivation", description: "Pearce returned from NFL Draft consideration specifically to compete in this rivalry. He has publicly stated beating Alabama is a personal mission. A motivated Pearce with something to prove against Alabama's offensive line is a dangerous combination.", impactTeam: "tennessee", impactDirection: "positive", severity: 9, category: "player" },
      { title: "Alabama Away-Game Psychological Challenge", description: "Neyland is consistently rated the most hostile visiting environment for Alabama by their own players in exit interviews. The Tide are 4-6 ATS in their last 10 true road games against top-25 opponents.", impactTeam: "alabama", impactDirection: "negative", severity: 8, category: "situational" },
      { title: "Heupel Tempo at Home Creates Maximum Chaos", description: "Tennessee at home running Heupel tempo is uniquely disorienting for visiting defenses. The crowd noise creates additional communication breakdowns that compound the pre-snap chaos Tennessee's offense is designed to exploit.", impactTeam: "tennessee", impactDirection: "positive", severity: 8, category: "scheme" }
    ],
    gamePreview: {
      headline: "Third Saturday in October: The Rivalry That Shakes Knoxville",
      synopsis: "The most electric regular-season game in college football returns to Knoxville. Neyland Stadium at 102,455 fans is a true force multiplier for the home team — the decibel levels measured in this stadium during key moments affect player cognition and on-field communication. Alabama arrives as a 3.5-point road favorite, but anyone who has attended this game knows that line is deceptively low.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Alabama's offense has superior raw talent and efficiency. However, Neyland Stadium creates a unique communication challenge — visiting quarterbacks average 15% more incompletions in this building than their season average. Alabama's offense will be excellent but the noise will cause uncharacteristic errors." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Tennessee's defense under the new regime is legitimate and motivated. James Pearce Jr. as the edge rusher is an elite talent who will make Alabama's quarterback uncomfortable all day. The Vols defensive line can disrupt Alabama's rhythm and create negative plays." },
        { section: "KEY X-FACTOR", text: "Neyland at 3:30 PM on Third Saturday. The crowd builds to full volume by kickoff and sustains it through four quarters. Tennessee has a documented home advantage that translates to 4-5 measurable points — Alabama's 3.5-point spread barely accounts for half of that." },
        { section: "COACHING EDGE", text: "Heupel knows how to use this crowd as a weapon. His team prepares with amplified crowd noise all week and is conditioned to operate in maximum noise environments. Alabama's staff must scheme specifically for the crowd factor." },
        { section: "THE PICK", text: "Tennessee +3.5 is the value play. Neyland home advantage plus James Pearce's edge rush plus the emotional intensity of the Third Saturday make this the right side. Take the Vols and the points." }
      ],
      thePick: { team: "Tennessee", line: "+3.5", confidence: "HIGH", unit: 2, reasoning: "Neyland home advantage worth 4-5 points + Pearce motivated + Alabama road struggles vs elite venues" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -1.5, total: 52.0, note: "Tennessee opened as slight 1.5-point home favorites in The Third Saturday in October" },
        { time: "Mid-week", spread: -2.0, total: 51.5, note: "Local Knoxville money moved the spread to -2; total edged down on expected cold-weather forecast" },
        { time: "Current (Fri)", spread: -2.5, total: 51.5, note: "Tennessee spread grew to -2.5 on Friday — public money overwhelmingly on Vols" }
      ],
      publicBetting: { homePct: 58, awayPct: 42, overPct: 49, underPct: 51 },
      beatWriter: [
        { reporter: "John Brice", outlet: "Vol Report", report: "Neyland Stadium's walkthrough was electric Friday morning — Vol fans have been camped outside the stadium since Thursday evening. Josh Heupel's offense installed new quarterback scramble packages this week specifically to attack Alabama's contain assignments.", team: "tennessee", sentiment: "positive", daysAgo: 1 },
        { reporter: "Cecil Hurt", outlet: "Tuscaloosa News", report: "Alabama arrived in Knoxville with full health on their two-deep and DeBoer confirmed no injury news Friday. The Tide appeared focused in a brief media availability — notable that the secondary coach held an extra session on Tennessee's deep ball routes Thursday afternoon.", team: "alabama", sentiment: "neutral", daysAgo: 1 }
      ]
    }
  },
  {
    id: "g09", week: 7,
    date: "2026-10-17", time: "12:00 PM ET",
    homeTeamId: "michigan", awayTeamId: "penn_state",
    venue: "Michigan Stadium, Ann Arbor, MI",
    network: "FOX", isConferenceGame: true, isRivalryGame: true,
    weather: { condition: "Overcast", tempF: 55, windMph: 14, humidity: 60, indoors: false },
    bettingLines: { spread: -3.5, moneylineHome: -175, moneylineAway: 148, total: 47.5 },
    xFactors: [
      { title: "Big House Crowd Factor", description: "Michigan Stadium holds 107,601 fans — the largest stadium in America. In a primetime or big-game atmosphere, The Big House creates sustained crowd noise that Penn State's offense must communicate through for 60 minutes. Penn State is 2-6 in their last 8 visits to Ann Arbor.", impactTeam: "michigan", impactDirection: "positive", severity: 9, category: "environment" },
      { title: "Michigan Offensive Line Advantage", description: "Michigan's offensive line is among the Big Ten's best and has been built specifically for power football in October. Against Penn State's front seven, the run game will set up the play-action passing that defines Michigan's system.", impactTeam: "michigan", impactDirection: "positive", severity: 8, category: "matchup" },
      { title: "Matt Campbell Penn State Road Debut", description: "Campbell is coaching his first true road game in a hostile Big Ten environment as Penn State's new head coach. First-year coaches at power programs show more variance on the road — their systems are still being installed under game conditions.", impactTeam: "penn_state", impactDirection: "negative", severity: 7, category: "coaching" },
      { title: "Big Ten Standings Implications", description: "The loser of this game must essentially run the table in conference play to reach the Big Ten Championship. Both teams know what is at stake, which elevates the intensity and physical nature of the contest.", impactTeam: "michigan", impactDirection: "positive", severity: 7, category: "motivation" }
    ],
    gamePreview: {
      headline: "Big Ten Battle at The Big House: Michigan vs Penn State",
      synopsis: "The Big Ten rivalry that matters most outside of The Game comes to Ann Arbor. Michigan Stadium holds 107,601 fans and creates an early-October atmosphere that Penn State must navigate as a road team. Both programs have Big Ten title and playoff aspirations, and the loser faces a difficult path to Indianapolis.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Michigan's offense is built for power football with an elite offensive line. At home, the Wolverines can dictate tempo and impose their will through the run game. Penn State's offense is more explosive vertically, but Michigan's home environment historically limits the big plays that define Penn State's offense." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Both defenses are elite Big Ten units. Michigan's front four creates consistent pressure without blitzing, which is the system's foundation. Penn State's offense must block Michigan's defensive line for 60 minutes on the road — a tall order at The Big House." },
        { section: "KEY X-FACTOR", text: "Kyle Whittingham vs Matt Campbell is a first-time matchup between two new head coaches. The Big House adds another layer of uncertainty for Campbell's Penn State, which is still installing his Iowa State system. Whittingham has 21 seasons of Power conference head coaching experience." },
        { section: "COACHING EDGE", text: "Kyle Whittingham brings 21 seasons of experience as a Power conference head coach to Michigan. Matt Campbell is excellent — his Iowa State program consistently exceeded expectations — but this is his first year at a blue blood, and his first big road game at The Big House." },
        { section: "THE PICK", text: "Michigan -3.5 at home is solid. Home-field edge, Whittingham's experience advantage, and Campbell still installing his system in Year 1 give the Wolverines the cover." }
      ],
      thePick: { team: "Michigan", line: "-3.5", confidence: "HIGH", unit: 2, reasoning: "Big House home advantage + Whittingham 21-year coaching experience + Campbell Year 1 road variance" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -3.0, total: 47.5, note: "Michigan opened as 3-point home favorites in The Big House against Penn State" },
        { time: "Mid-week", spread: -3.5, total: 47.0, note: "Spread bumped to -3.5 on Michigan home volume; under money drove the total down" },
        { time: "Current (Fri)", spread: -3.0, total: 47.0, note: "Reverse line movement back to -3 — sharp Penn State money arrived Thursday night" }
      ],
      publicBetting: { homePct: 55, awayPct: 45, overPct: 46, underPct: 54 },
      beatWriter: [
        { reporter: "Austin Meek", outlet: "The Athletic", report: "Kyle Whittingham confirmed Michigan's starting quarterback is fully healthy after early-camp concerns. The Wolverines held an unusually spirited closed practice Thursday — Big House sellout energy is building in Ann Arbor with over 110,000 expected.", team: "michigan", sentiment: "positive", daysAgo: 1 },
        { reporter: "Josh Moyer", outlet: "Centre Daily Times", report: "Matt Campbell confirmed Penn State's starting safety will miss this game with an ankle injury — a potential game-changer against Michigan's power run game. The Nittany Lions installed a new defensive front rotation Thursday to compensate.", team: "penn_state", sentiment: "negative", daysAgo: 1 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 9 — Oct 31, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g10", week: 9,
    date: "2026-10-31", time: "3:30 PM ET",
    homeTeamId: "georgia", awayTeamId: "florida",
    venue: "TIAA Bank Field, Jacksonville, FL",
    network: "CBS", isConferenceGame: true, isRivalryGame: true,
    weather: { condition: "Partly Cloudy", tempF: 74, windMph: 11, humidity: 70, indoors: false },
    bettingLines: { spread: -9, moneylineHome: -450, moneylineAway: 360, total: 50.5 },
    xFactors: [
      { title: "Georgia Series Dominance", description: "Georgia has won 5 of the last 6 Cocktail Party matchups, and their average margin of victory in that span is 18.4 points. The Bulldogs have built a culture of dominance in this series that compounds year over year.", impactTeam: "georgia", impactDirection: "positive", severity: 9, category: "situational" },
      { title: "Florida Rebuilding Status", description: "The Gators are in a genuine rebuild and have struggled to recruit consistently at the SEC-elite level. Their roster has clear talent gaps compared to Georgia, and that gap is measurable in the statistics.", impactTeam: "florida", impactDirection: "negative", severity: 9, category: "recruiting" },
      { title: "Kirby Smart Rivalry Preparation", description: "Smart has specifically built Georgia's program to dominate rivals. His preparation for Florida week is meticulous and his teams are always physically superior by the fourth quarter of rivalry games.", impactTeam: "georgia", impactDirection: "positive", severity: 8, category: "coaching" },
      { title: "Cocktail Party Neutrality Myth", description: "Despite being a neutral-site game, Georgia fans have consistently outnumbered Florida fans at TIAA Bank Field by 55-45 in recent years as the Bulldogs have dominated. The atmosphere is closer to a Georgia home game.", impactTeam: "georgia", impactDirection: "positive", severity: 7, category: "environment" }
    ],
    gamePreview: {
      headline: "World's Largest Outdoor Cocktail Party: Georgia's Dominance Continues",
      synopsis: "The annual neutral-site classic in Jacksonville pits a Georgia powerhouse against a Florida program in the midst of a significant rebuild. This is not the same competitive rivalry it once was — Georgia brings a superior roster, superior coaching, and has dominated this series with a five-of-six record recently. Florida has the talent of past years but has not yet rebuilt to SEC elite status.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Georgia's offense is significantly more advanced with elite NFL talent at every position. Florida's defense is still developing under the new coaching staff and will be exposed by Georgia's multi-dimensional attack. The Bulldogs will establish the run early and build a lead." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Georgia's defense is the best unit on the field by a wide margin. Florida's offense has struggled to put up points against elite competition, and Smart's defensive scheme will expose those limitations in the passing game and on third down." },
        { section: "KEY X-FACTOR", text: "Georgia's experience in this game. The Bulldogs have won 5 of 6 here, and the current roster has players who have been part of multiple wins at TIAA Bank Field. Experience in rivalry settings matters, and Georgia has significantly more of it." },
        { section: "COACHING EDGE", text: "Kirby Smart owns this rivalry. His teams have dominated it through superior preparation and talent advantage. Florida's staff is working to rebuild but is years behind Georgia's program depth." },
        { section: "THE PICK", text: "Georgia -9 is real value. The talent gap between these programs is substantial, and Florida has not shown the ability to compete with elite Georgia teams. Expect Georgia to win by 17-21 and cover comfortably." }
      ],
      thePick: { team: "Georgia", line: "-9", confidence: "HIGH", unit: 2, reasoning: "Georgia dominates series 5-of-6 + massive talent gap over rebuilding Florida + Smart rivalry preparation" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -3.0, total: 49.5, note: "Georgia opened as 3-point favorites in the World's Largest Outdoor Cocktail Party in Jacksonville" },
        { time: "Mid-week", spread: -3.5, total: 49.0, note: "Georgia money moved the spread to -3.5; total ticked down on defensive film from both programs" },
        { time: "Current (Fri)", spread: -3.5, total: 49.0, note: "Line stable heading into game week — even ticket split despite neutral-site designation" }
      ],
      publicBetting: { homePct: 53, awayPct: 47, overPct: 50, underPct: 50 },
      beatWriter: [
        { reporter: "Seth Emerson", outlet: "The Athletic", report: "Georgia has had an unusual amount of energy in Jacksonville week practices — Kirby Smart credited the senior class for raising the intensity. The Bulldogs' defensive line rotation is at full strength with no injury concerns heading into the World's Largest Outdoor Cocktail Party.", team: "georgia", sentiment: "positive", daysAgo: 2 },
        { reporter: "Edgar Thompson", outlet: "Gainesville Sun", report: "Jon Sumrall confirmed Florida's starting quarterback will play despite a mid-week shoulder issue that limited Wednesday practice. The Gators held an extensive film session on Georgia's press-coverage tendencies — their receivers coach noted specific route adjustments for this matchup.", team: "florida", sentiment: "neutral", daysAgo: 1 }
      ]
    }
  },
  {
    id: "g11", week: 9,
    date: "2026-10-31", time: "7:30 PM ET",
    homeTeamId: "florida_state", awayTeamId: "clemson",
    venue: "Doak Campbell Stadium, Tallahassee, FL",
    network: "ESPN", isConferenceGame: true, isRivalryGame: true,
    weather: { condition: "Clear", tempF: 72, windMph: 8, humidity: 65, indoors: false },
    bettingLines: { spread: -3.5, moneylineHome: -175, moneylineAway: 148, total: 50.5 },
    xFactors: [
      { title: "Clemson Defensive Identity", description: "Under Dabo Swinney, Clemson defenses consistently outperform offensive limitations. The Tigers ranked 14th nationally in scoring defense last season. Their ability to limit FSU's offense keeps them in games and covers spreads in hostile environments.", impactTeam: "clemson", impactDirection: "positive", severity: 9, category: "defense" },
      { title: "Doak Campbell War Drums", description: "Florida State is famous for their pregame war chant and drums routine. Doak Campbell Stadium creates a unique pre-snap noise environment that has historically caused visiting teams to average 1.6 more false starts than their season average.", impactTeam: "florida_state", impactDirection: "positive", severity: 8, category: "environment" },
      { title: "Dabo Swinney ACC Underdog Record", description: "Swinney is 14-4 ATS when Clemson is an underdog of 3 points or more in conference games. His teams embrace underdog status and consistently outperform expectations against programs with talent edges.", impactTeam: "clemson", impactDirection: "positive", severity: 8, category: "coaching" },
      { title: "ACC Championship Implications", description: "Both teams are competing for ACC title game positioning. Clemson needs this win to maintain their conference title hopes — motivated road teams competing for titles regularly outperform the spread.", impactTeam: "clemson", impactDirection: "positive", severity: 7, category: "motivation" }
    ],
    gamePreview: {
      headline: "ACC Rivalry Night: Clemson +3.5 is the Value at Doak Campbell",
      synopsis: "Florida State and Clemson renew one of the ACC's premier rivalries with FSU as the home favorite. Doak Campbell is an excellent home venue, but Clemson's defensive identity and Dabo Swinney's exceptional record as an underdog make the Tigers the value play with the points. This game will be close regardless of the talent differential.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Florida State has the slight offensive edge with a more complete and experienced attack. Their portal additions have addressed skill position depth. However, Clemson's defense is elite and will limit FSU's big play ability — this will be a low-scoring game decided by field position." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Clemson's defense is the best unit on the field. They held opponents to under 18 PPG in conference play and will keep FSU's offense in check. If Clemson's defense forces two turnovers, they win this game outright." },
        { section: "KEY X-FACTOR", text: "Clemson's defensive identity in hostile environments. Swinney teams are 14-4 ATS when underdogs of 3+ in conference games. Their defensive capability alone keeps the score close enough to cover in virtually any scenario." },
        { section: "COACHING EDGE", text: "Swinney has won ACC championships in rebuilding years before and excels at game-planning for specific opponents. His staff will have a detailed plan to limit FSU's best offensive players." },
        { section: "THE PICK", text: "Clemson +3.5 is the value. This game will be decided by one score, and Clemson's defensive elite-ness keeps them in it. Take the Tigers with the points in a game that goes to the fourth quarter." }
      ],
      thePick: { team: "Clemson", line: "+3.5", confidence: "MEDIUM", unit: 1.5, reasoning: "Clemson elite defense + Swinney 14-4 ATS as underdog + one-score game expected" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -2.5, total: 54.0, note: "Florida State opened as 2.5-point home favorites in this rivalry renewal" },
        { time: "Mid-week", spread: -3.0, total: 53.5, note: "Spread moved to -3 on FSU home advantage money; total slid slightly" },
        { time: "Current (Fri)", spread: -3.0, total: 54.0, note: "Total reversed upward after both QBs listed full practice Friday — sharp over-money confirmed" }
      ],
      publicBetting: { homePct: 56, awayPct: 44, overPct: 55, underPct: 45 },
      beatWriter: [
        { reporter: "Ira Schoffel", outlet: "Warchant", report: "Florida State's home atmosphere preparations are at an all-time high — Doak Campbell Stadium is expected to be at full capacity with an early tailgate crowd. The Seminoles defense held its best practice of the season Thursday against a scout team simulating Clemson's RPO package.", team: "florida_state", sentiment: "positive", daysAgo: 1 },
        { reporter: "David Hood", outlet: "TigerNet", report: "Clemson's quarterback had his sharpest week of practice, completing a reported 14 of 16 in Friday's two-minute drill period. Dabo Swinney indicated the Tigers are treating this as a statement game — the locker room energy reportedly higher than normal heading into Tallahassee.", team: "clemson", sentiment: "positive", daysAgo: 1 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 10 — Nov 7, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g12", week: 10,
    date: "2026-11-07", time: "12:00 PM ET",
    homeTeamId: "ohio_state", awayTeamId: "oregon",
    venue: "Ohio Stadium, Columbus, OH",
    network: "FOX", isConferenceGame: true, isRivalryGame: false,
    weather: { condition: "Overcast", tempF: 45, windMph: 16, humidity: 58, indoors: false },
    bettingLines: { spread: -6, moneylineHome: -270, moneylineAway: 225, total: 52.5 },
    xFactors: [
      { title: "Ohio Stadium Bowl Acoustics", description: "The natural bowl shape of Ohio Stadium creates exceptional crowd noise amplification. Oregon has gone 3-8 ATS in venues with 100,000+ capacity as a road team in the last six seasons.", impactTeam: "ohio_state", impactDirection: "positive", severity: 9, category: "environment" },
      { title: "Ohio State Talent Depth at Every Position", description: "Ohio State has 14 players projected to be taken in the first three rounds of the NFL Draft. Their depth at linebacker and defensive line will wear down Oregon's offensive line over four quarters.", impactTeam: "ohio_state", impactDirection: "positive", severity: 9, category: "recruiting" },
      { title: "November Cold Weather Factor", description: "Oregon is a warm-weather program from Eugene. November in Columbus averages 38-45 degrees with wind. Pacific Coast teams historically perform 8% worse than their season average in below-50-degree road games.", impactTeam: "oregon", impactDirection: "negative", severity: 7, category: "weather" },
      { title: "Ryan Day Home Record", description: "Ryan Day is 38-4 at home at Ohio State. His teams are 71% ATS at Ohio Stadium. He treats home games as recruiting events and uses the atmosphere as a motivational tool for his roster.", impactTeam: "ohio_state", impactDirection: "positive", severity: 8, category: "coaching" }
    ],
    gamePreview: {
      headline: "The Horseshoe Showdown: Ohio State Hosts Oregon for Big Ten Supremacy",
      synopsis: "Ohio State and Oregon meet in Columbus in a game with massive Big Ten Championship implications. Ohio Stadium — The Horseshoe — creates a fortress atmosphere in November conditions that Oregon will find unlike any game they face in the Pacific Northwest. Ohio State is stocked with NFL talent and has home advantage that the line likely undervalues.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Ohio State's offense is the most complete unit in the Big Ten. Their quarterback has the weapons, protection, and system to exploit any defensive alignment. Oregon's defense is solid but will face their toughest challenge of the season against the Buckeyes' multi-dimensional attack." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Ohio State's defense is elite by design. They recruit and develop at a level that keeps NFL talent throughout the defensive system. Oregon's offense will find points difficult to come by consistently — they will score but struggle to sustain drives." },
        { section: "KEY X-FACTOR", text: "November cold at The Horseshoe. Oregon is from Eugene, Oregon — a Pacific climate. Columbus in November averages 45 degrees with wind. Pacific teams historically perform 8% below season average in below-50-degree road games. That factor alone changes the spread." },
        { section: "COACHING EDGE", text: "Ryan Day at home in The Horseshoe is one of the most advantaged coaching situations in college football. His 38-4 home record speaks for itself. He treats home games as showcases for his program." },
        { section: "THE PICK", text: "Ohio State -6 at home is justified. The Buckeyes are superior at every position group, the November cold disadvantages Oregon, and Day does not lose at home to conference opponents. Comfortable win and cover." }
      ],
      thePick: { team: "Ohio State", line: "-6", confidence: "HIGH", unit: 2, reasoning: "Horseshoe home advantage + November cold hurts Oregon + OSU depth dominance" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -7.0, total: 56.5, note: "Ohio State opened as heavy 7-point home favorites in the Horseshoe for a marquee November matchup" },
        { time: "Mid-week", spread: -7.5, total: 56.0, note: "Spread moved to -7.5 on OSU home money; Oregon injury news leaked Wednesday afternoon" },
        { time: "Current (Fri)", spread: -7.0, total: 55.5, note: "Line reverse-moved to -7 as sharp Oregon money arrived — sharp books see value with the points" }
      ],
      publicBetting: { homePct: 64, awayPct: 36, overPct: 57, underPct: 43 },
      beatWriter: [
        { reporter: "Dan Hope", outlet: "Eleven Warriors", report: "Ohio Stadium is expected to be its loudest since the 2024 Michigan game. Ryan Day confirmed a new no-huddle package was installed this week specifically targeting Oregon's defensive substitution tendencies. The Buckeyes' pass rush group looks completely healthy after recent camp concerns.", team: "ohio_state", sentiment: "positive", daysAgo: 1 },
        { reporter: "James Crepea", outlet: "The Oregonian", report: "Oregon's starting wide receiver was limited Thursday with a lower-leg contusion and is listed questionable for Saturday. Dan Lanning held an extended special teams session Friday morning — the Ducks are treating a potential late-season road trip to Columbus with championship-level preparation.", team: "oregon", sentiment: "negative", daysAgo: 1 }
      ]
    }
  },
  {
    id: "g13", week: 10,
    date: "2026-11-07", time: "8:00 PM ET",
    homeTeamId: "lsu", awayTeamId: "alabama",
    venue: "Tiger Stadium, Baton Rouge, LA",
    network: "CBS", isConferenceGame: true, isRivalryGame: true,
    weather: { condition: "Clear", tempF: 68, windMph: 6, humidity: 65, indoors: false },
    bettingLines: { spread: 1.5, moneylineHome: 115, moneylineAway: -135, total: 54.5 },
    xFactors: [
      { title: "Tiger Stadium Night Game Effect", description: "LSU's record in night games at Tiger Stadium is 38-4 over the last decade. The atmosphere literally changes outcomes — visiting teams average 18% more false starts than against LSU in day games, and opposing offenses average 4.2 fewer points than their season PPG.", impactTeam: "lsu", impactDirection: "positive", severity: 10, category: "environment" },
      { title: "Alabama Away-Game November Performance", description: "Alabama is 8-6 ATS in true road games in November over the last four seasons. The emotional and physical toll of the SEC schedule by November affects even the Crimson Tide on the road.", impactTeam: "alabama", impactDirection: "negative", severity: 8, category: "situational" },
      { title: "Kiffin Tiger Stadium Night Game Advantage", description: "Lane Kiffin's coaching background at SEC programs gives him deep familiarity with how to leverage crowd noise as a preparation variable. LSU's staff simulates above-110-decibel noise in Tuesday and Wednesday practices — Alabama's staff has less experience with this specific environment.", impactTeam: "lsu", impactDirection: "positive", severity: 8, category: "coaching" },
      { title: "SEC Championship Game Stakes", description: "The winner of this game has a clear path to the SEC Championship. Both teams arrive with identical or near-identical conference records — the motivation is absolute. In games with these stakes, the home team historically covers 62% of the time.", impactTeam: "lsu", impactDirection: "positive", severity: 8, category: "motivation" }
    ],
    gamePreview: {
      headline: "Death Valley Saturday Night: LSU +1.5 vs Alabama in the Most Electric SEC Game",
      synopsis: "The most anticipated game on the SEC calendar every year. Tiger Stadium at night is the most hostile environment Alabama will face all season, and LSU enters as a 1.5-point home underdog — a number that severely underestimates the home field factor in Baton Rouge. Anyone who has stood inside Tiger Stadium during a night game against Alabama understands why this line should be at least 3.5 points tighter.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Alabama's offense has the edge in pure talent and execution metrics. However, Tiger Stadium's noise levels have historically caused Alabama's offense to average 4.2 fewer points per game than their season average. Communication breakdowns cause pre-snap penalties that turn manageable down-and-distance into difficult situations." },
        { section: "DEFENSIVE BATTLEGROUND", text: "LSU's defensive front four are all NFL Draft candidates. Alabama's offensive line — while excellent — will face their most physical challenge of the season. If LSU can force one or two three-and-outs early, the crowd volume reaches a level that becomes self-sustaining." },
        { section: "KEY X-FACTOR", text: "Tiger Stadium after dark is the single greatest home-field advantage in college football. LSU's 38-4 night game home record over the last decade is not a coincidence — it is evidence that the environment generates measurable performance advantages worth 3-4 points on the scoreboard." },
        { section: "COACHING EDGE", text: "Kiffin's aggressive offensive system and SEC experience give LSU a credible coaching edge in this matchup. He prepares specifically for crowd noise as a performance variable. Alabama's staff is excellent, but Kiffin's offensive mind in this specific environment is a genuine factor." },
        { section: "THE PICK", text: "LSU +1.5 is the pick. The home field advantage in this specific venue on this specific night is worth 3-4 points that the line does not account for. Alabama may win the game, but LSU covers comfortably. Take the Tigers." }
      ],
      thePick: { team: "LSU", line: "+1.5", confidence: "HIGH", unit: 2, reasoning: "Tiger Stadium night game = 3-4 point advantage not priced into 1.5-point line" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -3.5, total: 59.0, note: "LSU opened as 3.5-point home favorites in an anticipated night game showdown in Baton Rouge" },
        { time: "Mid-week", spread: -4.0, total: 59.5, note: "Spread to -4 on LSU night game money; total rose as sharp over-bettors targeted both high-powered offenses" },
        { time: "Current (Fri)", spread: -4.0, total: 59.0, note: "Total pulled back slightly after weather forecast showed possible humidity limiting — spread held" }
      ],
      publicBetting: { homePct: 57, awayPct: 43, overPct: 59, underPct: 41 },
      beatWriter: [
        { reporter: "Pete Thamel", outlet: "ESPN", report: "Death Valley is expected to break the decibel record for a regular-season game Saturday night. Lane Kiffin held a rare joint offensive and defensive practice Thursday with full sound pumped at practice — LSU's veterans looked completely unfazed. Kiffin called the atmosphere 'unlike anything I've experienced anywhere else.'", team: "lsu", sentiment: "positive", daysAgo: 1 },
        { reporter: "Cecil Hurt", outlet: "Tuscaloosa News", report: "DeBoer called LSU's stadium 'the most difficult road environment in America' on Wednesday's presser. Alabama confirmed both starting cornerbacks are healthy but travel party sources note the Tide will deploy a new two-high safety shell specifically to limit LSU's deep-shot passing game.", team: "alabama", sentiment: "neutral", daysAgo: 2 }
      ]
    }
  },
  {
    id: "g14", week: 10,
    date: "2026-11-07", time: "7:30 PM ET",
    homeTeamId: "notre_dame", awayTeamId: "miami",
    venue: "Notre Dame Stadium, Notre Dame, IN",
    network: "NBC", isConferenceGame: false, isRivalryGame: true,
    weather: { condition: "Clear", tempF: 48, windMph: 12, humidity: 55, indoors: false },
    bettingLines: { spread: -7.5, moneylineHome: -350, moneylineAway: 285, total: 51.5 },
    xFactors: [
      { title: "Notre Dame Stadium November Night Game Record", description: "Notre Dame is 24-4 in night games at Notre Dame Stadium over the last decade. The combination of the stadium's intimacy, the campus setting, and the fanbase's intensity creates one of the most unique hostile environments in football.", impactTeam: "notre_dame", impactDirection: "positive", severity: 9, category: "environment" },
      { title: "Miami Road Record at Large Hostile Venues", description: "Miami has gone 2-5 ATS at venues with 80,000+ capacity as a road team. The atmosphere in South Bend in November is as far from Hard Rock Stadium as you can get — the cold, the campus intimacy, and the silence between plays disrupts Miami's rhythm.", impactTeam: "miami", impactDirection: "negative", severity: 8, category: "situational" },
      { title: "Classic Rivalry Renewal", description: "Notre Dame-Miami was college football's defining game in the 1980s. Renewing it at Notre Dame Stadium restores one of the sport's great matchups. Both teams know the national significance — but Notre Dame's players have grown up hearing about this rivalry.", impactTeam: "notre_dame", impactDirection: "positive", severity: 7, category: "motivation" },
      { title: "Notre Dame Defensive Pressure Package", description: "Notre Dame's defensive line has excelled at forcing turnovers from mobile quarterbacks. Miami's signal-caller in pressure situations has historically struggled — the Notre Dame system specifically targets these tendencies.", impactTeam: "notre_dame", impactDirection: "positive", severity: 7, category: "matchup" }
    ],
    gamePreview: {
      headline: "Rivalry Renewed at South Bend: Notre Dame Fortress Holds",
      synopsis: "Notre Dame and Miami renew one of college football's storied rivalries in South Bend. Notre Dame Stadium in November is a completely different environment from Miami's Hard Rock Stadium — cold, intimate, and intensely hostile for visiting teams. Miami has become a legitimate program again, but navigating Notre Dame's home environment is a different test than any ACC game.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Notre Dame has the offensive talent and home field to control this game's tempo. The Irish can impose their physical running game on Miami's defense and make the Hurricanes play from behind — which eliminates Miami's tempo-based explosive-play offense." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Notre Dame's defense is elite and will create challenges for Miami's passing game. The Irish have NFL talent at corner and linebacker that matches up favorably against Miami's receivers. In cold weather at South Bend, Miami's vertical passing game loses effectiveness." },
        { section: "KEY X-FACTOR", text: "Notre Dame Stadium in November cold. The Irish are 24-4 in night games at Notre Dame Stadium. Miami has gone 2-5 ATS at large hostile venues as a road team. The combination of cold weather and crowd intensity is a compound disadvantage for the Hurricanes." },
        { section: "COACHING EDGE", text: "Marcus Freeman delivers at home in big games. His preparation for rivalry games is thorough and his players are emotionally invested in restoring Notre Dame's dominance over Miami. The coaching and motivation edge clearly favors the Irish." },
        { section: "THE PICK", text: "Notre Dame -7.5 is correct. Talent gap, home fortress advantage, Miami's poor road record at hostile venues, and the cold weather all point to a comfortable Irish win. Expect Notre Dame to win by 10-14." }
      ],
      thePick: { team: "Notre Dame", line: "-7.5", confidence: "HIGH", unit: 2, reasoning: "Notre Dame home fortress + Miami 2-5 ATS at hostile venues + cold weather eliminates Miami vertical game" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -6.5, total: 56.5, note: "Notre Dame opened as 6.5-point home favorites under the Golden Dome lights" },
        { time: "Mid-week", spread: -7.0, total: 56.0, note: "Notre Dame home money moved the spread to -7; total eased on defensive preparation reports" },
        { time: "Current (Fri)", spread: -7.0, total: 56.0, note: "Stable line heading into game week — sharp books respect the number as fair" }
      ],
      publicBetting: { homePct: 63, awayPct: 37, overPct: 53, underPct: 47 },
      beatWriter: [
        { reporter: "Matt Fortuna", outlet: "The Athletic", report: "Notre Dame Stadium's sellout energy this week is the highest since the USC rivalry game last year. Freeman held a Friday walkthrough that sources describe as 'locked in' — the Irish defensive staff has been studying Miami's option-route concepts all week.", team: "notre_dame", sentiment: "positive", daysAgo: 1 },
        { reporter: "Shehan Jeyarajah", outlet: "CBS Sports", report: "Mario Cristobal confirmed Miami's offensive line rotation is at full health — no injury concerns heading into South Bend. The Hurricanes practiced indoors Thursday due to travel logistics but film study reports suggest their defensive secondary is specifically prepared for Notre Dame's red-zone passing game.", team: "miami", sentiment: "neutral", daysAgo: 2 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 11 — Nov 14, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g15", week: 11,
    date: "2026-11-14", time: "3:30 PM ET",
    homeTeamId: "lsu", awayTeamId: "texas",
    venue: "Tiger Stadium, Baton Rouge, LA",
    network: "ESPN", isConferenceGame: true, isRivalryGame: false,
    weather: { condition: "Partly Cloudy", tempF: 62, windMph: 9, humidity: 60, indoors: false },
    bettingLines: { spread: -4, moneylineHome: -190, moneylineAway: 162, total: 57.5 },
    xFactors: [
      { title: "Classic LSU Letdown Spot", description: "LSU is 4-9 ATS in the game immediately following their Alabama rivalry game over the last decade. The emotional and physical toll of the Death Valley night game creates a measurable performance hangover that analytics consistently identify.", impactTeam: "lsu", impactDirection: "negative", severity: 9, category: "situational" },
      { title: "Texas Fresh Week Advantage", description: "Texas arrives specifically prepared for LSU after a full week of rest. Sarkisian's staff will have detailed preparation specifically targeting LSU's tendencies, and his players will be physically fresh compared to LSU's battle-worn roster.", impactTeam: "texas", impactDirection: "positive", severity: 8, category: "situational" },
      { title: "LSU Home Field Partial Offset", description: "Tiger Stadium remains a significant advantage. Even with the letdown factor, LSU at home in November is formidable. The crowd will be motivated by playoff positioning, partially counteracting the emotional hangover.", impactTeam: "lsu", impactDirection: "positive", severity: 7, category: "environment" },
      { title: "Texas Speed at Receiver Creates Mismatch", description: "Texas has recruited elite speed at wide receiver that creates problems for LSU's man-coverage scheme. In a game where LSU's defense is physically depleted from the Alabama game, those speed mismatches will be exploited.", impactTeam: "texas", impactDirection: "positive", severity: 7, category: "matchup" }
    ],
    gamePreview: {
      headline: "Classic Letdown Spot: Texas +4 After LSU's Alabama Hangover",
      synopsis: "Seven days after what may be the most emotionally draining game of LSU's season comes the classic letdown trap. Texas arrives fresh, specifically prepared, and motivated — while LSU is physically and emotionally recovering from the Death Valley Night war against Alabama. The data on this specific letdown spot for LSU programs is compelling.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Texas has the offensive edge this week because they are fresh and specifically prepared. The Longhorns have a week of clean preparation while LSU will be physically and emotionally recovering from the Alabama battle. Texas's speed advantage at the skill positions will be magnified against a tired LSU defense." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Texas's defense is fresh and prepared with a full week of film study on LSU's offensive tendencies. LSU's offense must generate points without the emotional fuel of a rivalry game — and that is harder than it sounds for a team that peaked seven days ago." },
        { section: "KEY X-FACTOR", text: "The LSU letdown data. LSU is 4-9 ATS in the game after Alabama over the last decade. The pattern is not coincidental — it is a documented, measurable effect of emotional expenditure in the rivalry game. This situation checks every letdown box." },
        { section: "COACHING EDGE", text: "Sarkisian has specifically prepared his staff for this game knowing LSU would be spent after Alabama. His game plan will attack LSU's fatigue systematically. Kiffin is excellent but faces the classic challenge of managing a depleted roster one week after an emotional rivalry game." },
        { section: "THE PICK", text: "Texas +4 is the clear value pick. The letdown factor alone is worth 3-4 points, Texas is the better rested team, and Sarkisian has had a full week to prepare for a tired LSU defense. Take the Longhorns with the points." }
      ],
      thePick: { team: "Texas", line: "+4", confidence: "HIGH", unit: 2, reasoning: "Classic letdown spot — LSU 4-9 ATS post-Alabama + Texas full week fresh prep + speed mismatch" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -2.5, total: 61.0, note: "LSU opened as slight 2.5-point home favorites in this premier SEC offensive showcase" },
        { time: "Mid-week", spread: -3.0, total: 61.5, note: "Line moved to -3 as LSU home money arrived; total pushed up on reputation of both offenses" },
        { time: "Current (Fri)", spread: -3.0, total: 61.0, note: "Total pulled back slightly — sharp under-money noted on Friday after injury report" }
      ],
      publicBetting: { homePct: 53, awayPct: 47, overPct: 64, underPct: 36 },
      beatWriter: [
        { reporter: "Pete Thamel", outlet: "ESPN", report: "LSU's wide receiver corps looked exceptional in Thursday's practice — Lane Kiffin confirmed two freshmen WRs are firmly in the two-deep and delivering on their recruiting profiles. The Tigers' preparation this week has centered on stopping Texas's quick-passing game before the Longhorns get into rhythm.", team: "lsu", sentiment: "positive", daysAgo: 1 },
        { reporter: "Brian Davis", outlet: "Austin American-Statesman", report: "Texas's offensive coordinator held an extra session Thursday installing new motion concepts specifically for LSU's defensive alignment tendencies. Sarkisian confirmed the team is healthy and the Longhorns are treating the Baton Rouge trip as a legitimate championship audition.", team: "texas", sentiment: "positive", daysAgo: 2 }
      ]
    }
  },
  {
    id: "g16", week: 11,
    date: "2026-11-14", time: "3:30 PM ET",
    homeTeamId: "oregon", awayTeamId: "michigan",
    venue: "Autzen Stadium, Eugene, OR",
    network: "FOX", isConferenceGame: true, isRivalryGame: false,
    weather: { condition: "Overcast", tempF: 48, windMph: 13, humidity: 72, indoors: false },
    bettingLines: { spread: -7, moneylineHome: -310, moneylineAway: 255, total: 48.5 },
    xFactors: [
      { title: "Autzen Stadium Decibel Record", description: "Autzen Stadium consistently records some of the highest measured crowd noise levels in college football despite holding only 54,000 fans. Its intimate design and enclosed shape create a concentrated wall of sound. Oregon is 31-7 against ranked opponents at Autzen.", impactTeam: "oregon", impactDirection: "positive", severity: 9, category: "environment" },
      { title: "Oregon Speed Creates Mismatch vs Michigan Secondary", description: "Oregon has recruited elite speed at the wide receiver position — players who can outrun Michigan's corners on the outside. In a home environment where crowd noise limits Michigan's communication, these speed mismatches become game-changing.", impactTeam: "oregon", impactDirection: "positive", severity: 8, category: "matchup" },
      { title: "Michigan Big Ten West Coast Road Record", description: "Michigan has historically struggled at Pacific Coast road games, going 4-8 ATS in road games west of the Mississippi River over the last six seasons. The travel, time zone, and different crowd environment contribute.", impactTeam: "michigan", impactDirection: "negative", severity: 7, category: "situational" },
      { title: "Dan Lanning Home Game Preparation", description: "Lanning treats home games as opportunities to establish dominance. His teams are 18-4 at Autzen since he took over and he uses the crowd as a strategic asset in his game planning.", impactTeam: "oregon", impactDirection: "positive", severity: 7, category: "coaching" }
    ],
    gamePreview: {
      headline: "Autzen Advantage: Oregon Hosts Michigan in the Most Underrated Home-Field Edge in the Big Ten",
      synopsis: "Autzen Stadium in Eugene is one of the most underappreciated home-field advantages in all of college football. Oregon hosts Michigan in a game with massive Big Ten Championship implications, and the Ducks will be motivated by the memory of playing in The Big House. Oregon has the offensive creativity and home-field advantage to cover comfortably.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Oregon's offense is uniquely designed to stress defenses horizontally and vertically with elite speed. The Ducks run up-tempo concepts that generate favorable down-and-distance situations. Michigan's defense is physical and disciplined but struggles to cover Oregon's receivers in man coverage." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Michigan's defense is physical and experienced. However, Oregon's receiver speed will create problems — the Ducks can outrun Michigan's secondary in the open field. Michigan must limit explosive plays and force Oregon into third-and-long situations." },
        { section: "KEY X-FACTOR", text: "Autzen Stadium's crowd noise. Despite holding only 54,000 fans, the stadium's design concentrates sound in a way that creates crowd noise comparable to stadiums twice its size. Oregon is 31-7 against ranked opponents here — a home advantage that is consistently undervalued." },
        { section: "COACHING EDGE", text: "Dan Lanning has Oregon operating at peak efficiency. His game-planning for Michigan will specifically target their secondary's man-coverage tendencies. Michigan's coaching staff must scheme differently as a road team in this specific environment." },
        { section: "THE PICK", text: "Oregon -7 at home is the correct number. The Ducks are the better team at home with superior speed and a home-field advantage worth 3-4 points. Expect Oregon to control the game from the second quarter onward." }
      ],
      thePick: { team: "Oregon", line: "-7", confidence: "HIGH", unit: 2, reasoning: "Autzen home advantage + Oregon receiver speed mismatches + Michigan 4-8 ATS on West Coast road games" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -7.0, total: 52.5, note: "Oregon opened as 7-point home favorites as Michigan arrives with a rebuilding offensive line" },
        { time: "Mid-week", spread: -7.5, total: 52.0, note: "Spread moved to -7.5 on Oregon home volume; total dropped on Michigan's running game struggles" },
        { time: "Current (Fri)", spread: -7.0, total: 52.0, note: "Reverse line movement back to -7 — sharp Michigan money worth noting as contrarian signal" }
      ],
      publicBetting: { homePct: 67, awayPct: 33, overPct: 48, underPct: 52 },
      beatWriter: [
        { reporter: "James Crepea", outlet: "The Oregonian", report: "Autzen Stadium is sold out and the Duck Walk preparation this week has extra electricity after last year's Big Ten title run. Dan Lanning confirmed Oregon's entire starting lineup is healthy and the Ducks are treating this Michigan game as a statement for New York Six consideration.", team: "oregon", sentiment: "positive", daysAgo: 1 },
        { reporter: "Austin Meek", outlet: "The Athletic", report: "Michigan's offensive staff is installing new run-blocking concepts specifically for Oregon's 3-3-5 defensive alignment — a scheme Michigan has limited experience facing. Kyle Whittingham confirmed no injury issues but noted the long road trip to Eugene adds preparation complexity for a Wolverines team still learning his system.", team: "michigan", sentiment: "negative", daysAgo: 2 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 11 — Nov 19, 2026 (Thursday Night)
     ═══════════════════════════════════════════════════ */
  {
    id: "g17", week: 11,
    date: "2026-11-19", time: "8:00 PM ET",
    homeTeamId: "tennessee", awayTeamId: "lsu",
    venue: "Neyland Stadium, Knoxville, TN",
    network: "ESPN", isConferenceGame: true, isRivalryGame: false,
    weather: { condition: "Clear", tempF: 52, windMph: 7, humidity: 48, indoors: false },
    bettingLines: { spread: -3, moneylineHome: -155, moneylineAway: 130, total: 53.5 },
    xFactors: [
      { title: "Thursday Night Neyland After Dark", description: "Tennessee at home on a Thursday night is uniquely electric. Neyland Stadium produces the same crowd intensity as a Saturday game with the added energy of a rare weeknight spectacle. LSU has gone 3-5 ATS on Thursday night games over the last four seasons.", impactTeam: "tennessee", impactDirection: "positive", severity: 9, category: "environment" },
      { title: "Heupel Tempo Advantage on Short Prep Week", description: "In a Thursday night game, both teams have reduced preparation time — but Heupel's tempo system actually becomes MORE of an advantage. Opponents cannot simulate a full week of high-tempo preparation in three days, while Tennessee runs their system every practice day.", impactTeam: "tennessee", impactDirection: "positive", severity: 9, category: "scheme" },
      { title: "LSU November Road Fatigue", description: "LSU arrives having played Alabama and Texas in back-to-back weeks. The physical toll of those games compounds into November fatigue. Playing a Thursday road game with reduced prep time compounds the disadvantage.", impactTeam: "lsu", impactDirection: "negative", severity: 8, category: "situational" },
      { title: "SEC Late-Season Stakes", description: "Both teams need this game for playoff positioning. Tennessee at home motivated and with playoff implications is the ideal combination for the home team — their crowd elevates to maximum intensity when the stakes are explicit.", impactTeam: "tennessee", impactDirection: "positive", severity: 7, category: "motivation" }
    ],
    gamePreview: {
      headline: "Thursday Night Thunder at Neyland: Tennessee -3 in Prime Time",
      synopsis: "Thursday Night college football at Neyland Stadium is one of the sport's unique experiences. Tennessee hosts an LSU team that has just played Alabama and Texas in consecutive weeks — arriving physically depleted for a road Thursday game with reduced preparation time. Heupel's tempo system thrives in exactly this scenario.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Tennessee's high-tempo offense is uniquely difficult to defend on short preparation weeks. In a Thursday game, LSU's defense has three days of preparation — not seven. Heupel's system generates play-call variety that requires a full week to account for." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Tennessee's defense is physical and motivated for this prime-time home game. LSU's offense has been outstanding this season, but will face a Neyland crowd that generates pre-snap noise disrupting communication from the first series." },
        { section: "KEY X-FACTOR", text: "Short week preparation favors Tennessee. Both teams have reduced prep time for a Thursday game, but Tennessee's up-tempo system is a built-in disadvantage for the opponent — the less preparation time available, the more Oregon's scheme advantage grows." },
        { section: "COACHING EDGE", text: "Heupel's system is a built-in advantage that intensifies on short weeks. LSU has been 3-5 ATS in Thursday night games over the last four seasons. The Thursday format specifically disadvantages preparation-intensive defensive systems." },
        { section: "THE PICK", text: "Tennessee -3 at home is the pick. Neyland home advantage, Heupel tempo increasing value on short prep week, and LSU arriving physically spent after Alabama and Texas. Vols cover in a game that stays close through the fourth quarter." }
      ],
      thePick: { team: "Tennessee", line: "-3", confidence: "HIGH", unit: 2, reasoning: "Neyland Thursday advantage + Heupel tempo thrives on short prep weeks + LSU post-Alabama-Texas fatigue" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -3.5, total: 57.5, note: "Tennessee opened as 3.5-point home favorites in a Thursday night SEC showcase at Neyland" },
        { time: "Mid-week", spread: -4.0, total: 57.0, note: "Local Vol money pushed to -4; total edged down on short-week preparation concerns" },
        { time: "Current (Fri)", spread: -4.0, total: 57.5, note: "Total reversed upward on Friday — sharp over-money confirmed for primetime Thursday showdown" }
      ],
      publicBetting: { homePct: 57, awayPct: 43, overPct: 60, underPct: 40 },
      beatWriter: [
        { reporter: "John Brice", outlet: "Vol Report", report: "Neyland under the lights on a Thursday night is the most underrated atmosphere in the SEC. Heupel confirmed this week's short-week preparation is no concern — Tennessee does it every year and the routine is perfected. The defensive staff specifically designed a new 3-down look for LSU's perimeter passing game.", team: "tennessee", sentiment: "positive", daysAgo: 1 },
        { reporter: "Pete Thamel", outlet: "ESPN", report: "LSU faces a short week after a physical Saturday game and Lane Kiffin acknowledged the recovery challenge. The Tigers arrived in Knoxville by charter Friday evening and held a brief walkthrough. Kiffin confirmed his starting QB is healthy but declined to detail the overall injury report ahead of the Thursday game.", team: "lsu", sentiment: "negative", daysAgo: 1 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     WEEK 13 — Nov 28, 2026 (Rivalry Saturday)
     ═══════════════════════════════════════════════════ */
  {
    id: "g18", week: 13,
    date: "2026-11-28", time: "12:00 PM ET",
    homeTeamId: "ohio_state", awayTeamId: "michigan",
    venue: "Ohio Stadium, Columbus, OH",
    network: "FOX", isConferenceGame: true, isRivalryGame: true,
    weather: { condition: "Overcast", tempF: 36, windMph: 18, humidity: 55, indoors: false },
    bettingLines: { spread: -8.5, moneylineHome: -400, moneylineAway: 320, total: 44.5 },
    xFactors: [
      { title: "Ohio State Home Record in The Game", description: "Ohio State is 18-6 ATS at home against Michigan over the last 24 years. In Columbus, The Game has an Ohio State home-field advantage that translates directly into covering spreads. Ryan Day is specifically motivated to dominate this rivalry.", impactTeam: "ohio_state", impactDirection: "positive", severity: 10, category: "situational" },
      { title: "Ryan Day Game Week Preparation", description: "Day dedicates an entire segment of spring practice to preparing for Michigan week. His preparation is year-round, specifically targeting Michigan's tendencies and installing packages that are never used until this game.", impactTeam: "ohio_state", impactDirection: "positive", severity: 9, category: "coaching" },
      { title: "Ohio State Roster Depth Overwhelming", description: "Ohio State's roster depth at every position group is measurably superior. By the fourth quarter of this game in cold weather, Ohio State's depth rotation creates a performance gap that shows up on the scoreboard.", impactTeam: "ohio_state", impactDirection: "positive", severity: 9, category: "recruiting" },
      { title: "Michigan Motivation Despite Talent Gap", description: "Michigan understands the significance. Their team will be emotionally motivated and physically prepared — this is not a game the Wolverines sleepwalk through, regardless of the talent differential.", impactTeam: "michigan", impactDirection: "positive", severity: 7, category: "motivation" }
    ],
    gamePreview: {
      headline: "THE GAME: Ohio State vs Michigan — The Greatest Rivalry in College Football",
      synopsis: "The greatest rivalry in American sports. Ohio State hosts Michigan in Columbus in what is the defining game of the Big Ten season and a top-five event in all of sports annually. This year, Ohio State enters as an 8.5-point home favorite with their overwhelming roster talent. Michigan must win The Game to validate their season — but the talent gap is real and the home advantage is substantial.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Ohio State's offense is significantly superior. The Buckeyes have NFL-ready talent at quarterback, wide receiver, and along the offensive line — Michigan's defense will be overwhelmed by the volume of weapons and the precision of Ohio State's execution." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Ohio State's defense has been dominant and presents Michigan's offense with a genuine challenge. Michigan's run game must establish itself early — if they fall behind and become one-dimensional, Ohio State's pass rush becomes unblockable." },
        { section: "KEY X-FACTOR", text: "Ohio State's home record in The Game. The Buckeyes are 18-6 ATS at home against Michigan over the last 24 years — a 75% cover rate in Columbus. This is not a coincidence. The home advantage in this specific rivalry is one of the most documented edges in college football." },
        { section: "COACHING EDGE", text: "Day has dedicated a segment of every spring practice to this game. His preparation is meticulous and year-round. Michigan's staff is excellent, but cannot match the institutional investment Ohio State makes for Michigan week specifically." },
        { section: "THE PICK", text: "Ohio State -8.5 at home is fully justified. The talent gap is real, the home advantage is substantial, and Ohio State's motivation to dominate this rivalry is embedded in the program's DNA. Expect a decisive Ohio State win." }
      ],
      thePick: { team: "Ohio State", line: "-8.5", confidence: "HIGH", unit: 2, reasoning: "Buckeyes 18-6 ATS at home vs Michigan + roster depth overwhelming + Day's year-round preparation" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -7.0, total: 55.5, note: "Ohio State opened as 7-point favorites at home in THE GAME — the biggest regular-season matchup in college football" },
        { time: "Mid-week", spread: -7.5, total: 55.0, note: "Spread moved to -7.5 on OSU home volume; under-money pushed the total down" },
        { time: "Current (Fri)", spread: -7.0, total: 54.5, note: "Line trimmed back to -7 as sharp Michigan money arrived Friday — double-digit ticket split toward OSU but sharp money on Michigan" }
      ],
      publicBetting: { homePct: 68, awayPct: 32, overPct: 52, underPct: 48 },
      beatWriter: [
        { reporter: "Dan Hope", outlet: "Eleven Warriors", report: "Ryan Day has been preparing for THE GAME since the first week of September. Ohio Stadium will host the loudest home crowd since 2019 — media access was restricted Thursday as Day implemented final game-plan installations. Sources inside the program say the Buckeyes are operating at the highest focus level of the season.", team: "ohio_state", sentiment: "positive", daysAgo: 1 },
        { reporter: "Austin Meek", outlet: "The Athletic", report: "Kyle Whittingham delivered a fiery team address Thursday night — Michigan's locker room motivation to prove itself in Year 1 under Whittingham against Ohio State is significant. The Wolverines confirm full health on their defensive two-deep and installed two new wrinkles specifically for Ohio State's interior RPO packages.", team: "michigan", sentiment: "positive", daysAgo: 1 }
      ]
    }
  },
  {
    id: "g19", week: 13,
    date: "2026-11-28", time: "3:30 PM ET",
    homeTeamId: "alabama", awayTeamId: "auburn",
    venue: "Bryant-Denny Stadium, Tuscaloosa, AL",
    network: "CBS", isConferenceGame: true, isRivalryGame: true,
    weather: { condition: "Partly Cloudy", tempF: 55, windMph: 10, humidity: 52, indoors: false },
    bettingLines: { spread: -16, moneylineHome: -900, moneylineAway: 640, total: 52.5 },
    xFactors: [
      { title: "Iron Bowl Underdog Cover History", description: "Auburn has covered the spread as a double-digit underdog in the Iron Bowl in 6 of the last 9 games. The rivalry factor systematically reduces the effective spread — 16 points is simply too many in any game called the Iron Bowl.", impactTeam: "auburn", impactDirection: "positive", severity: 9, category: "situational" },
      { title: "Alex Golesh Iron Bowl Debut Motivation", description: "Golesh is coaching his first Iron Bowl and will use the Alabama rivalry as a defining moment for his Auburn tenure. First-year coaches often get maximum emotional performance from their rosters in rivalry games — the players elevate to reward their new coach. An Auburn team playing with nothing to lose is dangerous against a large spread.", impactTeam: "auburn", impactDirection: "positive", severity: 8, category: "coaching" },
      { title: "Alabama Talent Advantage Is Decisive", description: "Alabama's roster depth at every position is 15-20 percent superior by recruiting composite rankings. The Tide have been preparing for this game all season and will execute at an elite level.", impactTeam: "alabama", impactDirection: "positive", severity: 8, category: "recruiting" },
      { title: "16-Point Rival Spread History", description: "In all major college football rivalries (Alabama-Auburn, Ohio State-Michigan, Georgia-Florida, etc.), the underdog covers 58% of the time when the spread reaches double digits. The rivalry factor is quantifiable and consistent.", impactTeam: "auburn", impactDirection: "positive", severity: 8, category: "situational" }
    ],
    gamePreview: {
      headline: "Iron Bowl: The State of Alabama Is at Stake — Auburn +16 Is the Only Bet",
      synopsis: "The Iron Bowl is not a football game — it is a state-defining cultural event that transcends sports. Alabama hosts Auburn as a 16-point home favorite, and while Alabama will almost certainly win, covering 16 points against Auburn is a different proposition entirely. The Iron Bowl has produced more upset covers than any rivalry in college football, and 16 points invites the upset narrative.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Alabama's offense is dramatically superior in every measurable category. However, in the Iron Bowl, both teams play with a level of emotional intensity that narrows effective talent gaps. Alabama will score — the question is whether they can get the meaningless fourth-quarter touchdown that covers this large spread." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Alabama's defense will dominate Auburn's offense in the first three quarters. Auburn's defense, which has been average all season, will bend but make enough stops to keep the score within the spread until the game's final minutes." },
        { section: "KEY X-FACTOR", text: "Auburn's underdog cover history in this specific rivalry. The Tigers have covered as a double-digit underdog in 6 of the last 9 Iron Bowl games. The rivalry emotion, the state pride, and the fact that Golesh is coaching his first Iron Bowl with maximum motivation are worth 7-10 points against the spread historically." },
        { section: "COACHING EDGE", text: "Alabama has the coaching advantage in raw experience, but Golesh comes in motivated to establish his Auburn program with a statement. His South Florida teams were aggressive and never quit — expect Auburn to play their most complete game of the season in this spot." },
        { section: "THE PICK", text: "Auburn +16 is the only bet. No matter how good Alabama is, 16 points in the Iron Bowl is too many. Auburn will compete emotionally through three quarters and keep this within two scores. Take the points." }
      ],
      thePick: { team: "Auburn", line: "+16", confidence: "MEDIUM", unit: 1.5, reasoning: "Iron Bowl underdog cover history 6-of-9 + 16 points too many in any rivalry game + Golesh debut motivation" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -10.5, total: 54.5, note: "Alabama opened as double-digit home favorites in the Iron Bowl — Auburn limping in with three losses" },
        { time: "Mid-week", spread: -11.0, total: 54.0, note: "Spread grew to -11 on Alabama ticket dominance; total ticked down on defensive rivalry expectations" },
        { time: "Current (Fri)", spread: -10.5, total: 54.0, note: "Reverse line movement to -10.5 — sharp Auburn money noted; Iron Bowl routinely defies the spread" }
      ],
      publicBetting: { homePct: 74, awayPct: 26, overPct: 50, underPct: 50 },
      beatWriter: [
        { reporter: "Cecil Hurt", outlet: "Tuscaloosa News", report: "Alabama practiced with unusual emotion this week — the rivalry factor is real regardless of records. DeBoer held a Friday walkthrough that sources called 'dialed in' with zero complacency allowed. The Tide's two-deep is at full health heading into the Iron Bowl.", team: "alabama", sentiment: "positive", daysAgo: 1 },
        { reporter: "Josh Bean", outlet: "AL.com", report: "Alex Golesh rallied Auburn with an extended team meeting Thursday, reportedly invoking past Iron Bowl upsets including the Kick Six and the 2010 national championship run. The Tigers arrive in Tuscaloosa as heavy underdogs but confirmed their starting quarterback is healthy and the team's attitude in practice has been feisty all week.", team: "auburn", sentiment: "positive", daysAgo: 2 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     SEC CHAMPIONSHIP — Dec 5, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g20", week: 15,
    date: "2026-12-05", time: "4:00 PM ET",
    homeTeamId: "georgia", awayTeamId: "alabama",
    venue: "Mercedes-Benz Stadium, Atlanta, GA",
    network: "ABC", isConferenceGame: true, isRivalryGame: true,
    weather: { condition: "Clear", tempF: 58, windMph: 5, humidity: 48, indoors: true },
    bettingLines: { spread: -3, moneylineHome: -155, moneylineAway: 130, total: 54.5 },
    xFactors: [
      { title: "Kirby Smart Championship Game Coaching", description: "Smart is 8-2 in conference championship games and has never lost consecutive conference championships. His teams are consistently better in December than in October — the physical and mental preparation intensifies over the season.", impactTeam: "georgia", impactDirection: "positive", severity: 9, category: "coaching" },
      { title: "Georgia Defense Peaks in December", description: "Georgia's defense has historically played their best football in championship games. Smart's defensive staff makes December adjustments that specifically target opponents' best offensive players. The Bulldogs held championship game opponents to under 21 PPG in 6 of their last 8 championship appearances.", impactTeam: "georgia", impactDirection: "positive", severity: 9, category: "defense" },
      { title: "Alabama Rematch Adjustment Danger", description: "Alabama will arrive with a significantly different game plan than the October regular season. Kalen DeBoer's staff will have studied the first game exhaustively — expect Alabama to attack Georgia's secondary differently than any previous game this season.", impactTeam: "alabama", impactDirection: "positive", severity: 8, category: "coaching" },
      { title: "Indoor Stadium Eliminates Weather Variables", description: "Mercedes-Benz Stadium's retractable roof eliminates all weather variables. Georgia's passing game, which can be slowed by wind and cold, performs at full efficiency indoors. This is the most favorable environment for Georgia's offensive system.", impactTeam: "georgia", impactDirection: "positive", severity: 7, category: "weather" }
    ],
    gamePreview: {
      headline: "SEC Championship: Kirby Smart's December Machine vs Alabama",
      synopsis: "The SEC Championship Game in Atlanta is a rematch of the October classic. Both teams arrive with updated game plans designed specifically to counter the other's adjustments. This is the game that defines SEC supremacy and determines the College Football Playoff seeding. Georgia enters as a slight favorite, and Kirby Smart's December coaching record suggests that edge is real.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Both offenses are elite and will arrive with rematch-specific game plans. The edge goes slightly to Georgia based on how their offensive line has developed since October. Smart's teams are always better in December than October — his off-season conditioning and November preparation show up in championship games." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Georgia's defense is the best unit in college football. They have NFL-ready talent at every level and have been building toward this moment all season. Smart's staff will have December-specific adjustments targeting Alabama's offensive tendencies." },
        { section: "KEY X-FACTOR", text: "Kirby Smart's December coaching. He is 8-2 in conference championships and specifically builds Georgia's physical peak to arrive at the championship game. His teams have held championship game opponents to under 21 PPG in 6 of 8 appearances." },
        { section: "COACHING EDGE", text: "Smart in a championship setting is elite. His preparation, adjustments, and physical conditioning program all peak for this game. DeBoer is excellent and will bring a specific counter-plan — but Smart has more championship game experience and a better track record." },
        { section: "THE PICK", text: "Georgia -3 is the lean. Smart's coaching edge in championship settings plus Georgia's defensive elite performance in December gives the Bulldogs the slight edge. Expect a close, physical game that Georgia wins by a field goal to a touchdown." }
      ],
      thePick: { team: "Georgia", line: "-3", confidence: "MEDIUM", unit: 1.5, reasoning: "Smart 8-2 in conference championships + Georgia defense peaks in December + indoor venue eliminates weather" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -3.0, total: 48.5, note: "Georgia opened as 3-point favorites in the SEC Championship in Atlanta's indoor dome" },
        { time: "Mid-week", spread: -3.5, total: 48.0, note: "Spread grew to -3.5 on Georgia ticket volume; total dropped as sharp under-money targeted the defensive showcase" },
        { time: "Current (Fri)", spread: -3.0, total: 47.5, note: "Reverse line movement back to -3 as Alabama sharp money confirmed Friday; total continued under trend" }
      ],
      publicBetting: { homePct: 54, awayPct: 46, overPct: 43, underPct: 57 },
      beatWriter: [
        { reporter: "Seth Emerson", outlet: "The Athletic", report: "Georgia arrived in Atlanta Thursday for early preparation — Kirby Smart runs the most meticulous championship-week program in college football. Smart confirmed full health across both lines and indicated the Bulldogs have prepared two new defensive fronts not previously used this season.", team: "georgia", sentiment: "positive", daysAgo: 1 },
        { reporter: "Cecil Hurt", outlet: "Tuscaloosa News", report: "Alabama is treating this SEC Championship as the first step in a national title run. DeBoer held Alabama's most intense week of practice since early September with full-contact periods Tuesday and Wednesday. The Tide's offensive coordinator confirmed a new play-action package specifically designed to attack Georgia's Cover 2 shell.", team: "alabama", sentiment: "positive", daysAgo: 2 }
      ]
    }
  },
  /* ═══════════════════════════════════════════════════
     BIG TEN CHAMPIONSHIP — Dec 5, 2026
     ═══════════════════════════════════════════════════ */
  {
    id: "g21", week: 15,
    date: "2026-12-05", time: "8:00 PM ET",
    homeTeamId: "ohio_state", awayTeamId: "oregon",
    venue: "Lucas Oil Stadium, Indianapolis, IN",
    network: "FOX", isConferenceGame: true, isRivalryGame: false,
    weather: { condition: "Clear", tempF: 42, windMph: 4, humidity: 45, indoors: true },
    bettingLines: { spread: -4.5, moneylineHome: -210, moneylineAway: 178, total: 53.5 },
    xFactors: [
      { title: "Ryan Day Rematch Record", description: "Day is 7-1 ATS in rematches within the same season. His offensive staff is among the best in college football at exploiting tendencies already studied. Oregon's defensive coordinators must account for an entirely different game plan.", impactTeam: "ohio_state", impactDirection: "positive", severity: 9, category: "coaching" },
      { title: "Ohio State Championship Game Experience", description: "Ohio State has appeared in 6 Big Ten Championship Games in the last eight years. Their players know the format, the environment, and the mental preparation required. Oregon is appearing in a Big Ten title game for just the second time.", impactTeam: "ohio_state", impactDirection: "positive", severity: 8, category: "situational" },
      { title: "Oregon Motivated by Regular Season Loss", description: "Oregon lost to Ohio State at The Horseshoe in November. The rematch motivation is significant — Dan Lanning will have had two additional weeks to prepare specifically for Ohio State's offensive tendencies.", impactTeam: "oregon", impactDirection: "positive", severity: 7, category: "motivation" },
      { title: "Indoor Stadium at Neutral Site", description: "Lucas Oil Stadium eliminates all home-field advantage factors and weather variables. Ohio State's indoor performance has been elite, and the neutral site removes Tiger Stadium-style crowd advantages that Oregon cannot replicate.", impactTeam: "ohio_state", impactDirection: "positive", severity: 7, category: "environment" }
    ],
    gamePreview: {
      headline: "Big Ten Championship: Ohio State Completes the Mission in Indianapolis",
      synopsis: "Ohio State and Oregon meet in Indianapolis for the Big Ten Championship in a rematch of their November regular season game. Ohio State seeks to validate their status as the conference's dominant program while Oregon looks to prove their November performance was a fluke. Day has a 7-1 ATS record in same-season rematches — this number matters.",
      analysis: [
        { section: "OFFENSIVE EDGE", text: "Ohio State's offense is the most talented in the Big Ten and will arrive with a specifically revised game plan. Day's offensive staff will have studied two additional weeks of Oregon's defensive tendencies to install new concepts. Expect Ohio State to attack Oregon's secondary with packages never used in the regular season game." },
        { section: "DEFENSIVE BATTLEGROUND", text: "Ohio State's defense will be even more prepared for Oregon in the rematch. The Ducks will face a defense that has had two additional weeks to study their personnel tendencies and specific route combinations. Oregon must execute flawlessly." },
        { section: "KEY X-FACTOR", text: "Day's 7-1 ATS rematch record. This is the single most compelling data point in the game. His offensive staff is elite at finding and exploiting tendencies they have already studied — Oregon's defensive coordinators must essentially build a new defense for this game." },
        { section: "COACHING EDGE", text: "Day in a Big Ten Championship is motivated and precise. His program has been to this game six times in eight years. The process of preparing for this specific environment is institutionalized at Ohio State. Lanning is excellent but this is Ohio State's territory." },
        { section: "THE PICK", text: "Ohio State -4.5 is the value play. The Buckeyes are the better team with the rematch preparation advantage, the championship game experience, and the roster depth to pull away in the second half." }
      ],
      thePick: { team: "Ohio State", line: "-4.5", confidence: "MEDIUM", unit: 1.5, reasoning: "Day 7-1 ATS in same-season rematches + championship game experience + OSU roster depth" }
    },
    socialIntel: {
      lineMovement: [
        { time: "Open (Mon)", spread: -4.5, total: 53.5, note: "Ohio State opened as 4.5-point favorites in the Big Ten Championship rematch in Indianapolis" },
        { time: "Mid-week", spread: -5.0, total: 53.0, note: "Spread moved to -5 on OSU championship experience premium; total dipped on sharp under-bettors" },
        { time: "Current (Fri)", spread: -4.5, total: 52.5, note: "Reverse line movement to -4.5 as sharp Oregon money arrived — rematch motivation pricing in" }
      ],
      publicBetting: { homePct: 61, awayPct: 39, overPct: 50, underPct: 50 },
      beatWriter: [
        { reporter: "Dan Hope", outlet: "Eleven Warriors", report: "Ryan Day held Ohio State's most secretive practice week of the season — media access was completely blocked Thursday and Friday. Sources inside the program indicate Day installed an entirely new offensive package never deployed against Oregon in the regular season game. The Buckeyes' focus level is described as 'championship-caliber' all week.", team: "ohio_state", sentiment: "positive", daysAgo: 1 },
        { reporter: "James Crepea", outlet: "The Oregonian", report: "Dan Lanning delivered an emotional address to the team Wednesday evening specifically addressing the November loss to Ohio State. Oregon practiced with an edge not seen since the regular season game at Columbus — Lanning confirmed the Ducks installed significant new defensive concepts to counter Day's rematch adjustments.", team: "oregon", sentiment: "positive", daysAgo: 2 }
      ]
    }
  }
];

const MODEL_RECORD = {
  straightUp: { wins: 87, losses: 38, pct: 0.696 },
  atsRecord:  { wins: 71, losses: 54, pct: 0.568 },
  totalRecord:{ wins: 68, losses: 57, pct: 0.544 },
  roi: 11.4,
  byConference: {
    SEC:       { wins: 22, losses: 9, pct: 0.710 },
    "Big Ten": { wins: 19, losses: 8, pct: 0.703 },
    ACC:       { wins: 16, losses: 11, pct: 0.593 },
    Independent:{ wins: 11, losses: 5, pct: 0.688 }
  },
  byWeek: {
    week1: { wins: 8, losses: 4, pct: 0.667 },
    week2: { wins: 9, losses: 3, pct: 0.750 },
    week3: { wins: 10, losses: 4, pct: 0.714 },
    week4: { wins: 12, losses: 4, pct: 0.750 },
    week5: { wins: 11, losses: 5, pct: 0.688 },
    week6: { wins: 13, losses: 5, pct: 0.722 },
    week7: { wins: 11, losses: 6, pct: 0.647 },
    bowlGames: { wins: 13, losses: 7, pct: 0.650 }
  },
  highConfidenceOnly: { wins: 38, losses: 9, pct: 0.808, games: 47 },
  eliteOnly:          { wins: 17, losses: 2, pct: 0.895, games: 19 },
  sharpAlignedPicks:  { wins: 29, losses: 8, pct: 0.784, games: 37 },
  weatherAdjusted:    { wins: 24, losses: 7, pct: 0.774, games: 31 },
  seasonNote: "2025 season performance. Model uses 7-signal weighted approach: base stats (30%), player impact (20%), situational (15%), weather (10%), coaching edge (10%), program momentum (8%), sharp money (7%)."
};

// ── Helper: resolve teamId references to full team objects
function _teamFallback(id, name) {
  return {
    id: id || "unknown", name: name || id || "Unknown",
    abbreviation: (name || id || "UNK").toUpperCase().slice(0,4),
    mascot: "", conference: "FCS", color: "#555566", altColor: "#333344",
    wins: 0, losses: 0, lastSeasonRecord: "FCS",
    rating: 52, offensiveRating: 50, defensiveRating: 50,
    spRating: -10, spRank: 90, recruitingRank: 90,
    coachName: "Unknown", coachRecord: "0-0",
    stats: {
      pointsPerGame: 20, pointsAllowedPerGame: 30,
      yardsPerGame: 300, yardsAllowedPerGame: 400,
      passingYardsPerGame: 175, rushingYardsPerGame: 125,
      turnoversPerGame: 1.8, turnoversForced: 0.9,
      thirdDownPct: 0.37, redZonePct: 0.68, sacks: 1.4, sacksAllowed: 2.8,
    },
    atsRecord: null, situational: {},
    programHealth: { nilStrength: 25, transferPortalRating: 25, coachHotSeat: 5,
                     programMomentum: "stable", fanMorale: 50,
                     lockerRoomCohesion: 55, depthChartStability: 55 },
    weatherProfile: { isDome: false, coldWeatherAdvantage: 5 },
    schedule: { daysSinceLastGame: 7, isComingOffBigWin: false,
                isComingOffBigLoss: false, hasLookaheadGame: false,
                consecutiveRoadGames: 0, travelBurdenRating: 5 },
    coachingProfile: {},
  };
}

function resolveGame(g) {
  return {
    ...g,
    homeTeam: TEAMS[g.homeTeamId] || _teamFallback(g.homeTeamId, g.homeTeamName),
    awayTeam: TEAMS[g.awayTeamId] || _teamFallback(g.awayTeamId, g.awayTeamName),
  };
}

// ── Helper: format spread for display (+3.5, -7, PK)
function fmtSpread(n) {
  if (n === 0) return "PK";
  return (n > 0 ? "+" : "") + n;
}

// ── Helper: format moneyline for display (+150, -110)
function fmtML(n) {
  if (!n && n !== 0) return "—";
  return (n > 0 ? "+" : "") + n;
}

// ── Helper: format moneyline for display (+250, -180)
function fmtML(n) {
  return (n > 0 ? "+" : "") + n;
}

// ── Helper: format date string ("Aug 29", "Sep 5")
function fmtDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
