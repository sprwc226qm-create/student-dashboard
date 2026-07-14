// src/stores/warning.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WarningRecord, WarningStats, AlertNotification, RiskLevel } from '@/types/warning'
import { mockWarningRecords, mockWarningStats, generateAlertNotification } from '@/mocks/data/warning'

export const useWarningStore = defineStore('warning', () => {
  const warnings = ref<WarningRecord[]>(mockWarningRecords)
  const stats = ref<WarningStats>(mockWarningStats)
  const notifications = ref<AlertNotification[]>([])
  const filterLevel = ref<RiskLevel | 'all'>('all')
  const filterStatus = ref<string>('all')
  const searchKeyword = ref('')
  let notificationTimer: ReturnType<typeof setInterval> | null = null

  // ---- 计算属性 ----
  const filteredWarnings = computed(() => {
    let list = warnings.value
    if (filterLevel.value !== 'all') {
      list = list.filter(w => w.riskLevel === filterLevel.value)
    }
    if (filterStatus.value !== 'all') {
      list = list.filter(w => w.status === filterStatus.value)
    }
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      list = list.filter(w =>
        w.studentName.includes(kw) ||
        w.studentNo.includes(kw) ||
        w.className.includes(kw)
      )
    }
    return list
  })

  const levelCounts = computed(() => ({
    high: warnings.value.filter(w => w.riskLevel === 'high').length,
    medium: warnings.value.filter(w => w.riskLevel === 'medium').length,
    low: warnings.value.filter(w => w.riskLevel === 'low').length,
  }))

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  // ---- 方法 ----
  function updateWarningStatus(id: string, status: WarningRecord['status'], note: string) {
    const w = warnings.value.find(w => w.id === id)
    if (w) {
      w.status = status
      w.handlerNote = note
      w.handleTime = new Date().toISOString()
      w.history.push({
        time: new Date().toISOString(),
        action: status === 'processing' ? '开始处理' : status === 'done' ? '已处理完成' : '标记忽略',
        operator: '辅导员-李老师',
        note,
      })
    }
  }

  function addNotification(notification: AlertNotification) {
    notifications.value.unshift(notification)
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  function markNotificationRead(id: string) {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }

  function markAllRead() {
    notifications.value.forEach(n => (n.read = true))
  }

  function setFilterLevel(level: RiskLevel | 'all') {
    filterLevel.value = level
  }

  function setFilterStatus(status: string) {
    filterStatus.value = status
  }

  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword
  }

  function startAlertSimulation() {
    // 每 15 秒模拟一条新的告警通知
    notificationTimer = setInterval(() => {
      const alert = generateAlertNotification()
      addNotification(alert)
      // 同时将新预警加入列表
      const newWarning: WarningRecord = {
        id: `warn-new-${Date.now()}`,
        studentId: `s-${Math.floor(Math.random() * 9000 + 1000)}`,
        studentName: alert.message.split('触发')[0] || '未知',
        studentNo: `2023${String(Math.floor(Math.random() * 90000 + 10000))}`,
        className: '软件工程1班',
        department: '计算机学院',
        riskLevel: alert.level,
        ruleName: alert.message.match(/".*?"/)?.[0]?.replace(/"/g, '') || '未知规则',
        ruleId: '1',
        triggerTime: new Date().toISOString(),
        triggerValue: 1.5,
        thresholdValue: 2.0,
        status: 'pending',
        handlerNote: '',
        handleTime: '',
        history: [
          { time: new Date().toISOString(), action: '系统触发预警', operator: '系统', note: '自动检测触发' },
        ],
      }
      warnings.value.unshift(newWarning)
    }, 15000)
  }

  function stopAlertSimulation() {
    if (notificationTimer) {
      clearInterval(notificationTimer)
      notificationTimer = null
    }
  }

  return {
    warnings: filteredWarnings,
    allWarnings: warnings,
    stats,
    notifications,
    filterLevel,
    filterStatus,
    searchKeyword,
    levelCounts,
    unreadCount,
    updateWarningStatus,
    addNotification,
    markNotificationRead,
    markAllRead,
    setFilterLevel,
    setFilterStatus,
    setSearchKeyword,
    startAlertSimulation,
    stopAlertSimulation,
  }
})
