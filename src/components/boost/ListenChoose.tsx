import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Flashcard } from '@/lib/types';
import { speakKorean, shuffleArray, pickDistractors } from '@/lib/boostHelpers';

interface Props {
  words: Flashcard[];
  allPool: Flashcard[];
  onComplete: (results: { cardId: string; correct: boolean }[]) => void;
}

export default function ListenChoose({ words, allPool, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<{ cardId: string; correct: boolean }[]>([]);

  const current = words[idx];

  const buildOptions = useCallback(() => {
    if (!current) return;
    const distractors = pickDistractors(current.id, allPool, 3, 'english');
    setOptions(shuffleArray([current.english, ...distractors]));
  }, [current, allPool]);

  useEffect(() => {
    buildOptions();
    setSelected(null);
    const timer = setTimeout(() => speakKorean(current?.korean ?? ''), 300);
    return () => clearTimeout(timer);
  }, [idx, buildOptions, current]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === current.english;
    const newResults = [...results, { cardId: current.id, correct }];
    setResults(newResults);

    setTimeout(() => {
      if (idx + 1 >= words.length) {
        onComplete(newResults);
      } else {
        setIdx(i => i + 1);
      }
    }, 1000);
  };

  if (!current) return null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Round 1 · Listen & Choose</p>
        <p className="text-sm text-muted-foreground">{idx + 1} / {words.length}</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => speakKorean(current.korean)}
        className="soft-card w-full p-8 flex flex-col items-center gap-3"
      >
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
          <Volume2 className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Tap to hear again</p>
      </motion.button>

      <div className="grid grid-cols-1 gap-2">
        {options.map(opt => {
          const isCorrect = opt === current.english;
          const isSelected = selected === opt;
          let cls = 'bg-card';
          if (selected) {
            if (isCorrect) cls = 'bg-success/15 text-success';
            else if (isSelected) cls = 'bg-destructive/15 text-destructive';
          }

          return (
            <motion.button
              key={opt}
              whileTap={!selected ? { scale: 0.97 } : undefined}
              onClick={() => handleSelect(opt)}
              className={`soft-btn p-4 rounded-xl text-sm font-medium transition-all ${cls}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
