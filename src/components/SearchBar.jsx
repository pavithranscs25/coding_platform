import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { topics } from '../data/topics'
import { fetchProblemCatalog, getFallbackProblemCatalog } from '../services/problemCatalogService'

const topicEntries = topics.map((topic) => ({ k: 'Topic', t: topic.name, to: `/learn/${topic.slug}` }))

export default function SearchBar() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [problemEntries, setProblemEntries] = useState(() => [
    ...getFallbackProblemCatalog('CODING').map((problem) => ({ k: 'Problem', t: problem.title, to: `/problems/${problem.id}` })),
    ...getFallbackProblemCatalog('SQL').map((problem) => ({ k: 'SQL', t: problem.title, to: `/database/problems/${problem.id}` })),
  ])
  const nav = useNavigate()

  useEffect(() => {
    if (!open) return undefined
    let active = true
    Promise.all([fetchProblemCatalog('CODING'), fetchProblemCatalog('SQL')])
      .then(([codingProblems, sqlProblems]) => {
        if (!active) return
        setProblemEntries([
          ...codingProblems.map((problem) => ({ k: 'Problem', t: problem.title, to: `/problems/${problem.id}` })),
          ...sqlProblems.map((problem) => ({ k: 'SQL', t: problem.title, to: `/database/problems/${problem.id}` })),
        ])
      })
      .catch((error) => console.error('Unable to load problem search catalog:', error))

    return () => { active = false }
  }, [open])

  const all = useMemo(() => [...topicEntries, ...problemEntries], [problemEntries])
  const res = useMemo(() => (q.trim() ? all.filter((result) => result.t.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : []), [all, q])
  const go = (to) => { nav(to); setOpen(false); setQ('') }
  return (<div className="search">
    <button className="icon" onClick={() => setOpen(!open)} aria-label="Search"><Search size={18} /></button>
    {open && <div className="pop"><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search LogicFirst..." />
      {q.trim() && <ul>{res.length ? res.map((r) => <li key={r.to} onClick={() => go(r.to)}><span>{r.t}</span><em>{r.k}</em></li>) : <li className="none">No results</li>}</ul>}</div>}
  </div>)
}
