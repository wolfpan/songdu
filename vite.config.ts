import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base './' + hash 路由：构建产物为纯静态文件，可部署到任意静态托管的子路径
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: { port: 5199 },
})
