import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Edit2, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export default function FlashcardBank() {
  const { data, deleteFlashcard } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');

  const filtered = data.flashcards.filter(c => {
    const matchSearch =
      c.korean.includes(search) ||
      c.english.toLowerCase().includes(search.toLowerCase()) ||
      (c.note && c.note.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === 'all' || c.category === filterCat;
    return matchSearch && matchCat;
  });

  const usedCategories = [...new Set(data.flashcards.map(c => c.category).filter(Boolean))] as string[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">📚 Flashcards</h1>
        <span className="text-sm text-muted-foreground">{data.flashcards.length} cards</span>
      </div>

      {/* Search, Add & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-8 soft-inset border-none bg-background"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <button
          onClick={() => navigate(`/cards/new${search ? `?q=${encodeURIComponent(search)}` : ''}`)}
          className="soft-btn bg-primary text-primary-foreground h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          aria-label="Add card"
        >
          <Plus className="h-5 w-5" />
        </button>
        {usedCategories.length > 0 && (
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-32 soft-inset border-none bg-background">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {usedCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Card List */}
      {filtered.length === 0 ? (
        <div className="soft-card p-8 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-muted-foreground font-medium">No flashcards yet</p>
          <Link
            to={`/cards/new${search ? `?q=${encodeURIComponent(search)}` : ''}`}
            className="inline-block mt-3 soft-btn bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium"
          >
            Create your first card
          </Link>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {filtered.map((card, i) => {
              const total = card.correctCount + card.incorrectCount;
              const acc = total > 0 ? Math.round((card.correctCount / total) * 100) : null;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: i * 0.03 }}
                  className="soft-card p-4 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{card.korean}</p>
                    <p className="text-sm text-muted-foreground truncate">{card.english}</p>
                    {card.note && (
                      <p className="text-xs text-muted-foreground italic truncate mt-0.5">{card.note}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {card.category && (
                        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-none">
                          {card.category}
                        </Badge>
                      )}
                      {acc !== null && (
                        <span className={`text-[10px] font-bold ${acc >= 70 ? 'text-success' : 'text-destructive'}`}>
                          {acc}% accuracy
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/cards/edit/${card.id}`)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-2 rounded-xl hover:bg-destructive/10 transition-colors">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{card.korean}"?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently remove this flashcard and its stats.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteFlashcard(card.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
