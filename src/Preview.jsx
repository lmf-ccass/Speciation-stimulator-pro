import { useEffect, useRef, useState } from 'react'
import { drawCreature } from './draw'
import { buildPrompt, generateImage } from './ai'
import { byId, autoName } from './engine'

export default function Preview({ node, onRename }) {
  const ref = useRef(null)
  const [provider, setProvider] = useState('pollinations')
  const [key, setKey] = useState('')
  const [edited, setEdited] = useState(null)
  const [img, setImg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { drawCreature(ref.current, node) }, [node])
  useEffect(() => { setEdited(null); setImg(null); setErr('') }, [node.id])

  const sp = byId[node.clade]
  const prompt = edited ?? buildPrompt(node)

  const run = async () => {
    setBusy(true); setErr('')
    try {
      const url = await generateImage({ provider, key: key.trim(), prompt, seed: Math.floor(Math.random() * 1e6) })
      setImg(url)
    } catch (e) {
      setErr(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <h2>🔬 生物預覽:{sp.icon} {sp.name}</h2>
      <div className="row">
        <input className="namebox" value={node.name ?? ''} placeholder={`自動命名:${autoName(node)}`}
          onChange={e => onRename(e.target.value)} />
      </div>
      <canvas ref={ref} width={560} height={380} className="cv" />
      <p className="note">{sp.note}</p>

      <h2>🎨 AI 生圖</h2>
      <div className="row">
        <select value={provider} onChange={e => setProvider(e.target.value)}>
          <option value="pollinations">Pollinations(flux)</option>
          <option value="openai">OpenAI(gpt-image-1)</option>
        </select>
        <input type="password" autoComplete="off" value={key}
          placeholder={provider === 'pollinations' ? '貼上 pk_ 開頭的金鑰' : '貼上 sk- 開頭的金鑰'}
          onChange={e => setKey(e.target.value)} />
      </div>
      <small>
        金鑰只存在這個網頁的記憶體裡,重新整理就消失,不會上傳到 GitHub。
        {provider === 'pollinations'
          ? ' 到 enter.pollinations.ai 申請(網頁請用 pk_ 公開金鑰)。'
          : ' OpenAI 是按量計費,可能需要先完成組織驗證。'}
      </small>

      <textarea rows={6} value={prompt} onChange={e => setEdited(e.target.value)} />
      <div className="row">
        <button onClick={() => setEdited(null)}>還原自動提示詞</button>
        <button className="go" disabled={busy} onClick={run}>
          {busy ? '生成中…(約 10~30 秒)' : '✨ 生成圖片'}
        </button>
      </div>
      {err && <p className="err">⚠️ {err}</p>}
      {img && <img className="gen" src={img} alt="AI 生成的生物" onError={() => setErr('圖片載入失敗,請檢查金鑰是否正確')} />}
    </div>
  )
}