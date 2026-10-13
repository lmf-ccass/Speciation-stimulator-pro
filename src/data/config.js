// ───────── 12 個環境連續滑桿 ─────────
export const SLIDERS = [
  { key: 'temperature', name: '氣候溫度',   hint: '低=寒冷 高=炎熱', def: 50 },
  { key: 'humidity',    name: '氣候濕度',   hint: '低=乾燥 高=潮濕', def: 60 },
  { key: 'oxygen',      name: '氧氣濃度',   hint: '高氧允許巨大體型', def: 50 },
  { key: 'gravity',     name: '重力大小',   hint: '高=四肢粗短、難以飛行', def: 50 },
  { key: 'waterDepth',  name: '水域深度',   hint: '高=深水(水生)', def: 60 },
  { key: 'waterWidth',  name: '水域廣闊度', hint: '高=廣闊,水生體型與尾部變大', def: 50 },
  { key: 'preySpeed',   name: '獵物速度',   hint: '高=需要更長的四肢或更流線', def: 50 },
  { key: 'foodHeight',  name: '食物高度',   hint: '高=需要長脖子', def: 50 },
  { key: 'predator',    name: '捕食者威脅', hint: '高=需要逃生與保護色', def: 30 },
  { key: 'light',       name: '光照強度',   hint: '低=大眼睛、發光', def: 70 },
  { key: 'steepness',   name: '地形陡峭度', hint: '高=促進飛行', def: 30 },
  { key: 'vegetation',  name: '植被密度',   hint: '高=茂密森林', def: 50 },
]

// ───────── 3 個程度性狀 ─────────
export const LEVELS = [
  { key: 'bodySize', name: '體型', def: 30 },
  { key: 'limbs',    name: '四肢', def: 0 },
  { key: 'hair',     name: '毛髮', def: 0 },
]

// ───────── 13 個二元性狀 ─────────
export const TRAITS = [
  { key: 'gills',      name: '鰓',       def: true, prompt: 'visible gill slits' },
  { key: 'lungs',      name: '肺',       prompt: '' },
  { key: 'jaw',        name: '顎(牙齒分化的強壯下顎)', prompt: 'strong jaw with differentiated teeth' },
  { key: 'amnion',     name: '羊膜卵',   prompt: '' },
  { key: 'neck',       name: '長脖子',   prompt: 'notably long neck' },
  { key: 'ears',       name: '大耳朵',   prompt: 'large prominent ears' },
  { key: 'wings',      name: '翅膀',     prompt: 'large wings' },
  { key: 'streamline', name: '流線型',   prompt: 'streamlined hydrodynamic body' },
  { key: 'glow',       name: '發光',     prompt: 'glowing bioluminescent patterns on the skin' },
  { key: 'beak',       name: '喙',       prompt: 'a strong curved beak' },
  { key: 'feathers',   name: '羽毛',     prompt: 'covered in detailed feathers' },
  { key: 'warmblood',  name: '恆溫',     prompt: '' },
  { key: 'hollow',     name: '中空骨骼', prompt: 'lightweight build' },
]

// ───────── 6 種棲地 ─────────
export const HABITATS = [
  { id: 'forest', name: '森林', en: 'dense forest',      sky: '#6fae8a', ground: '#3d5a2e' },
  { id: 'desert', name: '沙漠', en: 'arid desert',       sky: '#f1c27d', ground: '#c9a05a' },
  { id: 'ocean',  name: '海洋', en: 'open ocean',        sky: '#4aa3d8', ground: '#1d4f7a' },
  { id: 'polar',  name: '極地', en: 'frozen polar region', sky: '#cfe8f5', ground: '#f4fbff' },
  { id: 'plain',  name: '平原', en: 'grassland plain',   sky: '#8fc9e8', ground: '#7fae4f' },
  { id: 'rocky',  name: '岩岸', en: 'rocky coastline',   sky: '#9fb4c4', ground: '#6b6b6b' },
]

// ───────── 11 種食性 ─────────
export const DIETS = [
  { id: 'scavenger',  name: '食腐', en: 'scavenging' },
  { id: 'herbivore',  name: '草食', en: 'herbivorous' },
  { id: 'carnivore',  name: '肉食', en: 'carnivorous' },
  { id: 'omnivore',   name: '雜食', en: 'omnivorous' },
  { id: 'insectivore',name: '食蟲', en: 'insect-eating' },
  { id: 'piscivore',  name: '食魚', en: 'fish-eating' },
  { id: 'frugivore',  name: '食果', en: 'fruit-eating' },
  { id: 'nectarivore',name: '食蜜', en: 'nectar-feeding' },
  { id: 'filter',     name: '濾食', en: 'filter-feeding' },
  { id: 'detritivore',name: '食碎屑', en: 'detritus-feeding' },
  { id: 'granivore',  name: '食種子', en: 'seed-eating' },
]

