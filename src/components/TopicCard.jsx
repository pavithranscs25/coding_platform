import { Link } from 'react-router-dom'
import { content } from '../data/topics'
export default function TopicCard({ t }) {
  const ready = !!content[t.slug]
  return (<Link to={`/learn/${t.slug}`} className="card"><h3>{t.name}</h3>
    <p className="mut">Learn {t.name.toLowerCase()} step by step.</p>
    <span className="tag" style={ready ? { color: 'var(--ok)' } : undefined}>{ready ? 'Available' : 'Coming soon'}</span></Link>)
}
