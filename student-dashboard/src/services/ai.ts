// src/services/ai.ts — DeepSeek API 服务层
import type { ChartReplyData, TableReplyData } from '@/types/ai'

// ---- 系统提示词 ----
const SYSTEM_PROMPT = `你是服务于高校学生管理的"学业分析助手"。你可以查询和分析学生行为数据，包括：成绩、考勤、图书馆使用、消费记录、预警信息等。

回复要求：
- 使用中文回复，语言简洁专业，数据驱动
- 涉及学生个人隐私数据时，必须进行脱敏处理（学号部分打码、姓名打码）
- 如果无法回答的问题，诚实告知并建议联系相关部门
- 回复结构清晰，善用分段和列表

当需要展示结构化数据时，可以使用以下标记格式（非必须，仅在数据适合可视化时使用）：

图表标记：
---chart
{"type": "bar|line|pie|radar", "title": "图表标题", "option": {完整 ECharts 配置对象}}
---endchart

表格标记：
---table
{"title": "表格标题", "columns": [{"label": "列名", "prop": "字段名"}], "rows": [{"字段名": "值"}]}
---endtable

注意：
- chart 的 option 必须是合法的 ECharts 配置，至少包含 xAxis/yAxis/series
- table 的 prop 请使用英文驼峰命名
- 不要过度使用图表/表格，仅在数据确实适合可视化时使用
- 标记块独立成段，不要和其他文字混在同一行`

// ---- 内部类型 ----
interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onChunk: (text: string) => void
  onDone: (result: { cleanText: string; chartData?: ChartReplyData; tableData?: TableReplyData }) => void
  onError: (error: Error) => void
}

// ---- 构建消息列表 ----
function buildMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
  dataContext?: string,
): DeepSeekMessage[] {
  // 系统提示词 + 数据上下文合并
  const systemContent = dataContext
    ? `${SYSTEM_PROMPT}\n\n---\n\n以下是当前系统内的真实数据，请基于这些数据回答用户问题。如果数据中找不到相关信息，诚实告知。\n\n${dataContext}`
    : SYSTEM_PROMPT

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemContent },
  ]
  // 取最近 20 条历史消息以控制 token 用量
  const recentHistory = conversationHistory.slice(-20)
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content })
  }
  messages.push({ role: 'user', content: userMessage })
  return messages
}

// ---- 解析图表/表格标记 ----
function parseMarkers(fullText: string): {
  cleanText: string
  chartData?: ChartReplyData
  tableData?: TableReplyData
} {
  let cleanText = fullText
  let chartData: ChartReplyData | undefined
  let tableData: TableReplyData | undefined

  // 解析图表块
  const chartMatch = cleanText.match(/---chart\s*\n([\s\S]*?)\n\s*---endchart/)
  if (chartMatch) {
    try {
      const parsed = JSON.parse(chartMatch[1])
      if (parsed.type && parsed.title && parsed.option) {
        chartData = parsed as ChartReplyData
      }
      cleanText = cleanText.replace(chartMatch[0], '')
    } catch {
      // JSON 解析失败，忽略，保留原文
    }
  }

  // 解析表格块
  const tableMatch = cleanText.match(/---table\s*\n([\s\S]*?)\n\s*---endtable/)
  if (tableMatch) {
    try {
      const parsed = JSON.parse(tableMatch[1])
      if (parsed.title && parsed.columns && parsed.rows) {
        tableData = parsed as TableReplyData
      }
      cleanText = cleanText.replace(tableMatch[0], '')
    } catch {
      // JSON 解析失败，忽略，保留原文
    }
  }

  // 清理多余空行
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim()

  return { cleanText, chartData, tableData }
}

// ---- 核心：流式聊天 ----
export async function streamChat(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
  dataContext?: string,
): Promise<void> {
  const messages = buildMessages(conversationHistory, userMessage, dataContext)

  // 检查是否已被取消
  if (signal?.aborted) return

  let response: Response
  try {
    response = await fetch('/api/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    callbacks.onError(new Error(`网络请求失败，请检查网络连接：${err instanceof Error ? err.message : String(err)}`))
    return
  }

  if (!response.ok) {
    let errorBody = ''
    try {
      errorBody = await response.text()
    } catch {
      // ignore
    }
    let errorMsg = `API 请求失败 (${response.status})`
    if (response.status === 401) {
      errorMsg = 'API Key 无效或未配置，请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY'
    } else if (response.status === 403) {
      errorMsg = 'API 访问被拒绝，请检查账户余额或权限'
    } else if (response.status === 429) {
      errorMsg = 'API 请求频率过高，请稍后重试'
    } else if (response.status >= 500) {
      errorMsg = 'DeepSeek 服务暂时不可用，请稍后重试'
    }
    if (errorBody) {
      try {
        const errJson = JSON.parse(errorBody)
        if (errJson.error?.message) {
          errorMsg += `：${errJson.error.message}`
        }
      } catch {
        errorMsg += `：${errorBody.slice(0, 200)}`
      }
    }
    callbacks.onError(new Error(errorMsg))
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    callbacks.onError(new Error('响应体不可读'))
    return
  }

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''
  let consecutiveParseFailures = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 按双换行（SSE 消息边界）分割
      const parts = buffer.split('\n\n')
      // 最后一段可能不完整，留在 buffer
      buffer = parts.pop() || ''

      for (const part of parts) {
        if (!part.trim()) continue

        // 从消息块中提取 data: 行
        const lines = part.split('\n')
        let dataContent = ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data:')) {
            dataContent += trimmed.slice(5).trim()
          }
        }

        if (!dataContent) continue

        // 大小写不敏感 + 去除空白后判断 [DONE]
        if (dataContent.trim().toUpperCase() === '[DONE]') continue

        try {
          const parsed = JSON.parse(dataContent)
          const choice = parsed.choices?.[0]

          // 检查 finish_reason —— 如果是 length 说明被截断
          if (choice?.finish_reason === 'length') {
            fullText += '\n\n⚠️ 回复因长度限制被截断，请尝试更具体的问题。'
          }

          const content = choice?.delta?.content
          if (content) {
            fullText += content
            callbacks.onChunk(content)
          }
          consecutiveParseFailures = 0
        } catch {
          consecutiveParseFailures++
          if (consecutiveParseFailures >= 5) {
            throw new Error('SSE 数据连续解析失败，已中止')
          }
        }
      }
    }

    // 流结束后 flush decoder 残留字节
    if (buffer) {
      buffer += decoder.decode(new Uint8Array(), { stream: false })
      // 尝试从残留 buffer 中提取最后的数据
      if (buffer.trim() && buffer.includes('data:')) {
        const dataContent = buffer.replace(/^data:\s*/gm, '').trim()
        if (dataContent && dataContent.toUpperCase() !== '[DONE]') {
          try {
            const parsed = JSON.parse(dataContent)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              fullText += content
              callbacks.onChunk(content)
            }
          } catch {
            // 残留无法解析，忽略
          }
        }
      }
    }

    // 解析图表/表格标记
    const { cleanText, chartData, tableData } = parseMarkers(fullText)
    callbacks.onDone({
      cleanText,
      chartData,
      tableData,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    callbacks.onError(new Error(`流式读取中断：${err instanceof Error ? err.message : String(err)}`))
  } finally {
    reader.releaseLock()
  }
}
