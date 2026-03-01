import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoUser } from '@/lib/demoHelpers';
import { pickBoostWords, isSpeechAvailable } from '@/lib/boostHelpers';
import ListenChoose from '@/components/boost/ListenChoose';
import MatchPairs from '@/components/boost/MatchPairs';
import TypeItOut from '@/components/boost/TypeItOut';
import BoostSummary from '@/components/boost/BoostSummary';

type Phase = 'listen-choose' | 'match-pairs' | 'type-it' | 'summary';

interface RoundResult {
  round: string;
  correct: number;
  total: number;
}

export default function WordBoost() {
  const { data } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isDemo = isDemoUser(user);

  const sessionResults = (location.state as any)?.sessionResults as
    | { cardId: string; confidence: number }[]
    | undefined;

  const { weakWords, allWords } = useMemo(
    () => pickBoostWords(data.flashcards, sessionResults, isDemo),
    [data.flashcards, sessionResults, isDemo],
  );

  const hasAudio = isSpeechAvailable();
  const initialPhase: Phase = hasAudio ? 'listen-choose' : 'match-pairs';

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  const currentRoundNumber =
    phase === 'listen-choose' ? 1
    : phase === 'match-pairs' ? (hasAudio ? 2 : 1)
    : phase === 'type-it' ? (hasAudio ? 3 : 2)
    : 0;

  const advancePhase = (result: RoundResult) => {
    const updated = [...roundResults, result];
    setRoundResults(updated);

    const nextMap: Record<Phase, Phase> = {
      'listen-choose': 'match-pairs',
      'match-pairs': 'type-it',
      'type-it': 'summary',
      'summary': 'summary',
    };
    setPhase(nextMap[phase]);
  };

  if (weakWords.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-12">
        <PartyPopper className="h-10 w-10 text-[#F0B429] mx-auto" />
        <h1 className="text-xl font-display font-bold">No weak words!</h1>
        <p className="text-sm text-muted-foreground">You're doing great. Keep drilling to maintain your streak.</p>
        <button onClick={() => navigate('/')} className="soft-btn bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-display font-bold">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {phase !== 'summary' && (
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="soft-btn p-2 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-display font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#F0B429]" /> Word Boost</h1>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {phase === 'listen-choose' && (
            <ListenChoose
              roundNumber={currentRoundNumber}
              words={weakWords}
              allPool={allWords}
              onComplete={r => advancePhase({
                round: 'Listen & Choose',
                correct: r.filter(x => x.correct).length,
                total: r.length,
              })}
            />
          )}

          {phase === 'match-pairs' && (
            <MatchPairs
              roundNumber={currentRoundNumber}
              words={allWords}
              onComplete={(matched, total) => advancePhase({
                round: 'Match Pairs',
                correct: matched,
                total,
              })}
            />
          )}

          {phase === 'type-it' && (
            <TypeItOut
              roundNumber={currentRoundNumber}
              words={weakWords}
              onComplete={r => advancePhase({
                round: 'Type It Out',
                correct: r.filter(x => x.correct).length,
                total: r.length,
              })}
            />
          )}

          {phase === 'summary' && <BoostSummary rounds={roundResults} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
