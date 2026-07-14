// src/mocks/data/warning.ts
import type { WarningRecord, WarningStats, AlertNotification, WarningRule, RiskLevel } from '@/types/warning'

// ========== 预警规则 ==========
export const mockWarningRules: WarningRule[] = [
  {
    id: '1',
    name: 'GPA低于警戒线',
    metric: 'gpa',
    operator: 'lt',
    threshold: 2.0,
    level: 'high',
    period: 180,
    enabled: true,
    description: '最近学期GPA低于2.0触发高风险预警',
    createTime: '2026-06-15 10:00',
  },
  {
    id: '2',
    name: '图书馆打卡不足',
    metric: 'libraryVisits',
    operator: 'lt',
    threshold: 2,
    level: 'medium',
    period: 14,
    enabled: true,
    description: '近14天图书馆打卡次数<2触发中等风险',
    createTime: '2026-06-15 10:30',
  },
  {
    id: '3',
    name: '连续缺课',
    metric: 'absenceCount',
    operator: 'gt',
    threshold: 3,
    level: 'high',
    period: 30,
    enabled: true,
    description: '近30天缺课次数>3触发高风险预警',
    createTime: '2026-06-16 09:00',
  },
  {
    id: '4',
    name: '作业提交率低',
    metric: 'homeworkRate',
    operator: 'lt',
    threshold: 60,
    level: 'medium',
    period: 30,
    enabled: true,
    description: '近30天作业提交率<60%触发中等风险',
    createTime: '2026-06-16 09:30',
  },
  {
    id: '5',
    name: '消费异常',
    metric: 'monthlyConsumption',
    operator: 'lt',
    threshold: 300,
    level: 'low',
    period: 30,
    enabled: true,
    description: '月消费金额<300触发低风险（可能经济困难）',
    createTime: '2026-06-17 14:00',
  },
  {
    id: '6',
    name: '出勤率过低',
    metric: 'attendance',
    operator: 'lt',
    threshold: 70,
    level: 'medium',
    period: 30,
    enabled: false,
    description: '近30天出勤率<70%触发中等风险',
    createTime: '2026-06-17 15:00',
  },
]

// ========== 模拟预警学生列表 ==========
const classes = ['软件工程1班', '软件工程2班', '计算机科学1班', '数据科学1班', '人工智能1班']
const departments = ['计算机学院', '计算机学院', '计算机学院', '数学学院', '计算机学院']
const studentNames = [
  '唐博', '赵六', '周杰', '吴芳', '徐静', '孙伟', '马强', '朱丽',
  '胡明', '林雪', '郭洋', '何倩', '高鹏', '罗宇', '郑敏',
]

function generateMockWarnings(): WarningRecord[] {
  const warnings: WarningRecord[] = []
  const statuses: WarningRecord['status'][] = ['pending', 'processing', 'ignored', 'done']
  const now = new Date()

  for (let i = 0; i < 15; i++) {
    const ruleIdx = i % mockWarningRules.length
    const rule = mockWarningRules[ruleIdx]
    const level = rule.level
    const triggerDate = new Date(now)
    triggerDate.setHours(triggerDate.getHours() - Math.floor(Math.random() * 72))

    warnings.push({
      id: `warn-${i + 1}`,
      studentId: `s-${1000 + i}`,
      studentName: studentNames[i],
      studentNo: `2023${String(10001 + i).padStart(5, '0')}`,
      className: classes[i % classes.length],
      department: departments[i % departments.length],
      riskLevel: level,
      ruleName: rule.name,
      ruleId: rule.id,
      triggerTime: triggerDate.toISOString(),
      triggerValue: rule.operator === 'lt'
        ? rule.threshold - Math.random() * rule.threshold * 0.5
        : rule.threshold + Math.random() * rule.threshold * 0.5,
      thresholdValue: rule.threshold,
      status: statuses[i % statuses.length],
      handlerNote: '',
      handleTime: '',
      history: [
        { time: triggerDate.toISOString(), action: '系统触发预警', operator: '系统', note: `检测到${rule.name}` },
      ],
    })
  }
  return warnings
}

export const mockWarningRecords = generateMockWarnings()

// ========== 预警统计 ==========
export const mockWarningStats: WarningStats = {
  total: 127,
  highCount: 23,
  mediumCount: 58,
  lowCount: 46,
  departmentRates: [
    { department: '计算机学院', rate: 15.2, count: 45 },
    { department: '数学学院', rate: 12.8, count: 25 },
    { department: '物理学院', rate: 10.5, count: 18 },
    { department: '经管学院', rate: 8.3, count: 16 },
    { department: '外语学院', rate: 6.7, count: 12 },
    { department: '艺术学院', rate: 9.1, count: 11 },
  ],
  trend30Days: (() => {
    const trend: WarningStats['trend30Days'] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      trend.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        high: Math.round(3 + Math.random() * 8),
        medium: Math.round(8 + Math.random() * 12),
        low: Math.round(5 + Math.random() * 10),
      })
    }
    return trend
  })(),
}

// ========== 模拟告警通知 ==========
export function generateAlertNotification(): AlertNotification {
  const levels: RiskLevel[] = ['high', 'medium', 'low']
  const level = levels[Math.floor(Math.random() * levels.length)]
  const levelLabel = level === 'high' ? '高风险' : level === 'medium' ? '中风险' : '低风险'
  const student = studentNames[Math.floor(Math.random() * studentNames.length)]
  const rule = mockWarningRules[Math.floor(Math.random() * mockWarningRules.length)]

  return {
    id: `alert-${Date.now()}`,
    title: `⚠️ 新${levelLabel}预警`,
    message: `${student}触发了"${rule.name}"规则`,
    level,
    time: new Date().toLocaleString(),
    read: false,
    warningId: `warn-${Math.floor(Math.random() * 15) + 1}`,
  }
}
