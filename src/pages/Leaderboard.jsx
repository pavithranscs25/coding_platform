import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLeaderboard } from '../services/leaderboardService'
import { Medal, Trophy, Zap, CheckCircle2, ArrowRight, RefreshCw, Users } from 'lucide-react'
import Leaderboard3DScene from '../components/Leaderboard3DScene'
import '../styles/leaderboard.css'

function UserAvatar({ entry }) {
  if (entry.avatarUrl) {
    return <img className="leaderboard-avatar" src={entry.avatarUrl} alt="" referrerPolicy="no-referrer" />
  }

  return <span className="leaderboard-avatar leaderboard-avatar-fallback" aria-hidden="true">
    {entry.username.charAt(0).toUpperCase()}
  </span>
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const rows = await getLeaderboard()
      setLeaderboard(rows)
    } catch (loadError) {
      console.error('Unable to load leaderboard:', loadError)
      setLeaderboard([])
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard, user?.id, refreshKey])

  const currentEntry = leaderboard.find((entry) => entry.id === user?.id)
  const podium = leaderboard.slice(0, 3)
  const highestXp = leaderboard[0]?.totalXp || 0

  return (
    <main className="leaderboard-page">
      <div className="leaderboard-content">
        <header className="leaderboard-hero">
          <div className="leaderboard-hero-copy">
            <span className="leaderboard-kicker"><Trophy size={15} aria-hidden="true" /> LogicFirst standings</span>
            <h1>Climb the ranks.<br /><span>Own your progress.</span></h1>
            <p>Every solved challenge adds XP. Keep learning, keep solving, and earn your place among the community.</p>
            <div className="leaderboard-hero-meta">
              <span><Users size={14} aria-hidden="true" /> {loading ? 'Loading rankings' : `${leaderboard.length} ranked learners`}</span>
              <span><Zap size={14} aria-hidden="true" /> {leaderboard[0] ? `${leaderboard[0].totalXp} XP to beat` : 'XP sets your rank'}</span>
            </div>
          </div>
          <div className="leaderboard-hero-stage" aria-label="3D illustration of the top three leaderboard ranks">
            <div className="leaderboard-stage-grid" aria-hidden="true" />
            <Leaderboard3DScene />
            <div className="leaderboard-stage-caption" aria-hidden="true"><span>02</span><span>01</span><span>03</span></div>
          </div>
        </header>

        {!loading && !error && !currentEntry ? (
          <aside className="leaderboard-current-note">
            <div className="leaderboard-note-icon"><Users size={18} aria-hidden="true" /></div>
            <div>
              <strong>Solve your first problem to join the leaderboard.</strong>
              <span>Your first accepted solution earns a ranked place.</span>
            </div>
            <Link to="/problems" className="btn primary sm">Explore problems <ArrowRight size={14} aria-hidden="true" /></Link>
          </aside>
        ) : null}

        {loading ? (
          <section className="leaderboard-loading" role="status" aria-label="Loading leaderboard">
            <span className="mut">Loading leaderboard...</span>
            <div className="leaderboard-skeleton-podium">
              {[0, 1, 2].map((item) => <div className="leaderboard-skeleton" key={item} />)}
            </div>
            <div className="leaderboard-skeleton leaderboard-skeleton-table" />
          </section>
        ) : error ? (
          <section className="leaderboard-state leaderboard-error" role="alert">
            <h2>Unable to load leaderboard. Please try again.</h2>
            <button type="button" className="btn primary" onClick={() => setRefreshKey((key) => key + 1)}>
              <RefreshCw size={15} aria-hidden="true" /> Retry
            </button>
          </section>
        ) : leaderboard.length === 0 ? (
          <section className="leaderboard-state">
            <div className="leaderboard-empty-icon"><Trophy size={25} aria-hidden="true" /></div>
            <h2>No rankings yet.</h2>
            <p>Be the first to solve a problem and appear on the leaderboard.</p>
            <Link to="/problems" className="btn primary">Explore problems <ArrowRight size={15} aria-hidden="true" /></Link>
          </section>
        ) : (
          <>
            {currentEntry ? (
              <section className="leaderboard-your-rank" aria-label="Your leaderboard position">
                <div className="leaderboard-rank-mark"><Trophy size={19} aria-hidden="true" /></div>
                <div className="leaderboard-your-rank-copy">
                  <span>Your ranking</span>
                  <strong>Rank #{currentEntry.rank} of {leaderboard.length}</strong>
                </div>
                <div className="leaderboard-your-rank-metric"><CheckCircle2 size={15} aria-hidden="true" /> {currentEntry.problemsSolved} solved</div>
                <div className="leaderboard-your-rank-xp"><Zap size={15} aria-hidden="true" /> {currentEntry.totalXp} XP</div>
              </section>
            ) : null}

            {podium.length > 0 ? (
              <section className="leaderboard-podium" aria-label="Top three ranked users">
                {podium.map((entry) => (
                  <article className={`leaderboard-podium-card rank-${entry.rank}${entry.id === user?.id ? ' is-current' : ''}`} key={entry.id}>
                    <span className="leaderboard-medal"><Medal size={16} aria-hidden="true" /> Rank {entry.rank}</span>
                    <UserAvatar entry={entry} />
                    <strong className="leaderboard-podium-name">{entry.username}</strong>
                    {entry.id === user?.id ? <span className="leaderboard-you-tag">YOU</span> : null}
                    <span className="leaderboard-podium-solved">{entry.problemsSolved} solved</span>
                    <span className="leaderboard-podium-xp"><Zap size={14} aria-hidden="true" /> {entry.totalXp} XP</span>
                  </article>
                ))}
              </section>
            ) : null}

            <section className="leaderboard-table-card" aria-label="Leaderboard rankings">
              <div className="leaderboard-table-heading">
                <div><span className="leaderboard-kicker">All ranked users</span><h2>Rankings</h2></div>
                <div className="leaderboard-table-summary">
                  <span>{leaderboard.length} {leaderboard.length === 1 ? 'user' : 'users'}</span>
                  <small>XP shown relative to #1</small>
                </div>
              </div>
              <table className="leaderboard-table">
                <thead>
                  <tr><th scope="col">Rank</th><th scope="col">User</th><th scope="col">Solved</th><th scope="col">XP</th></tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => {
                    const isCurrent = entry.id === user?.id
                    const xpPercent = highestXp ? Math.round((entry.totalXp / highestXp) * 100) : 0
                    return (
                      <tr className={isCurrent ? 'is-current' : ''} key={entry.id}>
                        <td><span className={`leaderboard-rank-number rank-${entry.rank}`}>{entry.rank}</span></td>
                        <td>
                          <div className="leaderboard-user-cell">
                            <UserAvatar entry={entry} />
                            <strong>{entry.username}</strong>
                            {isCurrent ? <span className="leaderboard-you-tag">YOU</span> : null}
                          </div>
                        </td>
                        <td><span className="leaderboard-solved-cell"><CheckCircle2 size={15} aria-hidden="true" /> {entry.problemsSolved}</span></td>
                        <td>
                          <span className="leaderboard-xp-cell">
                            <span className="leaderboard-xp-value"><Zap size={15} aria-hidden="true" /> {entry.totalXp} XP</span>
                            <span className="leaderboard-xp-track" aria-hidden="true"><span style={{ width: `${xpPercent}%` }} /></span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

