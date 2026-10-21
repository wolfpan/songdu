<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReadMode } from '../types'
import { settings } from '../store/settings'
import { glossarySize } from '../lib/terms'

const props = defineProps<{ read?: number; total?: number }>()

const MODES: { key: ReadMode; label: string }[] = [
  { key: 'cols', label: '左右对照' },
  { key: 'stack', label: '上下对照' },
  { key: 'yuan', label: '仅原文' },
  { key: 'bai', label: '仅白话' },
]

const glossOpen = ref(false)
const pct = computed(() =>
  props.total ? Math.round(((props.read ?? 0) + 1) / props.total * 100) : 0,
)
</script>

<template>
  <aside class="tools">
    <h2 class="tp-title">诵读助手</h2>

    <section class="tp-sec">
      <h3>显示</h3>
      <div class="tp-modes">
        <button
          v-for="m in MODES"
          :key="m.key"
          class="tp-mode"
          :class="{ on: settings.mode === m.key && !settings.vertical }"
          @click="settings.mode = m.key"
        >
          {{ m.label }}
        </button>
      </div>
      <label class="tp-row">
        <span>竖排（如对古本）</span>
        <input v-model="settings.vertical" type="checkbox" />
      </label>
    </section>

    <section class="tp-sec">
      <h3>字号与字体</h3>
      <div class="tp-row">
        <span>字号</span>
        <span class="tp-fs">
          <button @click="settings.fontSize = Math.max(14, settings.fontSize - 1)">A−</button>
          <em>{{ settings.fontSize }}</em>
          <button @click="settings.fontSize = Math.min(30, settings.fontSize + 1)">A＋</button>
        </span>
      </div>
      <div class="tp-modes">
        <button class="tp-mode" :class="{ on: settings.font === 'serif' }" @click="settings.font = 'serif'">
          宋体
        </button>
        <button class="tp-mode" :class="{ on: settings.font === 'kai' }" @click="settings.font = 'kai'">
          文楷
        </button>
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

    <section v-if="total" class="tp-sec">
      <h3>本章进度</h3>
      <p class="tp-prog">读到第 {{ (read ?? 0) + 1 }} / {{ total }} 段 · {{ pct }}%</p>
      <div class="tp-bar"><i :style="{ width: pct + '%' }"></i></div>
    </section>

    <section class="tp-sec">
      <h3>
        <button class="tp-gloss-btn" @click="glossOpen = !glossOpen">
          术语表（{{ glossarySize() }} 条）{{ glossOpen ? '▾' : '▸' }}
        </button>
      </h3>
      <p v-if="glossOpen" class="tp-gloss-hint">
        阅读页原文中的术语带点线下划线，点击即可查看释义。
      </p>
    </section>
  </aside>
</template>

<style scoped>
.tools {
  width: 250px;
  flex: 0 0 250px;
  border-left: 1px solid var(--line);
  background: var(--panel);
  overflow-y: auto;
  padding: 14px 16px 40px;
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
  font-size: 13.5px;
  color: var(--ink-2);
  margin: 6px 0;
}

.tp-row input {
  accent-color: var(--accent);
  width: 16px;
  height: 16px;
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

.tp-prog {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--ink-2);
}

.tp-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--line);
  overflow: hidden;
}

.tp-bar i {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 0.3s;
}

.tp-gloss-btn {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-3);
  letter-spacing: 1px;
}

.tp-gloss-hint {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink-2);
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .tools {
    position: fixed;
    top: calc(var(--topbar-h) + var(--crumb-h));
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
