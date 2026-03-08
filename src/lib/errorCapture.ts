import { captureException } from '@/lib/analytics';

export function attachGlobalErrorListeners() {
  window.onerror = (message, source, lineno, colno, error) => {
    captureException('window.onerror', error ?? message, {
      sourceUrl: source,
      lineno,
      colno,
    });
  };

  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    captureException('window.onunhandledrejection', event.reason);
  };
}
