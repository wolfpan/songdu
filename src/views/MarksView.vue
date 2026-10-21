<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Mark, SutraMeta } from '../types'
import { loadIndex } from '../data/api'
import { allTags, marks } from '../store/marks'

interface Row {
  key: string
  sid: string
  ch: number
  p: number
  mark: Mark
}

const index = ref<SutraMeta[]>([])
const tagFilter = ref<string | null>(null)
onMounted(async () => {
  index.value = await loadIndex()
})

const rows = computed<Row[]>(() => {
  const out: Row[] = []
  for (const [key, m] of Object.entries(marks)) {
    if (!m.star && !m.tags.length) continue
    if (tagFilter.value && !m.tags.includes(tagFilter.value)) continue
    const [sid, ch, p] = key.split('/')
    out.push({ key, sid, ch: Number(ch), p: Number(p), mark: m })
  }
  return out.sort((a, b) => (a.sid + a.ch).localeCompare(b.sid + b.ch) || a.p - b.p)
})

function metaOf(sid: string) {
  return index.value.find((m) => m.id === sid)
}

function chTitle(sid: string, ch: number) {
  return metaOf(sid)?.chapters.find((c) => c.no === ch)?.title ?? `第${ch}章`
}
</script>

<template>
  <div class="marks">
    <h1>书签与标签</h1>
    <div v-if="allTags().length" class="tag-bar">
      <button class="chip" :class="{ on: !tagFilter }" @click="tagFilter = null">全部</button>
      <button v-for="t in allTags()" :key="t" class="chip" :class="{ on: tagFilter === t }" @click="tagFilter = t">
        {{ t }}
      </button>
    </div>

    <p v-if="!rows.length" class="empty">还没有收藏。阅读页每段左上角的 ☆ 可收藏该段，并可为它加标签。</p>

    <router-link
      v-for="r in rows"
      :key="r.key"
      class="row"
      :to="`/read/${r.sid}/${r.ch}?p=${r.p}`"
    >
      <span class="row-loc">
        {{ metaOf(r.sid)?.shortTitle ?? r.sid }} · {{ chTitle(r.sid, r.ch) }} · 第 {{ r.p + 1 }} 段
      </span>
      <span class="row-text">{{ r.mark.snippet ?? '' }}</span>
      <span class="row-tags">
        <em v-for="t in r.mark.tags" :key="t">{{ t }}</em>
      </span>
    </router-link>
  </div>
</template>

<style scoped>
.marks {
  max-width: 860px;
  margin: 0 auto;
  padding: 30px 20px 60px;
}

.marks h1 {
  font-family: var(--font-serif);
  font-size: 26px;
  margin: 0 0 14px;
}

.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.chip {
  padding: 3px 12px;
  border: 1px solid var(--line-2);
  border-radius: 14px;
  font-size: 12.5px;
  color: var(--ink-2);
}

.chip.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.empty {
  color: var(--ink-3);
  padding: 40px 0;
  text-align: center;
}

.row {
  display: block;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  margin-bottom: 8px;
  color: var(--ink);
}

.row:hover {
  border-color: var(--accent);
}

.row-loc {
  display: block;
  font-size: 12.5px;
  color: var(--accent);
  margin-bottom: 4px;
}

.row-text {
  display: block;
  font-family: var(--font-serif);
  font-size: 14.5px;
  line-height: 1.8;
}

.row-tags {
  display: block;
  margin-top: 6px;
}

.row-tags em {
  font-style: normal;
  font-size: 11.5px;
  color: var(--ink-2);
  border: 1px solid var(--line-2);
  border-radius: 10px;
  padding: 0 8px;
  margin-right: 6px;
}
</style>
