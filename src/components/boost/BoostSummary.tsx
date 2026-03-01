import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, ThumbsUp, Dumbbell } from 'lucide-react';

interface RoundResult {
  round: string;
  correct: number;
  total: number;
}

interface Props {
  rounds: RoundResult[];
}

export default function BoostSummary({ rounds }: Props) {
  const navigate = useNavigate();

  const totalCorrect = rounds.reduce((s, r) => s + r.correct, 0);
  const totalQuestions = rounds.reduce((s, r) => s + r.total, 0);
  const pct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const ResultIcon = pct >= 80 ? Trophy : pct >= 50 ? ThumbsUp : Dumbbell;
  const message = pct >= 80 ? 'Amazing work!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!';

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="space-y-6 text-center"
    >
      <ResultIcon className="h-12 w-12 text-primary mx-auto" />
      <h1 className="text-2xl font-display font-bold">{message}</h1>

      <div className="soft-card p-5 space-y-3">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-5 w-5 text-[#F0B429]" />
          <p className="font-display font-bold text-lg">{pct}% Accuracy</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          {rounds.map(r => (
            <div key={r.round} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{r.round}</span>
              <span className="font-medium">{r.correct}/{r.total}</span>
            </div>
          ))}
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
