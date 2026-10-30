import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProblemPager({ previous, next, basePath }) {
  return (
    <nav className="problem-pager" aria-label="Problem navigation">
      {previous ? (
        <Link className="problem-pager-link" to={`${basePath}/${previous.id}`} aria-label={`Previous problem: ${previous.title}`}>
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Previous</span>
        </Link>
      ) : (
        <button className="problem-pager-link" type="button" disabled aria-label="No previous problem">
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Previous</span>
        </button>
      )}
      {next ? (
        <Link className="problem-pager-link" to={`${basePath}/${next.id}`} aria-label={`Next problem: ${next.title}`}>
          <span>Next</span>
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <button className="problem-pager-link" type="button" disabled aria-label="No next problem">
          <span>Next</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </nav>
  )
}