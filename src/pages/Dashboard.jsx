import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchUserProgressFromSupabase, subscribeToProgress } from '../services/progressService'
import { getRecentSubmissions } from '../services/submissionService'
import { fetchProblemCatalog, getFallbackProblemCatalog } from '../services/problemCatalogService'
import { calculateTotalXp } from '../utils/xp'
import DifficultyBadge from '../components/DifficultyBadge'
import { CheckCircle2, Play, Flame, Zap, ArrowRight, BookOpen, Trophy, Code2 } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState({
    loading: true,
    error: null,
    progress: [],
    submissions: [],
    codingCatalog: getFallbackProblemCatalog('CODING'),
    sqlCatalog: getFallbackProblemCatalog('SQL'),
  })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    if (!user?.id) {
      setData({
        loading: false,
        error: null,
        progress: [],
        submissions: [],
        codingCatalog: getFallbackProblemCatalog('CODING'),
        sqlCatalog: getFallbackProblemCatalog('SQL'),
      })
      return () => { isMounted = false }
    }

    async function loadDashboard() {
      setData({
        loading: true,
        error: null,
        progress: [],
        submissions: [],
        codingCatalog: getFallbackProblemCatalog('CODING'),
        sqlCatalog: getFallbackProblemCatalog('SQL'),
      })
      try {
        const [progress, submissions, codingCatalog, sqlCatalog] = await Promise.all([
          fetchUserProgressFromSupabase(user.id),
          getRecentSubmissions(user.id, 5),
          fetchProblemCatalog('CODING'),
          fetchProblemCatalog('SQL'),
        ])
        if (isMounted) setData({ loading: false, error: null, progress, submissions, codingCatalog, sqlCatalog })
      } catch (error) {
        console.error('Unable to load dashboard data:', error)
        if (isMounted) setData({
          loading: false,
          error: 'Unable to load dashboard data. Please try again.',
          progress: [],
          submissions: [],
          codingCatalog: getFallbackProblemCatalog('CODING'),
          sqlCatalog: getFallbackProblemCatalog('SQL'),
        })
      }
    }

    loadDashboard()
    const unsubscribe = subscribeToProgress(loadDashboard)

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [user?.id, refreshKey])

  const solvedRows = data.progress.filter((item) => item.status === 'SOLVED' && item.problemType)
  const attemptedRows = data.progress.filter((item) => (item.status === 'ATTEMPTED' || item.status === 'SOLVED') && item.problemType)
  const totalProblemsCount = data.codingCatalog.length + data.sqlCatalog.length
  const completionPercentage = totalProblemsCount
    ? Math.round((solvedRows.length / totalProblemsCount) * 100)
    : 0
  const difficultyBreakdown = solvedRows.reduce((counts, item) => {
    if (counts[item.difficulty] !== undefined) counts[item.difficulty] += 1
    return counts
  }, { Easy: 0, Medium: 0, Hard: 0 })
  const totalXp = calculateTotalXp(solvedRows)
  const activeDates = new Set(data.progress.flatMap((item) => [item.lastAttemptAt, item.solvedAt]
    .filter(Boolean)
    .map((date) => date.slice(0, 10))))
  let streakStart = new Date()
  streakStart.setUTCHours(0, 0, 0, 0)
  if (!activeDates.has(streakStart.toISOString().slice(0, 10))) {
    streakStart.setUTCDate(streakStart.getUTCDate() - 1)
  }
  let currentStreak = 0
  while (activeDates.has(streakStart.toISOString().slice(0, 10))) {
    currentStreak += 1
    streakStart.setUTCDate(streakStart.getUTCDate() - 1)
  }

  const recentSolved = [...solvedRows]
    .sort((a, b) => new Date(b.solvedAt || 0) - new Date(a.solvedAt || 0))
    .slice(0, 5)
    .map((item) => {
      const problemType = item.problemType || 'CODING'
      const catalog = problemType === 'SQL' ? data.sqlCatalog : data.codingCatalog
      const problem = catalog.find((candidate) => Number(candidate.id) === item.problemId)
      return {
        ...item,
        title: problem?.title || item.title || `Problem #${item.problemId}`,
        difficulty: problem?.difficulty || item.difficulty || 'Easy',
        topic: problem?.topic || item.topic || '',
        path: problemType === 'SQL' ? `/database/problems/${item.problemId}` : `/problems/${item.problemId}`,
      }
    })

  const username =
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'Learner'

  // Recommend topics from existing content
  const recommendedTopics = [
    { title: 'Loops', slug: 'loops', desc: 'Master while, for, and nested iterations.' },
    { title: 'Arrays', slug: 'arrays', desc: 'Learn traversal, searching, and in-place manipulation.' },
    { title: 'Strings', slug: 'strings', desc: 'Work with character manipulation and palindrome checks.' },
  ]

  return (
    <main className="container dash-page">
      {data.loading && <div className="dash-message"><p className="mut">Loading dashboard...</p></div>}
      {!data.loading && data.error && (
        <div className="dash-message" role="alert">
          <p>{data.error}</p>
          <button className="btn primary sm" onClick={() => setRefreshKey((key) => key + 1)}>Retry</button>
        </div>
      )}
      {!data.loading && !data.error && <>
        <header className="dash-header">
          <div>
            <p className="dash-eyebrow">YOUR LEARNING OVERVIEW</p>
            <h1>Welcome back, <span>{username}</span></h1>
            <p className="mut">Track your progress, keep your streak alive, and build your next skill.</p>
          </div>
          <nav className="dash-actions" aria-label="Dashboard shortcuts">
            <Link to="/problems" className="btn primary sm"><Code2 size={15} /> Solve Problems</Link>
            <Link to="/learn" className="btn sm"><BookOpen size={15} /> Learn</Link>
            <Link to="/leaderboard" className="btn sm"><Trophy size={15} /> Leaderboard</Link>
          </nav>
        </header>

        <section className="dash-metrics" aria-label="Learning statistics">
          <article className="dash-metric">
            <div className="dash-metric-heading solved"><CheckCircle2 size={17} /><span>Problems solved</span></div>
            <div className="dash-metric-value">{solvedRows.length}<span> / {totalProblemsCount}</span></div>
            <div className="dash-metric-note">{completionPercentage}% of the library</div>
          </article>
          <article className="dash-metric">
            <div className="dash-metric-heading attempted"><Play size={17} /><span>Attempted</span></div>
            <div className="dash-metric-value">{attemptedRows.length}</div>
            <div className="dash-metric-note">Problems run or tested</div>
          </article>
          <article className="dash-metric">
            <div className="dash-metric-heading streak"><Flame size={17} /><span>Current streak</span></div>
            <div className="dash-metric-value">{currentStreak}<span> days</span></div>
            <div className="dash-metric-note">Keep showing up daily</div>
          </article>
          <article className="dash-metric">
            <div className="dash-metric-heading xp"><Zap size={17} /><span>Total XP</span></div>
            <div className="dash-metric-value">{totalXp}</div>
            <div className="dash-metric-note">Earned from solved problems</div>
          </article>
        </section>

        <section className="dash-overview-grid">
          <article className="dash-panel">
            <div className="dash-panel-heading">
              <div><p className="dash-section-kicker">YOUR ACTIVITY</p><h2>Difficulty breakdown</h2></div>
            </div>
            <div className="dash-difficulty-list">
              {[
                { name: 'Easy', xp: 10, count: difficultyBreakdown.Easy, max: 10 },
                { name: 'Medium', xp: 20, count: difficultyBreakdown.Medium, max: 5 },
                { name: 'Hard', xp: 30, count: difficultyBreakdown.Hard, max: 3 },
              ].map((item) => (
                <div className="dash-difficulty-row" key={item.name}>
                  <div className="dash-difficulty-label"><span className={`dash-level ${item.name.toLowerCase()}`}>{item.name} <small>+{item.xp} XP</small></span><b>{item.count} solved</b></div>
                  <div className="dash-bar"><span className={item.name.toLowerCase()} style={{ width: `${Math.min(100, (item.count / item.max) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </article>

          <article className="dash-panel">
            <div className="dash-panel-heading">
              <div><p className="dash-section-kicker">MILESTONES</p><h2>Overall progress</h2></div>
              <strong className="dash-completion-value">{completionPercentage}%</strong>
            </div>
            <div className="dash-completion-track"><span style={{ width: `${completionPercentage}%` }} /></div>
            <div className="dash-completion-count"><span>{solvedRows.length} solved</span><span>{totalProblemsCount - solvedRows.length} remaining</span></div>
            <p className="dash-panel-copy">Solving problems adds progress and XP, and contributes to your leaderboard ranking.</p>
          </article>
        </section>

        <section className="dash-activity-grid">
          <article className="dash-panel">
            <div className="dash-panel-heading">
              <div><p className="dash-section-kicker">RECENT WINS</p><h2>Recently solved</h2></div>
              <Link to="/problems" className="dash-panel-link">Browse all <ArrowRight size={14} /></Link>
            </div>
            {recentSolved.length === 0 ? (
              <div className="dash-empty"><p>{data.progress.length === 0 ? 'No problems attempted yet.' : 'No solved problems yet.'}</p><Link to="/problems" className="btn primary sm">Browse problems</Link></div>
            ) : (
              <div className="dash-item-list">
                {recentSolved.map((item) => (
                  <div className="dash-solved-item" key={`${item.problemType}:${item.problemId}`}>
                    <div className="dash-solved-main">
                      <Link to={item.path}>#{item.problemId} {item.title}</Link>
                      <div className="dash-item-tags"><DifficultyBadge level={item.difficulty} />{item.topic && <span className="tag">{item.topic}</span>}</div>
                    </div>
                    <span className="dash-solved-status"><CheckCircle2 size={13} /> Solved</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="dash-panel">
            <div className="dash-panel-heading">
              <div><p className="dash-section-kicker">SUBMISSION HISTORY</p><h2>Recent submissions</h2></div>
            </div>
            {data.submissions.length === 0 ? <div className="dash-empty dash-empty-plain"><p className="mut">No submissions yet.</p></div> : (
              <div className="dash-item-list">
                {data.submissions.map((submission) => {
                  const problemType = submission.problem_type || (submission.language === 'sql' ? 'SQL' : 'CODING')
                  const problemTitle = problemType === 'SQL'
                    ? data.sqlCatalog.find((problem) => Number(problem.id) === Number(submission.problem_id))?.title || `SQL problem #${submission.problem_id}`
                    : data.codingCatalog.find((problem) => Number(problem.id) === Number(submission.problem_id))?.title || `Coding problem #${submission.problem_id}`
                  return (
                    <div className="dash-submission-item" key={submission.id}>
                      <div className="dash-submission-title"><strong>{problemTitle}</strong><span className={submission.status === 'Accepted' ? 'accepted' : ''}>{submission.status}</span></div>
                      <div className="dash-submission-meta">
                        <span>{problemType}</span><span>{submission.language}</span>
                        <span>{submission.execution_time_ms == null ? 'Runtime unavailable' : `${submission.execution_time_ms} ms`}</span>
                        <span>{submission.memory_kb == null ? 'Memory unavailable' : `${submission.memory_kb} KB`}</span>
                        <time dateTime={submission.submitted_at}>{new Date(submission.submitted_at).toLocaleString()}</time>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </article>
        </section>

        <section className="dash-panel dash-lessons-panel">
          <div className="dash-panel-heading">
            <div><p className="dash-section-kicker">KEEP LEARNING</p><h2>Recommended lessons</h2></div>
            <Link to="/learn" className="dash-panel-link">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="dash-lesson-grid">
            {recommendedTopics.map((topic) => (
              <Link className="dash-lesson-item" key={topic.slug} to={`/learn/${topic.slug}`}>
                <span className="dash-lesson-icon"><BookOpen size={16} /></span>
                <span className="dash-lesson-copy"><strong>{topic.title}</strong><small>{topic.desc}</small></span>
                <ArrowRight size={16} className="dash-lesson-arrow" />
              </Link>
            ))}
          </div>
        </section>
      </>}
    </main>
  )
}

