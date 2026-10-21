<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { settings } from '../store/settings'

const router = useRouter()
const q = ref('')

function submitSearch() {
  const kw = q.value.trim()
  if (kw) router.push({ name: 'search', query: { q: kw } })
}

function toggleTheme() {
  settings.theme = settings.theme === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <header class="topbar">
    <router-link class="brand" to="/">颂读</router-link>
    <nav class="nav">
      <router-link to="/">四经</router-link>
      <router-link to="/marks">书签</router-link>
    </nav>
    <form class="search" @submit.prevent="submitSearch">
      <input v-model="q" type="search" placeholder="搜索经文 / 白话…" aria-label="全文搜索" />
    </form>
    <button class="icon-btn" :title="settings.theme === 'light' ? '夜间' : '日间'" @click="toggleTheme">
      {{ settings.theme === 'light' ? '☾' : '☀' }}
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
