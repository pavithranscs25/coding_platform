import { dbProblems } from '../data/databaseProblems'
import { problems } from '../data/problems'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

const VALID_TYPES = new Set(['CODING', 'SQL'])
const PROBLEM_TABLES = {
  CODING: 'coding_problems',
  SQL: 'sql_problems',
}
const catalogCache = new Map()

export function getFallbackProblemCatalog(problemType) {
  return problemType === 'SQL' ? dbProblems : problemType === 'CODING' ? problems : []
}

export function getCachedProblemCatalog(problemType) {
  return catalogCache.get(problemType) || getFallbackProblemCatalog(problemType)
}

function mapCatalogRow(row, problemType) {
  const common = {
    id: Number(row.problem_id),
    type: problemType,
    problemType,
    title: row.title,
    topic: row.topic,
    difficulty: row.difficulty,
    description: row.description,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
  }

  if (problemType === 'SQL') {
    return {
      ...common,
      starter: typeof row.starter_code === 'string' ? row.starter_code : row.starter_code?.sql || '',
      schema: Array.isArray(row.schema_data) ? row.schema_data : [],
      expected: row.expected_result || { cols: [], rows: [] },
    }
  }

  return {
    ...common,
    examples: Array.isArray(row.examples) ? row.examples : [],
    constraints: Array.isArray(row.problem_constraints) ? row.problem_constraints : [],
    expectedOutput: row.expected_output || '',
    testCases: Array.isArray(row.public_test_cases) ? row.public_test_cases : [],
    starterCode: row.starter_code || {},
  }
}

export async function fetchProblemCatalog(problemType) {
  if (!VALID_TYPES.has(problemType)) return []
  if (!isSupabaseConfigured) return getFallbackProblemCatalog(problemType)

  const tableName = PROBLEM_TABLES[problemType]
  const columns = problemType === 'SQL'
    ? 'starter_code, schema_data, expected_result'
    : 'examples, problem_constraints, expected_output, public_test_cases, starter_code'
  const { data, error } = await supabase
    .from(tableName)
    .select(`problem_id, title, topic, difficulty, description, source_name, source_url, is_published, sort_order, ${columns}`)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('problem_id', { ascending: true })

  if (error) {
    throw error
  }

  const catalog = (data || []).map((row) => mapCatalogRow(row, problemType))
  catalogCache.set(problemType, catalog)
  return catalog
}

export async function fetchProblemByIdentity(problemType, problemId) {
  const catalog = await fetchProblemCatalog(problemType)
  return catalog.find((problem) => Number(problem.id) === Number(problemId)) || null
}
