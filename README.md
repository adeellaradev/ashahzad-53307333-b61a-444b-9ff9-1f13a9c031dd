# Secure Task Management System

A full-stack monorepo built with Nx, featuring a NestJS backend with role-based access control (RBAC).

## Tech Stack

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Authentication**: JWT
- **Validation**: class-validator, class-transformer
- **Monorepo**: Nx
- **Package Manager**: pnpm

## Getting Started

Install dependencies:

```sh
pnpm install
```

## Run Development Server

Run the NestJS backend:

```sh
pnpm nx serve api
```

API will be available at: `http://localhost:3001/api/v1`
Swagger docs available at: `http://localhost:3001/api/v1/docs`

## Build for Production

Build the backend:

```sh
pnpm nx build api
```

## Testing

Run backend tests:

```sh
pnpm nx test api
```

## Generate Code

Generate a NestJS resource (module, controller, service):

```sh
pnpm nx g @nx/nest:resource <resource-name> --project=api
```

Generate a shared library:

```sh
pnpm nx g @nx/nest:lib <lib-name>
```

View all available generators:

```sh
pnpm nx list
```

## Visualize Project Graph

View the dependency graph of your workspace:

```sh
pnpm nx graph
```

## Project Structure

```
apps/
  api/              → NestJS backend
  api-e2e/          → E2E tests for API

libs/
  data/             → Shared TypeScript interfaces and DTOs (coming soon)
  auth/             → Reusable RBAC logic and decorators (coming soon)
```

## Useful Links

- [Nx Documentation](https://nx.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
