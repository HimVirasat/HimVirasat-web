# Local Development Setup

This guide takes a clean machine from zero to a running HimVirasat monorepo.

## 1. Prerequisites

Install these first:

- Node.js 20 or newer
- pnpm 11.3.0
- Git
- A Supabase project for backend API development

Check your versions:

```bash
node --version
pnpm --version
git --version
```

If pnpm is missing, install it with Corepack:

```bash
corepack enable
corepack prepare pnpm@11.3.0 --activate
```

## 2. Clone The Repository

```bash
git clone <repo-url>
cd HimVirasat-web
```

Run all pnpm commands from the repository root, not from `himvirasat-frontend` or `himvirasat-backend`.

## 3. Understand The Workspace

The repo is a pnpm workspace:

```text
HimVirasat-web/
├── himvirasat-frontend/   # Next.js app, runs on port 3000
├── himvirasat-backend/    # Express API, runs on port 3002
├── packages/shared/       # Shared TypeScript package
├── package.json           # Root monorepo scripts
└── pnpm-workspace.yaml    # Workspace package list and pnpm build approvals
```

The shared package is consumed as:

```json
"@himvirasat/shared": "workspace:*"
```

If you add it manually in zsh, quote the `*`:

```bash
pnpm add '@himvirasat/shared@workspace:*' --filter himvirasat-frontend
```

## 4. Install Dependencies

From the repository root:

```bash
pnpm install
```

This installs dependencies for the frontend, backend, and shared package. Native dependency build approvals are stored in `pnpm-workspace.yaml`, so pnpm should run the required install scripts automatically.

## 5. Configure Environment Variables

### Backend

Create a backend env file:

```bash
cp himvirasat-backend/.env.example himvirasat-backend/.env
```

Fill in the values:

```bash
PORT=3002
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=7d
```

Optional LLM variables, needed only for routes that call OpenRouter:

```bash
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
SITE_URL=http://localhost:3000
```

### Frontend

Create a frontend env file:

```bash
cp himvirasat-frontend/.env.example himvirasat-frontend/.env.local
```

Default local value:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## 6. Build Shared Code

The shared package builds to `packages/shared/dist`.

```bash
pnpm --filter @himvirasat/shared build
```

During active shared-package development, run this in a separate terminal:

```bash
pnpm --filter @himvirasat/shared dev
```

## 7. Run The Project Locally

Use two terminals from the repository root.

Terminal 1, backend:

```bash
pnpm dev:backend
```

Backend URL:

```text
http://localhost:3002
```

Health check:

```text
http://localhost:3002/health
```

Terminal 2, frontend:

```bash
pnpm dev:frontend
```

Frontend URL:

```text
http://localhost:3000
```

## 8. Verify The Setup

Confirm pnpm sees every workspace package:

```bash
pnpm -r list --depth -1
```

Run TypeScript checks:

```bash
pnpm typecheck
```

Run production builds:

```bash
pnpm build
```

Run package-specific commands when needed:

```bash
pnpm --filter himvirasat-frontend typecheck
pnpm --filter himvirasat-backend build
pnpm --filter @himvirasat/shared build
```

## 9. Common Development Commands

```bash
pnpm dev:frontend      # Start Next.js on port 3000
pnpm dev:backend       # Start Express API on port 3002
pnpm typecheck         # Typecheck workspace packages that define typecheck
pnpm build             # Build frontend, backend, and shared package
pnpm lint              # Run workspace lint scripts
```

## 10. Troubleshooting

### zsh: no matches found: @himvirasat/shared@workspace:*

zsh treats `*` as a glob. Quote the dependency spec:

```bash
pnpm add '@himvirasat/shared@workspace:*' --filter himvirasat-frontend
```

### No projects matched the filters

Make sure you are at the repository root and that the package name is correct:

```bash
pnpm -r list --depth -1
```

Current package names:

```text
himvirasat-frontend
himvirasat-backend
@himvirasat/shared
```

### Backend exits with missing environment variables

Check that `himvirasat-backend/.env` exists and includes:

```text
PORT
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
JWT_EXPIRES_IN
```

### Frontend cannot reach the backend

Check:

- Backend is running on `http://localhost:3002`
- `himvirasat-frontend/.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:3002`
- Browser requests are not blocked by CORS

### pnpm reports ignored build scripts

The approved native packages are listed in root `pnpm-workspace.yaml` under `allowBuilds`. If new native dependencies are added later, approve them intentionally:

```bash
pnpm approve-builds
pnpm install
```

### `/etc/profile` prints `^M` or parse errors

That is a machine shell configuration issue caused by Windows-style line endings in `/etc/profile`. It is not caused by this repo. Fix the file line endings or ask your system administrator to convert `/etc/profile` to Unix line endings.

## 11. Clean Start

If local dependencies get into a bad state, remove generated install artifacts and reinstall:

```bash
rm -rf node_modules himvirasat-frontend/node_modules himvirasat-backend/node_modules packages/shared/node_modules
pnpm install
pnpm build
```

Do not delete `pnpm-lock.yaml` unless you intentionally want to refresh dependency resolutions.

## 12. Deployment Notes

### Vercel Frontend

The frontend depends on `@himvirasat/shared`, so Vercel must build the shared package before `next build`.

The frontend project includes `himvirasat-frontend/vercel.json` with:

```bash
cd .. && pnpm install --frozen-lockfile
cd .. && pnpm --filter @himvirasat/shared build && pnpm --filter himvirasat-frontend build
```

Keep the Vercel project root directory set to:

```text
himvirasat-frontend
```

Set this frontend environment variable in Vercel:

```text
NEXT_PUBLIC_API_URL=https://your-render-backend-url
```

### Render Backend

The safest Render setup is to build from the monorepo root and use pnpm filters.

Render dashboard settings:

```text
Root Directory: .
Build Command: pnpm install --frozen-lockfile && pnpm --filter himvirasat-backend build
Start Command: pnpm --filter himvirasat-backend start
```

The backend build script also builds `@himvirasat/shared` first, so the backend does not start with missing shared package `dist` files.

Required Render environment variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-vercel-frontend-url
```

Render injects `PORT` automatically for web services.
