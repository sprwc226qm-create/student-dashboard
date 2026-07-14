<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/report'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const store = useReportStore()

const hasReports = computed(() => store.reports.length > 0)

function goCreate() {
  router.push('/report/create')
}

function viewReport(reportId: string) {
  const report = store.reports.find(r => r.id === reportId)
  if (report) {
    store.currentReport = report
    ElMessage.info('报告预览功能在创建页面中可用')
    router.push('/report/create')
  }
}

async function deleteReport(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这份报告吗？', '提示', { type: 'warning' })
    store.deleteReport(id)
    ElMessage.success('报告已删除')
  } catch { /* 取消 */ }
}

function exportPdf(_id: string) {
  ElMessage.info('请在创建页面中使用 PDF 导出功能')
}

// F4.9: 批量生成
async function batchGenerate() {
  try {
    await ElMessageBox.confirm(
      '将为一键批量生成所有预警学生的报告，确定继续？',
      '批量生成报告',
      { type: 'info' }
    )
    // 模拟批量生成
    ElMessage.success('批量生成完成！共生成 15 份预警报告')
  } catch { /* 取消 */ }
}

const statusLabel: Record<string, string> = {
  draft: '草稿',
  generated: '已生成',
  exported: '已导出',
}
</script>

<template>
  <div class="report-page">
    <div class="page-header">
      <div>
        <h2>📄 个性化干预报告</h2>
        <p class="subtitle">生成、导出和管理学生学业干预报告</p>
      </div>
      <div class="header-actions">
        <el-button @click="batchGenerate" :disabled="!hasReports">
          📦 批量生成
        </el-button>
        <el-button type="primary" @click="goCreate">
          + 新建报告
        </el-button>
      </div>
    </div>

    <!-- F4.1: 报告模板选择 -->
    <section class="templates-section">
      <h3>📋 报告模板</h3>
      <div class="template-cards">
        <div
          v-for="tpl in store.templates"
          :key="tpl.id"
          class="template-card"
          @click="store.selectTemplate(tpl.id); goCreate()"
        >
          <span class="template-icon">{{ tpl.icon }}</span>
          <div class="template-info">
            <div class="template-name">{{ tpl.name }}</div>
            <div class="template-desc">{{ tpl.description }}</div>
          </div>
          <span class="template-arrow">→</span>
        </div>
      </div>
    </section>

    <!-- F4.10: 报告历史 -->
    <section class="history-section">
      <h3>📚 报告历史</h3>
      <el-table
        v-if="hasReports"
        :data="store.reports"
        border
        stripe
        size="small"
        style="width: 100%"
      >
        <el-table-column prop="title" label="报告标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="className" label="班级" width="140" />
        <el-table-column prop="templateName" label="模板类型" width="130" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'generated' ? 'success' : row.status === 'exported' ? 'primary' : 'info'" size="small">
              {{ statusLabel[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ new Date(row.createTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="viewReport(row.id)">查看</el-button>
            <el-button size="small" link type="success" @click="exportPdf(row.id)">PDF</el-button>
            <el-button size="small" link type="danger" @click="deleteReport(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="还没有生成报告，点击上方按钮创建" />
    </section>
  </div>
</template>

<style scoped>
.report-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-page, 24px);
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}
.page-header h2 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: var(--color-text); }
.subtitle { margin: 4px 0 0; color: var(--color-text-secondary); font-size: 13px; }
.header-actions { display: flex; gap: 8px; }

.templates-section { margin-bottom: 36px; }
.templates-section h3 {
  margin-bottom: 14px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
.template-cards { display: flex; gap: 14px; flex-wrap: wrap; }
.template-card {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 14px);
  cursor: pointer;
  transition: all 0.25s ease;
  background: var(--color-surface, #fff);
  box-shadow: var(--shadow-sm);
}
.template-card:hover {
  border-color: var(--color-primary, #6366f1);
  box-shadow: var(--shadow-md), 0 0 0 3px rgba(99,102,241,0.1);
  transform: translateY(-2px);
}
.template-icon { font-size: 32px; }
.template-info { flex: 1; }
.template-name { font-size: 15px; font-weight: 600; color: var(--color-text); }
.template-desc { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
.template-arrow { font-size: 20px; color: #cbd5e1; transition: transform 0.2s ease; }
.template-card:hover .template-arrow { transform: translateX(4px); color: var(--color-primary); }

.history-section h3 {
  margin-bottom: 14px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}
</style>
