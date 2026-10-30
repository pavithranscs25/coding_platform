import initSqlJs from 'sql.js'

let sqlPromise = null

function getSqlEngine() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    })
  }
  return sqlPromise
}

function normalizeVal(val) {
  if (val === null || val === undefined || val === 'NULL' || val === 'null') return 'null'
  return String(val).trim().toLowerCase()
}

function compareSqlResults(actualCols, actualRows, expected) {
  if (!expected) return true
  const expCols = expected.cols || []
  const expRows = expected.rows || []

  // Check column count
  if (actualCols.length !== expCols.length) return false

  // Check row count
  if ((actualRows?.length || 0) !== (expRows?.length || 0)) return false

  if (expRows.length === 0) return true

  // Sort and compare rows
  const serializeRow = (r) => (Array.isArray(r) ? r.map(normalizeVal).join('|||') : String(r))
  const actualSorted = actualRows.map(serializeRow).sort()
  const expectedSorted = expRows.map(serializeRow).sort()

  for (let i = 0; i < actualSorted.length; i++) {
    if (actualSorted[i] !== expectedSorted[i]) return false
  }

  return true
}

export async function executeSqlQuery(problem, sqlQuery) {
  const startTime = performance.now()
  if (!sqlQuery || !sqlQuery.trim()) {
    return {
      type: 'query',
      status: 'Runtime Error',
      error: 'Query is empty. Please enter a valid SQL query.',
      cols: [],
      rows: [],
      runtime: 0,
      message: 'Query is empty.',
    }
  }

  try {
    const SQL = await getSqlEngine()
    const db = new SQL.Database()

    try {
      // 1. Create and populate tables from problem schema
      const schema = problem.schema || []
      for (const table of schema) {
        const tableName = table.name
        const cols = table.columns || []
        const colDefs = cols.map((c) => `"${c}" TEXT`).join(', ')
        db.run(`CREATE TABLE "${tableName}" (${colDefs});`)

        if (table.rows && table.rows.length > 0) {
          for (const row of table.rows) {
            const values = row
              .map((v) => {
                if (v === null || v === undefined || v === 'NULL') return 'NULL'
                if (typeof v === 'number') return v
                return `'${String(v).replace(/'/g, "''")}'`
              })
              .join(', ')
            db.run(`INSERT INTO "${tableName}" VALUES (${values});`)
          }
        }
      }

      // 2. Execute the user's SQL query
      const queryResults = db.exec(sqlQuery)
      const executionTime = Math.round(performance.now() - startTime)

      if (!queryResults || queryResults.length === 0) {
        const isMatch = (problem.expected?.rows?.length || 0) === 0
        return {
          type: 'query',
          status: isMatch ? 'Accepted' : 'Wrong Answer',
          cols: [],
          rows: [],
          runtime: Math.max(1, executionTime),
          message: isMatch
            ? 'Query executed successfully with 0 rows.'
            : 'Query executed with 0 rows, but rows were expected.',
        }
      }

      const lastResult = queryResults[queryResults.length - 1]
      const actualCols = lastResult.columns || []
      const actualRows = lastResult.values || []

      // 3. Compare with expected output
      const isAccepted = compareSqlResults(actualCols, actualRows, problem.expected)

      return {
        type: 'query',
        status: isAccepted ? 'Accepted' : 'Wrong Answer',
        cols: actualCols,
        rows: actualRows,
        runtime: Math.max(1, executionTime),
        message: isAccepted
          ? 'Query executed successfully and matched expected result.'
          : 'Query executed, but result did not match expected table.',
      }
    } finally {
      db.close()
    }
  } catch (err) {
    const executionTime = Math.round(performance.now() - startTime)
    return {
      type: 'query',
      status: 'Runtime Error',
      error: err.message || 'SQL Execution Error',
      cols: [],
      rows: [],
      runtime: Math.max(1, executionTime),
      message: err.message,
    }
  }
}

