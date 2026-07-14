<script setup lang="ts">
import { computed } from 'vue'
import { useCourseStore } from '@/stores/course'
import BaseChart from '@/components/charts/BaseChart.vue'
import type { EChartsOption } from 'echarts'

const courseStore = useCourseStore()

// 柱状图配置
const barOption = computed<EChartsOption>(() => ({
  title: { text: '课程成绩', left: 'center' },
  tooltip: {},
  xAxis: {
    type: 'category',
    data: courseStore.courses.map(c => c.name),
    axisLabel: { rotate: 30 },
  },
  yAxis: { type: 'value', name: '成绩', max: 100 },
  series: [
    {
      type: 'bar',
      data: courseStore.courses.map(c => ({
        value: c.score ?? 0,
        itemStyle: {
          color: (c.score ?? 0) >= 60 ? '#3b82f6' : '#ef4444',
          borderRadius: [4, 4, 0, 0],
        },
      })),
      barWidth: '50%',
      markLine: {
        data: [
          {
            yAxis: 60,
            label: { formatter: '及格线' },
            lineStyle: { color: '#ef4444' },
          },
        ],
      },
    },
  ],
  grid: { top: 50, right: 20, bottom: 60, left: 50 },
}))

// 饼图配置
const pieOption = computed<EChartsOption>(() => ({
  title: { text: '学分分布', left: 'center' },
  tooltip: { trigger: 'item', formatter: '{b}: {c} 学分 ({d}%)' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      data: courseStore.courses.map(c => ({ name: c.name, value: c.credit })),
      label: { formatter: '{b}\n{d}%' },
    },
  ],
}))
</script>

<template>
  <div class="course-charts-page">
    <h2>📚 课程数据可视化</h2>

    <!-- 统计卡片 -->
    <div v-if="courseStore.stats" class="stats-bar">
      <span>📊 平均分：<strong>{{ courseStore.stats.avgScore }}</strong></span>
      <span>📈 最高分：<strong>{{ courseStore.stats.maxScore }}</strong></span>
      <span>📉 最低分：<strong>{{ courseStore.stats.minScore }}</strong></span>
      <span>✅ 及格率：<strong>{{ (courseStore.stats.passRate * 100).toFixed(0) }}%</strong></span>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <BaseChart :option="barOption" height="400px" />
      <BaseChart :option="pieOption" height="400px" />
    </div>
  </div>
</template>

<style scoped>
.course-charts-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-page, 24px);
}
h2 {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.3px;
}
.stats-bar {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  background: #f1f5f9;
  padding: 14px 22px;
  border-radius: var(--radius-md, 10px);
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--color-text-secondary);
}
.stats-bar strong {
  color: var(--color-text);
  font-weight: 700;
}
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
}
</style>