<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useWarningStore } from '@/stores/warning'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseChart from '@/components/charts/BaseChart.vue'
import AlertNotification from '@/components/warning/AlertNotification.vue'
import type { EChartsOption } from 'echarts'
import type { WarningRecord } from '@/types/warning'
import { STATUS_TAG_TYPE as statusTagType, STATUS_LABEL as statusLabel, RISK_LEVEL_LABEL as riskLevelLabel } from '@/constants/labels'

const store = useWarningStore()
const detailVisible = ref(false)
const selectedWarning = ref<WarningRecord | null>(null)
const handleNote = ref('')
const showHistory = ref(false)

// ---- 图表配置 ----
const trendOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['高风险', '中风险', '低风险'], bottom: 0, textStyle: { fontSize: 11 } },
  grid: { top: 15, right: 15, bottom: 35, left: 40 },
  xAxis: {
    type: 'category',
    data: store.stats.trend30Days.map(d => d.date),
    axisLabel: { fontSize: 10, interval: 5 },
  },
  yAxis: { type: 'value', name: '人数' },
  series: [
    {
      name: '高风险', type: 'line', data: store.stats.trend30Days.map(d => d.high),
      smooth: true, lineStyle: { color: '#ef4444' }, areaStyle: { color: 'rgba(239,68,68,0.1)' },
    },
    {
      name: '中风险', type: 'line', data: store.stats.trend30Days.map(d => d.medium),
      smooth: true, lineStyle: { color: '#f59e0b' }, areaStyle: { color: 'rgba(245,158,11,0.1)' },
    },
    {
      name: '低风险', type: 'line', data: store.stats.trend30Days.map(d => d.low),
      smooth: true, lineStyle: { color: '#3b82f6' }, areaStyle: { color: 'rgba(59,130,246,0.1)' },
    },
  ],
}))

const deptRateOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  grid: { top: 10, right: 20, bottom: 25, left: 50 },
  xAxis: {
    type: 'category',
    data: store.stats.departmentRates.map(d => d.department),
    axisLabel: { fontSize: 10, rotate: 20 },
  },
  yAxis: { type: 'value', name: '预警率(%)' },
  series: [{
    type: 'bar',
    data: store.stats.departmentRates.map(d => ({
      value: d.rate,
      itemStyle: {
        color: d.rate > 12 ? '#ef4444' : d.rate > 9 ? '#f59e0b' : '#3b82f6',
        borderRadius: [4, 4, 0, 0],
      },
    })),
    barWidth: '50%',
  }],
}))

// ---- 方法 ----
function openDetail(warning: WarningRecord) {
  selectedWarning.value = warning
  handleNote.value = ''
  detailVisible.value = true
}

function handleWarning(status: WarningRecord['status']) {
  if (!selectedWarning.value) return
  store.updateWarningStatus(selectedWarning.value.id, status, handleNote.value)
  ElMessage.success(status === 'done' ? '已标记为处理完成' : status === 'processing' ? '已标记为处理中' : '已标记为忽略')
  detailVisible.value = false
}

async function confirmHandle(status: 'processing' | 'done' | 'ignored') {
  const labelMap: Record<string, string> = { processing: '开始处理', done: '标记完成', ignored: '忽略该预警' }
  try {
    await ElMessageBox.confirm(
      `确定要${labelMap[status]}吗？${handleNote.value ? '\n处理意见：' + handleNote.value : ''}`,
      '确认操作',
      { type: status === 'ignored' ? 'warning' : 'info' }
    )
    handleWarning(status)
  } catch { /* 取消 */ }
}

// F3.10: 模拟发送通知
function simulateNotify(warning: WarningRecord) {
  ElMessage({
    type: 'success',
    message: `📧 已模拟发送通知给 ${warning.studentName} 的辅导员（${warning.className}），通知状态：已送达`,
    duration: 3000,
    showClose: true,
  })
}

onMounted(() => {
  store.startAlertSimulation()
})

onBeforeUnmount(() => {
  store.stopAlertSimulation()
})
</script>

