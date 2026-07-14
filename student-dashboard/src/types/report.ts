// src/types/report.ts

/** 报告模板 */
export interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: string
  sections: ReportSection[]
}

/** 报告段落 */
export interface ReportSection {
  id: string
  title: string
  type: 'text' | 'chart' | 'table' | 'mixed'
  content: string
  chartType?: string
  dataKey?: string
  editable: boolean
}

/** 报告记录 */
export interface ReportRecord {
  id: string
  templateId: string
  templateName: string
  studentId: string
  studentName: string
  studentNo: string
  className: string
  title: string
  content: string        // 富文本/HTML
  sections: ReportSection[]
  charts: EmbeddedChart[]
  createTime: string
  updateTime: string
  status: 'draft' | 'generated' | 'exported'
  exportType?: 'pdf' | 'excel'
}

/** 内嵌图表 */
export interface EmbeddedChart {
  id: string
  title: string
  type: string           // echarts 图表类型
  option: Record<string, unknown>
  dataUrl?: string       // 图表图片 base64
}
