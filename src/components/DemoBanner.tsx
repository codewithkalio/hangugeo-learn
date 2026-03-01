import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoUser, resetDemo } from '@/lib/demoHelpers';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RotateCcw, UserPlus, Loader2, Glasses } from 'lucide-react';
import { motion } from 'framer-motion';

export function DemoBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [resetting, setResetting] = useState(false);

  if (!isDemoUser(user)) return null;

  const handleReset = async () => {
    if (!user) return;
    setResetting(true);
    try {
      await resetDemo(user.id);
      queryClient.invalidateQueries({ queryKey: ['flashcards', user.id] });
      queryClient.invalidateQueries({ queryKey: ['drillResults', user.id] });
      queryClient.invalidateQueries({ queryKey: ['categories', user.id] });
    } finally {
      setResetting(false);
    }
  };

  const handleSignUp = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col md:flex-row flex-wrap items-center justify-center md:justify-between gap-2 rounded-xl bg-[#D05657]/10 border border-[#D05657]/25 px-4 py-2.5 mb-4"
    >
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D05657]">
        <Glasses className="h-4 w-4" />
        You're exploring demo mode
      </span>

      <div className="flex items-center justify-center md:justify-end gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" disabled={resetting}>
              {resetting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all your drill results and flashcard changes, then reload the original 50 demo words.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button variant="default" size="sm" className="h-7 text-xs gap-1" onClick={handleSignUp}>
          <UserPlus className="h-3 w-3" />
          Sign Up
        </Button>
      </div>
    </motion.div>
  );
}
