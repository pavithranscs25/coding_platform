import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchUserProgressFromSupabase, subscribeToProgress } from '../services/progressService'
import { getRecentSubmissions, getSubmissionStats } from '../services/submissionService'
import { getMyProfile } from '../services/profileService'
import { fetchProblemCatalog, getFallbackProblemCatalog } from '../services/problemCatalogService'
import Profile3DBackground from '../components/Profile3DBackground'
import { Mail, LogOut, CheckCircle2, Play, Files, BadgeCheck, Code2, CalendarDays, ArrowUpRight, Activity } from 'lucide-react'
import '../styles/profile.css'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({
    loading: true,
    error: null,
    profile: null,
    progress: [],
    submissions: null,
    recentSubmissions: [],
    codingCatalog: getFallbackProblemCatalog('CODING'),
    sqlCatalog: getFallbackProblemCatalog('SQL'),
  })
  const [loggingOut, setLoggingOut] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    if (!user?.id) {
      setData({
        loading: false,
        error: null,
        profile: null,
        progress: [],
        submissions: null,
        recentSubmissions: [],
        codingCatalog: getFallbackProblemCatalog('CODING'),
        sqlCatalog: getFallbackProblemCatalog('SQL'),
      })
      return () => { isMounted = false }
    }

    async function loadProfileData() {
      setData({
        loading: true,
        error: null,
        profile: null,
        progress: [],
        submissions: null,
        recentSubmissions: [],
        codingCatalog: getFallbackProblemCatalog('CODING'),
        sqlCatalog: getFallbackProblemCatalog('SQL'),
      })
      try {
        const [profile, progress, submissions, recentSubmissions, codingCatalog, sqlCatalog] = await Promise.all([
          getMyProfile(user.id),
          fetchUserProgressFromSupabase(user.id),
          getSubmissionStats(user.id),
          getRecentSubmissions(user.id, 5),
          fetchProblemCatalog('CODING'),
          fetchProblemCatalog('SQL'),
        ])
        if (isMounted) setData({ loading: false, error: null, profile, progress, submissions, recentSubmissions, codingCatalog, sqlCatalog })
      } catch (error) {
        console.error('Unable to load profile data:', error)
        if (isMounted) setData({
          loading: false,
          error: 'Unable to load profile data. Please try again.',
          profile: null,
          progress: [],
          submissions: null,
          recentSubmissions: [],
          codingCatalog: getFallbackProblemCatalog('CODING'),
          sqlCatalog: getFallbackProblemCatalog('SQL'),
        })
      }
    }

    loadProfileData()
    const unsubscribe = subscribeToProgress(loadProfileData)

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [user?.id, refreshKey])

  const username = data.profile?.username || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.username || 'Name unavailable'
  const avatarUrl = data.profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const initial = username === 'Name unavailable' ? '?' : username.trim().charAt(0).toUpperCase()
  const solvedRows = data.progress.filter((item) => item.status === 'SOLVED' && item.problemType)
  const attemptedRows = data.progress.filter((item) => (item.status === 'ATTEMPTED' || item.status === 'SOLVED') && item.problemType)
  const difficultyBreakdown = solvedRows.reduce((counts, item) => {
    if (counts[item.difficulty] !== undefined) counts[item.difficulty] += 1
    return counts
  }, { Easy: 0, Medium: 0, Hard: 0 })
  const totalProblems = data.codingCatalog.length + data.sqlCatalog.length
  const progressPercentage = totalProblems ? Math.round((solvedRows.length / totalProblems) * 100) : 0
  const submissionStats = data.submissions || { totalSubmissions: 0, acceptedSubmissions: 0 }
  const acceptanceRate = submissionStats.totalSubmissions
    ? Math.round((submissionStats.acceptedSubmissions / submissionStats.totalSubmissions) * 100)
    : 0
  const email = data.profile?.email || user?.email || 'Email unavailable'
  const memberSince = data.profile?.created_at
    ? new Date(data.profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <main className="profile-shell">
      <Profile3DBackground />
      <div className="profile-content">
      {data.loading ? (
        <div className="profile-loading" role="status" aria-label="Loading profile">
          <div className="profile-skeleton profile-skeleton-hero" />
          <div className="profile-skeleton-grid">
            {[0, 1, 2, 3].map((item) => <div className="profile-skeleton profile-skeleton-stat" key={item} />)}
          </div>
          <div className="profile-skeleton profile-skeleton-panel" />
          <span className="mut">Loading profile...</span>
        </div>
      ) : null}
      {!data.loading && data.error ? (
        <div className="profile-error" role="alert">
          <Activity size={22} />
          <p>{data.error}</p>
          <button className="btn primary sm" onClick={() => setRefreshKey((key) => key + 1)}>Retry</button>
        </div>
      ) : null}
      {!data.loading && !data.error ? <>
      <header className="profile-hero profile-surface">
        <div className="profile-identity">
          {avatarUrl ? (
            <img className="profile-avatar" src={avatarUrl} alt={`${username}'s Google profile`} referrerPolicy="no-referrer" />
          ) : (
            <div className="profile-avatar profile-avatar-fallback" aria-label={`${username}'s profile initial`}>{initial}</div>
          )}
          <div className="profile-identity-copy">
            <span className="profile-eyebrow">Your LogicFirst Profile</span>
            <h1>{username}</h1>
            <div className="profile-email"><Mail size={15} aria-hidden="true" /><span>{email}</span></div>
            <div className="profile-meta-row">
              <span className="profile-provider"><CheckCircle2 size={14} aria-hidden="true" /> Signed in with Google</span>
              {memberSince ? <span className="profile-member"><CalendarDays size={14} aria-hidden="true" /> Member since {memberSince}</span> : null}
            </div>
          </div>
        </div>
        <div className="profile-hero-side">
          <p>Track your coding progress, submissions, and problem-solving journey.</p>
          <button type="button" className="btn sm profile-logout" onClick={handleLogout} disabled={loggingOut} aria-label="Sign out of LogicFirst">
            <LogOut size={15} aria-hidden="true" />
            <span>{loggingOut ? 'Signing out...' : 'Log out'}</span>
          </button>
        </div>
      </header>

      <section aria-labelledby="profile-stats-title">
        <div className="profile-section-heading">
          <div>
            <span className="profile-eyebrow">Your activity</span>
            <h2 id="profile-stats-title">Coding statistics</h2>
          </div>
        </div>
        <div className="profile-stat-grid">
          <article className="profile-stat-card profile-surface">
            <div className="profile-stat-icon is-success"><CheckCircle2 size={19} aria-hidden="true" /></div>
            <div className="profile-stat-value">{solvedRows.length}</div>
            <div className="profile-stat-label">Problems solved</div>
          </article>
          <article className="profile-stat-card profile-surface">
            <div className="profile-stat-icon is-accent"><Play size={18} aria-hidden="true" /></div>
            <div className="profile-stat-value">{attemptedRows.length}</div>
            <div className="profile-stat-label">Problems attempted</div>
          </article>
          <article className="profile-stat-card profile-surface">
            <div className="profile-stat-icon is-blue"><Files size={19} aria-hidden="true" /></div>
            <div className="profile-stat-value">{submissionStats.totalSubmissions}</div>
            <div className="profile-stat-label">Total submissions</div>
          </article>
          <article className="profile-stat-card profile-surface">
            <div className="profile-stat-icon is-success"><BadgeCheck size={19} aria-hidden="true" /></div>
            <div className="profile-stat-value">{submissionStats.acceptedSubmissions}</div>
            <div className="profile-stat-label">Accepted submissions</div>
          </article>
        </div>
      </section>

      <div className="profile-insight-grid">
        <section className="profile-panel profile-surface" aria-labelledby="profile-progress-title">
          <div className="profile-panel-heading">
            <div className="profile-panel-icon"><Code2 size={18} aria-hidden="true" /></div>
            <div>
              <span className="profile-eyebrow">Problem library</span>
              <h2 id="profile-progress-title">Coding progress</h2>
            </div>
          </div>
          <div className="profile-progress-summary">
            <strong>{solvedRows.length} <span>/ {totalProblems}</span></strong>
            <span className="profile-progress-percent">{progressPercentage}% complete</span>
          </div>
          <div
            className="profile-progress-track"
            role="progressbar"
            aria-label="Problems solved"
            aria-valuemin="0"
            aria-valuemax={totalProblems}
            aria-valuenow={solvedRows.length}
            aria-valuetext={`${solvedRows.length} of ${totalProblems} problems solved`}
          >
            <div className="profile-progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <p className="profile-progress-caption">Problems solved across coding and SQL practice.</p>
          <div className="profile-difficulty-list" aria-label="Solved problems by difficulty">
            {[
              ['Easy', difficultyBreakdown.Easy, 'is-easy'],
              ['Medium', difficultyBreakdown.Medium, 'is-medium'],
              ['Hard', difficultyBreakdown.Hard, 'is-hard'],
            ].map(([label, count, tone]) => (
              <div className="profile-difficulty-row" key={label}>
                <span><i className={`profile-difficulty-dot ${tone}`} />{label}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-panel profile-surface" aria-labelledby="profile-performance-title">
          <div className="profile-panel-heading">
            <div className="profile-panel-icon is-performance"><Activity size={18} aria-hidden="true" /></div>
            <div>
              <span className="profile-eyebrow">Submission quality</span>
              <h2 id="profile-performance-title">Performance</h2>
            </div>
          </div>
          <div className="profile-acceptance-rate">{acceptanceRate}<span>%</span></div>
          <p className="profile-performance-caption">Acceptance rate</p>
          <div className="profile-performance-rule" />
          <div className="profile-performance-counts">
            <div><span>Total submissions</span><strong>{submissionStats.totalSubmissions}</strong></div>
            <div><span>Accepted</span><strong>{submissionStats.acceptedSubmissions}</strong></div>
          </div>
          {submissionStats.totalSubmissions === 0 ? <p className="profile-no-submissions">Your acceptance rate will appear after your first submission.</p> : null}
        </section>
      </div>

      <section className="profile-panel profile-surface profile-activity" aria-labelledby="profile-activity-title">
        <div className="profile-activity-heading">
          <div>
            <span className="profile-eyebrow">Latest attempts</span>
            <h2 id="profile-activity-title">Recent activity</h2>
          </div>
          {data.recentSubmissions.length > 0 ? <span className="profile-activity-count">Latest {data.recentSubmissions.length}</span> : null}
        </div>
        {data.recentSubmissions.length > 0 ? (
          <div className="profile-activity-list">
            {data.recentSubmissions.map((submission) => {
              const accepted = submission.status === 'Accepted'
              const failed = ['Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded'].includes(submission.status)
              const statusTone = accepted ? 'is-accepted' : failed ? 'is-failed' : 'is-pending'
              const problemType = submission.problem_type || (submission.language === 'sql' ? 'SQL' : 'CODING')
              const problemTitle = problemType === 'SQL'
                ? data.sqlCatalog.find((problem) => Number(problem.id) === Number(submission.problem_id))?.title || `SQL problem #${submission.problem_id}`
                : data.codingCatalog.find((problem) => Number(problem.id) === Number(submission.problem_id))?.title || `Coding problem #${submission.problem_id}`

              return (
                <article className="profile-activity-row" key={submission.id}>
                  <div className={`profile-activity-mark ${statusTone}`}><Code2 size={17} aria-hidden="true" /></div>
                  <div className="profile-activity-problem">
                    <strong>{problemTitle}</strong>
                    <span>{problemType} · {submission.language}</span>
                  </div>
                  <span className={`profile-status ${statusTone}`}>
                    <i aria-hidden="true" />{submission.status}
                  </span>
                  <time className="profile-activity-time" dateTime={submission.submitted_at}>
                    {new Date(submission.submitted_at).toLocaleString()}
                  </time>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="profile-empty-state">
            <div className="profile-empty-icon"><Code2 size={22} aria-hidden="true" /></div>
            <h3>No coding activity yet.</h3>
            <p>Start solving problems to build your LogicFirst profile.</p>
            <Link className="btn primary sm" to="/problems">Explore problems <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        )}
      </section>
      </> : null}
      </div>
    </main>
  )
}

