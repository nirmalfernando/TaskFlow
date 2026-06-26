import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { Home, FileText, Bell, BarChart2 } from 'lucide-react';
import { Sidebar, DEFAULT_NAV_ITEMS } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
  args: {
    onNavChange: fn(),
    onLogout: fn(),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const defaultUser = {
  name: 'John Doe',
  role: 'Admin',
};

export const Default: Story = {
  args: {
    activeNav: 'dashboard',
    user: defaultUser,
  },
};

export const TasksActive: Story = {
  args: {
    activeNav: 'tasks',
    user: defaultUser,
  },
};

export const UsersActive: Story = {
  args: {
    activeNav: 'users',
    user: defaultUser,
  },
};

export const SettingsActive: Story = {
  args: {
    activeNav: 'settings',
    user: defaultUser,
  },
};

export const WithAvatarImage: Story = {
  args: {
    activeNav: 'dashboard',
    user: {
      name: 'Alice Johnson',
      role: 'Member',
      avatarSrc: 'https://i.pravatar.cc/150?img=47',
    },
  },
};

export const NoUser: Story = {
  args: {
    activeNav: 'dashboard',
  },
};

export const CustomNavItems: Story = {
  args: {
    navItems: [
      { key: 'home', label: 'Home', icon: <Home className="h-[18px] w-[18px]" /> },
      {
        key: 'reports',
        label: 'Reports',
        icon: <BarChart2 className="h-[18px] w-[18px]" />,
        badge: 3,
      },
      { key: 'docs', label: 'Docs', icon: <FileText className="h-[18px] w-[18px]" /> },
      {
        key: 'alerts',
        label: 'Alerts',
        icon: <Bell className="h-[18px] w-[18px]" />,
        badge: 'New',
      },
    ],
    activeNav: 'home',
    user: defaultUser,
  },
};

export const AllNavActive: Story = {
  name: 'All Nav Items (Showcase)',
  render: () => (
    <div className="flex h-screen">
      {DEFAULT_NAV_ITEMS.map((item) => (
        <Sidebar
          key={item.key}
          activeNav={item.key}
          user={defaultUser}
          onNavChange={fn()}
          onLogout={fn()}
        />
      ))}
    </div>
  ),
};
