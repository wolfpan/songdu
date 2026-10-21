<script setup lang="ts">
import { onMounted } from 'vue'
import TopBar from './components/TopBar.vue'
import TermPopover from './components/TermPopover.vue'
import { loadGlossary } from './data/api'
import { setGlossary } from './lib/terms'

onMounted(async () => {
  setGlossary(await loadGlossary())
})
</script>

<template>
  <TopBar />
  <router-view />
  <TermPopover />
  <footer class="site-footer">
    <p>
      底本：《大正新修大藏经》公版经文 · 白话译文由 AI 生成，仅供参考 ·
      <router-link to="/">颂读</router-link>
    </p>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 28px 16px 40px;
  text-align: center;
  color: var(--ink-3);
  font-size: 13px;
}
</style>
