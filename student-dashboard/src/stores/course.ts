import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Course, CourseStats } from '@/types/course'

export const useCourseStore = defineStore('course', () => {
  // ---------- 原有数据 ----------
  const courses = ref<Course[]>([
    { id: '1', name: '高等数学', teacher: '李教授', credit: 4, score: 85, category: '必修' },
    { id: '2', name: '数据结构', teacher: '王教授', credit: 3, score: 72, category: '必修' },
    { id: '3', name: '计算机网络', teacher: '张教授', credit: 3, score: 58, category: '必修' },
    { id: '4', name: '软件工程', teacher: '赵教授', credit: 2, score: 91, category: '选修' },
    { id: '5', name: '数据库原理', teacher: '陈教授', credit: 3, score: 66, category: '必修' },
  ])

  const filterKeyword = ref('')

  // ---------- 原有计算属性 ----------
  const filteredCourses = computed(() => {
    if (!filterKeyword.value) return courses.value
    return courses.value.filter(c =>
      c.name.includes(filterKeyword.value) ||
      c.teacher.includes(filterKeyword.value)
    )
  })

  const passedCourses = computed(() => courses.value.filter(c => (c.score ?? 0) >= 60))
  const failedCourses = computed(() => courses.value.filter(c => (c.score ?? 0) < 60))
  
  const avgScore = computed(() => {
    const scores = courses.value.map(c => c.score ?? 0)
    return +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  })

  // ---------- ★ 新增：课程统计数据（模拟从后端获取） ----------
  // 这里直接模拟计算，实际项目可能是 async 请求
  const stats = computed<CourseStats | null>(() => {
    if (courses.value.length === 0) return null
    const scores = courses.value.map(c => c.score ?? 0)
    const passCount = scores.filter(s => s >= 60).length
    return {
      courseId: 'all',
      courseName: '全部课程',
      avgScore: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      passRate: +(passCount / scores.length).toFixed(2),
      studentCount: courses.value.length,
    }
  })

  // ---------- 原有方法 ----------
  function setFilter(keyword: string) { filterKeyword.value = keyword }
  function addCourse(course: Course) { courses.value.push(course) }
  function updateScore(courseId: string, score: number) {
    const course = courses.value.find(c => c.id === courseId)
    if (course) course.score = score
  }

  // ---------- 暴露 ----------
  return {
    courses,
    filterKeyword,
    filteredCourses,
    passedCourses,
    failedCourses,
    avgScore,
    stats,          // ← 把 stats 暴露出去
    setFilter,
    addCourse,
    updateScore,
  }
})