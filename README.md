# BELOW THE SURFACE

A bilingual immersive portfolio with a dynamic Firebase CMS. Built with Next.js, React and TypeScript; Realtime Database stores content, Firebase Auth claims protect administration, and Storage holds managed media.

## Local development

Use Node 24, Java 21, npm, Firebase CLI and Chrome for browser tests.

```sh
npm ci
npm run emulators
# Separate terminal:
npm run seed:emulator
npm run dev:emulator
```

The emulator wrapper fixes all services to `demo-portfolio` on loopback and disables external AI. Synthetic admin credentials and editor instructions are in [operations](docs/operations.md).

```sh
npm run typecheck
npm run lint
npm test
npm run test:emulator
```

Stop existing emulators before `test:emulator`, which starts its own. For production-mode local CMS verification, use `build:emulator`, `start:emulator`, then `test:browser` with emulators running. Reports go to ignored `artifacts/`.

## Content and architecture

Published records live under `siteData`; unpublished project, skill and timeline records live under admin-only `siteDrafts`. Profile/about/contact/CV settings are public. New project routes and supported media compositions require no code deploy.

Portfolio media binaries may be publicly accessible before their project is published. Upload only non-confidential media. Public galleries, metadata, sitemap, search and assistant context use published records; uploads, replacement and deletion require an administrator. Shared references are retained. Private binary staging with authenticated previews is an optional future enhancement.

- [Editor, media lifecycle, imports and recovery](docs/operations.md)
- [Design contract](IMMERSIVE_V2.md) and [design background](DESIGN.md)

Personal editorial proposals, unpublished assets, production exports and review reports belong in private storage outside this public repository. Source publication and content publication are separate decisions. Setup instructions grant no permission to push, deploy, provision production access or change cloud configuration.
