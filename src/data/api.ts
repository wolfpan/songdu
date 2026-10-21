import type { GlossaryEntry, SearchDoc, Sutra, SutraMeta } from '../types'

let indexP: Promise<SutraMeta[]> | null = null
const sutraCache = new Map<string, Promise<Sutra>>()
let searchP: Promise<SearchDoc[]> | null = null
let glossaryP: Promise<GlossaryEntry[]> | null = null

const get = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`${url}: ${r.status}`)
  return r.json()
})

export function loadIndex(): Promise<SutraMeta[]> {
  return (indexP ??= get('./data/index.json'))
}

export function loadSutra(id: string): Promise<Sutra> {
  let p = sutraCache.get(id)
  if (!p) {
    p = get(`./data/${id}.json`)
    sutraCache.set(id, p)
  }
  return p
}

export function loadSearch(): Promise<SearchDoc[]> {
  return (searchP ??= get('./data/search.json'))
}

export function loadGlossary(): Promise<GlossaryEntry[]> {
  return (glossaryP ??= get('./data/glossary.json'))
}
