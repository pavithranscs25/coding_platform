import TopicCard from '../components/TopicCard'
import { topics, topicGroups } from '../data/topics'
export default function Learn() {
  return (<div className="container"><h1>Learn Programming</h1><p className="mut">Master the fundamentals before solving harder problems.</p>
    {topicGroups.map((g) => <section key={g}><h2 className="group">{g}</h2><div className="grid">{topics.filter((t) => t.group === g).map((t) => <TopicCard key={t.slug} t={t} />)}</div></section>)}</div>)
}
