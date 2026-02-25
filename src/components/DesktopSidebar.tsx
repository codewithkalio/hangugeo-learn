import { NavLink, useLocation } from 'react-router-dom';
import { Home, Copy, Zap, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/cards', icon: Copy, label: 'Flashcards' },
  { to: '/drill', icon: Zap, label: 'Drill' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function DesktopSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

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
      {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm md:text-base font-medium',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-3 py-4 space-y-3">
        {user && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 min-w-0">
              {user.user_metadata?.full_name && (
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.user_metadata.full_name}</p>
              )}
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
