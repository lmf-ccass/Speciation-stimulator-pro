import { SPECIES, SLIDERS, LEVELS, TRAITS, HABITATS, DIETS, GATES } from './data/config'

export const MAX_NODES = 16
export const byId = Object.fromEntries(SPECIES.map(s => [s.id, s]))
export const clone = (o) => JSON.parse(JSON.stringify(o))
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v))

const NAMES = {}
;[...SLIDERS, ...LEVELS, ...TRAITS].forEach(x => { NAMES[x.key] = x.name })
NAMES.camo = '保護色斑紋'
NAMES.pale = '毛色淡化'
export const nameOf = (k) => NAMES[k] || k
const habName = (id) => HABITATS.find(h => h.id === id)?.name || id
const dietName = (id) => DIETS.find(d => d.id === id)?.name || id

let seq = 0
const uid = () => 'n' + (++seq) + Math.random().toString(36).slice(2, 6)

// ───────── 顏色 ─────────
export function mixHex(a, b, p) {
  const ch = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
  const A = ch(a), B = ch(b)
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * p).toString(16).padStart(2, '0')).join('')
}

// ───────── 譜系 ─────────
export function lineageOf(id) {
  const out = []
  let c = byId[id]
  while (c) { out.unshift(c.id); c = c.parent ? byId[c.parent] : null }
  return out
}
export const getPath = (id) => lineageOf(id).map(i => byId[i])

// 譜系走過的分類所要求的性狀,之後不會輕易退化
function keepSet(cladeId) {
  const s = new Set()
  lineageOf(cladeId).forEach(id => byId[id].rules.forEach(r => { if (r[0] === 't') s.add(r[1]) }))
  return s
}
function allowed(key, line) {
  const g = GATES[key]
  if (!g) return true
  if (g.needs && !line.includes(g.needs)) return false
  if (g.forbids && line.includes(g.forbids)) return false
  return true
}

// ───────── 建立物種 ─────────
export function makeRoot() {
  const env = {}; SLIDERS.forEach(s => { env[s.key] = s.def })
  const levels = {}; LEVELS.forEach(l => { levels[l.key] = l.def })
  const traits = {}; TRAITS.forEach(t => { traits[t.key] = t.def ? 100 : 0 })
  return {
    id: uid(), parent: null, clade: 'fish', name: null, gen: 0,
    env, habitat: 'ocean', diet: 'omnivore', prefs: {},
    genes: { levels, traits, camo: 15, pale: 15 },
    log: [{ gen: 0, text: '原始魚類誕生了。' }],
  }
}

// cladeId 為 null 代表「同分類的新支系」
export function makeChild(p, cladeId) {
  const c = clone(p)
  c.id = uid(); c.parent = p.id; c.name = null
  if (cladeId) c.clade = cladeId
  c.log = [{ gen: p.gen, text: cladeId
    ? `由「${displayName(p)}」分化為${byId[cladeId].name}`
    : `由「${displayName(p)}」分出新支系` }]
  return c
}

// ───────── 名稱與外觀 ─────────
export function autoName(node) {
  const sp = byId[node.clade], g = node.genes
  const size = g.levels.bodySize > 70 ? '巨大' : g.levels.bodySize < 25 ? '小型' : ''
  const feat = g.camo > 45 ? '斑紋' : g.traits.glow >= 50 ? '發光' : g.levels.hair > 60 ? '長毛'
    : g.traits.neck >= 50 ? '長頸' : g.traits.wings >= 50 ? '有翼' : ''
  return `${habName(node.habitat)}${size}${feat}${dietName(node.diet)}${sp.name}`
}
export const displayName = (node) => node.name || autoName(node)

const HAB_TINT = { forest: '#6b6a3a', desert: '#d2b074', ocean: '#4f7f9c', polar: '#f2f6f9', plain: '#b8934c', rocky: '#8c8c8c' }
const HAB_COLORNAME = {
  forest: 'mottled green-brown', desert: 'sandy tan', ocean: 'slate blue-grey',
  polar: 'pale grey', plain: 'golden brown', rocky: 'stony grey',
}
export function appearance(node) {
  const sp = byId[node.clade], pale = node.genes.pale
  let c = mixHex(sp.color, HAB_TINT[node.habitat], 0.45)
  c = mixHex(c, '#ffffff', (pale / 100) * 0.75)
  c = mixHex(c, '#000000', (clamp(node.env.humidity - 60, 0, 40) / 100) * 0.5)
  const base = HAB_COLORNAME[node.habitat]
  const colorName = pale >= 70 ? 'snow-white' : pale >= 40 ? `pale ${base}` : base
  return { color: c, colorName }
}
export const expressed = (genes) =>
  Object.fromEntries(Object.entries(genes.traits).map(([k, v]) => [k, v >= 50]))

