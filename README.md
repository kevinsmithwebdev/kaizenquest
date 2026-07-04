# Kaizen Quest

A personal habit and goal tracking web app built with Next.js. Track daily, weekly, and monthly goals across categories like health, learning, and productivity.

## Prerequisites

- Node.js 20+
- PostgreSQL database
- Yarn

## Environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="your-secret-at-least-32-characters"
```

## Getting started

Install dependencies and run migrations:

```bash
yarn install
yarn db:migrate
```

Start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command              | Description                               |
| -------------------- | ----------------------------------------- |
| `yarn dev`           | Start development server                  |
| `yarn build`         | Run migrations and build for production   |
| `yarn test`          | Run unit tests                            |
| `yarn test:coverage` | Run tests with coverage (auth modules)    |
| `yarn validate`      | Typecheck, lint, test, and optional Sonar |
| `yarn db:migrate`    | Apply Prisma migrations                   |
| `yarn db:studio`     | Open Prisma Studio                        |

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- PostgreSQL via Prisma 7
- JWT cookie authentication
- Tailwind CSS 4, shadcn/ui
- Vitest for unit tests
