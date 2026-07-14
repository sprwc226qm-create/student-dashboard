import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // ====== Module 1: 数据可视化大屏 ======
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/dashboard/index.vue'),
    meta: { title: '数据可视化大屏' },
  },
  // ====== Module 2: 学生画像 ======
  {
    path: '/portrait/:id',
    name: 'PortraitDetail',
    component: () => import('@/pages/portrait/[id].vue'),
    meta: { title: '学生画像' },
  },
  {
    path: '/portrait',
    name: 'PortraitDefault',
    redirect: '/portrait/1',
  },
  // ====== 原有页面保留 ======
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/pages/home/index.vue'),
    meta: { title: '学生成绩一览' },
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('@/pages/practice/index.vue'),
    meta: { title: '课程管理' },
  },
  {
    path: '/chart-demo',
    name: 'ChartDemo',
    component: () => import('@/pages/chart-demo/index.vue'),
    meta: { title: '图表演示' },
  },
  {
    path: '/course-charts',
    name: 'CourseCharts',
    component: () => import('@/pages/course-charts/index.vue'),
    meta: { title: '课程图表' },
  },
  {
    path: '/warning-rules',
    name: 'WarningRules',
    component: () => import('@/pages/warning-rules/index.vue'),
    meta: { title: '预警规则' },
  },
  // ====== Module 3: 预警面板 ======
  {
    path: '/warning-center',
    name: 'WarningCenter',
    component: () => import('@/pages/warning-center/index.vue'),
    meta: { title: '学业风险预警面板' },
  },
  // ====== Module 4: 报告生成 ======
  {
    path: '/report',
    name: 'ReportList',
    component: () => import('@/pages/report/index.vue'),
    meta: { title: '干预报告管理' },
  },
  {
    path: '/report/create',
    name: 'ReportCreate',
    component: () => import('@/pages/report/create.vue'),
    meta: { title: '创建报告' },
  },
  // ====== Module 5: AI 智能问答 ======
  {
    path: '/ai-chat',
    name: 'AiChat',
    component: () => import('@/pages/ai-chat/index.vue'),
    meta: { title: 'AI 智能问答' },
  },
  // ====== 404 兜底 ======
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 同步页面标题
router.afterEach((to) => {
  const title = to.meta?.title
  document.title = title ? `${title} — 学生行为分析平台` : '学生行为分析平台'
})

export default router
