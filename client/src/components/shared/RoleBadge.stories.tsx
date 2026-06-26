import type { Meta, StoryObj } from '@storybook/react';
import { RoleBadge } from './RoleBadge';

const meta: Meta<typeof RoleBadge> = {
  title: 'Shared/RoleBadge',
  component: RoleBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof RoleBadge>;

export const Admin: Story = {
  args: { role: 'admin' },
};

export const User: Story = {
  args: { role: 'user' },
};

export const BothVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <RoleBadge role="admin" />
      <RoleBadge role="user" />
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between rounded-card border border-border bg-white p-4">
        <span className="text-sm font-medium text-text-primary">John Doe</span>
        <RoleBadge role="admin" />
      </div>
      <div className="flex items-center justify-between rounded-card border border-border bg-white p-4">
        <span className="text-sm font-medium text-text-primary">Sarah Reynolds</span>
        <RoleBadge role="admin" />
      </div>
      <div className="flex items-center justify-between rounded-card border border-border bg-white p-4">
        <span className="text-sm font-medium text-text-primary">Alex Mitchell</span>
        <RoleBadge role="user" />
      </div>
    </div>
  ),
};
