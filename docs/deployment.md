# Deployment and release runbook

Reusable operator checklist for production deployments, isolated preview builds, and Firebase maintenance on `https://www.tamerakdeniz.com`. Every script in `scripts/` defaults to dry-run or emulator safety guards; no command runs against production without explicit confirmation flags.

## Environment checklist

- Before any push, inspect the Git integration's production branch and automatic Preview behavior. Keep automatic builds isolated before publishing source; pushing may itself trigger a deployment.
- Production: `NEXT_PUBLIC_VERCEL_ENV=production`, `NEXT_PUBLIC_PORTFOLIO_SNAPSHOT=0`, `NEXT_PUBLIC_FIREBASE_USE_EMULATORS=0`, `NEXT_PUBLIC_ALLOW_PREVIEW_WRITES=0`. Set the eight `NEXT_PUBLIC_FIREBASE_*` web configuration fields for the intended project only.
- Read-only Preview: use `build:preview-snapshot` and `start:preview-snapshot`, or the equivalent snapshot settings before build. Clear every Firebase web target, Gemini credential and server service-account value. The committed snapshot and demo media are synthetic. Snapshot Preview needs no external service.
- If editable Preview is later required, provision an entirely separate Firebase Auth/RTDB/Storage project and enable Preview writes only for that target. Application guards alone do not isolate a shared production backend.
- Keep `PORTFOLIO_PUBLIC_ACTIONS_ENABLED=0` until protected intake is explicitly approved and configured. Public actions use Vercel BotID Basic (free tier only, with Deep Analysis disabled and Vercel OIDC token enabled for serverless verification) plus a random server-only `PUBLIC_ACTION_IP_HASH_KEY`. Do not enable a provider solely to run local verification.
- For enabled contact/assistant intake, provide restricted server-only `FIREBASE_SERVER_CREDENTIALS_JSON` for the exact intended Firebase project; never use Owner/Editor permissions. The server requires RTDB access for private intake and durable quotas. Restrict credentials to that workload and verify the policy before provisioning.
- Assistant, if approved: server-only `GEMINI_API_KEY`, supported `GEMINI_MODEL` and fallback; configure provider budget limits and verify quotas. No secret may use a `NEXT_PUBLIC_` name. Firebase browser identifiers are public configuration, not administrative credentials.

## Coordinated cutover checklist

1. Preserve a private timestamped RTDB export, existing rules, Storage reference inventory and independent original media. Test recovery in the emulator. Never commit these backups.
2. Review migration dry-run results with explicit project/database targeting. Close old admin sessions. Move legacy public drafts atomically to `siteDrafts` before declaring privacy complete. The supplied transition rules keep `siteData` publicly readable and temporarily allow legacy contact creation; they do not hide drafts left under `siteData`. Use that compatibility bridge only during an approved, tightly controlled maintenance window; confirm the published/private split and apply final rules promptly.
3. Provision only the approved UID after verifying its email using the dry-run admin tool. Apply only with explicit target confirmations and refresh the account token. Test both authorized and unauthorized users.
4. Coordinate final `database.rules.json`, `storage.rules`, server credentials and matching application code. Keep intake disabled through cutover. Anonymous clients must not write contact messages directly; protected server intake validates the challenge and durable quotas.
5. Confirm private drafts are absent from anonymous RTDB, direct project routes, metadata, galleries, sitemap, command search and assistant context. Verify upload/replacement/deletion restrictions and shared-reference preservation. Sensitive administrative files never belong under public media paths.
6. Import only separately approved content/media as private drafts. Preserve the existing active CV and photos. Publish each reviewed record intentionally. The bilingual uploader warns that non-confidential binaries may already be publicly accessible.
7. After separate deployment approval, run a controlled production smoke test and monitor intake/quota failures. Roll back to a reviewed code deployment if needed while retaining private-draft rules. Restore only affected paths; preserve newer inbox entries and shared media.

## Local verification and source delivery

Run types, lint, unit tests, emulator rules/abuse tests, production build, isolated Preview build and CMS lifecycle tests. Run migration rehearsal, media import and shared-media cleanup against `demo-portfolio` only. Tests use public synthetic fixtures; private inputs are never required.

`content/preview-snapshot.json`, `tests/fixtures/` and `public/demo/` are synthetic demonstration data, not portfolio claims. Existing historical public images and documents remain part of the original published source. The preview export tool requires an explicit output under ignored `artifacts/`; review exports outside the public repository before any publication.

Before pushing a branch, audit every newly reachable commit, not only its tip. Use an explicit single-branch refspec with tag following disabled; never use `--all`, `--mirror`, `--tags` or a force push. Private recovery refs and bundles must remain local. `.vercelignore` excludes local artifacts, backups and credential files from CLI source uploads; Git deployments use the reviewed public tree. Do not deploy from the private implementation checkout.

## Explicit content preparation inputs

```sh
node scripts/import-content.mjs --environment emulator --project demo-portfolio --file tests/fixtures/demo-candidates.json --dry-run
node scripts/apply-confirmed-content.mjs --environment emulator --project demo-portfolio --file tests/fixtures/demo-proposal.json --input tests/fixtures/demo-root.json
node scripts/prepare-project-assets.mjs --input tests/fixtures/demo-candidates.json --all --output artifacts/demo-assets
```

Supply reviewed private proposals with `--file`, optional art briefs with `--directions`, and media inventories with `--assets`. Relative media/source paths resolve from the working directory; absolute local paths are accepted. Generated inventories, original captures and optimized derivatives stay under ignored `artifacts/` and must be preserved separately before cleanup. No automatic upload or publication occurs during asset preparation. Classify genuine screenshots, mock-data captures, concept illustrations and architecture diagrams honestly.

The ignore files also guard the known review-only paths. Remove a specific guard only after the corresponding content or asset has separately been approved for publication. Never force-add a private review bundle.
