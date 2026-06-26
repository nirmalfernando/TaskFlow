import { Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserRole = 'admin' | 'user';

export interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const config: Record<UserRole, { bg: string; text: string; icon: React.ElementType }> = {
  admin: { bg: 'bg-[#ede9fe]', text: 'text-[#5d0ec0]', icon: Shield },
  user: { bg: 'bg-[#dbeafe]', text: 'text-[#193cb8]', icon: User },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const { bg, text, icon: Icon } = config[role];

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1', bg, className)}
    >
      <Icon className={cn('h-3 w-3', text)} />
      <span className={cn('text-[11px] font-semibold uppercase tracking-[0.04em]', text)}>
        {role}
      </span>
    </span>
  );
}
