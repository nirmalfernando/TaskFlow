import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Search,
  Shield,
  UserPlus,
  Users,
  X,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { RoleBadge, type UserRole } from '@/components/shared/RoleBadge';
import * as userService from '@/services/user.service';
import type { AdminUser } from '@/services/user.service';
import type { Role } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toRoleBadge(role: Role): UserRole {
  return role === 'ADMIN' ? 'admin' : 'user';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: AdminUser) => void;
}

function InviteModal({ open, onClose, onSuccess }: InviteModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password));
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    allRulesPassed;

  function reset() {
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('USER');
    setPassword('');
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    setError('');
    setSaving(true);
    try {
      const user = await userService.inviteUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
        temporaryPassword: password,
      });
      onSuccess(user);
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to invite user.';
      setError(
        msg.includes('409') || msg.toLowerCase().includes('exist')
          ? 'A user with this email already exists.'
          : 'Failed to invite user. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-[480px] rounded-[20px] border border-border bg-white shadow-[0px_24px_64px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#dbeafe]">
            <UserPlus className="h-[18px] w-[18px] text-primary" />
          </div>
          <h2 className="flex-1 text-base font-semibold text-text-primary">Invite New User</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-text-placeholder transition-colors hover:text-text-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-label" htmlFor="inv-first">
                First Name
              </label>
              <input
                id="inv-first"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="h-11 rounded-input border border-input bg-white px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-label" htmlFor="inv-last">
                Last Name
              </label>
              <input
                id="inv-last"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="h-11 rounded-input border border-input bg-white px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-label" htmlFor="inv-email">
              Email Address
            </label>
            <input
              id="inv-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className="h-11 rounded-input border border-input bg-white px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-label" htmlFor="inv-role">
              Role
            </label>
            <div className="relative">
              <select
                id="inv-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-11 w-full appearance-none rounded-input border border-input bg-white px-3.5 pr-10 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
            </div>
          </div>

          {/* Temporary password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-label" htmlFor="inv-pw">
              Temporary Password
            </label>
            <div className="relative">
              <input
                id="inv-pw"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, upper, lower, number"
                className="h-11 w-full rounded-input border border-input bg-white px-3.5 pr-11 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-placeholder hover:text-text-muted"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Inline rules */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                {PASSWORD_RULES.map((rule) => (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        'flex h-3.5 w-3.5 items-center justify-center rounded-full',
                        rule.test(password) ? 'bg-emerald-500' : 'bg-border',
                      )}
                    >
                      {rule.test(password) && <Check className="h-2 w-2 stroke-[3] text-white" />}
                    </div>
                    <span
                      className={cn(
                        'text-[11px]',
                        rule.test(password) ? 'text-emerald-600' : 'text-text-placeholder',
                      )}
                    >
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 rounded-nav border border-input px-5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving || !canSubmit}
            className="flex h-9 items-center gap-1.5 rounded-nav bg-primary px-5 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2)] transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Inviting…
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                Send Invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row action menu ──────────────────────────────────────────────────────────

function RowMenu({
  user,
  currentUserId,
  onRoleChange,
  onToggleActive,
}: {
  user: AdminUser;
  currentUserId: string;
  onRoleChange: (u: AdminUser, role: Role) => void;
  onToggleActive: (u: AdminUser) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isSelf = user.id === currentUserId;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-nav text-text-placeholder transition-colors hover:bg-surface hover:text-text-muted"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 min-w-[170px] rounded-card border border-border bg-white py-1.5 shadow-[0px_8px_24px_rgba(0,0,0,0.1)]">
          {!isSelf && (
            <>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.55px] text-text-placeholder">
                Change Role
              </p>
              {(['ADMIN', 'USER'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    onRoleChange(user, r);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-surface',
                    user.role === r ? 'font-semibold text-primary' : 'text-text-secondary',
                  )}
                >
                  {r === 'ADMIN' ? (
                    <Shield className="h-3.5 w-3.5" />
                  ) : (
                    <Users className="h-3.5 w-3.5" />
                  )}
                  {r === 'ADMIN' ? 'Admin' : 'User'}
                  {user.role === r && <Check className="ml-auto h-3.5 w-3.5" />}
                </button>
              ))}
              <div className="my-1.5 border-t border-border" />
              <button
                type="button"
                onClick={() => {
                  onToggleActive(user);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-surface',
                  user.isActive ? 'text-red-500' : 'text-emerald-600',
                )}
              >
                <Activity className="h-3.5 w-3.5" />
                {user.isActive ? 'Deactivate' : 'Reactivate'}
              </button>
            </>
          )}
          {isSelf && (
            <p className="px-3 py-2 text-xs text-text-placeholder">No actions for your account</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AdminUsersPage ───────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    void fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await userService.getUsers({ limit: 100 });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const activeCount = users.filter((u) => u.isActive).length;

  function handleInviteSuccess(newUser: AdminUser) {
    setUsers((prev) => [newUser, ...prev]);
  }

  async function handleRoleChange(target: AdminUser, role: Role) {
    setActionLoading(target.id);
    try {
      const updated = await userService.updateUserRole(target.id, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleActive(target: AdminUser) {
    setActionLoading(target.id);
    try {
      if (target.isActive) {
        await userService.deactivateUser(target.id);
      } else {
        await userService.reactivateUser(target.id);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, isActive: !u.isActive } : u)),
      );
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.6px] text-text-primary">
            User Management
          </h1>
          <p className="mt-1 text-sm text-text-muted">Manage team members and their roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-[7px] text-sm font-medium text-text-muted">
            <Users className="h-3.5 w-3.5" />
            {totalCount} users
          </span>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-nav bg-primary px-4 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2),0px_1px_1px_rgba(43,127,255,0.2)] transition-colors hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Invite User
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-card border border-border bg-white p-[17px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eff6ff]">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{totalCount}</p>
            <p className="text-xs font-medium text-text-muted">Total Users</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-card border border-border bg-white p-[17px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f5f3ff]">
            <Shield className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{adminCount}</p>
            <p className="text-xs font-medium text-text-muted">Admins</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-card border border-border bg-white p-[17px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#ecfdf5]">
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{activeCount}</p>
            <p className="text-xs font-medium text-text-muted">Active</p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="h-10 w-full rounded-input border border-input bg-white pl-10 pr-4 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-placeholder hover:text-text-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-card border border-border bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.06)]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-text-placeholder" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-border" />
            <p className="text-sm font-medium text-text-muted">
              {search ? 'No users match your search.' : 'No users yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="py-2.5 pl-5 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  User
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Role
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Joined
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Status
                </th>
                <th className="py-2.5 pl-4 pr-5 text-right text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isSelf = user.id === me?.id;
                const isLoading = actionLoading === user.id;
                const fullName = `${user.firstName} ${user.lastName}`;

                return (
                  <tr
                    key={user.id}
                    className={cn(
                      'border-b border-surface transition-colors last:border-0',
                      isLoading ? 'opacity-60' : 'hover:bg-surface',
                    )}
                  >
                    {/* User */}
                    <td className="py-3.5 pl-5 pr-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={fullName}
                          src={user.avatarUrl ?? undefined}
                          size="md"
                          className="!h-9 !w-9 !text-[13.68px]"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-text-primary">
                              {fullName}
                            </span>
                            {isSelf && (
                              <span className="rounded-full border border-[rgba(190,219,255,0.5)] bg-[#eff6ff] px-[7px] py-[3px] text-[10px] font-semibold text-primary">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-placeholder">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <RoleBadge role={toRoleBadge(user.role)} />
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3.5 text-sm text-text-muted">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: user.isActive ? '#00bc7d' : '#d1d5dc' }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: user.isActive ? '#009966' : '#99a1af' }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-4 pr-5">
                      <div className="flex justify-end">
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-text-placeholder" />
                        ) : (
                          <RowMenu
                            user={user}
                            currentUserId={me?.id ?? ''}
                            onRoleChange={(u, r) => void handleRoleChange(u, r)}
                            onToggleActive={(u) => void handleToggleActive(u)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}
