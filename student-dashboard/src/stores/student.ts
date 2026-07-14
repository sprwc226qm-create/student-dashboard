// src/stores/student.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Student,
  GpaHistory,
  CourseMastery,
  BehaviorComparison,
  AcademicEvent,
} from '@/types/student'

// ---------- 类型 ----------
export interface MonthlyConsumption {
  month: string
  food: number
  study: number
  other: number
}

export interface QualityScore {
  dimension: string
  score: number
  classAvg: number
}

// ========== 50 名学生基础信息 ==========
const surnames = ['张', '李', '王', '赵', '刘', '陈', '杨', '黄', '吴', '周', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗']
const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋', '勇', '艳', '杰', '倩', '鹏', '宇', '阳', '超', '明', '雪']
const classes = ['软件工程1班', '软件工程2班', '计算机科学1班', '数据科学1班', '人工智能1班']
const majors = ['软件工程', '计算机科学与技术', '数据科学', '人工智能', '网络工程']
const departments = ['计算机学院', '信息学院', '人工智能学院']
const counselors = ['李老师', '王老师', '张老师', '赵老师', '刘老师', '陈老师']

// 标签池
const tagPool: Student['tags'] = [
  { label: '学霸', category: 'study' },
  { label: '图书馆常客', category: 'life' },
  { label: 'GPA回升', category: 'study' },
  { label: '需要关注', category: 'warning' },
  { label: '学习进步', category: 'study' },
  { label: '运动达人', category: 'life' },
  { label: '社团活跃', category: 'life' },
  { label: '科研新星', category: 'study' },
  { label: '考勤异常', category: 'warning' },
  { label: 'GPA下滑', category: 'warning' },
  { label: '竞赛获奖', category: 'study' },
  { label: '志愿者', category: 'life' },
]

// 事件模板
const eventTemplates: { title: string; type: AcademicEvent['type'] }[] = [
  { title: '获得校级一等奖学金', type: 'award' },
  { title: '数据结构课程成绩低于70，需加强', type: 'warning' },
  { title: '参加全国软件设计大赛获省二等奖', type: 'award' },
  { title: '高等数学期末考试不及格', type: 'fail' },
  { title: '转入软件工程专业', type: 'normal' },
  { title: '获得 ACM 区域赛铜奖', type: 'award' },
  { title: '英语四级未通过', type: 'fail' },
  { title: '获评三好学生', type: 'award' },
  { title: '连续两周缺课超过3次', type: 'warning' },
  { title: '加入实验室科研项目', type: 'normal' },
  { title: '获国家励志奖学金', type: 'award' },
  { title: '获全国数学建模竞赛一等奖', type: 'award' },
  { title: '综合考评不达标，收到学业预警', type: 'warning' },
  { title: '参加校企合作实训项目', type: 'normal' },
  { title: '计算机组成原理补考通过', type: 'normal' },
]

// ========== 基于索引的确定性数据生成 ==========
// 用索引做"种子"，每个学生数据固定但各不相同
function hashIndex(idx: number): number {
  // 简单 hash，返回 0~1 之间的伪随机数
  const x = Math.sin(idx * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function genStudent(idx: number): Student {
  const h = hashIndex(idx)
  const h2 = hashIndex(idx * 3)
  const h3 = hashIndex(idx * 7)
  const tagCount = 2 + Math.floor(h * 3)
  const usedTags = new Set<number>()
  const tags: Student['tags'] = []
  for (let i = 0; i < tagCount; i++) {
    const ti = Math.floor(hashIndex(idx * 13 + i * 7) * tagPool.length)
    if (!usedTags.has(ti)) {
      usedTags.add(ti)
      tags.push(tagPool[ti])
    }
  }
  return {
    id: String(idx),
    name: surnames[idx % surnames.length] + givenNames[Math.floor(h * givenNames.length)],
    studentNo: `2023${String(10000 + idx).padStart(5, '0')}`,
    class: classes[Math.floor(h2 * classes.length)],
    major: majors[Math.floor(h3 * majors.length)],
    department: departments[Math.floor(h * departments.length)],
    counselor: counselors[Math.floor(h2 * counselors.length)],
    overallScore: Math.round(60 + h3 * 35),
    tags,
  }
}

function genGpaHistory(idx: number): GpaHistory[] {
  const h = hashIndex(idx * 5)
  const baseGpa = 1.5 + h * 2.0
  const semesters = ['2023秋', '2024春', '2024秋', '2025春', '2025秋']
  return semesters.map((sem, i) => {
    const v = hashIndex(idx * 11 + i * 3)
    return {
      semester: sem,
      gpa: Math.round(Math.max(0.5, Math.min(4.0, baseGpa + (v - 0.5) * 0.8 + i * 0.1)) * 10) / 10,
    }
  })
}

function genCourseMastery(idx: number): CourseMastery[] {
  const courseNames = ['高等数学', '数据结构', '计算机网络', '软件工程', '数据库原理']
  return courseNames.map((name, i) => {
    const score = Math.round((55 + hashIndex(idx * 17 + i * 3) * 40) * 10) / 10
    const classAvg = Math.round((60 + hashIndex(idx * 19 + i * 5) * 25) * 10) / 10
    return { courseName: name, score, classAvg }
  })
}

function genBehavior(idx: number): BehaviorComparison[] {
  const h = hashIndex(idx * 23)
  const h2 = hashIndex(idx * 29)
  const h3 = hashIndex(idx * 31)
  const h4 = hashIndex(idx * 37)
  return [
    { dimension: '图书馆打卡', studentValue: Math.round(3 + h * 20), classAvg: 8, gradeAvg: 7, unit: '次/月' },
    { dimension: '课堂出勤率', studentValue: Math.round(60 + h2 * 40), classAvg: 88, gradeAvg: 85, unit: '%' },
    { dimension: '作业提交率', studentValue: Math.round(60 + h3 * 40), classAvg: 92, gradeAvg: 90, unit: '%' },
    { dimension: '自习时长', studentValue: Math.round(10 + h4 * 50), classAvg: 30, gradeAvg: 28, unit: '小时/月' },
  ]
}

function genEvents(idx: number): AcademicEvent[] {
  const count = 3 + Math.floor(hashIndex(idx * 41) * 5)
  const used = new Set<number>()
  const events: AcademicEvent[] = []
  for (let i = 0; i < count; i++) {
    const ei = Math.floor(hashIndex(idx * 43 + i * 11) * eventTemplates.length)
    if (!used.has(ei)) {
      used.add(ei)
      const t = eventTemplates[ei]
      const year = 2023 + Math.floor(hashIndex(idx * 47 + i) * 3)
      const month = String(1 + Math.floor(hashIndex(idx * 53 + i) * 12)).padStart(2, '0')
      const day = String(1 + Math.floor(hashIndex(idx * 59 + i) * 28)).padStart(2, '0')
      events.push({ date: `${year}-${month}-${day}`, title: t.title, type: t.type })
    }
  }
  events.sort((a, b) => b.date.localeCompare(a.date))
  return events
}

function genConsumption(idx: number): MonthlyConsumption[] {
  return ['1月', '2月', '3月', '4月', '5月', '6月'].map((m, i) => {
    const h1 = hashIndex(idx * 61 + i * 5)
    const h2 = hashIndex(idx * 67 + i * 7)
    const h3 = hashIndex(idx * 71 + i * 11)
    return {
      month: m,
      food: Math.round(500 + h1 * 600),
      study: Math.round(50 + h2 * 250),
      other: Math.round(100 + h3 * 400),
    }
  })
}

function genQuality(idx: number): QualityScore[] {
  return ['学业', '创新', '实践', '社交', '体育', '艺术'].map((d, i) => {
    const score = Math.round(40 + hashIndex(idx * 73 + i * 13) * 55)
    return { dimension: d, score, classAvg: Math.round(55 + hashIndex(idx * 79 + i * 17) * 30) }
  })
}

// 预生成 1~50 号学生数据（缓存）
const TOTAL_STUDENTS = 50
const cachedStudents = new Map<number, Student>()
const cachedGpa = new Map<number, GpaHistory[]>()
const cachedCourses = new Map<number, CourseMastery[]>()
const cachedBehavior = new Map<number, BehaviorComparison[]>()
const cachedEvents = new Map<number, AcademicEvent[]>()
const cachedConsumption = new Map<number, MonthlyConsumption[]>()
const cachedQuality = new Map<number, QualityScore[]>()

for (let i = 1; i <= TOTAL_STUDENTS; i++) {
  cachedStudents.set(i, genStudent(i))
  cachedGpa.set(i, genGpaHistory(i))
  cachedCourses.set(i, genCourseMastery(i))
  cachedBehavior.set(i, genBehavior(i))
  cachedEvents.set(i, genEvents(i))
  cachedConsumption.set(i, genConsumption(i))
  cachedQuality.set(i, genQuality(i))
}

// ========== Store ==========
export const useStudentStore = defineStore('student', () => {
  const loading = ref(false)
  const currentStudent = ref<Student | null>(null)
  const gpaHistory = ref<GpaHistory[]>([])
  const courseMastery = ref<CourseMastery[]>([])
  const behaviorComparison = ref<BehaviorComparison[]>([])
  const academicEvents = ref<AcademicEvent[]>([])
  const monthlyConsumption = ref<MonthlyConsumption[]>([])
  const qualityScores = ref<QualityScore[]>([])

  // 所有可搜索的学生列表
  const studentList = computed<Array<{ id: string; name: string; studentNo: string; class: string }>>(() => {
    const list: Array<{ id: string; name: string; studentNo: string; class: string }> = []
    for (let i = 1; i <= TOTAL_STUDENTS; i++) {
      const s = cachedStudents.get(i)!
      list.push({
        id: String(i),
        name: s.name,
        studentNo: s.studentNo,
        class: s.class,
      })
    }
    return list
  })

  async function fetchAllStudentData(id: string) {
    loading.value = true
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 200))

    // 将 id 转为数字索引，范围 1~50
    let idx = parseInt(id, 10)
    if (isNaN(idx) || idx < 1 || idx > TOTAL_STUDENTS) {
      // 兜底：如果 ID 不合法，用 hash 映射到 1~50
      let hash = 0
      for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i)
        hash |= 0
      }
      idx = Math.abs(hash) % TOTAL_STUDENTS + 1
    }

    currentStudent.value = cachedStudents.get(idx)!
    gpaHistory.value = cachedGpa.get(idx)!
    courseMastery.value = cachedCourses.get(idx)!
    behaviorComparison.value = cachedBehavior.get(idx)!
    academicEvents.value = cachedEvents.get(idx)!
    monthlyConsumption.value = cachedConsumption.get(idx)!
    qualityScores.value = cachedQuality.get(idx)!

    loading.value = false
  }

  return {
    loading,
    currentStudent,
    gpaHistory,
    courseMastery,
    behaviorComparison,
    academicEvents,
    monthlyConsumption,
    qualityScores,
    studentList,
    fetchAllStudentData,
  }
})
