import { SLIDERS, LEVELS, TRAITS, HABITATS, DIETS } from './data/config'
import { targetsOf } from './engine'

const cycle = (v = 0) => (v === 0 ? 1 : v === 1 ? -1 : 0)

export default function Controls({ node, patch }) {
  const { gated } = targetsOf(node)
  return (
    <div className="panel">
      <h2>🌍 環境壓力(12 個連續滑桿)</h2>
      <div className="grid2">
        {SLIDERS.map(s => (
          <label key={s.key} className="slider">
            <span>{s.name}<b>{node.env[s.key]}</b></span>
            <input type="range" min="0" max="100" value={node.env[s.key]}
              onChange={e => patch(n => { n.env[s.key] = +e.target.value })} />
            <small>{s.hint}</small>
          </label>
        ))}
      </div>

      <h2>🏞️ 棲地(6 選 1)</h2>
      <div className="chips">
        {HABITATS.map(h => (
          <button key={h.id} className={node.habitat === h.id ? 'on' : ''}
            onClick={() => patch(n => { n.habitat = h.id })}>{h.name}</button>
        ))}
      </div>

      <h2>🍽️ 食性(11 選 1)</h2>
      <div className="chips">
        {DIETS.map(d => (
          <button key={d.id} className={node.diet === d.id ? 'on' : ''}
            onClick={() => patch(n => { n.diet = d.id })}>{d.name}</button>
        ))}
      </div>

      <h2>🎯 選擇偏好(人擇)</h2>
      <small>點一下 ▲ 偏好(讓牠更容易演化出來),再點一下 ▼ 抑制,第三下取消。🔒 代表這個譜系還不能演化。</small>
      <div className="chips" style={{ marginTop: 8 }}>
        {[...LEVELS, ...TRAITS].map(x => {
          const locked = !!gated[x.key]
          const v = node.prefs[x.key] || 0
          return (
            <button key={x.key} disabled={locked}
              className={v === 1 ? 'on' : v === -1 ? 'neg' : ''}
              onClick={() => patch(n => { n.prefs[x.key] = cycle(n.prefs[x.key]) })}>
              {locked ? '🔒 ' : ''}{x.name}{v === 1 ? ' ▲' : v === -1 ? ' ▼' : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}