import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import TilePool from './TilePool';
import { SessionQuestion } from '@/lib/conjugationHelpers';
import { getExplanation } from '@/lib/conjugationHelpers';
import { PATTERN_MAP } from '@/lib/conjugationData';

type State = 'attempt1' | 'attempt2' | 'correct' | 'showAnswer';

interface Props {
  question: SessionQuestion;
  questionIndex: number;
  totalQuestions: number;
  onResult: (result: { patternKey: string; firstAttempt: boolean | null; secondAttempt: boolean | null }) => void;
}

export default function QuestionCard({ question, questionIndex, totalQuestions, onResult }: Props) {
  const [state, setState] = useState<State>('attempt1');
  const [key, setKey] = useState(0); // force TilePool remount on retry
  const reported = useRef(false);

  // Reset when question changes
  useEffect(() => {
    setState('attempt1');
    setKey(prev => prev + 1);
    reported.current = false;
  }, [question]);

  const patternDef = PATTERN_MAP[question.patternKey];

  const handleSubmit = useCallback((tiles: string[]) => {
    const answer = tiles.join(' ');
    const correct = answer === question.correctTiles.join(' ');

    if (state === 'attempt1') {
      if (correct) {
        setState('correct');
        if (!reported.current) {
          reported.current = true;
          onResult({ patternKey: question.patternKey, firstAttempt: true, secondAttempt: null });
        }
      } else {
        setState('attempt2');
        setKey(prev => prev + 1);
      }
    } else if (state === 'attempt2') {
      if (correct) {
        setState('correct');
        if (!reported.current) {
          reported.current = true;
          onResult({ patternKey: question.patternKey, firstAttempt: false, secondAttempt: true });
        }
      } else {
        setState('showAnswer');
        if (!reported.current) {
          reported.current = true;
          onResult({ patternKey: question.patternKey, firstAttempt: false, secondAttempt: false });
        }
      }
    }
  }, [state, question, onResult]);

  const emoji = state === 'correct' ? '✅' : state === 'showAnswer' ? '📖' : state === 'attempt2' ? '🔄' : '🎯';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5"
    >
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i < questionIndex ? 'bg-primary' : i === questionIndex ? 'bg-accent' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Base sentence */}
      <div className="soft-card p-5 space-y-3 text-center">
        <p className="text-lg font-display font-bold">{question.baseSentence}</p>
        <p className="text-sm text-muted-foreground">
          {question.verbEnglish} {question.noun}
        </p>
      </div>

      {/* Instruction */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{emoji} {question.englishPrompt}</p>
        <p className="text-xs text-muted-foreground">{patternDef?.korean}</p>
      </div>

      {/* State feedback */}
      {state === 'attempt2' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-accent font-medium"
        >
          Not quite — try once more!
        </motion.p>
      )}

      {state === 'correct' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="soft-card p-4 bg-success/10 text-center"
        >
          <p className="font-display font-bold text-success">Correct! 🎉</p>
          <p className="text-sm text-foreground mt-1">{question.correctAnswer}</p>
        </motion.div>
      )}

      {state === 'showAnswer' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="soft-card p-4 space-y-3"
        >
          <p className="font-display font-bold text-destructive text-center">Correct answer:</p>
          <p className="text-center text-lg font-bold">{question.correctAnswer}</p>
          <div className="border-t border-border/50 pt-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              💡 {getExplanation(question.patternKey)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Tile pool */}
      {(state === 'attempt1' || state === 'attempt2') && (
        <TilePool
          key={key}
          correctTiles={question.correctTiles}
          allTiles={question.allTiles}
          onSubmit={handleSubmit}
          disabled={false}
        />
      )}

      {state === 'showAnswer' && (
        <TilePool
          key={`show-${key}`}
          correctTiles={question.correctTiles}
          allTiles={[]}
          onSubmit={() => {}}
          disabled
          showCorrect
        />
      )}
    </motion.div>
  );
}
