import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Stats() {
  const { data } = useApp();

  const totalAttempts = data.flashcards.reduce((s, c) => s + c.correctCount + c.incorrectCount, 0);
  const totalCorrect = data.flashcards.reduce((s, c) => s + c.correctCount, 0);
  const overallAcc = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Category breakdown
  const catStats = data.categories.map(cat => {
    const cards = data.flashcards.filter(c => c.category === cat);
    const attempts = cards.reduce((s, c) => s + c.correctCount + c.incorrectCount, 0);
    const correct = cards.reduce((s, c) => s + c.correctCount, 0);
    return { name: cat, accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0, count: cards.length };
  }).filter(c => c.count > 0);

  // Weakest words
  const weakest = data.flashcards
    .filter(c => c.correctCount + c.incorrectCount > 0)
    .map(c => ({
      ...c,
      accuracy: Math.round((c.correctCount / (c.correctCount + c.incorrectCount)) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-bold">📊 Stats</h2>

      {/* Overview */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="grid grid-cols-3 gap-3">
        <div className="soft-card p-4 text-center">
          <p className="text-2xl font-display font-bold">{data.flashcards.length}</p>
          <p className="text-xs text-muted-foreground">Cards</p>
        </div>
        <div className="soft-card p-4 text-center">
          <p className="text-2xl font-display font-bold">{overallAcc}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
        <div className="soft-card p-4 text-center">
          <p className="text-2xl font-display font-bold">{data.drillResults.length}</p>
          <p className="text-xs text-muted-foreground">Drills</p>
        </div>
      </motion.div>

      {/* Accuracy Ring */}
      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="soft-card p-6">
        <h2 className="font-display font-bold text-sm mb-4">Overall Accuracy</h2>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <path
                d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${overallAcc}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-display font-bold">{overallAcc}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Breakdown Chart */}
      {catStats.length > 0 && (
        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="soft-card p-5">
          <h2 className="font-display font-bold text-sm mb-4">By Category</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={catStats}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                {catStats.map((_, i) => (
                  <Cell key={i} fill={`hsl(var(--primary) / ${0.5 + i * 0.1})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Weakest Words */}
      {weakest.length > 0 && (
        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="soft-card p-5">
          <h2 className="font-display font-bold text-sm mb-3">⚠️ Weakest Words</h2>
          <div className="space-y-2">
            {weakest.map(card => (
              <div key={card.id} className="flex items-center justify-between py-1">
                <div>
                  <p className="font-medium text-sm">{card.korean}</p>
                  <p className="text-xs text-muted-foreground">{card.english}</p>
                </div>
                <span className={`text-sm font-bold ${card.accuracy >= 50 ? 'text-accent' : 'text-destructive'}`}>
                  {card.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Drills */}
      {data.drillResults.length > 0 && (
        <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp} className="soft-card p-5">
          <h2 className="font-display font-bold text-sm mb-3">📝 Recent Drills</h2>
          <div className="space-y-2">
            {data.drillResults.slice(0, 10).map(r => (
              <div key={r.id} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.direction === 'en-to-kr' ? '🇺🇸 → 🇰🇷' : '🇰🇷 → 🇺🇸'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-bold font-display">{Math.round((r.correctCount / r.totalCards) * 100)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {totalAttempts === 0 && (
        <div className="soft-card p-8 text-center">
          <p className="text-4xl mb-3">📈</p>
          <p className="text-muted-foreground">Complete some drills to see your stats!</p>
        </div>
      )}
    </div>
  );
}
