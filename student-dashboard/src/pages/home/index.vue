<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockStudents, type Student } from '@/mocks/data/students'
import StatCard from '@/components/StatCard.vue'
import SearchBox from '@/components/SearchBox.vue'
import StudentTable from '@/components/StudentTable.vue'

const students = ref<Student[]>(mockStudents)
const searchWord = ref('')

const filteredStudents = computed(() => {
  if (!searchWord.value) return students.value
  const keyword = searchWord.value.toLowerCase()
  return students.value.filter(s =>
    s.name.includes(keyword) ||
    s.studentNo.includes(keyword) ||
    s.class.includes(keyword)
  )
})

const warningCount = computed(() =>
  students.value.filter(s => s.gpa < 2.0).length
)
</script>

<template>
  <div class="page">
    <h2>📊 学生成绩一览</h2>
    <div class="stats">
      <StatCard :value="students.length" label="学生总数" />
      <StatCard :value="warningCount" label="预警人数 (GPA<2.0)" warning />
    </div>
    <SearchBox v-model="searchWord" />
    <StudentTable :students="filteredStudents" />
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-page, 24px);
}
h2 {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.3px;
}
.stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
</style>