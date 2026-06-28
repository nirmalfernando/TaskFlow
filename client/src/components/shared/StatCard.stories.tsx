import type { Meta, StoryObj } from '@storybook/react';
import { Layers, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Shared/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

// ─── Individual variants ──────────────────────────────────────────────────────

export const TotalTasks: Story = {
  args: {
    label: 'Total Tasks',
    value: 128,
    icon: <Layers className="h-[18px] w-[18px] text-primary" />,
    iconBg: 'bg-primary-light',
    trend: { label: '+12 this month', direction: 'up', sentiment: 'positive' },
  },
};

export const Open: Story = {
  args: {
    label: 'Open',
    value: 38,
    icon: <Circle className="h-[18px] w-[18px] text-orange-500" />,
    iconBg: 'bg-orange-50',
    trend: { label: '+3 due today', direction: 'up', sentiment: 'warning' },
  },
};

export const InProgress: Story = {
  args: {
    label: 'In Progress',
    value: 29,
    icon: <Clock className="h-[18px] w-[18px] text-violet-500" />,
    iconBg: 'bg-violet-50',
    trend: { label: '5 updated today', direction: 'neutral', sentiment: 'neutral' },
  },
};

export const Completed: Story = {
  args: {
    label: 'Completed',
    value: 43,
    icon: <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />,
    iconBg: 'bg-emerald-50',
    trend: { label: '+8 this week', direction: 'up', sentiment: 'positive' },
  },
};

// ─── Trend variants ───────────────────────────────────────────────────────────

export const NegativeTrend: Story = {
  args: {
    label: 'Overdue Tasks',
    value: 7,
    icon: <Clock className="h-[18px] w-[18px] text-red-500" />,
    iconBg: 'bg-red-50',
    trend: { label: '-3 from last week', direction: 'down', sentiment: 'negative' },
  },
};

export const NoTrend: Story = {
  args: {
    label: 'Total Tasks',
    value: 128,
    icon: <Layers className="h-[18px] w-[18px] text-primary" />,
    iconBg: 'bg-primary-light',
  },
};

// ─── Dashboard grid ───────────────────────────────────────────────────────────

export const DashboardGrid: Story = {
  decorators: [
    (Story) => (
      <div className="grid grid-cols-4 gap-4 w-[1100px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <StatCard
        label="Total Tasks"
        value={128}
        icon={<Layers className="h-[18px] w-[18px] text-primary" />}
        iconBg="bg-primary-light"
        trend={{ label: '+12 this month', direction: 'up', sentiment: 'positive' }}
      />
      <StatCard
        label="Open"
        value={38}
        icon={<Circle className="h-[18px] w-[18px] text-orange-500" />}
        iconBg="bg-orange-50"
        trend={{ label: '+3 due today', direction: 'up', sentiment: 'warning' }}
      />
      <StatCard
        label="In Progress"
        value={29}
        icon={<Clock className="h-[18px] w-[18px] text-violet-500" />}
        iconBg="bg-violet-50"
        trend={{ label: '5 updated today', direction: 'neutral', sentiment: 'neutral' }}
      />
      <StatCard
        label="Completed"
        value={43}
        icon={<CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />}
        iconBg="bg-emerald-50"
        trend={{ label: '+8 this week', direction: 'up', sentiment: 'positive' }}
      />
    </>
  ),
};
