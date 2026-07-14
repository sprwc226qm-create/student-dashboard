// src/stores/report.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ReportRecord, ReportTemplate, ReportSection, EmbeddedChart } from '@/types/report'
import type { Student } from '@/types/student'

// ---- 报告模板 ----
const mockTemplates: ReportTemplate[] = [
  {
    id: 'tpl-1',
    name: '学业预警报告',
    description: '针对触发预警学生生成学情分析与干预建议报告',
    icon: '⚠️',
    sections: [
      { id: 's1', title: '学生基本信息', type: 'text', content: '', dataKey: 'basicInfo', editable: false },
      { id: 's2', title: '学业成绩分析', type: 'chart', content: '', chartType: 'line', dataKey: 'gpaTrend', editable: true },
      { id: 's3', title: '预警原因诊断', type: 'text', content: '', dataKey: 'warningDiagnosis', editable: true },
      { id: 's4', title: '干预建议', type: 'text', content: '', dataKey: 'intervention', editable: true },
      { id: 's5', title: '课程掌握度', type: 'chart', content: '', chartType: 'radar', dataKey: 'courseMastery', editable: true },
    ],
  },
  {
    id: 'tpl-2',
    name: '学期总结报告',
    description: '全面总结学生本学期的学业、行为、消费等各方面表现',
    icon: '📊',
    sections: [
      { id: 's1', title: '学期概况', type: 'text', content: '', dataKey: 'semesterSummary', editable: true },
      { id: 's2', title: '学业成绩趋势', type: 'chart', content: '', chartType: 'line', dataKey: 'gpaTrend', editable: true },
      { id: 's3', title: '行为数据分析', type: 'mixed', content: '', dataKey: 'behaviorAnalysis', editable: true },
      { id: 's4', title: '综合素质评估', type: 'chart', content: '', chartType: 'radar', dataKey: 'qualityRadar', editable: true },
      { id: 's5', title: '下阶段建议', type: 'text', content: '', dataKey: 'nextPlan', editable: true },
    ],
  },
  {
    id: 'tpl-3',
    name: '个性化发展建议',
    description: '基于学生画像提供个性化的学业和职业发展建议',
    icon: '💡',
    sections: [
      { id: 's1', title: '学生画像概述', type: 'text', content: '', dataKey: 'portrait', editable: true },
      { id: 's2', title: '优势与特长', type: 'text', content: '', dataKey: 'strengths', editable: true },
      { id: 's3', title: '待提升领域', type: 'text', content: '', dataKey: 'weaknesses', editable: true },
      { id: 's4', title: '课程推荐', type: 'table', content: '', dataKey: 'courseRecommendations', editable: true },
      { id: 's5', title: '发展路径建议', type: 'text', content: '', dataKey: 'developmentPath', editable: true },
    ],
  },
]

