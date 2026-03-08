import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { FLASHCARD_FIELD_LIMITS, flashcardInputSchema } from '@/lib/flashcardSanitize';

const hasHangul = (str: string) => /[\u3131-\uD79D]/.test(str);

export default function FlashcardForm() {
  const { data, addFlashcard, updateFlashcard, addCategory } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const existing = id ? data.flashcards.find(c => c.id === id) : null;

  const q = (!isEdit && searchParams.get('q')) || '';
  const [korean, setKorean] = useState(existing?.korean || (hasHangul(q) ? q : ''));
  const [english, setEnglish] = useState(existing?.english || (!hasHangul(q) ? q : ''));
  const [category, setCategory] = useState(existing?.category || '');
  const [note, setNote] = useState(existing?.note || '');
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const koreanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    koreanRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (isSaving) return;

    const rawCategory = category === '__new__'
      ? newCategory
      : category === 'none'
        ? ''
        : category;
    const validationResult = flashcardInputSchema.safeParse({
      korean,
      english,
      category: rawCategory,
      note,
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0]?.message ?? 'Please check your inputs and try again');
      return;
    }

    setIsSaving(true);

    const sanitizedCard = validationResult.data;
    if (category === '__new__' && sanitizedCard.category) {
      addCategory(sanitizedCard.category);
    }

    try {
      if (isEdit && id) {
        await updateFlashcard(id, sanitizedCard);
        toast.success('Card updated! ✏️');
      } else {
        await addFlashcard(sanitizedCard);
        toast.success('Card created! 🎉');
      }
      navigate('/cards');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[FlashcardForm] Save failed:', JSON.stringify(error));
      }
      toast.error('Failed to save card — please try again');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="soft-btn p-2 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-display font-bold flex items-center gap-2">
          {isEdit ? <><Pencil className="h-5 w-5 text-[#F0B429]" /> Edit Card</> : '➕ New Card'}
        </h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Korean Field */}
        <div className="space-y-2">
          <Label className="font-display font-bold text-sm">Korean</Label>
          <Input
            ref={koreanRef}
            value={korean}
            onChange={e => setKorean(e.target.value)}
            placeholder="한국어 단어..."
            maxLength={FLASHCARD_FIELD_LIMITS.korean}
            className="soft-inset border-none bg-background text-lg"
          />
        </div>

        {/* English Field */}
        <div className="space-y-2">
          <Label className="font-display font-bold text-sm">English</Label>
          <Input
            value={english}
            onChange={e => setEnglish(e.target.value)}
            placeholder="English word..."
            maxLength={FLASHCARD_FIELD_LIMITS.english}
            className="soft-inset border-none bg-background text-lg"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="font-display font-bold text-sm">Category (optional)</Label>
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
              maxLength={FLASHCARD_FIELD_LIMITS.category}
              className="soft-inset border-none bg-background"
            />
          )}
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label className="font-display font-bold text-sm">Note (optional)</Label>
          <div className="relative">
            <Input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a short note..."
              maxLength={FLASHCARD_FIELD_LIMITS.note}
              className="soft-inset border-none bg-background text-lg pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{note.length}/{FLASHCARD_FIELD_LIMITS.note}</span>
          </div>
        </div>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={isSaving}
          className="w-full soft-btn bg-primary text-primary-foreground py-3 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {isSaving ? 'Saving...' : isEdit ? 'Update Card' : 'Save Card'}
        </motion.button>
      </motion.div>
    </div>
  );
}
