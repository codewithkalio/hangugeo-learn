import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { PATTERN_DEFS, PatternGroup } from '@/lib/conjugationData';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GROUP_META: Record<PatternGroup, { label: string; emoji: string }> = {
  early: { label: 'Early', emoji: '🌱' },
  intermediate: { label: 'Intermediate', emoji: '🌿' },
  advanced: { label: 'Advanced', emoji: '🌳' },
};

const GROUPS: PatternGroup[] = ['early', 'intermediate', 'advanced'];

export default function GrammarPatterns() {
  const { data, toggleGrammarPattern } = useApp();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ early: true });

  const enabledKeys = new Set(
    data.grammarPatterns.filter(p => p.enabled).map(p => p.patternKey)
  );

  const toggleGroup = (group: string) =>
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));

  const handleToggle = (key: string, checked: boolean) => {
    toggleGrammarPattern(key, checked);
  };

  return (
    <div className="space-y-3">
      {GROUPS.map(group => {
        const patterns = PATTERN_DEFS.filter(p => p.group === group);
        const enabledCount = patterns.filter(p => enabledKeys.has(p.key)).length;
        const meta = GROUP_META[group];

        return (
          <Collapsible
            key={group}
            open={openGroups[group] ?? false}
            onOpenChange={() => toggleGroup(group)}
          >
            <CollapsibleTrigger className="soft-card p-4 flex items-center gap-3 w-full text-left hover:bg-accent/10 transition-colors">
              <span className="text-lg">{meta.emoji}</span>
              <span className="flex-1 font-display font-bold text-sm">
                {meta.label}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {enabledCount}/{patterns.length}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  openGroups[group] ? 'rotate-180' : ''
                }`}
              />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="soft-inset mx-2 mt-1 mb-2 p-3 space-y-1"
                >
                  {patterns.map(p => (
                    <label
                      key={p.key}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={enabledKeys.has(p.key)}
                        onCheckedChange={(checked) => handleToggle(p.key, !!checked)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{p.label}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{p.korean}</span>
                      </div>
                    </label>
                  ))}
                </motion.div>
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
