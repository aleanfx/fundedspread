export type RankId = "unranked" | "novato" | "warrior" | "elite" | "legend";

export interface UserRankStats {
  isFunded: boolean;
  totalWithdrawals: number;
  phasesCompleted: number;
  topTenFinishes: number;
  topThreeFinishes: number;
  highestRank: RankId;
  isAdmin?: boolean;
  isVerified?: boolean;
  isRankLocked?: boolean;
}

export const RANK_INFO = {
  unranked: {
    id: "unranked" as RankId,
    name: "Aspirante",
    nameEn: "Unranked",
    color: "#9ca3af",
    bgColor: "#9ca3af15",
    borderColor: "#9ca3af30",
    reqDescription: "Sin requisitos cumplidos aún",
    reqDescriptionEn: "No requirements met yet",
    objectives: [] as string[],
  },
  novato: {
    id: "novato" as RankId,
    name: "Novato",
    nameEn: "Rookie",
    color: "#00ff88",
    bgColor: "#00ff8815",
    borderColor: "#00ff8830",
    reqDescription: "Pasar al menos una fase de evaluación",
    reqDescriptionEn: "Pass at least one evaluation phase",
    objectives: ["Completar 1 fase de evaluación"],
  },
  warrior: {
    id: "warrior" as RankId,
    name: "Guerrero",
    nameEn: "Warrior",
    color: "#06b6d4",
    bgColor: "#06b6d415",
    borderColor: "#06b6d430",
    reqDescription: "Retirar +$1,000 acumulado",
    reqDescriptionEn: "Withdraw $1,000+ accumulated",
    objectives: ["Retiro acumulado ≥ $1,000"],
  },
  elite: {
    id: "elite" as RankId,
    name: "Elite",
    nameEn: "Elite",
    color: "#a855f7",
    bgColor: "#a855f715",
    borderColor: "#a855f730",
    reqDescription: "Retirar +$3,000 o entrar al Top 10",
    reqDescriptionEn: "Withdraw $3,000+ or reach Top 10",
    objectives: ["Retiro acumulado ≥ $3,000", "Top 10 en la clasificación"],
  },
  legend: {
    id: "legend" as RankId,
    name: "Leyenda",
    nameEn: "Legend",
    color: "#fbbf24",
    bgColor: "#fbbf2415",
    borderColor: "#fbbf2430",
    reqDescription: "Top 3 mundial",
    reqDescriptionEn: "Top 3 worldwide",
    objectives: ["Top 3 en la clasificación global"],
  },
};

/** Numeric tier for comparison: higher = better rank */
export const RANK_TIER: Record<RankId, number> = {
  unranked: 0,
  novato: 1,
  warrior: 2,
  elite: 3,
  legend: 4,
};

/**
 * RANK CALCULATION — Based on cumulative objectives, NOT XP.
 * Ranks NEVER degrade unless admin forces it via isRankLocked.
 */
export function calculateRank(stats: UserRankStats): typeof RANK_INFO[RankId] {
  // If admin locked the rank, use that
  if (stats.isRankLocked && stats.highestRank && stats.highestRank !== "unranked") {
    return RANK_INFO[stats.highestRank];
  }

  let calculatedRank = RANK_INFO.unranked;

  // Legend: Top 3 worldwide
  if (stats.topThreeFinishes >= 1) {
    calculatedRank = RANK_INFO.legend;
  }
  // Elite: $3,000+ total withdrawals OR Top 10
  else if (stats.totalWithdrawals >= 3000 || stats.topTenFinishes >= 1) {
    calculatedRank = RANK_INFO.elite;
  }
  // Warrior: $1,000+ total withdrawals
  else if (stats.totalWithdrawals >= 1000) {
    calculatedRank = RANK_INFO.warrior;
  }
  // Novato: Passed at least 1 evaluation phase (has funded account or completed phases)
  else if (stats.phasesCompleted >= 1 || stats.isFunded) {
    calculatedRank = RANK_INFO.novato;
  }

  // Ranks never degrade — return highest between calculated and historical
  const currentTier = RANK_TIER[calculatedRank.id];
  const historicalTier = RANK_TIER[stats.highestRank] || 0;

  if (historicalTier > currentTier) {
    return RANK_INFO[stats.highestRank];
  }

  return calculatedRank;
}

/**
 * Get rank progress info — shows which objectives are completed
 * and what the next rank requires.
 */
export function getRankProgress(stats: UserRankStats) {
  const currentRank = calculateRank(stats);
  let nextRank: typeof RANK_INFO[RankId] | null = null;

  if (currentRank.id === "unranked") nextRank = RANK_INFO.novato;
  else if (currentRank.id === "novato") nextRank = RANK_INFO.warrior;
  else if (currentRank.id === "warrior") nextRank = RANK_INFO.elite;
  else if (currentRank.id === "elite") nextRank = RANK_INFO.legend;

  // Build objectives status for current and next rank
  const completedObjectives: string[] = [];
  if (stats.phasesCompleted >= 1 || stats.isFunded) completedObjectives.push("phase_passed");
  if (stats.totalWithdrawals >= 1000) completedObjectives.push("withdraw_1000");
  if (stats.totalWithdrawals >= 3000) completedObjectives.push("withdraw_3000");
  if (stats.topTenFinishes >= 1) completedObjectives.push("top_10");
  if (stats.topThreeFinishes >= 1) completedObjectives.push("top_3");

  return {
    currentRank,
    nextRank,
    completedObjectives,
    totalWithdrawals: stats.totalWithdrawals,
    phasesCompleted: stats.phasesCompleted,
  };
}

export function mapRankTitleToId(title?: string): RankId {
  if (!title) return "unranked";
  const t = title.toLowerCase();
  if (t.includes("legend") || t.includes("leyenda")) return "legend";
  if (t.includes("elite")) return "elite";
  if (t.includes("warrior") || t.includes("guerrero")) return "warrior";
  if (t.includes("novato") || t.includes("rookie")) return "novato";
  return "unranked";
}
