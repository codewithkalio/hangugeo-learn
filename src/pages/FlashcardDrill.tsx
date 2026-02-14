import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type DrillPhase = 'setup' | 'drill' | 'summary';
type Direction =  'kr-to-en' | 'en-to-kr';

export default function FlashcardDrill() {
  const { data, addDrillResult } = useApp();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<DrillPhase>('setup');
  const [direction, setDirection] = useState<Direction>('kr-to-en');
  const [filterCat, setFilterCat] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{ cardId: string; correct: boolean }[]>([]);

  const usedCategories = [...new Set(data.flashcards.map(c => c.category).filter(Boolean))] as string[];

  const deck = useMemo(() => {
    let cards = data.flashcards;
    if (filterCat !== 'all') cards = cards.filter(c => c.category === filterCat);
    return cards.sort(() => Math.random() - 0.5);
  }, [data.flashcards, filterCat, phase]);

  const currentCard = deck[currentIndex];

  const startDrill = () => {
    if (deck.length === 0) return;
    setCurrentIndex(0);
    setResults([]);
    setFlipped(false);
    setPhase('drill');
  };

  const markAnswer = (correct: boolean) => {
    const newResults = [...results, { cardId: currentCard.id, correct }];
    setResults(newResults);

    if (currentIndex + 1 >= deck.length) {
      addDrillResult({
        direction,
        totalCards: deck.length,
        correctCount: newResults.filter(r => r.correct).length,
        cards: newResults,
        category: filterCat === 'all' ? undefined : filterCat,
      });
      setPhase('summary');
    } else {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    }
  };

  const correctCount = results.filter(r => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  // Setup Phase
  if (phase === 'setup') {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="soft-btn p-2 rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-display font-bold">⚡ Drill Setup</h1>
        </div>

        <div className="soft-card p-5 space-y-4">
          <div className="space-y-2">
            <label className="font-display font-bold text-sm">Direction</label>
            <div className="grid grid-cols-2 gap-2">
              {(['kr-to-en', 'en-to-kr'] as Direction[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`soft-btn p-3 rounded-xl text-sm font-medium transition-all ${
                    direction === d ? 'bg-primary text-primary-foreground' : 'bg-card'
                  }`}
                >
                  {d === 'en-to-kr' ? '🇺🇸 → 🇰🇷' : '🇰🇷 → 🇺🇸'}
                </button>
              ))}
            </div>
          </div>

          {usedCategories.length > 0 && (
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

          <p className="text-sm text-muted-foreground text-center">{deck.length} cards ready</p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={startDrill}
            disabled={deck.length === 0}
            className="w-full soft-btn bg-primary text-primary-foreground py-3 rounded-2xl font-display font-bold disabled:opacity-50"
          >
            Start Drill ⚡
          </motion.button>
        </div>
      </div>
    );
  }

  // Summary Phase
  if (phase === 'summary') {
    const missed = results.filter(r => !r.correct).map(r => data.flashcards.find(c => c.id === r.cardId)!).filter(Boolean);
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <p className="text-5xl">{accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}</p>
          <h1 className="text-2xl font-display font-bold">Drill Complete!</h1>

          <div className="soft-card p-5 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{correctCount}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-destructive">{results.length - correctCount}</p>
                <p className="text-xs text-muted-foreground">Missed</p>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-primary">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </div>

          {missed.length > 0 && (
            <div className="soft-card p-4 text-left space-y-2">
              <p className="font-display font-bold text-sm">❌ Review these:</p>
              {missed.map(card => (
                <div key={card.id} className="flex justify-between text-sm">
                  <span className="font-medium">{card.korean}</span>
                  <span className="text-muted-foreground">{card.english}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => { setPhase('setup'); }} className="flex-1 soft-btn bg-card py-3 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2">
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

  // Drill Phase
  const front = direction === 'en-to-kr' ? currentCard.english : currentCard.korean;
  const back = direction === 'en-to-kr' ? currentCard.korean : currentCard.english;

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => setPhase('setup')} className="soft-btn p-2 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm text-muted-foreground font-medium">{currentIndex + 1} / {deck.length}</span>
        <Badge variant="secondary" className="bg-muted text-muted-foreground border-none">
          {direction === 'en-to-kr' ? '🇺🇸→🇰🇷' : '🇰🇷→🇺🇸'}
        </Badge>
      </div>

      <Progress value={((currentIndex + 1) / deck.length) * 100} className="h-2 bg-muted" />

      {/* Flip Card */}
      <motion.div
        className="cursor-pointer perspective-1000"
        onClick={() => setFlipped(!flipped)}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? 'back' : 'front'}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="soft-card p-8 min-h-[200px] flex flex-col items-center justify-center text-center"
          >
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
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Answer Buttons */}
      {flipped && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => markAnswer(false)}
            className="soft-btn bg-destructive/10 text-destructive py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2"
          >
            <X className="h-5 w-5" /> Missed
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => markAnswer(true)}
            className="soft-btn bg-success/10 text-success py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2"
          >
            <Check className="h-5 w-5" /> Got it
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
