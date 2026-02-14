import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Stats from './Stats';

export default function Profile() {
  const { user, signOut } = useAuth();

  const name = user?.user_metadata?.full_name || '';
  const email = user?.email || '';
  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">👤 Profile</h1>

      <div className="soft-card p-5 flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {name && <p className="font-display font-bold text-base truncate">{name}</p>}
          <p className="text-sm text-muted-foreground truncate">{email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <Stats />
    </div>
  );
}
