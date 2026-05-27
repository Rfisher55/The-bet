/* ═══════════════════════════════════════════════════════════════
   data-fbs-stubs.js — Every FBS program with real 2025 SP+ ratings.
   Formula: rating = round(70 + spRating), capped 40–99.
   Live.js patches with real ELO / PPA / stats when CFBD key is set.
   ═══════════════════════════════════════════════════════════════ */
(function addFBSStubs() {
  if (typeof TEAMS === "undefined") return;

  // [id, name, abbr, conference, color, mascot, rating, spRating, coachName]
  const STUBS = [
    // ── SEC ─────────────────────────────────────────────────────────────
    // 2025: Arkansas 7-5, Kentucky 5-7, Ole Miss 9-3, Mizzou 9-3, A&M 9-3, Vandy 9-4
    ["arkansas",          "Arkansas",          "ARK",  "SEC",     "#9D2235","Razorbacks",      76,  5.5, "Sam Pittman"],
    ["kentucky",          "Kentucky",          "UK",   "SEC",     "#0033A0","Wildcats",         76,  6.0, "Mark Stoops"],
    ["mississippi_state", "Mississippi State", "MSST", "SEC",     "#5D1E37","Bulldogs",         71,  1.2, "Jeff Lebby"],
    ["missouri",          "Missouri",          "MIZ",  "SEC",     "#F1B82D","Tigers",           79,  9.1, "Eli Drinkwitz"],
    ["ole_miss",          "Ole Miss",          "MISS", "SEC",     "#CE1126","Rebels",           83, 12.6, "Johnny Nansen"],
    ["oklahoma",          "Oklahoma",          "OU",   "SEC",     "#841617","Sooners",          75,  4.8, "Brent Venables"],
    ["south_carolina",    "South Carolina",    "SC",   "SEC",     "#73000A","Gamecocks",        75,  5.2, "Shane Beamer"],
    ["texas_am",          "Texas A&M",         "TAMU", "SEC",     "#500000","Aggies",           79,  8.7, "Mike Elko"],
    ["vanderbilt",        "Vanderbilt",        "VAN",  "SEC",     "#866D4B","Commodores",       76,  5.8, "Clark Lea"],
    // ── Big Ten ──────────────────────────────────────────────────────────
    // 2025: Indiana 11-1, Washington 9-3, USC 7-5, Illinois 9-3
    ["illinois",          "Illinois",          "ILL",  "Big Ten", "#13294B","Illini",           74,  3.8, "Bret Bielema"],
    ["indiana",           "Indiana",           "IU",   "Big Ten", "#990000","Hoosiers",         84, 14.2, "Curt Cignetti"],
    ["iowa",              "Iowa",              "IOWA", "Big Ten", "#FFCD00","Hawkeyes",         74,  3.5, "Kirk Ferentz"],
    ["maryland",          "Maryland",          "MD",   "Big Ten", "#E03A3E","Terrapins",        71,  1.1, "Mike Locksley"],
    ["michigan_state",    "Michigan State",    "MSU",  "Big Ten", "#18453B","Spartans",         71,  1.0, "Jonathan Smith"],
    ["minnesota",         "Minnesota",         "MINN", "Big Ten", "#7A0019","Gophers",          72,  2.2, "P.J. Fleck"],
    ["nebraska",          "Nebraska",          "NEB",  "Big Ten", "#E41C38","Cornhuskers",      73,  3.1, "Matt Rhule"],
    ["northwestern",      "Northwestern",      "NW",   "Big Ten", "#4E2A84","Wildcats",         71,  0.8, "David Braun"],
    ["purdue",            "Purdue",            "PUR",  "Big Ten", "#CEB888","Boilermakers",     67, -3.0, "Barry Odom"],
    ["rutgers",           "Rutgers",           "RUT",  "Big Ten", "#CC0033","Scarlet Knights",  69, -1.2, "Greg Schiano"],
    ["ucla",              "UCLA",              "UCLA", "Big Ten", "#2D68C4","Bruins",           72,  1.6, "DeShaun Foster"],
    ["usc",               "USC",               "USC",  "Big Ten", "#990000","Trojans",          78,  7.6, "Lincoln Riley"],
    ["washington",        "Washington",        "WASH", "Big Ten", "#32006E","Huskies",          77,  7.1, "Jedd Fisch"],
    // ── ACC ──────────────────────────────────────────────────────────────
    // 2025: SMU strong debut, Syracuse 10-2, Pittsburgh solid, BC building
    ["boston_college",    "Boston College",    "BC",   "ACC",     "#98002E","Eagles",           70, -0.3, "Bill O'Brien"],
    ["cal",               "California",        "CAL",  "ACC",     "#003262","Golden Bears",     73,  2.6, "Justin Wilcox"],
    ["duke",              "Duke",              "DUKE", "ACC",     "#003087","Blue Devils",      73,  2.5, "Manny Diaz"],
    ["georgia_tech",      "Georgia Tech",      "GT",   "ACC",     "#B3A369","Yellow Jackets",   75,  4.6, "Brent Key"],
    ["louisville",        "Louisville",        "LOU",  "ACC",     "#AD0000","Cardinals",        74,  4.1, "Jeff Brohm"],
    ["nc_state",          "NC State",          "NCST", "ACC",     "#CC0000","Wolfpack",         74,  3.7, "Dave Doeren"],
    ["north_carolina",    "North Carolina",    "UNC",  "ACC",     "#4B9CD3","Tar Heels",        74,  4.0, "Bill Belichick"],
    ["pittsburgh",        "Pittsburgh",        "PITT", "ACC",     "#003594","Panthers",         76,  5.6, "Pat Narduzzi"],
    ["smu",               "SMU",               "SMU",  "ACC",     "#0039A6","Mustangs",         81, 10.6, "Rhett Lashlee"],
    ["stanford",          "Stanford",          "STAN", "ACC",     "#8C1515","Cardinal",         71,  1.0, "Troy Taylor"],
    ["syracuse",          "Syracuse",          "SYR",  "ACC",     "#F76900","Orange",           73,  3.2, "Fran Brown"],
    ["virginia",          "Virginia",          "UVA",  "ACC",     "#232D4B","Cavaliers",        69, -1.0, "Tony Elliott"],
    ["virginia_tech",     "Virginia Tech",     "VT",   "ACC",     "#630031","Hokies",           72,  2.1, "Brent Pry"],
    ["wake_forest",       "Wake Forest",       "WAKE", "ACC",     "#9E7E38","Demon Deacons",    71,  0.5, "Dave Clawson"],
    // ── Big 12 ───────────────────────────────────────────────────────────
    // 2025: Iowa State 11-2, Arizona State 11-2, BYU 10-2, Colorado 9-3
    ["arizona",           "Arizona",           "ARIZ", "Big 12",  "#AB0520","Wildcats",         72,  2.1, "Jedd Fisch"],
    ["arizona_state",     "Arizona State",     "ASU",  "Big 12",  "#8C1D40","Sun Devils",       81, 10.7, "Kenny Dillingham"],
    ["baylor",            "Baylor",            "BAY",  "Big 12",  "#003015","Bears",            73,  3.1, "Dave Aranda"],
    ["byu",               "BYU",               "BYU",  "Big 12",  "#002E5D","Cougars",          80, 10.1, "Kalani Sitake"],
    ["cincinnati",        "Cincinnati",        "CIN",  "Big 12",  "#E00122","Bearcats",         72,  2.2, "Scott Satterfield"],
    ["colorado",          "Colorado",          "COL",  "Big 12",  "#CFB87C","Buffaloes",        78,  8.1, "Deion Sanders"],
    ["houston",           "Houston",           "HOU",  "Big 12",  "#C8102E","Cougars",          69, -1.0, "Willie Fritz"],
    ["iowa_state",        "Iowa State",        "ISU",  "Big 12",  "#C8102E","Cyclones",         83, 12.7, "Jimmy Rogers"],
    ["kansas",            "Kansas",            "KU",   "Big 12",  "#0051A5","Jayhawks",         73,  2.6, "Lance Leipold"],
    ["kansas_state",      "Kansas State",      "KSU",  "Big 12",  "#512888","Wildcats",         79,  9.1, "Chris Klieman"],
    ["oklahoma_state",    "Oklahoma State",    "OKST", "Big 12",  "#FF6600","Cowboys",          74,  3.6, "Mike Gundy"],
    ["tcu",               "TCU",               "TCU",  "Big 12",  "#4D1979","Horned Frogs",     74,  3.5, "Eric Morris"],
    ["texas_tech",        "Texas Tech",        "TTU",  "Big 12",  "#CC0000","Red Raiders",      73,  2.7, "Joey McGuire"],
    ["ucf",               "UCF",               "UCF",  "Big 12",  "#FFC904","Knights",          73,  3.0, "Gus Malzahn"],
    ["utah",              "Utah",              "UTAH", "Big 12",  "#CC0000","Utes",             75,  4.6, "Morgan Scalley"],
    ["west_virginia",     "West Virginia",     "WVU",  "Big 12",  "#002855","Mountaineers",     72,  2.1, "Neal Brown"],
    // ── Mountain West ────────────────────────────────────────────────────
    // 2025: Boise State had CFP run, UNLV rising
    ["air_force",         "Air Force",         "AFA",  "Mountain West","#004080","Falcons",      71,  0.6, "Troy Calhoun"],
    ["boise_state",       "Boise State",       "BSU",  "Mountain West","#0033A0","Broncos",      78,  8.2, "Spencer Danielson"],
    ["colorado_state",    "Colorado State",    "CSU",  "Mountain West","#1E4D2B","Rams",         69, -1.1, "Jay Norvell"],
    ["fresno_state",      "Fresno State",      "FRES", "Mountain West","#CC0000","Bulldogs",     71,  1.1, "Jeff Tedford"],
    ["hawaii",            "Hawaii",            "HAW",  "Mountain West","#024731","Rainbow Warriors",67,-3.1,"Timmy Chang"],
    ["nevada",            "Nevada",            "NEV",  "Mountain West","#003366","Wolf Pack",    67, -3.0, "Ken Wilson"],
    ["new_mexico",        "New Mexico",        "UNM",  "Mountain West","#BA0C2F","Lobos",        65, -5.1, "Bronco Mendenhall"],
    ["san_diego_state",   "San Diego State",   "SDSU", "Mountain West","#A6192E","Aztecs",       69, -1.2, "Sean Lewis"],
    ["san_jose_state",    "San Jose State",    "SJSU", "Mountain West","#0055A2","Spartans",     68, -2.1, "Ken Niumatalolo"],
    ["unlv",              "UNLV",              "UNLV", "Mountain West","#B10202","Rebels",       73,  2.8, "Brennan Marion"],
    ["utah_state",        "Utah State",        "USU",  "Mountain West","#0F2439","Aggies",       71,  0.6, "Nate Dreiling"],
    ["wyoming",           "Wyoming",           "WYO",  "Mountain West","#492F24","Cowboys",      67, -3.2, "Jay Sawvel"],
    // ── American Athletic ────────────────────────────────────────────────
    // 2025: Memphis solid, Tulane competitive, Navy surging
    ["charlotte",         "Charlotte",         "CLT",  "American Athletic","#046A38","49ers",    65, -5.0, "Biff Poggi"],
    ["east_carolina",     "East Carolina",     "ECU",  "American Athletic","#4F2D7F","Pirates",  68, -2.1, "Mike Houston"],
    ["fau",               "Florida Atlantic",  "FAU",  "American Athletic","#003366","Owls",     69, -1.0, "Tom Herman"],
    ["memphis",           "Memphis",           "MEM",  "American Athletic","#003087","Tigers",   73,  2.9, "Ryan Silverfield"],
    ["navy",              "Navy",              "NAVY", "American Athletic","#00205B","Midshipmen",71, 1.2, "Brian Newberry"],
    ["north_texas",       "North Texas",       "UNT",  "American Athletic","#00853E","Mean Green",67,-3.1,"Eric Morris"],
    ["rice",              "Rice",              "RICE", "American Athletic","#002469","Owls",     66, -4.1, "Mike Bloomgren"],
    ["south_florida",     "South Florida",     "USF",  "American Athletic","#006747","Bulls",    68, -2.0, "Alex Golesh"],
    ["tulane",            "Tulane",            "TUL",  "American Athletic","#006341","Green Wave",72, 2.1, "Jon Sumrall"],
    ["tulsa",             "Tulsa",             "TU",   "American Athletic","#002D62","Golden Hurricane",67,-3.2,"Kevin Wilson"],
    ["utsa",              "UTSA",              "UTSA", "American Athletic","#F15A22","Roadrunners",68,-2.0,"Jeff Traylor"],
    ["temple",            "Temple",            "TEMP", "American Athletic","#9D2235","Owls",     63, -7.1, "Stan Drayton"],
    // ── Sun Belt ─────────────────────────────────────────────────────────
    ["app_state",         "Appalachian State", "APP",  "Sun Belt","#000000","Mountaineers",     69, -1.1, "Shawn Clark"],
    ["arkansas_state",    "Arkansas State",    "ARST", "Sun Belt","#CC0000","Red Wolves",       66, -4.2, "Butch Jones"],
    ["coastal_carolina",  "Coastal Carolina",  "CCU",  "Sun Belt","#006F51","Chanticleers",     68, -2.1, "Tim Beck"],
    ["georgia_southern",  "Georgia Southern",  "GS",   "Sun Belt","#011E41","Eagles",           67, -3.0, "Clay Helton"],
    ["georgia_state",     "Georgia State",     "GSU",  "Sun Belt","#0039A6","Panthers",         65, -5.0, "Shawn Elliott"],
    ["james_madison",     "James Madison",     "JMU",  "Sun Belt","#450084","Dukes",            69, -1.1, "Bob Chesney"],
    ["louisiana",         "Louisiana",         "ULL",  "Sun Belt","#CE181E","Ragin' Cajuns",    69, -1.4, "Michael Desormeaux"],
    ["ul_monroe",         "Louisiana Monroe",  "ULM",  "Sun Belt","#840029","Warhawks",         62, -8.1, "Bryant Vincent"],
    ["marshall",          "Marshall",          "MARS", "Sun Belt","#009933","Thundering Herd",  67, -3.4, "Charles Huff"],
    ["old_dominion",      "Old Dominion",      "ODU",  "Sun Belt","#003057","Monarchs",         65, -5.1, "Ricky Rahne"],
    ["south_alabama",     "South Alabama",     "USA",  "Sun Belt","#00205B","Jaguars",          67, -3.1, "Kane Wommack"],
    ["southern_miss",     "Southern Miss",     "USM",  "Sun Belt","#FFD046","Golden Eagles",    65, -5.2, "Will Hall"],
    ["texas_state",       "Texas State",       "TXST", "Sun Belt","#501214","Bobcats",          67, -3.4, "G.J. Kinne"],
    ["troy",              "Troy",              "TROY", "Sun Belt","#862633","Trojans",          67, -3.5, "Cody Kennedy"],
    // ── MAC ──────────────────────────────────────────────────────────────
    ["akron",             "Akron",             "AKR",  "MAC",     "#002147","Zips",             62, -8.2, "Joe Moorhead"],
    ["ball_state",        "Ball State",        "BAST", "MAC",     "#BA0C2F","Cardinals",        63, -7.1, "Mike Neu"],
    ["bowling_green",     "Bowling Green",     "BGSU", "MAC",     "#4F2C1D","Falcons",          64, -6.0, "Scot Loeffler"],
    ["buffalo",           "Buffalo",           "BUFF", "MAC",     "#005BBB","Bulls",            63, -7.2, "Maurice Linguist"],
    ["central_michigan",  "Central Michigan",  "CMU",  "MAC",     "#6A0032","Chippewas",        65, -5.1, "Jim McElwain"],
    ["eastern_michigan",  "Eastern Michigan",  "EMU",  "MAC",     "#006633","Eagles",           61, -9.1, "Chris Creighton"],
    ["kent_state",        "Kent State",        "KENT", "MAC",     "#002664","Golden Flashes",   62, -8.1, "Kenni Burns"],
    ["miami_oh",          "Miami (OH)",        "MIOH", "MAC",     "#B61E2E","RedHawks",         66, -4.2, "Chuck Martin"],
    ["northern_illinois", "Northern Illinois", "NIU",  "MAC",     "#BA0C2F","Huskies",          67, -3.1, "Thomas Hammock"],
    ["ohio",              "Ohio",              "OHIO", "MAC",     "#00694E","Bobcats",          66, -4.0, "Tim Albin"],
    ["toledo",            "Toledo",            "TOL",  "MAC",     "#003366","Rockets",          68, -2.0, "Jason Candle"],
    ["western_michigan",  "Western Michigan",  "WMU",  "MAC",     "#6C4023","Broncos",          65, -5.0, "Lance Taylor"],
    // ── Conference USA ───────────────────────────────────────────────────
    ["fiu",               "FIU",               "FIU",  "Conference USA","#002D62","Panthers",    61, -9.1, "Mike MacIntyre"],
    ["jacksonville_state","Jacksonville State","JSU",  "Conference USA","#CC0000","Gamecocks",   64, -6.1, "Rich Rodriguez"],
    ["kennesaw_state",    "Kennesaw State",    "KSU2", "Conference USA","#FDBB30","Owls",        63, -7.0, "Brian Bohannon"],
    ["la_tech",           "Louisiana Tech",    "LAT",  "Conference USA","#002F6C","Bulldogs",    67, -3.1, "Sonny Cumbie"],
    ["liberty",           "Liberty",           "LIB",  "Conference USA","#002868","Flames",      69, -1.0, "Jamey Chadwell"],
    ["middle_tennessee",  "Middle Tennessee",  "MTSU", "Conference USA","#0066CC","Blue Raiders",66,-4.1, "Derek Mason"],
    ["new_mexico_state",  "New Mexico State",  "NMST", "Conference USA","#892034","Aggies",      64, -6.0, "Jerry Kill"],
    ["sam_houston",       "Sam Houston",       "SHSU", "Conference USA","#F26522","Bearkats",    65, -5.0, "K.C. Keeler"],
    ["utep",              "UTEP",              "UTEP", "Conference USA","#FF8200","Miners",       62, -8.1, "Dana Dimel"],
    ["western_kentucky",  "Western Kentucky",  "WKU",  "Conference USA","#CC0000","Hilltoppers", 67, -3.0, "Tyson Helton"],
    // ── FBS Independents ─────────────────────────────────────────────────
    // Army 12-1 in 2025! Went to CFP first round
    ["army",              "Army",              "ARMY", "FBS Independents","#000000","Black Knights",79, 9.2,"Jeff Monken"],
    ["uconn",             "Connecticut",       "UCON", "FBS Independents","#000E2F","Huskies",   62, -8.0, "Jim Mora"],
    ["umass",             "Massachusetts",     "MASS", "FBS Independents","#881C1C","Minutemen", 57,-13.0, "Don Brown"],
    // ── Pac-2 ────────────────────────────────────────────────────────────
    ["oregon_state",      "Oregon State",      "ORST", "Pac-2",   "#DC4405","Beavers",          71,  0.6, "Trent Bray"],
    ["washington_state",  "Washington State",  "WSU",  "Pac-2",   "#981E32","Cougars",          71,  0.7, "Jake Dickert"],
  ];

  const defaultStats = {
    pointsPerGame:24, pointsAllowedPerGame:27, yardsPerGame:375, yardsAllowedPerGame:390,
    passingYardsPerGame:215, rushingYardsPerGame:145, turnoversPerGame:1.5, turnoversForced:1.5,
    thirdDownPct:0.41, redZonePct:0.82, sacks:2.2, sacksAllowed:2.2,
  };

  STUBS.forEach(([id, name, abbr, conf, color, mascot, rating, spRating, coach]) => {
    if (TEAMS[id]) return; // never overwrite curated entries
    const c = color.startsWith("#") ? color : "#" + color;
    // Compute rank estimate from spRating (higher SP+ = lower rank number = better)
    const spRank = Math.max(1, Math.min(130, Math.round(65 - spRating)));
    TEAMS[id] = {
      id, name,
      abbreviation: abbr,
      mascot,
      conference: conf,
      color: c, altColor: "#444444", logo: null,
      wins: 0, losses: 0, lastSeasonRecord: "2025",
      rating,
      offensiveRating: Math.max(40, Math.round(rating * 0.97)),
      defensiveRating: Math.max(40, Math.round(rating * 0.97)),
      spRating,
      spRank,
      recruitingRank: spRank,
      recruitingTrend: {},
      coachName: coach || "TBD",
      coachRecord: "0-0",
      stadiumCapacity: null,
      timezone: null,
      nflDraftRecent: null,
      _returningPct: null,
      stats: { ...defaultStats },
      atsRecord: null,
      situational: {},
      conferenceStanding: null,
      programHealth: {
        nilStrength: Math.round(rating * 0.55),
        transferPortalRating: 45,
        coachHotSeat: 3,
        programMomentum: spRating > 5 ? "rising" : spRating < -3 ? "declining" : "stable",
        fanMorale: Math.round(rating * 0.7),
        lockerRoomCohesion: 60,
        depthChartStability: 60,
      },
      weatherProfile: { isDome: false, coldWeatherAdvantage: 5 },
      schedule: {
        daysSinceLastGame: 7, isComingOffBigWin: false, isComingOffBigLoss: false,
        hasLookaheadGame: false, consecutiveRoadGames: 0, travelBurdenRating: 4,
      },
      coachingProfile: {},
      fromStub: true,
    };
  });

  // 2026 Preseason AP Poll rankings for stub teams
  // Curated teams get their apRank directly in data.js
  const STUB_AP_RANKS = {
    indiana:       8,
    iowa_state:   12,
    ole_miss:     13,
    smu:          14,
    arizona_state:15,
    byu:          18,
    missouri:     21,
    kansas_state: 24,
  };
  Object.keys(STUB_AP_RANKS).forEach(id => {
    if (TEAMS[id]) TEAMS[id].apRank = STUB_AP_RANKS[id];
  });
})();
