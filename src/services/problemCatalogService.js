import { dbProblems } from '../data/databaseProblems'
import { problems } from '../data/problems'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

const VALID_TYPES = new Set(['CODING', 'SQL'])
const catalogCache = new Map()

export function getFallbackProblemCatalog(problemType) {
  return problemType === 'SQL' ? dbProblems : problemType === 'CODING' ? problems : []
}

export function getCachedProblemCatalog(problemType) {
  return catalogCache.get(problemType) || getFallbackProblemCatalog(problemType)
}

function mapCatalogRow(row) {
  const common = {
    id: Number(row.problem_id),
    type: row.problem_type,
    problemType: row.problem_type,
    title: row.title,
    topic: row.topic,
    difficulty: row.difficulty,
    description: row.description,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
  }

  if (row.problem_type === 'SQL') {
    return {
      ...common,
      starter: row.starter_code?.sql || '',
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

  const { data, error } = await supabase
    .from('problem_catalog')
    .select('problem_type, problem_id, title, topic, difficulty, description, examples, problem_constraints, expected_output, public_test_cases, starter_code, schema_data, expected_result, source_name, source_url')
    .eq('problem_type', problemType)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('problem_id', { ascending: true })

  if (error) {
    if (error.code === '42P01' || error.code === '42703' || error.code === 'PGRST205') {
      console.warn('[problemCatalogService] Problem catalog migration is pending; using the bundled transition catalog.', error)
      return getFallbackProblemCatalog(problemType)
    }
    throw error
  }

  if (!data?.length) {
    const archivedCatalog = getFallbackProblemCatalog(problemType)
    catalogCache.set(problemType, archivedCatalog)
    return archivedCatalog
  }

  const catalog = data.map(mapCatalogRow)
  catalogCache.set(problemType, catalog)
  return catalog
}

export async function fetchProblemByIdentity(problemType, problemId) {
  const catalog = await fetchProblemCatalog(problemType)
  return catalog.find((problem) => Number(problem.id) === Number(problemId)) || null
}
