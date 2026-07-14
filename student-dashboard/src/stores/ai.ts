// src/stores/ai.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage, ChatSession, QuickQuestion, ChartReplyData, TableReplyData } from '@/types/ai'
import { streamChat } from '@/services/ai'
import { buildDataContext } from '@/services/dataContext'

// ---- 预置快捷提问 ----
const quickQuestionsList: QuickQuestion[] = [
  { id: 'q1', label: '查看全院预警情况', question: '帮我查一下全院当前的预警情况，各等级人数和主要分布', icon: '⚠️' },
  { id: 'q2', label: '本月学习投入排名', question: '本月各学院学习投入排名是怎样的？', icon: '📊' },
  { id: 'q3', label: 'GPA低于2.0的学生', question: '帮我查一下软件工程专业GPA低于2.0的学生有哪些？', icon: '🔍' },
  { id: 'q4', label: '图书馆使用率', question: '上个月图书馆使用率最高的三个学院是哪些？', icon: '📚' },
  { id: 'q5', label: '异常趋势分析', question: '根据数据给我分析一下最近有哪些异常趋势？', icon: '📈' },
  { id: 'q6', label: '消费行为分析', question: '最近一个月学生消费行为有什么变化？有没有需要关注的学生？', icon: '💰' },
]

export const useAiStore = defineStore('ai', () => {
  const sessions = ref<ChatSession[]>([])
  const currentSession = ref<ChatSession | null>(null)
  const isStreaming = ref(false)
  const quickQuestions = ref<QuickQuestion[]>(quickQuestionsList)

  // 用于取消前一次流式请求
  let abortController: AbortController | null = null

  // ---- 会话管理 ----
  function createSession(): ChatSession {
    const session: ChatSession = {
      id: `chat-${Date.now()}`,
      title: '新对话',
      messages: [],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    }
    sessions.value.unshift(session)
    currentSession.value = session
    return session
  }

  function ensureSession() {
    if (!currentSession.value) {
      createSession()
    }
  }

  function switchSession(sessionId: string) {
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) currentSession.value = session
  }

  function deleteSession(sessionId: string) {
    sessions.value = sessions.value.filter(s => s.id !== sessionId)
    if (currentSession.value?.id === sessionId) {
      currentSession.value = sessions.value[0] || null
    }
  }

  function searchSessions(keyword: string) {
    return sessions.value.filter(s =>
      s.title.includes(keyword) ||
      s.messages.some(m => m.content.includes(keyword))
    )
  }

  // ---- 真实 AI 流式回复 ----
  async function realStreamReply(userMessage: string) {
    // 取消上一次请求（如果存在）
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()
    const signal = abortController.signal

    isStreaming.value = true

    // 构建对话历史（排除刚加的用户消息，即最后一条）
    const history = currentSession.value!.messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(0, -1)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    // 创建占位的 assistant 消息
    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }
    currentSession.value!.messages.push(assistantMsg)

    await streamChat(history, userMessage, {
      onChunk(text: string) {
        const msgs = currentSession.value!.messages
        const msg = msgs[msgs.length - 1]
        if (msg.role === 'assistant') {
          msg.content += text
        }
      },
      onDone(result: { cleanText: string; chartData?: ChartReplyData; tableData?: TableReplyData }) {
        const msgs = currentSession.value!.messages
        const msg = msgs[msgs.length - 1]
        if (msg.role === 'assistant') {
          msg.content = result.cleanText
          if (result.chartData) msg.chartData = result.chartData
          if (result.tableData) msg.tableData = result.tableData
        }
        currentSession.value!.updateTime = new Date().toISOString()
        isStreaming.value = false
        abortController = null
      },
      onError(error: Error) {
        const msgs = currentSession.value!.messages
        const msg = msgs[msgs.length - 1]
        if (msg.role === 'assistant') {
          msg.content = `抱歉，请求失败：${error.message}`
        }
        currentSession.value!.updateTime = new Date().toISOString()
        isStreaming.value = false
        abortController = null
      },
    }, signal, buildDataContext())
  }

  // ---- 发送消息 ----
  async function sendMessage(content: string): Promise<ChatMessage> {
    ensureSession()
    // 防止并发发送
    if (isStreaming.value) {
      // 取消当前流，让新消息覆盖
      if (abortController) {
        abortController.abort()
        abortController = null
      }
      isStreaming.value = false
    }
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    currentSession.value!.messages.push(userMsg)
    currentSession.value!.updateTime = new Date().toISOString()

    // 用第一条用户消息更新对话标题
    if (currentSession.value!.messages.filter(m => m.role === 'user').length <= 1) {
      currentSession.value!.title = content.length > 20 ? content.slice(0, 20) + '...' : content
    }

    // 触发流式回复（fire-and-forget，不阻塞 UI）
    realStreamReply(content)
    return userMsg
  }

  // ---- 反馈 ----
  function setFeedback(messageId: string, feedback: 'like' | 'dislike') {
    if (!currentSession.value) return
    const msg = currentSession.value.messages.find(m => m.id === messageId)
    if (msg) msg.feedback = feedback
  }

  return {
    sessions,
    currentSession,
    isStreaming,
    quickQuestions,
    createSession,
    ensureSession,
    sendMessage,
    setFeedback,
    switchSession,
    deleteSession,
    searchSessions,
  }
})
