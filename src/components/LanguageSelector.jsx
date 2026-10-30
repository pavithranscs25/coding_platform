export const LANGS = [
  { id: 'java', label: 'Java', monaco: 'java' },
  { id: 'python', label: 'Python', monaco: 'python' },
  { id: 'c', label: 'C', monaco: 'c' },
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
]
export default function LanguageSelector({ value, onChange }) {
  return (<label className="mut">Language:{' '}
    <select value={value} onChange={(e) => onChange(e.target.value)}>{LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>)
}
