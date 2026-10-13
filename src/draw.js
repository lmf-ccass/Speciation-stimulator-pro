import { HABITATS } from './data/config'
import { byId, appearance, expressed, mixHex, displayName } from './engine'

const TAU = Math.PI * 2
const darker = (h) => mixHex(h, '#000000', 0.35)
const lighter = (h) => mixHex(h, '#ffffff', 0.3)

function eye(ctx, x, y, r) {
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill()
  ctx.fillStyle = '#111'
  ctx.beginPath(); ctx.arc(x + r * 0.2, y, r * 0.55, 0, TAU); ctx.fill()
}
function tri(ctx, a, b, c, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1])
  ctx.closePath(); ctx.fill()
}
function glow(ctx, pts) {
  ctx.save()
  ctx.shadowColor = '#7ffcff'; ctx.shadowBlur = 18; ctx.fillStyle = '#c9ffff'
  pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill() })
  ctx.restore()
}
function leg(ctx, x, top, len, w, color) {
  ctx.fillStyle = color
  ctx.fillRect(x - w / 2, top, w, len)
  ctx.beginPath(); ctx.ellipse(x + w * 0.6, top + len, w * 0.9, w * 0.35, 0, 0, TAU); ctx.fill()
}
// 條紋(保護色斑紋基因 ≥ 40 才會出現)
function stripes(ctx, cx, cy, rx, ry, camo) {
  if (camo < 40) return
  ctx.save()
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.clip()
  ctx.strokeStyle = 'rgba(25,25,25,0.7)'
  ctx.lineWidth = 2 + camo * 0.06
  for (let x = cx - rx + 12; x < cx + rx - 6; x += 15) {
    ctx.beginPath(); ctx.moveTo(x, cy - ry); ctx.quadraticCurveTo(x + 9, cy, x - 5, cy + ry); ctx.stroke()
  }
  ctx.restore()
}
function drawWing(ctx, x, y, span, color, style) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x + span * 0.15, y - span * 0.7, x - span * 0.3, y - span)
  if (style === 'membrane') {
    ctx.lineTo(x - span * 0.55, y - span * 0.45)
    ctx.lineTo(x - span * 0.35, y - span * 0.5)
    ctx.lineTo(x - span * 0.5, y - span * 0.05)
    ctx.lineTo(x - span * 0.2, y - span * 0.15)
  } else {
    ctx.quadraticCurveTo(x - span * 0.7, y - span * 0.5, x - span * 0.45, y + 4)
  }
  ctx.closePath(); ctx.fill()
  if (style === 'membrane') {
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y); ctx.lineTo(x - span * 0.55, y - span * 0.45)
    ctx.moveTo(x, y); ctx.lineTo(x - span * 0.5, y - span * 0.05)
    ctx.stroke()
  }
}

// ───────── 水生 ─────────
function drawSwim(ctx, p) {
  const { env, levels, traits, col, dark, light, eyeR, camo } = p
  const ry = traits.streamline ? 24 : 42
  const rx = 85
  const tailL = 35 + env.waterWidth * 0.3

  ctx.fillStyle = dark
  ctx.beginPath()
  ctx.moveTo(-rx + 10, 0)
  ctx.lineTo(-rx - tailL, -34)
  ctx.quadraticCurveTo(-rx - tailL * 0.6, 0, -rx - tailL, 34)
  ctx.closePath(); ctx.fill()
  tri(ctx, [-15, -ry + 4], [15, -ry - 26], [45, -ry + 6], dark)

  ctx.fillStyle = col
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill()
  ctx.fillStyle = light
  ctx.beginPath(); ctx.ellipse(5, ry * 0.2, rx * 0.85, ry * 0.7, 0, 0, Math.PI); ctx.fill()
  stripes(ctx, 0, 0, rx, ry, camo)

  const fl = 10 + levels.limbs * 0.35
  ctx.fillStyle = dark
  ctx.save(); ctx.translate(10, ry - 8); ctx.rotate(0.6)
  ctx.beginPath(); ctx.ellipse(0, fl / 2, 8, fl, 0, 0, TAU); ctx.fill()
  ctx.restore()

  if (traits.gills) {
    ctx.strokeStyle = dark; ctx.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(34 + i * 8, 0, ry * 0.6, Math.PI * 0.65, Math.PI * 1.35); ctx.stroke()
    }
  }
  if (traits.jaw) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(rx - 4, 6); ctx.lineTo(rx - 30, 10); ctx.stroke()
  }
  eye(ctx, rx * 0.65, -ry * 0.25, eyeR)
  if (traits.glow) glow(ctx, [[-40, 0], [-10, -ry * 0.5], [20, ry * 0.4], [-60, ry * 0.3], [55, ry * 0.3]])
}

