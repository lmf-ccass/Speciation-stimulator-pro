import { useState } from 'react'
import { ROUTES } from './data/config'
import { getPath, lineageOf, checkRule } from './engine'

export default function Guide({ node, onSuggest }) {
  const [open, setOpen] = useState(false)
  const [rid, setRid] = useState(null)
  const route = ROUTES.find(r => r.id === rid)
  const path = route ? getPath(route.target) : []
  const line = lineageOf(node.clade)
  const nextIdx = path.findIndex(s => !line.includes(s.id))
  const offRoute = route && !line.every(id => path.some(s => s.id === id))

  return (
    <div className="panel">
      <button className="big" onClick={() => setOpen(o => !o)}>
        {open ? '🙈 隱藏參考進化路線' : '📖 參考進化路線'}
      </button>
      {open && (
        <div className="routebox">
          <div className="chips">
            {ROUTES.map(r => (
              <button key={r.id} className={rid === r.id ? 'on' : ''}
                onClick={() => setRid(rid === r.id ? null : r.id)}>{r.title}</button>
            ))}
          </div>
          {!route && <p>選一條路線,會告訴你每一步的科學知識和需要的壓力。路線只是參考,怎麼演化由你決定。</p>}
          {route && (
            <>
              <p className="emoji">{path.map(s => s.icon).join(' → ')}</p>
              {offRoute && <p className="err">你目前選取的物種已經偏離這條路線,可以改選樹上其他物種。</p>}
              <ol>
                {path.map((s, i) => {
                  const passed = line.includes(s.id)
                  return (
                    <li key={s.id}>
                      <b>{passed ? '✅' : i === nextIdx ? '👉' : '⬜'} {s.icon} {s.name}</b>
                      <p className="note">{s.note}</p>
                      {!passed && s.rules.length > 0 && (
                        <>
                          <ul className="checks">
                            {s.rules.map((r, k) => {
                              const x = checkRule(node, r)
                              return <li key={k} className={x.ok ? 'ok' : 'no'}>{x.ok ? '✅' : '❌'} {x.text}</li>
                            })}
                          </ul>
                          <button onClick={() => onSuggest(s.rules)}>把壓力設成這一步的建議值</button>
                        </>
                      )}
                    </li>
                  )
                })}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  )
}