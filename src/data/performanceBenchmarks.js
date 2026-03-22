export const moneylineAccuracyHistory = [
  {
    season: "2024",
    modelAccuracy: 55.41,
    marketAccuracy: 56.39,
    games: 2411,
    marketGames: 837,
    note: "Model winner accuracy is full scored season. Vegas line uses historical odds-covered games only.",
  },
  {
    season: "2025",
    modelAccuracy: 55.87,
    marketAccuracy: 55.91,
    games: 2418,
    marketGames: 2418,
    note: "Strict 2025 benchmark using model probability versus devig market probability.",
  },
];

export const currentMoneylineAccuracySnapshot = {
  season: "2025",
  modelAccuracy: 55.87,
  marketAccuracy: 55.91,
  games: 2418,
  deltaPoints: -0.04,
  note: "Negative American odds imply the market favorite. Current local benchmark has Vegas narrowly ahead on pure winner accuracy.",
};
