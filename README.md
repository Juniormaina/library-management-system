# Library Management System

NestJS + Prisma + PostgreSQL (Neon) backend for managing library users, genres, and books.

## Technology Stack

- **Node.js 22**
- **NestJS** (TypeScript)
- **Prisma ORM 7.x** (`prisma`, `@prisma/client`)
- **PostgreSQL** hosted on **Neon**
- **PostgreSQL driver/adapter:** `pg` + `@prisma/adapter-pg`
- **Prisma 7 config:** `api/prisma.config.ts` (migrations path + datasource + seed command)

## Project Structure

```text
.
├── api/                       # NestJS application
│   ├── prisma/
│   │   ├── migrations/        # Prisma migrations (preserved)
│   │   ├── schema.prisma      # Prisma schema (Role, User, Genre, Book)
│   │   └── seed.ts            # Idempotent database seed (4 genres, 16 books)
│   ├── src/
│   │   ├── prisma/            # PrismaModule + PrismaService (PrismaPg adapter)
│   │   └── generated/prisma/  # Generated Prisma client (gitignored)
│   ├── prisma.config.ts       # Prisma 7 config (loads ../.env.local)
│   ├── .env.example           # Placeholder env vars (no secrets)
│   └── package.json
├── .env.local                 # Local secrets (gitignored; do not commit)
└── README.md
```

## Prerequisites

- Node.js **22.x**
- npm
- Access to a PostgreSQL database (existing Neon project for this repo)

## Installation

```bash
# API dependencies
cd api
npm install
```

## Environment Configuration

1. Create local environment variables (do **not** commit secrets):
   - Root: `.env.local` (used by `api/prisma.config.ts`)
   - Or provide equivalent environment variables in your runtime environment.
2. Use `api/.env.example` as the placeholder reference:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
PORT=3000
```

Notes:
- `DATABASE_URL_UNPOOLED` is used by Prisma CLI/migrations via `api/prisma.config.ts`.
- `DATABASE_URL` is used by NestJS `PrismaService` and the seed script.
- `.env`, `.env.local`, and `.env.*` are gitignored (except `.env.example`).

## Database Migration Instructions

Run Prisma CLI commands from `api/` (it loads `../.env.local`):

```bash
cd api
npx prisma validate
npx prisma migrate status
```

If a migration is genuinely required (do **not** reset or use `db push` as a shortcut):

```bash
cd api
npx prisma migrate dev --name <descriptive_name>
```

This repository preserves existing migration history in `api/prisma/migrations/`.

## Database Seeding Instructions

The seed is configured in `api/prisma.config.ts` as:

```ts
migrations: { seed: 'tsx prisma/seed.ts' }
```

Run:

```bash
cd api
npx prisma db seed
```

Seed behavior:
- Inserts **4 genres** and **16 books** (distributed across all genres).
- Uses **idempotent `upsert`** operations (safe to run multiple times).
- Uses unique ISBN values and existing genre references.
- Does **not** delete existing user data or records.

## Starting the NestJS Application

```bash
cd api

# development
npm run start

# watch mode
npm run start:dev

# production (after build)
npm run start:prod
```

`api/src/main.ts` attempts to load `../.env.local` when `DATABASE_URL` is not already set, while preserving platform-provided environment variables in production.

## Building and Testing

```bash
cd api
npm run build
npm run test
npm run test:e2e    # if needed; uses configured e2e setup
```

## Prisma Studio

```bash
cd api
npx prisma studio
```

Use Prisma Studio to inspect `Genre`, `Book`, and `User` records.

## Schema Decisions

**Why `Book` references `Genre` via a foreign key (instead of embedding genre data):**

- **One-to-many relationship:** A single genre can contain many books, which maps naturally to `Genre (1) -> Book (many)`.
- **No duplication:** Storing a single `Genre` record avoids repeating genre name/description in every book row.
- **Consistent updates:** Renaming or updating a genre happens in one place and is reflected wherever books reference it.
- **Referential integrity:** The foreign key (`Book.genreId -> Genre.id`, `onDelete: Restrict`) ensures books point to valid genres and prevents accidental orphaning.
- **Efficient querying and future growth:** The relation supports indexed lookups, filtering by genre, and future expansion (e.g., genre metadata, admin tools, or additional relations) without restructuring book records.
