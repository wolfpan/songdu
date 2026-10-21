import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/sutra/:id', name: 'sutra', component: () => import('./views/SutraView.vue') },
    { path: '/read/:id/:ch', name: 'read', component: () => import('./views/ReadView.vue') },
    { path: '/marks', name: 'marks', component: () => import('./views/MarksView.vue') },
    { path: '/search', name: 'search', component: () => import('./views/SearchView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
