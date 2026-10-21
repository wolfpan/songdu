<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { SutraMeta } from '../types'
import { loadIndex } from '../data/api'
import { lastRead, progress } from '../store/progress'

const index = ref<SutraMeta[]>([])
onMounted(async () => {
  index.value = await loadIndex()
})

function progressText(m: SutraMeta): string {
  const p = progress[m.id]
  if (!p) return ''
  const ch = m.chapters.find((c) => c.no === p.ch)
  return ch ? `读到 ${ch.title} 第 ${p.p + 1} 段` : ''
}
</script>

<template>
  <div class="home">
    <section class="hero">
      <h1>颂读</h1>
      <p class="hero-sub">禅宗四经 · 原文与白话逐段对照</p>
      <p class="hero-line">「凡所有相，皆是虚妄。若见诸相非相，即见如来。」</p>
      <router-link v-if="lastRead" class="hero-continue" :to="`/read/${lastRead.sid}/${lastRead.ch}?p=${lastRead.p}`">
        继续上次阅读 ›
      </router-link>
    </section>

    <section class="cards">
      <router-link v-for="m in index" :key="m.id" class="card" :to="`/sutra/${m.id}`" :style="{ '--ac': m.accent }">
        <span class="card-bar"></span>
        <h2>{{ m.shortTitle }}</h2>
        <p class="card-title">{{ m.title }}</p>
        <p class="card-meta">{{ m.dynasty }} · {{ m.translator }} · {{ m.era }}</p>
        <p class="card-quote">「{{ m.quote }}」</p>
        <p class="card-stats">
          {{ m.chapters.length }} 章 · {{ m.chapters.reduce((n, c) => n + c.paras, 0) }} 段
          <template v-if="progressText(m)"> · {{ progressText(m) }}</template>
        </p>
      </router-link>
    </section>

    <section class="intro">
      <h3>关于颂读</h3>
      <p>
        颂读是一座研读型的读经台：左侧经目、中间正文、右畔诵读助手，原文与白话逐段相照，
        术语点线可点、段落可藏可签。底本取《大正新修大藏经》公版经文；白话译文由 AI
        生成，仅供参阅，愿以此功德，普及于一切。
      </p>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1060px;
  margin: 0 auto;
  padding: 30px 20px 40px;
}

.hero {
  text-align: center;
  padding: 34px 0 26px;
}

.hero h1 {
  margin: 0;
  font-family: var(--font-kai);
  font-size: 56px;
  font-weight: 400;
  letter-spacing: 10px;
  color: var(--ink);
}

.hero-sub {
  margin: 8px 0 0;
  color: var(--ink-2);
  letter-spacing: 3px;
}

.hero-line {
  margin: 18px 0 0;
  color: var(--ink-3);
  font-family: var(--font-serif);
}

.hero-continue {
  display: inline-block;
  margin-top: 18px;
  padding: 7px 22px;
  border: 1px solid var(--accent);
  border-radius: 20px;
  color: var(--accent);
  font-size: 14px;
}

.hero-continue:hover {
  background: var(--accent-soft);
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
  margin-top: 10px;
}

.card {
  position: relative;
  display: block;
  padding: 22px 20px 18px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--ink);
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}

.card-bar {
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: var(--ac);
}

.card h2 {
  margin: 4px 0 2px;
  font-family: var(--font-kai);
  font-size: 30px;
  font-weight: 400;
  letter-spacing: 4px;
}

.card-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 13.5px;
  color: var(--ink-2);
}

.card-meta {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--ink-3);
}

.card-quote {
  margin: 12px 0 0;
  font-family: var(--font-serif);
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--ink-2);
  min-height: 3.6em;
}

.card-stats {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--ac);
}

.intro {
  margin-top: 34px;
  padding: 20px 24px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
}

.intro h3 {
  margin: 0 0 8px;
  font-family: var(--font-serif);
  font-size: 17px;
}

.intro p {
  margin: 0;
  color: var(--ink-2);
  font-size: 14px;
  line-height: 1.9;
}
</style>
