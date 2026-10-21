import { createApp } from 'vue'
import '@fontsource/noto-serif-sc/400.css'
import '@fontsource/noto-serif-sc/600.css'
import '@fontsource/ma-shan-zheng'
import 'lxgw-wenkai-screen-web/style.css'
import './styles/theme.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
