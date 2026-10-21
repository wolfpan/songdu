<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SutraMeta } from '../types'
import { progress } from '../store/progress'

const props = defineProps<{
  index: SutraMeta[]
  currentId?: string
  currentCh?: number
}>()

const expanded = ref<Record<string, boolean>>({})

watch(
  () => props.currentId,
  (id) => {
    if (id) expanded.value[id] = true
  },
  { immediate: true },
)

function toggle(id: string) {
  expanded.value[id] = !expanded.value[id]
}

const totalParas = computed(() => (m: SutraMeta) => m.chapters.reduce((n, c) => n + c.paras, 0))
</script>

<template>
  <aside class="side-tree">
    <p class="st-meta">底本 大正藏 · 白话 AI 生成</p>
    <div v-for="m in index" :key="m.id" class="st-sutra">
      <button class="st-root" :class="{ active: m.id === currentId }" @click="toggle(m.id)">
        <span class="st-arrow" :class="{ open: expanded[m.id] }">▸</span>
        <span class="st-dot" :style="{ background: m.accent }"></span>
        <span class="st-name">{{ m.shortTitle }}</span>
        <span v-if="progress[m.id]" class="st-prog" :title="'读到第 ' + (progress[m.id].p + 1) + ' 段'">●</span>
      </button>
      <div v-show="expanded[m.id]" class="st-chapters">
        <router-link
          v-for="c in m.chapters"
          :key="c.no"
          class="st-ch"
          :class="{ active: m.id === currentId && c.no === currentCh }"
          :to="`/read/${m.id}/${c.no}`"
        >
          {{ c.title }}
        </router-link>
      </div>
      <p v-show="expanded[m.id]" class="st-count">{{ m.chapters.length }} 章 · {{ totalParas(m) }} 段</p>
    </div>
  </aside>
</template>

<style scoped>
.side-tree {
  width: 232px;
  flex: 0 0 232px;
  border-right: 1px solid var(--line);
  background: var(--panel);
  overflow-y: auto;
  padding: 10px 8px 40px;
}

.st-meta {
  margin: 4px 8px 10px;
  color: var(--ink-3);
  font-size: 12px;
}

.st-root {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 7px 8px;
  border-radius: 6px;
  font-size: 15px;
  color: var(--ink);
  text-align: left;
}

.st-root:hover {
  background: var(--accent-soft);
}

.st-arrow {
  font-size: 11px;
  color: var(--ink-3);
  transition: transform 0.15s;
}

.st-arrow.open {
  transform: rotate(90deg);
}

.st-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 8px;
}

.st-name {
  font-family: var(--font-serif);
  font-weight: 600;
}

.st-prog {
  margin-left: auto;
  font-size: 8px;
  color: var(--accent);
}

.st-chapters {
  display: flex;
  flex-direction: column;
  margin: 2px 0 2px 26px;
  border-left: 1px solid var(--line);
  padding-left: 6px;
}

.st-ch {
  padding: 4px 8px;
  border-radius: 5px;
  color: var(--ink-2);
  font-size: 13.5px;
  line-height: 1.5;
}

.st-ch:hover {
  background: var(--accent-soft);
  color: var(--ink);
}

.st-ch.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
  box-shadow: inset 2px 0 0 var(--accent);
}

.st-count {
  margin: 2px 8px 8px 34px;
  color: var(--ink-3);
  font-size: 11.5px;
}

@media (max-width: 960px) {
  .side-tree {
    position: fixed;
    top: var(--topbar-h);
    bottom: 0;
    left: 0;
    z-index: 40;
    transform: translateX(-100%);
    transition: transform 0.2s;
    box-shadow: var(--shadow);
  }

  .side-tree.open {
    transform: translateX(0);
  }
}
</style>
