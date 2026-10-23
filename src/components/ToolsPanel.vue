<script setup lang="ts">
import { onUnmounted, reactive } from 'vue'
import type { ReadMode } from '../types'
import { settings } from '../store/settings'
import * as chant from '../lib/buddha-audio'
import { DURATIONS, fmt, timer, timerCancel, timerPause, timerResume, timerStart } from '../store/timer'

const MODES: { key: ReadMode; label: string }[] = [
  { key: 'cols', label: '左右对照' },
  { key: 'stack', label: '上下对照' },
  { key: 'yuan', label: '仅原文' },
  { key: 'bai', label: '仅白话' },
]

const st = reactive(chant.getState())
const offState = chant.onState((s) => Object.assign(st, s))
onUnmounted(offState)

function onVol(e: Event) {
  chant.setVolume(Number((e.target as HTMLInputElement).value) / 100)
}
</script>

<template>
  <aside class="tools">
    <div class="tools-body">
      <h2 class="tp-title">诵读助手</h2>

    <section class="tp-sec">
      <h3>学法倒计时</h3>
      <template v-if="timer.state === 'idle'">
        <div class="tp-chips">
          <button v-for="m in DURATIONS" :key="m" class="tp-chip" @click="timerStart(m)">
            {{ m }} 分钟
          </button>
        </div>
        <p class="tp-hint">选定时长即开始，翻页不中断。</p>
      </template>
      <template v-else>
        <div class="tp-clock" :class="{ done: timer.state === 'done' }">{{ fmt(timer.remainSec) }}</div>
        <div class="tp-chips">
          <button v-if="timer.state === 'run'" class="tp-chip" @click="timerPause">暂停</button>
          <button v-else-if="timer.state === 'pause'" class="tp-chip on" @click="timerResume">继续</button>
          <button v-else class="tp-chip on" @click="timerStart(timer.minutes)">再来一次</button>
          <button class="tp-chip" @click="timerCancel">{{ timer.state === 'done' ? '收起' : '放弃' }}</button>
          <span class="tp-total">{{ timer.state === 'done' ? '学法圆满' : '总长 ' + timer.minutes + ' 分钟' }}</span>
        </div>
      </template>
    </section>

    <section class="tp-sec">
      <h3>显示</h3>
      <div class="tp-modes">
        <button
          v-for="m in MODES"
          :key="m.key"
          class="tp-mode"
          :class="{ on: settings.mode === m.key }"
          @click="settings.mode = m.key"
        >
          {{ m.label }}
        </button>
      </div>
    </section>

    <section class="tp-sec">
      <h3>字号与字体</h3>
      <div class="tp-font-row">
        <span class="tp-modes tp-modes-inline">
          <button class="tp-mode" :class="{ on: settings.font === 'serif' }" @click="settings.font = 'serif'">
            宋体
          </button>
          <button class="tp-mode" :class="{ on: settings.font === 'kai' }" @click="settings.font = 'kai'">
            文楷
          </button>
        </span>
        <span class="tp-fs">
          <button title="减小字号" @click="settings.fontSize = Math.max(14, settings.fontSize - 1)">A−</button>
          <em>{{ settings.fontSize }}</em>
          <button title="增大字号" @click="settings.fontSize = Math.min(30, settings.fontSize + 1)">A＋</button>
        </span>
      </div>
    </section>

    <section class="tp-sec">
      <h3>主题</h3>
      <div class="tp-modes">
        <button class="tp-mode" :class="{ on: settings.theme === 'light' }" @click="settings.theme = 'light'">
          纸色
        </button>
        <button class="tp-mode" :class="{ on: settings.theme === 'dark' }" @click="settings.theme = 'dark'">
          夜读
        </button>
      </div>
    </section>

    <section class="tp-sec">
      <h3>梵音</h3>
      <div class="tp-audio">
        <button
          class="tp-play"
          :class="{ on: st.playing }"
          :title="st.playing ? '暂停' : '播放'"
          @click="chant.toggle()"
        >
          {{ st.playing ? '❚❚' : '▶' }}
        </button>
        <div class="tp-track">
          <strong>{{ st.playing ? st.tracks[st.trackIdx].name : '梵音' }}</strong>
          <em>{{ st.playing ? st.tracks[st.trackIdx].desc + (st.loop ? ' · 单曲循环' : ' · 循环') : '八曲 · 浏览器合成' }}</em>
        </div>
      </div>
      <div class="tp-chips">
        <button
          v-for="(t, i) in st.tracks"
          :key="t.id"
          class="tp-chip"
          :class="{ on: st.playing && st.trackIdx === i }"
          @click="chant.playTrack(i)"
        >
          {{ t.name }}
        </button>
      </div>
      <div class="tp-audio-ctl">
        <button @click="chant.skip(-1)">‹ 上一曲</button>
        <button :class="{ on: st.loop }" title="单曲循环" @click="chant.toggleLoop()">单曲循环</button>
        <button @click="chant.skip(1)">下一曲 ›</button>
      </div>
      <label class="tp-row">
        <span>音量</span>
        <input class="tp-vol" type="range" min="0" max="100" :value="Math.round(st.volume * 100)" @input="onVol" />
      </label>
    </section>
    </div>

    <footer class="tools-foot">
      底本：《大正新修大藏经》公版经 · 白话由 AI 生成，仅供参考。传法：<a
        class="tools-foot-link"
        href="https://github.com/wolfpan/songdu"
        target="_blank"
        rel="noopener"
        >github</a
      >
    </footer>
  </aside>
