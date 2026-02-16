import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function FlashcardForm() {
  const { data, addFlashcard, updateFlashcard, addCategory } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const existing = id ? data.flashcards.find(c => c.id === id) : null;

  const [korean, setKorean] = useState(existing?.korean || '');
  const [english, setEnglish] = useState(existing?.english || '');
  const [category, setCategory] = useState(existing?.category || '');
  const [note, setNote] = useState(existing?.note || '');
  const [newCategory, setNewCategory] = useState('');

  const handleSave = () => {
    if (!korean.trim() || !english.trim()) {
      toast.error('Both fields are required');
      return;
    }

    const finalCategory = category === '__new__' ? newCategory.trim() : category;
    if (category === '__new__' && newCategory.trim()) {
      addCategory(newCategory.trim());
    }

    const finalNote = note.trim() || undefined;

    if (isEdit && id) {
      updateFlashcard(id, { korean: korean.trim(), english: english.trim(), category: finalCategory || undefined, note: finalNote });
      toast.success('Card updated! ✏️');
    } else {
      addFlashcard({ korean: korean.trim(), english: english.trim(), category: finalCategory || undefined, note: finalNote });
      toast.success('Card created! 🎉');
    }

    navigate('/cards');
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="soft-btn p-2 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-display font-bold">
          {isEdit ? '✏️ Edit Card' : '➕ New Card'}
        </h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Korean Field */}
        <div className="space-y-2">
          <Label className="font-display font-bold text-sm">🇰🇷 Korean</Label>
          <Input
            value={korean}
            onChange={e => setKorean(e.target.value)}
            placeholder="한국어 단어..."
            className="soft-inset border-none bg-background text-lg"
          />
        </div>

        {/* English Field */}
        <div className="space-y-2">
          <Label className="font-display font-bold text-sm">🇺🇸 English</Label>
          <Input
            value={english}
            onChange={e => setEnglish(e.target.value)}
            placeholder="English word..."
            className="soft-inset border-none bg-background text-lg"
          />
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label className="font-display font-bold text-sm">📝 Note (optional)</Label>
          <div className="relative">
            <Input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a short note..."
              maxLength={65}
              className="soft-inset border-none bg-background text-lg pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{note.length}/65</span>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="font-display font-bold text-sm">📁 Category (optional)</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="soft-inset border-none bg-background">
              <SelectValue placeholder="Choose category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {data.categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
              <SelectItem value="__new__">+ New category</SelectItem>
            </SelectContent>
          </Select>
          {category === '__new__' && (
            <Input
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Category name..."
              className="soft-inset border-none bg-background"
            />
          )}
        </div>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full soft-btn bg-primary text-primary-foreground py-3 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2"
        >
          <Save className="h-5 w-5" />
          {isEdit ? 'Update Card' : 'Save Card'}
        </motion.button>
      </motion.div>
    </div>
  );
}
