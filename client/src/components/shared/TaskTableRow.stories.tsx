import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TaskTableRow, TaskTableHeader } from './TaskTableRow';

const meta: Meta<typeof TaskTableRow> = {
  title: 'Shared/TaskTableRow',
  component: TaskTableRow,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="rounded-card border border-border bg-card overflow-hidden w-[900px]">
        <table className="w-full border-collapse">
          <TaskTableHeader />
          <tbody>
            <Story />
          </tbody>
        </table>
      </div>
    ),
  ],
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof TaskTableRow>;

// ─── Single row variants ──────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    id: 'TASK-1042',
    title: 'Redesign onboarding flow for new users',
    priority: 'high',
    status: 'in-progress',
    assignee: { name: 'Sarah Roberts' },
    dueDate: 'Jul 2',
  },
};

export const MediumPriorityOpen: Story = {
  name: 'Medium Priority · Open',
  args: {
    id: 'TASK-1048',
    title: 'Write REST API documentation',
    priority: 'medium',
    status: 'todo',
    assignee: { name: 'John Doe' },
    dueDate: 'Jun 30',
  },
};

export const LowPriorityDone: Story = {
  name: 'Low Priority · Done',
  args: {
    id: 'TASK-1037',
    title: 'Implement dark mode support across all pages',
    priority: 'low',
    status: 'completed',
    assignee: { name: 'Alex Kim' },
    dueDate: 'Jun 15',
  },
};

export const Overdue: Story = {
  args: {
    id: 'TASK-1041',
    title: 'Fix authentication bug on mobile Safari',
    priority: 'high',
    status: 'todo',
    assignee: { name: 'Alex Kim' },
    dueDate: 'Jun 20',
    isOverdue: true,
  },
};

export const Testing: Story = {
  args: {
    id: 'TASK-1039',
    title: 'Set up CI/CD pipeline with GitHub Actions',
    priority: 'high',
    status: 'in-qa',
    assignee: { name: 'Kim Park' },
    dueDate: 'Jun 22',
    isOverdue: true,
  },
};

// ─── Full table (matches screenshot) ─────────────────────────────────────────

const SAMPLE_TASKS = [
  {
    id: 'TASK-1042',
    title: 'Redesign onboarding flow for new users',
    priority: 'high' as const,
    status: 'in-progress' as const,
    assignee: { name: 'Sarah Roberts' },
    dueDate: 'Jul 2',
  },
  {
    id: 'TASK-1041',
    title: 'Fix authentication bug on mobile Safari',
    priority: 'high' as const,
    status: 'todo' as const,
    assignee: { name: 'Alex Kim' },
    dueDate: 'Jun 20',
    isOverdue: true,
  },
  {
    id: 'TASK-1048',
    title: 'Write REST API documentation',
    priority: 'medium' as const,
    status: 'in-progress' as const,
    assignee: { name: 'John Doe' },
    dueDate: 'Jun 30',
  },
  {
    id: 'TASK-1039',
    title: 'Set up CI/CD pipeline with GitHub Actions',
    priority: 'high' as const,
    status: 'in-qa' as const,
    assignee: { name: 'Kim Park' },
    dueDate: 'Jun 22',
    isOverdue: true,
  },
  {
    id: 'TASK-1035',
    title: 'Update analytics dashboard metrics',
    priority: 'medium' as const,
    status: 'todo' as const,
    assignee: { name: 'Sarah Roberts' },
    dueDate: 'Jul 8',
  },
  {
    id: 'TASK-1037',
    title: 'Implement dark mode support across all pages',
    priority: 'low' as const,
    status: 'completed' as const,
    assignee: { name: 'Alex Kim' },
    dueDate: 'Jun 15',
  },
  {
    id: 'TASK-1034',
    title: 'Performance audit and database query optimization',
    priority: 'medium' as const,
    status: 'in-qa' as const,
    assignee: { name: 'John Doe' },
    dueDate: 'Jul 12',
  },
  {
    id: 'TASK-1035',
    title: 'Migrate user data to PostgreSQL schema v2',
    priority: 'high' as const,
    status: 'todo' as const,
    assignee: { name: 'Kim Park' },
    dueDate: 'Jun 18',
    isOverdue: true,
  },
];

export const FullTable: Story = {
  decorators: [
    (Story) => (
      <div className="rounded-card border border-border bg-card overflow-hidden w-[900px]">
        <table className="w-full border-collapse">
          <TaskTableHeader />
          <tbody>
            <Story />
          </tbody>
        </table>
      </div>
    ),
  ],
  render: () => (
    <>
      {SAMPLE_TASKS.map((task) => (
        <TaskTableRow key={task.id + task.title} {...task} onClick={fn()} />
      ))}
    </>
  ),
};
