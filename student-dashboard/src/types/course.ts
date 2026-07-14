// src/types/course.ts

// ① 课程基础类型（你已经有了，但加了一个 category）
export interface Course {
  id: string
  name: string
  teacher: string
  credit: number
  semester?: string          // 可选：学期
  category?: CourseCategory  // 可选：课程类别
  score?: number             // 可选：成绩（可能还没出）
}

export type CourseCategory = '必修' | '选修' | '实践'

// ③ 课程统计（用于展示课程整体情况）
export interface CourseStats {
  courseId: string
  courseName: string
  avgScore: number
  maxScore: number
  minScore: number
  passRate: number          // 及格率（0~1）
  studentCount: number
}

// ④ 通用分页响应（预留给后续 API 接入）
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ⑤ 通用 API 响应（预留给后续 API 接入）
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}