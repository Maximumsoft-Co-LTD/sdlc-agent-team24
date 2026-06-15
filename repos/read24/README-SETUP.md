# Read24 — Setup Guide

## Prerequisites
- Docker + Docker Compose
- Node.js 18+

## Quick Start

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Seed the database** (two options):

   Option A — via API (after `npm run dev`):
   ```bash
   npm run dev
   curl -X POST http://localhost:3000/api/v1/seed
   ```

   Option B — via script (while docker is running):
   ```bash
   npm run seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open:** http://localhost:3000

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| ผู้อ่าน | reader@read24.com | Reader1234! |
| สำนักพิมพ์ | publisher@read24.com | Pub1234! |
| แอดมิน | admin@read24.com | Admin1234! |

## Services
- **App:** http://localhost:3000
- **MongoDB:** localhost:27017
- **MinIO Console:** http://localhost:9001 (minioadmin/minioadmin)
