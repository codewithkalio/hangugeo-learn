// Supabase client: URL and anon key must be set via env (see .env.example).
// Do not commit real values; use VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Supabase env: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env (see .env.example).'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

if (typeof window !== 'undefined') {
  // #region agent log
  fetch('http://127.0.0.1:7790/ingest/9474baa9-f3a8-4c4e-9a88-acca5bb599a0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'643bfc'},body:JSON.stringify({sessionId:'643bfc',runId:'initial',hypothesisId:'H1|H4',location:'src/integrations/supabase/client.ts:clientInit',message:'Supabase client initialized',data:{supabaseHost:new URL(SUPABASE_URL).host,origin:window.location.origin,hostname:window.location.hostname,hasPublishableKey:Boolean(SUPABASE_PUBLISHABLE_KEY)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}