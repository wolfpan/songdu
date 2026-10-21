import { reactive, watch } from 'vue'
import type { Settings } from '../types'

const KEY = 'songdu:settings'
const defaults: Settings = { mode: 'cols', fontSize: 19, theme: 'light', vertical: false, font: 'serif' }

function load(): Settings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...defaults }
  }
}

export const settings = reactive<Settings>(load())

watch(
  settings,
  (s) => {
    localStorage.setItem(KEY, JSON.stringify(s))
    document.documentElement.dataset.theme = s.theme
  },
  { deep: true, immediate: true },
)
