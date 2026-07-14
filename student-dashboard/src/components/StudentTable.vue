<script setup lang="ts">
import type { Student } from '@/mocks/data/students'

defineProps<{
  students: Student[]
}>()

function getGpaColor(gpa: number): string {
  if (gpa >= 3.5) return '#10b981'
  if (gpa >= 2.5) return '#3b82f6'
  if (gpa >= 2.0) return '#f59e0b'
  return '#ef4444'
}
</script>

<template>
  <table class="data-table">
    <thead>
      <tr>
        <th>姓名</th>
        <th>学号</th>
        <th>班级</th>
        <th>GPA</th>
        <th>等级</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="stu in students" :key="stu.studentNo">
        <td>{{ stu.name }}</td>
        <td>{{ stu.studentNo }}</td>
        <td>{{ stu.class }}</td>
        <td :style="{ color: getGpaColor(stu.gpa), fontWeight: 'bold' }">
          {{ stu.gpa.toFixed(1) }}
        </td>
        <td>
          <span class="badge" :style="{ background: getGpaColor(stu.gpa) }">
            {{ stu.gpa >= 3.5 ? '优秀' : stu.gpa >= 2.5 ? '良好' : stu.gpa >= 2.0 ? '一般' : '预警' }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
  <p v-if="students.length === 0" class="empty">未找到匹配的学生</p>
</template>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  background: #f9fafb;
  padding: 10px 14px;
  text-align: left;
  font-size: 13px;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}
.data-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}
.data-table tr:hover {
  background: #f9fafb;
}
.badge {
  padding: 2px 10px;
  border-radius: 10px;
  color: white;
  font-size: 12px;
}
.empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px;
}
</style>