import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { NotificationItem } from './NotificationItem';
import type { AppNotification } from '@/types';

const assignedNotification: AppNotification = {
  id: 'assigned:task-001',
  type: 'assigned',
  taskId: 'task-001',
  taskTitle: 'Redesign User Profile Page',
  message: 'You\'ve been assigned to "Redesign User Profile Page"',
  read: false,
  createdAt: new Date().toISOString(),
};

const dueTodayNotification: AppNotification = {
  id: 'due_today:task-002',
  type: 'due_today',
  taskId: 'task-002',
  taskTitle: 'Fix authentication bug in login flow',
  message: '"Fix authentication bug in login flow" is due today',
  read: false,
  createdAt: new Date().toISOString(),
};

const readNotification: AppNotification = {
  ...assignedNotification,
  id: 'assigned:task-003',
  taskTitle: 'Update API documentation',
  message: 'You\'ve been assigned to "Update API documentation"',
  read: true,
};

const meta: Meta<typeof NotificationItem> = {
  title: 'Shared/NotificationItem',
  component: NotificationItem,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm overflow-hidden rounded-[12px] border border-border bg-card">
        <Story />
      </div>
    ),
  ],
  args: {
    onRead: fn(),
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NotificationItem>;

export const AssignedUnread: Story = {
  name: 'Assigned — Unread',
  args: { notification: assignedNotification },
};

export const DueTodayUnread: Story = {
  name: 'Due Today — Unread',
  args: { notification: dueTodayNotification },
};

export const Read: Story = {
  args: { notification: readNotification },
};

export const AllVariants: Story = {
  name: 'All variants',
  render: (args) => (
    <div className="overflow-hidden rounded-[12px] border border-border bg-card divide-y divide-border">
      <NotificationItem {...args} notification={assignedNotification} />
      <NotificationItem {...args} notification={dueTodayNotification} />
      <NotificationItem {...args} notification={readNotification} />
    </div>
  ),
  parameters: { layout: 'padded' },
  decorators: [],
};
