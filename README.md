# Aila

Aila is an AI software company and product ecosystem. It is not a template, a chat demo, or a portfolio mock.

People use Aila to chat with a shared intelligence layer, store work on their own account, and run product workspaces for writing, documents, legal review, planning, commerce, and operations. Aila Luxe also builds custom websites, applications, and automation for clients.

Live site: [https://aila.website](https://aila.website)

---

## Why it exists

Most “AI platforms” are a landing page and a single chat box. Aila is built as one company with many products that share authentication, billing, a database, and one AI request path.

The goal is simple: a signed-in user can do real work, see their own data, and get a model response that is grounded in that data — without pretending unused integrations exist.

---

## Core capabilities

- **Aila Intelligence** — signed-in chat, optional file attachments, persisted conversations
- **Aila Legal** — PDF/TXT upload, text extraction, stored analysis, legal-mode chat
- **Everyday workspaces** — Daily, Writer, Translate, Documents
- **Professional workspaces** — Business, Ads (planning only), Automation, Coding, Career
- **Life workspaces** — Education, Health, Finance, Travel
- **Operations** — Commerce catalogs and orders (mark paid after external payment), Shipping records, Calendar, Sites, Apps listings, Flow
- **Billing** — Free products plus Aila Pro via Paystack (₦15,000/month or ₦150,000/year)
- **Project intake** — public inquiry form for custom build work

Salon is not implemented and is not registered in the product catalog.

---

## Architecture

```
User request
  → Clerk session
  → Prisma user + product entitlement
  → product intent / workspace context
  → orchestrator (Intelligence tools when enabled)
  → OpenRouter
  → structured / streamed result
  → UI
```

The application is a Next.js App Router codebase with a clear split:

| Layer | Location |
| --- | --- |
| UI and product pages | `src/app`, `src/components` |
| Product domain logic | `src/core/<product>` |
| AI engine and orchestration | `src/core/ai` |
| Auth and entitlements | `src/core/auth`, `src/lib/auth` |
| Database client | `src/core/database`, `prisma/` |
| API routes | `src/app/api` |
| Shared config, errors, logging | `src/lib` |

Provider-specific HTTP lives in `src/core/ai/openrouter`. Changing models later should not require rewriting every product page.

Some older modules under `src/core/ai/` are unused stubs from earlier experiments. They are not on the live chat path. The live path is `/api/ai` → orchestrator → `engine.ts` → OpenRouter.

---

## Technology stack

- **Next.js 16** (App Router) and **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Prisma 7** with PostgreSQL (`pg` adapter)
- **Clerk** for authentication
- **Neon PostgreSQL** with **Prisma**
- **OpenRouter** (`openai/gpt-4.1-mini`) for model calls
- **Paystack** for Aila Pro subscriptions
- **Resend** for project inquiries and automation email
- **Cloudflare** for DNS/edge
- **Vercel** for hosting, Analytics, Speed Insights, and cron

---

## Major products

Products are registered in `src/core/products/catalog.ts`. That file is the source of truth for routes, paid/free status, and descriptions.

**Free (with a signed-in account):** Intelligence, Daily, Writer, Translate, Documents, Ads.

**Paid (Aila Pro or a staff grant):** Legal, Business, Automation, Coding, Career, Education, Health, Finance, Travel, Commerce, Shipping, Calendar, Sites, Apps, Flow.

Ads plans campaigns and generates copy. It does not buy ads and does not show live network metrics unless a real connection exists (none are wired in this release).

Legal analyzes documents you upload. It is not a law firm and is not a substitute for qualified legal advice.

---

## AI architecture

1. The client sends the latest user message and optional Intelligence `documentIds`.
2. The API authenticates with Clerk, maps to a Prisma user, checks entitlements, and rate-limits.
3. Prior turns come from the database, not from client history.
4. Client-supplied `documentText` is ignored. Intelligence uses stored attachments. Legal chat uses the latest stored legal document for that user.
5. Intelligence can run a small local tool loop (calculator, text/data analysis). Web research is not configured.
6. The model call goes to OpenRouter. Streams persist only after a completed, non-empty reply.

---

## Authentication and database

- Clerk handles sign-in and sign-up (`/sign-in`, `/sign-up`).
- `src/proxy.ts` attaches the Clerk session. Product access is enforced on pages and API routes, not by a global `auth.protect()`.
- Each user’s data is scoped with `userId` on Prisma models.
- Published Sites at `/s/[id]` are public by design.
- Clerk `user.deleted` removes the Aila user and cascaded product data.

There is no organization/team tenancy in this release.

---

## Local development

Requirements: Node.js 20+, a PostgreSQL database, and Clerk development keys.

```bash
cp .env.example .env.local
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Do not paste production secrets into chat, source files, or git. Set real values only in `.env.local` or the Vercel project.

In `NODE_ENV=development`, paid product entitlements are unlocked so local workspaces can be used without a Paystack subscription.

---

## Environment variables

See `.env.example`. Names only — never commit values.

**Required for a working local app**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `OPENROUTER_API_KEY` (OpenRouter key, not an OpenAI/Anthropic key)

**Required for production features**

- `CLERK_WEBHOOK_SIGNING_SECRET`
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` or `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_PLAN_CODE_MONTHLY`, `PAYSTACK_PLAN_CODE_YEARLY`
- `CRON_SECRET` (Vercel Cron for automations)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `PROJECT_INQUIRY_EMAIL` (inquiries and automation email)

Aila Pro does **not** use Stripe. Commerce does not run live checkout; orders are marked paid after payment outside Aila.

`NEXT_PUBLIC_APP_URL` defaults to `https://ailaluxe.com`.

Supabase variables exist in the schema for a possible future integration. They are not used by live routes.

---

## Testing

```bash
npm test
npm run typecheck
npm run lint
```

Tests cover product schemas, billing entitlements, AI request validation, Intelligence file handling, Legal upload validation, and Prisma connection-string hardening.

Playwright is installed for optional browser tests. It is not part of `npm test`.

---

## Build

```bash
npm run build
npm start
```

---

## Deployment

The production app is the existing Vercel project for this repository. Do not create a second production project.

Production hosts already authorized for Clerk sessions include `ailaluxe.website` and `aila.website`.

Set environment variables in the Vercel project (Production / Preview). Apply Prisma migrations with `npx prisma migrate deploy` against the production database — never `migrate reset` on production data.

Vercel Cron calls `GET /api/cron/automations` hourly (`vercel.json`).

---

## Project structure

```
src/app/(shell)     Marketing site, dashboard, billing, product pages
src/app/api         Route handlers
src/app/s           Public published sites
src/components      UI, workspaces, chat, legal upload
src/core            Domain services, AI engine, catalog, Prisma
src/lib             Env, auth helpers, errors, logging
prisma/             Schema and migrations
```

---

## Known limitations

- Rate limits are process-local. They will not hold across multiple serverless instances.
- Aila Ads does not connect to Meta, Google, TikTok, or LinkedIn.
- Aila Shipping does not query carrier networks.
- Aila Health does not send notifications and is not medical care.
- Aila Finance has no bank connection.
- Aila Travel does not book travel.
- Aila Apps is a listing registry, not an app builder or native iOS/Android runtime.
- Aila Commerce stores catalogs and orders; it does not collect card payments inside Aila.
- Daily tasks currently reuse the Business task table for the same user.
- Document text is stored in Postgres so the owner can reopen it. There is no separate redaction/OCR pipeline for scanned PDFs.
- Unused AI stub modules remain in `src/core/ai/` and are not part of the live path.

---

## Company

**Aila Luxe Ventures** · Aila · [aila.website](https://aila.website)

Primary contact: ailaluxeventures@gmail.com  
Secondary: ailaluxeventures@outlook.com

---

## License

Proprietary. © Aila Luxe Ventures / Aila. All rights reserved.
