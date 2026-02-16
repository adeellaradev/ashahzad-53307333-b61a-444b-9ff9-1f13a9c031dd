# Longquest

A full-stack monorepo built with Nx, featuring a NestJS backend and Next.js frontend.

## Tech Stack

- **Backend**: NestJS
- **Frontend**: Next.js with React 19 & Tailwind CSS
- **Monorepo**: Nx
- **Package Manager**: pnpm

## Getting Started

Install dependencies:

```sh
pnpm install
```

## Run Development Servers

Run the Next.js frontend:

```sh
pnpm nx dev ui
```

Run the NestJS backend:

```sh
pnpm nx serve api
```

Run both concurrently:

```sh
pnpm nx run-many -t serve,dev
```

## Build for Production

Build the frontend:

```sh
pnpm nx build ui
```

Build the backend:

```sh
pnpm nx build api
```

Build all projects:

```sh
pnpm nx run-many -t build
```

## Testing

Run tests for a specific project:

```sh
pnpm nx test ui
pnpm nx test api
```

Run all tests:

```sh
pnpm nx run-many -t test
```

## Generate Code

Generate a new Next.js app:

```sh
pnpm nx g @nx/next:app <app-name>
```

Generate a new NestJS app:

```sh
pnpm nx g @nx/nest:app <app-name>
```

Generate a NestJS resource (module, controller, service):

```sh
pnpm nx g @nx/nest:resource <resource-name> --project=api
```

Generate a shared library:

```sh
pnpm nx g @nx/nest:lib <lib-name>
pnpm nx g @nx/react:lib <lib-name>
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

## Useful Links

- [Nx Documentation](https://nx.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
