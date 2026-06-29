import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { TaskKanbanView, type KanbanTask } from './TaskKanbanView';

const meta: Meta<typeof TaskKanbanView> = {
  title: 'Features/Tasks/TaskKanbanView',
  component: TaskKanbanView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-surface p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    onTaskMove: fn(),
    onAddCard: fn(),
    onCardClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TaskKanbanView>;

const TASKS: KanbanTask[] = [
  {
    id: 'TASK-1042',
    column: 'todo',
    title: 'Redesign onboarding flow for new users',
    description:
      'Overhaul the first-run experience including welcome screen, tutorial steps, and team invitation flow.',
    priority: 'high',
    status: 'todo',
    assignee: { name: 'Sarah Roberts' },
    dueDate: 'Jul 2',
  },
  {
    id: 'TASK-1041',
    column: 'todo',
    title: 'Fix authentication bug on mobile Safari',
    description: 'Users on iOS Safari 16+ are being logged out unexpectedly after background.',
    priority: 'high',
    status: 'todo',
    assignee: { name: 'Alex Kim' },
    dueDate: 'Jun 20',
    isOverdue: true,
  },
  {
    id: 'TASK-1032',
    column: 'todo',
    title: 'Migrate user data to PostgreSQL schema v2',
    description: 'Execute non-downtime migration from MongoDB using the dual-write pattern.',
    priority: 'high',
    status: 'todo',
    assignee: { name: 'Kim Park' },
    dueDate: 'Jun 18',
    isOverdue: true,
  },
  {
    id: 'TASK-1048',
    column: 'in-progress',
    title: 'Write REST API documentation',
    description:
      'Document all v2 endpoints using OpenAPI 3.0 spec, including request/response schemas and auth headers.',
    priority: 'medium',
    status: 'in-progress',
    assignee: { name: 'John Doe' },
    dueDate: 'Jun 30',
  },
  {
    id: 'TASK-1035',
    column: 'in-progress',
    title: 'Update analytics dashboard metrics',
    description: 'Profile retention metrics, cohort analysis charts, and export to CSV.',
    priority: 'medium',
    status: 'in-progress',
    assignee: { name: 'Sarah Roberts' },
    dueDate: 'Jul 8',
  },
  {
    id: 'TASK-1039',
    column: 'in-qa',
    title: 'Set up CI/CD pipeline with GitHub Actions',
    description:
      'Automate build, test, and deployment to staging and production with environment secrets.',
    priority: 'high',
    status: 'in-qa',
    assignee: { name: 'Kim Park' },
    dueDate: 'Jun 22',
    isOverdue: true,
  },
  {
    id: 'TASK-1034',
    column: 'in-qa',
    title: 'Performance audit and database query optimization',
    description:
      'Profile queries, identify N+1 issues, add Redis caching layer. Target: <200ms p95.',
    priority: 'medium',
    status: 'in-qa',
    assignee: { name: 'John Doe' },
    dueDate: 'Jul 12',
  },
  {
    id: 'TASK-1037',
    column: 'completed',
    title: 'Implement dark mode support across all pages',
    description: 'Add system-preference detection and manual toggle with persistent user setting.',
    priority: 'low',
    status: 'completed',
    assignee: { name: 'Alex Kim' },
    dueDate: 'Jun 15',
  },
];

export const Default: Story = {
  name: 'Default (matches screenshot)',
  args: { tasks: TASKS },
};

export const EmptyBoard: Story = {
  args: { tasks: [] },
};

export const SingleColumn: Story = {
  name: 'Only Open Tasks',
  args: {
    tasks: TASKS.filter((t) => t.column === 'todo'),
  },
};