// ───────── 陸生與飛行 ─────────
function drawLand(ctx, p) {
  const { sp, env, levels, traits, col, dark, light, eyeR, camo } = p
  const flying = sp.form === 'fly'
  const biped = sp.form === 'biped'
  const isBird = sp.id.includes('bird')
  const sauro = sp.id === 'sauropod'
  const [rx, ry] = sauro ? [85, 46] : isBird ? [42, 32] : biped ? [62, 32] : [70, 34]

  const legLen = flying ? 8 : 18 + levels.limbs * 0.55
  const lift = flying ? 80 : 0
  const by = -legLen - ry + 8 - lift
  const legW = isBird ? 6 : sauro ? 24 : 8 + env.gravity * 0.12
  const legTop = flying ? by + ry - 10 : by + 10
  const legH = flying ? 18 : -legTop
  const neckL = Math.max(8, (traits.neck ? 55 : 12) + (sauro ? 45 : 0) + (env.foodHeight - 50) * 0.3)
  const bigTail = ['dinosaur', 'theropod', 'archosaur', 'sauropod'].includes(sp.id)
  const tailL = bigTail ? 75 : isBird ? 22 : 45
  const span = 55 + (100 - env.gravity) * 0.5 + (traits.hollow ? 15 : 0)
  const wingStyle = sp.wing || 'feather'

  if (flying) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.beginPath(); ctx.ellipse(0, 0, 60, 8, 0, 0, TAU); ctx.fill()
    drawWing(ctx, 14, by - ry * 0.4, span, dark, wingStyle)
  }

  tri(ctx, [-rx + 15, by - 12], [-rx - tailL, by + 14], [-rx + 15, by + 14], dark)

  const farLegs = flying ? [-8] : biped ? [-4] : [-48, 34]
  farLegs.forEach(x => leg(ctx, x, legTop, legH, legW, dark))

  ctx.fillStyle = col
  ctx.beginPath(); ctx.ellipse(0, by, rx, ry, 0, 0, TAU); ctx.fill()
  ctx.fillStyle = light
  ctx.beginPath(); ctx.ellipse(0, by + ry * 0.2, rx * 0.85, ry * 0.7, 0, 0, Math.PI); ctx.fill()
  stripes(ctx, 0, by, rx, ry, camo)

  const nearLegs = flying ? [8] : biped ? [18] : [-26, 56]
  nearLegs.forEach(x => leg(ctx, x, legTop, legH, legW, col))

  if (levels.hair > 8) {
    const N = Math.round(8 + levels.hair * 0.4)
    const L = 4 + levels.hair * 0.12
    ctx.strokeStyle = darker(col); ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < N; i++) {
      const a = Math.PI * 0.9 + (i / (N - 1)) * Math.PI * 1.2
      const x = Math.cos(a) * rx, y = by + Math.sin(a) * ry
      ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L)
    }
    ctx.stroke()
  }

  if (traits.feathers) {
    ctx.fillStyle = mixHex(col, '#ffffff', 0.45)
    for (let a = Math.PI; a <= Math.PI * 2; a += 0.28) {
      const x = Math.cos(a) * rx * 0.95, y = by + Math.sin(a) * ry * 0.95
      ctx.save(); ctx.translate(x, y); ctx.rotate(a)
      ctx.beginPath(); ctx.ellipse(8, 0, 12, 4, 0, 0, TAU); ctx.fill()
      ctx.restore()
    }
    for (let k = -2; k <= 2; k++) {
      ctx.save(); ctx.translate(-rx + 8, by); ctx.rotate(Math.PI + k * 0.2)
      ctx.beginPath(); ctx.ellipse(24, 0, 28, 5, 0, 0, TAU); ctx.fill()
      ctx.restore()
    }
  }

  if (traits.wings && !flying) {
    ctx.fillStyle = dark
    ctx.save(); ctx.translate(-6, by - 2); ctx.rotate(0.3)
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 12, 0, 0, TAU); ctx.fill()
    ctx.restore()
  }

  const sx = rx - 14, sy = by - ry * 0.4
  const ex = sx + neckL * 0.5, ey = sy - neckL * 0.85
  ctx.strokeStyle = col
  ctx.lineWidth = isBird ? 14 : sauro ? 26 : 20
  ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()

  const [hx, hy] = sauro ? [18, 12] : isBird ? [17, 13] : biped ? [32, 16] : [26, 17]
  const headX = ex + hx * 0.5, headY = ey
  ctx.fillStyle = col
  ctx.beginPath(); ctx.ellipse(headX, headY, hx, hy, 0, 0, TAU); ctx.fill()
  stripes(ctx, headX, headY, hx, hy, camo)

  if (traits.beak || sp.id === 'pterosaur') {
    const bl = sp.id === 'pterosaur' ? 46 : 22
    tri(ctx, [headX + hx * 0.8, headY - 6], [headX + hx * 0.8 + bl, headY + 2], [headX + hx * 0.8, headY + 7], '#e8a317')
  } else if (traits.jaw) {
    ctx.fillStyle = '#fff'
    for (let i = 0; i < 4; i++) {
      const x = headX + hx * 0.2 + i * 6, y = headY + hy * 0.6
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y); ctx.lineTo(x + 2, y + 5); ctx.closePath(); ctx.fill()
    }
  }
  if (traits.ears) {
    const e = 12 + env.temperature * 0.22
    tri(ctx, [headX - 6, headY - hy * 0.7], [headX - 2, headY - hy * 0.7 - e], [headX + 8, headY - hy * 0.7], col)
    tri(ctx, [headX - 3, headY - hy * 0.7], [headX - 1, headY - hy * 0.7 - e * 0.6], [headX + 5, headY - hy * 0.7], '#f2a7b0')
  } else if (levels.hair > 20 && !isBird) {
    // 沒有大耳朵的毛皮動物:小圓耳
    ctx.fillStyle = col
    ctx.beginPath(); ctx.arc(headX - 4, headY - hy * 0.8, 6, 0, TAU); ctx.fill()
  }
  eye(ctx, headX + hx * 0.35, headY - hy * 0.25, eyeR)

  if (flying) drawWing(ctx, 10, by - ry * 0.4, span, mixHex(col, '#000000', 0.15), wingStyle)
  if (traits.glow) glow(ctx, [[-40, by], [-10, by - 12], [20, by], [0, by + 14], [headX, headY - 2]])
}

