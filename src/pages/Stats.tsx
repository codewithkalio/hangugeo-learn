import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChartColumn } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Stats() {
  const { data } = useApp();

  const cardsWithConfidence = data.flashcards.filter(c => c.confidenceScore > 0);
  const avgConfidence = cardsWithConfidence.length > 0
    ? (cardsWithConfidence.reduce((s, c) => s + c.confidenceScore, 0) / cardsWithConfidence.length)
    : 0;
  const confidencePct = Math.round((avgConfidence / 4) * 100);

  // Category breakdown by avg confidence
  const catStats = data.categories.map(cat => {
    const cards = data.flashcards.filter(c => c.category === cat);
    const rated = cards.filter(c => c.confidenceScore > 0);
    const avg = rated.length > 0 ? rated.reduce((s, c) => s + c.confidenceScore, 0) / rated.length : 0;
    return { name: cat, confidence: Math.round((avg / 4) * 100), count: cards.length };
  }).filter(c => c.count > 0);

  // Weakest words (lowest confidence, highest weight)
  const weakest = data.flashcards
    .filter(c => c.confidenceScore > 0)
    .sort((a, b) => a.confidenceScore - b.confidenceScore || b.weight - a.weight)
    .slice(0, 5);

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
  };

  const confLabel = (score: number) => {
    if (score === 4) return 'Fluent';
    if (score === 3) return 'Got it';
    if (score === 2) return 'Familiar';
    if (score === 1) return 'No idea';
    return '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/settings" className="soft-btn p-2 rounded-xl" aria-label="Back to Settings">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><ChartColumn className="h-6 w-6 text-[#F0B429]" /> Stats</h1>
      </div>

      {/* Overview */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="grid grid-cols-3 gap-3">
        <div className="soft-card p-4 text-center">
          <p className="text-2xl font-display font-bold">{data.flashcards.length}</p>
          <p className="text-xs text-muted-foreground">Cards</p>
        </div>
        <div className="soft-card p-4 text-center">
          <p className="text-2xl font-display font-bold">{confidencePct}%</p>
          <p className="text-xs text-muted-foreground">Confidence</p>
        </div>
        <div className="soft-card p-4 text-center">
          <p className="text-2xl font-display font-bold">{data.drillResults.length}</p>
          <p className="text-xs text-muted-foreground">Drills</p>
        </div>
      </motion.div>

      {/* Confidence Ring */}
      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="soft-card p-6">
        <h2 className="font-display font-bold text-sm mb-4">Overall Confidence</h2>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <path
                d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${confidencePct}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-display font-bold">{confidencePct}%</span>
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
              <Bar dataKey="confidence" radius={[8, 8, 0, 0]}>
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
                <span className={`text-xs font-bold ${card.confidenceScore >= 3 ? 'text-primary' : 'text-destructive'}`}>
                  {confLabel(card.confidenceScore)}
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
            {data.drillResults.slice(0, 10).map(r => {
              const avg = r.cards.length > 0
                ? (r.cards.reduce((s: number, c: any) => s + (c.confidence ?? (c.correct ? 4 : 1)), 0) / r.cards.length).toFixed(1)
                : '0';
              return (
                <div key={r.id} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{r.direction === 'en-to-kr' ? '🇺🇸 → 🇰🇷' : '🇰🇷 → 🇺🇸'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-bold font-display">{avg} / 4</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {cardsWithConfidence.length === 0 && data.drillResults.length === 0 && (
        <div className="soft-card p-8 text-center">
          <ChartColumn className="h-12 w-12 text-[#F0B429] mx-auto mb-3" />
          <p className="text-muted-foreground">Complete some drills to see your stats!</p>
        </div>
      )}
    </div>
  );
}
