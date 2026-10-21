<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { closeTerm, termPop } from '../store/termPop'

const KIND = { term: '术语', person: '人物', place: '地名' } as const

function onDocClick() {
  closeTerm()
}
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div
    v-if="termPop.entry"
    class="term-pop"
    :style="{ left: termPop.x + 'px', top: termPop.y + 'px' }"
    @click.stop
  >
    <div class="tp-head">
      <strong>{{ termPop.entry.term }}</strong>
      <span class="tp-kind">{{ KIND[termPop.entry.kind] }}</span>
      <button class="tp-close" @click="closeTerm">✕</button>
    </div>
    <p class="tp-gloss">{{ termPop.entry.gloss }}</p>
  </div>
</template>

<style scoped>
.term-pop {
  position: fixed;
  z-index: 90;
  width: 320px;
  max-width: calc(100vw - 24px);
  padding: 12px 14px;
  background: var(--panel);
  border: 1px solid var(--line-2);
  border-radius: 10px;
  box-shadow: var(--shadow);
}

.tp-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tp-head strong {
  font-family: var(--font-serif);
  font-size: 16px;
}

.tp-kind {
  font-size: 11px;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 4px;
  padding: 0 5px;
}

.tp-close {
  margin-left: auto;
  color: var(--ink-3);
  font-size: 12px;
}

.tp-gloss {
  margin: 8px 0 0;
  color: var(--ink-2);
  font-size: 13.5px;
  line-height: 1.75;
}
</style>
