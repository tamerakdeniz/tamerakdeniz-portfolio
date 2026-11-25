# Portfolio operations

The immersive presentation lives in source, while ordinary portfolio content lives in Firebase Realtime Database and managed binary assets live in Firebase Storage. Local development, automated verification, and rehearsals always target the isolated Firebase Emulator Suite (`demo-portfolio`) by default; production CLI utilities require explicit targeting and confirmation flags.

## Local setup

Use Node 24, Java 21, npm and Firebase CLI (`firebase --version`). Install dependencies with `npm ci`. Chrome is used by the browser harness; Playwright is a development dependency.

```sh
npm run emulators
# In another terminal:
npm run seed:emulator
npm run dev:emulator
```

The wrapper pins `demo-portfolio`, Auth `127.0.0.1:9099`, Database `127.0.0.1:9000`, Storage `127.0.0.1:9199`, and the app at `localhost:3100`. It overrides inherited Firebase values and blanks Gemini credentials. Misconfigured emulator mode throws `UNSAFE_EMULATOR_CONFIGURATION`; it cannot silently use production. `.firebaserc` defaults to the demo project. Emulator state is disposable; rules tests reset it. Never run destructive tests against a real project.

Synthetic login: `admin@example.test` / `Emulator-only-123!`. This account is created only on loopback by the seed script. The seed refuses to overwrite existing content. Its claim is assigned only in the emulator.

```sh
npm run typecheck
npm run lint
npm test
npm run test:emulator # starts/stops fresh emulators; stop an existing emulator first
# For tests against already running emulators:
node --import ./tests/register.mjs --test tests/emulator/*.test.ts
npm run seed:emulator
npm run build:emulator
npm run start:emulator
npm run test:browser
```

The lifecycle creates a unique project AFTER `next build`, exercises the real UI/SDK/REST/Storage, and saves results/screenshots under ignored `artifacts/`. Do not run a dev server that writes the same `.next` directory while building or running production.

Additional browser suites use that lifecycle's saved **emulator-only** admin session:

```sh
node tests/browser/editors.mjs
node --import ./tests/register.mjs tests/browser/media-safety.mjs
node tests/browser/public-settings.mjs
# Create self-contained synthetic presentation fixtures:
node tests/browser/prepare-regression.mjs
node tests/browser/responsive.mjs
node tests/browser/immersive.mjs artifacts/immersive http://localhost:3100
node tests/browser/scene-lifecycle.mjs
```

`prepare-regression.mjs` replaces only the emulator's public project collection with six mixed-presentation featured fixtures and four laboratory fixtures. It uses only synthetic fixtures in this repository. Browser scripts are fixed to loopback; no production URL option exists for mutations. The immersive script accepts a URL but mocks contact writes and AI responses. `preview.mjs` expects a separate temporary source copy at port 3101 with the fixed emulator environment plus `NEXT_PUBLIC_VERCEL_ENV=preview` and `NEXT_PUBLIC_ALLOW_PREVIEW_WRITES=0`; never run that copy against production services. The preview check was performed with `next dev --webpack`, its own `.next` and no copied `.env`.

## Content model

- `siteData`: anonymously readable, published content only. Projects require `published:true`; skills and timeline retain legacy missing-flag compatibility. Explicit unpublished records are rejected by rules.
- `siteDrafts`: admin-only `projects`, `skills`, `timeline`. The editor merges both nodes and saves their split in one atomic root multi-location update. It refuses writes until both subscriptions load (`CONTENT_NOT_LOADED`).
- About, home, profile, contact details and CV are public settings; they do not have a private staging workflow.
- Archived projects remain published and reachable by their direct URL, with noindex metadata. They are absent from archive lists, command search, sitemap, assistant context and featured work.
- Contact messages are separate under admin-only `contactSubmissions`; they never enter portfolio or assistant data.

Use one active content editor at a time. Whole-tree saves are atomic, but there is no compare-and-swap revision protocol or collaborative merge. Two admins/tabs can overwrite each other's edits. A publication change is not a guarantee of revoking already cached public content or downloaded files.

## Add a completely new project without a deploy