</template>

<style scoped>
.tools {
  width: 250px;
  flex: 0 0 250px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--line);
  background: var(--panel);
}

.tools-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px 24px;
}

.tools-foot {
  flex: 0 0 auto;
  padding: 9px 14px 12px;
  border-top: 1px solid var(--line);
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--ink-3);
}

.tools-foot-link {
  color: var(--ink-2);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
}

.tools-foot-link:hover {
  color: var(--ink);
  border-bottom-color: var(--ink-3);
}

.tp-title {
  margin: 0 0 12px;
  font-family: var(--font-kai);
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 1px;
}

.tp-sec {
  margin-bottom: 18px;
}

.tp-clock {
  margin: 2px 0 10px;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 34px;
  line-height: 1.2;
  text-align: center;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.tp-clock.done {
  color: var(--accent);
}

.tp-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--ink-3);
}

.tp-total {
  margin-left: auto;
  align-self: center;
  font-size: 12px;
  color: var(--ink-3);
}

.tp-sec h3 {
  margin: 0 0 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-3);
  letter-spacing: 1px;
}

.tp-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tp-modes-inline {
  margin-bottom: 0;
}

.tp-font-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 4px;
}

.tp-font-row .tp-fs {
  flex: 0 0 auto;
}

.tp-fs button {
  padding: 1px 6px;
  white-space: nowrap;
}

.tp-mode {
  padding: 4px 10px;
  border: 1px solid var(--line-2);
  border-radius: 14px;
  font-size: 12.5px;
  color: var(--ink-2);
}

.tp-mode.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}

.tp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13.5px;
  color: var(--ink-2);
  margin: 6px 0;
}

.tp-fs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tp-fs button {
  border: 1px solid var(--line-2);
  border-radius: 6px;
  padding: 1px 8px;
  font-size: 12px;
  color: var(--ink-2);
}

.tp-fs em {
  font-style: normal;
  min-width: 22px;
  text-align: center;
}

.tp-audio {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.tp-play {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border: 1px solid var(--accent);
  border-radius: 50%;
  color: var(--accent);
  font-size: 11px;
  display: grid;
  place-items: center;
}

.tp-play.on {
  background: var(--accent);
  color: var(--panel);
}

.tp-track {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tp-track strong {
  font-family: var(--font-serif);
  font-size: 14px;
}

.tp-track em {
  font-style: normal;
  color: var(--ink-3);
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tp-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tp-chip {
  padding: 2px 10px;
  border: 1px solid var(--line-2);
  border-radius: 12px;
  font-size: 12px;
  color: var(--ink-2);
}

.tp-chip.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.tp-audio-ctl {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.tp-audio-ctl button {
  flex: 1;
  border: 1px solid var(--line-2);
  border-radius: 14px;
  padding: 3px 0;
  font-size: 12px;
  color: var(--ink-2);
}

.tp-audio-ctl button.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}

.tp-audio-ctl button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.tp-vol {
  flex: 1;
  accent-color: var(--accent);
}

@media (max-width: 1200px) {
  .tools {
    position: fixed;
    top: var(--topbar-h);
    bottom: 0;
    right: 0;
    z-index: 40;
    transform: translateX(100%);
    transition: transform 0.2s;
    box-shadow: var(--shadow);
  }

  .tools.open {
    transform: translateX(0);
  }
}
</style>
