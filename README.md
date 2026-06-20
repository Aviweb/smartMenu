# SmartMenu Lite

A SaaS platform for restaurants to manage digital menus and generate bills.

## Project Structure

```
menu/
├── apps/
│   ├── web/          # Next.js 15 — API + public menu website
│   └── mobile/       # Expo (React Native) — business owner app
├── packages/
│   └── db/           # Prisma schema + shared client
├── package.json      # npm workspaces root
└── .gitignore
```

---

## Quick Start

### 1. Install dependencies (already done)

```bash
npm install
```

### 2. Configure environment

Edit `apps/web/.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/smartmenu"
JWT_SECRET="your-long-random-secret"

# Cloudflare R2 or AWS S3 (optional for image uploads)
S3_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
S3_BUCKET="smartmenu"
S3_ACCESS_KEY="your-key"
S3_SECRET_KEY="your-secret"
S3_REGION="auto"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Edit `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Edit `packages/db/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/smartmenu"
```

### 3. Set up the database

Make sure PostgreSQL is running, then:

```bash
# Create the database
createdb smartmenu

# Run migrations
npm run db:migrate

# Or push schema directly (dev only)
npx prisma db push --schema=packages/db/prisma/schema.prisma
```

### 4. Run the web app

```bash
npm run dev
```

Opens at http://localhost:3000

Public menu: http://localhost:3000/menu/your-business-slug

### 5. Run the mobile app

```bash
cd apps/mobile
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create business account |
| POST | `/api/auth/login` | No | Login |
| GET/PUT | `/api/business` | Yes | Get/update business profile |
| GET | `/api/business/qr?format=png` | Yes | Download QR code |
| GET/POST | `/api/categories` | Yes | List/create categories |
| PUT/DELETE | `/api/categories/:id` | Yes | Update/delete category |
| GET/POST | `/api/menu-items` | Yes | List/create menu items |
| PUT/DELETE | `/api/menu-items/:id` | Yes | Update/delete item |
| PATCH | `/api/menu-items/:id/status` | Yes | Toggle availability |
| GET | `/api/public/menu/:slug` | No | Public menu data |
| GET/POST | `/api/invoices` | Yes | List/create invoices |
| GET | `/api/invoices/:id` | Yes | Invoice details |
| GET | `/api/dashboard` | Yes | Dashboard stats |
| POST | `/api/upload` | Yes | Upload image (logo/item) |

---

## Database Schema

```
businesses  ←→  users
businesses  ←→  categories
businesses  ←→  menu_items  ←→  categories
businesses  ←→  invoices    ←→  invoice_items  ←→  menu_items
```

---

## Mobile App Screens

| Screen | Route |
|--------|-------|
| Login | `/(auth)/login` |
| Register | `/(auth)/register` |
| Dashboard | `/(app)/(tabs)/dashboard` |
| Menu / Categories | `/(app)/(tabs)/menu-items` |
| Category Items | `/(app)/categories/[id]` |
| Edit Item | `/(app)/menu-items/[id]` |
| Create Bill | `/(app)/billing/create` |
| Invoice List | `/(app)/(tabs)/invoices` |
| Invoice Detail | `/(app)/invoices/[id]` |
| QR Code | `/(app)/(tabs)/qr` |
| Settings / Profile | `/(app)/(tabs)/settings` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Framework | Next.js 15 (App Router) |
| Mobile | Expo + React Native |
| Database | PostgreSQL + Prisma |
| Auth | JWT (jose) + bcrypt |
| Validation | Zod |
| UI (web) | Tailwind CSS |
| UI (mobile) | React Native Paper |
| State (mobile) | Zustand |
| Data fetching | TanStack Query |
| File storage | Cloudflare R2 / AWS S3 |
| QR Code | qrcode |
