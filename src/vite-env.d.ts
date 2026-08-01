/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 生产环境后端 API 地址（默认 /api 走同域代理） */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
