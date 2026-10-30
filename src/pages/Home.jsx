import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import {
  Code2,
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Database,
  Sparkles,
  Terminal,
  ShieldCheck,
  Compass,
  Layers,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../styles/home.css'

const stats = [
  { label: 'Coding Problems', value: '73+', icon: Code2, color: 'var(--ac)' },
  { label: 'SQL DB Challenges', value: '15+', icon: Database, color: '#38bdf8' },
  { label: 'XP per Hard Solve', value: '30 XP', icon: Zap, color: 'var(--ok)' },
  { label: 'Hidden Cases per Problem', value: '5 🔒', icon: Lock, color: '#f59e0b' },
  { label: 'Active Daily Streaks', value: '🔥', icon: Flame, color: 'var(--warn)' },
]

const tracks = [
  {
    title: 'Arrays & Hashing',
    desc: 'Master two pointers, hash maps, sliding windows, and prefix sums.',
    count: '18 Problems',
    link: '/problems?topic=Arrays',
    icon: '📊',
    color: 'var(--ac)',
  },
  {
    title: 'SQL & Database Engine',
    desc: 'Write real queries, joins, aggregations, and subqueries on live schemas.',
    count: '15 Problems',
    link: '/database',
    icon: '🗄️',
    color: '#38bdf8',
  },
  {
    title: 'Dynamic Programming',
    desc: 'Learn memoization, tabulations, state transitions, and knapsack variants.',
    count: '12 Problems',
    link: '/problems?topic=Dynamic%20Programming',
    icon: '⚡',
    color: 'var(--ok)',
  },
  {
    title: 'Strings & Two Pointers',
    desc: 'Solve anagrams, palindrome verification, palindromic substrings, and parsing.',
    count: '14 Problems',
    link: '/problems?topic=Strings',
    icon: '🔤',
    color: '#f59e0b',
  },
  {
    title: 'Loops & Basic Logic',
    desc: 'Perfect for beginners building foundational logic, loops, and math patterns.',
    count: '15 Problems',
    link: '/problems?topic=Loops',
    icon: '🔄',
    color: '#a855f7',
  },
  {
    title: 'Graphs & Searching',
    desc: 'Traverse graphs with BFS, DFS, Dijkstra, and cycle detection algorithms.',
    count: '9 Problems',
    link: '/problems?topic=Graphs',
    icon: '🌲',
    color: '#ec4899',
  },
]

const features = [
  {
    icon: ShieldCheck,
    title: 'Dual-Stage Test Engine',
    desc: 'Inspect sample testcases in the playground during Run. Final submissions evaluate 5 protected hidden testcases for boundary conditions and scale.',
    color: '#f59e0b',
  },
  {
    icon: Terminal,
    title: 'Multi-Language Editor',
    desc: 'Solve in Java, Python, C, or C++ with full syntax highlighting, keyboard shortcuts, and code persistence.',
    color: 'var(--ac)',
  },
  {
    icon: Database,
    title: 'Interactive SQL Playground',
    desc: 'Inspect schema tables, column types, and test your queries directly against expected result sets.',
    color: '#38bdf8',
  },
  {
    icon: Trophy,
    title: 'XP Multipliers & Ranks',
    desc: 'Earn 10 to 30 XP per problem, maintain your daily streak, and climb the public leaderboard.',
    color: 'var(--ok)',
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Choose a Challenge',
    desc: 'Browse by topic (Arrays, SQL, DP, Graphs) and select from Easy, Medium, or Hard difficulty.',
    color: 'var(--ac)',
  },
  {
    step: '02',
    title: 'Debug with Sample Cases',
    desc: 'Test your algorithm against sample inputs in the interactive console drawer with instant runtime feedback.',
    color: 'var(--ok)',
  },
  {
    step: '03',
    title: 'Pass 5 Hidden Edge Cases',
    desc: 'Submit your solution. If your code passes all 5 hidden edge cases, you earn XP and rank up on the leaderboard.',
    color: '#f59e0b',
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      <Hero />

      {/* Stats Ribbon */}
      <div
        style={{
          borderTop: '1px solid var(--bd)',
          borderBottom: '1px solid var(--bd)',
          background: 'var(--panel)',
          padding: '20px 0',
          marginBottom: 48,
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '0 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 16,
            textAlign: 'center',
          }}
        >
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Icon size={20} style={{ color }} />
              <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--tx)' }}>{value}</span>
              <span style={{ fontSize: 12, color: 'var(--mut)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="home-container">
        {/* Practice Tracks Section */}
        <div className="home-section-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ac)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            <Compass size={14} /> Curated Learning Tracks
          </div>
          <h2>Master Topic by Topic</h2>
          <p className="mut" style={{ margin: 0, fontSize: 15 }}>
            Structured collections designed to prepare you for technical interviews and competitive programming.
          </p>
        </div>

        <div className="home-tracks-grid">
          {tracks.map((t) => (
            <Link key={t.title} to={t.link} className="home-track-card">
              <div className="home-track-header">
                <span className="home-track-icon">{t.icon}</span>
                <span className="home-track-count">{t.count}</span>
              </div>
              <h3 className="home-track-title">{t.title}</h3>
              <p className="home-track-desc">{t.desc}</p>
              <div className="home-track-footer">
                <span>Start Practice</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>

        {/* Platform Capabilities (Why LogicFirst) */}
        <div className="home-section-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ok)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            <Layers size={14} /> Modern Infrastructure
          </div>
          <h2>Why Practice on LogicFirst?</h2>
          <p className="mut" style={{ margin: 0, fontSize: 15 }}>
            Built for serious engineers with anti-cheat evaluation and multi-language support.
          </p>
        </div>

        <div className="home-features-grid">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="home-feature-card">
                <div
                  className="home-feature-icon-box"
                  style={{
                    background: `color-mix(in srgb, ${f.color} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${f.color} 30%, transparent)`,
                    color: f.color,
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="home-feature-title">{f.title}</h3>
                <p className="home-feature-desc">{f.desc}</p>
              </div>
            )
          })}
        </div>

        {/* How LogicFirst Works */}
        <div className="home-section-header">
          <h2>How LogicFirst Works</h2>
          <p className="mut" style={{ margin: 0, fontSize: 15, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Three simple steps to build your skills and climb the global ranks.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 54 }}>
          {howItWorks.map(({ step, title, desc, color }) => (
            <div key={step} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: -10,
                  right: 12,
                  fontSize: 72,
                  fontWeight: 900,
                  color,
                  opacity: 0.07,
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {step}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `color-mix(in srgb, ${color} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                  color,
                  fontWeight: 800,
                  fontSize: 14,
                  marginBottom: 14,
                }}
              >
                {step}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{title}</h3>
              <p className="mut" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Card */}
        <div
          style={{
            padding: '44px 32px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--ac) 14%, var(--panel)), color-mix(in srgb, var(--ac2) 12%, var(--panel)))',
            border: '1px solid color-mix(in srgb, var(--ac) 30%, var(--bd))',
            textAlign: 'center',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ac)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
            <Sparkles size={14} /> Ready to Compete?
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(22px, 3vw, 32px)' }}>
            {user ? 'Keep Solving. Keep Climbing.' : 'Join LogicFirst & Claim Your Spot.'}
          </h2>
          <p className="mut" style={{ margin: '0 auto 24px', fontSize: 15, maxWidth: 540 }}>
            {user
              ? 'Every solved problem adds XP, extends your streak, and elevates your leaderboard ranking.'
              : 'Create a free account to track your progress, earn XP across 70+ coding & SQL problems, and compete on the global leaderboard.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/problems" className="btn primary">
              Explore 73+ Problems <ArrowRight size={15} />
            </Link>
            <Link to="/database" className="btn">
              <Database size={14} /> SQL Database Practice
            </Link>
            {!user && (
              <Link to="/login" className="btn">
                Continue with Google
              </Link>
            )}
            {user && (
              <Link to="/leaderboard" className="btn">
                <Trophy size={14} /> View Leaderboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
