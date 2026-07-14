<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/report'
import { useStudentStore } from '@/stores/student'
import { useWarningStore } from '@/stores/warning'
import BaseChart from '@/components/charts/BaseChart.vue'
import { ElMessage } from 'element-plus'
import type { ReportRecord, ReportSection } from '@/types/report'
import { RISK_LEVEL_LABEL, STATUS_LABEL } from '@/constants/labels'
// 动态导入
import type { EChartsOption } from 'echarts'

const router = useRouter()
const reportStore = useReportStore()
const studentStore = useStudentStore()
const warningStore = useWarningStore()

// F4.2: 学生选择
const studentSearch = ref('')
const selectedStudentId = ref('')
const reportTitle = ref('')
const editingSectionId = ref<string | null>(null)
const editContent = ref('')
const previewVisible = ref(false)
const exportingPdf = ref(false)
const exportingExcel = ref(false)

// 可选学生列表（模拟：预警学生 + 当前学生）
const availableStudents = computed(() => {
  const warnings = warningStore.allWarnings.map(w => ({
    id: w.studentId,
    name: w.studentName,
    studentNo: w.studentNo,
    className: w.className,
    reason: w.ruleName,
  }))
  // 加入画像中的学生
  if (studentStore.currentStudent) {
    warnings.unshift({
      id: studentStore.currentStudent.id,
      name: studentStore.currentStudent.name,
      studentNo: studentStore.currentStudent.studentNo,
      className: studentStore.currentStudent.class,
      reason: '当前查看',
    })
  }
  if (!studentSearch.value) return warnings
  const kw = studentSearch.value.toLowerCase()
  return warnings.filter(s => s.name.includes(kw) || s.studentNo.includes(kw))
})

function selectStudent(student: { id: string; name: string; studentNo: string; className: string }) {
  selectedStudentId.value = student.id
  studentStore.fetchAllStudentData(student.id)
  reportStore.setStudent({
    id: student.id,
    name: student.name,
    studentNo: student.studentNo,
    class: student.className,
    major: '软件工程',
    department: '计算机学院',
    counselor: '李老师',
    overallScore: studentStore.currentStudent?.overallScore || 85,
    tags: studentStore.currentStudent?.tags || [],
  })
}

// F4.3-F4.4: 报告生成
const generatedReport = ref<ReportRecord | null>(null)

function handleGenerate() {
  if (!reportStore.selectedTemplate) {
    ElMessage.warning('请先从报告列表页选择一个模板')
    router.push('/report')
    return
  }
  if (!reportStore.selectedStudent) {
    ElMessage.warning('请先选择一个学生')
    return
  }
  if (!reportTitle.value.trim()) {
    reportTitle.value = `${reportStore.selectedStudent.name} - ${reportStore.selectedTemplate.name}`
  }
  try {
    const report = reportStore.generateReport(reportTitle.value)
    generatedReport.value = report
    ElMessage.success('报告生成成功！')
  } catch (e) {
    ElMessage.error('生成失败: ' + (e as Error).message)
  }
}

// F4.3: 编辑报告内容
function startEdit(section: ReportSection) {
  editingSectionId.value = section.id
  editContent.value = section.content
}

function saveEdit() {
  if (editingSectionId.value) {
    reportStore.updateReportSection(editingSectionId.value, editContent.value)
    // 同步更新 generatedReport
    if (generatedReport.value) {
      const section = generatedReport.value.sections.find(s => s.id === editingSectionId.value)
      if (section) section.content = editContent.value
    }
    editingSectionId.value = null
    ElMessage.success('内容已更新')
  }
}

