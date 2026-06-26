import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TopBar } from './TopBar';

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
    onThemeToggle: fn(),
    onNotifications: fn(),
    onProfileClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TopBar>;

// Matches Figma node 3:136 — Dashboard TopBar with search
export const WithSearch: Story = {
  name: 'With Search (Dashboard)',
  args: {
    onSearch: fn(),
    searchPlaceholder: 'Search tasks…',
    hasNotification: true,
  },
};

// Matches Figma node 6:443 — Tasks page TopBar with title
export const WithTitle: Story = {
  name: 'With Title (Tasks Page)',
  args: {
    title: 'Tasks',
    hasNotification: true,
  },
};

export const TitleVariants: Story = {
  render: (args) => (
    <div className="flex flex-col">
      <TopBar {...args} title="Dashboard" />
      <TopBar {...args} title="Tasks" />
      <TopBar {...args} title="Team" />
      <TopBar {...args} title="Settings" />
    </div>
  ),
  args: { hasNotification: false },
};

export const WithNotificationBadge: Story = {
  args: {
    title: 'Dashboard',
    hasNotification: true,
  },
};

export const NoNotification: Story = {
  args: {
    title: 'Dashboard',
    hasNotification: false,
  },
};

export const WithAvatarImage: Story = {
  args: {
    title: 'Dashboard',
    hasNotification: true,
    user: {
      name: 'Alice Johnson',
      avatarSrc: 'https://i.pravatar.cc/150?img=47',
    },
  },
};

// Shows the full app shell — Sidebar + TopBar together
export const InAppShell: Story = {
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <aside className="w-64 border-r border-border bg-white" />
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
    hasNotification: true,
  },
};