/*
  16 個物種。rules 的格式:
  ['t', 性狀]        要有這個性狀
  ['!t', 性狀]       不能有這個性狀
  ['>=', 欄位, 數值]  滑桿或程度性狀 ≥ 數值
  ['<=', 欄位, 數值]  滑桿或程度性狀 ≤ 數值
  ['diet', [食性...]] 食性必須是其中之一
  ['hab', [棲地...]]  棲地必須是其中之一
*/
export const SPECIES = [
  { id: 'fish', name: '魚類', icon: '🐟', parent: null, form: 'swim', color: '#4aa3c7',
    en: 'ancient fish', colorName: 'silvery blue', rules: [],
    note: '最早的脊椎動物是魚類,用鰓呼吸,生活在水中。' },

  { id: 'lobefin', name: '肉鰭魚', icon: '🐠', parent: 'fish', form: 'swim', color: '#5b8f6a',
    en: 'lobe-finned fish with limb-like fins', colorName: 'olive green',
    rules: [['>=', 'limbs', 15], ['<=', 'waterDepth', 70]],
    note: '胸鰭裡有骨骼與肌肉,生活在淺水。四足動物的祖先屬於這一類(例如提塔利克魚)。' },

  { id: 'amphibian', name: '兩棲類', icon: '🐸', parent: 'lobefin', form: 'quad', color: '#6fae3f',
    en: 'amphibian', colorName: 'bright green',
    rules: [['t', 'lungs'], ['>=', 'limbs', 35], ['>=', 'humidity', 50]],
    note: '約 3.6 億年前登陸。用肺與皮膚呼吸,仍然需要潮濕環境,卵也要產在水裡。' },

  { id: 'reptile', name: '爬行類', icon: '🦎', parent: 'amphibian', form: 'quad', color: '#8a8d4a',
    en: 'scaly reptile', colorName: 'earthy olive',
    rules: [['t', 'amnion'], ['t', 'lungs'], ['!t', 'gills'], ['>=', 'limbs', 45]],
    note: '羊膜卵讓動物能在陸地上產卵,可以遠離水邊。遊戲把羊膜動物的共同祖先簡化稱為「爬行類」;實際上牠們很快分成「合弓類」與「蜥形類」兩大支。' },

  // ── 哺乳類支線 ──
  { id: 'synapsid', name: '合弓類', icon: '🐾', parent: 'reptile', form: 'quad', color: '#a07b52',
    en: 'mammal-like synapsid', colorName: 'tan brown',
    rules: [['t', 'jaw'], ['>=', 'hair', 15]],
    note: '頭骨後方有一個顳孔,下顎強壯、牙齒開始分化(門牙、犬齒、臼齒)。哺乳類由這一支演化而來。(真正的顎最早出現在魚類,這裡的「顎」指分化的牙顎。)' },

  { id: 'mammal', name: '哺乳類', icon: '🐭', parent: 'synapsid', form: 'quad', color: '#9b6b45',
    en: 'furry mammal', colorName: 'warm brown',
    rules: [['t', 'warmblood'], ['>=', 'hair', 20]],
    note: '哺乳類的特徵是毛髮、恆溫、哺乳,以及中耳的三塊小聽骨。' },

  { id: 'marinemammal', name: '海生哺乳類', icon: '🐋', parent: 'mammal', form: 'swim', color: '#5f7f9c',
    en: 'whale-like marine mammal', colorName: 'slate blue',
    rules: [['t', 'streamline'], ['>=', 'waterDepth', 60], ['>=', 'bodySize', 60]],
    note: '鯨與海豚的祖先曾經住在陸地,後來回到海裡。牠們用肺呼吸,需要浮上水面換氣。' },

  { id: 'bat', name: '飛行哺乳類', icon: '🦇', parent: 'mammal', form: 'fly', wing: 'membrane', color: '#5a4a5e',
    en: 'bat-like flying mammal', colorName: 'dark grey-purple',
    rules: [['t', 'wings'], ['<=', 'bodySize', 35], ['<=', 'gravity', 60], ['>=', 'steepness', 50]],
    note: '蝙蝠是唯一真正會飛的哺乳類,翼膜由極度延長的指骨撐開。' },

  // ── 恐龍與鳥類支線 ──
  { id: 'archosaur', name: '主龍類', icon: '🐊', parent: 'reptile', form: 'quad', color: '#7d8f5a',
    en: 'crocodile-like archosaur', colorName: 'moss green',
    rules: [['>=', 'limbs', 60], ['>=', 'oxygen', 40]],
    note: '主龍類是鱷魚、翼龍、恐龍與鳥類的共同祖先類群。' },

  { id: 'pterosaur', name: '翼龍', icon: '🦎', parent: 'archosaur', form: 'fly', wing: 'membrane', color: '#c0794a',
    en: 'pterosaur with membranous wings', colorName: 'rusty orange',
    rules: [['t', 'wings'], ['t', 'hollow'], ['<=', 'gravity', 50], ['>=', 'steepness', 50]],
    note: '翼龍是最早會飛的脊椎動物之一,翼膜由延長的第四指支撐。牠們不是恐龍。' },

  { id: 'dinosaur', name: '恐龍', icon: '🦕', parent: 'archosaur', form: 'biped', color: '#6c8a4a',
    en: 'dinosaur', colorName: 'green',
    rules: [['>=', 'limbs', 70], ['>=', 'bodySize', 50], ['<=', 'waterDepth', 40], ['>=', 'oxygen', 50]],
    note: '恐龍的四肢直立在身體正下方,所以能長出巨大身軀並快速奔跑。約 2.3 億年前出現。' },

  { id: 'sauropod', name: '蜥腳類', icon: '🦕', parent: 'dinosaur', form: 'quad', color: '#8b9a6b',
    en: 'giant long-necked sauropod dinosaur', colorName: 'sage green',
    rules: [['t', 'neck'], ['>=', 'bodySize', 80], ['>=', 'foodHeight', 70], ['diet', ['herbivore']]],
    note: '長脖子的四足草食巨獸(例如腕龍),脖子用來吃高處的樹葉。' },

  { id: 'theropod', name: '獸腳類', icon: '🦖', parent: 'dinosaur', form: 'biped', color: '#b4552d',
    en: 'feathered theropod dinosaur', colorName: 'rust red',
    rules: [['t', 'feathers'], ['diet', ['carnivore', 'omnivore']], ['<=', 'bodySize', 80]],
    note: '雙足行走、多數是肉食。許多獸腳類恐龍身上有羽毛,鳥類就是從這一支演化出來的。' },

  { id: 'bird', name: '鳥類', icon: '🐦', parent: 'theropod', form: 'biped', color: '#3f77b5',
    en: 'bird', colorName: 'blue',
    rules: [['t', 'beak'], ['t', 'feathers'], ['t', 'hollow'], ['t', 'warmblood'], ['<=', 'bodySize', 60]],
    note: '鳥類是獸腳類恐龍的後代,也就是說鳥類是現存的恐龍。特徵有羽毛、喙、中空骨骼和恆溫。' },

  { id: 'flybird', name: '飛行鳥類', icon: '🦅', parent: 'bird', form: 'fly', wing: 'feather', color: '#d9a21b',
    en: 'soaring flying bird', colorName: 'golden brown',
    rules: [['t', 'wings'], ['<=', 'gravity', 60], ['<=', 'bodySize', 40], ['>=', 'steepness', 40]],
    note: '飛行需要翅膀、輕盈的骨骼和夠小的體型;重力太大就飛不起來。' },

  { id: 'landbird', name: '陸行鳥類', icon: '🦤', parent: 'bird', form: 'biped', color: '#7a5a3a',
    en: 'large flightless running bird', colorName: 'brown',
    rules: [['>=', 'limbs', 70], ['>=', 'bodySize', 55], ['hab', ['plain', 'desert', 'forest']]],
    note: '像鴕鳥一樣放棄飛行,把能量投資在強壯的雙腿與大體型上,在開闊地奔跑。' },
]

