#!/bin/bash
# Run seed scripts (requires docker-compose up first)
set -e
cd "$(dirname "$0")/.."

echo "Running database seed (accounts + coin packages)..."
npx ts-node --project tsconfig.json -r tsconfig-paths/register -e "
import { seedDatabase } from './src/lib/db/seed'
seedDatabase().then(r => { console.log(r); process.exit(0) }).catch(e => { console.error(e); process.exit(1) })
"

echo "Running book seed..."
npx ts-node --project tsconfig.json -r tsconfig-paths/register scripts/seed-books.ts

echo "Done!"
