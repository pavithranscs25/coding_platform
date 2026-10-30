import { Link } from 'react-router-dom'
export default function NotFound() {
  return (<div className="container center" style={{ padding: '100px 20px' }}><h1 style={{ fontSize: 64, margin: 0 }}>404</h1><p className="mut">This page doesn't exist.</p><Link className="btn primary" to="/">Back to Home</Link></div>)
}
