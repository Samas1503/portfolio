# Portfolio — Samuel Paredes

Personal portfolio with a built-in admin dashboard to manage its content (projects, skills, experience, services, testimonials) without redeploying.

**Live:** https://cv.samas-server.com

## Features

- **Dynamic content** — every section is read from Supabase (Postgres) through a small service/repository layer.
- **Admin CRUD** — after logging in, `DynamicForm` renders create/edit forms directly from the Zod schemas in `backend/data/schemas.ts`.
- **Generic, validated API** — `/api/table?tipo=<table>` and `/api/table/[id]` handle all tables; `withValidation` validates request bodies with Zod.
- **Auth** — JWT session cookie (`jose`) checked in `middleware.ts`; `/api` routes require a session.
- **Media** — image uploads to Cloudinary.
- **Contact form** — emails sent with Resend + React Email (`/api/send`).
- **UI** — Tailwind CSS v4, Radix UI / shadcn-style components, dark mode (`next-themes`), Embla carousel, Google Maps.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Supabase (`@supabase/supabase-js`) · Zod · React Hook Form · Tailwind CSS · Radix UI · Cloudinary · Resend · Vercel

## Project structure

```
app/                 # App Router pages, login/logout, API routes (api/table, api/send)
backend/
  Services/          # business logic per operation (get/post/update/delete)
  repository/        # Supabase queries
  data/schemas.ts    # Zod schemas per table (drive validation and forms)
  db/                # Supabase client + generated database types
components/pages/    # page sections and forms (DynamicForm, ModalTriggerButton)
utils/               # withValidation, response helpers, serialization
supabase/migrations/ # database schema
```

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

### Environment variables

Create `.env.local` with:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access (injected by the Vercel Supabase integration) |
| `SESSION_SECRET` | Key used to sign the session JWT |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_APY_KEY`, `CLOUDINARY_CLOUD_APY_SECRET` | Cloudinary uploads |
| `RESEND_API_KEY` | Contact form emails |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Map in the contact section |
| `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_FRONTEND_URL` | Base URLs used by the client |

## Database (Supabase)

The backend uses `@supabase/supabase-js` on the server only (`backend/db/supabase.ts`). All tables have RLS enabled with no policies, so they are only reachable with the service role key.

```bash
# Initial schema: supabase/migrations/
# Regenerate types after changing tables
npx supabase gen types typescript --project-id ahjufrjambuzlxraavky > backend/db/database.types.ts
```

## Deployment

Deployed on Vercel (project `portfolio-paredes-samuel`), with the custom domain `cv.samas-server.com`.
