import { reactive, watch } from 'vue'
import type { Mark } from '../types'

const KEY = 'songdu:marks'

function load(): Record<string, Mark> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

/** key = `${sutraId}/${chapterNo}/${paraIndex}` */
export const marks = reactive<Record<string, Mark>>(load())

watch(
  marks,
  (m) => localStorage.setItem(KEY, JSON.stringify(m)),
  { deep: true },
)

export const markKey = (s: string, c: number, p: number) => `${s}/${c}/${p}`

export function getMark(key: string): Mark {
  return marks[key] ?? { star: false, tags: [] }
}

function save(key: string, m: Mark) {
  if (!m.star && m.tags.length === 0) delete marks[key]
  else marks[key] = m
}

export function toggleStar(key: string, snippet: string) {
  const m = getMark(key)
  save(key, { ...m, star: !m.star, snippet: !m.star ? snippet : m.snippet } as Mark)
}

export function toggleTag(key: string, tag: string) {
  const m = getMark(key)
  const tags = m.tags.includes(tag) ? m.tags.filter((t) => t !== tag) : [...m.tags, tag]
  save(key, { ...m, tags })
}

export function allTags(): string[] {
  const set = new Set<string>()
  for (const m of Object.values(marks)) for (const t of m.tags) set.add(t)
  return [...set].sort()
}
