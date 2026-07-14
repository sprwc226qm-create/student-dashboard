// src/types/dashboard.ts

/** 概览卡片数据 */
export interface OverviewStats {
  totalStudents: number
  activeToday: number
  avgStudyHours: number
  warningCount: number
}

/** 学习投入趋势 */
export interface StudyTrendPoint {
  date: string
  hours: number
  grade?: string
  major?: string
}

/** 图书馆热力图数据 */
export interface LibraryHeatmapPoint {
  day: number    // 0-6 (周日-周六)
  hour: number   // 8-22
  count: number
}

/** 食堂消费数据 */
export interface CanteenData {
  name: string
  count: number
  amount: number
}

/** 校园区域实时人数 */
export interface CampusArea {
  name: string
  icon: string
  count: number
  total: number
  percent: number
}

/** 院系对比维度 */
export interface DepartmentComparison {
  department: string
  studyEngagement: number
  bookBorrowing: number
  activityParticipation: number
  attendance: number
  consumption: number
}

/** 实时行为事件 */
export interface BehaviorEvent {
  id: string
  studentName: string
  time: string
  action: string
  location: string
  type: 'library' | 'canteen' | 'dorm' | 'classroom' | 'other'
}

/** 刷新间隔 */
export type RefreshInterval = 30 | 60 | 120 | 0 // 0 = manual
