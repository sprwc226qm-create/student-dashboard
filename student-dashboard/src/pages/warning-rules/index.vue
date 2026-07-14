<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

// 表单数据类型
interface RuleForm {
  name: string
  metric: string
  operator: 'lt' | 'gt' | 'lte' | 'gte' | 'eq'
  threshold: number
  level: 'high' | 'medium' | 'low'
  period: number
  enabled: boolean
  description: string
}

// 表单绑定数据
const form = reactive<RuleForm>({
  name: '',
  metric: '',
  operator: 'lt',
  threshold: 0,
  level: 'medium',
  period: 14,
  enabled: true,
  description: '',
})

// 表单校验规则
const rules: FormRules<RuleForm> = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  metric: [{ required: true, message: '请选择监控指标', trigger: 'change' }],
  threshold: [
    { required: true, message: '请输入阈值', trigger: 'blur' },
    { type: 'number', min: 0, message: '阈值必须大于0', trigger: 'blur' },
  ],
}

// 初始模拟数据
const rulesList = ref<(RuleForm & { id: string; createTime: string })[]>([
  {
    id: '1',
    name: '图书馆打卡不足',
    metric: 'libraryVisits',
    operator: 'lt',
    threshold: 2,
    level: 'medium',
    period: 14,
    enabled: true,
    description: '近14天图书馆打卡次数<2触发中等风险',
    createTime: '2026-06-15 10:00',
  },
  {
    id: '2',
    name: 'GPA低于警戒线',
    metric: 'gpa',
    operator: 'lt',
    threshold: 2.0,
    level: 'high',
    period: 180,
    enabled: true,
    description: '最近学期GPA<2.0触发高风险',
    createTime: '2026-06-15 10:30',
  },
])

// 指标选项
const metricOptions = [
  { label: '图书馆打卡次数', value: 'libraryVisits' },
  { label: 'GPA', value: 'gpa' },
  { label: '出勤率', value: 'attendance' },
  { label: '作业提交率', value: 'homeworkRate' },
  { label: '月消费金额', value: 'monthlyConsumption' },
]

const dialogVisible = ref(false)

// 打开弹窗
function openDialog() {
  formRef.value?.resetFields()
  // 重置表单数据（避免残留）
  Object.assign(form, {
    name: '',
    metric: '',
    operator: 'lt',
    threshold: 0,
    level: 'medium',
    period: 14,
    enabled: true,
    description: '',
  })
  dialogVisible.value = true
}

// 提交表单
async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      rulesList.value.push({
        ...form,
        id: Date.now().toString(),
        createTime: new Date().toLocaleString(),
      })
      dialogVisible.value = false
      ElMessage.success('规则创建成功！')
    }
  })
}

// 删除规则（带确认框）
async function deleteRule(id: string) {
  await ElMessageBox.confirm('确定删除该规则？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  rulesList.value = rulesList.value.filter((r) => r.id !== id)
  ElMessage.success('删除成功')
}

// 切换启用/禁用
function toggleRule(id: string) {
  const rule = rulesList.value.find((r) => r.id === id)
  if (rule) {
    rule.enabled = !rule.enabled
    ElMessage.info(rule.enabled ? '规则已启用' : '规则已禁用')
  }
}
</script>

<template>
  <div class="warning-rules-page">
    <div class="page-header">
      <h2>⚙️ 预警规则配置</h2>
      <el-button type="primary" @click="openDialog">+ 新建规则</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="rulesList" border stripe style="width: 100%">
      <el-table-column prop="name" label="规则名称" width="180" />
      <el-table-column label="监控指标" width="140">
        <template #default="{ row }">
          {{ metricOptions.find((m) => m.value === row.metric)?.label }}
        </template>
      </el-table-column>
      <el-table-column label="条件" width="160">
        <template #default="{ row }">
          {{ row.metric }}
          {{
            row.operator === 'lt' ? '<' : row.operator === 'gt' ? '>' : row.operator
          }}
          {{ row.threshold }}
        </template>
      </el-table-column>
      <el-table-column prop="level" label="风险等级" width="100">
        <template #default="{ row }">
          <el-tag
            :type="row.level === 'high' ? 'danger' : row.level === 'medium' ? 'warning' : 'info'"
            size="small"
          >
            {{ row.level === 'high' ? '高风险' : row.level === 'medium' ? '中风险' : '低风险' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="enabled" label="状态" width="80">
        <template #default="{ row }">
          <el-switch :model-value="row.enabled" size="small" @change="toggleRule(row.id)" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" size="small" link @click="deleteRule(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建弹窗 -->
    <el-dialog v-model="dialogVisible" title="新建预警规则" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="form.name" placeholder="如：图书馆打卡不足" />
        </el-form-item>
        <el-form-item label="监控指标" prop="metric">
          <el-select v-model="form.metric" placeholder="选择指标" class="full-width">
            <el-option
              v-for="m in metricOptions"
              :key="m.value"
              :label="m.label"
              :value="m.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="条件">
          <div class="condition-row">
            <el-select v-model="form.operator" class="operator-select">
              <el-option label="小于" value="lt" />
              <el-option label="大于" value="gt" />
              <el-option label="小于等于" value="lte" />
              <el-option label="大于等于" value="gte" />
              <el-option label="等于" value="eq" />
            </el-select>
            <el-input-number v-model="form.threshold" :min="0" class="threshold-input" />
          </div>
        </el-form-item>
        <el-form-item label="风险等级" prop="level">
          <el-radio-group v-model="form.level">
            <el-radio value="high">高风险</el-radio>
            <el-radio value="medium">中风险</el-radio>
            <el-radio value="low">低风险</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="统计周期(天)">
          <el-input-number v-model="form.period" :min="1" :max="365" />
        </el-form-item>
        <el-form-item label="规则描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.warning-rules-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-page, 24px);
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.3px;
}
.condition-row {
  display: flex;
  gap: 8px;
}
.operator-select {
  width: 100px;
}
.threshold-input {
  flex: 1;
}
.full-width {
  width: 100%;
}
</style>