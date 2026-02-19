import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flashcard } from '@/lib/types';
import { shuffleArray, pickDistractors, getIconForWord } from '@/lib/boostHelpers';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  words: Flashcard[];
  allPool: Flashcard[];
  onComplete: (results: { cardId: string; correct: boolean }[]) => void;
}

export default function PictureMatch({ words, allPool, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<{ cardId: string; correct: boolean }[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);

  const current = words[idx];

  const fetchImage = useCallback(async (query: string) => {
    setImgLoading(true);
    setImageUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-image', {
        body: { query },
      });
      if (!error && data?.url) {
        setImageUrl(data.url);
      }
    } catch {
      // fallback to icon
    } finally {
      setImgLoading(false);
    }
  }, []);

  const buildOptions = useCallback(() => {
    if (!current) return;
    const distractors = pickDistractors(current.id, allPool, 3, 'korean');
    setOptions(shuffleArray([current.korean, ...distractors]));
  }, [current, allPool]);

  useEffect(() => {
    buildOptions();
    setSelected(null);
    setImageUrl(null);
    // Try fetching image for concrete nouns
    if (current) {
      fetchImage(current.english);
    }
  }, [idx, buildOptions, current, fetchImage]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === current.korean;
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

  const iconMapping = getIconForWord(current.category);
  const IconComp = iconMapping.icon;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Round 2 · Picture Match</p>
        <p className="text-sm text-muted-foreground">{idx + 1} / {words.length}</p>
      </div>

      <div className="soft-card p-6 sm:p-8 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[180px]">
        {imgLoading ? (
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-muted animate-pulse" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={current.english}
            className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md"
          />
        ) : (
          <div className={`w-24 h-24 rounded-full ${iconMapping.bgColor} flex items-center justify-center`}>
            <IconComp className={`h-12 w-12 ${iconMapping.color}`} />
          </div>
        )}
        <p className="mt-3 text-sm text-muted-foreground font-medium">{current.english}</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {options.map(opt => {
          const isCorrect = opt === current.korean;
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
