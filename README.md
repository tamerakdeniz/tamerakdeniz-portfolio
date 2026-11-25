# Tamer Akdeniz — Below the Surface

Live production site: **[https://www.tamerakdeniz.com](https://www.tamerakdeniz.com)**

Personal software engineering portfolio and editorial project archive for **Tamer Akdeniz** (`TA`), designed and built around the **Below the Surface** spatial expedition concept.

---

## Design Philosophy — Below the Surface

Rather than a conventional card grid or template reskin, the home experience is structured as a continuous vertical expedition from `00 m` (Surface) to `60 m` (Beyond the Known). Bathymetric contour geometry, warm editorial paper chapters (`#EDECE6`), abyssal water chapters (`#080F16`), and a single progressive WebGL2 ocean shader act as connective tissue for verified engineering work, system architecture, and field notes.

Key UX and editorial principles:

- **Immediate clarity & dual modes:** Visitors can explore the spatial narrative on `/`, browse filterable project files on `/projects` and `/projects/[slug]`, or switch directly to the printable single-page **Recruiter View** (`/resume`) and in-page **CV** viewer from desktop and mobile headers down to `320px`.
- **Evidence over ornament:** Project plates distinguish authentic product screenshots, technical diagrams, project logos, and labeled conceptual cover illustrations (`ai-concept` provenance metadata) without misrepresenting synthetic art as UI captures.
- **Progressive motion & accessibility:** WebGL2 rendering pauses offscreen and disables cleanly under `prefers-reduced-motion` or when WebGL2 is unavailable, falling back to deterministic CSS gradients and procedural SVG contours with full keyboard navigation, focus restoration, and `44×44px` touch targets.

---

## Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router, Server Components, Incremental Static Regeneration with `revalidate = 60` + authenticated `/api/revalidate` on-demand cache invalidation)
- **UI & Graphics:** React 19, TypeScript 5.9, CSS Modules with custom design tokens (`Space Grotesk`, `Instrument Serif`, `IBM Plex Mono`, `Caveat`), custom WebGL2 fragment shader (`OceanScene`), and deterministic procedural SVG contours
- **Content & Storage:** Firebase Realtime Database (`siteData` public tree + `siteDrafts` admin-only tree), Firebase Storage (immutable hashed asset paths), and Firebase Authentication (`admin:true` custom claim)
- **AI Experiment:** Google Gemini (`@google/generative-ai`) server-side portfolio assistant with automatic model fallback
- **Abuse & Bot Protection:** Vercel BotID Basic (`botid` free tier with Vercel OIDC backend verification) + durable Firebase RTDB transaction-based rate limiting

---

## Dynamic CMS & Content Model

Content is managed live through the private `/admin` dashboard without requiring code changes or redeployments:

- **Public vs. private split:** Published content lives under `siteData` (publicly readable, admin-writable, schema-validated by `database.rules.json`). Unpublished drafts for projects, skills, and timeline entries live under `siteDrafts` (admin-only read/write) and never enter public HTML, routes, sitemaps, search, or AI assistant prompts.
- **Dynamic project archive:** New projects, case-study sections, screenshots, diagrams, and conceptual covers can be created, ordered, archived, or unpublished directly in `/admin`. The initial production release launched with **19 published projects** and **10 custom conceptual cover artworks**, with **4 flagship featured projects** (*AKAR*, *Telco CRM*, *Qirushio*, *ScreenTimer*) — all counts, ordering, and featured selections (`0–6`) are dynamically configurable in `/admin` rather than hardcoded limits.
- **Slug stability:** Renaming a published project's slug records the prior slug in `previousSlugs` and serves a permanent redirect (`308`) from `/projects/<old-slug>` to the canonical URL.
- **CV management:** Multiple PDFs (including language-specific variants) are managed in `/admin` and streamed with clean filenames via allow-listed `/api/download-cv`. CV documents intentionally retain the full legal name (*Mustafa Tamer Akdeniz*) while the public-facing site brand uses **Tamer Akdeniz**.
- **Brand marks & social preview:** Multi-resolution MTA waterline favicons (`/favicon.ico`, `16×16` / `32×32` PNGs, `180×180` Apple touch icon, `192×192` / `512×512` web-app icons, and `/site.webmanifest`) pair with a dedicated `1200×630` Open Graph and Twitter Card preview (`/og-image.png`).

---

## Bilingual (EN / TR) Architecture

- **Zero-reload switching:** Server-rendered pages emit localized bilingual copy (`<T />` and `<TBlocks />`) so switching between **English (`EN`)** and **Türkçe (`TR`)** via the header globe selector updates `<html lang>`, UI chrome, and content instantaneously without a network round-trip.
- **Persistence & graceful fallback:** Selection persists in `localStorage` (`portfolio_language`) and initializes before first paint via `BOOT_SCRIPT` in `src/app/layout.tsx`. Any optional Turkish CMS field left blank automatically falls back to English.

---

## Protected Public Endpoints (BotID Basic, Rate Limits & Gemini)

Both public interactive endpoints (`/api/chat` and `/api/contact`) fail closed unless `PORTFOLIO_PUBLIC_ACTIONS_ENABLED=1` and enforce layered server-side protection:

1. **Vercel BotID Basic (Free Tier):** Client instrumentation (`HumanCheck` / `initBotId`) pairs with server-side `checkBotId({ advancedOptions: { checkLevel: 'basic' } })` in `src/lib/public-action-guard.ts` using Vercel OIDC tokens (Deep Analysis remains disabled).
2. **Durable Firebase RTDB Rate Limits:** Atomic RTDB transactions keyed by HMAC-hashed trusted client IP (`PUBLIC_ACTION_IP_HASH_KEY`) enforce strict per-client and global budgets:
   - **Lab Assistant (`/api/chat`):** `5` requests / minute / client, `20` requests / day / client, `100` requests / day globally (plus an in-memory burst guard).
   - **Contact Form (`/api/contact`):** `2` submissions / 10 minutes / client, `5` submissions / day / client, `50` submissions / day globally.
3. **Restricted Server Identity:** Server routes authenticate to Firebase using a dedicated least-privilege service identity (`FIREBASE_SERVER_CREDENTIALS_JSON`) scoped strictly to `contactSubmissions` intake and `securityRateLimits` nodes — never broad Owner/Editor credentials.
4. **Published-Content-Only Gemini Assistant:** `/api/chat` builds its prompt strictly from published, non-archived `siteData` (`src/lib/content/assistant-context.ts`) using `gemini-3.1-flash-lite` as primary model and `gemini-2.5-flash-lite` as automatic fallback on transient capacity/rate errors (`src/lib/gemini-chat.ts`).

---

## Local Development, Emulators & Testing

### Prerequisites

- **Node.js** `24.x` and `npm`
- **Java** `21+` and **Firebase CLI** (`firebase-tools`) for local Auth, Realtime Database, and Storage emulators

### Install & Run Against Local Emulators

Local workflows pin the disposable `demo-portfolio` project on loopback (`127.0.0.1:9099` Auth, `127.0.0.1:9000` RTDB, `127.0.0.1:9199` Storage) and refuse to run if production credentials leak into emulator mode (`UNSAFE_EMULATOR_CONFIGURATION`).

```bash
npm ci

# Terminal 1 — start Firebase Auth, RTDB, and Storage emulators
npm run emulators

# Terminal 2 — seed synthetic demo data + admin@example.test, then start Next.js on http://localhost:3100
npm run seed:emulator
npm run dev:emulator
```

### Verification & Test Commands

```bash
# Static analysis
npm run typecheck
npm run lint

# Unit tests (content normalization, slugs, rate limits, BotID guard, media classification, contours)
npm test

# Firebase security rules & durable rate-limit abuse tests (starts/stops fresh emulators automatically)
npm run test:emulator

# Isolated read-only preview build (uses committed synthetic snapshot; requires zero external credentials)
npm run build:preview-snapshot

# Production build
npm run build

# End-to-end Playwright CMS + responsive/immersive browser suites (against emulator build on :3100)
npm run build:emulator
npm run start:emulator
npm run test:browser
```

---

## Repository Structure

```text
├── src/
│   ├── app/                    # Next.js App Router pages (/, /about, /projects, /projects/[slug], /resume, /admin) & API routes
│   ├── components/
│   │   ├── portfolio/          # Below the Surface chapters, ExpeditionChrome header/index, plates, gallery, lab & contact UI
│   │   └── scene/              # WebGL2 OceanScene, GLSL shaders, and scroll-depth director
│   ├── admin/                  # Authenticated /admin CMS editors, media uploader, backup/cleanup tools
│   ├── lib/                    # Portfolio normalization, bilingual copy, BotID/rate-limit guards, Firebase & Gemini clients
│   ├── store/                  # Client state stores
│   ├── styles/                 # Design tokens (tokens.css) and global editorial typography/layout rules (globals.css)
│   └── types/                  # Shared TypeScript domain models for CMS and public portfolio
├── content/
│   └── preview-snapshot.json   # Synthetic snapshot for isolated zero-credential preview builds
├── docs/
│   ├── operations.md           # Day-to-day CMS operations, emulator workflows, admin & import CLI guides
│   └── deployment.md           # Production environment, BotID/OIDC, cutover, and release verification runbook
├── scripts/                    # Emulator wrappers, admin claim tool, validated content/asset import utilities
├── tests/                      # Node unit tests, Firebase emulator rules/rate-limit tests, and Playwright suites
├── database.rules.json         # Production Firebase Realtime Database security & schema validation rules
└── storage.rules               # Production Firebase Storage access, path, MIME, and file-size rules
```

---

## Environment Variables

Configure variables in `.env.local` (never committed) or Vercel project settings. Secrets must **never** use a `NEXT_PUBLIC_` prefix.

### Public Browser Configuration (`NEXT_PUBLIC_*`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web SDK API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Web App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional analytics measurement ID |
| `NEXT_PUBLIC_VERCEL_ENV` | `production`, `preview`, or `development` |
| `NEXT_PUBLIC_PORTFOLIO_SNAPSHOT` | `1` to serve synthetic snapshot data only (`0` in production) |
| `NEXT_PUBLIC_FIREBASE_USE_EMULATORS` | `1` for local emulator loopback only (`0` in production) |
| `NEXT_PUBLIC_ALLOW_PREVIEW_WRITES` | Keep `0` unless targeting a dedicated non-production Firebase project |

### Server-Only Configuration

| Variable | Purpose |
| --- | --- |
| `PORTFOLIO_PUBLIC_ACTIONS_ENABLED` | Master switch (`1` enables `/api/chat` and `/api/contact`; `0` fails closed) |
| `PUBLIC_ACTION_IP_HASH_KEY` | Random secret key used to HMAC-hash client IPs before RTDB rate-limit transactions |
| `FIREBASE_SERVER_CREDENTIALS_JSON` | Restricted service-account JSON for server intake & durable quota transactions |
| `GEMINI_API_KEY` | Server-only Google Gemini API key for `/api/chat` |
| `GEMINI_MODEL` | Optional primary Gemini model override (defaults to `gemini-3.1-flash-lite`) |
| `GEMINI_MODEL_FALLBACK` | Optional fallback Gemini model override (defaults to `gemini-2.5-flash-lite`) |

Also enable **Secure Backend Access (Vercel OIDC)** in Vercel Project Settings so `botid/server` can verify BotID Basic challenges on serverless invocations; keep paid **BotID Deep Analysis** disabled.

---

## Further Documentation

- **[Operations Guide (`docs/operations.md`)](./docs/operations.md):** CMS editors, media lifecycle, emulator suites, admin claim provisioning, and candidate import scripts.
- **[Deployment Runbook (`docs/deployment.md`)](./docs/deployment.md):** Environment isolation, Preview snapshot builds, security gates, and release checklist.
- **Historical Design Briefs:** [DESIGN.md](./DESIGN.md) (Revision 1.0) and [IMMERSIVE_V2.md](./IMMERSIVE_V2.md) (Revision 2) are retained as archived pre-implementation creative specifications.
