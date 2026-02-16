# Secure Task Management System

A full-stack NX monorepo implementing a secure Task Management System with role-based access control (RBAC), JWT authentication, and a modular NestJS backend.

## Tech Stack

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Authentication**: JWT (via HttpOnly cookies)
- **Validation**: class-validator, class-transformer
- **Monorepo**: Nx
- **Package Manager**: pnpm
- **API Docs**: Swagger/OpenAPI

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL running locally (or via Docker)

### 1. Install Dependencies

```sh
pnpm install
```

### 2. Configure Environment

Copy the example env file and fill in your values:

```sh
cp .env.example .env
```

**.env configuration:**

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=task_manager

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

> **Note:** Change `JWT_SECRET` to a strong random value in production.

### 3. Create the Database

```sh
psql -U postgres -c "CREATE DATABASE task_manager;"
```

### 4. Run the Backend

```sh
pnpm nx serve api
```

- API base URL: `http://localhost:3001/api/v1`
- Swagger docs: `http://localhost:3001/api/v1/docs`

### 5. Seed the Database (optional)

```sh
pnpm nx run api:seed
```

This seeds roles, permissions, sample organizations, and users.

---

## Architecture Overview

### NX Monorepo Layout

```
apps/
  api/              → NestJS backend (main application)
  api-e2e/          → End-to-end tests for the API

libs/
  data/             → Shared TypeScript interfaces, enums, and TypeORM entities
  auth/             → Reusable RBAC guards and decorators
```

### Rationale

Using an NX monorepo allows:
- **Shared code** between apps without publishing packages — the `libs/data` library is imported directly in `apps/api` as `@ashahzad-task-manager/data`
- **Single toolchain** for build, test, and lint across all projects
- **Enforced boundaries** between layers (API, shared data, auth logic)

### Shared Libraries

| Library | Purpose |
|---------|---------|
| `libs/data` | TypeORM entities, TypeScript enums (`TaskStatus`, `TaskPriority`, `UserRole`, etc.) |
| `libs/auth` | RBAC guards (`RoleLevelGuard`, `PermissionsGuard`) and decorators (`@RequireRoleLevel`, `@RequirePermissions`) |

### API Module Structure

```
src/
  app/          → Root AppModule, TypeORM config, global interceptors
  auth/         → JWT login, register, logout, @UseGuards(JwtAuthGuard)
  tasks/        → Task CRUD endpoints with RBAC
  audit/        → Audit log endpoint (Admin+ only)
  users/        → User management
  roles/        → Role listing
  seed.ts       → Database seeder
```

---

## Data Model

### Entities Overview

| Entity | Description |
|--------|-------------|
| `User` | Authenticated user with role and organization assignment |
| `Organization` | 2-level hierarchy (parent org → child org) |
| `Role` | Owner, Admin, Viewer — with inheritance levels |
| `Permission` | Granular `resource:action` permissions (e.g., `tasks:create`) |
| `RolePermission` | Join table mapping roles to permissions |
| `Task` | The managed resource, scoped to organization |
| `AuditLog` | Immutable append-only access log |

### Schema Description

**User**
- `id` (UUID PK), `email` (unique), `password` (bcrypt hashed)
- `firstName`, `lastName`, `isActive`
- `roleId` (FK → Role), `organizationId` (FK → Organization)
- `lastLoginAt`, `failedLoginAttempts`, `refreshTokenHash`
- `deletedAt` (soft delete), `createdAt`, `updatedAt`

**Organization**
- `id`, `name` (unique), `description`
- `parentId` (FK → Organization, nullable) — enforces max 2-level hierarchy
- `deletedAt`, `createdAt`, `updatedAt`

**Role**
- `id`, `name` (enum: Owner | Admin | Viewer)
- `level` (Owner=3, Admin=2, Viewer=1) — used for role inheritance

**Permission**
- `id`, `resource` (e.g., `tasks`), `action` (e.g., `create`)
- Seeded at startup; not runtime-editable

**RolePermission** (join table)
- Composite PK: (`roleId`, `permissionId`)
- Seeded mappings: Owner → all, Admin → task:*/user:*/audit-log:read, Viewer → task:read/user:read

**Task**
- `id`, `title`, `description`, `status` (pending | in-progress | completed)
- `priority` (low | medium | high), `category`, `dueDate`, `tags` (JSONB)
- `createdById` (FK → User), `assignedToId` (FK → User, nullable)
- `organizationId` (FK → Organization)
- `deletedAt`, `createdAt`, `updatedAt`

