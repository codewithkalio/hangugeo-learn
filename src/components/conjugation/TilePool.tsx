import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  correctTiles: string[];
  allTiles: string[];
  onSubmit: (tiles: string[]) => void;
  disabled?: boolean;
  showCorrect?: boolean;
}

export default function TilePool({ correctTiles, allTiles, onSubmit, disabled, showCorrect }: Props) {
  const [selectedTiles, setSelectedTiles] = useState<{ id: string; text: string }[]>([]);
  const [poolTiles, setPoolTiles] = useState(
    allTiles.map((t, i) => ({ id: `${i}-${t}`, text: t }))
  );

  const handleTapPool = (tile: { id: string; text: string }) => {
    if (disabled) return;
    setPoolTiles(prev => prev.filter(t => t.id !== tile.id));
    const newSelected = [...selectedTiles, tile];
    setSelectedTiles(newSelected);

    // Auto-evaluate when we have the right number of tiles
    if (newSelected.length === correctTiles.length) {
      onSubmit(newSelected.map(t => t.text));
    }
  };

  const handleTapSelected = (tile: { id: string; text: string }) => {
    if (disabled) return;
    setSelectedTiles(prev => prev.filter(t => t.id !== tile.id));
    setPoolTiles(prev => [...prev, tile]);
  };

  return (
    <div className="space-y-4">
      {/* Construction area */}
      <div className="soft-inset min-h-[56px] p-3 flex flex-wrap gap-2 items-center">
        {selectedTiles.length === 0 && (
          <span className="text-xs text-muted-foreground italic">Tap tiles to build your answer…</span>
        )}
        <AnimatePresence>
          {selectedTiles.map(tile => (
            <motion.button
              key={tile.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => handleTapSelected(tile)}
              disabled={disabled}
              className={`soft-btn px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                showCorrect
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              {tile.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Correct answer display */}
      {showCorrect && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {correctTiles.map((t, i) => (
            <span key={i} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-success text-success-foreground">
              {t}
            </span>
          ))}
        </motion.div>
      )}

      {/* Tile pool */}
      <div className="flex flex-wrap gap-2 justify-center">
        <AnimatePresence>
          {poolTiles.map(tile => (
            <motion.button
              key={tile.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => handleTapPool(tile)}
              disabled={disabled}
              className="soft-btn px-4 py-2.5 rounded-xl text-sm font-medium bg-card text-foreground min-w-[44px] min-h-[44px]"
            >
              {tile.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
