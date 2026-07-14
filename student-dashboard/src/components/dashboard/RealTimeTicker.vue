<script setup lang="ts">
import type { BehaviorEvent } from '@/types/dashboard'
import { EVENT_TYPE_ICON } from '@/constants/labels'

defineProps<{
  events: BehaviorEvent[]
}>()
</script>

<template>
  <div class="ticker-wrapper">
    <div class="ticker-label">📡 实时动态</div>
    <div class="ticker-track">
      <div class="ticker-scroll" v-if="events.length">
        <span
          v-for="event in events"
          :key="event.id"
          class="ticker-item"
        >
          <span class="ticker-icon">{{ EVENT_TYPE_ICON[event.type] || '📋' }}</span>
          <span class="ticker-name">{{ event.studentName }}</span>
          <span class="ticker-time">{{ event.time }}</span>
          <span class="ticker-action">{{ event.action }}</span>
          <span class="ticker-divider">|</span>
        </span>
      </div>
      <!-- 双份实现无缝滚动 -->
      <div class="ticker-scroll" v-if="events.length" aria-hidden="true">
        <span
          v-for="event in events"
          :key="event.id + '-dup'"
          class="ticker-item"
        >
          <span class="ticker-icon">{{ EVENT_TYPE_ICON[event.type] || '📋' }}</span>
          <span class="ticker-name">{{ event.studentName }}</span>
          <span class="ticker-time">{{ event.time }}</span>
          <span class="ticker-action">{{ event.action }}</span>
          <span class="ticker-divider">|</span>
        </span>
      </div>
      <div v-if="!events.length" class="ticker-empty">等待数据...</div>
    </div>
  </div>
</template>

<style scoped>
.ticker-wrapper {
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 10px 0;
  overflow: hidden;
}
.ticker-label {
  flex-shrink: 0;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}
.ticker-track {
  flex: 1;
  overflow: hidden;
  display: flex;
  position: relative;
}
.ticker-scroll {
  display: flex;
  white-space: nowrap;
  animation: ticker-scroll 60s linear infinite;
}
.ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
}
.ticker-icon { font-size: 13px; }
.ticker-name { color: #60a5fa; font-size: 12px; font-weight: 500; }
.ticker-time { color: #64748b; font-size: 11px; margin: 0 4px; }
.ticker-action { color: #94a3b8; font-size: 12px; }
.ticker-divider { color: #334155; margin: 0 6px; }
.ticker-empty { color: #64748b; font-size: 13px; padding: 0 16px; }

@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
