<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { GlossaryEntry, Para } from '../types'
import { settings } from '../store/settings'
import { getMark, markKey, toggleStar, toggleTag, allTags } from '../store/marks'
import { openTerm } from '../store/termPop'
import { segment } from '../lib/terms'

const props = defineProps<{
  sid: string
  chNo: number
  para: Para
  total: number
}>()
const emit = defineEmits<{ seen: [i: number] }>()

const key = computed(() => markKey(props.sid, props.chNo, props.para.i))
const mark = computed(() => getMark(key.value))
const segs = computed(() => segment(props.para.o))
const paraTerms = computed(() => {
  const seen = new Map<string, GlossaryEntry>()
  for (const s of segs.value) if (s.kind === 'term' && s.entry) seen.set(s.entry.term, s.entry)
  return [...seen.values()]
})
const vLines = computed(() => (props.para.v ? props.para.v.split('\n') : []))

const showO = computed(() => settings.mode !== 'bai')
const showV = computed(() => settings.mode !== 'yuan')

const bodyClass = computed(() => ({
  'm-cols': settings.mode === 'cols' && !settings.vertical,
  'm-stack': settings.mode === 'stack' && !settings.vertical,
  'm-yuan': settings.mode === 'yuan' || settings.vertical,
  'm-bai': settings.mode === 'bai',
  vertical: settings.vertical,
}))

const oClass = computed(() => (settings.font === 'kai' ? 'font-kai' : 'font-serif'))

const tagPop = ref(false)
const termPop = ref(false)
const tagInput = ref('')

function addTag() {
  const t = tagInput.value.trim()
  if (!t) return
  toggleTag(key.value, t)
  tagInput.value = ''
}

async function copyLink() {
  const url = `${location.origin}${location.pathname}#/read/${props.sid}/${props.chNo}?p=${props.para.i}`
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    window.prompt('复制段落链接：', url)
  }
}

const root = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null
onMounted(() => {
  io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) emit('seen', props.para.i)
    },
    { rootMargin: '0px 0px -60% 0px' },
  )
  if (root.value) io.observe(root.value)
})
onUnmounted(() => io?.disconnect())
</script>

<template>
  <article :id="'p-' + para.i" ref="root" class="para" :class="{ gatha: para.g }">
    <div class="para-toolbar">
      <button
        class="tb-star"
        :class="{ on: mark.star }"
        :title="mark.star ? '取消收藏' : '收藏本段'"
        @click="toggleStar(key, para.o.slice(0, 46))"
      >
        {{ mark.star ? '★' : '☆' }}
      </button>
      <button class="tb-pill" :class="{ on: mark.tags.length }" @click="tagPop = !tagPop; termPop = false">
        标签<span v-if="mark.tags.length"> {{ mark.tags.length }}</span>
      </button>
      <button v-if="paraTerms.length" class="tb-link" @click="termPop = !termPop; tagPop = false">
        术语解 {{ paraTerms.length }}
      </button>
      <button class="tb-icon" title="复制本段链接" @click="copyLink">⧉</button>
      <span class="para-no">{{ para.i + 1 }} / {{ total }}</span>
    </div>

    <div v-if="tagPop" class="pop" @click.stop>
      <div class="pop-tags">
        <button
          v-for="t in mark.tags"
          :key="t"
          class="chip on"
          :title="'移除标签 ' + t"
          @click="toggleTag(key, t)"
        >
          {{ t }} ✕
        </button>
        <button v-for="t in allTags().filter((x) => !mark.tags.includes(x)).slice(0, 8)" :key="t" class="chip" @click="toggleTag(key, t)">
          + {{ t }}
        </button>
      </div>
      <form class="pop-tag-add" @submit.prevent="addTag">
        <input v-model="tagInput" placeholder="新标签，回车添加" />
      </form>
    </div>

    <div v-if="termPop" class="pop" @click.stop>
      <div v-for="t in paraTerms" :key="t.term" class="pop-term">
        <strong>{{ t.term }}</strong>
        <span>{{ t.gloss }}</span>
      </div>
    </div>

    <div class="para-body" :class="bodyClass">
      <div
        v-if="showO"
        class="para-o"
        :class="oClass"
        :style="{ fontSize: settings.fontSize + 'px' }"
      >
        <template v-for="(sg, si) in segs" :key="si">
          <span v-if="sg.kind === 'term'" class="term" @click.stop="openTerm(sg.entry!, $event)">
            {{ sg.text }}
          </span>
          <template v-else>{{ sg.text }}</template>
        </template>
      </div>
      <div v-if="showV" class="para-v" :style="{ fontSize: settings.fontSize - 4 + 'px' }">
        <template v-if="para.v">
          <p v-for="(ln, li) in vLines" :key="li">{{ ln }}</p>
        </template>
        <p v-else class="v-missing">白话整理中…</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.para {
  padding: 14px 0 18px;
  border-bottom: 1px solid var(--line);
  position: relative;
}

