import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Zap, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', icon: Home, label: 'Home', emoji: '🏠' },
  { to: '/cards', icon: BookOpen, label: 'Flashcards', emoji: '📚' },
  { to: '/drill', icon: Zap, label: 'Drill', emoji: '⚡' },
  { to: '/stats', icon: BarChart3, label: 'Stats', emoji: '📊' },
  { to: '/ai-quiz', icon: Sparkles, label: 'AI Quiz', emoji: '🤖' },
];

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground p-4 gap-2">
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <span className="text-3xl">🇰🇷</span>
        <div>
          <h1 className="text-lg font-display font-bold text-sidebar-foreground">HanGeul</h1>
          <p className="text-xs text-sidebar-foreground/60">Korean Learning</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, icon: Icon, label, emoji }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-3 py-4">
        <div className="soft-card p-3 bg-sidebar-accent/30 rounded-xl">
          <p className="text-xs text-sidebar-foreground/60 font-medium">💡 Tip of the day</p>
          <p className="text-xs text-sidebar-foreground/80 mt-1">Practice 10 cards daily to build lasting memory!</p>
        </div>
      </div>
    </aside>
  );
}
