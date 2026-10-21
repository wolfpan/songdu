// 数据管线：原文(data/raw/sutras.json) + 白话译稿(translations/) + 术语表(glossary.json)
// → public/data/{index,<sutra>,search,glossary}.json
// 白话译稿按 {sutra, chapter, start, paras} 分片，构建时校验逐段对齐与完整覆盖。
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))
const write = (p, data) => {
  const abs = join(ROOT, p)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, JSON.stringify(data))
}

const raw = read('data/raw/sutras.json')
const glossary = existsSync(join(ROOT, 'glossary.json')) ? read('glossary.json') : []

// 偈颂判定：含换行，或由等长短句（3–8 字、2–8 句、全段≤64 字）构成；
// 楞伽经偈颂为半偈一行、中以全角空格相隔，故先剥空白再比句长
function isGatha(o) {
  if (o.includes('\n')) return true
  if (o.length > 64) return false
  const clauses = o
    .split(/[，。；、！？]/)
    .map((s) => s.replace(/[「」\s　]/g, ''))
    .filter(Boolean)
  if (clauses.length < 2 || clauses.length > 8) return false
  const len = clauses[0].length
  if (len < 3 || len > 8) return false
  return clauses.every((c) => c.length === len)
}

function loadTranslations(id) {
  const dir = join(ROOT, 'translations', id)
  if (!existsSync(dir)) return new Map()
  const byChapter = new Map()
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const part = JSON.parse(readFileSync(join(dir, f), 'utf8'))
    if (part.sutra !== id) throw new Error(`${id}/${f}: sutra 字段不符`)
    if (!Array.isArray(part.paras)) throw new Error(`${id}/${f}: paras 缺失`)
    const list = byChapter.get(part.chapter) ?? []
    list.push({ file: f, start: part.start ?? 0, paras: part.paras })
    byChapter.set(part.chapter, list)
  }
  return byChapter
}

const index = []
const search = []
let warn = 0

for (const s of raw) {
  const byChapter = loadTranslations(s.id)
  const chapters = s.chapters.map((ch, ci) => {
    const no = ci + 1
    const parts = (byChapter.get(no) ?? []).sort((a, b) => a.start - b.start)
    const vmap = new Array(ch.paras.length).fill(null)
    let cur = 0
    for (const part of parts) {
      if (part.start !== cur) {
        throw new Error(`${s.id} 第${no}章: 分片断点 start=${part.start}(${part.file})，期望 ${cur}`)
      }
      if (part.start + part.paras.length > ch.paras.length) {
        throw new Error(`${s.id} 第${no}章: ${part.file} 超出原文段数`)
      }
      part.paras.forEach((v, k) => {
        if (typeof v !== 'string') throw new Error(`${s.id} 第${no}章 ${part.file}: 第${cur + k}段白话非字符串`)
        vmap[cur + k] = v
      })
      cur += part.paras.length
    }
    if (cur < ch.paras.length) {
      warn++
      console.warn(`[warn] ${s.id} 第${no}章 白话覆盖 ${cur}/${ch.paras.length}`)
    }
    const paras = ch.paras.map((o, i) => {
      const p = { i, o, v: vmap[i] }
      if (isGatha(o)) p.g = true
      search.push({ s: s.id, c: no, p: i, o, v: vmap[i] })
      return p
    })
    return { no, title: ch.title, note: ch.note ?? '', paras }
  })

  const meta = {
    id: s.id,
    title: s.title,
    shortTitle: s.shortTitle,
    sanskrit: s.sanskrit,
    dynasty: s.dynasty,
    translator: s.translator,
    era: s.era,
    desc: s.desc,
    quote: s.quote,
    accent: s.accent,
  }
  write(`public/data/${s.id}.json`, {
    ...meta,
    chapters: chapters.map((c) => ({
      no: c.no,
      title: c.title,
      note: c.note,
      paras: c.paras.map((p) => (p.g ? { i: p.i, o: p.o, v: p.v, g: true } : { i: p.i, o: p.o, v: p.v })),
    })),
  })
  index.push({
    ...meta,
    chapters: chapters.map((c) => ({
      no: c.no,
      title: c.title,
      note: c.note,
      paras: c.paras.length,
      translated: c.paras.filter((p) => p.v !== null).length,
    })),
  })
  console.log(`${s.id}: ${chapters.length} 章 / ${chapters.reduce((n, c) => n + c.paras.length, 0)} 段`)
}

write('public/data/index.json', index)
write('public/data/search.json', search)
write('public/data/glossary.json', glossary)
console.log(`index ${index.length} 经 / search ${search.length} 段 / glossary ${glossary.length} 条 / warn ${warn}`)
