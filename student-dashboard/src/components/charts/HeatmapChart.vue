<template>
  <div ref="chartRef" :style="{ width: '100%', height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { LibraryHeatmapPoint } from '@/types/dashboard'

const props = defineProps<{
  data: LibraryHeatmapPoint[]
  height?: string
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const hours = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`)

function buildOption(): echarts.EChartsOption {
  // 构建热力图矩阵: [hourIdx, dayIdx, count]
  const heatData: [number, number, number][] = props.data.map(p => [
    p.hour - 8, // hour index 0-14
    p.day,       // day index 0-6
    p.count,
  ])

  return {
    tooltip: {
      position: 'top',
      formatter: (params: unknown) => {
        const p = params as { value: [number, number, number] }
        return `${days[p.value[1]]} ${p.value[0] + 8}:00<br/>在馆人数：<strong>${p.value[2]}</strong>`
      },
    },
    grid: { top: 10, right: 30, bottom: 30, left: 60 },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true },
      axisLabel: { fontSize: 10, color: '#94a3b8' },
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true },
      axisLabel: { fontSize: 11, color: '#94a3b8' },
    },
    visualMap: {
      min: 0,
      max: 300,
      calculable: true,
      orient: 'vertical',
      right: 0,
      top: 'center',
      inRange: {
        color: ['#0f172a', '#1e3a5f', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'],
      },
      textStyle: { color: '#94a3b8' },
    },
    series: [
      {
        type: 'heatmap',
        data: heatData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
}

let resizeHandler: () => void

onMounted(() => {
  nextTick(() => {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(buildOption())
  })
  resizeHandler = () => chartInstance?.resize()
  window.addEventListener('resize', resizeHandler)
})

// 用序列化字符串比较代替深度监听
watch(
  () => JSON.stringify(props.data),
  () => {
    chartInstance?.setOption(buildOption())
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  chartInstance?.dispose()
})
</script>
