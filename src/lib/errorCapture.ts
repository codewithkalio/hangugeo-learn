import { posthog } from '@/lib/posthog';

export function attachGlobalErrorListeners() {
  window.onerror = (message, source, lineno, colno, error) => {
    posthog.capture('$exception', {
      $exception_message: String(message),
      $exception_source: source,
      $exception_lineno: lineno,
      $exception_colno: colno,
      $exception_stack: error?.stack,
      $exception_type: error?.name || 'Error',
    });
  };

  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const error = event.reason;
    posthog.capture('$exception', {
      $exception_message: error?.message || String(error),
      $exception_stack: error?.stack,
      $exception_type: error?.name || 'UnhandledPromiseRejection',
    });
  };
}
