#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "📦 Building shared package..."
pnpm --filter @himvirasat/shared build

echo "🚀 Starting backend and frontend concurrently..."
pnpm --parallel --filter himvirasat-backend --filter himvirasat-frontend dev