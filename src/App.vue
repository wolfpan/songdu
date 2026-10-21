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
</template>