<template>
  <div class="warning-center">
    <!-- F3.6: 告警通知栏 -->
    <AlertNotification />

    <!-- 页面标题 -->
    <div class="page-header">
      <h2>⚠️ 学业风险预警面板</h2>
      <el-button type="primary" size="small" @click="showHistory = !showHistory">
        {{ showHistory ? '返回预警列表' : '查看历史记录' }}
      </el-button>
    </div>

    <!-- F3.7: 预警统计面板 -->
    <section class="stats-section">
      <div class="stat-card high" @click="store.setFilterLevel(store.filterLevel === 'high' ? 'all' : 'high')">
        <div class="stat-value">🔴 {{ store.levelCounts.high }}</div>
        <div class="stat-label">高风险</div>
      </div>
      <div class="stat-card medium" @click="store.setFilterLevel(store.filterLevel === 'medium' ? 'all' : 'medium')">
        <div class="stat-value">🟡 {{ store.levelCounts.medium }}</div>
        <div class="stat-label">中风险</div>
      </div>
      <div class="stat-card low" @click="store.setFilterLevel(store.filterLevel === 'low' ? 'all' : 'low')">
        <div class="stat-value">🔵 {{ store.levelCounts.low }}</div>
        <div class="stat-label">低风险</div>
      </div>
      <div class="stat-card total">
        <div class="stat-value">{{ store.stats.total }}</div>
        <div class="stat-label">总预警</div>
      </div>
    </section>

    <!-- 预警趋势 + 学院对比 -->
    <section class="charts-row">
      <div class="chart-box">
        <h4>📈 近30天预警趋势</h4>
        <BaseChart :option="trendOption" height="260px" />
      </div>
      <div class="chart-box">
        <h4>🏛️ 各学院预警率对比</h4>
        <BaseChart :option="deptRateOption" height="260px" />
      </div>
    </section>

    <!-- F3.8: 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="store.searchKeyword"
        placeholder="搜索姓名/学号/班级..."
        size="small"
        style="width: 220px"
        clearable
        @input="store.setSearchKeyword"
      />
      <el-select
        :model-value="store.filterLevel"
        size="small"
        style="width: 120px"
        @change="store.setFilterLevel"
      >
        <el-option label="全部等级" value="all" />
        <el-option label="🔴 高风险" value="high" />
        <el-option label="🟡 中风险" value="medium" />
        <el-option label="🔵 低风险" value="low" />
      </el-select>
      <el-select
        :model-value="store.filterStatus"
        size="small"
        style="width: 120px"
        @change="store.setFilterStatus"
      >
        <el-option label="全部状态" value="all" />
        <el-option label="待处理" value="pending" />
        <el-option label="处理中" value="processing" />
        <el-option label="已完成" value="done" />
        <el-option label="已忽略" value="ignored" />
      </el-select>
    </div>

    <!-- F3.3: 预警学生列表 -->
    <el-table
      :data="(showHistory ? [...store.allWarnings].reverse() : store.warnings)"
      border
      stripe
      size="small"
      style="width: 100%"
      max-height="500"
    >
      <el-table-column label="风险等级" width="90">
        <template #default="{ row }">
          <el-tag
            :type="row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'info'"
            size="small"
            effect="dark"
          >
            {{ riskLevelLabel[row.riskLevel] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="studentName" label="姓名" width="80" />
      <el-table-column prop="studentNo" label="学号" width="120" />
      <el-table-column prop="className" label="班级" width="140" />
      <el-table-column prop="ruleName" label="触发规则" min-width="160" show-overflow-tooltip />
      <el-table-column prop="triggerTime" label="触发时间" width="160">
        <template #default="{ row }">
          {{ new Date(row.triggerTime).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="处理状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTagType[row.status]" size="small">
            {{ statusLabel[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openDetail(row)">详情</el-button>
          <el-button v-if="row.status === 'pending'" size="small" link type="warning" @click="selectedWarning = row; handleNote = ''; confirmHandle('processing')">处理</el-button>
          <el-button size="small" link type="info" @click="simulateNotify(row)">📧通知</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- F3.4: 预警详情面板 (侧边抽屉) -->
    <el-drawer v-model="detailVisible" title="预警详情" size="480px">
      <template v-if="selectedWarning">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="学生姓名">{{ selectedWarning.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ selectedWarning.studentNo }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ selectedWarning.className }}</el-descriptions-item>
          <el-descriptions-item label="学院">{{ selectedWarning.department }}</el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="selectedWarning.riskLevel === 'high' ? 'danger' : selectedWarning.riskLevel === 'medium' ? 'warning' : 'info'" size="small" effect="dark">
              {{ riskLevelLabel[selectedWarning.riskLevel] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="触发规则">{{ selectedWarning.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="触发值">{{ selectedWarning.triggerValue.toFixed(1) }}</el-descriptions-item>
          <el-descriptions-item label="阈值">{{ selectedWarning.thresholdValue }}</el-descriptions-item>
          <el-descriptions-item label="触发时间" :span="2">{{ new Date(selectedWarning.triggerTime).toLocaleString() }}</el-descriptions-item>
        </el-descriptions>

        <!-- 预警历史 -->
        <h4 style="margin: 20px 0 12px">📋 预警历史记录</h4>
        <el-timeline>
          <el-timeline-item
            v-for="h in selectedWarning.history"
            :key="h.time"
            :timestamp="new Date(h.time).toLocaleString()"
          >
            {{ h.action }} — {{ h.operator }}
            <div v-if="h.note" style="color: #6b7280; font-size: 12px">{{ h.note }}</div>
          </el-timeline-item>
        </el-timeline>

        <!-- 处理操作区 -->
        <div class="handle-section" v-if="selectedWarning.status !== 'done' && selectedWarning.status !== 'ignored'">
          <h4>✍️ 处理操作</h4>
          <el-input
            v-model="handleNote"
            type="textarea"
            :rows="3"
            placeholder="请输入处理意见..."
          />
          <div class="handle-actions">
            <el-button type="warning" @click="confirmHandle('processing')">
              {{ selectedWarning.status === 'processing' ? '更新处理意见' : '开始处理' }}
            </el-button>
            <el-button type="success" @click="confirmHandle('done')">标记完成</el-button>
            <el-button type="info" @click="confirmHandle('ignored')">忽略</el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.warning-center {
  max-width: 1300px;
  margin: 0 auto;
  padding: var(--space-page, 24px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: var(--color-text); }

/* 统计卡片 */
.stats-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
  padding: 18px;
  border-radius: var(--radius-lg, 14px);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
  box-shadow: var(--shadow-xs);
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.stat-card.high { background: #fef2f2; border-color: #fecaca; }
.stat-card.high .stat-value { color: #dc2626; }
.stat-card.medium { background: #fffbeb; border-color: #fde68a; }
.stat-card.medium .stat-value { color: #d97706; }
.stat-card.low { background: #eff6ff; border-color: #bfdbfe; }
.stat-card.low .stat-value { color: #2563eb; }
.stat-card.total { background: #f8fafc; border-color: #e2e8f0; }
.stat-card.total .stat-value { color: #334155; }
.stat-value { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; }
.stat-label { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; font-weight: 450; }

/* 图表行 */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
}

/* 处理区 */
.handle-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
.handle-section h4 { margin: 0 0 12px; }
.handle-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style>
