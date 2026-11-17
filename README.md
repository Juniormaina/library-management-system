# Library Management System

A full-stack library catalog built over three incremental weeks: a **NestJS + Prisma + PostgreSQL (Neon)** API, and a **React + Vite** patron-facing catalog that consumes it.

- **Week 1 — Data foundation:** Prisma schema, migrations, and an idempotent seed (roles, users, genres, books).
- **Week 2 — API layer:** REST endpoints for auth, genres, books, and users, with JWT authentication and role-based authorization.
- **Week 3 — Web client:** React single-page catalog with search, genre filtering, responsive book grid, book detail pages, reading list persistence, authentication flow (login/register), protected routes, and space booking form.

---

## Technology Stack

### Backend (`api/`)

- **Node.js 22**
- **NestJS 12** (TypeScript)
- **Prisma ORM 7.x** (`prisma`, `@prisma/client`) with the `prisma-client` generator
- **PostgreSQL** hosted on **Neon**
- **Driver/adapter:** `pg` + `@prisma/adapter-pg`
- **Auth:** `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`
- **Validation:** `class-validator`, `class-transformer`

### Frontend (`client/`)

- **React 18** + **React DOM 18**
- **Vite 6** (build tool / dev server)
- **React Router 7** (`react-router-dom`)
- Plain CSS (design tokens + responsive layout); no CSS framework

---

## Project Structure

```text
.
├── api/                          # NestJS application
│   ├── prisma/
│   │   ├── migrations/           # Prisma migrations (preserved)
│   │   ├── schema.prisma         # Role, User, Genre, Book models
│   │   └── seed.ts               # Idempotent seed (4 genres, 16 books)
│   ├── src/
│   │   ├── auth/                 # register/login, JWT strategy, guards, roles
│   │   ├── books/                # CRUD + search/filter/pagination
│   │   ├── genres/               # CRUD
│   │   ├── users/                # authenticated profile
│   │   ├── prisma/               # PrismaModule + PrismaService (PrismaPg adapter)
│   │   ├── generated/prisma/     # Generated Prisma client (gitignored)
│   │   ├── app.module.ts
│   │   └── main.ts               # bootstrap, CORS, global ValidationPipe
│   ├── test/                     # e2e scaffold
│   ├── prisma.config.ts          # Prisma 7 config (migrations + seed + datasource)
│   ├── .env.example              # Placeholder env vars (no secrets)
│   └── package.json
├── client/                       # React + Vite SPA
│   ├── src/
│   │   ├── api/client.js         # Typed fetch wrapper (books, genres, auth, users)
│   │   ├── components/           # Navbar, BookCard, BookGrid, SearchBar, GenreFilter, ProtectedRoute, Layout
│   │   ├── context/              # ReadingListContext (localStorage persistence)
│   │   ├── pages/                # HomePage, BookDetail, LoginPage, RegisterPage, SpaceBookingPage
│   │   ├── App.jsx               # Routes with auth guards
│   │   ├── main.jsx              # BrowserRouter + styles + ReadingListProvider
│   │   └── styles.css            # Design tokens + all component styles (forms, auth, book actions)
│   ├── index.html
│   ├── vite.config.js
│   ├── .env / .env.example       # VITE_API_URL
│   └── package.json
├── docs/
│   └── postman_collection.json   # End-to-end API examples
├── .env.local                    # Local secrets (gitignored; do not commit)
└── README.md
```

---

## Prerequisites

- **Node.js 22.x** and npm
- Access to a PostgreSQL database (existing Neon project for this repo)

---

## Getting Started

### 1. Backend setup

```bash
cd api
npm install
```

### 2. Environment configuration

Create local environment variables (**do not commit secrets**):

- Root `.env.local` — used by `api/prisma.config.ts`, the seed script, and `api/src/main.ts`.
- Or provide the equivalent variables in your runtime environment.

Reference placeholders live in `api/.env.example`:

```env
# PostgreSQL connection string (Neon) — used by NestJS runtime and the seed script.
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?channel_binding=require&sslmode=require"

# Unpooled/direct connection string (Neon) — used by Prisma migrations/datasource.
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST/DATABASE?channel_binding=require&sslmode=require"

# Optional: NestJS HTTP port
PORT=3000

# Required: JWT signing secret for authentication tokens
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

Notes:

- `DATABASE_URL_UNPOOLED` is used by Prisma CLI/migrations via `api/prisma.config.ts`.
- `DATABASE_URL` is used by the NestJS `PrismaService` and the seed script.
- `JWT_SECRET` signs access tokens; `JwtStrategy` reads it from the environment.
- `.env`, `.env.local`, and `.env.*` are gitignored (except `.env.example`).

### 3. Database migration

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

### 4. Database seeding

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
- Sets `totalCopies` on each book (defaults to `1` when omitted); a few titles carry explicit values (e.g. `3`, `2`, or `0` for out-of-stock titles).

### 5. Frontend setup

```bash
cd client
npm install
```

`client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

---

## Running the Application

### Backend (NestJS)

```bash
cd api

npm run start        # development
npm run start:dev    # watch mode
npm run start:prod   # production (after build)
```

`api/src/main.ts` enables CORS, applies a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), and attempts to load `../.env.local` when `DATABASE_URL` is not already set (preserving platform-provided env vars in production).

### Frontend (Vite)

```bash
cd client
npm run dev      # dev server on http://localhost:5173
```

The client expects the API at `VITE_API_URL` (default `http://localhost:3000`). Start the backend first.

---

## API Overview

Base URL: `http://localhost:3000`

### Authentication

