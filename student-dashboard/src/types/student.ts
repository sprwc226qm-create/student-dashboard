// src/types/student.ts

export interface Student {
  id: string
  name: string
  studentNo: string
  class: string
  major: string
  department: string
  counselor: string
  overallScore: number
  tags: StudentTag[]
}

export interface StudentTag {
  label: string
  category: 'study' | 'life' | 'warning' | 'other'
}

export interface GpaHistory {
  semester: string
  gpa: number
}

export interface CourseMastery {
  courseName: string
  score: number
  classAvg: number
}

export interface BehaviorComparison {
  dimension: string
  studentValue: number
  classAvg: number
  gradeAvg: number
  unit: string
}

export interface AcademicEvent {
  date: string
  title: string
  type: 'fail' | 'award' | 'warning' | 'normal'
}