/// <reference types="vite/client" />

interface Window {
  electron: {
    startDpi: (profile: string) => Promise<{success: boolean, message?: string}>;
    stopDpi: () => Promise<{success: boolean, message?: string}>;
    minimize: () => void;
    close: () => void;
    onLog: (callback: (log: string) => void) => void;
    onStatusChange: (callback: (status: string) => void) => void;
  }
}