// ───────── 參考路線按鈕 ─────────
export const ROUTES = [
  { id: 'dino',     title: '🐟 魚類 → 🦕 恐龍',     target: 'dinosaur' },
  { id: 'mammal',   title: '🐟 魚類 → 🐭 哺乳類',   target: 'mammal' },
  { id: 'flybird',  title: '🐟 魚類 → 🦅 飛行鳥類', target: 'flybird' },
  { id: 'landbird', title: '🐟 魚類 → 🦤 陸行鳥類', target: 'landbird' },
  { id: 'marine',   title: '🐟 魚類 → 🐋 海生哺乳類', target: 'marinemammal' },
  { id: 'ptero',    title: '🐟 魚類 → 🦎 翼龍',     target: 'pterosaur' },
]

// 譜系限制:needs=譜系中必須出現過的分類,forbids=譜系中出現就不能演化
export const GATES = {
  amnion:    { needs: 'amphibian' },
  neck:      { needs: 'amphibian' },
  ears:      { needs: 'amphibian' },
  hair:      { needs: 'reptile', forbids: 'archosaur' },
  warmblood: { needs: 'reptile' },
  wings:     { needs: 'reptile' },
  hollow:    { needs: 'reptile' },
  feathers:  { needs: 'dinosaur' },
  beak:      { needs: 'dinosaur' },
}