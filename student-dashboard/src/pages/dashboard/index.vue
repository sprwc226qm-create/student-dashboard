<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import BaseChart from '@/components/charts/BaseChart.vue'
import HeatmapChart from '@/components/charts/HeatmapChart.vue'
import DataCard from '@/components/dashboard/DataCard.vue'
import RealTimeTicker from '@/components/dashboard/RealTimeTicker.vue'
import RefreshControl from '@/components/dashboard/RefreshControl.vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { RefreshInterval } from '@/types/dashboard'

const store = useDashboardStore()

// ---- F1.2: 学习投入趋势图 ----
const studyTrendOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  grid: { top: 15, right: 15, bottom: 25, left: 45 },
  xAxis: {
    type: 'category',
    data: store.studyTrend.map(p => p.date),
    axisLabel: { fontSize: 10, color: '#94a3b8', interval: 4 },
  },
  yAxis: {
    type: 'value',
    name: '小时',
    nameTextStyle: { color: '#94a3b8' },
    axisLabel: { color: '#94a3b8' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
  },
  series: [{
    type: 'line',
    data: store.studyTrend.map(p => p.hours),
    smooth: true,
    lineStyle: { color: '#3b82f6', width: 2 },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(59,130,246,0.3)' },
        { offset: 1, color: 'rgba(59,130,246,0.02)' },
      ]),
    },
    symbol: 'none',
  }],
}))

// ---- F1.4: 食堂消费分布 ----
const canteenPieOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} 人次 ({d}%)' },
  legend: { bottom: 0, textStyle: { color: '#94a3b8', fontSize: 10 } },
  series: [{
    type: 'pie',
    radius: ['45%', '75%'],
    center: ['50%', '45%'],
    data: store.canteenData.map(d => ({ name: d.name, value: d.count })),
    label: { color: '#94a3b8', fontSize: 10 },
    itemStyle: { borderColor: '#0f172a', borderWidth: 3 },
  }],
}))

const canteenBarOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  grid: { top: 10, right: 10, bottom: 60, left: 50 },
  xAxis: {
    type: 'category',
    data: store.canteenData.map(d => d.name),
    axisLabel: { rotate: 30, fontSize: 10, color: '#94a3b8' },
  },
  yAxis: {
    type: 'value',
    name: '金额(元)',
    nameTextStyle: { color: '#94a3b8' },
    axisLabel: { color: '#94a3b8' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
  },
  series: [{
    type: 'bar',
    data: store.canteenData.map(d => ({
      value: d.amount,
      itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] },
    })),
    barWidth: '50%',
  }],
}))

// ---- F1.6: 院系雷达对比 ----
const radarOption = computed<EChartsOption>(() => ({
  legend: {
    data: store.departmentComparison.map(d => d.department),
    bottom: 0,
    textStyle: { color: '#94a3b8', fontSize: 10 },
  },
  radar: {
    center: ['50%', '50%'],
    radius: '60%',
    indicator: [
      { name: '学习投入', max: 100 },
      { name: '图书借阅', max: 100 },
      { name: '活动参与', max: 100 },
      { name: '出勤率', max: 100 },
      { name: '消费', max: 100 },
    ],
    axisName: { color: '#94a3b8' },
    splitArea: {
      areaStyle: { color: ['rgba(59,130,246,0.02)', 'rgba(59,130,246,0.02)'] },
    },
  },
  series: store.departmentComparison.map(d => ({
    type: 'radar',
    name: d.department,
    data: [{
      value: [d.studyEngagement, d.bookBorrowing, d.activityParticipation, d.attendance, d.consumption],
    }],
  })),
}))

// ---- 生命周期 ----
onMounted(() => {
  store.startEventStream()
})

onBeforeUnmount(() => {
  store.cleanup()
})

function handleRefresh() {
  store.refreshData()
}

function handleIntervalChange(interval: RefreshInterval) {
  store.setRefreshInterval(interval)
}
</script>

