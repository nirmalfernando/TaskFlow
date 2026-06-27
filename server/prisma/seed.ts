/// <reference types="node" />
import { PrismaClient, Role, Priority, TaskStatus, ActivityAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // ── Wipe existing data ────────────────────────────────────────────────────
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // ── Passwords ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const userPassword = await bcrypt.hash('User@123', 12);

  // ── Users ─────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@taskflow.dev',
      password: adminPassword,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const alice = await prisma.user.create({
    data: {
      email: 'alice@taskflow.dev',
      password: userPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: Role.USER,
      isActive: true,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@taskflow.dev',
      password: userPassword,
      firstName: 'Bob',
      lastName: 'Chen',
      role: Role.USER,
      isActive: true,
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: 'carol@taskflow.dev',
      password: userPassword,
      firstName: 'Carol',
      lastName: 'Rivera',
      role: Role.USER,
      isActive: true,
    },
  });

  const david = await prisma.user.create({
    data: {
      email: 'david@taskflow.dev',
      password: userPassword,
      firstName: 'David',
      lastName: 'Park',
      role: Role.USER,
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      email: 'emma@taskflow.dev',
      password: userPassword,
      firstName: 'Emma',
      lastName: 'Thompson',
      role: Role.USER,
      isActive: false,
    },
  });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // ── Tasks ─────────────────────────────────────────────────────────────────
  type TaskDef = {
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    createdById: string;
    assignedToId?: string;
    dueDate?: Date;
    createdAt?: Date;
  };

  const tasks: TaskDef[] = [
    // DONE
    {
      title: 'Design database schema',
      description:
        'Finalize the ERD and Prisma schema with all models, relations, indexes, and enum types. Include User, Task, and ActivityLog models.',
      status: TaskStatus.DONE,
      priority: Priority.CRITICAL,
      createdById: admin.id,
      assignedToId: admin.id,
      createdAt: new Date(now - 30 * day),
    },
    {
      title: 'Set up CI/CD pipeline',
      description:
        'Configure GitHub Actions workflows for lint, typecheck, unit tests, build, and deployment to staging.',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      createdById: admin.id,
      assignedToId: alice.id,
      createdAt: new Date(now - 28 * day),
    },
    {
      title: 'Implement JWT authentication',
      description:
        'Build login, register, refresh-token rotation, and logout endpoints. Use bcrypt for password hashing and short-lived access tokens.',
      status: TaskStatus.DONE,
      priority: Priority.CRITICAL,
      createdById: admin.id,
      assignedToId: alice.id,
      createdAt: new Date(now - 25 * day),
    },
    {
      title: 'Build REST API for tasks',
      description:
        'CRUD endpoints for tasks with validation, error handling, and role-based access control. Pagination and filtering support.',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      createdById: admin.id,
      assignedToId: bob.id,
      createdAt: new Date(now - 22 * day),
    },
    {
      title: 'Create activity logging system',
      description:
        'Automatically record CREATED, UPDATED, STATUS_CHANGED, ASSIGNED, and DELETED events into the activity_logs table.',
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      createdById: admin.id,
      assignedToId: bob.id,
      createdAt: new Date(now - 20 * day),
    },
    {
      title: 'Set up Cloudinary image uploads',
      description:
        'Integrate Cloudinary for avatar image uploads. Add server-side validation for file type and size limits.',
      status: TaskStatus.DONE,
      priority: Priority.LOW,
      createdById: admin.id,
      assignedToId: carol.id,
      createdAt: new Date(now - 18 * day),
    },
    {
      title: 'Design and implement login page',
      description:
        'Create responsive login UI with email/password fields, form validation, error states, and loading indicator.',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      createdById: alice.id,
      assignedToId: carol.id,
      createdAt: new Date(now - 16 * day),
    },
    {
      title: 'Build task list with table view',
      description:
        'Implement sortable, filterable task table with status badges, priority indicators, assignee avatars, and pagination.',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      createdById: alice.id,
      assignedToId: alice.id,
      createdAt: new Date(now - 14 * day),
    },

    // IN_PROGRESS
    {
      title: 'Implement Kanban board view',
      description:
        'Drag-and-drop Kanban board with columns for OPEN, IN_PROGRESS, TESTING, and DONE. Persist status changes via API.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      createdById: alice.id,
      assignedToId: alice.id,
      dueDate: new Date(now + 3 * day),
      createdAt: new Date(now - 10 * day),
    },
    {
      title: 'Integrate Gemini AI for task parsing',
      description:
        'Allow users to describe a task in natural language and have the AI extract title, description, priority, and due date.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      createdById: admin.id,
      assignedToId: bob.id,
      dueDate: new Date(now + 5 * day),
      createdAt: new Date(now - 8 * day),
    },
    {
      title: 'Add workload summary report',
      description:
        'Admin dashboard widget showing per-user task counts by status and overdue task alerts. Use Gemini to generate a plain-English summary.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      createdById: admin.id,
      assignedToId: david.id,
      dueDate: new Date(now + 6 * day),
      createdAt: new Date(now - 7 * day),
    },
    {
      title: 'Build admin user management page',
      description:
        'Admin-only page to list all users, toggle active status, change roles, and view per-user task statistics.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      createdById: admin.id,
      assignedToId: carol.id,
      dueDate: new Date(now + 4 * day),
      createdAt: new Date(now - 6 * day),
    },
    {
      title: 'Implement task activity timeline',
      description:
        'Show a chronological log of all activity events on each task detail page — who did what and when.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.LOW,
      createdById: bob.id,
      assignedToId: david.id,
      dueDate: new Date(now + 8 * day),
      createdAt: new Date(now - 5 * day),
    },

    // TESTING
    {
      title: 'Test refresh token rotation',
      description:
        'Verify that old refresh tokens are invalidated on rotation and that token theft detection works correctly.',
      status: TaskStatus.TESTING,
      priority: Priority.CRITICAL,
      createdById: admin.id,
      assignedToId: alice.id,
      dueDate: new Date(now + 1 * day),
      createdAt: new Date(now - 4 * day),
    },
    {
      title: 'QA task CRUD flows',
      description:
        'End-to-end test coverage for create, read, update, soft-delete, and restore task operations via the API.',
      status: TaskStatus.TESTING,
      priority: Priority.HIGH,
      createdById: admin.id,
      assignedToId: david.id,
      dueDate: new Date(now + 2 * day),
      createdAt: new Date(now - 3 * day),
    },
    {
      title: 'Cross-browser UI testing',
      description:
        'Verify the task list, Kanban board, and modals render correctly in Chrome, Firefox, and Safari on desktop and mobile.',
      status: TaskStatus.TESTING,
      priority: Priority.MEDIUM,
      createdById: carol.id,
      assignedToId: carol.id,
      dueDate: new Date(now + 2 * day),
      createdAt: new Date(now - 2 * day),
    },

    // OPEN
    {
      title: 'Write API documentation',
      description:
        'Document all endpoints with request/response schemas, authentication requirements, and example payloads in Swagger / OpenAPI format.',
      status: TaskStatus.OPEN,
      priority: Priority.LOW,
      createdById: bob.id,
      assignedToId: bob.id,
      dueDate: new Date(now + 10 * day),
      createdAt: new Date(now - 1 * day),
    },
    {
      title: 'Add email notification system',
      description:
        'Send email alerts when a task is assigned to a user, when a due date is approaching, or when a task moves to DONE.',
      status: TaskStatus.OPEN,
      priority: Priority.MEDIUM,
      createdById: admin.id,
      dueDate: new Date(now + 14 * day),
      createdAt: new Date(now - 1 * day),
    },
    {
      title: 'Implement dark mode',
      description:
        'Add a theme toggle that switches between light and dark colour schemes. Persist the preference in localStorage.',
      status: TaskStatus.OPEN,
      priority: Priority.LOW,
      createdById: carol.id,
      assignedToId: carol.id,
      dueDate: new Date(now + 12 * day),
      createdAt: new Date(now),
    },
    {
      title: 'Performance audit and optimisation',
      description:
        'Profile API response times under load, add missing DB indexes, and optimise frontend bundle size with code splitting.',
      status: TaskStatus.OPEN,
      priority: Priority.MEDIUM,
      createdById: admin.id,
      assignedToId: david.id,
      dueDate: new Date(now + 20 * day),
      createdAt: new Date(now),
    },
    {
      title: 'Add CSV export for task reports',
      description:
        'Allow admins to download a CSV of all tasks filtered by date range, status, priority, or assignee.',
      status: TaskStatus.OPEN,
      priority: Priority.LOW,
      createdById: admin.id,
      dueDate: new Date(now + 25 * day),
      createdAt: new Date(now),
    },
    {
      title: 'Overdue task: migrate legacy data',
      description:
        'Import existing project tasks from the old spreadsheet system into TaskFlow. Map columns to the new schema.',
      status: TaskStatus.OPEN,
      priority: Priority.HIGH,
      createdById: admin.id,
      assignedToId: david.id,
      dueDate: new Date(now - 3 * day), // overdue
      createdAt: new Date(now - 15 * day),
    },
  ];

  // ── Persist tasks + activity logs ─────────────────────────────────────────
  for (const { createdAt, ...data } of tasks) {
    const task = await prisma.task.create({
      data: { ...data, createdAt },
    });

    // CREATED log
    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        userId: task.createdById,
        action: ActivityAction.CREATED,
        createdAt,
      },
    });

    // For DONE / IN_PROGRESS / TESTING tasks add a few extra history events
    if (task.status !== TaskStatus.OPEN) {
      const assignee = task.assignedToId ?? task.createdById;

      if (task.assignedToId && task.assignedToId !== task.createdById) {
        await prisma.activityLog.create({
          data: {
            taskId: task.id,
            userId: task.createdById,
            action: ActivityAction.ASSIGNED,
            newValue: task.assignedToId,
            createdAt: new Date((createdAt?.getTime() ?? now) + 10 * 60 * 1000),
          },
        });
      }

      if (task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.TESTING || task.status === TaskStatus.DONE) {
        await prisma.activityLog.create({
          data: {
            taskId: task.id,
            userId: assignee,
            action: ActivityAction.STATUS_CHANGED,
            field: 'status',
            oldValue: TaskStatus.OPEN,
            newValue: TaskStatus.IN_PROGRESS,
            createdAt: new Date((createdAt?.getTime() ?? now) + 1 * day),
          },
        });
      }

      if (task.status === TaskStatus.TESTING || task.status === TaskStatus.DONE) {
        await prisma.activityLog.create({
          data: {
            taskId: task.id,
            userId: assignee,
            action: ActivityAction.STATUS_CHANGED,
            field: 'status',
            oldValue: TaskStatus.IN_PROGRESS,
            newValue: TaskStatus.TESTING,
            createdAt: new Date((createdAt?.getTime() ?? now) + 3 * day),
          },
        });
      }

      if (task.status === TaskStatus.DONE) {
        await prisma.activityLog.create({
          data: {
            taskId: task.id,
            userId: assignee,
            action: ActivityAction.STATUS_CHANGED,
            field: 'status',
            oldValue: TaskStatus.TESTING,
            newValue: TaskStatus.DONE,
            createdAt: new Date((createdAt?.getTime() ?? now) + 5 * day),
          },
        });
      }
    }
  }

  console.info('\n✓ Database cleared and re-seeded successfully\n');
  console.info('┌─────────────────────────────────────────────────────┐');
  console.info('│  DEMO ACCOUNTS                                      │');
  console.info('├─────────────────────────────────────────────────────┤');
  console.info('│  admin@taskflow.dev   /  Admin@123   (ADMIN)        │');
  console.info('│  alice@taskflow.dev   /  User@123    (USER)         │');
  console.info('│  bob@taskflow.dev     /  User@123    (USER)         │');
  console.info('│  carol@taskflow.dev   /  User@123    (USER)         │');
  console.info('│  david@taskflow.dev   /  User@123    (USER)         │');
  console.info('│  emma@taskflow.dev    /  User@123    (USER, inactive)│');
  console.info('└─────────────────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
