// src/services/dataContext.ts — 从各 Store 抓取真实数据，构建 AI 上下文
import { useDashboardStore } from '@/stores/dashboard'
import { useWarningStore } from '@/stores/warning'
import { useCourseStore } from '@/stores/course'
import { useStudentStore } from '@/stores/student'
import { useReportStore } from '@/stores/report'

/**
 * 构建发送给 DeepSeek 的数据上下文。
 * 每次用户发消息时调用，获取最新的实时数据。
 * 返回一个文本块，将被注入到 system prompt 末尾。
 */
export function buildDataContext(): string {
  const parts: string[] = []

  // ---- 仪表盘概览 ----
  try {
    const dash = useDashboardStore()
    parts.push(`## 仪表盘实时数据

### 概览
- 在校生总数：${dash.overview.totalStudents}
- 今日活跃人数：${dash.overview.activeToday}
- 平均学习时长：${dash.overview.avgStudyHours} 小时/天
- 预警人数：${dash.overview.warningCount}

### 校园区域实时人数
${dash.campusAreas.map(a => `- ${a.icon} ${a.name}：${a.count}/${a.total}（${a.percent}%）`).join('\n')}

### 食堂消费分布
${dash.canteenData.map(d => `- ${d.name}：${d.count} 人次 / ¥${d.amount}`).join('\n')}

### 院系五维对比
${dash.departmentComparison.map(d =>
    `- ${d.department}：学习投入${d.studyEngagement} / 图书借阅${d.bookBorrowing} / 活动参与${d.activityParticipation} / 出勤率${d.attendance} / 消费${d.consumption}`
  ).join('\n')}

### 最近实时事件（最新10条）
${dash.realtimeEvents.slice(0, 10).map(e => `- ${e.time} ${e.studentName} ${e.action} @${e.location}`).join('\n')}`)
  } catch { /* store 未初始化则跳过 */ }

  // ---- 预警数据 ----
  try {
    const warn = useWarningStore()
    const all = warn.allWarnings
    const levelCounts = warn.levelCounts
    parts.push(`## 预警数据

### 统计
- 总预警人数：${all.length}
- 高风险：${levelCounts.high} / 中风险：${levelCounts.medium} / 低风险：${levelCounts.low}

### 各学院预警分布
${aggregateByDepartment(all)}

### 最近预警记录（最新20条）
${all.slice(0, 20).map(w =>
    `- [${w.riskLevel === 'high' ? '🔴高' : w.riskLevel === 'medium' ? '🟡中' : '🔵低'}] ${w.studentName}（${w.studentNo}｜${w.className}）触发"${w.ruleName}" → 状态：${statusText(w.status)}｜时间：${w.triggerTime}`
  ).join('\n')}`)
  } catch { /* 跳过 */ }

  // ---- 课程数据 ----
  try {
    const course = useCourseStore()
    parts.push(`## 课程数据

### 课程列表
${course.courses.map(c =>
    `- ${c.name}｜${c.teacher}｜${c.credit}学分｜${c.category ?? '必修'}｜成绩：${c.score ?? '未出'}`
  ).join('\n')}

### 统计
- 平均分：${course.avgScore}
- 及格课程数：${course.passedCourses.length}
- 挂科课程数：${course.failedCourses.length}
${course.stats ? `- 最高分：${course.stats.maxScore} / 最低分：${course.stats.minScore} / 及格率：${(course.stats.passRate * 100).toFixed(0)}%` : ''}`)
  } catch { /* 跳过 */ }

  // ---- 学生数据（摘要） ----
  try {
    const student = useStudentStore()
    const list = student.studentList
    // 50 个学生太多，只传摘要统计
    const deptCount: Record<string, number> = {}
    const classCount: Record<string, number> = {}
    for (const s of list) {
      deptCount[s.class.slice(0, -3)] = (deptCount[s.class.slice(0, -3)] ?? 0) + 1
      classCount[s.class] = (classCount[s.class] ?? 0) + 1
    }
    parts.push(`## 学生数据摘要

### 班级分布
${Object.entries(classCount).map(([k, v]) => `- ${k}：${v} 人`).join('\n')}

### 全部学生列表（按班级）
${list.map(s => `- ${s.name}｜${s.studentNo}｜${s.class}`).join('\n')}

### 当前选中学生详情
${student.currentStudent ? formatCurrentStudent(student) : '（当前未选中任何学生）'}`)
  } catch { /* 跳过 */ }

  // ---- 报告数据 ----
  try {
    const report = useReportStore()
    if (report.reports.length > 0) {
      parts.push(`## 已生成报告

${report.reports.map(r => `- ${r.title}｜学生：${r.studentName}｜模板：${r.templateName}｜状态：${r.status}｜时间：${r.createTime}`).join('\n')}`)
    }
  } catch { /* 跳过 */ }

  return parts.join('\n\n---\n\n')
}

/** 按学院聚合预警分布 */
function aggregateByDepartment(warnings: Array<{ className: string; riskLevel: string }>): string {
  const map: Record<string, { total: number; high: number; medium: number; low: number }> = {}
  for (const w of warnings) {
    const dept = w.className?.replace(/[0-9班]/g, '') || '未知学院'
    if (!map[dept]) map[dept] = { total: 0, high: 0, medium: 0, low: 0 }
    map[dept].total++
    if (w.riskLevel === 'high') map[dept].high++
    else if (w.riskLevel === 'medium') map[dept].medium++
    else map[dept].low++
  }
  return Object.entries(map)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([dept, c]) => `- ${dept}：共${c.total}人（高${c.high} / 中${c.medium} / 低${c.low}）`)
    .join('\n')
}

function statusText(s: string): string {
  const map: Record<string, string> = { pending: '待处理', processing: '处理中', done: '已完成', ignored: '已忽略' }
  return map[s] ?? s
}

/** 格式化当前选中学生的详细信息 */
function formatCurrentStudent(store: ReturnType<typeof useStudentStore>): string {
  const s = store.currentStudent!
  const lines = [
    `姓名：${s.name}｜学号：${s.studentNo}｜班级：${s.class}｜专业：${s.major}`,
    `辅导员：${s.counselor}｜GPA：${s.gpa}｜综合评分：${s.overallScore}`,
    `标签：${s.tags.map(t => t.label).join('、')}`,
  ]
  if (store.gpaHistory.length > 0) {
    lines.push(`GPA历史：${store.gpaHistory.map(g => `${g.semester}=${g.gpa}`).join(' → ')}`)
  }
  if (store.courseMastery.length > 0) {
    lines.push(`课程掌握度：${store.courseMastery.map(c => `${c.courseName} ${c.score}分(班均${c.classAvg})`).join('｜')}`)
  }
  if (store.monthlyConsumption.length > 0) {
    lines.push(`月消费：${store.monthlyConsumption.map(m => `${m.month.slice(0,7)} 餐${m.food}+学${m.study}+其他${m.other}=${m.food + m.study + m.other}元`).join('｜')}`)
  }
  if (store.academicEvents.length > 0) {
    lines.push(`近期学术事件：${store.academicEvents.slice(0, 5).map(e => `${e.date} ${e.event}`).join('｜')}`)
  }
  return lines.join('\n')
}