// F4.6: PDF 导出
async function exportPdf() {
  exportingPdf.value = true
  try {
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default
    const previewEl = document.querySelector('.report-preview')
    if (!previewEl) { ElMessage.error('预览内容未找到'); return }

    const canvas = await html2canvas(previewEl as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${reportTitle.value || '报告'}.pdf`)
    ElMessage.success('PDF 导出成功！')
  } catch (e) {
    console.error('PDF导出失败:', e)
    ElMessage.error('PDF 导出失败')
  } finally {
    exportingPdf.value = false
  }
}

// F4.7: Excel 批量导出
async function exportExcel() {
  exportingExcel.value = true
  try {
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('预警学生数据')

    // 表头
    sheet.columns = [
      { header: '姓名', key: 'name', width: 10 },
      { header: '学号', key: 'studentNo', width: 15 },
      { header: '班级', key: 'class', width: 15 },
      { header: '风险等级', key: 'level', width: 12 },
      { header: '触发规则', key: 'rule', width: 20 },
      { header: '处理状态', key: 'status', width: 12 },
    ]

    // 数据行
    warningStore.allWarnings.forEach(w => {
      sheet.addRow({
        name: w.studentName,
        studentNo: w.studentNo,
        class: w.className,
        level: RISK_LEVEL_LABEL[w.riskLevel],
        rule: w.ruleName,
        status: STATUS_LABEL[w.status],
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `预警学生数据_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    URL.revokeObjectURL(link.href)
    ElMessage.success('Excel 导出成功！')
  } catch (e) {
    console.error('Excel导出失败:', e)
    ElMessage.error('Excel 导出失败')
  } finally {
    exportingExcel.value = false
  }
}

// 模拟图表配置（用于 F4.4 预览嵌入）
const demoChartOption = computed<EChartsOption>(() => ({
  xAxis: { type: 'category', data: ['2023秋', '2024春', '2024秋', '2025春', '2025秋'] },
  yAxis: { type: 'value', max: 4 },
  series: [{
    type: 'line',
    data: [3.2, 3.5, 3.1, 3.6, 3.8],
    smooth: true,
    lineStyle: { color: '#3b82f6' },
  }],
}))

const selectedTemplateName = computed(() => reportStore.selectedTemplate?.name || '未选择')
const selectedStudentName = computed(() => reportStore.selectedStudent?.name || '未选择')
</script>

<template>
  <div class="report-create">
    <div class="page-header">
      <el-button link type="primary" @click="router.push('/report')">← 返回报告列表</el-button>
      <h2>📝 创建报告</h2>
      <div />
    </div>

    <div class="create-layout">
      <!-- 左侧：配置区 -->
      <div class="config-panel">
        <!-- F4.1: 模板选择 -->
        <div class="config-section">
          <h4>📋 当前模板</h4>
          <el-tag type="primary" size="large">{{ selectedTemplateName }}</el-tag>
          <el-button link type="primary" size="small" @click="router.push('/report')" style="margin-left: 8px">切换</el-button>
        </div>

        <!-- F4.2: 学生选择 -->
        <div class="config-section">
          <h4>👤 选择学生</h4>
          <el-input
            v-model="studentSearch"
            placeholder="搜索姓名或学号..."
            size="small"
            clearable
          />
          <div class="student-list">
            <div
              v-for="s in availableStudents"
              :key="s.id"
              class="student-option"
              :class="{ selected: selectedStudentId === s.id }"
              @click="selectStudent(s)"
            >
              <span class="student-name">{{ s.name }}</span>
              <span class="student-no">{{ s.studentNo }}</span>
              <span class="student-reason">{{ s.reason }}</span>
            </div>
          </div>
          <div v-if="reportStore.selectedStudent" class="selected-student">
            已选：<strong>{{ selectedStudentName }}</strong>
          </div>
        </div>

        <!-- F4.3: 报告标题 -->
        <div class="config-section">
          <h4>📝 报告标题</h4>
          <el-input v-model="reportTitle" placeholder="输入报告标题..." size="small" />
        </div>

        <!-- 操作按钮 -->
        <div class="config-actions">
          <el-button type="primary" size="large" style="width: 100%" @click="handleGenerate">
            🤖 生成报告
          </el-button>
          <div class="export-actions">
            <el-button :loading="exportingPdf" :disabled="!generatedReport" @click="exportPdf">
              📥 导出 PDF
            </el-button>
            <el-button :loading="exportingExcel" @click="exportExcel">
              📊 导出 Excel
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧：F4.8 报告预览区 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h4>📄 报告预览</h4>
          <el-switch
            v-model="previewVisible"
            active-text="编辑模式"
            inactive-text="预览模式"
          />
        </div>

        <div class="report-preview" v-if="generatedReport">
          <!-- 报告标题 -->
          <div class="preview-title">
            <h1>{{ generatedReport.title }}</h1>
            <p class="preview-meta">
              {{ generatedReport.studentName }} | {{ generatedReport.studentNo }} | {{ generatedReport.className }}
            </p>
            <p class="preview-meta">
              生成时间：{{ new Date(generatedReport.createTime).toLocaleString() }}
            </p>
          </div>

          <!-- F4.4: 图表嵌入 -->
          <div class="preview-chart" v-if="generatedReport.charts.length">
            <h4>📈 GPA 趋势图</h4>
            <BaseChart :option="demoChartOption" height="240px" />
          </div>

          <!-- 报告内容段落 -->
          <div
            v-for="section in generatedReport.sections"
            :key="section.id"
            class="preview-section"
          >
            <h3>{{ section.title }}</h3>
            <div v-if="editingSectionId === section.id" class="edit-area">
              <el-input
                v-model="editContent"
                type="textarea"
                :rows="6"
                placeholder="编辑内容..."
              />
              <div class="edit-actions">
                <el-button size="small" @click="editingSectionId = null">取消</el-button>
                <el-button size="small" type="primary" @click="saveEdit">保存</el-button>
              </div>
            </div>
            <div v-else class="section-content" :class="{ editable: section.editable }">
              <pre>{{ section.content }}</pre>
              <el-button
                v-if="section.editable"
                size="small"
                link
                type="primary"
                @click="startEdit(section)"
              >
                ✏️ 编辑
              </el-button>
            </div>
          </div>
        </div>

        <el-empty
          v-else
          description="选择模板和学生后，点击「生成报告」预览效果"
          style="margin-top: 80px"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-create {
  max-width: 1300px;
  margin: 0 auto;
  padding: var(--space-page, 24px);
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header h2 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: var(--color-text); }

.create-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

/* 左侧配置 */
.config-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.config-section {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 14px);
  padding: 18px;
  box-shadow: var(--shadow-sm);
}
.config-section h4 { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: var(--color-text); }

