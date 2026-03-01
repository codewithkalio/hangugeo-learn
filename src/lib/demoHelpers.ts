import { supabase } from '@/integrations/supabase/client';
import { DEMO_CATEGORIES, DEMO_WORDS } from './demoSeedData';
import type { User } from '@supabase/supabase-js';

export function isDemoUser(user: User | null): boolean {
  return !!user && !!(user as any).is_anonymous;
}

export async function seedDemoCards(userId: string): Promise<void> {
  // Insert categories
  const categoryRows = DEMO_CATEGORIES.map(name => ({ user_id: userId, name }));
  const { error: catErr } = await supabase.from('categories').insert(categoryRows as any);
  if (catErr && catErr.code !== '23505') throw catErr; // ignore duplicates

  // Insert flashcards
  const flashcardRows = DEMO_WORDS.map(w => ({
    user_id: userId,
    korean: w.korean,
    english: w.english,
    category: w.category,
    note: w.note,
  }));
  const { error: cardErr } = await supabase.from('flashcards').insert(flashcardRows as any);
  if (cardErr) throw cardErr;
}

export async function resetDemo(userId: string): Promise<void> {
  // Delete all user data
  await supabase.from('drill_results').delete().eq('user_id', userId);
  await supabase.from('flashcards').delete().eq('user_id', userId);
  await supabase.from('categories').delete().eq('user_id', userId);

  // Re-seed
  await seedDemoCards(userId);
}
