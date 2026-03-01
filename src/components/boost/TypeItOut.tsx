import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Flashcard } from '@/lib/types';
import { speakKorean, isSpeechAvailable } from '@/lib/boostHelpers';

interface Props {
  roundNumber: number;
  words: Flashcard[];
  onComplete: (results: { cardId: string; correct: boolean }[]) => void;
}

export default function TypeItOut({ roundNumber, words, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ cardId: string; correct: boolean }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = words[idx];
  const hasAudio = isSpeechAvailable();

  useEffect(() => {
    setInput('');
    setSubmitted(false);
    inputRef.current?.focus();
    if (hasAudio && current) {
      const timer = setTimeout(() => speakKorean(current.korean), 300);
      return () => clearTimeout(timer);
    }
  }, [idx, current, hasAudio]);

  const handleSubmit = () => {
    if (submitted || !input.trim()) return;
    setSubmitted(true);
    const correct = input.trim() === current.korean.trim();
    const newResults = [...results, { cardId: current.id, correct }];
    setResults(newResults);

    setTimeout(() => {
      if (idx + 1 >= words.length) {
        onComplete(newResults);
      } else {
        setIdx(i => i + 1);
      }
    }, correct ? 1500 : 3000);
  };

  if (!current) return null;

  const isCorrect = submitted && input.trim() === current.korean.trim();
  const isWrong = submitted && !isCorrect;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Round {roundNumber} · Type It Out</p>
        <p className="text-sm text-muted-foreground">{idx + 1} / {words.length}</p>
      </div>

      <div className="soft-card p-6 text-center space-y-3">
        <p className="text-2xl font-display font-bold text-foreground">{current.english}</p>
        {hasAudio && (
          <button
            onClick={() => speakKorean(current.korean)}
            className="mx-auto w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center"
          >
            <Volume2 className="h-5 w-5 text-primary" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <input
          ref={inputRef}
          value={input}
          onChange={e => !submitted && setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Type the Korean word..."
          className={`w-full soft-inset bg-background px-4 py-3 rounded-xl text-center font-medium outline-none transition-all ${
            isCorrect ? 'text-success' : isWrong ? 'text-destructive' : ''
          }`}
          readOnly={submitted}
        />

        {submitted && isWrong && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-muted-foreground"
          >
            Correct answer: <span className="font-bold text-foreground">{current.korean}</span>
          </motion.p>
        )}

        {!submitted && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="w-full soft-btn bg-primary text-primary-foreground py-3 rounded-2xl font-display font-bold disabled:opacity-50"
          >
            Check
          </motion.button>
        )}
      </div>
    </div>
  );
}
