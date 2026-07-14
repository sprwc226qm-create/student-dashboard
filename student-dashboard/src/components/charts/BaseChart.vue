<template>
  <div ref="chartRef" :style="{ width: '100%', height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  option: EChartsOption
  height?: string
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(props.option)
}

let resizeHandler: () => void

onMounted(() => {
  nextTick(() => initChart())
  resizeHandler = () => chartInstance?.resize()
  window.addEventListener('resize', resizeHandler)
})

// 用序列化字符串比较代替深度监听，避免对象引用不变但属性变化的场景
// 同时也避免引用变化但值相同时的无效重渲染
watch(
  () => JSON.stringify(props.option),
  (newStr) => {
    if (chartInstance) {
      chartInstance.setOption(JSON.parse(newStr), true)
    }
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  chartInstance?.dispose()
})
</script>
