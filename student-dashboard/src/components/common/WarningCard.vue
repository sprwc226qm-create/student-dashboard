<script setup lang="ts">
import { RISK_LEVEL_MAP } from '@/constants/labels'

export interface WarningRecord {
  id: string
  studentName: string
  studentNo: string
  className: string
  ruleName: string
  level: 'high' | 'medium' | 'low'
}

defineProps<{
  record: WarningRecord
}>()

const emit = defineEmits<{
  viewDetail: [id: string]
  handle: [id: string, status: string]
}>()
</script>

<template>
  <div
    class="warning-card"
    :style="{ borderLeftColor: RISK_LEVEL_MAP[record.level].color }"
  >
    <div class="card-left">
      <span
        class="level-badge"
        :style="{
          color: RISK_LEVEL_MAP[record.level].color,
          background: RISK_LEVEL_MAP[record.level].bg
        }"
      >
        {{ RISK_LEVEL_MAP[record.level].label }}
      </span>
      <div class="student-info">
        <div class="student-name">{{ record.studentName }}</div>
        <div class="student-meta">{{ record.studentNo }} | {{ record.className }}</div>
      </div>
    </div>
    <div class="card-right">
      <div class="rule-name">触发规则：{{ record.ruleName }}</div>
      <div class="card-actions">
        <button class="btn-text" @click="emit('viewDetail', record.id)">查看详情</button>
        <button class="btn-primary" @click="emit('handle', record.id, 'processing')">处理</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.warning-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-left: 4px solid;
  border-radius: 10px;
  margin-bottom: 10px;
  background: var(--color-surface, #fff);
  box-shadow: var(--shadow-xs);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.warning-card:hover {
  box-shadow: var(--shadow-sm);
  transform: translateX(2px);
}
.card-left { display: flex; align-items: center; gap: 12px; }
.level-badge { padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; }
.student-name { font-size: 15px; font-weight: 600; }
.student-meta { font-size: 12px; color: #9ca3af; margin-top: 2px; }
.card-right { text-align: right; }
.rule-name { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
.card-actions { display: flex; gap: 8px; justify-content: flex-end; }
.btn-text {
  padding: 6px 14px; border: 1px solid #d1d5db; border-radius: 6px;
  background: white; color: #374151; font-size: 13px; cursor: pointer;
}
.btn-primary {
  padding: 6px 14px; border: none; border-radius: 6px;
  background: #3b82f6; color: white; font-size: 13px; cursor: pointer;
}
</style>