<script setup lang="ts">
import { useCourseStore } from '@/stores/course'
import StatCard from '@/components/StatCard.vue'
import WarningCard, { type WarningRecord } from '@/components/common/WarningCard.vue'

const courseStore = useCourseStore()

const mockWarnings: WarningRecord[] = [
  { id: '1', studentName: '唐博', studentNo: '202301023', className: '软件工程1班', ruleName: 'GPA低于1.6', level: 'high' },
  { id: '2', studentName: '赵六', studentNo: '202301004', className: '计算机科学1班', ruleName: 'GPA低于2.0', level: 'medium' },
  { id: '3', studentName: '周杰', studentNo: '202301007', className: '软件工程1班', ruleName: '连续缺课3次', level: 'low' },
]

function onViewDetail(id: string) {
  console.log('查看详情:', id)
}
function onHandle(id: string, status: string) {
  console.log('处理预警:', id, status)
}
</script>

<template>
  <div class="page">
    <h2>📚 课程管理</h2>

    <div class="stats">
      <StatCard :value="courseStore.courses.length" label="总课程" />
      <StatCard :value="courseStore.passedCourses.length" label="及格" success />
      <StatCard :value="courseStore.failedCourses.length" label="挂科" warning />
      <StatCard :value="courseStore.avgScore" label="平均分" />
    </div>

    <input
      v-model="courseStore.filterKeyword"
      placeholder="搜索课程或教师..."
      class="search-box"
    />

    <ul class="course-list">
      <li
        v-for="c in courseStore.filteredCourses"
        :key="c.id"
        class="course-item"
        :style="{ borderLeftColor: (c.score ?? 0) < 60 ? '#ef4444' : '#10b981' }"
      >
        <div class="course-info">
          <span class="course-name">{{ c.name }}</span>
          <span class="course-meta">{{ c.teacher }} | {{ c.credit }}学分</span>
        </div>
        <div class="course-score" :style="{ color: (c.score ?? 0) < 60 ? '#ef4444' : '#111' }">
          {{ c.score ?? '-' }}分
        </div>
      </li>
    </ul>
    <p v-if="courseStore.filteredCourses.length === 0" class="empty">未找到匹配的课程</p>

    <h3 class="section-title">⚠️ 学生预警列表</h3>
    <WarningCard
      v-for="warn in mockWarnings"
      :key="warn.id"
      :record="warn"
      @view-detail="onViewDetail"
      @handle="onHandle"
    />
  </div>
</template>

<style scoped>
.page { max-width: 900px; margin: 40px auto; padding: 0 16px; }
h2 { margin-bottom: 20px; }
.section-title { margin: 32px 0 16px; font-size: 18px; }

.stats { display: flex; gap: 12px; margin-bottom: 20px; }

.search-box {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  outline: none;
  box-sizing: border-box;
}
.search-box:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px #3b82f620; }

.course-list { list-style: none; padding: 0; margin: 0; }
.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-left: 4px solid;
  border-radius: 8px;
  margin-bottom: 8px;
  background: white;
}
.course-info { display: flex; flex-direction: column; gap: 4px; }
.course-name { font-size: 15px; font-weight: 600; }
.course-meta { font-size: 12px; color: #9ca3af; }
.course-score { font-size: 18px; font-weight: 700; }
.empty { text-align: center; color: #9ca3af; padding: 40px; }
</style>