1. Sign into `/admin` using an account carrying the Firebase `admin:true` custom claim.
2. Open **Projects → Add New**. Supply English and Turkish title/description, a unique URL slug, categories and comma-separated technologies.
3. Add verified role, contribution, dates/status, source/demo links and case study sections where useful. Empty Turkish fields fall back to English; the form calls this out.
4. Expand **Images & media**. Upload a cover, desktop/mobile screenshots or diagrams. Add bilingual alternative text and captions. Upload progress, cancel and retry are available. Screenshots must represent the actual product; label synthetic demonstrations.
5. Choose a reusable presentation variant, accent and logo background or leave Auto. Source changes are not needed for new media or layouts supported by the variants.
6. Save as **Private draft**. The record is not available publicly. Storage URLs are bearer/public assets: do not upload confidential documents or private user data, even in a draft.
7. Review the content, then select **Published** and Save (or use the list's Publish control). Visit `/projects/<slug>` in a fresh browser tab. This works for slugs absent at build time.
8. Toggle **Featured project** and set its featured order. **Profile & display → Featured project count** accepts 0–6; 0 hides the stack. If no records carry a featured flag, the legacy fallback chooses the first projects by order. Archive excludes archived entries.
9. When renaming a published slug, the old slug is retained automatically and permanently redirected. Review manually supplied previous slugs for conflicts. Active current slugs take precedence.
10. Use **Archived** to keep a URL accessible but remove it from listings. Use **Private draft** or Unpublish to remove public availability.

The save requests authenticated cache revalidation. A full browser refresh sees the change; an already-open page does not subscribe to Firebase. If cache invalidation fails, a request after the 60-second fetch window starts stale-while-revalidate regeneration; allow another request/refresh after that completes. It is not a strict 60-second maximum. New-route 404s are also invalidated after a successful save.

## Other editors

- **About:** bilingual biography, active entry and portrait. The field journal, About page and recruiter summary use the active entry.
- **Home Page:** bilingual hero copy and availability.
- **Profile & display:** full/short name, bilingual professional role, field photo with alt/caption/note, engineering pillars and featured count. Contact/social/CV remain in their dedicated sections.
- **Skills:** name, categories, icon, publication and order. New entries receive stable IDs. Categories are editable; public engineering groupings retain known categories and an Other fallback.
- **Timeline:** work, education, certification or achievement; bilingual title/institution/descriptions; month dates, ongoing status, URL and display order. Structured dates override legacy period text. Leave unknown dates empty; do not invent them.
- **CV:** PDF upload, document language, selection and deletion. A language-specific document is used when available; the selected/default CV remains the fallback. Select a document to prefer it within its language. Upload limits match Storage rules (15 MB PDFs).
- **Contact:** public email, bilingual location, social links, and separate private inbox controls.

## Media lifecycle

Uploads use immutable unique paths under `portfolio/{projects,about,cv,hero,profile}/<entity>/`. Database records store URLs and paths; large base64 is not content storage. Replacement never overwrites a live object. The successful database save comes first; released managed paths are then compared against the fresh published + draft reference graph before deletion. Shared references are preserved. Cleanup failures leave recoverable orphans and show a warning. Legacy objects with non-managed names are never deleted automatically.

Settings' unused-media scan lists only known generated/import paths older than 24 hours. It loads both public and draft references, requires every listing/metadata request to succeed, and selects nothing automatically. Review paths and sizes, select candidates, then explicitly confirm deletion. Confirmation triggers a fresh scan and reference check. Failed or newly referenced files are retained. Never run production cleanup as part of this handover. The grace period protects recent abandoned/open uploads, but not indefinitely open forms; finish or cancel uploads before sweeping. Concurrent editors are unsupported.

Images: PNG/JPEG/WebP/AVIF/GIF ≤10 MB; video MP4/WebM ≤60 MB; PDF ≤15 MB. MIME and size are enforced in Storage rules. MIME checking is not malware scanning and cannot prove file contents. Public Storage `get` is permitted; listing is admin-only. Random URLs, download tokens and private DB records do not make uploaded binaries confidential.

Settings can export the merged backup or import a complete validated backup after confirmation. Candidate imports use the CLI below, not the full-backup replacement UI. Export before replacement. Inline migration uploads new objects before saving URLs; failures retain the original content for retry.

## Provision an admin

Run a dry run first. Supply both UID and expected email; the script verifies the target account, preserves unrelated claims and requires explicit targeting.

```sh
node scripts/grant-admin.mjs --environment emulator --project demo-portfolio --uid USER_ID --email admin@example.test --dry-run
node scripts/grant-admin.mjs --environment emulator --project demo-portfolio --uid USER_ID --email admin@example.test --apply
```

For production, the operator must supply a short-lived `GOOGLE_OAUTH_ACCESS_TOKEN` (never a shell argument or committed file) with appropriate Firebase Authentication permissions, run `--environment production --project PROJECT_ID --uid USER_ID --email EXPECTED_EMAIL --dry-run` first, and pass `--allow-production --confirm-project PROJECT_ID --confirm-email EXPECTED_EMAIL --apply` to apply changes. `--revoke` removes only the `admin` claim. Sign out and back in after claim updates so the ID token refreshes.

## Candidate import

```sh
node scripts/import-content.mjs --environment emulator --project demo-portfolio --file tests/fixtures/demo-candidates.json --dry-run
node scripts/import-content.mjs --environment emulator --project demo-portfolio --file tests/fixtures/demo-candidates.json --apply
```

The version-1 input accepts only projects, skills and timeline with stable IDs and `published:false`. It upserts into the corresponding `siteDrafts` collections, preserves unrelated entries, rejects published ID conflicts, validates bilingual records and checks media sizes/types/checksums. Manifest paths are relative to the repository root. SHA-256 object names and stable media IDs make repeat imports idempotent. No public settings are changed. The script checks for draft changes after uploads; run with other editors closed because the final check/write is not a transaction.

Before a write it creates a private, ignored backup of `siteData` and `siteDrafts`. Upload failure leaves database content untouched; a later database failure may leave reusable unreferenced objects. Retry reuses the same hashed objects. Existing imported media are not deleted. Review/publish through admin to trigger immediate revalidation.

Production commands additionally require a short-lived `GOOGLE_OAUTH_ACCESS_TOKEN`, explicit `--database-url`, `--bucket`, `--environment production --project PROJECT_ID`, and, for writes, `--allow-production --confirm-project PROJECT_ID --apply`. Preserve original inputs and generated working files outside the public repository; they are not part of the public source tree.

## Production ordering and rollback

Obtain separate approval for production changes. Preserve exports and original binaries privately; test migrations and recovery in the fixed demo emulator. Code rollback must retain private-draft rules and preserve newer inbox entries. Refer to the deployment checklist when preparing an actual release.
