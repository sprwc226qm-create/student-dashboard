// src/constants/labels.ts — 共享标签/状态/图标映射常量

/** 风险等级 → 文本 + 颜色 */
export const RISK_LEVEL_MAP: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: '高风险', color: '#ef4444', bg: '#fef2f2' },
  medium: { label: '中风险', color: '#f59e0b', bg: '#fffbeb' },
  low: { label: '低风险', color: '#3b82f6', bg: '#eff6ff' },
}

/** 风险等级 → 中文文本（简化版） */
export const RISK_LEVEL_LABEL: Record<string, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
}

/** 风险等级 → Element Plus Tag type */
export const RISK_LEVEL_TAG_TYPE: Record<string, 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
}

/** 处理状态 → 中文文本 */
export const STATUS_LABEL: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  done: '已完成',
  ignored: '已忽略',
}

/** 处理状态 → Element Plus Tag type */
export const STATUS_TAG_TYPE: Record<string, string> = {
  pending: 'danger',
  processing: 'warning',
  done: 'success',
  ignored: 'info',
}

/** 行为事件类型 → emoji 图标 */
export const EVENT_TYPE_ICON: Record<string, string> = {
  library: '📚',
  canteen: '🍽️',
  dorm: '🏠',
  classroom: '📖',
  other: '📋',
}
