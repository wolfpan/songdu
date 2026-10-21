export interface Para {
  /** 段序号（章内从 0 起） */
  i: number
  /** 原文 */
  o: string
  /** 白话（null = 尚未整理） */
  v: string | null
  /** 偈颂块 */
  g?: boolean
}

export interface Chapter {
  no: number
  title: string
  note: string
  paras: Para[]
}

export interface ChapterSummary {
  no: number
  title: string
  note: string
  paras: number
  translated: number
}

export interface SutraBase {
  id: string
  title: string
  shortTitle: string
  sanskrit: string
  dynasty: string
  translator: string
  era: string
  desc: string
  quote: string
  accent: string
}

export interface SutraMeta extends SutraBase {
  chapters: ChapterSummary[]
}

export interface Sutra extends SutraBase {
  chapters: Chapter[]
}

export interface SearchDoc {
  s: string
  c: number
  p: number
  o: string
  v: string | null
}

export type TermKind = 'term' | 'person' | 'place'

export interface GlossaryEntry {
  term: string
  kind: TermKind
  gloss: string
}

export type ReadMode = 'cols' | 'stack' | 'yuan' | 'bai'

export interface Settings {
  mode: ReadMode
  fontSize: number
  theme: 'light' | 'dark'
  font: 'serif' | 'kai'
}

export interface Mark {
  star: boolean
  tags: string[]
  /** 收藏时保存的原文摘句，供书签页展示 */
  snippet?: string
}

export interface ProgressRec {
  ch: number
  p: number
  ts: number
}
