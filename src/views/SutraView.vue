<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { SutraMeta } from '../types'
import { loadIndex } from '../data/api'
import { progress } from '../store/progress'

const route = useRoute()
const meta = ref<SutraMeta | null>(null)

watch(
  () => route.params.id,
  async (id) => {
    const list = await loadIndex()
    meta.value = list.find((m) => m.id === id) ?? null
  },
  { immediate: true },
)

onMounted(() => {
  /* watch immediate 已触发 */
})
</script>

<template>
  <div v-if="meta" class="sutra" :style="{ '--ac': meta.accent }">
    <header class="su-head">
      <h1>{{ meta.title }}</h1>
      <p class="su-sanskrit">{{ meta.sanskrit }}</p>
      <p class="su-meta">{{ meta.dynasty }} · {{ meta.translator }} · {{ meta.era }}</p>
      <p class="su-desc">{{ meta.desc }}</p>
      <blockquote class="su-quote">「{{ meta.quote }}」</blockquote>
    </header>

    <section class="su-chapters">
      <h2>目录</h2>
      <router-link
        v-for="c in meta.chapters"
        :key="c.no"
        class="su-ch"
        :to="`/read/${meta.id}/${c.no}`"
      >
        <span class="su-ch-no">{{ c.no }}</span>
        <span class="su-ch-body">
          <strong>{{ c.title }}</strong>
          <em v-if="c.note">{{ c.note }}</em>
        </span>
        <span class="su-ch-stat">
          {{ c.paras }} 段 · 白话 {{ c.translated === c.paras ? '全' : c.translated + '/' + c.paras }}
          <template v-if="progress[meta.id]?.ch === c.no"> · 在读</template>
        </span>
      </router-link>
    </section>
  </div>
  <p v-else class="loading">载入中…</p>
</template>

<style scoped>
.loading {
  padding: 60px;
  text-align: center;
  color: var(--ink-3);
}

.sutra {
  max-width: 860px;
  margin: 0 auto;
  padding: 34px 20px 60px;
}

.su-head {
  text-align: center;
  padding-bottom: 22px;
  border-bottom: 2px solid var(--ac);
}

.su-head h1 {
  margin: 0;
  font-family: var(--font-kai);
  font-size: 40px;
  font-weight: 400;
  letter-spacing: 6px;
}

.su-sanskrit {
  margin: 6px 0 0;
  color: var(--ink-3);
  font-size: 13px;
  letter-spacing: 1px;
}

.su-meta {
  margin: 10px 0 0;
  color: var(--ink-2);
  font-size: 14px;
}

.su-desc {
  margin: 12px auto 0;
  max-width: 620px;
  color: var(--ink-2);
  font-size: 14.5px;
  line-height: 1.9;
}

.su-quote {
  margin: 16px 0 0;
  color: var(--ac);
  font-family: var(--font-serif);
  font-size: 15px;
}

.su-chapters {
  margin-top: 26px;
}

.su-chapters h2 {
  margin: 0 0 10px;
  font-family: var(--font-serif);
  font-size: 18px;
}

.su-ch {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  margin-bottom: 8px;
  background: var(--panel);
  color: var(--ink);
  transition: border-color 0.15s;
}

.su-ch:hover {
  border-color: var(--ac);
}

.su-ch-no {
  flex: 0 0 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--ac);
  font-size: 13px;
  font-weight: 600;
}

.su-ch-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.su-ch-body strong {
  font-family: var(--font-serif);
  font-size: 15.5px;
}

.su-ch-body em {
  font-style: normal;
  color: var(--ink-3);
  font-size: 12.5px;
}

.su-ch-stat {
  margin-left: auto;
  color: var(--ink-3);
  font-size: 12.5px;
  white-space: nowrap;
}
</style>
