import { Users, Shield, Activity, UserPlus } from 'lucide-react';
import { RoleBadge, type UserRole } from '@/components/shared/RoleBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  avatarColor: string;
  role: UserRole;
  taskCount: number;
  joined: string;
  status: 'active' | 'inactive';
  isCurrentUser?: boolean;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const USERS: TeamUser[] = [
  {
    id: '1',
    name: 'John Doe',
    initials: 'JD',
    email: 'john@taskflow.io',
    avatarColor: '#3b82f6',
    role: 'admin',
    taskCount: 12,
    joined: 'Jan 10, 2024',
    status: 'active',
    isCurrentUser: true,
  },
  {
    id: '2',
    name: 'Sarah Reynolds',
    initials: 'SR',
    email: 'sarah@taskflow.io',
    avatarColor: '#8b5cf6',
    role: 'admin',
    taskCount: 24,
    joined: 'Feb 15, 2024',
    status: 'active',
  },
  {
    id: '3',
    name: 'Alex Mitchell',
    initials: 'AM',
    email: 'alex@taskflow.io',
    avatarColor: '#22c55e',
    role: 'user',
    taskCount: 18,
    joined: 'Mar 20, 2024',
    status: 'active',
  },
  {
    id: '4',
    name: 'Kim Lee',
    initials: 'KL',
    email: 'kim@taskflow.io',
    avatarColor: '#f59e0b',
    role: 'user',
    taskCount: 9,
    joined: 'Apr 5, 2024',
    status: 'active',
  },
  {
    id: '5',
    name: 'Marcus Chen',
    initials: 'MC',
    email: 'marcus@taskflow.io',
    avatarColor: '#ef4444',
    role: 'user',
    taskCount: 7,
    joined: 'May 12, 2024',
    status: 'active',
  },
  {
    id: '6',
    name: 'Priya Sharma',
    initials: 'PS',
    email: 'priya@taskflow.io',
    avatarColor: '#10b981',
    role: 'user',
    taskCount: 15,
    joined: '3d ago',
    status: 'active',
  },
  {
    id: '7',
    name: 'Derek Walsh',
    initials: 'DW',
    email: 'derek@taskflow.io',
    avatarColor: '#94a3b8',
    role: 'user',
    taskCount: 3,
    joined: '24d ago',
    status: 'inactive',
  },
  {
    id: '8',
    name: 'Olivia Park',
    initials: 'OP',
    email: 'olivia@taskflow.io',
    avatarColor: '#ec4899',
    role: 'user',
    taskCount: 11,
    joined: 'Jul 18, 2024',
    status: 'active',
  },
];

const TOTAL = USERS.length;
const ADMIN_COUNT = USERS.filter((u) => u.role === 'admin').length;
const ACTIVE_COUNT = USERS.filter((u) => u.status === 'active').length;

// ─── AdminUsersPage ───────────────────────────────────────────────────────────

export function AdminUsersPage() {
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
            {TOTAL} users
          </span>
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-nav bg-primary px-4 text-sm font-medium text-white shadow-[0px_1px_1.5px_rgba(43,127,255,0.2),0px_1px_1px_rgba(43,127,255,0.2)] transition-colors hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Add User
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
            <p className="text-2xl font-bold text-text-primary">{TOTAL}</p>
            <p className="text-xs font-medium text-text-muted">Total Users</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-card border border-border bg-white p-[17px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f5f3ff]">
            <Shield className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{ADMIN_COUNT}</p>
            <p className="text-xs font-medium text-text-muted">Admins</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-card border border-border bg-white p-[17px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#ecfdf5]">
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{ACTIVE_COUNT}</p>
            <p className="text-xs font-medium text-text-muted">Active This Week</p>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-card border border-border bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.06)]">
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
                Tasks
              </th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                Joined
              </th>
              <th className="py-2.5 pl-4 pr-5 text-left text-[11px] font-semibold uppercase tracking-[0.55px] text-text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((user) => (
              <tr
                key={user.id}
                className="cursor-pointer border-b border-surface transition-colors last:border-0 hover:bg-surface"
              >
                {/* User */}
                <td className="py-3.5 pl-5 pr-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13.68px] font-semibold text-white"
                      style={{ backgroundColor: user.avatarColor }}
                    >
                      {user.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-text-primary">{user.name}</span>
                        {user.isCurrentUser && (
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
                  <RoleBadge role={user.role} />
                </td>

                {/* Tasks */}
                <td className="px-4 py-3.5">
                  <span className="text-sm font-semibold text-text-dark">{user.taskCount}</span>
                  <span className="ml-1.5 text-xs text-text-placeholder">tasks</span>
                </td>

                {/* Joined */}
                <td className="px-4 py-3.5 text-sm text-text-muted">{user.joined}</td>

                {/* Status */}
                <td className="py-3.5 pl-4 pr-5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: user.status === 'active' ? '#00bc7d' : '#d1d5dc',
                      }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: user.status === 'active' ? '#009966' : '#99a1af',
                      }}
                    >
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
