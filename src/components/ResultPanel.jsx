import { useState, useEffect } from 'react'
import {
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Terminal,
  ChevronUp,
  ChevronDown,
  Clock,
  Cpu,
  Zap,
  Loader2,
  Play,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

function renderStatusBadge(status) {
  if (status === 'Accepted') {
    return (
      <div className="status-badge ok">
        <CheckCircle2 size={20} />
        <span>Accepted</span>
      </div>
    )
  }
  if (status === 'Compilation Error') {
    return (
      <div className="status-badge err" style={{ color: '#ef4444' }}>
        <AlertTriangle size={20} />
        <span>Compilation Error</span>
      </div>
    )
  }
  if (status === 'Runtime Error') {
    return (
      <div className="status-badge err" style={{ color: '#ef4444' }}>
        <AlertCircle size={20} />
        <span>Runtime Error</span>
      </div>
    )
  }
  if (status === 'Time Limit Exceeded') {
    return (
      <div className="status-badge warn" style={{ color: '#f59e0b' }}>
        <Clock size={20} />
        <span>Time Limit Exceeded</span>
      </div>
    )
  }
  return (
    <div className="status-badge warn" style={{ color: '#f59e0b' }}>
      <XCircle size={20} />
      <span>{status || 'Wrong Answer'}</span>
    </div>
  )
}

export default function ResultPanel({ problem, result, busy, busyType = 'run', onRun, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('testcase')
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0)

  // Auto-expand and switch to result tab whenever running or submitting, or when new results arrive
  useEffect(() => {
    if (busy) {
      setIsOpen(true)
      setActiveTab('result')
    }
  }, [busy])

  useEffect(() => {
    if (result) {
      setIsOpen(true)
      setActiveTab('result')
      setSelectedCaseIdx(0)
    }
  }, [result])

  const isDb = problem && problem.schema

  // 1 or 2 sample test cases depending on the problem
  const hasMultipleExamples = problem?.examples && problem.examples.length >= 2
  const sample1Input = problem?.examples?.[0]?.input || 'N = 5'
  const sample1Output = problem?.examples?.[0]?.output || problem?.expectedOutput || '1 2 3 4 5'

  const sampleCases = [
    {
      id: 1,
      name: 'Sample 1',
      isSample: true,
      isHidden: false,
      tag: 'Sample 1',
      input: sample1Input,
      output: sample1Output,
      expected: sample1Output,
    }
  ]

  if (hasMultipleExamples) {
    sampleCases.push({
      id: 2,
      name: 'Sample 2',
      isSample: true,
      isHidden: false,
      tag: 'Sample 2',
      input: problem.examples[1].input,
      output: problem.examples[1].output,
      expected: problem.examples[1].output,
    })
  }

  // Exactly 5 hidden test cases
  const hiddenCases = [
    {
      id: sampleCases.length + 1,
      name: 'Hidden 1',
      isSample: false,
      isHidden: true,
      tag: 'Lower Bound (Min Constraint)',
      hint: 'Checks lower bound constraint limit',
      input: '•••••••••••• (Confidential)',
      output: '•••••••••••• (Hidden)',
      expected: '•••••••••••• (Hidden)',
    },
    {
      id: sampleCases.length + 2,
      name: 'Hidden 2',
      isSample: false,
      isHidden: true,
      tag: 'Upper Bound (Max Constraint)',
      hint: 'Checks upper bound constraint limit to ensure no integer overflow',
      input: '•••••••••••• (Confidential)',
      output: '•••••••••••• (Hidden)',
      expected: '•••••••••••• (Hidden)',
    },
    {
      id: sampleCases.length + 3,
      name: 'Hidden 3',
      isSample: false,
      isHidden: true,
      tag: 'Corner Values (Zero / Negative)',
      hint: 'Validates behavior on empty, zero, or negative inputs',
      input: '•••••••••••• (Confidential)',
      output: '•••••••••••• (Hidden)',
      expected: '•••••••••••• (Hidden)',
    },
    {
      id: sampleCases.length + 4,
      name: 'Hidden 4',
      isSample: false,
      isHidden: true,
      tag: 'Duplicate & Permutations',
      hint: 'Tests repeated values and random distribution',
      input: '•••••••••••• (Confidential)',
      output: '•••••••••••• (Hidden)',
      expected: '•••••••••••• (Hidden)',
    },
    {
      id: sampleCases.length + 5,
      name: 'Hidden 5',
      isSample: false,
      isHidden: true,
      tag: 'Large Scale Stress (10⁵ Elements)',
      hint: 'Stress test with large dataset to verify time complexity (prevents TLE)',
      input: '•••••••••••• (Confidential)',
      output: '•••••••••••• (Hidden)',
      expected: '•••••••••••• (Hidden)',
    },
  ]

  const defaultTestCases = [...sampleCases, ...hiddenCases]
  const testCases = isDb ? [] : defaultTestCases
  const resultTestCases = result?.testCases || testCases

  const currentTest = testCases[selectedCaseIdx] || testCases[0]
  const currentResultTest = resultTestCases[selectedCaseIdx] || resultTestCases[0]

  return (
    <div className={`console-drawer ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="console-bar" onClick={() => !isOpen && setIsOpen(true)}>
        <div className="console-tabs">
          <button
            type="button"
            className={`console-tab ${isOpen && activeTab === 'testcase' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
              setActiveTab('testcase')
            }}
          >
            <Terminal size={14} />
            <span>{isDb ? 'Schema & Expected' : 'Testcase'}</span>
          </button>

          <button
            type="button"
            className={`console-tab ${isOpen && activeTab === 'result' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(true)
              setActiveTab('result')
            }}
          >
            {busy ? (
              <Loader2 size={13} className="spin" />
            ) : result?.status === 'Accepted' ? (
              <CheckCircle2 size={14} className="ok" />
            ) : (
              <Play size={13} />
            )}
            <span>{isDb ? 'Query Result' : 'Test Result'}</span>
            {result?.status === 'Accepted' && <span className="console-status-dot" />}
          </button>
        </div>

        <div className="console-actions">
          {!isOpen && result?.status === 'Accepted' && (
            <span className="console-preview-badge ok">
              ✓ Accepted ({result.runtime} ms)
            </span>
          )}
          <button
            type="button"
            className="console-toggle-btn"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
            title={isOpen ? 'Collapse console' : 'Expand console'}
          >
            <span className="console-toggle-label">{isOpen ? 'Console' : 'Console'}</span>
            {isOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="console-body">
          {activeTab === 'testcase' ? (
            <div className="console-pane-content">
              {isDb ? (
                /* Database Schema & Expected View */
                <div className="testcase-view">
                  <div className="case-group">
                    <span className="case-label">Expected Output Table</span>
                    <div className="scroll">
                      <table className="t">
                        <thead>
                          <tr>{problem.expected?.cols.map((c) => <th key={c}>{c}</th>)}</tr>
                        </thead>
                        <tbody>
                          {problem.expected?.rows.map((r, i) => (
                            <tr key={i}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="case-group" style={{ marginTop: 12 }}>
                    <span className="case-label">Database Tables</span>
                    {problem.schema?.map((t) => (
                      <div key={t.name} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 13, marginBottom: 4 }}><b>{t.name}</b> <span className="mut">({t.columns.join(', ')})</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Code Problem Testcase View */
                <div className="testcase-view">
                  <div className="case-pills">
                    {testCases.map((tc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`case-pill ${selectedCaseIdx === idx ? 'active' : ''} ${tc.isHidden ? 'locked-pill-btn' : ''}`}
                        onClick={() => setSelectedCaseIdx(idx)}
                      >
                        {tc.isHidden ? (
                          <>
                            <Lock size={12} className="lock-pill-icon" />
                            <span>Case {idx + 1}</span>
                            <span className="pill-mini-badge locked">Hidden</span>
                          </>
                        ) : (
                          <>
                            <span>Case {idx + 1}</span>
                            <span className="pill-mini-badge public">Public</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>

                  {currentTest && (
                    currentTest.isHidden ? (
                      /* Locked Hidden Test Case View */
                      <div className="locked-case-card">
                        <div className="locked-case-header">
                          <div className="locked-case-title">
                            <Lock size={16} className="lock-gold-icon" />
                            <span>Hidden Test Case {currentTest.id}</span>
                            <span className="locked-badge-chip">🔒 Evaluated on Submit</span>
                          </div>
                          <span className="case-tag-badge">{currentTest.tag}</span>
                        </div>

                        <p className="locked-case-hint">
                          🛡️ {currentTest.hint}. Hidden test case inputs and expected outputs are confidential to prevent hardcoded solutions.
                        </p>

                        <div className="case-group">
                          <span className="case-label">Input (Masked)</span>
                          <div className="case-box masked-box">
                            <span className="masked-dots">••••••••••••••••••••••••••••••••••••••••</span>
                            <span className="masked-indicator">
                              <Lock size={11} /> Masked by Judge
                            </span>
                          </div>
                        </div>

                        <div className="case-group" style={{ marginTop: 8 }}>
                          <span className="case-label">Expected Output (Masked)</span>
                          <div className="case-box masked-box">
                            <span className="masked-dots">••••••••••••••••••••••</span>
                            <span className="masked-indicator">
                              <Lock size={11} /> Masked by Judge
                            </span>
                          </div>
                        </div>

                        <div className="locked-case-footer">
                          <span className="mut" style={{ fontSize: 12 }}>
                            To evaluate your solution against this hidden test case, click <b>Submit</b>.
                          </span>
                          {onSubmit && (
                            <button type="button" className="btn sm primary" onClick={onSubmit}>
                              <Zap size={13} /> Submit Code
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Standard Public Test Case View */
                      <div className="case-details">
                        <div className="case-group">
                          <span className="case-label">Input</span>
                          <div className="case-box">{currentTest.input}</div>
                        </div>
                        <div className="case-group">
                          <span className="case-label">Expected Output</span>
                          <div className="case-box">{currentTest.output || currentTest.expected || problem.expectedOutput}</div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Test Result Tab View */
            <div className="console-pane-content">
              {busy ? (
                /* Loading State (Running / Judging) */
                <div className="loading-state">
                  <div className="loader-ring">
                    <Loader2 size={32} className="spin loader-icon" />
                  </div>
                  <div className="loading-text">
                    <h4>{busyType === 'submit' ? 'Judging against all test cases...' : 'Running sample test cases...'}</h4>
                    <p className="mut">
                      {busyType === 'submit'
                        ? 'Evaluating against 2 public test cases and 3 hidden edge cases...'
                        : 'Executing solution against visible sample cases...'}
                    </p>
                  </div>
                </div>
              ) : !result ? (
                /* Initial Unrun State */
                <div className="empty-state">
                  <Terminal size={32} className="mut" />
                  <h4>You must run your code first</h4>
                  <p className="mut">Run your solution to test sample cases, or Submit to evaluate hidden boundary tests.</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {onRun && (
                      <button type="button" className="btn sm" onClick={onRun}>
                        <Play size={14} /> Run Code
                      </button>
                    )}
                    {onSubmit && (
                      <button type="button" className="btn sm primary" onClick={onSubmit}>
                        <Zap size={14} /> Submit Code
                      </button>
                    )}
                  </div>
                </div>
              ) : result.type === 'run' ? (
                /* Real Run Result */
                <div className="result-view">
                  <div className="status-row">
                    {renderStatusBadge(result.status)}
                    <div className="runtime-pill">
                      <Clock size={13} />
                      <span>Runtime: <b>{result.runtime} ms</b></span>
                    </div>
                  </div>

                  {result.status === 'Compilation Error' ? (
                    /* Compilation Error View */
                    <div className="compiler-err-card" style={{ marginTop: 12 }}>
                      <div className="compiler-err-header">
                        <AlertTriangle size={15} style={{ color: '#ef4444' }} />
                        <span>Compilation Error Output</span>
                      </div>
                      <pre className="compiler-err-pre">
                        {result.error || currentResultTest?.output || currentResultTest?.error}
                      </pre>
                    </div>
                  ) : (
                    /* Normal, Wrong Answer, or Runtime Error Run Result */
                    <>
                      {/* Runtime Error Banner if present */}
                      {(result.status === 'Runtime Error' || currentResultTest?.stderr || currentResultTest?.error) && (
                        <div className="runtime-err-card" style={{ marginTop: 12 }}>
                          <div className="runtime-err-header">
                            <AlertCircle size={15} style={{ color: '#ef4444' }} />
                            <span>Runtime Error (Execution Traceback)</span>
                          </div>
                          <p className="runtime-err-hint">
                            Your code encountered an exception while running on the test input. See traceback below:
                          </p>
                          <pre className="compiler-err-pre">
                            {currentResultTest?.stderr || currentResultTest?.error || result.error || 'Execution stopped with a non-zero exit code (NZEC).'}
                          </pre>
                        </div>
                      )}

                      {/* Wrong Answer Banner if mismatch */}
                      {result.status === 'Wrong Answer' && !currentResultTest?.stderr && (
                        <div className="wrong-answer-card" style={{ marginTop: 12 }}>
                          <div className="wrong-answer-header">
                            <XCircle size={15} style={{ color: '#fbbf24' }} />
                            <span>Output Mismatch</span>
                          </div>
                          <p className="wrong-answer-hint">
                            Your code ran successfully, but the output did not match the expected answer. Compare Your Output and Expected Output below.
                          </p>
                        </div>
                      )}

                      {/* Status summary banner */}
                      <div className="run-testcase-banner" style={{ marginTop: 10 }}>
                        {result.status === 'Accepted' ? (
                          <CheckCircle2 size={15} style={{ color: 'var(--ok)', flexShrink: 0 }} />
                        ) : result.status === 'Runtime Error' ? (
                          <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
                        ) : (
                          <XCircle size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
                        )}
                        <div className="run-testcase-banner-text">
                          <b>{result.passed} of {result.total} Sample Test Cases Passed.</b>
                          <span className="mut" style={{ marginLeft: 6 }}>
                            {result.status === 'Accepted'
                              ? 'Sample cases passed! Click Submit to evaluate all 5 hidden test cases.'
                              : result.status === 'Runtime Error'
                              ? 'Fix the runtime exception above, then Run again.'
                              : 'Adjust your output formatting to match the sample test case.'}
                          </span>
                        </div>
                      </div>

                      <div className="case-pills" style={{ marginTop: 8 }}>
                        {resultTestCases.map((tc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`case-pill ${selectedCaseIdx === idx ? 'active' : ''}`}
                            onClick={() => setSelectedCaseIdx(idx)}
                          >
                            <span className={`case-dot ${tc.pass ? 'pass' : 'fail'}`} />
                            {tc.name || `Sample ${idx + 1}`}
                            <span className="pill-mini-badge public">Sample</span>
                          </button>
                        ))}
                      </div>

                      {currentResultTest && (
                        <div className="case-details">
                          <div className="case-group">
                            <span className="case-label">Input</span>
                            <div className="case-box">{currentResultTest.input}</div>
                          </div>
                          <div className="case-group">
                            <span className="case-label">Your Output</span>
                            <div className={`case-box ${currentResultTest.pass ? 'pass-border' : 'fail-border'}`}>
                              {currentResultTest.output ? (
                                currentResultTest.output
                              ) : (
                                <span style={{ color: 'var(--mut)', fontStyle: 'italic' }}>
                                  (No output printed to stdout)
                                </span>
                              )}
                            </div>
                          </div>
                          {currentResultTest.expected && (
                            <div className="case-group">
                              <span className="case-label">Expected Output</span>
                              <div className="case-box">{currentResultTest.expected}</div>
                            </div>
                          )}
                          {currentResultTest.stderr && (
                            <div className="case-group">
                              <span className="case-label" style={{ color: '#ef4444' }}>Standard Error (stderr)</span>
                              <div className="case-box fail-border" style={{ color: '#fca5a5' }}>
                                {currentResultTest.stderr}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="real-engine-badge">
                    <Zap size={12} style={{ color: 'var(--ok)' }} />
                    <span>Real-time Judge0 Execution ({result.runtime} ms)</span>
                  </div>
                </div>
              ) : result.type === 'submit' ? (
                /* Real Submit Result with Hidden Test Cases Breakdown */
                <div className="result-view">
                  <div className="submit-banner">
                    {renderStatusBadge(result.status)}
                    <div className="passed-counter">
                      <b>{result.passed} / {result.total}</b> testcases passed
                      <span className="passed-sub-breakdown"> ({result.sampleCount || 1} Sample • 5 Hidden 🔒)</span>
                    </div>
                  </div>

                  {result.status === 'Compilation Error' ? (
                    <div className="compiler-err-card" style={{ marginTop: 12 }}>
                      <div className="compiler-err-header">
                        <AlertTriangle size={15} style={{ color: '#ef4444' }} />
                        <span>Compilation Error Output</span>
                      </div>
                      <pre className="compiler-err-pre">{result.error}</pre>
                    </div>
                  ) : (
                    <>
                      <div className="case-review-section">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="case-label" style={{ margin: 0 }}>Evaluated Test Suite</span>
                          <span style={{ fontSize: 11, color: result.status === 'Accepted' ? 'var(--ok)' : '#f59e0b', fontWeight: 600 }}>
                            <ShieldCheck size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            {result.status === 'Accepted' ? 'All hidden edge cases passed' : 'Evaluation completed'}
                          </span>
                        </div>

                        <div className="case-pills">
                          {resultTestCases.map((tc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`case-pill sm ${selectedCaseIdx === idx ? 'active' : ''} ${tc.isHidden ? 'locked-pill-btn' : ''}`}
                              onClick={() => setSelectedCaseIdx(idx)}
                            >
                              <Check size={12} className={tc.pass ? 'ok' : 'err'} />
                              {tc.isHidden ? (
                                <>
                                  <Lock size={10} className="lock-pill-icon" />
                                  {tc.name || `Hidden ${idx + 1}`}
                                  <span className="pill-mini-badge locked">Hidden</span>
                                </>
                              ) : (
                                <>
                                  {tc.name || `Sample ${idx + 1}`}
                                  <span className="pill-mini-badge public">Sample</span>
                                </>
                              )}
                            </button>
                          ))}
                        </div>

                        {currentResultTest && (
                          currentResultTest.isHidden ? (
                            /* Evaluated Hidden Test Case Details */
                            <div className="evaluated-hidden-card" style={{ marginTop: 10 }}>
                              <div className="evaluated-hidden-header">
                                <div className="evaluated-title">
                                  <Lock size={14} className="lock-gold-icon" />
                                  <b>Case {currentResultTest.id}: {currentResultTest.tag}</b>
                                  <span className="passed-badge-chip">
                                    <CheckCircle2 size={11} /> Verified by Judge
                                  </span>
                                </div>
                                <span className="mut" style={{ fontSize: 12 }}>{currentResultTest.hint}</span>
                              </div>

                              <div className="evaluated-grid">
                                <div className="case-group">
                                  <span className="case-label">Test Case Input</span>
                                  <div className="case-box sm masked-result-box">
                                    <span className="masked-dots">••••••••••••••••••••••••••••••••••••••••</span>
                                    <span className="masked-indicator">
                                      <Lock size={10} /> Edge Case Masked
                                    </span>
                                  </div>
                                </div>

                                <div className="case-group">
                                  <span className="case-label">Evaluation Verdict</span>
                                  <div className="case-box sm pass-border" style={{ color: currentResultTest.pass ? 'var(--ok)' : '#ef4444', fontWeight: 600 }}>
                                    {currentResultTest.pass ? '✓ Output Matched Expected (0 Error, No TLE)' : '✗ Testcase Mismatch'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Evaluated Public Test Case Details */
                            <div className="case-details" style={{ marginTop: 10 }}>
                              <div className="case-group">
                                <span className="case-label">Input</span>
                                <div className="case-box sm">{currentResultTest.input}</div>
                              </div>
                              <div className="case-group">
                                <span className="case-label">Output</span>
                                <div className={`case-box sm ${currentResultTest.pass ? 'pass-border' : 'fail-border'}`}>
                                  {currentResultTest.output}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}

                  <div className="real-engine-badge">
                    <Zap size={12} style={{ color: 'var(--ok)' }} />
                    <span>Real-time Judge0 Execution ({result.runtime} ms)</span>
                  </div>
                </div>
              ) : (
                /* Real Database Query Result */
                <div className="result-view">
                  <div className="status-row">
                    {renderStatusBadge(result.status)}
                    <div className="runtime-pill">
                      <Clock size={13} />
                      <span>Runtime: <b>{result.runtime} ms</b></span>
                    </div>
                  </div>

                  {result.status === 'Runtime Error' || result.error ? (
                    /* SQL Syntax or Runtime Error */
                    <div className="compiler-err-card" style={{ marginTop: 12 }}>
                      <div className="compiler-err-header">
                        <AlertCircle size={15} style={{ color: '#ef4444' }} />
                        <span>SQL Query Error</span>
                      </div>
                      <pre className="compiler-err-pre">{result.error || result.message}</pre>
                    </div>
                  ) : (
                    /* Query Table Output */
                    <>
                      {result.message && (
                        <div style={{ fontSize: 13, color: result.status === 'Accepted' ? 'var(--ok)' : 'var(--warn)', margin: '8px 0' }}>
                          {result.message}
                        </div>
                      )}
                      <div className="scroll" style={{ marginTop: 8 }}>
                        <table className="t">
                          <thead>
                            <tr>{result.cols?.map((c) => <th key={c}>{c}</th>)}</tr>
                          </thead>
                          <tbody>
                            {result.rows?.map((r, i) => (
                              <tr key={i}>{r.map((v, j) => <td key={j}>{v === null ? '<null>' : String(v)}</td>)}</tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  <div className="real-engine-badge">
                    <Zap size={12} style={{ color: '#38bdf8' }} />
                    <span>In-Browser SQLite WebAssembly Engine ({result.runtime} ms)</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

