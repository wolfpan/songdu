<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Sutra, SutraMeta } from '../types'
import { loadIndex, loadSutra } from '../data/api'
import { setProgress } from '../store/progress'
import SideTree from '../components/SideTree.vue'
import ToolsPanel from '../components/ToolsPanel.vue'
import ParaBlock from '../components/ParaBlock.vue'

const route = useRoute()
const router = useRouter()

const index = ref<SutraMeta[]>([])
const sutra = ref<Sutra | null>(null)
const treeOpen = ref(false)
const toolsOpen = ref(false)
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
  treeOpen.value = false
  toolsOpen.value = false
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

onMounted(() => {
  /* load() 由 watch immediate 触发 */
})
</script>

<template>
  <div v-if="sutra && chapter" class="read-wrap">
    <div class="crumb-bar">
      <button class="icon-btn only-mobile" aria-label="目录" @click="treeOpen = !treeOpen">☰</button>
      <nav class="crumb">
        <router-link to="/">{{ sutra.shortTitle }}</router-link>
        <span class="sep">/</span>
        <router-link :to="`/sutra/${sutra.id}`">{{ chapter.title }}</router-link>
      </nav>
      <button class="icon-btn only-mobile" aria-label="阅读设置" @click="toolsOpen = !toolsOpen">⚙</button>
    </div>

    <div class="read-cols">
      <SideTree
        :class="{ open: treeOpen }"
        :index="index"
        :current-id="sutra.id"
        :current-ch="chNo"
      />

      <main class="read-main" :style="{ '--accent-sutra': sutra.accent }">
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

      <ToolsPanel :class="{ open: toolsOpen }" :read="readP" :total="chapter.paras.length" />
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

.crumb-bar {
  position: sticky;
  top: var(--topbar-h);
  z-index: 35;
  display: flex;
  align-items: center;
  gap: 12px;
  height: var(--crumb-h);
  padding: 0 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
}

.crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: var(--ink-2);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.crumb .sep {
  color: var(--ink-3);
}

.icon-btn {
  font-size: 16px;
  color: var(--ink-2);
  padding: 4px 8px;
  border-radius: 6px;
}

.icon-btn:hover {
  background: var(--accent-soft);
}

.only-mobile {
  display: none;
}

.read-cols {
  display: flex;
  align-items: stretch;
  min-height: calc(100vh - var(--topbar-h) - var(--crumb-h));
}

.read-main {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 980px;
  margin: 0 auto;
  padding: 26px 34px 80px;
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
  .only-mobile {
    display: inline-block;
  }

  .read-main {
    padding: 20px 18px 60px;
  }
}
</style>
