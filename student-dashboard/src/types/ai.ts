// src/types/ai.ts

/** 消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system'

/** 对话消息 */
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  /** 是否包含图表数据 */
  chartData?: ChartReplyData
  /** 是否包含表格数据 */
  tableData?: TableReplyData
  /** 反馈状态 */
  feedback?: 'like' | 'dislike' | null
  /** 是否敏感数据 */
  sensitive?: boolean
}

/** AI 回复中的图表数据 */
export interface ChartReplyData {
  type: 'line' | 'bar' | 'pie' | 'radar'
  title: string
  option: Record<string, unknown>
}

/** AI 回复中的表格数据 */
export interface TableReplyData {
  columns: { label: string; prop: string }[]
  rows: Record<string, string | number>[]
  title: string
}

/** 快捷提问 */
export interface QuickQuestion {
  id: string
  label: string
  question: string
  icon: string
}

/** 对话会话 */
export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createTime: string
  updateTime: string
}

/** 流式响应块 */
export interface StreamChunk {
  content: string
  done: boolean
  chartData?: ChartReplyData
  tableData?: TableReplyData
  sensitive?: boolean
}
