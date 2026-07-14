<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/student'
import BaseChart from '@/components/charts/BaseChart.vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'

const route = useRoute()
const router = useRouter()
const store = useStudentStore()
const exporting = ref(false)

const studentId = computed(() => route.params.id as string)

onMounted(() => {
  store.fetchAllStudentData(studentId.value)
})

// 监听路由参数变化，切换学生
watch(studentId, (newId) => {
  if (newId) {
    store.fetchAllStudentData(newId)
  }
})

// 学生搜索切换
function onStudentChange(id: string) {
  if (id) {
    router.push(`/portrait/${id}`)
  }
}

// GPA 趋势图
const gpaOption = computed<EChartsOption>(() => ({
  title: { text: 'GPA 变化趋势', left: 'center', textStyle: { fontSize: 15 } },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: store.gpaHistory.map((g) =>
      g.semester.replace('20', '').replace('-', '春').replace('-', '秋')
    ),
  },
  yAxis: { type: 'value', min: 0, max: 4.0, name: 'GPA' },
  series: [
    {
      type: 'line',
      data: store.gpaHistory.map((g) => g.gpa),
      smooth: true,
      lineStyle: { color: '#3b82f6', width: 2 },
      areaStyle: { color: 'rgba(59,130,246,0.1)' },
      markLine: {
        silent: true,
        data: [
          {
            yAxis: 2.0,
            label: { formatter: '警戒线' },
            lineStyle: { color: '#ef4444', type: 'dashed' },
          },
        ],
      },
    },
  ],
  grid: { top: 45, right: 20, bottom: 30, left: 45 },
}))

// 课程掌握度雷达图
const radarOption = computed<EChartsOption>(() => ({
  title: { text: '课程掌握度', left: 'center', textStyle: { fontSize: 15 } },
  tooltip: {},
  legend: { data: ['本人', '班级平均'], bottom: 0 },
  radar: {
    indicator: store.courseMastery.map((c) => ({ name: c.courseName, max: 100 })),
    radius: '60%',
  },
  series: [
    {
      type: 'radar',
      name: '本人',
      data: [{ value: store.courseMastery.map((c) => c.score) }],
      lineStyle: { color: '#3b82f6' },
      areaStyle: { color: 'rgba(59,130,246,0.15)' },
    },
    {
      type: 'radar',
      name: '班级平均',
      data: [{ value: store.courseMastery.map((c) => c.classAvg) }],
      lineStyle: { color: '#9ca3af', type: 'dashed' },
    },
  ],
}))

// F2.8: 消费行为趋势图
const consumptionTrendOption = computed<EChartsOption>(() => ({
  title: { text: '月度消费趋势', left: 'center', textStyle: { fontSize: 15 } },
  tooltip: { trigger: 'axis' },
  legend: { data: ['餐饮', '学习用品', '其他'], bottom: 0 },
  xAxis: { type: 'category', data: store.monthlyConsumption.map(c => c.month) },
  yAxis: { type: 'value', name: '元' },
  series: [
    {
      name: '餐饮', type: 'bar', stack: 'total',
      data: store.monthlyConsumption.map(c => c.food),
      itemStyle: { color: '#f59e0b' },
    },
    {
      name: '学习用品', type: 'bar', stack: 'total',
      data: store.monthlyConsumption.map(c => c.study),
      itemStyle: { color: '#3b82f6' },
    },
    {
      name: '其他', type: 'bar', stack: 'total',
      data: store.monthlyConsumption.map(c => c.other),
      itemStyle: { color: '#94a3b8' },
    },
  ],
  grid: { top: 45, right: 20, bottom: 35, left: 50 },
}))

// F2.9: 综合素质六维评估
const qualityRadarOption = computed<EChartsOption>(() => ({
  title: { text: '综合素质六维评估', left: 'center', textStyle: { fontSize: 15 } },
  legend: { data: ['本人', '班级平均'], bottom: 0 },
  radar: {
    indicator: store.qualityScores.map(q => ({ name: q.dimension, max: 100 })),
    radius: '60%',
  },
  series: [
    {
      type: 'radar',
      name: '本人',
      data: [{ value: store.qualityScores.map(q => q.score) }],
      lineStyle: { color: '#8b5cf6' },
      areaStyle: { color: 'rgba(139,92,246,0.15)' },
    },
    {
      type: 'radar',
      name: '班级平均',
      data: [{ value: store.qualityScores.map(q => q.classAvg) }],
      lineStyle: { color: '#9ca3af', type: 'dashed' },
    },
  ],
}))

