// src/stores/dashboard.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  OverviewStats,
  StudyTrendPoint,
  LibraryHeatmapPoint,
  CanteenData,
  CampusArea,
  DepartmentComparison,
  BehaviorEvent,
  RefreshInterval,
} from '@/types/dashboard'
import {
  mockOverview,
  mockStudyTrend,
  mockLibraryHeatmap,
  mockCanteenData,
  mockCampusAreas,
  mockDepartmentComparison,
  generateRealtimeEvent,
  generateStudyTrendByGrade,
} from '@/mocks/data/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  // ---- 状态 ----
  const overview = ref<OverviewStats>({ ...mockOverview })
  const studyTrend = ref<StudyTrendPoint[]>(mockStudyTrend)
  const libraryHeatmap = ref<LibraryHeatmapPoint[]>(mockLibraryHeatmap)
  const canteenData = ref<CanteenData[]>(mockCanteenData)
  const campusAreas = ref<CampusArea[]>(mockCampusAreas)
  const departmentComparison = ref<DepartmentComparison[]>(mockDepartmentComparison)
  const realtimeEvents = ref<BehaviorEvent[]>([])

  const gradeFilter = ref<string>('all')
  const majorFilter = ref<string>('all')
  const refreshInterval = ref<RefreshInterval>(0)
  const autoRefresh = ref(false)
  let refreshTimer: ReturnType<typeof setInterval> | null = null
  let eventTimer: ReturnType<typeof setInterval> | null = null

  // ---- 计算属性 ----
  const filteredStudyTrend = computed(() => {
    if (gradeFilter.value !== 'all') {
      return generateStudyTrendByGrade(gradeFilter.value)
    }
    return studyTrend.value
  })

  const gradeOptions = [
    { label: '全部年级', value: 'all' },
    { label: '大一', value: '大一' },
    { label: '大二', value: '大二' },
    { label: '大三', value: '大三' },
    { label: '大四', value: '大四' },
  ]

  const majorOptions = [
    { label: '全部专业', value: 'all' },
    { label: '软件工程', value: '软件工程' },
    { label: '计算机科学', value: '计算机科学' },
    { label: '数据科学', value: '数据科学' },
    { label: '人工智能', value: '人工智能' },
  ]

  // ---- 方法 ----
  function refreshData() {
    // 模拟数据刷新（略微变动数值）
    overview.value = {
      ...mockOverview,
      activeToday: mockOverview.activeToday + Math.floor(Math.random() * 100) - 50,
      avgStudyHours: +(mockOverview.avgStudyHours + Math.random() * 0.6 - 0.3).toFixed(1),
    }
    studyTrend.value = [
      ...mockStudyTrend.map(p => ({
        ...p,
        hours: +(p.hours + Math.random() * 0.4 - 0.2).toFixed(1),
      })),
    ]
    campusAreas.value = mockCampusAreas.map(a => ({
      ...a,
      count: a.count + Math.floor(Math.random() * 40) - 20,
    }))
  }

  function setRefreshInterval(interval: RefreshInterval) {
    refreshInterval.value = interval
    stopAutoRefresh()
    if (interval > 0) {
      autoRefresh.value = true
      refreshTimer = setInterval(() => refreshData(), interval * 1000)
    }
  }

  function setGradeFilter(grade: string) {
    gradeFilter.value = grade
  }

  function setMajorFilter(major: string) {
    majorFilter.value = major
  }

  function startEventStream() {
    // 初始加载 10 条历史事件
    realtimeEvents.value = Array.from({ length: 10 }, () => generateRealtimeEvent()).reverse()
    // 每 2 秒生成一条新事件
    eventTimer = setInterval(() => {
      const event = generateRealtimeEvent()
      realtimeEvents.value.unshift(event)
      // 只保留最近 50 条
      if (realtimeEvents.value.length > 50) {
        realtimeEvents.value = realtimeEvents.value.slice(0, 50)
      }
    }, 2000)
  }

  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
    autoRefresh.value = false
  }

  function stopEventStream() {
    if (eventTimer) {
      clearInterval(eventTimer)
      eventTimer = null
    }
  }

  function cleanup() {
    stopAutoRefresh()
    stopEventStream()
  }

  return {
    overview,
    studyTrend: filteredStudyTrend,
    libraryHeatmap,
    canteenData,
    campusAreas,
    departmentComparison,
    realtimeEvents,
    gradeFilter,
    majorFilter,
    refreshInterval,
    autoRefresh,
    gradeOptions,
    majorOptions,
    refreshData,
    setRefreshInterval,
    setGradeFilter,
    setMajorFilter,
    startEventStream,
    stopEventStream,
    cleanup,
  }
})
