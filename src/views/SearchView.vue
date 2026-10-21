<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { SearchDoc, SutraMeta } from '../types'
import { loadIndex, loadSearch } from '../data/api'

const route = useRoute()
const docs = ref<SearchDoc[]>([])
const index = ref<SutraMeta[]>([])
const q = ref(String(route.query.q ?? ''))
const searched = ref('')

watch(
  () => route.query.q,
  (v) => {
    q.value = String(v ?? '')
    run()
  },
)

onMounted(async () => {
  ;[docs.value, index.value] = await Promise.all([loadSearch(), loadIndex()])
  run()
})

function run() {
  searched.value = q.value.trim()
}

const results = computed(() => {
  const kw = searched.value
  if (!kw || !docs.value.length) return []
  return docs.value.filter((d) => d.o.includes(kw) || (d.v ?? '').includes(kw)).slice(0, 200)
})

function locOf(d: SearchDoc) {
  const m = index.value.find((x) => x.id === d.s)
  const ch = m?.chapters.find((c) => c.no === d.c)
  return `${m?.shortTitle ?? d.s} · ${ch?.title ?? '第' + d.c + '章'} · 第 ${d.p + 1} 段`
}

function hl(text: string) {
  const kw = searched.value
  if (!kw) return [text]
  return text.split(kw).join('\u0000' + kw + '\u0000').split('\u0000')
}
</script>

<template>
  <div class="search">
    <h1>全文检索</h1>
    <p class="hint">检索范围：四经原文与白话，共 {{ docs.length }} 段。</p>

    <p v-if="searched && results.length" class="count">「{{ searched }}」命中 {{ results.length }} 段（至多显示 200）</p>
    <p v-else-if="searched" class="count">「{{ searched }}」无命中。</p>

    <router-link
      v-for="(d, i) in results"
      :key="i"
      class="hit"
      :to="`/read/${d.s}/${d.c}?p=${d.p}`"
    >
      <span class="hit-loc">{{ locOf(d) }}</span>
      <span class="hit-o">
        <template v-for="(part, pi) in hl(d.o)" :key="pi">
          <mark v-if="part === searched">{{ part }}</mark>
          <template v-else>{{ part }}</template>
        </template>
      </span>
      <span v-if="d.v" class="hit-v">
        <template v-for="(part, pi) in hl(d.v)" :key="pi">
          <mark v-if="part === searched">{{ part }}</mark>
          <template v-else>{{ part }}</template>
        </template>
      </span>
    </router-link>
  </div>
</template>

<style scoped>
.search {
  max-width: 860px;
  margin: 0 auto;
  padding: 30px 20px 60px;
}

.search h1 {
  font-family: var(--font-serif);
  font-size: 26px;
  margin: 0 0 6px;
}

.hint {
  color: var(--ink-3);
  font-size: 13px;
  margin: 0 0 18px;
}

.count {
  color: var(--accent);
  font-size: 13.5px;
}

.hit {
  display: block;
  padding: 12px 16px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  margin-bottom: 8px;
  color: var(--ink);
}

.hit:hover {
  border-color: var(--accent);
}

.hit-loc {
  display: block;
  font-size: 12.5px;
  color: var(--accent);
  margin-bottom: 4px;
}

.hit-o {
  display: block;
  font-family: var(--font-serif);
  font-size: 15px;
  line-height: 1.8;
}

.hit-v {
  display: block;
  margin-top: 4px;
  color: var(--ink-2);
  font-size: 13.5px;
  line-height: 1.8;
}

mark {
  background: var(--mark);
  color: inherit;
  padding: 0 1px;
  border-radius: 2px;
}
</style>
