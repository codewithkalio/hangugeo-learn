import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/hooks/useAppData';
import { useQueryClient } from '@tanstack/react-query';
import { parseCsv, csvRowSchema, SanitizedCsvRow } from '@/lib/csvSanitize';
import { isDemoUser } from '@/lib/demoHelpers';
import { Upload } from 'lucide-react';

interface CsvImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParseResult {
  valid: SanitizedCsvRow[];
  skippedCount: number;
  duplicates: { csvRow: SanitizedCsvRow; existingId: string }[];
  newRows: SanitizedCsvRow[];
}

export default function CsvImport({ open, onOpenChange }: CsvImportProps) {
  const { user } = useAuth();
  const { data, addCategory } = useAppData();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<'keep-original' | 'keep-csv'>('keep-original');
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (open && user && isDemoUser(user)) {
      onOpenChange(false);
      toast({ title: 'Import CSV is disabled in demo mode.', variant: 'destructive' });
    }
  }, [open, user, onOpenChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? '');
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rawRows = parseCsv(text);

      // Validate headers
      if (rawRows.length > 0) {
        const keys = Object.keys(rawRows[0]);
        if (!keys.includes('korean') || !keys.includes('english')) {
          toast({ title: 'Invalid CSV', description: 'CSV must have "korean" and "english" columns.', variant: 'destructive' });
          setParseResult(null);
          return;
        }
      }

      // Sanitize & validate each row
      const valid: SanitizedCsvRow[] = [];
      let skippedCount = 0;
      for (const raw of rawRows) {
        const result = csvRowSchema.safeParse(raw);
        if (result.success) {
          valid.push(result.data);
        } else {
          skippedCount++;
        }
      }

      // Detect duplicates
      const duplicates: ParseResult['duplicates'] = [];
      const newRows: SanitizedCsvRow[] = [];
      for (const row of valid) {
        const existing = data.flashcards.find(
          f => f.korean === row.korean && f.english === row.english
        );
        if (existing) {
          duplicates.push({ csvRow: row, existingId: existing.id });
        } else {
          newRows.push(row);
        }
      }

      setParseResult({ valid, skippedCount, duplicates, newRows });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parseResult || !user) return;
    if (isDemoUser(user)) {
      toast({ title: 'Import CSV is disabled in demo mode.', variant: 'destructive' });
      return;
    }
    setImporting(true);

    try {
      // Seed new categories
      const existingCats = new Set(data.categories);
      const newCats = new Set<string>();
      for (const row of [...parseResult.newRows, ...parseResult.duplicates.map(d => d.csvRow)]) {
        if (row.category && !existingCats.has(row.category) && !newCats.has(row.category)) {
          newCats.add(row.category);
          addCategory(row.category);
        }
      }

      // Insert new rows
      if (parseResult.newRows.length > 0) {
        const insertRows = parseResult.newRows.map(r => ({
          user_id: user.id,
          korean: r.korean,
          english: r.english,
          category: r.category ?? null,
          note: r.note ?? null,
        }));
        const { error } = await supabase.from('flashcards').insert(insertRows);
        if (error) throw error;
      }

      // Handle duplicates
      let updatedCount = 0;
      if (duplicateMode === 'keep-csv' && parseResult.duplicates.length > 0) {
        for (const dup of parseResult.duplicates) {
          const { error } = await supabase
            .from('flashcards')
            .update({ category: dup.csvRow.category ?? null, note: dup.csvRow.note ?? null })
            .eq('id', dup.existingId);
          if (error) throw error;
          updatedCount++;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['flashcards', user.id] });

      const skippedDups = duplicateMode === 'keep-original' ? parseResult.duplicates.length : 0;
      toast({
        title: 'Import complete',
        description: `${parseResult.newRows.length} new cards added${updatedCount > 0 ? `, ${updatedCount} updated` : ''}${skippedDups > 0 ? `, ${skippedDups} duplicates skipped` : ''}${parseResult.skippedCount > 0 ? `, ${parseResult.skippedCount} invalid rows skipped` : ''}.`,
      });

      // Reset
      setParseResult(null);
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setParseResult(null);
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[min(100vw-2rem,28rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Flashcards from CSV</DialogTitle>
          <DialogDescription className="break-words min-w-0">
            Upload a CSV file with columns: Korean, English, Category, Note.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 min-w-0">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <Upload className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="sr-only"
              id="csv-file-input"
            />
            <Button
              type="button"
              variant="default"
              onClick={() => fileRef.current?.click()}
              className="shrink-0"
            >
              Choose File
            </Button>
            {fileName && (
              <span className="truncate min-w-0 text-sm text-muted-foreground" title={fileName}>
                {fileName}
              </span>
            )}
          </div>

          {parseResult && (
            <>
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p><strong>{parseResult.newRows.length}</strong> new cards</p>
                <p><strong>{parseResult.duplicates.length}</strong> duplicates found</p>
                {parseResult.skippedCount > 0 && (
                  <p className="text-destructive"><strong>{parseResult.skippedCount}</strong> invalid rows skipped</p>
                )}
              </div>

              {parseResult.duplicates.length > 0 && (
                <div className="space-y-2 min-w-0">
                  <p className="text-sm font-medium break-words">How should we handle duplicates?</p>
                  <RadioGroup value={duplicateMode} onValueChange={(v) => setDuplicateMode(v as any)}>
                    <div className="flex items-center gap-2 min-w-0">
                      <RadioGroupItem value="keep-original" id="keep-original" className="shrink-0" />
                      <Label htmlFor="keep-original" className="text-sm break-words flex-1 min-w-0 cursor-pointer">Keep original (skip CSV duplicates)</Label>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <RadioGroupItem value="keep-csv" id="keep-csv" className="shrink-0" />
                      <Label htmlFor="keep-csv" className="text-sm break-words flex-1 min-w-0 cursor-pointer">Keep CSV version (overwrite category &amp; note)</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={!parseResult || (parseResult.newRows.length === 0 && parseResult.duplicates.length === 0) || importing}
          >
            {importing ? 'Importing…' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
