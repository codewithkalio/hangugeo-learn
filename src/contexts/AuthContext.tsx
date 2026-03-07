import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // #region agent log
        fetch('http://127.0.0.1:7790/ingest/9474baa9-f3a8-4c4e-9a88-acca5bb599a0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'643bfc'},body:JSON.stringify({sessionId:'643bfc',runId:'initial',hypothesisId:'H3|H4',location:'src/contexts/AuthContext.tsx:onAuthStateChange',message:'Auth state changed',data:{event,hasSession:Boolean(session),hasAccessToken:Boolean(session?.access_token),path:typeof window!=='undefined'?window.location.pathname:null,search:typeof window!=='undefined'?window.location.search:null,hash:typeof window!=='undefined'?window.location.hash:null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setSession(session);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      // #region agent log
      fetch('http://127.0.0.1:7790/ingest/9474baa9-f3a8-4c4e-9a88-acca5bb599a0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'643bfc'},body:JSON.stringify({sessionId:'643bfc',runId:'initial',hypothesisId:'H3|H4',location:'src/contexts/AuthContext.tsx:getSession',message:'Initial session loaded',data:{hasSession:Boolean(session),hasAccessToken:Boolean(session?.access_token),path:typeof window!=='undefined'?window.location.pathname:null,search:typeof window!=='undefined'?window.location.search:null,hash:typeof window!=='undefined'?window.location.hash:null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
