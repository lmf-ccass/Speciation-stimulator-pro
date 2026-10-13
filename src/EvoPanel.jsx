import { LEVELS, TRAITS } from './data/config'
import { targetsOf, branchOptions, MAX_NODES } from './engine'

export default function EvoPanel({ node, count, auto, onAuto, notes, onRun, onBranch }) {
  const { t, gated } = targetsOf(node)
  const opts = branchOptions(node)
  const full = count >= MAX_NODES
  const rows = [
    ...LEVELS.map(l => ({ key: l.key, name: l.name, v: node.genes.levels[l.key], lv: true })),
    ...TRAITS.map(x => ({ key: x.key, name: x.name, v: node.genes.traits[x.key] })),
    { key: 'camo', name: '保護色斑紋', v: node.genes.camo },
    { key: 'pale', name: '毛色淡化', v: node.genes.pale },
  ]

  return (
    <div className="panel">
      <h2>⏳ 世代演化 <small>目前第 {node.gen} 代</small></h2>
      <label className="autoSwitch">
        <input type="checkbox" checked={auto} onChange={e => onAuto(e.target.checked)} />
        🤖 自動分化(條件連續達成 5 代,就自動分出下一個分類)
      </label>
      <div className="row">
        {[10, 50, 200].map(n => (
          <button key={n} className="go" onClick={() => onRun(n)}>▶ +{n} 代</button>
        ))}
      </div>
      {notes.length > 0 && (
        <ul className="notes">
          {notes.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}

      <h2>🧬 基因(綠條=現在,白線=環境壓力的目標)</h2>
      {rows.map(r => (
        <div key={r.key} className="gene">
          <span>
            {gated[r.key] ? '🔒 ' : ''}{r.name}
            {!r.lv && r.key !== 'camo' && r.key !== 'pale' && r.v >= 50 ? ' ✅' : ''}
          </span>
          <div className="bar">
            <i style={{ width: `${r.v}%` }} />
            <u style={{ left: `${t[r.key] ?? 0}%` }} />
          </div>
          <b>{Math.round(r.v)}</b>
        </div>
      ))}

      <h2>🔀 下一個可能的分類</h2>
      {opts.length === 0 && <p className="note">這個分類已經是這條路線的終點,但仍可以分出新支系。</p>}
      {opts.map(o => (
        <div key={o.sp.id} className="opt">
          <b>{o.sp.icon} {o.sp.name}</b>
          {o.ready ? (
            auto ? (
              <span className="note">✅ 條件已達成,繼續演化就會自動分化</span>
            ) : (
              <button className="go" disabled={full} onClick={() => onBranch(o.sp.id)}>🧬 分化出此物種</button>
            )
          ) : (
            <details>
              <summary>還差 {o.checks.filter(c => !c.ok).length} 項</summary>
              <ul className="checks">
                {o.checks.map((c, i) => <li key={i} className={c.ok ? 'ok' : 'no'}>{c.ok ? '✅' : '❌'} {c.text}</li>)}
              </ul>
            </details>
          )}
        </div>
      ))}
      <button disabled={full} onClick={() => onBranch(null)}>🌿 分出同類新支系(放進另一種環境)</button>
      {full && <p className="err">已達 {MAX_NODES} 個物種上限,請先刪除不要的支系。</p>}

      <h2>📜 演化紀錄</h2>
      <ul className="log">
        {node.log.slice().reverse().map((l, i) => <li key={i}>第 {l.gen} 代:{l.text}</li>)}
      </ul>
    </div>
  )
}