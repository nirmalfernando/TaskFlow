import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TopBar } from './TopBar';
import type { AppNotification } from '@/types';

const sampleNotifications: AppNotification[] = [
  {
    id: 'assigned:task-1',
    type: 'assigned',
    taskId: 'task-1',
    taskTitle: 'Implement dark mode',
    message: 'You\'ve been assigned to "Implement dark mode"',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'due_today:task-2',
    type: 'due_today',
    taskId: 'task-2',
    taskTitle: 'Ship v2 release',
    message: '"Ship v2 release" is due today',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'assigned:task-3',
    type: 'assigned',
    taskId: 'task-3',
    taskTitle: 'Update documentation',
    message: 'You\'ve been assigned to "Update documentation"',
    read: true,
    createdAt: new Date().toISOString(),
  },
];

const meta: Meta<typeof TopBar> = {
  title: 'Layout/TopBar',
  component: TopBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="w-full bg-surface">
        <Story />
      </div>
    ),
  ],
  args: {
    user: { name: 'John Doe' },
    onProfileClick: fn(),
    onMarkAllRead: fn(),
    onMarkRead: fn(),
    onNotificationClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TopBar>;

export const WithSearch: Story = {
  name: 'With Search (Dashboard)',
  args: {
    onSearch: fn(),
    searchPlaceholder: 'Search tasks…',
    notifications: sampleNotifications,
    unreadCount: 2,
  },
};

export const WithTitle: Story = {
  name: 'With Title (Tasks Page)',
  args: {
    title: 'Tasks',
    notifications: sampleNotifications,
    unreadCount: 2,
  },
};

export const NoNotifications: Story = {
  args: {
    title: 'Dashboard',
    notifications: [],
    unreadCount: 0,
  },
};

export const WithAvatarImage: Story = {
  args: {
    title: 'Dashboard',
    notifications: sampleNotifications,
    unreadCount: 2,
    user: {
      name: 'Alice Johnson',
      avatarSrc: 'https://i.pravatar.cc/150?img=47',
    },
  },
};

export const InAppShell: Story = {
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <aside className="w-64 border-r border-border bg-card" />
        <div className="flex flex-1 flex-col">
          <Story />
          <main className="flex-1 bg-surface p-6">
            <p className="text-sm text-text-muted">Page content goes here</p>
          </main>
        </div>
      </div>
    ),
  ],
  args: {
    title: 'Tasks',
    notifications: sampleNotifications,
    unreadCount: 2,
  },
};
