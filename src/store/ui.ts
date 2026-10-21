import { reactive, watch } from 'vue'

// 阅读页抽屉开关（移动端）：目录树 / 诵读助手
export const drawers = reactive({ tree: false, tools: false })

/* 侧栏抽屉仅点击范围外（抽屉与开关按钮之外）时收起，不启用指针远离自动收起 */
function onDocClick(e: MouseEvent) {
  const t = e.target
  if (!(t instanceof Element)) return
  for (const key of ['tree', 'tools'] as const) {
    if (!drawers[key]) continue
    const panel = document.querySelector(key === 'tree' ? '.side-tree' : '.tools')
    if (panel && panel.contains(t)) continue
    const btn = document.querySelector(key === 'tree' ? '.btn-tree' : '.btn-tools')
    if (btn && btn.contains(t)) continue
    drawers[key] = false
  }
}

watch(
  () => drawers.tree || drawers.tools,
  (open) => {
    if (open) document.addEventListener('click', onDocClick)
    else document.removeEventListener('click', onDocClick)
  },
)
