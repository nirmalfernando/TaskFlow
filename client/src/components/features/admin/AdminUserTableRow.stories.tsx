import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { AdminUserTableRow, AdminUserTableHeader, type AdminUserData } from './AdminUserTableRow';

const meta: Meta<typeof AdminUserTableRow> = {
  title: 'Features/Admin/AdminUserTableRow',
  component: AdminUserTableRow,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-card">
        <table className="w-full border-collapse">
          <AdminUserTableHeader />
          <tbody>
            <Story />
          </tbody>
        </table>
      </div>
    ),
  ],
  args: { onClick: fn(), onMoreActions: fn() },
};

export default meta;
type Story = StoryObj<typeof AdminUserTableRow>;

export const AdminUser: Story = {
  name: 'Admin — Active (current user)',
  args: {
    id: '1',
    name: 'John Doe',
    email: 'john@taskflow.io',
    role: 'admin',
    taskCount: 12,
    joinedDate: 'Jan 10, 2024',
    status: 'active',
    isCurrentUser: true,
  },
};

export const AdminOther: Story = {
  name: 'Admin — Active',
  args: {
    id: '2',
    name: 'Sarah Reynolds',
    email: 'sarah@taskflow.io',
    role: 'admin',
    taskCount: 24,
    joinedDate: 'Feb 15, 2024',
    status: 'active',
  },
};

export const RegularUser: Story = {
  name: 'User — Active',
  args: {
    id: '3',
    name: 'Alex Mitchell',
    email: 'alex@taskflow.io',
    role: 'user',
    taskCount: 18,
    joinedDate: 'Mar 20, 2024',
    status: 'active',
  },
};

export const InactiveUser: Story = {
  name: 'User — Inactive',
  args: {
    id: '7',
    name: 'Derek Walsh',
    email: 'derek@taskflow.io',
    role: 'user',
    taskCount: 3,
    joinedDate: '24d ago',
    status: 'inactive',
  },
};

// Matches Figma node 10:1745 — full user management table
const USERS: AdminUserData[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@taskflow.io',
    role: 'admin',
    taskCount: 12,
    joinedDate: 'Jan 10, 2024',
    status: 'active',
    isCurrentUser: true,
  },
  {
    id: '2',
    name: 'Sarah Reynolds',
    email: 'sarah@taskflow.io',
    role: 'admin',
    taskCount: 24,
    joinedDate: 'Feb 15, 2024',
    status: 'active',
  },
  {
    id: '3',
    name: 'Alex Mitchell',
    email: 'alex@taskflow.io',
    role: 'user',
    taskCount: 18,
    joinedDate: 'Mar 20, 2024',
    status: 'active',
  },
  {
    id: '4',
    name: 'Kim Lee',
    email: 'kim@taskflow.io',
    role: 'user',
    taskCount: 9,
    joinedDate: 'Apr 5, 2024',
    status: 'active',
  },
  {
    id: '5',
    name: 'Marcus Chen',
    email: 'marcus@taskflow.io',
    role: 'user',
    taskCount: 7,
    joinedDate: 'May 12, 2024',
    status: 'active',
  },
  {
    id: '6',
    name: 'Priya Sharma',
    email: 'priya@taskflow.io',
    role: 'user',
    taskCount: 15,
    joinedDate: '3d ago',
    status: 'active',
  },
  {
    id: '7',
    name: 'Derek Walsh',
    email: 'derek@taskflow.io',
    role: 'user',
    taskCount: 3,
    joinedDate: '24d ago',
    status: 'inactive',
  },
  {
    id: '8',
    name: 'Olivia Park',
    email: 'olivia@taskflow.io',
    role: 'user',
    taskCount: 11,
    joinedDate: 'Jul 18, 2024',
    status: 'active',
  },
];

export const FullTable: StoryObj = {
  name: 'Full Table (matches Figma)',
  render: () => (
    <div className="overflow-hidden rounded-card border border-border bg-card shadow-[0px_1px_4px_0px_rgba(0,0,0,0.06)]">
      <table className="w-full border-collapse">
        <AdminUserTableHeader />
        <tbody>
          {USERS.map((user) => (
            <AdminUserTableRow key={user.id} {...user} onClick={fn()} />
          ))}
        </tbody>
      </table>
    </div>
  ),
};
