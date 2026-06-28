import type { Meta, StoryObj } from '@storybook/react';
import { Users, Shield, Activity } from 'lucide-react';
import { AdminStatCard } from './AdminStatCard';

const meta: Meta<typeof AdminStatCard> = {
  title: 'Features/Admin/AdminStatCard',
  component: AdminStatCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AdminStatCard>;

// Matches Figma node 10:1745 — Total Users card
export const TotalUsers: Story = {
  args: {
    value: 8,
    label: 'Total Users',
    icon: <Users className="h-5 w-5 text-primary" />,
    iconBg: 'bg-primary-light',
  },
};

// Matches Figma node 10:1745 — Admins card
export const Admins: Story = {
  args: {
    value: 2,
    label: 'Admins',
    icon: <Shield className="h-5 w-5 text-violet-600" />,
    iconBg: 'bg-violet-50',
  },
};

// Matches Figma node 10:1745 — Active This Week card
export const ActiveThisWeek: Story = {
  args: {
    value: 7,
    label: 'Active This Week',
    icon: <Activity className="h-5 w-5 text-emerald-600" />,
    iconBg: 'bg-emerald-50',
  },
};

// All three cards in a responsive grid — matches the admin page header
export const AdminPageHeader: Story = {
  decorators: [
    (Story) => (
      <div className="w-[900px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <AdminStatCard
        value={8}
        label="Total Users"
        icon={<Users className="h-5 w-5 text-primary" />}
        iconBg="bg-primary-light"
      />
      <AdminStatCard
        value={2}
        label="Admins"
        icon={<Shield className="h-5 w-5 text-violet-600" />}
        iconBg="bg-violet-50"
      />
      <AdminStatCard
        value={7}
        label="Active This Week"
        icon={<Activity className="h-5 w-5 text-emerald-600" />}
        iconBg="bg-emerald-50"
      />
    </div>
  ),
};
