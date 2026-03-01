import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle2, User, Lock, Sparkles, Wrench, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { seedDemoCards } from '@/lib/demoHelpers';

const isProduction = window.location.hostname === 'hangugeo-learn.lovable.app';

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);

    if (isProduction) {
      // Production: magic link only
      const otpOptions: Parameters<typeof supabase.auth.signInWithOtp>[0] = {
        email,
        options: {
          emailRedirectTo: window.location.origin,
          ...(isSignUp && name ? { data: { full_name: name } } : {}),
        },
      };

      const { error } = await supabase.auth.signInWithOtp(otpOptions);
      setSending(false);
      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } else {
      // Dev: email/password
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }
      setSending(false);
      if (result.error) {
        setError(result.error.message);
      }
      // On success, AuthContext picks up the session automatically
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setName('');
    setPassword('');
    setError('');
  };

  const handleTryDemo = async () => {
    setError('');
    setDemoLoading(true);
    try {
      const { data, error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) throw anonErr;
      if (data.user) {
        await seedDemoCards(data.user.id);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message ?? 'Failed to start demo');
      setDemoLoading(false);
    }
  };

  const isDisabled = sending || demoLoading || !email || (isSignUp && !name) || (!isProduction && !password);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <span className="text-5xl">🇰🇷</span>
          <h1 className="text-2xl font-display font-bold text-foreground mt-3">한국어 Learn</h1>
          <p className="text-sm text-muted-foreground mt-1">Korean Learning</p>
        </div>

        <Card className="soft-card border-0">
          <CardContent className="pt-6">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-foreground">Check your inbox!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  We sent a magic link to <strong className="text-foreground">{email}</strong>
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 text-sm"
                  onClick={() => { setSent(false); setName(''); setEmail(''); setPassword(''); setIsSignUp(false); }}
                >
                  Use a different email
                </Button>
              </motion.div>
            ) : (
              <>
                {!isProduction && (
                  <p className="text-xs text-muted-foreground text-center mb-4 bg-muted/50 rounded px-2 py-1">
                    <span className="inline-flex items-center gap-1"><Wrench className="h-3.5 w-3.5" /> Dev mode — using email/password</span>
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {isSignUp && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <label className="text-sm font-medium text-foreground" htmlFor="name">
                          Your name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10"
                            required={isSignUp}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="email">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {!isProduction && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground" htmlFor="password">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" className="w-full soft-btn" disabled={isDisabled}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSignUp ? (
                      <span className="inline-flex items-center gap-1.5">Create Account <Sparkles className="h-4 w-4 text-[#F0B429]" /></span>
                    ) : isProduction ? (
                      <span className="inline-flex items-center gap-1.5">Send Magic Link <Sparkles className="h-4 w-4 text-[#F0B429]" /></span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">Sign In <Sparkles className="h-4 w-4 text-[#F0B429]" /></span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  {isSignUp ? (
                    <>Already have an account?{' '}
                      <button type="button" onClick={toggleMode} className="text-primary font-medium hover:underline">
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>Don't have an account?{' '}
                      <button type="button" onClick={toggleMode} className="text-primary font-medium hover:underline">
                        Sign up
                      </button>
                    </>
                  )}
                </p>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleTryDemo}
                  disabled={demoLoading || sending}
                >
                  {demoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Play className="h-4 w-4 text-accent" />
                      Try Demo — No Sign Up Needed
                    </span>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