// F2.10: 导出画像为图片
async function exportPortrait() {
  exporting.value = true
  try {
    const html2canvas = (await import('html2canvas')).default
    const portraitEl = document.querySelector('.portrait-detail')
    if (!portraitEl) {
      ElMessage.error('未找到画像内容')
      return
    }
    const canvas = await html2canvas(portraitEl as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `学生画像_${store.currentStudent?.name || 'unknown'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    ElMessage.success('画像导出成功！')
  } catch (e) {
    console.error('导出失败:', e)
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="portrait-detail" v-loading="store.loading">
    <!-- 学生搜索切换 -->
    <div class="student-search-bar">
      <el-select
        :model-value="studentId"
        filterable
        placeholder="搜索学生（学号/姓名）"
        size="large"
        style="width: 100%"
        @change="onStudentChange"
      >
        <el-option
          v-for="s in store.studentList"
          :key="s.id"
          :label="`${s.name} — ${s.studentNo} — ${s.class}`"
          :value="s.id"
        />
      </el-select>
    </div>

    <!-- 基础信息卡片 -->
    <div class="info-card" v-if="store.currentStudent">
      <div class="info-left">
        <el-avatar :size="72" style="font-size: 28px">
          {{ store.currentStudent.name[0] }}
        </el-avatar>
        <div class="info-text">
          <h2>{{ store.currentStudent.name }}</h2>
          <p>{{ store.currentStudent.studentNo }} | {{ store.currentStudent.class }}</p>
          <p>{{ store.currentStudent.major }} | {{ store.currentStudent.department }}</p>
          <p>辅导员：{{ store.currentStudent.counselor }}</p>
        </div>
      </div>
      <div class="info-right">
        <div class="score-circle">
          <span class="score-num">{{ store.currentStudent.overallScore }}</span>
          <span class="score-unit">综合分</span>
        </div>
        <el-button
          type="primary"
          size="small"
          :loading="exporting"
          style="margin-left: 16px"
          @click="exportPortrait"
        >
          📥 导出画像
        </el-button>
      </div>
    </div>

    <!-- 行为标签 -->
    <div class="tags-section" v-if="store.currentStudent?.tags.length">
      <span class="tags-label">行为标签：</span>
      <el-tag
        v-for="tag in store.currentStudent.tags"
        :key="tag.label"
        :type="tag.category === 'warning' ? 'danger' : tag.category === 'study' ? '' : 'info'"
        effect="plain"
        style="margin-right: 8px"
      >
        {{ tag.label }}
      </el-tag>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="chart-box">
        <BaseChart :option="gpaOption" height="350px" v-if="store.gpaHistory.length" />
        <el-empty v-else description="暂无GPA数据" />
      </div>
      <div class="chart-box">
        <BaseChart :option="radarOption" height="350px" v-if="store.courseMastery.length" />
        <el-empty v-else description="暂无课程数据" />
      </div>
    </div>

    <!-- 行为对比表格 -->
    <div class="section-card" v-if="store.behaviorComparison.length">
      <h3>行为模式对比（个人 vs 班级平均）</h3>
      <el-table :data="store.behaviorComparison" border size="small">
        <el-table-column prop="dimension" label="维度" />
        <el-table-column prop="studentValue" label="本人">
          <template #default="{ row }">{{ row.studentValue }}{{ row.unit }}</template>
        </el-table-column>
        <el-table-column prop="classAvg" label="班级平均">
          <template #default="{ row }">{{ row.classAvg }}{{ row.unit }}</template>
        </el-table-column>
        <el-table-column prop="gradeAvg" label="年级平均">
          <template #default="{ row }">{{ row.gradeAvg }}{{ row.unit }}</template>
        </el-table-column>
      </el-table>
    </div>

    <!-- F2.8: 消费行为分析 -->
    <div class="charts-grid" v-if="store.monthlyConsumption.length">
      <div class="chart-box">
        <BaseChart :option="consumptionTrendOption" height="350px" />
      </div>
      <div class="chart-box" v-if="store.qualityScores.length">
        <BaseChart :option="qualityRadarOption" height="350px" />
      </div>
    </div>

    <!-- 学业事件时间轴 -->
    <div class="section-card" v-if="store.academicEvents.length">
      <h3>学业事件时间轴</h3>
      <el-timeline>
        <el-timeline-item
          v-for="event in store.academicEvents"
          :key="event.date + event.title"
          :timestamp="event.date"
          :color="
            event.type === 'fail'
              ? '#ef4444'
              : event.type === 'award'
                ? '#10b981'
                : event.type === 'warning'
                  ? '#f59e0b'
                  : '#3b82f6'
          "
        >
          {{ event.title }}
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<style scoped>
.portrait-detail {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-page, 24px);
}

.student-search-bar {
  margin-bottom: 20px;
}

.info-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: var(--radius-lg, 14px);
  padding: 28px 36px;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.25);
}
.info-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.info-text h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}
.info-text p {
  font-size: 13px;
  margin: 2px 0;
  opacity: 0.85;
}
.score-circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.score-num {
  font-size: 32px;
  font-weight: 700;
}
.score-unit {
  font-size: 12px;
  opacity: 0.8;
}

.tags-section {
  margin-bottom: 20px;
  padding: 12px 0;
}
.tags-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-right: 8px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.section-card {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 10px);
  padding: 18px 22px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-xs);
}

h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 14px;
  color: var(--color-text);
  letter-spacing: -0.2px;
}
</style>