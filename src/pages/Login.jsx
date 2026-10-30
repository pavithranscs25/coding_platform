import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Code2, Loader2, AlertCircle } from 'lucide-react'

export default function Login() {
  const { signInWithGoogle, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [authLoading, user, navigate])

  const handleGoogleClick = async () => {
    setError('')
    setLoading(true)

    try {
      await signInWithGoogle()
    } catch (err) {
      const msg = err?.message || 'Google authentication failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container narrow" style={{ minHeight: 'calc(100vh - 160px)', display: 'grid', placeItems: 'center', padding: '40px 20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/" className="logo" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <Code2 size={24} />Logic<span>First</span>
          </Link>
          <h2 style={{ margin: '8px 0 4px', fontSize: 24 }}>Welcome to LogicFirst</h2>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 14px', background: 'color-mix(in srgb, var(--err) 15%, transparent)', border: '1px solid var(--err)', borderRadius: 8, color: 'var(--err)', fontSize: 13, marginBottom: 18 }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleClick}
          className="btn"
          disabled={loading || authLoading}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: 10,
            gap: 10,
            background: 'var(--panel2)',
            border: '1px solid var(--bd)',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin" /> Connecting...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 10.02 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>
    </div>
  )
}

