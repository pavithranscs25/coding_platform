import { Link } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge'
export default function ProblemCard({ p, to }) {
  return (<div className="card prob">
    <div><span className="num">#{p.id}</span><h3>{p.title}</h3></div>
    <div className="meta"><span className="tag">{p.topic}</span><DifficultyBadge level={p.difficulty} /></div>
    <p className="mut">{p.description}</p>
    <Link className="btn primary sm" to={to}>Solve</Link>
  </div>)
}