.student-list {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
}
.student-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  transition: all 0.15s ease;
}
.student-option:hover { background: #f1f5f9; }
.student-option.selected {
  background: var(--color-primary-bg, rgba(99,102,241,0.08));
  border: 1px solid var(--color-primary, #6366f1);
}
.student-name { font-size: 14px; font-weight: 600; }
.student-no { font-size: 12px; color: var(--color-text-muted); }
.student-reason { font-size: 11px; color: var(--color-text-secondary); margin-left: auto; }
.selected-student { margin-top: 8px; font-size: 13px; color: var(--color-primary); font-weight: 500; }

.config-actions { margin-top: 8px; }
.export-actions { display: flex; gap: 8px; margin-top: 8px; }
.export-actions .el-button { flex: 1; }

/* 右侧预览 */
.preview-panel {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 14px);
  padding: 28px;
  min-height: 600px;
  box-shadow: var(--shadow-sm);
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 18px;
  border-bottom: 2px solid #f1f5f9;
  margin-bottom: 24px;
}
.preview-header h4 { margin: 0; font-weight: 600; color: var(--color-text); }

.report-preview { max-width: 700px; margin: 0 auto; }
.preview-title {
  text-align: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--color-border);
}
.preview-title h1 { font-size: 24px; font-weight: 700; margin: 0 0 8px; color: var(--color-text); }
.preview-meta { font-size: 13px; color: var(--color-text-secondary); margin: 2px 0; }

.preview-chart {
  margin-bottom: 24px;
  padding: 18px;
  background: #f8fafc;
  border-radius: var(--radius-md, 10px);
  box-shadow: var(--shadow-xs);
}
.preview-chart h4 { margin: 0 0 10px; font-size: 14px; font-weight: 600; }

.preview-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}
.preview-section h3 { font-size: 16px; font-weight: 600; color: var(--color-text); margin: 0 0 10px; }
.section-content { position: relative; }
.section-content pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-text);
  margin: 0;
}
.editable { padding: 8px; border-radius: 6px; }
.editable:hover { background: #f8fafc; }

.edit-area { margin-top: 8px; }
.edit-actions { display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end; }
</style>
