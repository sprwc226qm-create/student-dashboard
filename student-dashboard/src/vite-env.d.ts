/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** DeepSeek API Key — 仅在 Vite 代理层使用，不会暴露到浏览器 */
  readonly VITE_DEEPSEEK_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
