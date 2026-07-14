// src/mocks/data/dashboard.ts
import type {
  OverviewStats,
  StudyTrendPoint,
  LibraryHeatmapPoint,
  CanteenData,
  CampusArea,
  DepartmentComparison,
  BehaviorEvent,
} from '@/types/dashboard'

// ========== 概览卡片 ==========
export const mockOverview: OverviewStats = {
  totalStudents: 5842,
  activeToday: 3215,
  avgStudyHours: 4.8,
  warningCount: 127,
}

// ========== 学习投入趋势 (近30天) ==========
function generateStudyTrend(): StudyTrendPoint[] {
  const data: StudyTrendPoint[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
    // 添加一些波动，周末偏低
    const dayOfWeek = d.getDay()
    const base = dayOfWeek === 0 || dayOfWeek === 6 ? 3.5 : 5.5
    data.push({
      date: dateStr,
      hours: +(base + Math.random() * 3 - 1.5).toFixed(1),
    })
  }
  return data
}

export const mockStudyTrend = generateStudyTrend()

// 按年级筛选的数据
export function generateStudyTrendByGrade(grade: string): StudyTrendPoint[] {
  const base = mockStudyTrend
  const multiplier = grade === '大一' ? 1.3 : grade === '大二' ? 1.1 : grade === '大三' ? 0.9 : 0.8
  return base.map(p => ({
    ...p,
    hours: +(p.hours * multiplier).toFixed(1),
    grade,
  }))
}

// ========== 图书馆热力图 (周一至周日, 8:00-22:00) ==========
export const mockLibraryHeatmap: LibraryHeatmapPoint[] = []
const days = 7
for (let day = 0; day < days; day++) {
  for (let h = 8; h <= 22; h++) {
    let baseCount: number
    // 周末人少
    if (day === 0 || day === 6) {
      baseCount = 50 + Math.random() * 80
    } else {
      baseCount = 120 + Math.random() * 180
    }
    // 午饭和晚饭时间人少
    if (h === 12 || h === 13 || h === 18) {
      baseCount *= 0.4
    }
    // 早上和晚上人少
    if (h === 8 || h === 22) {
      baseCount *= 0.5
    }
    // 黄金时间人多
    if (h >= 9 && h <= 11 || h >= 14 && h <= 17 || h >= 19 && h <= 21) {
      baseCount *= 1.3
    }
    mockLibraryHeatmap.push({
      day,
      hour: h,
      count: Math.round(baseCount),
    })
  }
}

// ========== 食堂消费数据 ==========
export const mockCanteenData: CanteenData[] = [
  { name: '第一食堂', count: 2850, amount: 42750 },
  { name: '第二食堂', count: 3420, amount: 51300 },
  { name: '第三食堂', count: 2180, amount: 29430 },
  { name: '教工食堂', count: 890, amount: 16020 },
  { name: '风味餐厅', count: 1560, amount: 28080 },
]

// ========== 校园区域实时人数 ==========
export const mockCampusAreas: CampusArea[] = [
  { name: '宿舍区', icon: '🏠', count: 1820, total: 3200, percent: 57 },
  { name: '教学楼', icon: '🏫', count: 1450, total: 3000, percent: 48 },
  { name: '图书馆', icon: '📚', count: 680, total: 1200, percent: 57 },
  { name: '食堂', icon: '🍽️', count: 520, total: 2000, percent: 26 },
  { name: '体育场', icon: '🏟️', count: 340, total: 800, percent: 43 },
  { name: '实验室', icon: '🔬', count: 280, total: 600, percent: 47 },
]

// ========== 院系五维对比 ==========
export const mockDepartmentComparison: DepartmentComparison[] = [
  { department: '计算机学院', studyEngagement: 88, bookBorrowing: 92, activityParticipation: 75, attendance: 90, consumption: 82 },
  { department: '数学学院', studyEngagement: 85, bookBorrowing: 88, activityParticipation: 62, attendance: 87, consumption: 70 },
  { department: '物理学院', studyEngagement: 78, bookBorrowing: 75, activityParticipation: 68, attendance: 82, consumption: 74 },
  { department: '经管学院', studyEngagement: 72, bookBorrowing: 65, activityParticipation: 88, attendance: 85, consumption: 90 },
  { department: '外语学院', studyEngagement: 80, bookBorrowing: 82, activityParticipation: 80, attendance: 92, consumption: 78 },
  { department: '艺术学院', studyEngagement: 68, bookBorrowing: 55, activityParticipation: 92, attendance: 80, consumption: 85 },
]

// ========== 实时行为事件生成器 ==========
const sampleStudents = [
  '张三', '李四', '王五', '赵六', '陈七', '刘八', '杨九', '黄十',
  '周杰', '吴芳', '徐静', '孙伟', '马强', '朱丽', '胡明', '林雪',
  '郭洋', '何倩', '高鹏', '罗宇', '唐博', '郑敏', '梁超', '谢阳',
]
const actions = {
  library: ['进入图书馆', '借阅图书', '归还图书', '预约自习室', '离开图书馆'],
  canteen: ['刷卡就餐', '购买饮品', '充值校园卡'],
  dorm: ['进入宿舍', '离开宿舍'],
  classroom: ['进入教学楼', '签到上课', '进入实验室', '离开教室'],
  other: ['进入体育场', '校园卡挂失', '打印成绩单'],
}
const locations: Record<string, string[]> = {
  library: ['主图书馆', '分馆A区', '电子阅览室'],
  canteen: ['第一食堂', '第二食堂', '第三食堂', '风味餐厅'],
  dorm: ['1号宿舍楼', '2号宿舍楼', '3号宿舍楼', '5号宿舍楼'],
  classroom: ['教学楼A区', '教学楼B区', '实验楼', '综合楼'],
  other: ['体育场', '行政楼', '校医院'],
}

let eventIdCounter = 0
export function generateRealtimeEvent(): BehaviorEvent {
  const types = Object.keys(actions) as BehaviorEvent['type'][]
  const type = types[Math.floor(Math.random() * types.length)]
  const name = sampleStudents[Math.floor(Math.random() * sampleStudents.length)]
  const action = actions[type][Math.floor(Math.random() * actions[type].length)]
  const location = locations[type][Math.floor(Math.random() * locations[type].length)]
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  eventIdCounter++
  return {
    id: `evt-${eventIdCounter}`,
    studentName: name,
    time,
    action,
    location,
    type,
  }
}

export function generateRealtimeEvents(count: number): BehaviorEvent[] {
  return Array.from({ length: count }, () => generateRealtimeEvent())
}
