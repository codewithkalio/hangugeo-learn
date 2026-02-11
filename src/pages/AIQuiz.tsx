import { motion } from 'framer-motion';
import { Sparkles, Lock, Bell } from 'lucide-react';

export default function AIQuiz() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="soft-card p-3 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-accent" />
        </div>

        <div className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full">
          <Lock className="h-3 w-3" /> Coming Soon
        </div>

        <h1 className="text-2xl font-display font-bold">AI Sentence Quiz 🤖</h1>
        <p className="text-muted-foreground leading-relaxed">
          Practice with AI-generated sentences using words from your flashcard bank.
          Test your comprehension in real-world context!
        </p>

        <div className="soft-card p-4 space-y-3 text-left">
          <p className="text-sm font-display font-bold">What to expect:</p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2"><span>📝</span> AI creates sentences using your vocabulary</li>
            <li className="flex items-start gap-2"><span>🎯</span> Fill-in-the-blank and translation challenges</li>
            <li className="flex items-start gap-2"><span>📈</span> Adaptive difficulty based on your progress</li>
          </ul>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="soft-btn bg-muted text-muted-foreground py-3 px-6 rounded-2xl font-display font-bold text-sm flex items-center gap-2 mx-auto cursor-not-allowed"
          disabled
        >
          <Bell className="h-4 w-4" /> Notify Me
        </motion.button>
      </motion.div>
    </div>
  );
}
