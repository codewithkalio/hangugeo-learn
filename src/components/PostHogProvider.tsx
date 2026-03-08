import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoContext';
import { posthog } from '@/lib/posthog';
import { capturePageView } from '@/lib/analytics';

function getOrCreateDemoSessionId(): string {
  const key = 'posthog-demo-session-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `demo-${crypto.randomUUID()}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const location = useLocation();

  // Identify / reset on auth and demo changes
  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name,
      });
    } else if (isDemoMode) {
      posthog.identify(getOrCreateDemoSessionId(), { demo: true });
    } else {
      posthog.reset();
    }
  }, [user, isDemoMode]);

  // Track page views on route change
  useEffect(() => {
    capturePageView(location.pathname);
  }, [location.pathname]);

  return <>{children}</>;
}
