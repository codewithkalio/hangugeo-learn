import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flashcard } from '@/lib/types';
import { shuffleArray } from '@/lib/boostHelpers';

interface Props {
  roundNumber: number;
  words: Flashcard[];
  onComplete: (matchCount: number, totalPairs: number) => void;
}

interface Tile {
  id: string;
  pairId: string;
  text: string;
  lang: 'kr' | 'en';
}

export default function MatchPairs({ roundNumber, words, onComplete }: Props) {
  const pairs = useMemo(() => words.slice(0, 6), [words]);

  const tiles = useMemo<Tile[]>(() => {
    const t: Tile[] = [];
    pairs.forEach(card => {
      t.push({ id: `${card.id}-kr`, pairId: card.id, text: card.korean, lang: 'kr' });
      t.push({ id: `${card.id}-en`, pairId: card.id, text: card.english, lang: 'en' });
    });
    return shuffleArray(t);
  }, [pairs]);

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (matched.size === tiles.length && tiles.length > 0) {
      setTimeout(() => onComplete(pairs.length, pairs.length), 600);
    }
  }, [matched.size, tiles.length, pairs.length, onComplete]);

  const handleTap = (tile: Tile) => {
    if (matched.has(tile.id) || wrong.has(tile.id)) return;

    if (!selected) {
      setSelected(tile.id);
      return;
    }

    if (selected === tile.id) {
      setSelected(null);
      return;
    }

    const firstTile = tiles.find(t => t.id === selected)!;
    setAttempts(a => a + 1);

    if (firstTile.pairId === tile.pairId && firstTile.lang !== tile.lang) {
      setMatched(prev => new Set([...prev, firstTile.id, tile.id]));
      setSelected(null);
    } else {
      setWrong(new Set([firstTile.id, tile.id]));
      setTimeout(() => {
        setWrong(new Set());
        setSelected(null);
      }, 600);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Round {roundNumber} · Match Pairs</p>
        <p className="text-sm text-muted-foreground">
          {matched.size / 2} / {pairs.length} matched
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map(tile => {
          const isMatched = matched.has(tile.id);
          const isSelected = selected === tile.id;
          const isWrong = wrong.has(tile.id);

          let cls = 'bg-card';
          if (isMatched) cls = 'bg-success/15 text-success';
          else if (isWrong) cls = 'bg-destructive/15 text-destructive';
          else if (isSelected) cls = 'bg-primary/15 text-primary';

          return (
            <motion.button
              key={tile.id}
              whileTap={!isMatched ? { scale: 0.95 } : undefined}
              animate={isWrong ? { x: [0, -4, 4, -4, 0] } : {}}
              transition={{ duration: 0.3 }}
              onClick={() => handleTap(tile)}
              disabled={isMatched}
              className={`soft-btn p-3 rounded-xl text-xs font-medium min-h-[60px] flex items-center justify-center transition-all ${cls}`}
            >
              {tile.text}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
