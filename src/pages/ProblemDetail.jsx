import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  Check,
  Zap,
  BookOpen,
  History,
  Layers,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Terminal,
  Lock,
  LogIn,
  LogOut,
} from 'lucide-react'
import { LANGS } from '../components/LanguageSelector'
import CodeEditor from '../components/CodeEditor'
import EditorToolbar from '../components/EditorToolbar'
import ProblemPager from '../components/ProblemPager'
import ResultPanel from '../components/ResultPanel'
import DifficultyBadge from '../components/DifficultyBadge'
import { runCode, submitCode } from '../services/runner'
import { recordAttempt, recordSolved, getProblemStatus } from '../services/progressService'
import { createSubmission, getMySubmissions } from '../services/submissionService'
import { fetchProblemCatalog, getFallbackProblemCatalog } from '../services/problemCatalogService'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { getXpForDifficulty } from '../utils/xp'
import { useAuth } from '../context/AuthContext'
import NotFound from './NotFound'
import '../styles/problemDetail.css'

function getInputFormat(p) {
  if (p.inputFormat) return p.inputFormat
  const firstInput = p.examples?.[0]?.input || ''
  if (firstInput.startsWith('N =') || firstInput.startsWith('n =') || firstInput.startsWith('A =')) {
    return 'The first line contains integer parameter(s) satisfying the problem constraints.'
  }
  if (firstInput.includes('nums =') || firstInput.includes('array =') || firstInput.startsWith('[')) {
    if (firstInput.includes('target =') || firstInput.includes('k =')) {
      return 'The first line contains an array of integers, followed by target/auxiliary constraints.'
    }
    return 'The first line contains an array of integers within the specified constraint bounds.'
  }
  if (firstInput.startsWith('s =') || firstInput.startsWith('"')) {
    return 'A string or character sequence formatted as defined in the problem description.'
  }
  return 'Standard input values matching the problem specification and constraint bounds.'
}

function getOutputFormat(p) {
  if (p.outputFormat) 
    return p.outputFormat
  const firstOutput = p.examples?.[0]?.output || p.expectedOutput || ''
  if (firstOutput === 'true' || firstOutput === 'false') {
    return 'Return or print true or false according to the required logic.'
  }
  if (firstOutput.startsWith('[') || firstOutput.startsWith('[[')) {
    return 'Return or print the resulting array or sequence matching the expected format.'
  }
  if (!isNaN(firstOutput)) {
    return 'Return or print a single integer representing the final calculated result.'
  }
  return 'Print or return the computed output matching the sample testcase format.'
}

const DEFAULT_STARTER_CODE = {
  python: '',
  java: '',
  cpp: '',
  c: '',
}

