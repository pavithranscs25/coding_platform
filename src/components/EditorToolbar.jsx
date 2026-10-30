import { RotateCcw, Play, Send } from 'lucide-react'
import LanguageSelector from './LanguageSelector'
export default function EditorToolbar({ language, onLanguage, onReset, onRun, onSubmit, runLabel = 'Run', busy }) {
  return (<div className="tb">
    {onLanguage ? <LanguageSelector value={language} onChange={onLanguage} /> : <span className="mut">Language: SQL</span>}
    <div className="sp">
      <button className="btn sm" onClick={onReset}><RotateCcw size={14} /> Reset</button>
      <button className="btn sm" onClick={onRun} disabled={busy}><Play size={14} /> {runLabel}</button>
      {onSubmit && <button className="btn sm ok" onClick={onSubmit} disabled={busy}><Send size={14} /> Submit</button>}
    </div></div>)
}
