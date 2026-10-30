import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, Check, Circle, Search } from 'lucide-react'
import DifficultyBadge from '../components/DifficultyBadge'
import { useAuth } from '../context/AuthContext'
import { fetchUserProgress, getUserProgress, PROBLEM_STATUS, subscribeToProgress } from '../services/progressService'
import { fetchProblemCatalog, getFallbackProblemCatalog } from '../services/problemCatalogService'
import { getProblemIdentityKey } from '../utils/problemIdentity'

const TOPICS = ['All Topics', 'SQL']
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']

export default function DatabaseProblems() {
  const [sp, setSp] = useSearchParams()
  const { user } = useAuth()
  const [diff, setDiff] = useState('All')
  const [query, setQuery] = useState('')
  const [catalog, setCatalog] = useState(() => getFallbackProblemCatalog('SQL'))
  const [progress, setProgress] = useState(() => getUserProgress(user?.id))
  const topic = TOPICS.includes(sp.get('topic')) ? sp.get('topic') : 'All Topics'

  useEffect(() => {
    let active = true
    fetchProblemCatalog('SQL')
      .then((nextCatalog) => {
        if (active) setCatalog(nextCatalog)
      })
      .catch((error) => console.error('Unable to load SQL problem catalog:', error))

    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    const syncProgress = () => setProgress(getUserProgress(user?.id))
    syncProgress()
    const unsubscribe = subscribeToProgress(syncProgress)

    if (user?.id) {
      fetchUserProgress(user.id).then((nextProgress) => {
        if (active) setProgress(nextProgress)
      })
    }

    return () => {
      active = false
      unsubscribe()
    }
  }, [user?.id])

  const list = useMemo(() => catalog.filter((problem) => {
    const matchesDifficulty = diff === 'All' || problem.difficulty === diff
    const matchesTopic = topic === 'All Topics' || problem.topic === topic
    const schemaNames = problem.schema.map((table) => `${table.name} ${table.columns.join(' ')}`).join(' ')
    const searchText = `${problem.title} ${problem.topic} ${problem.description} ${schemaNames}`.toLowerCase()
    return matchesDifficulty && matchesTopic && searchText.includes(query.trim().toLowerCase())
  }), [catalog, diff, topic, query])

  const getStatus = (problemId) => progress[getProblemIdentityKey('SQL', problemId)]?.status || PROBLEM_STATUS.NOT_STARTED
  const solvedCount = catalog.filter((problem) => getStatus(problem.id) === PROBLEM_STATUS.SOLVED).length

  return (
    <main className="container problems-page">
      <header className="problems-heading">
        <div>
          <p className="problems-eyebrow">DATABASE PRACTICE</p>
          <h1>SQL Problems</h1>
          <p className="mut">Write queries against sample tables and sharpen your database skills.</p>
        </div>
        <div className="problems-progress" aria-label={`${solvedCount} of ${catalog.length} SQL problems solved`}>
          <span className="problems-progress-count">{solvedCount}<span> / {catalog.length}</span></span>
          <span className="problems-progress-label">solved</span>
        </div>
      </header>

      <section className="problems-controls" aria-label="Filter SQL problems">
        <label className="problems-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search SQL problems, tables, or columns"
            aria-label="Search SQL problems"
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
        </label>

        <div className="problems-filter-group">
          <span className="problems-filter-label">Difficulty</span>
          <div className="problems-difficulty-filters" role="group" aria-label="Filter by difficulty">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                className={`problems-filter-chip ${diff === level ? 'active' : ''} ${level !== 'All' ? `level-${level.toLowerCase()}` : ''}`}
                aria-pressed={diff === level}
                onClick={() => setDiff(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="problems-filter-group">
          <span className="problems-filter-label">Topics</span>
          <div className="problems-topic-filters" role="group" aria-label="Filter by topic">
            {TOPICS.map((item) => (
              <button
                key={item}
                type="button"
                className={`problems-topic-chip ${topic === item ? 'active' : ''}`}
                aria-pressed={topic === item}
                onClick={() => setSp(item === 'All Topics' ? {} : { topic: item })}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="problems-results" aria-label="SQL problems">
        <div className="problems-results-head">
          <h2>Problem set</h2>
          <span className="mut">{list.length} {list.length === 1 ? 'problem' : 'problems'}</span>
        </div>
        <div className="problems-table">
          <div className="problems-table-header" aria-hidden="true">
            <span>Problem</span><span>Topic</span><span>Difficulty</span><span>Status</span><span />
          </div>
          {list.length ? list.map((problem) => {
            const status = getStatus(problem.id)
            const isSolved = status === PROBLEM_STATUS.SOLVED
            const isAttempted = status === PROBLEM_STATUS.ATTEMPTED
            return (
              <Link className="problems-row" to={`/database/problems/${problem.id}`} key={problem.id}>
                <span className="problems-name">
                  <span className="problems-number">{String(problem.id).padStart(2, '0')}</span>
                  <span className="problems-title-wrap"><strong>{problem.title}</strong><small>{problem.description}</small></span>
                </span>
                <span className="problems-topic">{problem.topic}</span>
                <span className="problems-difficulty"><DifficultyBadge level={problem.difficulty} /></span>
                <span className={`problems-status ${isSolved ? 'solved' : isAttempted ? 'attempted' : ''}`}>
                  {isSolved ? <><Check size={15} /> Solved</> : isAttempted ? <><Circle size={13} /> Attempted</> : <><Circle size={13} /> Todo</>}
                </span>
                <span className="problems-open" aria-label={`Open ${problem.title}`}><ArrowUpRight size={17} /></span>
              </Link>
            )
          }) : (
            <div className="problems-empty">
              <Search size={22} />
              <strong>No matching problems</strong>
              <span>Try a different search or adjust your filters.</span>
              <button type="button" onClick={() => { setQuery(''); setDiff('All'); setSp({}) }}>Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
