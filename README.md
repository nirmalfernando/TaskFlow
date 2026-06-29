# TaskFlow

A full-stack task management application with role-based access control, AI-assisted features, and real-time activity tracking.

## Tech Stack

**Client**

- React 18, TypeScript, Vite
- Tailwind CSS, Radix UI, shadcn/ui primitives
- TanStack Query, React Hook Form, Zod
- Tiptap (rich text editor), Recharts, React Router v6

**Server**

- Node.js, Express, TypeScript
- Prisma ORM, MySQL 8
- JWT authentication (access + refresh tokens)
- Google Gemini AI, Cloudinary, Swagger UI

**Tooling**

- pnpm workspaces (monorepo)
- Docker Compose (MySQL + Adminer)
- Husky, commitlint, lint-staged, Prettier, ESLint

---

## Prerequisites

| Tool                    | Version            |
| ----------------------- | ------------------ |
| Node.js                 | >= 20.0.0          |
| pnpm                    | >= 9.0.0           |
| Docker & Docker Compose | any recent version |

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd TaskFlow
pnpm install
```

### 2. Start the database

```bash
docker compose up -d
```

This starts:

- **MySQL 8.4** on port `3306`
- **Adminer** (database UI) on port `8080` → http://localhost:8080

### 3. Configure environment variables

**Server** — copy and edit:

```bash
cp server/.env.example server/.env
```

```env
NODE_ENV=development
PORT=5000

# MySQL connection string
DATABASE_URL="mysql://root:password@localhost:3306/taskflow"

# Generate with: openssl rand -base64 64
JWT_ACCESS_SECRET=your-access-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional — get a free key at https://aistudio.google.com/
GEMINI_API_KEY=

# Optional — sign up at cloudinary.com (free tier is enough)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Client** — copy and edit:

```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:5000
```

### 4. Run database migrations

```bash
pnpm --filter server db:migrate
```

### 5. (Optional) Seed the database

```bash
pnpm --filter server db:seed
```

---

## Running the App

### Development (both client and server)

```bash
pnpm dev
```

- Client → http://localhost:5173
- Server → http://localhost:5000
- API docs → http://localhost:5000/api-docs

### Run individually

```bash
# Server only
pnpm --filter server dev

# Client only
pnpm --filter client dev
```

---

## Scripts

| Command                                | Description                           |
| -------------------------------------- | ------------------------------------- |
| `pnpm dev`                             | Start client and server in watch mode |
| `pnpm build`                           | Build both packages for production    |
| `pnpm lint`                            | Lint both packages                    |
| `pnpm typecheck`                       | Type-check both packages              |
| `pnpm test`                            | Run server tests                      |
| `pnpm --filter server test:watch`      | Run server tests in watch mode        |
| `pnpm --filter server test:coverage`   | Run tests with coverage report        |
| `pnpm --filter server db:migrate`      | Run pending Prisma migrations         |
| `pnpm --filter server db:migrate:prod` | Deploy migrations (production)        |
| `pnpm --filter server db:generate`     | Regenerate Prisma client              |
| `pnpm --filter server db:studio`       | Open Prisma Studio                    |
| `pnpm --filter server db:seed`         | Seed the database                     |
| `pnpm --filter client storybook`       | Start Storybook on port 6006          |

---

## Project Structure

```
TaskFlow/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities, API client
│   └── .env.example
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database access layer
│   │   ├── middlewares/    # Auth, error handling, validation
│   │   ├── routes/         # Express routers
│   │   └── validators/     # Zod schemas
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── migrations/     # Migration history
│   │   └── seed.ts         # Seed script
│   └── .env.example
├── docker-compose.yml      # MySQL + Adminer
├── pnpm-workspace.yaml     # Monorepo workspace config
└── package.json            # Root scripts and tooling
```

---

## Database Schema

| Model         | Description                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `User`        | Users with `ADMIN` or `USER` roles                                                                                 |
| `Task`        | Tasks with status (`TODO`, `IN_PROGRESS`, `IN_QA`, `COMPLETED`) and priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| `ActivityLog` | Audit trail for task changes                                                                                       |

---

## Commit Convention

Commits follow the [Conventional Commits](https://www.conventionalcommits.org/) spec, enforced by commitlint:

```
feat: add task filtering by assignee
fix(auth): handle expired refresh token
chore: update dependencies
```
