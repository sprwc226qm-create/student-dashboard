<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

interface MenuGroup {
  label: string
  items: MenuItem[]
}

interface MenuItem {
  path: string
  icon: string
  label: string
}

const menuGroups: MenuGroup[] = [
  {
    label: '核心功能',
    items: [
      { path: '/', icon: '📊', label: '数据大屏' },
      { path: '/portrait/1', icon: '👤', label: '学生画像' },
      { path: '/warning-center', icon: '⚠️', label: '预警面板' },
      { path: '/ai-chat', icon: '🤖', label: 'AI 问答' },
    ],
  },
  {
    label: '报告管理',
    items: [
      { path: '/report', icon: '📄', label: '干预报告' },
      { path: '/report/create', icon: '📝', label: '创建报告' },
      { path: '/warning-rules', icon: '⚙️', label: '预警规则' },
    ],
  },
  {
    label: '数据管理',
    items: [
      { path: '/home', icon: '📋', label: '学生成绩' },
      { path: '/practice', icon: '📚', label: '课程管理' },
      { path: '/course-charts', icon: '📈', label: '课程图表' },
      { path: '/chart-demo', icon: '📉', label: '图表演示' },
    ],
  },
]

function navigate(path: string) {
  router.push(path)
}

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="layout">
    <!-- 侧栏 -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">🎓</div>
        <div class="brand-text">
          <span class="brand-name">学生分析平台</span>
          <span class="brand-ver">v2.0</span>
        </div>
      </div>

      <nav class="nav">
        <div v-for="group in menuGroups" :key="group.label" class="nav-group">
          <div class="nav-group-label">{{ group.label }}</div>
          <button
            v-for="item in group.items"
            :key="item.path"
            class="nav-item"
            :class="{ active: isActive(item.path) }"
            @click="navigate(item.path)"
          >
            <span class="nav-indicator" />
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </button>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="footer-line" />
        <span class="footer-text">Student Dashboard</span>
      </div>
    </aside>

    <!-- 内容区（带路由过渡动画） -->
    <main class="content">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
/* ====== 布局 ====== */
.layout {
  display: flex;
  min-height: 100vh;
}

/* ====== 侧栏 ====== */
.sidebar {
  width: 230px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #1e293b 100%);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

/* 顶部品牌区 */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 4px;
}
.brand-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 22px;
  flex-shrink: 0;
}
.brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.2px;
}
.brand-ver {
  font-size: 10px;
  color: #818cf8;
  font-weight: 500;
}

/* 导航区 */
.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}
.nav-group {
  margin-bottom: 4px;
}
.nav-group-label {
  padding: 16px 20px 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #6366f1;
  font-weight: 700;
  opacity: 0.8;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: all 0.2s ease;
}
.nav-item:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.05);
  padding-left: 20px;
}

/* 左侧激活指示条 */
.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: #818cf8;
  border-radius: 0 3px 3px 0;
  transition: height 0.25s ease;
}
.nav-item.active .nav-indicator {
  height: 60%;
}

.nav-item.active {
  color: #f1f5f9;
  background: rgba(99, 102, 241, 0.15);
}
.nav-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.nav-item:hover .nav-icon {
  transform: scale(1.15);
}
.nav-label {
  white-space: nowrap;
  font-weight: 450;
}

/* 底部水印 */
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: auto;
}
.footer-line {
  width: 24px;
  height: 2px;
  background: rgba(99, 102, 241, 0.5);
  border-radius: 1px;
  margin-bottom: 8px;
}
.footer-text {
  font-size: 11px;
  color: #475569;
  letter-spacing: 0.5px;
}

/* ====== 内容区 ====== */
.content {
  flex: 1;
  overflow-y: auto;
  background: var(--color-bg, #f8fafc);
}

/* ====== 路由切换动画 ====== */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ====== 移动端 H5 适配 ====== */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  .sidebar-brand {
    justify-content: center;
    padding: 14px 0;
  }
  .brand-text, .brand-name, .brand-ver { display: none; }
  .brand-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  .nav-group-label { display: none; }
  .nav-label { display: none; }
  .nav-item {
    justify-content: center;
    padding: 12px 0;
  }
  .nav-item:hover { padding-left: 0; }
  .nav-icon { font-size: 20px; width: auto; }
  .nav-indicator { display: none; }
  .sidebar-footer { display: none; }
  .content { overflow-x: auto; }
}
</style>
