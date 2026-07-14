<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import type { EChartsOption } from 'echarts'

// 模拟数据
const gpaData = [
  { semester: '2023秋', gpa: 3.2, rank: 15 },
  { semester: '2024春', gpa: 3.5, rank: 12 },
  { semester: '2024秋', gpa: 3.1, rank: 18 },
  { semester: '2025春', gpa: 3.6, rank: 10 },
  { semester: '2025秋', gpa: 3.8, rank: 8 },
]

const option = computed<EChartsOption>(() => ({
  title: { text: 'GPA 变化趋势', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['GPA', '班级排名'], bottom: 0 },
  xAxis: {
    type: 'category',
    data: gpaData.map(d => d.semester),
  },
  yAxis: [
    { type: 'value', name: 'GPA', min: 0, max: 4.0 },
    { type: 'value', name: '排名', min: 1, max: 45, inverse: true },
  ],
  series: [
    {
      name: 'GPA',
      type: 'line',
      data: gpaData.map(d => d.gpa),
      smooth: true,
      lineStyle: { color: '#3b82f6', width: 3 },
      areaStyle: { color: 'rgba(59,130,246,0.1)' },
      markLine: {
        data: [
          {
            yAxis: 2.0,
            label: { formatter: '警戒线' },
            lineStyle: { color: '#ef4444' },
          },
        ],
      },
    },
    {
      name: '班级排名',
      type: 'line',
      yAxisIndex: 1,
      data: gpaData.map(d => d.rank),
      smooth: true,
      lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
    },
  ],
  grid: { top: 50, right: 60, bottom: 40, left: 50 },
}))
</script>

<template>
  <div class="chart-demo-page">
    <h2>📈 GPA 趋势</h2>
    <BaseChart :option="option" height="400px" />
  </div>
</template>

<style scoped>
.chart-demo-page {
  max-width: 800px;
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
</style>