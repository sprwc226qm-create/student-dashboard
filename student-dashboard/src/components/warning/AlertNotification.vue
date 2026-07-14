<script setup lang="ts">
import { useWarningStore } from '@/stores/warning'
import type { RiskLevel } from '@/types/warning'

const store = useWarningStore()

const levelColor: Record<RiskLevel, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
}
</script>

<template>
  <div class="alert-notification-bar" v-if="store.notifications.length">
    <el-popover
      placement="bottom-end"
      :width="360"
      trigger="click"
    >
      <template #reference>
        <el-badge :value="store.unreadCount" :hidden="store.unreadCount === 0" :max="99">
          <el-button size="small" circle>🔔</el-button>
        </el-badge>
      </template>

      <div class="notification-list">
        <div class="notification-header">
          <span>预警通知</span>
          <el-button size="small" link type="primary" @click="store.markAllRead()">
            全部已读
          </el-button>
        </div>
        <div
          v-for="notif in store.notifications.slice(0, 10)"
          :key="notif.id"
          class="notification-item"
          :class="{ unread: !notif.read }"
          :style="{ borderLeftColor: levelColor[notif.level] }"
          @click="store.markNotificationRead(notif.id)"
        >
          <div class="notif-title">
            <span class="notif-level" :style="{ color: levelColor[notif.level] }">
              {{ notif.title }}
            </span>
            <span class="notif-time">{{ notif.time }}</span>
          </div>
          <div class="notif-message">{{ notif.message }}</div>
        </div>
        <div v-if="store.notifications.length === 0" class="notif-empty">
          暂无通知
        </div>
      </div>
    </el-popover>
  </div>
</template>

<style scoped>
.alert-notification-bar {
  position: fixed;
  top: 16px;
  right: 24px;
  z-index: 1000;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}
.notification-item {
  padding: 10px 12px;
  border-left: 3px solid;
  margin-bottom: 6px;
  border-radius: 4px;
  background: #f9fafb;
  cursor: pointer;
  transition: background 0.15s;
}
.notification-item:hover { background: #f3f4f6; }
.notification-item.unread { background: #eff6ff; }
.notif-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.notif-level { font-size: 13px; font-weight: 600; }
.notif-time { font-size: 11px; color: #9ca3af; }
.notif-message { font-size: 12px; color: #6b7280; }
.notif-empty { text-align: center; color: #9ca3af; padding: 24px; font-size: 13px; }
</style>
