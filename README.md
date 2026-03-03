# NestDrive

A full-featured, subscription-based SaaS file and folder management system. Admins define tiered subscription packages that strictly control how users interact with their storage — folder depth, file types, file sizes, and storage limits are all enforced dynamically per package.

**Live URLs**

- Frontend: https://nestdrive.nimora.site
- Backend API: https://nestdrive-api.nimora.site

---

## Tech Stack

**Backend**

- Node.js + Express.js + TypeScript
- PostgreSQL + Prisma ORM
- AWS S3 (file storage, presigned URLs)
- Resend (transactional email)
- JWT authentication

**Frontend**

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- TanStack Query + OpenAPI fetch client

**Monorepo**

- pnpm workspaces + Turborepo
- Shared packages: `@nestdrive/schemas` (Zod), `@nestdrive/client` (OpenAPI), `@nestdrive/ui`

---

## Features

### Admin Panel

- Login with seeded admin credentials
- Subscription package management (create, update, delete)
  - Max folders, max nesting level, allowed file types, max file size, total file limit, files per folder

### User Panel

- Register & login with **email verification**
- **Forgot / reset password** via email
- View and select subscription packages; switch anytime
- Subscription history with active dates
- **Folder management:** create, rename, delete, unlimited nesting (within package limits)
- **File management:** upload (Image, Video, PDF, Audio), preview in-browser, download, delete
- All actions enforced against the active subscription package in real time

---

## Project Structure

```
nestdrive/
├── apps/
│   ├── server/          # Express API
│   └── web/             # Next.js frontend
└── packages/
    ├── schemas/          # Shared Zod schemas
    ├── client/           # OpenAPI fetch client
    └── ui/               # Shared UI components
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL database
- AWS S3 bucket
- Resend account (email)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example and fill in your values:

```bash
cp apps/server/.env.example apps/server/.env
```

**`apps/server/.env`**

```env
DATABASE_URL=""          # PostgreSQL connection string
JWT_SECRET=""            # Random secret string
RESEND_API_KEY=""        # Resend API key (starts with re_)
SERVER_URL=""            # Backend URL e.g. http://localhost:8080
FRONTEND_URL=""          # Frontend URL e.g. http://localhost:3000
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""            # e.g. us-east-1
AWS_S3_BUCKET=""
```

**`apps/web/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Set up the database

```bash
cd apps/server
pnpm prisma migrate deploy
pnpm prisma db seed
```

### 4. Run the development server

```bash
# From repo root
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/docs

---

## Seeded Credentials

**Admin**

- Email: `admin@nestdrive.com`
- Password: `Admin123456!`

**Test User**

- Email: `user@nestdrive.com`
- Password: `User123456!`

---

## API Overview

| Method              | Endpoint                    | Description                |
| ------------------- | --------------------------- | -------------------------- |
| POST                | `/v1/auth/register`         | Register new user          |
| POST                | `/v1/auth/login`            | Login                      |
| GET                 | `/v1/auth/verify-email`     | Email verification         |
| POST                | `/v1/auth/forgot-password`  | Request password reset     |
| POST                | `/v1/auth/reset-password`   | Reset password             |
| GET                 | `/v1/users/me`              | Get current user           |
| GET                 | `/v1/packages`              | List subscription packages |
| GET                 | `/v1/subscriptions/me`      | Active subscription        |
| POST                | `/v1/subscriptions`         | Subscribe to package       |
| GET                 | `/v1/subscriptions/history` | Subscription history       |
| GET                 | `/v1/folders`               | List folders               |
| POST                | `/v1/folders`               | Create folder              |
| PUT                 | `/v1/folders/:id`           | Rename folder              |
| DELETE              | `/v1/folders/:id`           | Delete folder              |
| POST                | `/v1/files/presign`         | Get S3 upload URL          |
| POST                | `/v1/files/confirm`         | Confirm upload             |
| GET                 | `/v1/files`                 | List files                 |
| GET                 | `/v1/files/:id/url`         | Get download URL           |
| DELETE              | `/v1/files/:id`             | Delete file                |
| GET                 | `/v1/admin/stats`           | Admin stats                |
| GET/POST/PUT/DELETE | `/v1/admin/packages`        | Package CRUD (admin)       |

Full interactive docs available at `/docs` (Scalar UI).
