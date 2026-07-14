<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useAiStore } from '@/stores/ai'
import BaseChart from '@/components/charts/BaseChart.vue'

const store = useAiStore()
const inputText = ref('')
const chatContainer = ref<HTMLDivElement>()
const showSidebar = ref(false)

// 使用 computed 确保响应式！
const displayMessages = computed(() => store.currentSession?.messages || [])
const sessionList = computed(() => store.sessions)

// ---- 自动滚动到底部 ----
async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

watch(() => store.currentSession?.messages.length, () => {
  scrollToBottom()
})

// 监听流式内容
watch(() => {
  const msgs = store.currentSession?.messages
  if (!msgs?.length) return ''
  const last = msgs[msgs.length - 1]
  return last.role === 'assistant' ? last.content : ''
}, () => {
  nextTick(() => scrollToBottom())
})

// ---- 发送消息 ----
function handleSend() {
  const text = inputText.value.trim()
  if (!text || store.isStreaming) return
  inputText.value = ''
  store.sendMessage(text)
  scrollToBottom()
}

// ---- F5.4: 快捷提问 ----
function handleQuickQuestion(question: string) {
  if (store.isStreaming) return
  store.sendMessage(question)
  scrollToBottom()
}

// ---- F5.9: 反馈 ----
function handleFeedback(msgId: string, type: 'like' | 'dislike') {
  store.setFeedback(msgId, type)
}

// ---- 安全渲染：HTML 转义 ----
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderContent(content: string): string {
  return escapeHtml(content).replace(/\n/g, '<br>')
}

// ---- 错误检测与重试 ----
const lastMessageIsError = computed(() => {
  const msgs = store.currentSession?.messages
  if (!msgs?.length) return false
  const last = msgs[msgs.length - 1]
  return last.role === 'assistant' && last.content.startsWith('抱歉，请求失败')
})

function handleRetry() {
  if (store.isStreaming) return
  const msgs = store.currentSession?.messages
  if (!msgs?.length) return
  // 找到失败 assistant 消息之前的最后一条 user 消息
  const lastAssistantIdx = msgs.length - 1
  const userMsg = msgs.slice(0, lastAssistantIdx).reverse().find(m => m.role === 'user')
  if (userMsg) {
    // 移除失败的 AI 回复
    msgs.pop()
    store.sendMessage(userMsg.content)
  }
}

// ---- 键盘事件 ----
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

onMounted(() => {
  store.ensureSession()
})
</script>

