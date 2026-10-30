import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Zap, Trophy, CheckCircle2, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Hero() {
  const { user } = useAuth()

  return (
    <section className="hero home-hero" style={{ paddingBottom: 60 }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 99,
        background: 'color-mix(in srgb, var(--ac) 15%, transparent)',
        border: '1px solid color-mix(in srgb, var(--ac) 40%, transparent)',
        color: 'var(--ac)',
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 22,
      }}>
        <Zap size={13} />
        LogicFirst — Think Better. Code Smarter.
      </div>

      <h1>Master</h1>
      <h1 className="home-kinetic-title">Competitive Coding</h1>
      <h2 style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', marginTop: 8, marginBottom: 16, fontWeight: 400 }}>
        Practice problems, track your XP, and compete on the leaderboard.
      </h2>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        {['73 Coding Problems', 'SQL Practice', 'XP & Streaks', 'Real-time Rankings'].map((f) => (
          <span key={f} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 12px',
            borderRadius: 99,
            border: '1px solid var(--bd)',
            background: 'var(--panel)',
            fontSize: 12,
            color: 'var(--mut)',
            fontWeight: 500,
          }}>
            <CheckCircle2 size={12} style={{ color: 'var(--ok)' }} /> {f}
          </span>
        ))}
      </div>

      <div className="cta">
        <Link className="btn primary" to="/problems">
          Start Solving <ArrowRight size={16} />
        </Link>
        {user ? (
          <Link className="btn" to="/dashboard">
            My Dashboard <ChevronRight size={16} />
          </Link>
        ) : (
          <Link className="btn" to="/login">
            Continue with Google
          </Link>
        )}
      </div>
    </section>
  )
}
