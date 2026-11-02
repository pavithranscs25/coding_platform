import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, User, Menu, X, Code2, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import SearchBar from './SearchBar'

const navLinks = [
  ['/', 'Home'],
  // ['/learn', 'Learn'],  // temporarily hidden — re-add when Learn section is ready
  ['/problems', 'Coding'],
  ['/database', 'Database'],
  ['/leaderboard', 'Leaderboard'],
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [light, setLight] = useState(false)

  const toggle = () => {
    const n = !light
    setLight(n)
    document.documentElement.dataset.theme = n ? 'light' : 'dark'
  }

  const handleLogout = async () => {
    setOpen(false)
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const username =
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'User'

  return (
    <header className="nav">
      <div className="nav-in">
        <Link to="/" className="logo">
          <Code2 size={20} />Logic<span>First</span>
        </Link>

        <nav className={'links' + (open ? ' open' : '')}>
          {navLinks.map(([to, l]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
            >
              {l}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink
                to="/profile"
                style={{ display: open ? 'block' : 'none' }}
                onClick={() => setOpen(false)}
              >
                Profile
              </NavLink>
              <button
                type="button"
                className="btn sm"
                style={{ display: open ? 'inline-flex' : 'none', margin: '8px 14px' }}
                onClick={handleLogout}
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="btn sm primary"
              style={{ display: open ? 'inline-flex' : 'none', margin: '8px 14px' }}
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
          )}
        </nav>

        <div className="nav-r">
          <SearchBar />
          <button className="icon" onClick={toggle} aria-label="Toggle theme">
            {light ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="avatar" title={`Signed in as ${username}`}>
                {username ? username.charAt(0).toUpperCase() : <User size={16} />}
              </Link>
              <button
                type="button"
                className="btn sm"
                onClick={handleLogout}
                style={{ marginLeft: 4 }}
                title="Sign out of LogicFirst"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn sm primary" style={{ marginLeft: 4 }}>
              Sign In
            </Link>
          )}

          <button
            className="icon burger"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
