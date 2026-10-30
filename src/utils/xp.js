export const XP_BY_DIFFICULTY = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
}

export function getXpForDifficulty(difficulty) {
  return XP_BY_DIFFICULTY[difficulty] || 10
}

/**
 * Calculates total XP deterministically from solved problems.
 * @param {Array<{ id: number|string, difficulty: string }>} solvedProblems
 * @returns {number} total XP
 */
export function calculateTotalXp(solvedProblems = []) {
  if (!Array.isArray(solvedProblems)) return 0
  return solvedProblems.reduce((sum, p) => sum + getXpForDifficulty(p.difficulty), 0)
}

