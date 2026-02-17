import { useApp } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { BookOpen, Zap, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data } = useApp();

  const totalCards = data.flashcards.length;
  const cardsWithConfidence = data.flashcards.filter(c => c.confidenceScore > 0);
  const avgConfidence = cardsWithConfidence.length > 0
    ? (cardsWithConfidence.reduce((s, c) => s + c.confidenceScore, 0) / cardsWithConfidence.length)
    : 0;
  const confidencePct = Math.round((avgConfidence / 4) * 100);
  const dueCards = data.flashcards.filter(c => c.weight >= 3).length;

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              안녕하세요! 👋
            </h1>
            <p className="text-muted-foreground mt-1">Ready for today's practice?</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="grid grid-cols-2 gap-3">
        <Link to="/drill" className="soft-btn bg-primary text-primary-foreground p-4 rounded-2xl flex flex-col items-center gap-2 text-center">
          <Zap className="h-6 w-6" />
          <span className="font-display font-bold text-sm">Start Drill</span>
        </Link>
        <Link to="/cards/new" className="soft-btn bg-accent text-accent-foreground p-4 rounded-2xl flex flex-col items-center gap-2 text-center">
          <BookOpen className="h-6 w-6" />
          <span className="font-display font-bold text-sm">Add Flashcard</span>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="grid grid-cols-3 gap-3">
        <div className="soft-card p-4 text-center">
          <Target className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-xl font-display font-bold text-foreground">{totalCards}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Total Cards</p>
        </div>
        <div className="soft-card p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
          <p className="text-xl font-display font-bold text-foreground">{confidencePct}%</p>
          <p className="text-[10px] text-muted-foreground font-medium">Confidence</p>
        </div>
        <div className="soft-card p-4 text-center">
          <BookOpen className="h-5 w-5 mx-auto text-accent mb-1" />
          <p className="text-xl font-display font-bold text-foreground">{dueCards}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Due for Review</p>
        </div>
      </motion.div>
    </div>
  );
}
