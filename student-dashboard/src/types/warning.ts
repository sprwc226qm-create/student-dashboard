// src/types/warning.ts

/** 风险等级 */
export type RiskLevel = 'high' | 'medium' | 'low'

/** 预警规则 */
export interface WarningRule {
  id: string
  name: string
  metric: string
  operator: 'lt' | 'gt' | 'lte' | 'gte' | 'eq'
  threshold: number
  level: RiskLevel
  period: number  // 统计周期（天）
  enabled: boolean
  description: string
  createTime: string
}

/** 预警记录 */
export interface WarningRecord {
  id: string
  studentId: string
  studentName: string
  studentNo: string
  className: string
  department: string
  riskLevel: RiskLevel
  ruleName: string
  ruleId: string
  triggerTime: string
  triggerValue: number
  thresholdValue: number
  status: 'pending' | 'processing' | 'ignored' | 'done'
  handlerNote: string
  handleTime: string
  history: WarningHistoryItem[]
}

/** 预警历史记录项 */
export interface WarningHistoryItem {
  time: string
  action: string
  operator: string
  note: string
}

/** 预警统计数据 */
export interface WarningStats {
  total: number
  highCount: number
  mediumCount: number
  lowCount: number
  departmentRates: { department: string; rate: number; count: number }[]
  trend30Days: { date: string; high: number; medium: number; low: number }[]
}

/** 告警通知 */
export interface AlertNotification {
  id: string
  title: string
  message: string
  level: RiskLevel
  time: string
  read: boolean
  studentId?: string
  warningId?: string
}
