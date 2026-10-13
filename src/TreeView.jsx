import { byId, displayName, MAX_NODES } from './engine'

function Item({ n, nodes, selId, onSelect, onDelete }) {
  const kids = nodes.filter(x => x.parent === n.id)
  const sp = byId[n.clade]
  return (
    <li>
      <div className={`node done ${selId === n.id ? 'sel' : ''}`}>
        <span className="ico">{sp.icon}</span>
        <b>{displayName(n)}</b>
        <span className="tag">{sp.name}・第 {n.gen} 代</span>
        {selId !== n.id && <button onClick={() => onSelect(n.id)}>選取</button>}
        {n.parent && kids.length === 0 && <button onClick={() => onDelete(n.id)}>🗑</button>}
      </div>
      {kids.length > 0 && (
        <ul>{kids.map(k => <Item key={k.id} n={k} nodes={nodes} selId={selId} onSelect={onSelect} onDelete={onDelete} />)}</ul>
      )}
    </li>
  )
}

export default function TreeView({ nodes, selId, onSelect, onDelete, onReset }) {
  const root = nodes.find(n => !n.parent)
  return (
    <div className="panel tree">
      <h2>🌳 我的演化樹 <small>{nodes.length} / {MAX_NODES} 個物種</small></h2>
      <ul><Item n={root} nodes={nodes} selId={selId} onSelect={onSelect} onDelete={onDelete} /></ul>
      <button onClick={onReset}>重新開始</button>
    </div>
  )
}