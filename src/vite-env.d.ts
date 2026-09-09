/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Minimal typing for the Google Identity Services script. */
interface Window {
  google?: {
    accounts: {
      id: {
        initialize(config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
        }): void;
        renderButton(
          parent: HTMLElement,
          options: Record<string, unknown>
        ): void;
        prompt(): void;
        cancel(): void;
      };
    };
  };
}