function Inner({ p, neighbors }) {
  const { user } = useAuth()
  const [lang, setLang] = useState('java')
  const [codes, setCodes] = useState(() => ({
    java: p.starterCode?.java || DEFAULT_STARTER_CODE.java,
    python: p.starterCode?.python || DEFAULT_STARTER_CODE.python,
    c: p.starterCode?.c || DEFAULT_STARTER_CODE.c,
    cpp: p.starterCode?.cpp || DEFAULT_STARTER_CODE.cpp,
  }))
  const [res, setRes] = useState(null)
  const [busy, setBusy] = useState(false)
  const [busyType, setBusyType] = useState('run')
  const [activePaneTab, setActivePaneTab] = useState('description')
  const [copiedExampleIndex, setCopiedExampleIndex] = useState(null)
  const [mySubmissions, setMySubmissions] = useState([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  useEffect(() => {
    setCodes({
      java: p.starterCode?.java || DEFAULT_STARTER_CODE.java,
      python: p.starterCode?.python || DEFAULT_STARTER_CODE.python,
      c: p.starterCode?.c || DEFAULT_STARTER_CODE.c,
      cpp: p.starterCode?.cpp || DEFAULT_STARTER_CODE.cpp,
    })
    setRes(null)
  }, [p.id])

  // Status check (SOLVED, ATTEMPTED, NOT_STARTED)
  const status = getProblemStatus(user?.id, p.id)
  const xpAmount = getXpForDifficulty(p.difficulty)

  const loadSubmissions = async () => {
    if (!user) return
    setLoadingSubmissions(true)
    try {
      const all = await getMySubmissions()
      const filtered = (all || []).filter(
        (s) => Number(s.problem_id) === Number(p.id) && (s.problem_type === 'CODING' || !s.problem_type)
      )
      setMySubmissions(filtered)
    } catch (err) {
      console.error('Error fetching submissions:', err)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  useEffect(() => {
    if (activePaneTab === 'submissions') {
      loadSubmissions()
    }
  }, [activePaneTab, p.id, user])

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedExampleIndex(index)
    setTimeout(() => setCopiedExampleIndex(null), 2000)
  }

  const act = async (fn, type = 'run') => {
    setBusy(true)
    setBusyType(type)
    if (type === 'run') {
      await recordAttempt(user?.id, { ...p, problemType: 'CODING' })
    }

    const out = await fn(p, lang, codes[lang])
    setRes(out)

    try {
      await createSubmission({
        userId: user?.id,
        problemId: p.id,
        problemType: 'CODING',
        language: lang,
        code: codes[lang] || '',
        status: out?.status || 'Accepted',
        executionTime: out?.runtime ?? null,
        memory: out?.memory ? Number(out.memory) : null,
      })
      if (activePaneTab === 'submissions') {
        loadSubmissions()
      }
    } catch (error) {
      console.error('Failed to save submission:', error)
    }

    if (type === 'submit' && out?.status === 'Accepted') {
      await recordSolved(user?.id, { ...p, problemType: 'CODING' })
    } else if (type === 'submit') {
      await recordAttempt(user?.id, { ...p, problemType: 'CODING' })
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
            <Link to="/problems" className="btn-back" title="Back to Problems" aria-label="Back to Problems">
              <ArrowLeft size={16} />
            </Link>
            <span className="problem-type-pill">Coding Problem</span>
          </div>
          <ProblemPager previous={neighbors.previous} next={neighbors.next} basePath="/problems" />
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
              <Layers size={12} /> {p.topic}
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

        {/* Tab Navigation (Description vs Submissions) */}
        <div className="problem-tabs-bar">
          <button
            type="button"
            className={`problem-tab-btn ${activePaneTab === 'description' ? 'active' : ''}`}
            onClick={() => setActivePaneTab('description')}
          >
            <BookOpen size={14} /> Description
          </button>
          <button
            type="button"
            className={`problem-tab-btn ${activePaneTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActivePaneTab('submissions')}
          >
            <History size={14} /> Submissions
          </button>
        </div>

        {/* Tab 1: Description Content */}
        {activePaneTab === 'description' && (
          <div className="problem-tab-content">
            {/* Description */}
            <div className="problem-section">
              <p className="problem-description-text">{p.description}</p>
            </div>

            {/* Input & Output Format */}
            <div className="format-grid">
              <div className="format-card">
                <div className="format-card-header">
                  <LogIn size={13} className="format-icon" />
                  <span>Input Format</span>
                </div>
                <p className="format-card-text">{getInputFormat(p)}</p>
              </div>

              <div className="format-card">
                <div className="format-card-header">
                  <LogOut size={13} className="format-icon" />
                  <span>Output Format</span>
                </div>
                <p className="format-card-text">{getOutputFormat(p)}</p>
              </div>
            </div>

            {/* 1 or 2 Sample Test Cases */}
            <div className="problem-section">
              <h3 className="problem-section-title">
                <Terminal size={14} /> Sample Test Cases ({((p.examples && p.examples.length >= 2) ? 2 : 1)} {((p.examples && p.examples.length >= 2) ? 'Cases' : 'Case')})
              </h3>
              <div className="example-cards-list">
                {((p.examples && p.examples.length >= 2) ? p.examples.slice(0, 2) : (p.examples && p.examples.length === 1) ? p.examples : [{ input: 'N = 5', output: p.expectedOutput || '1 2 3 4 5' }]).map((e, i) => (
                  <div key={i} className="example-card">
                    <div className="example-card-header">
                      <span className="sample-case-title">Sample Testcase {i + 1}</span>
                      <button
                        type="button"
                        className="example-copy-btn"
                        onClick={() => copyToClipboard(e.input, i)}
                        title="Copy input"
                      >
                        {copiedExampleIndex === i ? (
                          <>
                            <Check size={12} className="ok" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy Input
                          </>
                        )}
                      </button>
                    </div>
                    <div className="example-card-body">
                      <div className="example-line">
                        <span className="example-label">Sample Input {i + 1}</span>
                        <div className="example-value">{e.input}</div>
                      </div>
                      <div className="example-line">
                        <span className="example-label">Sample Output {i + 1}</span>
                        <div className="example-value" style={{ color: 'var(--ok)' }}>
                          {e.output}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            {p.constraints && p.constraints.length > 0 && (
              <div className="problem-section">
                <h3 className="problem-section-title">
                  <ShieldAlert size={14} /> Constraints
                </h3>
                <div className="constraints-card">
                  <ul className="constraints-list">
                    {p.constraints.map((c) => (
                      <li key={c} className="constraint-item">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}


          </div>
        )}

        {/* Tab 2: Submissions History */}
        {activePaneTab === 'submissions' && (
          <div className="submissions-pane">
            {!user ? (
              <div className="empty-sub-state">
                <Sparkles size={28} style={{ color: 'var(--ac)', marginBottom: 8 }} />
                <p style={{ margin: '0 0 10px', fontSize: 14 }}>Sign in to view and save your submission history.</p>
                <Link to="/login" className="btn sm primary">
                  Sign In
                </Link>
              </div>
            ) : loadingSubmissions ? (
              <div className="empty-sub-state">
                <p style={{ margin: 0 }}>Loading your submissions...</p>
              </div>
            ) : mySubmissions.length === 0 ? (
              <div className="empty-sub-state">
                <History size={28} style={{ color: 'var(--mut)', marginBottom: 8 }} />
                <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600 }}>No submissions yet</p>
                <p style={{ margin: 0, fontSize: 12 }}>Click "Submit" in the code editor to evaluate your solution.</p>
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
                    <span className="tag" style={{ textTransform: 'capitalize' }}>
                      {sub.language}
                    </span>
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
          language={lang}
          onLanguage={setLang}
          busy={busy}
          onReset={() => {
            setCodes((current) => ({ ...current, [lang]: '' }))
            setRes(null)
          }}
          onRun={() => act(runCode, 'run')}
          onSubmit={() => act(submitCode, 'submit')}
        />
        <div className="ed">
          <CodeEditor
            language={LANGS.find((l) => l.id === lang)?.monaco || 'python'}
            value={codes[lang] ?? ''}
            onChange={(v) => setCodes((c) => ({ ...c, [lang]: v ?? '' }))}
          />
        </div>
        <ResultPanel
          problem={p}
          result={res}
          busy={busy}
          busyType={busyType}
          onRun={() => act(runCode, 'run')}
          onSubmit={() => act(submitCode, 'submit')}
        />
      </div>
    </div>
  )
}

export default function ProblemDetail() {
  const { id } = useParams()
  const [problem, setProblem] = useState(null)
  const [neighbors, setNeighbors] = useState({ previous: null, next: null })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchProblemCatalog('CODING')
      .then((catalog) => {
        if (!active) return
        setLoadError(null)
        const index = catalog.findIndex((item) => Number(item.id) === Number(id))
        setProblem(catalog[index] || null)
        setNeighbors({
          previous: index > 0 ? catalog[index - 1] : null,
          next: index >= 0 ? catalog[index + 1] || null : null,
        })
      })
      .catch((error) => {
        console.error('Unable to load coding problem:', error)
        if (!active) return
        if (isSupabaseConfigured) {
          setProblem(null)
          setLoadError(error.message || 'Unable to load coding problem from Supabase.')
        } else {
          const catalog = getFallbackProblemCatalog('CODING')
          const index = catalog.findIndex((item) => Number(item.id) === Number(id))
          setProblem(catalog[index] || null)
          setNeighbors({
            previous: index > 0 ? catalog[index - 1] : null,
            next: index >= 0 ? catalog[index + 1] || null : null,
          })
        }
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
        <p className="mut">Loading problem...</p>
      </div>
    )
  }

  if (loadError) {
    return <div className="container center" role="alert" style={{ padding: '80px 20px' }}>Unable to load coding problem: {loadError}</div>
  }

  return problem ? <Inner key={problem.id} p={problem} neighbors={neighbors} /> : <NotFound />
}
