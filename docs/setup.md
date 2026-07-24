# Local Development Setup

This guide will take you from a clean machine to a fully running HimVirasat development environment.

---

# Quick Start

If you just want to get the project running:

```bash
git clone <repo-url>
cd HimVirasat-web

pnpm install

cp himvirasat-backend/.env.example himvirasat-backend/.env
cp himvirasat-frontend/.env.example himvirasat-frontend/.env.local

pnpm dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:3002

---

# Workspace Commands

Run all commands from the repository root.

## Install dependencies for the entire monorepo

```bash
pnpm install
```

This installs dependencies for:

- `himvirasat-frontend`
- `himvirasat-backend`
- `packages/shared`

---

## Start everything

```bash
pnpm dev
```

This will:

- Build the shared package
- Start the backend
- Start the frontend

---

## Start only the frontend

```bash
pnpm dev:frontend
```

---

## Start only the backend

```bash
pnpm dev:backend
```

---

## Build everything

```bash
pnpm build
```

---

## Build only the backend

```bash
pnpm --filter himvirasat-backend build
```

---

## Build only the frontend

```bash
pnpm --filter himvirasat-frontend build
```

---

## Build only the shared package

```bash
pnpm --filter @himvirasat/shared build
```

---

## Run type checking

```bash
pnpm typecheck
```

---

## Run linting

```bash
pnpm lint
```

---

# Prerequisites

Install the following software before continuing.

- Node.js 20 or newer
- pnpm 11.3.0
- Git
- A Supabase project

Verify your installation:

```bash
node --version
pnpm --version
git --version
```

If pnpm is missing:

```bash
corepack enable
corepack prepare pnpm@11.3.0 --activate
```

---

# Clone the Repository

```bash
git clone <repo-url>
cd HimVirasat-web
```

All pnpm commands in this guide should be executed from the repository root.

---

# Repository Structure

```text
HimVirasat-web/
├── himvirasat-frontend/      # Next.js frontend
├── himvirasat-backend/       # Express backend
├── packages/
│   └── shared/               # Shared types and utilities
├── package.json
└── pnpm-workspace.yaml
```

The frontend and backend both depend on the shared workspace package:

```json
"@himvirasat/shared": "workspace:*"
```

If you ever add the dependency manually while using zsh, quote the workspace version:

```bash
pnpm add '@himvirasat/shared@workspace:*' --filter himvirasat-frontend
```

---

# Install Dependencies

From the repository root:

```bash
pnpm install
```

This installs every workspace package in one command.

You never need to run `pnpm install` separately inside the frontend or backend folders.

---

# Configure Environment Variables

## Backend

Create the backend environment file:

```bash
cp himvirasat-backend/.env.example himvirasat-backend/.env
```

Example configuration:

```env
PORT=3002
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

FRONTEND_URL=http://localhost:3000

JWT_SECRET=replace-with-a-random-secret
JWT_EXPIRES_IN=7d
```

Optional OpenRouter configuration:

```env
OPENROUTER_API_KEY=your-key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
SITE_URL=http://localhost:3000
```

---

## Frontend

Create the frontend environment file:

```bash
cp himvirasat-frontend/.env.example himvirasat-frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

# Running the Project

## Start the entire application

```bash
pnpm dev
```

This command automatically:

- Builds the shared package
- Starts the backend
- Starts the frontend

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:3002
```

Health endpoint:

```text
http://localhost:3002/health
```

---

## Running individual services

### Backend only

```bash
pnpm dev:backend
```

### Frontend only

```bash
pnpm dev:frontend
```

---

# Building

## Build everything

```bash
pnpm build
```

This recursively builds every workspace package.

---

## Build backend

```bash
pnpm --filter himvirasat-backend build
```

The backend build automatically builds the shared package first.

---

## Build frontend

```bash
pnpm --filter himvirasat-frontend build
```

---

## Build shared package

```bash
pnpm --filter @himvirasat/shared build
```

---

# Useful Commands

List all workspace packages:

```bash
pnpm -r list --depth -1
```

Type check every package:

```bash
pnpm typecheck
```

Lint every package:

```bash
pnpm lint
```

Type check only the frontend:

```bash
pnpm --filter himvirasat-frontend typecheck
```

Build only the backend:

```bash
pnpm --filter himvirasat-backend build
```

Build only the frontend:

```bash
pnpm --filter himvirasat-frontend build
```

Build only the shared package:

```bash
pnpm --filter @himvirasat/shared build
```

---

# Troubleshooting

## zsh: no matches found: @himvirasat/shared@workspace:*

zsh expands `*` as a wildcard.

Use quotes:

```bash
pnpm add '@himvirasat/shared@workspace:*' --filter himvirasat-frontend
```

---

## No projects matched the filters

Make sure you are in the repository root.

Verify workspace package names:

```bash
pnpm -r list --depth -1
```

Current package names:

```text
himvirasat-frontend
himvirasat-backend
@himvirasat/shared
```

---

## Backend exits because environment variables are missing

Ensure:

```
himvirasat-backend/.env
```

exists and contains:

```text
PORT
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
JWT_EXPIRES_IN
```

---

## Frontend cannot connect to the backend

Verify:

- Backend is running on `http://localhost:3002`
- `NEXT_PUBLIC_API_URL=http://localhost:3002`
- Browser requests are not blocked by CORS

---

## pnpm reports ignored build scripts

Approved native builds are listed in:

```text
pnpm-workspace.yaml
```

If new native dependencies are introduced:

```bash
pnpm approve-builds
pnpm install
```

---

## `/etc/profile` shows `^M` or parse errors

This is caused by Windows line endings in your shell configuration.

It is unrelated to this repository.

Convert `/etc/profile` to Unix line endings.

---

# Clean Installation

If dependencies become corrupted:

```bash
rm -rf \
node_modules \
himvirasat-frontend/node_modules \
himvirasat-backend/node_modules \
packages/shared/node_modules

pnpm install
pnpm build
```

Avoid deleting `pnpm-lock.yaml` unless you intentionally want to regenerate dependency versions.

---

# Deployment

## Frontend (Vercel)

The frontend depends on the shared workspace package.

Build command:

```bash
cd .. && pnpm install --frozen-lockfile
cd .. && pnpm --filter @himvirasat/shared build
pnpm --filter himvirasat-frontend build
```

Project Root Directory:

```text
himvirasat-frontend
```

Environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url
```

---

## Backend (Render)

Recommended configuration:

Root Directory:

```text
.
```

Build Command:

```bash
pnpm install --frozen-lockfile
pnpm --filter himvirasat-backend build
```

Start Command:

```bash
pnpm --filter himvirasat-backend start
```

The backend build automatically builds the shared package before compiling the backend.

Required environment variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url
```

Render automatically injects the `PORT` environment variable.