import { reactive } from 'vue'

// 学法倒计时：模块级单例 + localStorage 持久化，路由切换/刷新不中断
const KEY = 'songdu:timer'

export type TimerState = 'idle' | 'run' | 'pause' | 'done'

export const DURATIONS = [15, 20, 30, 40, 60, 90]

export const timer = reactive<{ state: TimerState; minutes: number; remainSec: number }>({
  state: 'idle',
  minutes: 0,
  remainSec: 0,
})

let endAt = 0
let tick: ReturnType<typeof setInterval> | null = null

function save() {
  localStorage.setItem(
    KEY,
    JSON.stringify({ minutes: timer.minutes, remainSec: timer.remainSec, endAt, state: timer.state }),
  )
}

function tickStop() {
  if (tick) {
    clearInterval(tick)
    tick = null
  }
}

function tickStart() {
  tickStop()
  tick = setInterval(() => {
    if (timer.state !== 'run') return
    timer.remainSec = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
    if (timer.remainSec <= 0) {
      timer.state = 'done'
      tickStop()
    }
    save()
  }, 500)
}

export function timerStart(minutes: number) {
  timer.minutes = minutes
  timer.remainSec = minutes * 60
  endAt = Date.now() + timer.remainSec * 1000
  timer.state = 'run'
  tickStart()
  save()
}

export function timerPause() {
  if (timer.state !== 'run') return
  timer.remainSec = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
  timer.state = 'pause'
  tickStop()
  save()
}

export function timerResume() {
  if (timer.state !== 'pause') return
  endAt = Date.now() + timer.remainSec * 1000
  timer.state = 'run'
  tickStart()
  save()
}

export function timerCancel() {
  timer.state = 'idle'
  timer.minutes = 0
  timer.remainSec = 0
  tickStop()
  localStorage.removeItem(KEY)
}

export function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 启动时恢复未完成的倒计时
;(function restore() {
  let p: { minutes: number; remainSec: number; endAt: number; state: TimerState } | null = null
  try {
    p = JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    /* ignore */
  }
  if (!p || typeof p.endAt !== 'number') return
  timer.minutes = p.minutes
  timer.remainSec = p.remainSec
  if (p.state === 'run') {
    const remain = Math.ceil((p.endAt - Date.now()) / 1000)
    if (remain > 0) {
      endAt = p.endAt
      timer.remainSec = remain
      timer.state = 'run'
      tickStart()
    } else {
      timer.state = 'done'
    }
  } else {
    timer.state = p.state
  }
})()