// ───────── 主函式 ─────────
export function drawCreature(canvas, node) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const sp = byId[node.clade]
  const env = node.env
  const levels = node.genes.levels
  const traits = expressed(node.genes)
  const ap = appearance(node)
  const hab = HABITATS.find(h => h.id === node.habitat)
  const water = sp.form === 'swim'
  const groundY = H * 0.84

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, water ? '#2a86bd' : hab.sky)
  bg.addColorStop(1, water ? '#06203d' : hab.sky)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  if (!water) {
    ctx.fillStyle = hab.ground
    ctx.fillRect(0, groundY, W, H - groundY)
    const n = Math.round(env.vegetation / 12)
    for (let i = 0; i < n; i++) {
      const x = (i * 83 + 20) % W
      const h = 30 + ((i * 37) % 40)
      ctx.fillStyle = '#2f7d32'
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x + 14, groundY - h); ctx.lineTo(x + 28, groundY); ctx.fill()
    }
  }

  if (env.temperature > 70) {
    ctx.fillStyle = `rgba(255,140,0,${(env.temperature - 70) / 300})`; ctx.fillRect(0, 0, W, H)
  } else if (env.temperature < 30) {
    ctx.fillStyle = `rgba(180,220,255,${(30 - env.temperature) / 150})`; ctx.fillRect(0, 0, W, H)
  }
  ctx.fillStyle = `rgba(0,0,25,${(1 - env.light / 100) * 0.6})`
  ctx.fillRect(0, 0, W, H)

  const p = {
    sp, env, levels, traits, camo: node.genes.camo,
    col: ap.color, dark: darker(ap.color), light: lighter(ap.color),
    eyeR: 5 + (1 - env.light / 100) * 6,
  }
  const bs = 0.55 + (levels.bodySize / 100) * 0.9
  ctx.save()
  if (water) { ctx.translate(W / 2, H * 0.5); ctx.scale(bs * 0.9, bs * 0.9); drawSwim(ctx, p) }
  else { ctx.translate(W / 2 - 10, groundY); ctx.scale(bs * 0.8, bs * 0.8); drawLand(ctx, p) }
  ctx.restore()

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 18px sans-serif'
  ctx.fillText(`${sp.icon} ${displayName(node)}`, 14, 28)
}