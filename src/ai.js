import { HABITATS, DIETS, TRAITS } from './data/config'
import { byId, appearance, expressed } from './engine'

// 讓 AI 知道「大概像哪一類動物」,例如極地肉食哺乳類 → 大型貓科
function bodyHint(node) {
  const L = node.genes.levels, d = node.diet
  if (node.clade === 'mammal' || node.clade === 'synapsid') {
    if (d === 'carnivore' && L.limbs >= 55) return 'powerful big-cat-like predator build, muscular quadruped with a long tail'
    if (d === 'herbivore' && L.bodySize >= 70) return 'massive heavy grazing build'
    if (d === 'herbivore') return 'graceful hoofed grazer build'
    if (d === 'insectivore' || L.bodySize < 25) return 'small shrew-like build'
    if (d === 'omnivore' && L.bodySize >= 60) return 'bear-like sturdy build'
  }
  return ''
}

export function buildPrompt(node) {
  const sp = byId[node.clade]
  const { env, genes } = node
  const L = genes.levels
  const T = expressed(genes)
  const hab = HABITATS.find(h => h.id === node.habitat)
  const diet = DIETS.find(d => d.id === node.diet)
  const ap = appearance(node)
  const p = []

  p.push(`A highly detailed, hyper-realistic National Geographic wildlife photograph of an undiscovered animal species, an evolved ${sp.en}`)
  const hint = bodyHint(node)
  if (hint) p.push(hint)
  p.push(`adapted to a ${hab.en} habitat`)
  p.push(`${diet.en} feeding habits`)
  p.push(`${ap.colorName} coloration`)
  p.push(env.humidity > 65 ? 'dark pigmented skin' : env.humidity < 35 ? 'pale sun-bleached skin' : 'natural skin tones')

  if (L.bodySize > 70) p.push('very large massive body')
  else if (L.bodySize < 30) p.push('small compact body')

  if (genes.camo >= 40) p.push(L.hair >= 20 ? 'bold dark stripes across the coat as camouflage' : 'natural camouflage patterns')

  if (sp.form === 'swim') {
    p.push('marine creature with flippers')
    if (env.waterWidth > 70) p.push('vast open ocean, massive highly hydrodynamic body built for long-distance cruising')
    if (env.waterDepth > 70) p.push('deep dark water with shafts of light from above')
  } else if (sp.form === 'fly') {
    p.push('flying creature soaring high in the sky')
  } else {
    p.push('terrestrial animal')
    if (env.gravity > 70) p.push('thick, short, sturdy limbs')
    else if (env.gravity < 30) p.push('tall, delicate, elongated skeletal structure')
    if (L.limbs > 70) p.push('long powerful legs')
  }

  if (L.hair > 60) p.push('covered in thick dense fur')
  else if (L.hair > 20) p.push('sparse short fur')

  TRAITS.forEach(t => { if (T[t.key] && t.prompt) p.push(t.prompt) })

  if (env.light < 25) p.push('dim twilight scene')
  else if (env.light > 75) p.push('harsh bright sunlight')
  if (env.temperature < 25) p.push('icy cold environment with frost and snow')
  else if (env.temperature > 75) p.push('scorching hot environment with heat haze')
  if (env.vegetation > 70) p.push('dense lush vegetation')
  else if (env.vegetation < 25) p.push('sparse barren landscape')
  if (env.predator > 70) p.push('alert wary posture')

  p.push('Cinematic lighting, 8k resolution, photorealistic, highly detailed texture, shot on 35mm lens, depth of field')
  return p.join(', ') + '.'
}

// 回傳可以直接放進 <img src> 的網址
export async function generateImage({ provider, key, prompt, seed }) {
  if (!key) throw new Error('請先填入 API Key')

  if (provider === 'pollinations') {
    const q = new URLSearchParams({ model: 'flux', width: '768', height: '768', seed: String(seed) })
    const base = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${q}`
    try {
      const res = await fetch(base, { headers: { Authorization: `Bearer ${key}` } })
      if (!res.ok) {
        const t = await res.text().catch(() => '')
        throw new Error(`Pollinations 回應 ${res.status}。${t.slice(0, 120)}`)
      }
      return URL.createObjectURL(await res.blob())
    } catch (e) {
      // 網路或 CORS 錯誤時,改用網址帶 key 的方式讓 <img> 直接載入
      if (e instanceof TypeError) return `${base}&key=${encodeURIComponent(key)}`
      throw e
    }
  }

  // OpenAI:dall-e-3 已下架,改用 gpt-image-1,回傳 base64
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1024', quality: 'low' }),
  })
  if (!res.ok) {
    const j = await res.json().catch(() => null)
    throw new Error(j?.error?.message || `OpenAI 回應 ${res.status}`)
  }
  const j = await res.json()
  return `data:image/png;base64,${j.data[0].b64_json}`
}