/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_PROVIDER?: string;
  readonly VITE_USE_MOCK?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APPSYNC_ENDPOINT?: string;
  readonly VITE_APPSYNC_REALTIME_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
