import { useState, useMemo, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, HelpCircle, Brain, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Flashcard } from '@/lib/types';

type DrillPhase = 'setup' | 'drill' | 'summary';
type Direction = 'kr-to-en' | 'en-to-kr';
type SessionMode = 'smart' | 'category';

const CONFIDENCE_OPTIONS = [
  { value: 1, label: 'No idea', emoji: '😵', colorClass: 'bg-destructive/15 text-destructive', feedback: 'Will appear very frequently' },
  { value: 2, label: 'Familiar', emoji: '🤔', colorClass: 'bg-accent/15 text-accent', feedback: 'Will appear often' },
  { value: 3, label: 'Got it', emoji: '😊', colorClass: 'bg-primary/15 text-primary', feedback: 'Will appear occasionally' },
  { value: 4, label: 'Fluent', emoji: '🔥', colorClass: 'bg-success/15 text-success', feedback: 'Will surface rarely' },
] as const;

function drawNextCard(pool: Flashcard[]): Flashcard {
  const totalWeight = pool.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * totalWeight;
  for (const card of pool) {
    r -= card.weight;
    if (r <= 0) return card;
  }
  return pool[pool.length - 1];
}

export default function FlashcardDrill() {
  const { data, addDrillResult } = useApp();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<DrillPhase>('setup');
  const [direction, setDirection] = useState<Direction>('kr-to-en');
  const [sessionMode, setSessionMode] = useState<SessionMode>('smart');
  const [filterCat, setFilterCat] = useState('all');
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{ cardId: string; confidence: number }[]>([]);
  const [pool, setPool] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [totalInSession, setTotalInSession] = useState(0);

  const usedCategories = [...new Set(data.flashcards.map(c => c.category).filter(Boolean))] as string[];

  const deckSize = useMemo(() => {
    if (sessionMode === 'category' && filterCat !== 'all') {
      return data.flashcards.filter(c => c.category === filterCat).length;
    }
    return data.flashcards.length;
  }, [data.flashcards, sessionMode, filterCat]);

  const startDrill = useCallback(() => {
    let cards = [...data.flashcards];
    if (sessionMode === 'category' && filterCat !== 'all') {
      cards = cards.filter(c => c.category === filterCat);
    }
    if (cards.length === 0) return;

    setResults([]);
    setFeedbackText(null);
    setTotalInSession(cards.length);
    const first = drawNextCard(cards);
    const remaining = cards.filter(c => c.id !== first.id);
    setCurrentCard(first);
    setPool(remaining);
    setFlipped(false);
    setPhase('drill');
  }, [data.flashcards, sessionMode, filterCat]);

  const rateCard = useCallback((confidence: number) => {
    if (!currentCard) return;

    const option = CONFIDENCE_OPTIONS.find(o => o.value === confidence)!;
    setFeedbackText(option.feedback);

    const newResults = [...results, { cardId: currentCard.id, confidence }];
    setResults(newResults);

    // Brief delay to show feedback, then advance
    setTimeout(() => {
      setFeedbackText(null);

      if (pool.length === 0) {
        // Session complete
        addDrillResult({
          direction,
          totalCards: totalInSession,
          correctCount: newResults.filter(r => r.confidence >= 3).length,
          cards: newResults,
          category: sessionMode === 'category' && filterCat !== 'all' ? filterCat : undefined,
        });
        setPhase('summary');
      } else {
        const next = drawNextCard(pool);
        setPool(prev => prev.filter(c => c.id !== next.id));
        setCurrentCard(next);
        setFlipped(false);
      }
    }, 800);
  }, [currentCard, results, pool, direction, totalInSession, filterCat, sessionMode, addDrillResult]);

  // ── Setup Phase ──
  if (phase === 'setup') {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="soft-btn p-2 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-display font-bold">⚡ Drill Setup</h1>
        </div>

        <div className="soft-card p-5 space-y-5">
          {/* Session Mode */}
          <div className="space-y-2">
            <label className="font-display font-bold text-sm">Session Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSessionMode('smart'); setFilterCat('all'); }}
                className={`soft-btn p-4 rounded-xl flex flex-col items-center gap-2 text-sm font-medium transition-all ${
                  sessionMode === 'smart' ? 'bg-primary text-primary-foreground' : 'bg-card'
                }`}
              >
                <Brain className="h-5 w-5" />
                Smart Session
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setSessionMode('category')}
                className={`soft-btn p-4 rounded-xl flex flex-col items-center gap-2 text-sm font-medium transition-all ${
                  sessionMode === 'category' ? 'bg-primary text-primary-foreground' : 'bg-card'
                }`}
              >
                <FolderOpen className="h-5 w-5" />
                Category Focus
              </motion.button>
            </div>
          </div>

          {/* Category Dropdown (only for category mode) */}
          {sessionMode === 'category' && usedCategories.length > 0 && (
            <div className="space-y-2">
              <label className="font-display font-bold text-sm">Category</label>
              <Select value={filterCat} onValueChange={setFilterCat}>
                <SelectTrigger className="soft-inset border-none bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({data.flashcards.length})</SelectItem>
                  {usedCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat} ({data.flashcards.filter(c => c.category === cat).length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Direction (secondary) */}
          <div className="space-y-2">
            <label className="font-display font-bold text-sm text-muted-foreground">Direction</label>
            <div className="grid grid-cols-2 gap-2">
              {(['kr-to-en', 'en-to-kr'] as Direction[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`soft-btn p-3 rounded-xl text-sm font-medium transition-all ${
                    direction === d ? 'bg-secondary text-secondary-foreground' : 'bg-card'
                  }`}
                >
                  {d === 'en-to-kr' ? '🇺🇸 → 🇰🇷' : '🇰🇷 → 🇺🇸'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">{deckSize} cards ready</p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={startDrill}
            disabled={deckSize === 0}
            className="w-full soft-btn bg-primary text-primary-foreground py-3 rounded-2xl font-display font-bold disabled:opacity-50"
          >
            Start Drill ⚡
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Summary Phase ──
  if (phase === 'summary') {
    const dist = [0, 0, 0, 0];
    results.forEach(r => { dist[r.confidence - 1]++; });
    const reviewCards = results
      .filter(r => r.confidence <= 2)
      .map(r => data.flashcards.find(c => c.id === r.cardId)!)
      .filter(Boolean);

    const avgConfidence = results.length > 0
      ? (results.reduce((s, r) => s + r.confidence, 0) / results.length).toFixed(1)
      : '0';

    return (
      <div className="space-y-6 max-w-md mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <p className="text-5xl">{Number(avgConfidence) >= 3 ? '🎉' : Number(avgConfidence) >= 2 ? '👍' : '💪'}</p>
          <h1 className="text-2xl font-display font-bold">Session Complete!</h1>

          {/* Confidence Distribution */}
          <div className="soft-card p-5 space-y-3">
            <p className="text-sm font-display font-bold text-muted-foreground">Confidence Distribution</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {CONFIDENCE_OPTIONS.map((opt, i) => (
                <div key={opt.value} className={`rounded-xl p-3 ${opt.colorClass}`}>
                  <p className="text-lg font-display font-bold">{dist[i]}</p>
                  <p className="text-[10px] font-medium">{opt.label}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Avg. Confidence: <span className="font-bold text-foreground">{avgConfidence}</span> / 4
              </p>
            </div>
          </div>

          {/* Review Section */}
          {reviewCards.length > 0 && (
            <div className="soft-card p-4 text-left space-y-2">
              <p className="font-display font-bold text-sm">📖 Review these:</p>
              {reviewCards.map(card => (
                <div key={card.id} className="flex justify-between text-sm">
                  <span className="font-medium">{card.korean}</span>
                  <span className="text-muted-foreground">{card.english}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setPhase('setup')} className="flex-1 soft-btn bg-card py-3 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4" /> Again
            </button>
            <button onClick={() => navigate('/')} className="flex-1 soft-btn bg-primary text-primary-foreground py-3 rounded-2xl font-display font-bold text-sm">
              Done
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Drill Phase ──
  if (!currentCard) return null;
  const front = direction === 'en-to-kr' ? currentCard.english : currentCard.korean;
  const back = direction === 'en-to-kr' ? currentCard.korean : currentCard.english;
  const remaining = pool.length + 1;
  const answered = results.length;
  const progressPct = totalInSession > 0 ? ((answered) / totalInSession) * 100 : 0;

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => setPhase('setup')} className="soft-btn p-2 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm text-muted-foreground font-medium">{remaining} remaining</span>
        <Badge variant="secondary" className="bg-muted text-muted-foreground border-none">
          {direction === 'en-to-kr' ? '🇺🇸→🇰🇷' : '🇰🇷→🇺🇸'}
        </Badge>
      </div>

      <Progress value={progressPct} className="h-2 bg-muted" />

      {/* Flip Card */}
      <motion.div
        className="cursor-pointer perspective-1000"
        onClick={() => !feedbackText && setFlipped(!flipped)}
        whileTap={feedbackText ? {} : { scale: 0.98 }}
      >
        <div className="soft-card p-8 min-h-[200px] flex flex-col items-center justify-center text-center">
          <p className="text-xs text-muted-foreground mb-2 font-medium">{flipped ? 'Answer' : 'Tap to flip'}</p>
          <p className={`font-display font-bold ${flipped ? 'text-3xl' : 'text-2xl'} text-foreground`}>
            {flipped ? back : front}
          </p>
          {flipped && currentCard.category && (
            <Badge variant="secondary" className="mt-3 bg-muted text-muted-foreground border-none text-xs">
              {currentCard.category}
            </Badge>
          )}
          {flipped && currentCard.note && (
            <p className="mt-2 text-sm text-muted-foreground italic">{currentCard.note}</p>
          )}
        </div>
      </motion.div>

      {/* Confidence Buttons */}
      {flipped && !feedbackText && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center justify-center gap-1">
            <p className="text-xs text-muted-foreground font-medium">Rate your confidence</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs">
                  <p><strong>1 — No idea:</strong> No recall at all</p>
                  <p><strong>2 — Familiar:</strong> Seen it but couldn't retrieve</p>
                  <p><strong>3 — Got it:</strong> Recalled with some effort</p>
                  <p><strong>4 — Fluent:</strong> Knew it instantly</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {CONFIDENCE_OPTIONS.map(opt => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.93 }}
                onClick={() => rateCard(opt.value)}
                className={`soft-btn ${opt.colorClass} py-3 rounded-xl font-display font-bold text-xs flex flex-col items-center gap-1`}
              >
                <span className="text-lg">{opt.emoji}</span>
                {opt.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedbackText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="soft-card p-3 text-center"
          >
            <p className="text-sm text-muted-foreground font-medium">{feedbackText}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
