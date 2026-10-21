<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { settings } from '../store/settings'
import { drawers } from '../store/ui'

const route = useRoute()
const router = useRouter()
const q = ref('')

const isRead = computed(() => route.name === 'read')

function submitSearch() {
  const kw = q.value.trim()
  if (kw) router.push({ name: 'search', query: { q: kw } })
}

function toggleTheme() {
  settings.theme = settings.theme === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <header class="topbar" :class="{ zen: settings.zen }">
    <template v-if="!settings.zen">
      <router-link class="brand" to="/">颂读</router-link>
      <nav class="nav">
        <router-link to="/">四经</router-link>
        <router-link to="/marks">书签</router-link>
      </nav>
      <form class="search" @submit.prevent="submitSearch">
        <input v-model="q" type="search" placeholder="搜索经文 / 白话…" aria-label="全文搜索" />
      </form>
      <template v-if="isRead">
        <button class="icon-btn btn-tree" title="经目" @click="drawers.tree = !drawers.tree">☰</button>
        <button class="icon-btn btn-tools" title="诵读助手" @click="drawers.tools = !drawers.tools">⚙</button>
      </template>
    </template>
    <button
      class="icon-btn"
      :class="{ 'ml-a': settings.zen }"
      :title="settings.theme === 'light' ? '夜间' : '日间'"
      @click="toggleTheme"
    >
      {{ settings.theme === 'light' ? '☾' : '☀' }}
    </button>
    <button
      class="zen-btn"
      :title="settings.zen ? '退出静读' : '静读模式'"
      @click="settings.zen = !settings.zen"
    >
      {{ settings.zen ? '明' : '静' }}
    </button>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 18px;
  height: var(--topbar-h);
  padding: 0 18px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
}

.brand {
  font-family: var(--font-kai);
  font-size: 26px;
  line-height: 1;
  color: var(--ink);
  letter-spacing: 2px;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav a {
  color: var(--ink-2);
  padding: 4px 2px;
  border-bottom: 2px solid transparent;
}

.nav a.router-link-exact-active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.search {
  margin-left: auto;
  flex: 0 1 260px;
}

.search input {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid var(--line-2);
  border-radius: 16px;
  background: var(--paper);
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.search input:focus {
  border-color: var(--accent);
}

.icon-btn {
  font-size: 17px;
  color: var(--ink-2);
  padding: 4px 8px;
  border-radius: 6px;
}

.icon-btn:hover {
  background: var(--accent-soft);
  color: var(--accent);
}

.ml-a {
  margin-left: auto;
}

.zen-btn {
  font-family: var(--font-kai);
  font-size: 19px;
  line-height: 1;
  color: var(--accent);
  padding: 4px 10px;
  border-radius: 6px;
}

.zen-btn:hover {
  background: var(--accent-soft);
}

.topbar.zen {
  background: transparent;
  border-bottom-color: transparent;
}

/* 阅读页抽屉开关：仅窄视口显示（宽视口两栏常驻） */
.btn-tree,
.btn-tools {
  display: none;
}

@media (max-width: 960px) {
  .btn-tree {
    display: inline-block;
  }
}

@media (max-width: 1200px) {
  .btn-tools {
    display: inline-block;
  }
}

@media (max-width: 640px) {
  .topbar {
    gap: 10px;
    padding: 0 10px;
  }

  .brand {
    font-size: 22px;
    letter-spacing: 1px;
  }

  .nav {
    gap: 10px;
  }

  .nav a {
    font-size: 14px;
  }

  .search {
    flex: 1 1 110px;
  }

  .search input {
    font-size: 13px;
    padding: 4px 10px;
  }
}
</style>
