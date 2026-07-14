<script setup lang="ts">
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    placeholder="搜索姓名 / 学号 / 班级..."
    class="search-box"
  />
</template>

<style scoped>
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
.search-box:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px #3b82f620;
}
</style>