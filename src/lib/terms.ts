import type { GlossaryEntry } from '../types'

export interface Seg {
  kind: 'text' | 'term'
  text: string
  entry?: GlossaryEntry
}

let terms: GlossaryEntry[] = []

export function setGlossary(list: GlossaryEntry[]) {
  terms = [...list].sort((a, b) => b.term.length - a.term.length)
}

export function glossarySize() {
  return terms.length
}

const memo = new Map<string, Seg[]>()

/** 最长匹配切分原文，术语段可点击弹释义 */
export function segment(text: string): Seg[] {
  const hit = memo.get(text)
  if (hit) return hit
  const out: Seg[] = []
  let buf = ''
  let i = 0
  while (i < text.length) {
    let matched: GlossaryEntry | null = null
    for (const t of terms) {
      if (t.term.length <= text.length - i && text.startsWith(t.term, i)) {
        matched = t
        break
      }
    }
    if (matched) {
      if (buf) {
        out.push({ kind: 'text', text: buf })
        buf = ''
      }
      out.push({ kind: 'term', text: matched.term, entry: matched })
      i += matched.term.length
    } else {
      buf += text[i]
      i++
    }
  }
  if (buf) out.push({ kind: 'text', text: buf })
  memo.set(text, out)
  return out
}
