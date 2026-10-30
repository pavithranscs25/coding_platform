import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { topics, content } from '../data/topics'
import NotFound from './NotFound'
export default function TopicDetail() {
  const { topic } = useParams()
  const t = topics.find((x) => x.slug === topic)
  if (!t) return <NotFound />
  const c = content[t.slug]
  return (<div className="container narrow">
    <Link to="/learn" className="mut back"><ArrowLeft size={14} /> Learn</Link>
    <h1>{t.name}</h1>
    {!c ? <div className="card soon"><Clock size={32} className="mut" /><h3>Coming Soon</h3><p className="mut">Lessons for {t.name} are on the way.</p></div> : <>
      <p className="mut" style={{ fontSize: 18 }}>{c.intro}</p>
      {c.sections.map(([h, p, code]) => <section key={h}><h2>{h}</h2><p>{p}</p>{code && <pre><code>{code}</code></pre>}</section>)}
      <h2>Practice problems</h2><p className="mut">Apply what you learned.</p>
      <Link className="btn primary" to={`/problems?topic=${encodeURIComponent(t.name)}`}>Practice {t.name}</Link></>}
  </div>)
}