**AuditLog**
- `id`, `userId` (FK → User, nullable), `action` (CREATE/READ/UPDATE/DELETE/LOGIN/LOGOUT)
- `resource`, `resourceId`, `method`, `endpoint`, `statusCode`
- `ipAddress`, `userAgent`, `metadata` (JSONB), `createdAt` (immutable)

### ERD

```
┌──────────────────┐
│  Organization    │
│ id (PK)          │◄────────┐ (self-ref parentId)
│ name             │         │
│ parentId (FK)────┘         │
└────────┬─────────┘         │
         │ 1:n               │
         ▼                   │
  ┌──────────────────────┐   │
  │       User           │   │
  │ id (PK)              │   │
  │ email (unique)       │   │
  │ password (hashed)    │   │
  │ roleId (FK)──────────┼───┼──────────────┐
  │ organizationId (FK)──┼───┘              │
  └────┬─────────────────┘                  │ n:1
       │ 1:n (creator/assignee)             ▼
       ▼                             ┌─────────────┐
  ┌──────────────────┐               │    Role     │
  │      Task        │               │ id (PK)     │
  │ id (PK)          │               │ name (enum) │
  │ title            │               │ level (int) │
  │ status (enum)    │               └──────┬──────┘
  │ priority (enum)  │                      │ n:n (via RolePermission)
  │ tags (JSONB)     │                      ▼
  │ createdById (FK) │           ┌──────────────────────┐
  │ assignedToId(FK) │           │   RolePermission     │
  │ organizationId   │           │ roleId (PK, FK)      │
  │ deletedAt        │           │ permissionId (PK,FK) │
  └──────────────────┘           └──────────┬───────────┘
                                            │ n:1
  ┌──────────────────┐                      ▼
  │    AuditLog      │           ┌─────────────────┐
  │ id (PK)          │           │   Permission    │
  │ userId (FK)──────┼──► User   │ id (PK)         │
  │ action (enum)    │           │ resource        │
  │ resource         │           │ action          │
  │ statusCode       │           └─────────────────┘
  │ metadata (JSONB) │
  │ createdAt        │
  └──────────────────┘
```

---

## Access Control Implementation

### Role Hierarchy

```
Owner (level 3)  →  Full access to own org + all child orgs
  └─ Admin (level 2)  →  Manage tasks/users within own org, view audit logs
       └─ Viewer (level 1)  →  Read-only access to tasks in own org
```

### Role Permission Matrix

| Action | Owner | Admin | Viewer |
|--------|:-----:|:-----:|:------:|
| Create task | ✅ | ✅ | ❌ |
| Read tasks (own org) | ✅ | ✅ | ✅ |
| Read tasks (child orgs) | ✅ | ❌ | ❌ |
| Update any task | ✅ | ✅ | ❌ |
| Delete any task | ✅ | ✅ | ❌ |
| View audit logs | ✅ | ✅ | ❌ |
| Manage users | ✅ | ✅ | ❌ |
| Delete users | ✅ | ❌ | ❌ |

### Guards and Decorators

Two guard types are implemented in `libs/auth`:

1. **`PermissionsGuard`** — checks for a specific `resource:action` permission
   ```typescript
   @RequirePermissions('tasks:create')
   ```

2. **`RoleLevelGuard`** — checks that the user's role level meets a minimum threshold
   ```typescript
   @RequireRoleLevel(2) // Admin (2) or Owner (3)
   ```

All endpoints also require **`JwtAuthGuard`**, which validates the JWT from the `Authorization: Bearer` header or the `access_token` HttpOnly cookie.

### JWT Integration with RBAC

1. User logs in via `POST /api/v1/auth/login`
2. Server validates credentials, returns JWT in an HttpOnly cookie (`access_token`) and user payload in the response body
3. `JwtAuthGuard` verifies the JWT on every protected request and attaches the full user (with role + organization) to `req.user`
4. `PermissionsGuard` / `RoleLevelGuard` read `req.user.role` to enforce access rules
5. The `AuditInterceptor` (global) logs every request to the `AuditLog` table

### Organization-Level Scoping

- Task queries are automatically filtered to the authenticated user's `organizationId`
- **Owner role only**: can also see tasks in child organizations (where `parentId = user.organizationId`)
- Users in child orgs cannot access parent org resources

---

## API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

Interactive docs (Swagger UI): `http://localhost:3001/api/v1/docs`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| POST | `/auth/register` | Register a new user | ❌ |
| POST | `/auth/login` | Login and receive JWT cookie | ❌ |
| POST | `/auth/logout` | Clear auth cookie | ✅ |
| GET | `/auth/me` | Get current user profile | ✅ |

### Task Endpoints

