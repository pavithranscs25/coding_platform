import { Link } from 'react-router-dom'
import { ArrowRight, Braces, Database as DatabaseIcon, Table2 } from 'lucide-react'
import { sqlCategories } from '../data/databaseProblems'

const topicCount = sqlCategories.reduce((total, [, items]) => total + items.length, 0)

export default function Database() {
  return (
    <main className="container database-page">
      <section className="database-hero">
        <div className="database-hero-copy">
          <p className="database-eyebrow"><DatabaseIcon size={15} /> DATABASE LEARNING</p>
          <h1>Think in queries.<br /><span>Work with data.</span></h1>
          <p className="database-intro">Build practical SQL skills, from the first SELECT to joins, aggregations, and beyond.</p>
          <div className="database-hero-actions">
            <Link className="btn primary" to="/database/problems">Practice SQL problems <ArrowRight size={17} /></Link>
            <span className="database-availability"><span /> Interactive exercises available</span>
          </div>
          <div className="database-stats" aria-label={`${sqlCategories.length} learning tracks and ${topicCount} SQL concepts`}>
            <span><strong>{sqlCategories.length}</strong> learning tracks</span>
            <i />
            <span><strong>{topicCount}</strong> SQL concepts</span>
          </div>
        </div>

        <div className="database-preview" aria-label="Example SQL query and database tables">
          <div className="database-preview-top">
            <span className="database-preview-icon"><Braces size={17} /></span>
            <div><strong>Query workspace</strong><small>SQL · employees</small></div>
            <span className="database-live-dot" title="Example query" />
          </div>
          <div className="database-code" aria-label="Example SQL query">
            <span className="database-line-no">01</span><code><b>SELECT</b> id, name, salary</code>
            <span className="database-line-no">02</span><code><b>FROM</b> employees</code>
            <span className="database-line-no">03</span><code><b>WHERE</b> salary &gt; <em>50000</em>;</code>
          </div>
          <div className="database-preview-divider" />
          <div className="database-schema-title"><Table2 size={15} /><span>Connected tables</span><span className="database-schema-count">2</span></div>
          <div className="database-schema-list">
            <div><DatabaseIcon size={14} /><strong>employees</strong><span>6 rows</span></div>
            <div><DatabaseIcon size={14} /><strong>departments</strong><span>3 rows</span></div>
          </div>
        </div>
      </section>

      <section className="database-curriculum" aria-labelledby="database-curriculum-title">
        <header className="database-section-heading">
          <div>
            <p className="database-eyebrow">LEARNING PATH</p>
            <h2 id="database-curriculum-title">Explore SQL topics</h2>
          </div>
          <p className="mut">A clear path from fundamentals to advanced techniques.</p>
        </header>

        <div className="database-track-list">
          {sqlCategories.map(([group, items], groupIndex) => (
            <section className="database-track" key={group}>
              <div className="database-track-heading">
                <span className="database-track-index">0{groupIndex + 1}</span>
                <div><h3>{group}</h3><span>{items.length} concepts</span></div>
              </div>
              <div className="database-topic-grid">
                {items.map((item) => (
                  <div className="database-topic" key={item}>
                    <span className="database-topic-code"><Braces size={14} /></span>
                    <span className="database-topic-name">{item}</span>
                    <span className="database-coming-soon">Coming soon</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}