import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Database,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  Zap,
  BookOpen,
  History,
  Sparkles,
} from 'lucide-react'
import CodeEditor from '../components/CodeEditor'
import EditorToolbar from '../components/EditorToolbar'
import ProblemPager from '../components/ProblemPager'
import ResultPanel from '../components/ResultPanel'
import DifficultyBadge from '../components/DifficultyBadge'
import { runQuery } from '../services/runner'
import { recordAttempt, recordSolved, getProblemStatus } from '../services/progressService'
import { createSubmission, getMySubmissions } from '../services/submissionService'
import { fetchProblemCatalog, getFallbackProblemCatalog } from '../services/problemCatalogService'
import { getXpForDifficulty } from '../utils/xp'
import { useAuth } from '../context/AuthContext'
import NotFound from './NotFound'
import '../styles/problemDetail.css'

const SchemaTablePreview = ({ cols, rows }) => (
  <div className="db-table-scroll">
    <table>
      <thead>
        <tr>
          {cols.map((c) => (
            <th key={c}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((v, j) => (
              <td key={j}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

function Inner({ p, neighbors }) {
  const { user } = useAuth()
  const [sql, setSql] = useState(p.starter)
  const [res, setRes] = useState(null)
  const [busy, setBusy] = useState(false)
  const [activePaneTab, setActivePaneTab] = useState('schema')
  const [mySubmissions, setMySubmissions] = useState([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  const status = getProblemStatus(user?.id, p.id)
  const xpAmount = getXpForDifficulty(p.difficulty)

  const loadSubmissions = async () => {
    if (!user) return
    setLoadingSubmissions(true)
    try {
      const all = await getMySubmissions()
      const filtered = (all || []).filter(
        (s) => Number(s.problem_id) === Number(p.id) && s.problem_type === 'SQL'
      )
      setMySubmissions(filtered)
    } catch (err) {
      console.error('Error fetching SQL submissions:', err)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  useEffect(() => {
    if (activePaneTab === 'submissions') {
      loadSubmissions()
    }
  }, [activePaneTab, p.id, user])

  const run = async () => {
    setBusy(true)
    await recordAttempt(user?.id, { ...p, problemType: 'SQL' })
    const out = await runQuery(p, sql)
    setRes(out)

    try {
      await createSubmission({
        userId: user?.id,
        problemId: p.id,
        problemType: 'SQL',
        language: 'sql',
        code: sql,
        status: out?.status || 'Accepted',
        executionTime: out?.runtime ?? null,
      })
      if (activePaneTab === 'submissions') {
        loadSubmissions()
      }
    } catch (error) {
      console.error('Failed to save SQL submission:', error)
    }

    if (out?.status === 'Accepted') {
      await recordSolved(user?.id, { ...p, problemType: 'SQL' })
    }
    setBusy(false)
  }

  return (
    <div className="split">
      {/* Modern Left Problem Pane */}
      <div className="problem-pane">
        {/* Navigation & Context Bar */}
        <div className="problem-nav-bar">
          <div className="problem-nav-left">
            <Link to="/database/problems" className="btn-back" title="Back to Database Problems" aria-label="Back to Database Problems">
              <ArrowLeft size={16} />
            </Link>
            <span className="problem-type-pill" style={{ color: 'var(--ac2)', borderColor: 'color-mix(in srgb, var(--ac2) 32%, transparent)', background: 'color-mix(in srgb, var(--ac2) 14%, transparent)' }}>
              SQL Problem
            </span>
          </div>
          <ProblemPager previous={neighbors.previous} next={neighbors.next} basePath="/database/problems" />
        </div>

        {/* Problem Title & Header */}
        <div className="problem-header">
          <div className="problem-title-row">
            <span className="problem-id-badge">#{p.id}</span>
            <h1 className="problem-title">{p.title}</h1>
          </div>

          <div className="problem-meta-chips">
            <DifficultyBadge level={p.difficulty} />
            <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Database size={12} /> SQL
            </span>
            <span className="xp-badge">
              <Zap size={12} /> +{xpAmount} XP
            </span>
            {status === 'SOLVED' && (
              <span className="solved-status-badge">
                <CheckCircle2 size={12} /> Solved
              </span>
            )}
            {status === 'ATTEMPTED' && (
              <span className="attempted-status-badge">
                <Clock size={12} /> Attempted
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation (Schema vs Expected vs Submissions) */}
        <div className="problem-tabs-bar">
          <button
            type="button"
            className={`problem-tab-btn ${activePaneTab === 'schema' ? 'active' : ''}`}
            onClick={() => setActivePaneTab('schema')}
          >
            <BookOpen size={14} /> Description & Schema
          </button>
          <button
            type="button"
            className={`problem-tab-btn ${activePaneTab === 'expected' ? 'active' : ''}`}
            onClick={() => setActivePaneTab('expected')}
          >
            <TableIcon size={14} /> Expected Result
          </button>
          <button
            type="button"
            className={`problem-tab-btn ${activePaneTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActivePaneTab('submissions')}
          >
            <History size={14} /> Submissions
          </button>
        </div>

        {/* Tab 1: Description & Schema Content */}
        {activePaneTab === 'schema' && (
          <div className="problem-tab-content">
            <div className="problem-section">
              <p className="problem-description-text">{p.description}</p>
            </div>

            <div className="problem-section">
              <h3 className="problem-section-title">
                <Database size={14} /> Database Schema
              </h3>
              {p.schema &&
                p.schema.map((t) => (
                  <div key={t.name} className="db-schema-card">
                    <div className="db-schema-header">
                      <div className="db-table-name">
                        <TableIcon size={14} style={{ color: 'var(--ac)' }} />
                        <span>{t.name}</span>
                      </div>
                      <span className="db-col-count">{t.rows?.length || 0} rows</span>
                    </div>

                    <div className="db-columns-pills">
                      {t.columns.map((c) => (
                        <span key={c} className="db-col-pill">
                          {c}
                        </span>
                      ))}
                    </div>

                    <SchemaTablePreview cols={t.columns} rows={t.rows} />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 2: Expected Output Content */}
        {activePaneTab === 'expected' && (
          <div className="problem-tab-content">
            <div className="problem-section">
              <h3 className="problem-section-title">
                <TableIcon size={14} /> Expected Query Result
              </h3>
              <p className="mut" style={{ fontSize: 13, marginBottom: 12 }}>
                Your SQL query must return the exact columns and records shown below:
              </p>
              <div className="db-schema-card">
                <div className="db-schema-header">
                  <div className="db-table-name" style={{ color: 'var(--ok)' }}>
                    <CheckCircle2 size={14} />
                    <span>Target Output Table</span>
                  </div>
                  <span className="db-col-count">{p.expected?.rows?.length || 0} rows</span>
                </div>
                <SchemaTablePreview cols={p.expected.cols} rows={p.expected.rows} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Submissions History */}
        {activePaneTab === 'submissions' && (
          <div className="submissions-pane">
            {!user ? (
              <div className="empty-sub-state">
                <Sparkles size={28} style={{ color: 'var(--ac)', marginBottom: 8 }} />
                <p style={{ margin: '0 0 10px', fontSize: 14 }}>Sign in to view your SQL query execution history.</p>
                <Link to="/login" className="btn sm primary">
                  Sign In
                </Link>
              </div>
            ) : loadingSubmissions ? (
              <div className="empty-sub-state">
                <p style={{ margin: 0 }}>Loading your SQL submissions...</p>
              </div>
            ) : mySubmissions.length === 0 ? (
              <div className="empty-sub-state">
                <History size={28} style={{ color: 'var(--mut)', marginBottom: 8 }} />
                <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600 }}>No SQL submissions yet</p>
                <p style={{ margin: 0, fontSize: 12 }}>Click "Run Query" to execute your solution.</p>
              </div>
            ) : (
              mySubmissions.map((sub, i) => (
                <div key={sub.id || i} className="submission-item-card">
                  <div className="sub-status">
                    {sub.status === 'Accepted' ? (
                      <span style={{ color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CheckCircle2 size={16} /> Accepted
                      </span>
                    ) : (
                      <span style={{ color: 'var(--err)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={16} /> {sub.status || 'Attempted'}
                      </span>
                    )}
                  </div>
                  <div className="sub-meta">
                    <span className="tag">SQL</span>
                    {sub.execution_time_ms && <span>{sub.execution_time_ms} ms</span>}
                    <span>
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Work Pane (Editor & LeetCode Console Drawer) */}
      <div className="work">
        <EditorToolbar
          runLabel="Run Query"
          busy={busy}
          onReset={() => {
            setSql(p.starter)
            setRes(null)
          }}
          onRun={run}
        />
        <div className="ed">
          <CodeEditor language="sql" value={sql} onChange={setSql} />
        </div>
        <ResultPanel problem={p} result={res} busy={busy} busyType="run" onRun={run} />
      </div>
    </div>
  )
}

export default function DatabaseProblemDetail() {
  const { id } = useParams()
  const [problem, setProblem] = useState(null)
  const [neighbors, setNeighbors] = useState({ previous: null, next: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchProblemCatalog('SQL')
      .then((catalog) => {
        if (!active) return
        const index = catalog.findIndex((item) => Number(item.id) === Number(id))
        setProblem(catalog[index] || null)
        setNeighbors({
          previous: index > 0 ? catalog[index - 1] : null,
          next: index >= 0 ? catalog[index + 1] || null : null,
        })
      })
      .catch((error) => {
        console.error('Unable to load SQL problem:', error)
        if (!active) return
        const catalog = getFallbackProblemCatalog('SQL')
        const index = catalog.findIndex((item) => Number(item.id) === Number(id))
        setProblem(catalog[index] || null)
        setNeighbors({
          previous: index > 0 ? catalog[index - 1] : null,
          next: index >= 0 ? catalog[index + 1] || null : null,
        })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="container center" style={{ padding: '80px 20px' }}>
        <p className="mut">Loading SQL problem...</p>
      </div>
    )
  }

  return problem ? <Inner key={problem.id} p={problem} neighbors={neighbors} /> : <NotFound />
}
