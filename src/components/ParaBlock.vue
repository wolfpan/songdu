<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { GlossaryEntry, Para } from '../types'
import { settings } from '../store/settings'
import { getMark, markKey, removeTag, toggleStar, toggleTag, allTags } from '../store/marks'
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
  'm-cols': settings.mode === 'cols',
  'm-stack': settings.mode === 'stack',
  'm-yuan': settings.mode === 'yuan',
  'm-bai': settings.mode === 'bai',
}))

const oClass = computed(() => (settings.font === 'kai' ? 'font-kai' : 'font-serif'))

const tagPop = ref(false)
const termPop = ref(false)
const zenPop = ref(false)
const tagInput = ref('')

/* 三个抽屉（标签 / 术语解 / 静读 ⧉）自动收起：指针离开范围即收，点击范围外也收。
   判定范围 = 抽屉 + 触发按钮，边界按各自尺寸四边外扩 15%，避免鼠标小幅晃动误触；
   触屏指针不参与移动判定。 */
const PAD = 0.15
const btnTag = ref<HTMLElement>()
const btnTerm = ref<HTMLElement>()
const btnZen = ref<HTMLElement>()
const popTag = ref<HTMLElement>()
const popTerm = ref<HTMLElement>()
const popZen = ref<HTMLElement>()

function insideRect(x: number, y: number, el: HTMLElement | undefined) {
  if (!el) return false
  const r = el.getBoundingClientRect()
  const dx = r.width * PAD
  const dy = r.height * PAD
  return x >= r.left - dx && x <= r.right + dx && y >= r.top - dy && y <= r.bottom + dy
}

function popPairs() {
  return [
    [popTag.value, btnTag.value],
    [popTerm.value, btnTerm.value],
    [popZen.value, btnZen.value],
  ] as const
}

function onDocMove(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  for (const [pop, btn] of popPairs()) {
    if (!pop) continue
    if (insideRect(e.clientX, e.clientY, pop)) continue
    if (insideRect(e.clientX, e.clientY, btn)) continue
    zenPop.value = tagPop.value = termPop.value = false
    return
  }
}

function onDocClick(e: MouseEvent) {
  const t = e.target
  if (!(t instanceof Element)) return
  const pairs = popPairs()
  // 点击触发按钮：开合/换抽屉由按钮自身的处理器管理，这里不干预
  if (pairs.some(([, btn]) => btn && btn.contains(t))) return
  for (const [pop] of pairs) {
    if (!pop) continue
    if (pop.contains(t)) continue
    zenPop.value = tagPop.value = termPop.value = false
    return
  }
}

watch([tagPop, termPop, zenPop], ([a, b, c]) => {
  if (a || b || c) {
    document.addEventListener('pointermove', onDocMove)
    document.addEventListener('click', onDocClick)
  } else {
    document.removeEventListener('pointermove', onDocMove)
    document.removeEventListener('click', onDocClick)
  }
})
onUnmounted(() => {
  document.removeEventListener('pointermove', onDocMove)
  document.removeEventListener('click', onDocClick)
})

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
    <div class="para-toolbar" :class="{ zen: settings.zen, lit: zenPop }">
      <template v-if="!settings.zen">
        <button
          class="tb-star"
          :class="{ on: mark.star }"
          :title="mark.star ? '取消收藏' : '收藏本段'"
          @click="toggleStar(key, para.o.slice(0, 46))"
        >
          {{ mark.star ? '★' : '☆' }}
        </button>
        <button
          ref="btnTag"
          class="tb-pill"
          :class="{ on: mark.tags.length }"
          @click="tagPop = !tagPop; termPop = false"
        >
          标签<span v-if="mark.tags.length"> {{ mark.tags.length }}</span>
        </button>
        <button
          v-if="paraTerms.length"
          ref="btnTerm"
          class="tb-link"
          @click="termPop = !termPop; tagPop = false"
        >
          术语解 {{ paraTerms.length }}
        </button>
        <button class="tb-icon" title="复制本段链接" @click="copyLink">⧉</button>
        <span class="para-no">{{ para.i + 1 }} / {{ total }}</span>
      </template>
      <template v-else>
        <button ref="btnZen" class="tb-icon" title="本段操作" @click="zenPop = !zenPop">⧉</button>
      </template>
    </div>

    <div v-if="zenPop" ref="popZen" class="pop" @click.stop>
      <div class="pop-zen-row">
        <button class="pop-act" :class="{ on: mark.star }" @click="toggleStar(key, para.o.slice(0, 46))">
          {{ mark.star ? '★ 已收藏' : '☆ 收藏本段' }}
        </button>
        <button class="pop-act" @click="copyLink">⧉ 复制链接</button>
        <span class="para-no">{{ para.i + 1 }} / {{ total }}</span>
      </div>
      <div class="pop-tags">
        <button
          v-for="t in mark.tags"
          :key="t"
          class="chip on"
          :title="'移除标签 ' + t"
          @click="removeTag(key, t)"
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
      <template v-if="paraTerms.length">
        <div v-for="t in paraTerms" :key="t.term" class="pop-term">
          <strong>{{ t.term }}</strong>
          <span>{{ t.gloss }}</span>
        </div>
      </template>
    </div>

    <div v-if="tagPop" ref="popTag" class="pop" @click.stop>
      <div class="pop-tags">
        <button
          v-for="t in mark.tags"
          :key="t"
          class="chip on"
          :title="'移除标签 ' + t"
          @click="removeTag(key, t)"
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

    <div v-if="termPop" ref="popTerm" class="pop" @click.stop>
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

.para-toolbar.zen {
  opacity: 0.3;
  transition: opacity 0.2s;
}

.para:hover .para-toolbar.zen,
.para-toolbar.zen.lit {
  opacity: 1;
}

.pop-zen-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.pop-act {
  font-size: 13px;
  color: var(--ink-2);
  padding: 2px 6px;
  border-radius: 6px;
}

.pop-act:hover {
  background: var(--accent-soft);
  color: var(--accent);
}

.pop-act.on {
  color: var(--accent);
  font-weight: 600;
}

.pop-zen-row .para-no {
  margin-left: auto;
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
