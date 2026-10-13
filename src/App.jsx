import { useState } from 'react'
import { makeRoot, makeChild, evolve, evolveAuto, suggest, clone, MAX_NODES } from './engine'
import TreeView from './TreeView'
import Guide from './Guide'
import Preview from './Preview'
import EvoPanel from './EvoPanel'
import Controls from './Controls'

export default function App() {
  const [nodes, setNodes] = useState(() => [makeRoot()])
  const [selId, setSelId] = useState(() => nodes[0].id)
  const [auto, setAuto] = useState(true)
  const [notes, setNotes] = useState([])
  const node = nodes.find(n => n.id === selId) || nodes[0]

  const mapSel = (fn) => setNodes(ns => ns.map(n => (n.id === node.id ? fn(n) : n)))
  const patch = (fn) => mapSel(n => { const c = clone(n); fn(c); return c })
  const onSuggest = (rules) => mapSel(n => suggest(n, rules))
  const rename = (v) => patch(n => { n.name = v.trim() ? v : null })

  const run = (k) => {
    if (!auto) {
      mapSel(n => evolve(n, k))
      setNotes([])
      return
    }
    const r = evolveAuto(node, k, nodes.length)
    setNodes(ns => [...ns.map(n => (n.id === node.id ? r.nodes[0] : n)), ...r.nodes.slice(1)])
    setSelId(r.nodes[r.nodes.length - 1].id)
    setNotes(r.notes)
  }

  const branch = (cladeId) => {
    if (nodes.length >= MAX_NODES) return
    const child = makeChild(node, cladeId)
    setNodes(ns => [...ns, child])
    setSelId(child.id)
    setNotes([])
  }
  const del = (id) => {
    const t = nodes.find(n => n.id === id)
    if (!t || !t.parent) return
    setNodes(ns => ns.filter(n => n.id !== id))
    if (selId === id) setSelId(t.parent)
  }
  const reset = () => {
    if (!window.confirm('確定要清空整棵演化樹重新開始嗎?')) return
    const r = makeRoot()
    setNodes([r]); setSelId(r.id); setNotes([])
  }

  return (
    <div className="app">
      <header>
        <h1>🧬 同源分歧演化模擬器</h1>
        <span>從一條魚開始,用壓力和世代創造你的新物種</span>
      </header>
      <div className="cols">
        <div>
          <TreeView nodes={nodes} selId={node.id} onSelect={setSelId} onDelete={del} onReset={reset} />
          <Guide node={node} onSuggest={onSuggest} />
        </div>
        <div>
          <Preview node={node} onRename={rename} />
          <EvoPanel node={node} count={nodes.length} auto={auto} onAuto={setAuto}
            notes={notes} onRun={run} onBranch={branch} />
          <Controls node={node} patch={patch} />
        </div>
      </div>
    </div>
  )
}