<template>
  <div class="ai-chat">
    <!-- F5.8: 历史对话侧栏 -->
    <div class="chat-sidebar" v-show="showSidebar">
      <div class="sidebar-header">
        <h4>💬 对话历史</h4>
        <el-button size="small" link @click="showSidebar = false">✕</el-button>
      </div>
      <el-button
        type="primary"
        size="small"
        style="width: 100%; margin-bottom: 12px"
        @click="store.createSession()"
      >
        + 新对话
      </el-button>
      <div class="session-list">
        <div
          v-for="session in sessionList"
          :key="session.id"
          class="session-item"
          :class="{ active: store.currentSession?.id === session.id }"
          @click="store.switchSession(session.id)"
        >
          <span class="session-title">{{ session.title }}</span>
          <span class="session-time">{{ new Date(session.updateTime).toLocaleDateString() }}</span>
          <el-button
            size="small"
            link
            type="danger"
            @click.stop="store.deleteSession(session.id)"
          >
            🗑️
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主聊天区 -->
    <div class="chat-main">
      <!-- F5.1: 聊天头部 -->
      <div class="chat-header">
        <el-button size="small" @click="showSidebar = !showSidebar">
          ☰ 历史
        </el-button>
        <span class="chat-title">{{ store.currentSession?.title || 'AI 智能问答' }}</span>
        <span class="chat-badge">AI</span>
      </div>

      <!-- F5.1: 消息列表 -->
      <div ref="chatContainer" class="chat-messages">
        <!-- 欢迎界面 -->
        <div v-if="displayMessages.length === 0" class="welcome">
          <div class="welcome-icon">🤖</div>
          <h3>你好！我是学业分析助手</h3>
          <p>可以向我查询学生数据、分析学业趋势、获取预警信息等</p>
          <!-- F5.10: 数据脱敏提示 -->
          <div class="sensitive-notice">
            🔒 涉及敏感学生数据时，系统会自动进行脱敏处理
          </div>
        </div>

        <!-- 消息列表 -->
        <div
          v-for="msg in displayMessages"
          :key="msg.id"
          class="chat-message"
          :class="msg.role"
        >
          <div class="message-avatar">
            {{ msg.role === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="message-body">
            <div class="message-content" v-html="renderContent(msg.content)" />

            <!-- F5.5-F5.6: 图表内嵌 -->
            <div v-if="msg.chartData" class="message-chart">
              <div class="chart-title">{{ msg.chartData.title }}</div>
              <BaseChart :option="msg.chartData.option" height="250px" />
            </div>

            <!-- 表格内嵌 -->
            <div v-if="msg.tableData" class="message-table">
              <div class="table-title">{{ msg.tableData.title }}</div>
              <el-table :data="msg.tableData.rows" border stripe size="small" max-height="240">
                <el-table-column
                  v-for="col in msg.tableData.columns"
                  :key="col.prop"
                  :prop="col.prop"
                  :label="col.label"
                />
              </el-table>
            </div>

            <!-- F5.10: 数据脱敏提示 -->
            <div v-if="msg.sensitive" class="sensitive-tag">
              🔒 以上数据已部分脱敏，完整数据请联系管理员
            </div>

            <!-- F5.9: 反馈按钮 -->
            <div v-if="msg.role === 'assistant' && !msg.content.startsWith('抱歉，请求失败')" class="message-feedback">
              <el-button
                size="small"
                link
                :type="msg.feedback === 'like' ? 'primary' : 'default'"
                @click="handleFeedback(msg.id, 'like')"
              >
                👍
              </el-button>
              <el-button
                size="small"
                link
                :type="msg.feedback === 'dislike' ? 'danger' : 'default'"
                @click="handleFeedback(msg.id, 'dislike')"
              >
                👎
              </el-button>
            </div>

            <!-- 错误重试按钮 -->
            <div v-if="msg.role === 'assistant' && msg.content.startsWith('抱歉，请求失败')" class="retry-action">
              <el-button
                size="small"
                type="warning"
                :disabled="store.isStreaming"
                @click="handleRetry()"
              >
                🔄 重新发送
              </el-button>
            </div>

            <div class="message-time">{{ new Date(msg.timestamp).toLocaleTimeString() }}</div>
          </div>
        </div>

        <!-- F5.2: 流式输出指示器 -->
        <div v-if="store.isStreaming" class="typing-indicator">
          <span class="typing-dot" />
          <span class="typing-dot" />
          <span class="typing-dot" />
        </div>
      </div>

      <!-- F5.1 & F5.4: 输入区 + 快捷提问 -->
      <div class="chat-input-area">
        <!-- 快捷提问 -->
        <div class="quick-questions">
          <el-button
            v-for="q in store.quickQuestions"
            :key="q.id"
            size="small"
            :disabled="store.isStreaming"
            @click="handleQuickQuestion(q.question)"
          >
            {{ q.icon }} {{ q.label }}
          </el-button>
        </div>

        <div class="input-row">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            placeholder="输入你的问题，如：帮我查一下全院预警情况..."
            :disabled="store.isStreaming"
            @keydown="handleKeydown"
            resize="none"
          />
          <el-button
            type="primary"
            :disabled="!inputText.trim() || store.isStreaming"
            @click="handleSend"
            size="large"
          >
            📤 发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-chat {
  display: flex;
  height: calc(100vh - 0px);
  overflow: hidden;
}

/* ---- 侧栏 ---- */
.chat-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #f8fafc;
  border-right: 1px solid var(--color-border, #e2e8f0);
  padding: 16px;
  overflow-y: auto;
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.sidebar-header h4 { margin: 0; font-size: 14px; font-weight: 600; color: var(--color-text); }

.session-list { display: flex; flex-direction: column; gap: 4px; }
.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-md, 10px);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 13px;
}
.session-item:hover { background: #e2e8f0; }
.session-item.active {
  background: var(--color-primary-bg, rgba(99,102,241,0.08));
  color: var(--color-primary, #6366f1);
  font-weight: 500;
}
.session-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.session-time { font-size: 11px; color: #9ca3af; flex-shrink: 0; }

/* ---- 主聊天区 ---- */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-surface, #fff);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
}
.chat-title { font-size: 15px; font-weight: 600; flex: 1; color: var(--color-text); }
.chat-badge {
  padding: 3px 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* ---- 消息区 ---- */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

/* 欢迎界面 */
.welcome {
  text-align: center;
  padding: 80px 20px;
}
.welcome-icon {
  font-size: 64px;
  margin-bottom: 20px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.welcome h3 { margin: 0 0 10px; color: var(--color-text); font-size: 20px; font-weight: 700; }
.welcome p { margin: 0 0 20px; font-size: 14px; color: var(--color-text-secondary); }
.sensitive-notice {
  display: inline-block;
  padding: 10px 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md, 10px);
  font-size: 12px;
  color: #dc2626;
}

/* 消息气泡 */
.chat-message {
  display: flex;
  gap: 10px;
  margin-bottom: 22px;
  animation: fadeInUp 0.35s ease;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-message.user { flex-direction: row-reverse; }
.chat-message.user .message-body { align-items: flex-end; }
.chat-message.user .message-content {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.25);
}

.chat-message.assistant .message-content {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-left: 3px solid #6366f1;
  border-radius: 18px 18px 18px 4px;
  box-shadow: var(--shadow-xs);
}

.message-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: #fff;
  border: 2px solid var(--color-border, #e2e8f0);
  box-shadow: var(--shadow-xs);
  flex-shrink: 0;
}
.chat-message.user .message-avatar {
  border-color: #c7d2fe;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
}

.message-body {
  display: flex;
  flex-direction: column;
  max-width: 72%;
}

.message-content {
  padding: 12px 18px;
  font-size: 14px;
  line-height: 1.75;
}

.message-chart, .message-table {
  margin-top: 8px;
  padding: 14px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-md, 10px);
  max-width: 520px;
  box-shadow: var(--shadow-xs);
}
.chart-title, .table-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text);
}

.sensitive-tag {
  margin-top: 6px;
  font-size: 11px;
  color: #dc2626;
  padding: 5px 10px;
  background: #fef2f2;
  border-radius: 6px;
  display: inline-block;
  font-weight: 500;
}

.message-feedback {
  display: flex;
  gap: 2px;
  margin-top: 6px;
}
.message-feedback .el-button {
  opacity: 0.5;
  transition: opacity 0.15s;
}
.message-feedback .el-button:hover { opacity: 1; }

.retry-action { margin-top: 8px; }

.message-time {
  font-size: 11px;
  color: var(--color-text-muted, #94a3b8);
  margin-top: 4px;
  padding: 0 4px;
}

/* ---- 打字机指示器 ---- */
.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 10px 18px;
}
.typing-dot {
  width: 7px;
  height: 7px;
  background: #818cf8;
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out;
}
.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; background: #a5b4fc; }
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-7px); }
}

/* ---- 输入区 ---- */
.chat-input-area {
  padding: 14px 20px;
  border-top: 1px solid var(--color-border, #e2e8f0);
  background: var(--color-surface, #fff);
  box-shadow: 0 -2px 10px rgba(0,0,0,0.04);
}

.quick-questions {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.quick-questions .el-button {
  border-radius: 20px !important;
  font-size: 12px;
  padding: 4px 14px;
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.input-row .el-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  resize: none;
  font-size: 14px;
}
.input-row .el-button {
  flex-shrink: 0;
  border-radius: 12px;
  padding: 0 24px;
  height: 44px;
  font-weight: 600;
}
</style>
