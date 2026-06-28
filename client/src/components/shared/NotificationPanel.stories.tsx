import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { NotificationPanel } from './NotificationPanel';
import type { AppNotification } from '@/types';

const now = new Date().toISOString();

const sampleNotifications: AppNotification[] = [
  {
    id: 'assigned:task-001',
    type: 'assigned',
    taskId: 'task-001',
    taskTitle: 'Redesign User Profile Page',
    message: 'You\'ve been assigned to "Redesign User Profile Page"',
    read: false,
    createdAt: now,
  },
  {
    id: 'due_today:task-002',
    type: 'due_today',
    taskId: 'task-002',
    taskTitle: 'Fix authentication bug in login flow',
    message: '"Fix authentication bug in login flow" is due today',
    read: false,
    createdAt: now,
  },
  {
    id: 'assigned:task-003',
    type: 'assigned',
    taskId: 'task-003',
    taskTitle: 'Update API documentation',
    message: 'You\'ve been assigned to "Update API documentation"',
    read: true,
    createdAt: now,
  },
];

const meta: Meta<typeof NotificationPanel> = {
  title: 'Shared/NotificationPanel',
  component: NotificationPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="relative h-[500px] w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    open: true,
    onClose: fn(),
    onMarkAllRead: fn(),
    onMarkRead: fn(),
    onNotificationClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NotificationPanel>;

export const WithNotifications: Story = {
  name: 'With notifications (2 unread)',
  args: {
    notifications: sampleNotifications,
    unreadCount: 2,
    loading: false,
  },
};

export const AllRead: Story = {
  name: 'All read',
  args: {
    notifications: sampleNotifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
    loading: false,
  },
};

export const Empty: Story = {
  name: 'Empty state',
  args: {
    notifications: [],
    unreadCount: 0,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    notifications: [],
    unreadCount: 0,
    loading: true,
  },
};

export const ManyNotifications: Story = {
  name: 'Many notifications',
  args: {
    notifications: [
      ...sampleNotifications,
      {
        id: 'due_today:task-004',
        type: 'due_today',
        taskId: 'task-004',
        taskTitle: 'Complete quarterly report',
        message: '"Complete quarterly report" is due today',
        read: false,
        createdAt: now,
      },
      {
        id: 'assigned:task-005',
        type: 'assigned',
        taskId: 'task-005',
        taskTitle: 'Deploy staging environment',
        message: 'You\'ve been assigned to "Deploy staging environment"',
        read: true,
        createdAt: now,
      },
    ],
    unreadCount: 3,
    loading: false,
  },
};