export const useReportStore = defineStore('report', () => {
  const templates = ref<ReportTemplate[]>(mockTemplates)
  const reports = ref<ReportRecord[]>([])
  const currentReport = ref<ReportRecord | null>(null)
  const selectedTemplate = ref<ReportTemplate | null>(null)
  const selectedStudent = ref<Student | null>(null)

  // ---- 方法 ----
  function selectTemplate(templateId: string) {
    selectedTemplate.value = templates.value.find(t => t.id === templateId) || null
  }

  function setStudent(student: Student) {
    selectedStudent.value = student
  }

  function generateReport(title: string, customContent?: string): ReportRecord {
    if (!selectedTemplate.value || !selectedStudent.value) {
      throw new Error('请先选择模板和学生')
    }

    const st = selectedStudent.value
    const tpl = selectedTemplate.value

    // 自动填充内容
    const sections: ReportSection[] = tpl.sections.map(s => {
      let content = ''
      if (customContent && s.editable) {
        content = customContent
      } else if (s.dataKey === 'basicInfo') {
        content = `姓名：${st.name}\n学号：${st.studentNo}\n班级：${st.class}\n专业：${st.major}\n辅导员：${st.counselor}`
      } else if (s.dataKey === 'warningDiagnosis') {
        content = `该生触发了学业预警规则，经系统分析，主要原因包括：\n1. 近期学业成绩呈下降趋势\n2. 部分课程掌握度低于班级平均水平\n3. 学习行为投入指标有所下降\n\n建议辅导员及时介入，与学生进行面对面沟通。`
      } else if (s.dataKey === 'intervention') {
        content = `干预建议：\n1. 安排一对一学业辅导，重点关注薄弱课程\n2. 建议学生每周至少去图书馆学习3次\n3. 与任课教师沟通，了解课堂表现\n4. 建立学习小组，互相督促\n5. 定期（每2周）进行学业进展跟踪`
      } else if (s.dataKey === 'semesterSummary') {
        content = `本学期${st.name}同学整体表现尚可，综合评分${st.overallScore}分。学业方面需要加强对薄弱课程的投入，课外活动参与积极。`
      } else if (s.dataKey === 'portrait') {
        content = `${st.name}，${st.major}专业${st.class}学生。综合评分${st.overallScore}分，标签：${st.tags.map(t => t.label).join('、')}`
      } else if (s.dataKey === 'strengths') {
        content = `1. 具有较强的逻辑思维能力\n2. 团队协作表现优秀\n3. ${st.tags[0]?.label || '学习态度端正'}`
      } else if (s.dataKey === 'weaknesses') {
        content = `1. 部分专业基础课程掌握不够扎实\n2. 学习时间管理有待提升\n3. 课外拓展阅读量不足`
      } else if (s.dataKey === 'courseRecommendations') {
        content = `| 课程名称 | 推荐理由 | 优先级 |\n|---------|---------|-------|\n| 数据结构进阶 | 弥补薄弱环节 | 高 |\n| 项目管理实践 | 提升综合能力 | 中 |\n| 人工智能导论 | 拓展专业视野 | 中 |`
      } else if (s.dataKey === 'developmentPath') {
        content = `建议发展路径：\n1. 短期（本学期）：夯实专业基础，确保GPA不低于3.0\n2. 中期（下一学年）：参与科研项目或实习，积累实践经验\n3. 长期（毕业前）：明确职业方向，准备就业或考研`
      } else if (s.dataKey === 'behaviorAnalysis') {
        content = `学习时长：${st.overallScore > 80 ? '高于' : '接近'}班级平均水平\n图书馆打卡：规律\n课堂出勤：良好\n建议保持当前学习习惯，适当增加课外拓展。`
      } else if (s.dataKey === 'nextPlan') {
        content = `下阶段建议：\n1. 重点关注薄弱课程的学习\n2. 积极参与学科竞赛\n3. 提前规划暑期实习`
      }
      return { ...s, content }
    })

    // 模拟嵌入图表
    const charts: EmbeddedChart[] = [
      {
        id: 'chart-gpa',
        title: 'GPA趋势',
        type: 'line',
        option: {
          xAxis: { type: 'category', data: ['2023秋', '2024春', '2024秋', '2025春', '2025秋'] },
          yAxis: { type: 'value', min: 0, max: 4 },
          series: [{ type: 'line', data: [3.2, 3.5, 3.1, 3.6, 3.8], smooth: true }],
        },
      },
      {
        id: 'chart-radar',
        title: '课程掌握度',
        type: 'radar',
        option: {
          radar: { indicator: [
            { name: '高等数学', max: 100 }, { name: '数据结构', max: 100 },
            { name: '计算机网络', max: 100 }, { name: '软件工程', max: 100 }, { name: '数据库', max: 100 },
          ]},
          series: [{ type: 'radar', data: [{ value: [85, 72, 58, 91, 66] }] }],
        },
      },
    ]

    const report: ReportRecord = {
      id: `rpt-${Date.now()}`,
      templateId: tpl.id,
      templateName: tpl.name,
      studentId: st.id,
      studentName: st.name,
      studentNo: st.studentNo,
      className: st.class,
      title,
      content: sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n'),
      sections,
      charts: tpl.id === 'tpl-1' || tpl.id === 'tpl-2' ? charts : [],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      status: 'generated',
    }

    currentReport.value = report
    reports.value.unshift(report)
    return report
  }

  function updateReportSection(sectionId: string, content: string) {
    if (!currentReport.value) return
    const section = currentReport.value.sections.find(s => s.id === sectionId)
    if (section) {
      section.content = content
      currentReport.value.content = currentReport.value.sections
        .map(s => `## ${s.title}\n\n${s.content}`).join('\n\n')
      currentReport.value.updateTime = new Date().toISOString()
    }
  }

  function deleteReport(id: string) {
    reports.value = reports.value.filter(r => r.id !== id)
    if (currentReport.value?.id === id) {
      currentReport.value = null
    }
  }

  function getReportsByStudent(studentId: string) {
    return reports.value.filter(r => r.studentId === studentId)
  }

  return {
    templates,
    reports,
    currentReport,
    selectedTemplate,
    selectedStudent,
    selectTemplate,
    setStudent,
    generateReport,
    updateReportSection,
    deleteReport,
    getReportsByStudent,
  }
})
