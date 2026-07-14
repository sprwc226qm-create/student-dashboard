<script setup lang="ts">
defineProps<{
  value: number | string
  label: string
  icon: string
  trend?: string
  trendUp?: boolean
  variant?: 'default' | 'blue' | 'green' | 'orange' | 'red'
}>()
</script>

<template>
  <div class="data-card" :class="variant || 'default'">
    <div class="card-top">
      <span class="card-icon">{{ icon }}</span>
      <span v-if="trend" class="card-trend" :class="{ up: trendUp, down: !trendUp }">
        {{ trendUp ? '↑' : '↓' }} {{ trend }}
      </span>
    </div>
    <div class="card-value">{{ typeof value === 'number' ? value.toLocaleString() : value }}</div>
    <div class="card-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.data-card {
  flex: 1;
  min-width: 180px;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 22px 26px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.data-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.data-card.default::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
.data-card.blue::before    { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.data-card.green::before   { background: linear-gradient(90deg, #10b981, #34d399); }
.data-card.orange::before  { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.data-card.red::before     { background: linear-gradient(90deg, #ef4444, #f87171); }

.data-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.card-icon { font-size: 28px; }
.card-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}
.card-trend.up { color: #10b981; background: rgba(16, 185, 129, 0.12); }
.card-trend.down { color: #ef4444; background: rgba(239, 68, 68, 0.12); }

.card-value {
  font-size: 36px;
  font-weight: 800;
  color: #f1f5f9;
  line-height: 1.1;
  margin-bottom: 6px;
  letter-spacing: -1px;
}
.card-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 450;
}
</style>
