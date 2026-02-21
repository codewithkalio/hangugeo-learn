import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { pickSessionQuestions, SessionQuestion } from '@/lib/conjugationHelpers';
import { ConjugationQuestion } from '@/lib/types';
import QuestionCard from '@/components/conjugation/QuestionCard';
import ConjugationSummary from '@/components/conjugation/ConjugationSummary';

type Phase = 'intro' | 'drill' | 'summary';

export default function ConjugationPractice() {
  const { data, addConjugationResult } = useApp();
  const navigate = useNavigate();

  const enabledPatterns = data.grammarPatterns.filter(p => p.enabled);
  const verbs = data.flashcards.filter(f => f.category?.toLowerCase() === 'verb');
  const nouns = data.flashcards.filter(f => f.category?.toLowerCase() === 'noun');

  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<ConjugationQuestion[]>([]);

  const canStart = enabledPatterns.length > 0 && verbs.length >= 1 && nouns.length >= 1;

  const startSession = useCallback(() => {
    const qs = pickSessionQuestions(enabledPatterns, data.flashcards, 5);
    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrentIdx(0);
    setResults([]);
    setPhase('drill');
  }, [enabledPatterns, data.flashcards]);

  const handleResult = useCallback((result: { patternKey: string; firstAttempt: boolean | null; secondAttempt: boolean | null }) => {
    const q = questions[currentIdx];
    const cq: ConjugationQuestion = {
      patternKey: result.patternKey,
      baseSentence: q.baseSentence,
      englishPrompt: q.englishPrompt,
      correctTiles: q.correctTiles,
      resultFirstAttempt: result.firstAttempt,
      resultSecondAttempt: result.secondAttempt,
    };

    const newResults = [...results, cq];
    setResults(newResults);

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Session complete — save results
        const correctFirst = newResults.filter(r => r.resultFirstAttempt === true).length;
        const correctSecond = newResults.filter(r => r.resultSecondAttempt === true).length;
        const incorrect = newResults.filter(r => r.resultFirstAttempt === false && r.resultSecondAttempt === false).length;

        addConjugationResult({
          totalQuestions: newResults.length,
          correctFirst,
          correctSecond,
          incorrect,
          questions: newResults,
        });

        setPhase('summary');
      }
    }, 1500);
  }, [questions, currentIdx, results, addConjugationResult]);

  // Not enough data
  if (!canStart && phase === 'intro') {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-12">
        <p className="text-4xl">📚</p>
        <h1 className="text-xl font-display font-bold">Not ready yet</h1>
        <p className="text-sm text-muted-foreground">
          You need at least 1 verb and 1 noun in your flashcard bank, plus at least one grammar pattern enabled in Settings.
        </p>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Verbs: {verbs.length} · Nouns: {nouns.length} · Patterns: {enabledPatterns.length}
          </p>
        </div>
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
          <h1 className="text-lg font-display font-bold">🔤 Conjugation Practice</h1>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6 text-center py-8"
          >
            <p className="text-5xl">🔤</p>
            <h2 className="text-xl font-display font-bold">Ready to conjugate?</h2>
            <p className="text-sm text-muted-foreground">
              Transform sentences into different grammar patterns by tapping morpheme tiles. 5 questions per session.
            </p>
            <div className="soft-card p-4 space-y-1 text-sm">
              <p><strong>{enabledPatterns.length}</strong> patterns enabled</p>
              <p><strong>{verbs.length}</strong> verbs · <strong>{nouns.length}</strong> nouns available</p>
            </div>
            <button
              onClick={startSession}
              className="w-full soft-btn bg-primary text-primary-foreground py-3 rounded-2xl font-display font-bold"
            >
              Start Session
            </button>
          </motion.div>
        )}

        {phase === 'drill' && questions[currentIdx] && (
          <motion.div
            key={`q-${currentIdx}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <QuestionCard
              question={questions[currentIdx]}
              questionIndex={currentIdx}
              totalQuestions={questions.length}
              onResult={handleResult}
            />
          </motion.div>
        )}

        {phase === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ConjugationSummary questions={results} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
