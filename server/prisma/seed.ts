import { PrismaClient, Role, Priority, TaskStatus, ActivityAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const userPassword = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.dev' },
    update: {},
    create: {
      email: 'admin@taskflow.dev',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@taskflow.dev' },
    update: {},
    create: {
      email: 'alice@taskflow.dev',
      password: userPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: Role.USER,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@taskflow.dev' },
    update: {},
    create: {
      email: 'bob@taskflow.dev',
      password: userPassword,
      firstName: 'Bob',
      lastName: 'Smith',
      role: Role.USER,
    },
  });

  const taskData = [
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for lint, typecheck, test, and build.',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      createdById: admin.id,
      assignedToId: alice.id,
    },
    {
      title: 'Design database schema',
      description: 'Finalize ERD and Prisma schema with all models and relations.',
      status: TaskStatus.DONE,
      priority: Priority.CRITICAL,
      createdById: admin.id,
      assignedToId: admin.id,
    },
    {
      title: 'Implement authentication',
      description: 'JWT-based auth with access and refresh token rotation.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      createdById: admin.id,
      assignedToId: alice.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Build task list UI',
      description: 'Table and Kanban views with search, filter, and pagination.',
      status: TaskStatus.OPEN,
      priority: Priority.HIGH,
      createdById: alice.id,
      assignedToId: alice.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Integrate Gemini AI',
      description: 'Natural language task parsing and workload summarization.',
      status: TaskStatus.OPEN,
      priority: Priority.MEDIUM,
      createdById: admin.id,
      assignedToId: bob.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Write API documentation',
      description: 'Document all endpoints with request and response examples.',
      status: TaskStatus.OPEN,
      priority: Priority.LOW,
      createdById: bob.id,
      assignedToId: bob.id,
    },
  ];

  for (const data of taskData) {
    const task = await prisma.task.create({ data });
    await prisma.activityLog.create({
      data: {
        taskId: task.id,
        userId: data.createdById,
        action: ActivityAction.CREATED,
      },
    });
  }

  console.info('Seed complete');
  console.info('  admin@taskflow.dev  /  Admin@123  (ADMIN)');
  console.info('  alice@taskflow.dev  /  User@123   (USER)');
  console.info('  bob@taskflow.dev    /  User@123   (USER)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