// ───────── 壓力 → 目標值 ─────────
const DIET_SIZE = { herbivore: 15, carnivore: 12, omnivore: 5, filter: 15, scavenger: 3 }
const JAW = { carnivore: 90, piscivore: 80, scavenger: 70, omnivore: 65, granivore: 65, herbivore: 55, insectivore: 50, frugivore: 40, detritivore: 30, nectarivore: 10, filter: 5 }
const BEAK = { granivore: 80, piscivore: 75, frugivore: 70, nectarivore: 70, carnivore: 70, insectivore: 65, scavenger: 65, omnivore: 60, herbivore: 55, detritivore: 30, filter: 20 }

export function targetsOf(node) {
  const { env: e, habitat, diet, genes: g } = node
  const prefs = node.prefs || {}
  const line = lineageOf(node.clade)
  const keeps = keepSet(node.clade)
  const wd = e.waterDepth / 100
  // 水生程度 0~1:海洋最高,岩岸中等,其他棲地接近 0
  const aq = habitat === 'ocean' ? 0.5 + 0.5 * wd : habitat === 'rocky' ? 0.15 + 0.25 * wd : 0.1 * wd
  const flying = g.traits.wings >= 50

  const T = {}, gated = {}
  const fin = (key, v, isLevel) => {
    if (!allowed(key, line)) { gated[key] = true; T[key] = 0; return 0 }
    v += (prefs[key] || 0) * (isLevel ? 25 : 40)
    if (keeps.has(key)) v = Math.max(v, 60)
    T[key] = clamp(v)
    return T[key]
  }

  // 程度性狀
  const size = fin('bodySize',
    35 + (50 - e.temperature) * 0.3 + (e.oxygen - 50) * 0.5 + (50 - e.gravity) * 0.3
    + (DIET_SIZE[diet] || 0) + aq * (e.waterWidth - 30) * 0.35, true)
  if (flying) T.bodySize = Math.min(size, 30) // 太重飛不起來
  fin('limbs', (1 - aq) * (30 + e.preySpeed * 0.6 + (50 - e.gravity) * 0.15 + e.steepness * 0.05), true)
  fin('hair', (20 + (70 - e.temperature) * 1.3) * (1 - aq * 0.8), true)

  // 二元性狀(傾向值)
  fin('gills', line.includes('reptile') ? 0 : aq * 130 - 20)
  fin('lungs', line.includes('reptile') ? 100 : 100 - aq * 110)
  fin('jaw', JAW[diet] ?? 50)
  fin('amnion', (1 - aq) * 70 + (100 - e.humidity) * 0.4 + e.temperature * 0.1)
  fin('neck', e.foodHeight * (1 - aq * 0.9) + (diet === 'herbivore' ? 10 : 0) - 10)
  fin('ears', ((e.temperature - 30) * 1.2 + e.predator * 0.3) * (1 - aq))
  const wings = fin('wings', (10 + e.steepness * 0.6 + e.predator * 0.3 - e.gravity * 0.45 - (T.bodySize > 60 ? 20 : 0)) * (1 - aq))
  fin('streamline', aq * (40 + e.preySpeed * 0.4 + e.waterWidth * 0.3))
  fin('glow', (60 - e.light) * 2 + aq * e.waterDepth * 0.2)
  fin('beak', BEAK[diet] ?? 50)
  fin('feathers', 50 + (60 - e.temperature) * 0.6 + wings * 0.3)
  fin('warmblood', 30 + (100 - e.temperature) * 0.3 + e.preySpeed * 0.3 + e.predator * 0.1)
  fin('hollow', wings * 0.9 + (100 - e.gravity) * 0.2)

  // 內部基因
  T.camo = clamp((e.vegetation - 30) * 0.8 + e.predator * 0.5)
  T.pale = clamp((habitat === 'polar' ? 85 : habitat === 'desert' ? 45 : 15) + (100 - e.humidity) * 0.15 + (e.light - 50) * 0.1)
  return { t: T, gated }
}

// ───────── 世代演化 ─────────
// 推進一代(直接修改 g)
function stepGenes(node, g, strength) {
  const { t } = targetsOf({ ...node, genes: g })
  const mut = () => (Math.random() - 0.5) * 0.6 // ±0.3
  const step = (cur, key) => clamp(cur + (t[key] - cur) * strength + mut())
  LEVELS.forEach(l => { g.levels[l.key] = step(g.levels[l.key], l.key) })
  TRAITS.forEach(x => { g.traits[x.key] = step(g.traits[x.key], x.key) })
  g.camo = step(g.camo, 'camo')
  g.pale = step(g.pale, 'pale')
}

