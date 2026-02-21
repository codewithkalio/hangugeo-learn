import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PATTERN_MAP } from '@/lib/conjugationData';
import { ConjugationQuestion } from '@/lib/types';

interface Props {
  questions: ConjugationQuestion[];
}

export default function ConjugationSummary({ questions }: Props) {
  const navigate = useNavigate();

  const correctFirst = questions.filter(q => q.resultFirstAttempt === true).length;
  const correctSecond = questions.filter(q => q.resultSecondAttempt === true).length;
  const incorrect = questions.filter(q => q.resultFirstAttempt === false && q.resultSecondAttempt === false).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round(((correctFirst + correctSecond) / total) * 100) : 0;

  const emoji = pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪';
  const message = pct >= 80 ? 'Amazing work!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="space-y-6 text-center"
    >
      <p className="text-5xl">{emoji}</p>
      <h1 className="text-2xl font-display font-bold">{message}</h1>

      <div className="soft-card p-5 space-y-3">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <p className="font-display font-bold text-lg">{pct}% Accuracy</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">✅ Correct (1st try)</span>
            <span className="font-medium">{correctFirst}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">🔄 Correct (2nd try)</span>
            <span className="font-medium">{correctSecond}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">❌ Incorrect</span>
            <span className="font-medium">{incorrect}</span>
          </div>
        </div>

        {/* Per-pattern breakdown */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground font-medium">Pattern breakdown</p>
          {questions.map((q, i) => {
            const pattern = PATTERN_MAP[q.patternKey];
            const result = q.resultFirstAttempt ? '✅' : q.resultSecondAttempt ? '🔄' : '❌';
            return (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate mr-2">{pattern?.label || q.patternKey}</span>
                <span>{result}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full soft-btn bg-primary text-primary-foreground py-3 rounded-2xl font-display font-bold"
      >
        Back to Home
      </button>
    </motion.div>
  );
}