| Method | Endpoint | Description | Min Role |
|--------|----------|-------------|----------|
| POST | `/tasks` | Create a task | Admin |
| GET | `/tasks` | List tasks (org-scoped) | Viewer |
| GET | `/tasks/:id` | Get task by ID | Viewer |
| PUT | `/tasks/:id` | Update task | Admin |
| DELETE | `/tasks/:id` | Delete task (soft) | Admin |

### Audit Log Endpoints

| Method | Endpoint | Description | Min Role |
|--------|----------|-------------|----------|
| GET | `/audit-logs` | Get audit logs | Admin |

### Sample Requests

**Register**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "owner@acme.com",
  "password": "SecurePass123!",
  "firstName": "Alice",
  "lastName": "Smith",
  "organizationId": "<org-uuid>"
}
```

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "owner@acme.com",
  "password": "SecurePass123!"
}
```

Response (JWT set as HttpOnly cookie):
```json
{
  "user": {
    "id": "uuid",
    "email": "owner@acme.com",
    "firstName": "Alice",
    "lastName": "Smith",
    "role": { "name": "Owner", "level": 3 },
    "organization": { "id": "uuid", "name": "Acme Corp" }
  }
}
```

**Create Task**
```http
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Users can't log in on mobile",
  "priority": "high",
  "status": "pending",
  "category": "Work",
  "dueDate": "2026-03-01T00:00:00.000Z"
}
```

**List Tasks (with filters)**
```http
GET /api/v1/tasks?status=pending&priority=high
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "uuid",
    "title": "Fix login bug",
    "status": "pending",
    "priority": "high",
    "category": "Work",
    "createdBy": { "id": "uuid", "firstName": "Alice" },
    "organization": { "id": "uuid", "name": "Acme Corp" },
    "createdAt": "2026-02-17T00:00:00.000Z"
  }
]
```

**Get Audit Logs** (Admin/Owner only)
```http
GET /api/v1/audit-logs?resource=Task
Authorization: Bearer <token>
```

---

## Testing

Run backend unit tests:

```sh
pnpm nx test api
```

Run e2e tests:

```sh
pnpm nx e2e api-e2e
```

Tests cover:
- RBAC guard logic (role level and permissions)
- JWT authentication flow
- Task CRUD endpoints with different roles

---

## Build for Production

```sh
pnpm nx build api
```

---

## Tradeoffs and Unfinished Areas

### Completed
- ✅ NX monorepo with `libs/auth` and `libs/data` shared libraries
- ✅ JWT authentication (real, not mocked) with HttpOnly cookies
- ✅ RBAC guards and decorators (`PermissionsGuard`, `RoleLevelGuard`)
- ✅ Role inheritance via level-based comparison
- ✅ Task CRUD endpoints with permission checks
- ✅ Organization-level task scoping
- ✅ Automatic audit logging via global `AuditInterceptor`
- ✅ `GET /audit-logs` restricted to Admin and Owner
- ✅ Swagger/OpenAPI documentation
- ✅ Soft deletes on User, Organization, Task
- ✅ Database seeder for roles, permissions, and sample data

### Not Completed / Tradeoffs
- ❌ **Angular frontend (dashboard)** — not implemented; the assessment allows partial completion
- ❌ **Drag-and-drop UI, dark mode, keyboard shortcuts** — frontend bonus features not started
- ⚠️ **JWT refresh tokens** — access token is set in an HttpOnly cookie with 24h expiry; refresh token rotation is scaffolded (`refreshTokenHash` field on User) but not fully implemented
- ⚠️ **TypeORM `synchronize: true`** — used for development convenience; production should use migrations
- ⚠️ **Permissions seeded, not runtime-editable** — roles/permissions are fixed at startup; dynamic permission management would require additional admin endpoints
- ⚠️ **Account lockout** — `failedLoginAttempts` tracked but automatic lockout after 5 attempts is tracked but not enforced in the guard yet

---

## Future Considerations

- **JWT refresh tokens** — implement short-lived access tokens (15m) with long-lived refresh tokens (7d) and token rotation
- **CSRF protection** — add CSRF tokens for cookie-based auth in browser contexts
- **RBAC caching** — cache permission checks in Redis to reduce DB round-trips on high-traffic endpoints
- **Advanced role delegation** — allow Owners to grant scoped Admin permissions to users in child organizations
- **Efficient permission scaling** — move from per-request DB lookups to a permission bitmap or cached permission set loaded at login
- **Database migrations** — replace `synchronize: true` with TypeORM migrations for safe schema evolution
- **Angular frontend** — implement the dashboard with login UI, task CRUD, drag-and-drop reordering, and state management

---

## Useful Links

- [Nx Documentation](https://nx.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