// 比較前後基因,產生演化紀錄
function diffLog(before, g, gen) {
  const log = []
  TRAITS.forEach(x => {
    const a = before.traits[x.key] >= 50, b = g.traits[x.key] >= 50
    if (a !== b) log.push({ gen, text: b ? `✨ 演化出「${x.name}」` : `⬇️ 失去「${x.name}」` })
  })
  LEVELS.forEach(l => {
    const d = g.levels[l.key] - before.levels[l.key]
    if (Math.abs(d) >= 10) log.push({ gen, text: `${l.name}${d > 0 ? '增加' : '減少'}了 ${Math.round(Math.abs(d))}` })
  })
  if (g.camo >= 40 && before.camo < 40) log.push({ gen, text: '🐯 身上出現保護色斑紋' })
  if (g.pale >= 70 && before.pale < 70) log.push({ gen, text: '❄️ 毛色變白' })
  return log
}

// 手動模式:只演化,不分化
export function evolve(node, n, strength = 0.03) {
  const g = clone(node.genes)
  for (let i = 0; i < n; i++) stepGenes({ ...node }, g, strength)
  const gen = node.gen + n
  return { ...node, gen, genes: g, log: [...node.log, ...diffLog(node.genes, g, gen)].slice(-40) }
}

// 自動模式:每一代檢查分化條件,連續 need 代達成就自動分化
// 回傳 { nodes, notes }:nodes[0] 是原本的物種(更新後),其後是新分化出的物種,最後一個是仍在演化的那一支
export function evolveAuto(start, n, count, strength = 0.03, need = 5) {
  let cur = start
  let g = clone(cur.genes)
  let before = clone(cur.genes)
  let gen = start.gen
  let streak = 0
  let total = count
  let warned = false
  const chain = []
  const notes = []

  const commit = () => ({
    ...cur, gen, genes: g,
    log: [...cur.log, ...diffLog(before, g, gen)].slice(-40),
  })

  for (let i = 0; i < n; i++) {
    stepGenes({ ...cur, genes: g }, g, strength)
    gen++
    const ready = branchOptions({ ...cur, genes: g }).find(o => o.ready)
    streak = ready ? streak + 1 : 0
    if (!ready || streak < need) continue

    if (total >= MAX_NODES) {
      if (!warned) { notes.push(`🈵 第 ${gen} 代:已達 ${MAX_NODES} 個物種上限,無法自動分化`); warned = true }
      continue
    }
    const frozen = commit()
    chain.push(frozen)
    notes.push(`🎉 第 ${gen} 代:${byId[frozen.clade].name} 分化出 ${ready.sp.icon} ${ready.sp.name}`)
    cur = makeChild(frozen, ready.sp.id)
    g = clone(cur.genes)
    before = clone(g)
    streak = 0
    total++
  }
  return { nodes: [...chain, commit()], notes }
}

// ───────── 條件檢查 ─────────
const getVal = (node, k) => (k in node.env ? node.env[k] : node.genes.levels[k])

export function checkRule(node, rule) {
  const [type, a, b] = rule
  const tv = (k) => Math.round(node.genes.traits[k] ?? 0)
  switch (type) {
    case 't': return { ok: node.genes.traits[a] >= 50, text: `演化出「${nameOf(a)}」(傾向 ${tv(a)}/50)` }
    case '!t': return { ok: node.genes.traits[a] < 50, text: `不再有「${nameOf(a)}」(傾向 ${tv(a)},要 < 50)` }
    case '>=': { const v = Math.round(getVal(node, a)); return { ok: v >= b, text: `${nameOf(a)} ≥ ${b}(現在 ${v})` } }
    case '<=': { const v = Math.round(getVal(node, a)); return { ok: v <= b, text: `${nameOf(a)} ≤ ${b}(現在 ${v})` } }
    case 'diet': return { ok: a.includes(node.diet), text: `食性為:${a.map(dietName).join('或')}` }
    case 'hab': return { ok: a.includes(node.habitat), text: `棲地為:${a.map(habName).join('或')}` }
    default: return { ok: false, text: '未知條件' }
  }
}

export const branchOptions = (node) =>
  SPECIES.filter(s => s.parent === node.clade).map(sp => {
    const checks = sp.rules.map(r => checkRule(node, r))
    return { sp, checks, ready: checks.every(c => c.ok) }
  })

// 把某一步的條件轉成「壓力設定」(只設定壓力,不會直接給性狀)
export function suggest(node, rules) {
  const n = clone(node)
  for (const [type, a, b] of rules) {
    if (type === 't') n.prefs[a] = 1
    else if (type === '!t') n.prefs[a] = -1
    else if ((type === '>=' || type === '<=') && a in n.env) {
      if (type === '>=' && n.env[a] < b) n.env[a] = b
      if (type === '<=' && n.env[a] > b) n.env[a] = b
    } else if (type === '>=' || type === '<=') {
      n.prefs[a] = type === '>=' ? 1 : -1
    } else if (type === 'diet') {
      if (!a.includes(n.diet)) n.diet = a[0]
    } else if (type === 'hab') {
      if (!a.includes(n.habitat)) n.habitat = a[0]
    }
  }
  return n
}