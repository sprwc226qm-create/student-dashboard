<script setup lang="ts">
import type { RefreshInterval } from '@/types/dashboard'

defineProps<{
  currentInterval: RefreshInterval
  autoRefresh: boolean
}>()

const emit = defineEmits<{
  'update:interval': [interval: RefreshInterval]
  'manual-refresh': []
}>()

const intervals: { label: string; value: RefreshInterval }[] = [
  { label: '手动刷新', value: 0 },
  { label: '30秒', value: 30 },
  { label: '60秒', value: 60 },
  { label: '120秒', value: 120 },
]
</script>

<template>
  <div class="refresh-control">
    <el-button
      v-for="opt in intervals"
      :key="opt.value"
      :type="currentInterval === opt.value ? 'primary' : 'default'"
      size="small"
      :plain="currentInterval !== opt.value"
      @click="emit('update:interval', opt.value)"
    >
      {{ opt.label }}
    </el-button>
    <el-divider direction="vertical" />
    <el-button size="small" :icon="'Refresh'" circle @click="emit('manual-refresh')" title="立即刷新" />
    <span v-if="autoRefresh" class="auto-badge">● 自动刷新中</span>
  </div>
</template>

<style scoped>
.refresh-control {
  display: flex;
  align-items: center;
  gap: 6px;
}
.auto-badge {
  font-size: 12px;
  color: #10b981;
  margin-left: 8px;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