<template>
  <div class="dashboard">
    <!-- ====== 顶栏：标题 + 刷新控制 ====== -->
    <header class="dash-header">
      <h1 class="dash-title">📊 学生行为数据可视化大屏</h1>
      <RefreshControl
        :current-interval="store.refreshInterval"
        :auto-refresh="store.autoRefresh"
        @update:interval="handleIntervalChange"
        @manual-refresh="handleRefresh"
      />
    </header>

    <!-- ====== F1.1: 概览卡片 ====== -->
    <section class="overview-cards">
      <DataCard icon="👨‍🎓" label="在校生总数" :value="store.overview.totalStudents" variant="blue" trend="+3.2%" :trend-up="true" />
      <DataCard icon="🏃" label="今日活跃人数" :value="store.overview.activeToday" variant="green" trend="+5.1%" :trend-up="true" />
      <DataCard icon="📖" label="平均学习时长" :value="store.overview.avgStudyHours" variant="orange" trend="-0.3h" :trend-up="false" />
      <DataCard icon="⚠️" label="预警人数" :value="store.overview.warningCount" variant="red" trend="-12人" :trend-up="true" />
    </section>

    <!-- ====== 主内容区 ====== -->
    <div class="dash-grid">
      <!-- F1.2: 学习投入趋势 -->
      <section class="dash-panel panel-trend">
        <div class="panel-header">
          <h3>📈 近30天学习投入趋势</h3>
          <div class="panel-filters">
            <el-select
              :model-value="store.gradeFilter"
              size="small"
              style="width: 110px"
              @change="store.setGradeFilter"
            >
              <el-option
                v-for="g in store.gradeOptions"
                :key="g.value"
                :label="g.label"
                :value="g.value"
              />
            </el-select>
          </div>
        </div>
        <BaseChart :option="studyTrendOption" height="280px" />
      </section>

      <!-- F1.3: 图书馆热力图 -->
      <section class="dash-panel panel-heatmap">
        <div class="panel-header">
          <h3>🔥 图书馆在馆人数热力图</h3>
          <span class="panel-subtitle">本周 · 各时段</span>
        </div>
        <HeatmapChart :data="store.libraryHeatmap" height="280px" />
      </section>

      <!-- F1.4: 食堂消费分布 -->
      <section class="dash-panel">
        <div class="panel-header">
          <h3>🍽️ 食堂消费分布</h3>
        </div>
        <div class="panel-two-cols">
          <BaseChart :option="canteenPieOption" height="240px" />
          <BaseChart :option="canteenBarOption" height="240px" />
        </div>
      </section>

      <!-- F1.5: 校园行为地图 -->
      <section class="dash-panel">
        <div class="panel-header">
          <h3>📍 校园区域实时人数</h3>
          <span class="panel-subtitle">实时监测</span>
        </div>
        <div class="campus-areas">
          <div v-for="area in store.campusAreas" :key="area.name" class="campus-area-item">
            <div class="area-info">
              <span class="area-icon">{{ area.icon }}</span>
              <span class="area-name">{{ area.name }}</span>
              <span class="area-count">{{ area.count }}<small> / {{ area.total }}</small></span>
            </div>
            <div class="area-bar">
              <div
                class="area-fill"
                :style="{ width: area.percent + '%' }"
                :class="{
                  'fill-high': area.percent >= 70,
                  'fill-mid': area.percent >= 40 && area.percent < 70,
                  'fill-low': area.percent < 40,
                }"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- F1.6: 院系对比雷达图 -->
      <section class="dash-panel panel-radar">
        <div class="panel-header">
          <h3>🎯 各学院五维对比</h3>
        </div>
        <BaseChart :option="radarOption" height="320px" />
      </section>
    </div>

    <!-- ====== F1.7: 实时滚动条 ====== -->
    <section class="ticker-section">
      <RealTimeTicker :events="store.realtimeEvents" />
    </section>
  </div>
</template>

<style scoped>
/* ====== 大屏整体 ====== */
.dashboard {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 100%, rgba(59, 130, 246, 0.06) 0%, transparent 60%),
    #0f172a;
  color: #e2e8f0;
  padding: 24px 28px;
  box-sizing: border-box;
}

/* 顶栏 */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}
.dash-title {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  letter-spacing: -0.3px;
}

/* 概览卡片 */
.overview-cards {
  display: flex;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

/* 主网格 */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}
.panel-trend {
  grid-column: 1 / -1;
}

/* 面板卡片 */
.dash-panel {
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 18px 22px;
  backdrop-filter: blur(8px);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.dash-panel:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.06);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.panel-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  letter-spacing: -0.2px;
}
.panel-subtitle {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}
.panel-filters {
  display: flex;
  gap: 8px;
}

.panel-two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

/* 校园区域 */
.campus-areas {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.campus-area-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.area-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.area-icon { font-size: 22px; }
.area-name { font-size: 13px; color: #cbd5e1; width: 64px; font-weight: 500; }
.area-count {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
}
.area-count small { font-size: 11px; color: #64748b; font-weight: 400; }
.area-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  overflow: hidden;
}
.area-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.fill-high { background: linear-gradient(90deg, #ef4444, #f87171); }
.fill-mid { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.fill-low { background: linear-gradient(90deg, #10b981, #34d399); }

/* 实时动态区 */
.ticker-section {
  margin-top: 4px;
}

/* 响应式：中等屏幕 */
@media (max-width: 1400px) {
  .dash-grid { grid-template-columns: 1fr; }
  .overview-cards { flex-wrap: wrap; }
}

/* 响应式：移动端 */
@media (max-width: 768px) {
  .dashboard { padding: 12px; }
  .dash-title { font-size: 18px; }
  .dash-header { padding: 12px; }
  .overview-cards { flex-direction: column; gap: 8px; }
  .dash-grid { grid-template-columns: 1fr; gap: 8px; }
  .panel-two-cols { grid-template-columns: 1fr; }
  .dash-panel { padding: 14px; }
}
</style>