.para-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  min-height: 24px;
}

.tb-star {
  font-size: 16px;
  color: var(--ink-3);
}

.tb-star.on {
  color: var(--accent);
}

.tb-pill {
  padding: 1px 10px;
  border: 1px solid var(--line-2);
  border-radius: 12px;
  font-size: 12px;
  color: var(--ink-2);
}

.tb-pill.on {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.tb-link {
  font-size: 12.5px;
  color: var(--accent);
}

.tb-icon {
  font-size: 14px;
  color: var(--ink-3);
}

.tb-icon:hover,
.tb-link:hover,
.tb-star:hover {
  color: var(--accent);
}

.para-no {
  margin-left: auto;
  font-size: 12px;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}

.pop {
  position: absolute;
  z-index: 30;
  left: 0;
  right: 0;
  top: 38px;
  padding: 10px 12px;
  background: var(--panel);
  border: 1px solid var(--line-2);
  border-radius: 10px;
  box-shadow: var(--shadow);
}

.pop-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 2px 10px;
  border: 1px solid var(--line-2);
  border-radius: 12px;
  font-size: 12px;
  color: var(--ink-2);
}

.chip.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.pop-tag-add {
  margin-top: 8px;
}

.pop-tag-add input {
  width: 100%;
  padding: 5px 10px;
  border: 1px solid var(--line-2);
  border-radius: 8px;
  background: var(--paper);
  color: var(--ink);
  font-family: inherit;
  font-size: 13px;
  outline: none;
}

.pop-term {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.7;
  padding: 3px 0;
}

.pop-term strong {
  flex: 0 0 auto;
  color: var(--accent);
}

.pop-term span {
  color: var(--ink-2);
}

.para-body {
  display: grid;
  gap: 18px;
}

.para-body.m-cols {
  grid-template-columns: minmax(0, 7fr) minmax(0, 6fr);
  align-items: start;
}

.para-body.m-stack,
.para-body.m-yuan,
.para-body.m-bai {
  grid-template-columns: 1fr;
}

.para-o {
  font-family: var(--font-serif);
  font-weight: 600;
  line-height: 1.95;
  letter-spacing: 0.02em;
  color: var(--ink);
}

.para-o.font-kai {
  font-family: var(--font-ui);
  font-weight: 400;
}

.para-body.vertical {
  display: block;
  overflow-x: auto;
  padding: 8px 4px 16px;
}

.para-body.vertical .para-o {
  writing-mode: vertical-rl;
  height: min(62vh, 560px);
  line-height: 2.4;
  letter-spacing: 0.12em;
  margin: 0 auto;
  width: max-content;
  max-width: 100%;
}

.term {
  border-bottom: 1px dotted var(--accent);
  cursor: pointer;
}

.term:hover {
  color: var(--accent);
  background: var(--accent-soft);
}

.para-v {
  color: var(--ink-2);
  line-height: 1.9;
}

.para-v p {
  margin: 0 0 0.4em;
}

.para-v p:last-child {
  margin-bottom: 0;
}

.v-missing {
  color: var(--ink-3);
  font-style: italic;
}

.para.gatha .para-o {
  text-align: center;
  letter-spacing: 0.14em;
  padding: 6px 0;
}

.para.gatha .para-v {
  text-align: center;
}

@media (max-width: 860px) {
  .para-body.m-cols {
    grid-template-columns: 1fr;
  }
}
</style>
