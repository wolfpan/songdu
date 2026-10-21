import { reactive, ref, watch } from 'vue'
import type { ProgressRec } from '../types'

const KEY = 'songdu:progress'

interface Bag {
  recs: Record<string, ProgressRec>
  last: { sid: string; ch: number; p: number } | null
}

function load(): Bag {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (j && typeof j === 'object') return { recs: j.recs ?? {}, last: j.last ?? null }
  } catch {
    /* ignore */
  }
  return { recs: {}, last: null }
}

const bag = load()
export const progress = reactive<Record<string, ProgressRec>>(bag.recs)
export const lastRead = ref<Bag['last']>(bag.last)

watch(
  [progress, lastRead],
  () => localStorage.setItem(KEY, JSON.stringify({ recs: progress, last: lastRead.value })),
  { deep: true },
)

export function setProgress(sid: string, ch: number, p: number) {
  const old = progress[sid]
  if (old && old.ch === ch && old.p === p) return
  progress[sid] = { ch, p, ts: Date.now() }
  lastRead.value = { sid, ch, p }
}
