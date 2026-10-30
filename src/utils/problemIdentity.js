import { getCachedProblemCatalog } from '../services/problemCatalogService'

export const PROBLEM_TYPES = {
  CODING: 'CODING',
  SQL: 'SQL',
}

export function normalizeProblemType(problemType) {
  const normalized = String(problemType || '').trim().toUpperCase()
  if (normalized === PROBLEM_TYPES.CODING || normalized === PROBLEM_TYPES.SQL) {
    return normalized
  }

  return null
}

export function getProblemCatalog(problemType) {
  const normalizedType = normalizeProblemType(problemType)
  return normalizedType ? getCachedProblemCatalog(normalizedType) : []
}

export function getProblemIdentityKey(problemType, problemId) {
  const normalizedType = normalizeProblemType(problemType)
  const normalizedId = Number(problemId)

  if (!normalizedType || !Number.isFinite(normalizedId)) {
    return null
  }

  return `${normalizedType}:${normalizedId}`
}

export function findProblemByIdentity(problemType, problemId) {
  const catalog = getProblemCatalog(problemType)
  const normalizedId = Number(problemId)

  if (!catalog.length || !Number.isFinite(normalizedId)) {
    return null
  }

  return catalog.find((problem) => Number(problem.id) === normalizedId) || null
}

export function getProblemTypeForLanguage(language) {
  const normalized = String(language || '').trim().toLowerCase()
  return normalized === 'sql' ? PROBLEM_TYPES.SQL : PROBLEM_TYPES.CODING
}
