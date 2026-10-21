import { reactive } from 'vue'
import type { GlossaryEntry } from '../types'

export const termPop = reactive<{ entry: GlossaryEntry | null; x: number; y: number }>({
  entry: null,
  x: 0,
  y: 0,
})

export function openTerm(entry: GlossaryEntry, ev: MouseEvent) {
  termPop.entry = entry
  termPop.x = Math.min(ev.clientX, window.innerWidth - 340)
  termPop.y = Math.min(ev.clientY + 14, window.innerHeight - 220)
}

export function closeTerm() {
  termPop.entry = null
}
