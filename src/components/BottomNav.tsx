import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Zap, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/cards', icon: BookOpen, label: 'Cards' },
  { to: '/drill', icon: Zap, label: 'Drill' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-3 mb-3 flex items-center justify-around rounded-2xl bg-card py-2 px-1" style={{ boxShadow: 'var(--soft-shadow)' }}>
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-medium',
                active
                  ? 'bg-primary text-primary-foreground scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={signOut}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Out</span>
        </button>
      </div>
    </nav>
  );
}
