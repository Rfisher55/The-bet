export interface TeamStats {
  pointsPerGame: number;
  pointsAllowedPerGame: number;
  yardsPerGame: number;
  yardsAllowedPerGame: number;
  passingYardsPerGame: number;
  rushingYardsPerGame: number;
  turnoversPerGame: number;
  turnoversForced: number;
  thirdDownPct: number;
  redZonePct: number;
  sacks: number;
  sacksAllowed: number;
  penaltyYardsPerGame: number;
  timeOfPossession: number; // in seconds per game
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  mascot: string;
  conference: string;
  division: string;
  color: string;
  altColor: string;
  wins: number;
  losses: number;
  conferenceWins: number;
  conferenceLosses: number;
  rating: number; // 0–100 composite power rating
  offensiveRating: number;
  defensiveRating: number;
  spRating: number; // SP+ composite
  recruitingRank: number;
  coachName: string;
  coachRecord: string;
  stats: TeamStats;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  teamId: string;
  year: string; // FR, SO, JR, SR
  number: string;
  injuryStatus: "healthy" | "questionable" | "doubtful" | "out";
  impact: "high" | "medium" | "low";
  stats: PlayerGameStats;
}

export interface PlayerGameStats {
  passingYards?: number;
  passingTDs?: number;
  interceptions?: number;
  completionPct?: number;
  rushingYards?: number;
  rushingTDs?: number;
  yardsPerCarry?: number;
  receivingYards?: number;
  receivingTDs?: number;
  receptions?: number;
  tackles?: number;
  sacks?: number;
  qbr?: number;
}

export interface BettingLines {
  spread: number; // negative = home favored
  total: number;
  homeMoneyline: number;
  awayMoneyline: number;
  provider: string;
}

export interface Game {
  id: string;
  season: number;
  week: number;
  date: string;
  time: string;
  homeTeam: Team;
  awayTeam: Team;
  neutralSite: boolean;
  venue: string;
  venueCity: string;
  venueState: string;
  conference: string;
  isConferenceGame: boolean;
  isBowlGame: boolean;
  network: string;
  status: "scheduled" | "live" | "completed";
  homeScore?: number;
  awayScore?: number;
  bettingLines?: BettingLines;
}

export interface PredictionFactor {
  name: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
  favoredTeam: "home" | "away" | "neither";
  magnitude: number; // 1–10
}

export interface SpreadPick {
  side: "home" | "away" | "no-bet";
  team: string;
  confidence: number; // 0–100
  edge: number; // predicted spread vs Vegas spread
}

export interface TotalPick {
  side: "over" | "under" | "no-bet";
  confidence: number;
  edge: number; // predicted total vs Vegas total
}

export interface InsiderTip {
  source: string;
  handle: string;
  platform: "twitter" | "reddit" | "insider" | "beat-writer";
  content: string;
  reliability: number; // 1–5
  timestamp: string;
  tags: string[];
}

export interface InjuryAlert {
  player: string;
  team: string;
  position: string;
  status: "questionable" | "doubtful" | "out";
  impact: "high" | "medium" | "low";
  notes: string;
}

export interface SocialBuzz {
  homeTeamBuzz: number; // 0–100
  awayTeamBuzz: number; // 0–100
  trendingTopics: string[];
  sentimentHome: number; // -1 to 1
  sentimentAway: number; // -1 to 1
  insiderTips: InsiderTip[];
  injuryAlerts: InjuryAlert[];
  weatherImpact: WeatherImpact | null;
}

export interface WeatherImpact {
  condition: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  impactScore: number; // 0–10, higher = more impactful
  favors: "passing" | "rushing" | "defense" | "none";
}

export interface GamePrediction {
  gameId: string;
  generatedAt: string;
  predictedWinner: string;
  winProbability: number; // 0–100 for predicted winner
  predictedSpread: number; // home team perspective
  predictedTotal: number;
  confidence: "elite" | "high" | "medium" | "low";
  spreadPick: SpreadPick;
  totalPick: TotalPick;
  moneylineValue: "home" | "away" | "no-value";
  factors: PredictionFactor[];
  keyPlayers: Player[];
  socialBuzz: SocialBuzz;
  modelBreakdown: {
    offenseVsDefense: number;
    recentForm: number;
    homeFieldAdvantage: number;
    headToHead: number;
    coachingEdge: number;
    recruitingEdge: number;
    socialSignal: number;
  };
}

export interface ModelRecord {
  season: number;
  straightUp: { wins: number; losses: number; pct: number };
  atsRecord: { wins: number; losses: number; pushes: number; pct: number };
  totalRecord: { wins: number; losses: number; pushes: number; pct: number };
  roi: number;
}
