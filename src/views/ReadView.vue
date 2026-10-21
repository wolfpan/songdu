<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Sutra, SutraMeta } from '../types'
import { loadIndex, loadSutra } from '../data/api'
import { setProgress } from '../store/progress'
import { drawers } from '../store/ui'
import { settings } from '../store/settings'
import SideTree from '../components/SideTree.vue'
import ToolsPanel from '../components/ToolsPanel.vue'
import ParaBlock from '../components/ParaBlock.vue'

const route = useRoute()
const router = useRouter()

const index = ref<SutraMeta[]>([])
const sutra = ref<Sutra | null>(null)
const readP = ref(0)

const chNo = computed(() => Number(route.params.ch) || 1)
const chapter = computed(() => sutra.value?.chapters.find((c) => c.no === chNo.value) ?? null)

async function load() {
  index.value = await loadIndex()
  const id = String(route.params.id)
  sutra.value = await loadSutra(id)
  readP.value = 0
  await nextTick()
  const p = route.query.p
  if (p !== undefined) {
    document.getElementById('p-' + p)?.scrollIntoView({ block: 'start' })
    readP.value = Number(p)
  }
}

watch(() => [route.params.id, route.params.ch, route.query.p], load, { immediate: true })

// 路由变化即收起移动端抽屉
watch(() => route.fullPath, () => {
  drawers.tree = false
  drawers.tools = false
})

function onSeen(i: number) {
  if (i > readP.value) readP.value = i
  if (sutra.value) setProgress(sutra.value.id, chNo.value, readP.value)
}

function gotoChapter(no: number) {
  if (!sutra.value) return
  router.push({ name: 'read', params: { id: sutra.value.id, ch: no } })
}

const prevCh = computed(() => (chNo.value > 1 ? chNo.value - 1 : null))
const nextCh = computed(() =>
  sutra.value && chNo.value < sutra.value.chapters.length ? chNo.value + 1 : null,
)

/* 静读模式：隐藏原生滚动条，右缘细指示条滚动时显现、停止后渐隐。
   scroll 不冒泡，故在容器捕获阶段监听（对热替换/重挂免疫） */
const zenBar = reactive({ show: false, thumbH: 24, thumbY: 0 })
let hideT: ReturnType<typeof setTimeout> | undefined

function onMainScroll(e: Event) {
  if (!settings.zen) return
  const el = e.target as HTMLElement
  if (!el.classList?.contains('read-main') || el.scrollHeight <= el.clientHeight) return
  const track = el.clientHeight - 16
  zenBar.show = true
  zenBar.thumbH = Math.max(24, (el.clientHeight / el.scrollHeight) * track)
  zenBar.thumbY = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * (track - zenBar.thumbH)
  clearTimeout(hideT)
  hideT = setTimeout(() => (zenBar.show = false), 1000)
}
</script>

<template>
  <div
    v-if="sutra && chapter"
    class="read-cols"
    :style="{ '--accent-sutra': sutra.accent }"
    @scroll.capture="onMainScroll"
  >
    <SideTree
      v-if="!settings.zen"
      :class="{ open: drawers.tree }"
      :index="index"
      :current-id="sutra.id"
      :current-ch="chNo"
    />

    <main class="read-main" :class="{ zen: settings.zen }">
      <header class="ch-head">
        <h1>{{ chapter.title }}</h1>
        <p v-if="chapter.note" class="ch-note">{{ chapter.note }}</p>
      </header>

      <ParaBlock
        v-for="p in chapter.paras"
        :key="p.i"
        :sid="sutra.id"
        :ch-no="chNo"
        :para="p"
        :total="chapter.paras.length"
        @seen="onSeen"
      />

      <nav class="ch-nav">
        <button v-if="prevCh" @click="gotoChapter(prevCh!)">‹ 上一{{ sutra.id === 'jingang' ? '分' : '章' }}</button>
        <span v-else></span>
        <button v-if="nextCh" @click="gotoChapter(nextCh!)">下一{{ sutra.id === 'jingang' ? '分' : '章' }} ›</button>
      </nav>
    </main>

    <ToolsPanel v-if="!settings.zen" :class="{ open: drawers.tools }" />

    <div v-if="settings.zen" class="zen-bar" :class="{ show: zenBar.show }" aria-hidden="true">
      <i :style="{ height: zenBar.thumbH + 'px', transform: 'translateY(' + zenBar.thumbY + 'px)' }"></i>
    </div>
  </div>
  <p v-else class="loading">载入中…</p>
</template>

<style scoped>
.loading {
  padding: 60px;
  text-align: center;
  color: var(--ink-3);
}

.read-cols {
  position: relative;
  display: flex;
  align-items: stretch;
  /* 页面级不滚动：三栏各自独立滚动（左树/右栏固定于视口，中栏自由滚动） */
  height: calc(100vh - var(--topbar-h));
  overflow: hidden;
}

.read-main {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 980px;
  margin: 0 auto;
  padding: 26px 34px 80px;
  overflow-y: auto;
}

.read-main.zen {
  max-width: 860px;
  scrollbar-width: none;
}

.read-main.zen::-webkit-scrollbar {
  display: none;
}

.zen-bar {
  position: absolute;
  right: 4px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.6s;
  pointer-events: none;
}

.zen-bar.show {
  opacity: 1;
}

.zen-bar i {
  display: block;
  width: 3px;
  border-radius: 2px;
  background: var(--line-2);
}

.ch-head {
  margin-bottom: 8px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--accent-sutra, var(--accent));
}

.ch-head h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 1px;
}

.ch-note {
  margin: 6px 0 0;
  color: var(--ink-3);
  font-size: 13px;
}

.ch-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 34px;
}

.ch-nav button {
  padding: 6px 16px;
  border: 1px solid var(--line-2);
  border-radius: 16px;
  color: var(--accent);
  font-size: 14px;
}

.ch-nav button:hover {
  background: var(--accent-soft);
}

@media (max-width: 1200px) {
  .read-main {
    padding: 20px 18px 60px;
  }
}
</style>
