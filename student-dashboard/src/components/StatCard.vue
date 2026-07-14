<script setup lang="ts">
defineProps<{
  value: number | string
  label: string
  warning?: boolean
  success?: boolean
}>()
</script>

<template>
  <div class="stat-card" :class="{ warning, success }">
    <div class="stat-value">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  flex: 1;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  box-shadow: var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.04));
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.stat-card:hover {
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
  transform: translateY(-1px);
}

.stat-card.warning {
  background: #fef2f2;
  border-color: #fecaca;
}
.stat-card.warning .stat-value { color: #dc2626; }

.stat-card.success {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.stat-card.success .stat-value { color: #16a34a; }

.stat-value {
  font-size: 30px;
  font-weight: 800;
  color: #6366f1;
  line-height: 1.1;
  letter-spacing: -0.5px;
}
.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary, #64748b);
  margin-top: 6px;
  font-weight: 450;
}
</style>