| Method | Path              | Auth | Description                                  |
| ------ | ----------------- | ---- | -------------------------------------------- |
| POST   | `/auth/register`  | No   | Register a user. Role is always `PATRON`.    |
| POST   | `/auth/login`     | No   | Log in; returns `{ access_token, user }`.    |

Send the token as `Authorization: Bearer <access_token>` on protected routes.

### Genres

| Method | Path          | Auth | Description                     |
| ------ | ------------- | ---- | ------------------------------- |
| GET    | `/genres`     | No   | List all genres (ordered by name). |
| GET    | `/genres/:id` | No   | Get a genre with its books.     |
| POST   | `/genres`     | No   | Create a genre.                 |
| PATCH  | `/genres/:id` | No   | Update a genre.                 |
| DELETE | `/genres/:id` | No   | Delete a genre (blocked if it has books). |

### Books

| Method | Path          | Auth      | Description                                    |
| ------ | ------------- | --------- | ---------------------------------------------- |
| GET    | `/books`      | No        | List books with `genreId`, `search`, `page`, `limit` query params. |
| GET    | `/books/:id`  | No        | Get a single book (includes genre).            |
| POST   | `/books`      | LIBRARIAN | Create a book.                                 |
| PATCH  | `/books/:id`  | LIBRARIAN | Update a book.                                 |
| DELETE | `/books/:id`  | LIBRARIAN | Delete a book.                                 |

`GET /books` returns a paginated envelope:

```json
{
  "data": [ /* books */ ],
  "meta": { "total": 16, "page": 1, "limit": 10, "totalPages": 2 }
}
```

- `search` matches title or author (case-insensitive).
- `page` defaults to `1`; `limit` defaults to `10` and is capped at `100`.

### Users

| Method | Path             | Auth | Description                  |
| ------ | ---------------- | ---- | ---------------------------- |
| GET    | `/users/profile` | Yes  | Current user's profile.      |

### Protected Client Routes

The React client enforces the following route protections:

| Route            | Protection        | Behavior                                              |
| ---------------- | ----------------- | ----------------------------------------------------- |
| `/spaces`        | `ProtectedRoute`  | Requires JWT; redirects to `/login` with `from` state |
| `/login`         | `PublicOnlyRoute` | Redirects authenticated users to previous page        |
| `/register`      | `PublicOnlyRoute` | Redirects authenticated users to previous page        |

Login stores the JWT in `localStorage` (`library_access_token`) and redirects back to the originally requested page after authentication.

### Authorization

- Public registration always creates a `PATRON`; any client-supplied role is ignored.
- `LIBRARIAN`-only routes are guarded by `JwtAuthGuard` + `RolesGuard`.
- Requests without a token receive `401`; insufficient role receives `403`.

A ready-to-import Postman collection with worked examples is in `docs/postman_collection.json`.

---

## Building and Testing

### Backend

```bash
cd api
npm run build     # nest build
npm run lint      # oxlint --type-aware src/ test/
npm run test      # Jest unit tests
npm run test:e2e  # e2e scaffold (requires a running database)
```

### Frontend

```bash
cd client
npm run build     # vite production build
npm run lint      # oxlint src/
npm run preview   # serve the production build
```

---

## Prisma Studio

```bash
cd api
npx prisma studio
```

Use Prisma Studio to inspect `Genre`, `Book`, and `User` records.

---

## Week-by-Week Summary

### Week 1 — Data foundation

- `Role` enum (`PATRON`, `LIBRARIAN`), `User`, `Genre`, and `Book` models.
- `Book.genreId` foreign key with `onDelete: Restrict` and indexes on `genreId` and `title`.
- Initial migrations plus an added `totalCopies` column.
- Idempotent seed: 4 genres, 16 books.

### Week 2 — API layer

- Auth: register (PATRON-only), login, JWT strategy, `JwtAuthGuard`, `RolesGuard`, `@Roles` decorator.
- Genres CRUD with duplicate-name protection and delete guard.
- Books CRUD with ISBN uniqueness, search, genre filter, and pagination.
- Users profile endpoint behind JWT auth.
- Global validation pipe, CORS, and Neon-backed `PrismaService`.

### Week 3 — Web client

- Vite + React 18 + React Router 7 SPA.
- Typed API client (`getBooks`, `getBook`, `getGenres`, `login`, `register`, `getProfile`).
- Context: `ReadingListContext` (localStorage persistence, duplicate prevention, add/remove/clear).
- Components: `Navbar` (reading list count, auth state), `SearchBar` (debounced 300ms), `GenreFilter`, `BookGrid`, `BookCard` (add/remove reading list), `ProtectedRoute`, `PublicOnlyRoute`, `Layout`.
- Pages: `HomePage` (search + genre filter), `BookDetail` (reading list actions), `LoginPage`, `RegisterPage`, `SpaceBookingPage` (controlled inputs, validation).
- Auth flow: JWT in localStorage, protected routes with redirect preservation, public-only routes for login/register.
- Responsive stylesheet with design tokens, forms, auth, skeletons, badges, and reduced-motion support.

---

## Schema Decisions

**Why `Book` references `Genre` via a foreign key (instead of embedding genre data):**

- **One-to-many relationship:** A single genre can contain many books, which maps naturally to `Genre (1) -> Book (many)`.
- **No duplication:** Storing a single `Genre` record avoids repeating genre name/description in every book row.
- **Consistent updates:** Renaming or updating a genre happens in one place and is reflected wherever books reference it.
- **Referential integrity:** The foreign key (`Book.genreId -> Genre.id`, `onDelete: Restrict`) ensures books point to valid genres and prevents accidental orphaning.
- **Efficient querying and future growth:** The relation supports indexed lookups, filtering by genre, and future expansion (e.g., genre metadata, admin tools, or additional relations) without restructuring book records.