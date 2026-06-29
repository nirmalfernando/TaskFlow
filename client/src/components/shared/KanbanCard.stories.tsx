import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { KanbanCard } from './KanbanCard';

const meta: Meta<typeof KanbanCard> = {
  title: 'Shared/KanbanCard',
  component: KanbanCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[270px]">
        <Story />
      </div>
    ),
  ],
  args: {
    onClick: fn(),
    onDragStart: fn(),
    onDragEnd: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof KanbanCard>;

export const Default: Story = {
  args: {
    id: 'TASK-1042',
    title: 'Redesign onboarding flow for new users',
    description:
      'Overhaul the first-run experience including welcome screen, tutorial steps, and team invitation flow.',
    priority: 'high',
    status: 'todo',
    assignee: { name: 'Sarah Roberts' },
    dueDate: 'Jul 2',
  },
};

export const Dragging: Story = {
  name: 'Dragging State',
  args: {
    id: 'TASK-1048',
    title: 'Write REST API documentation',
    description:
      'Document all v2 endpoints using OpenAPI 3.0 spec, including request/response schemas and auth headers.',
    priority: 'medium',
    status: 'in-progress',
    assignee: { name: 'John Doe' },
    dueDate: 'Jun 30',
    isDragging: true,
  },
};

export const Overdue: Story = {
  args: {
    id: 'TASK-1041',
    title: 'Fix authentication bug on mobile Safari',
    description: 'Users on iOS Safari 16+ are being logged out unexpectedly after background.',
    priority: 'high',
    status: 'todo',
    assignee: { name: 'Alex Kim' },
    dueDate: 'Jun 20',
    isOverdue: true,
  },
};

export const LowPriorityDone: Story = {
  name: 'Low Priority · Done',
  args: {
    id: 'TASK-1037',
    title: 'Implement dark mode support across all pages',
    description: 'Add system-preference detection and manual toggle with persistent user setting.',
    priority: 'low',
    status: 'completed',
    assignee: { name: 'Alex Kim' },
    dueDate: 'Jun 15',
  },
};

export const NoDescription: Story = {
  args: {
    id: 'TASK-1035',
    title: 'Update analytics dashboard metrics',
    priority: 'medium',
    status: 'todo',
    assignee: { name: 'Sarah Roberts' },
    dueDate: 'Jul 8',
  },
};
