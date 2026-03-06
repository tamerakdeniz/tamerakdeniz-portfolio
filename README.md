# Tamer Akdeniz - Portfolio (React)

Personal portfolio website built with Next.js, Firebase, and Tailwind CSS.

## Tech Stack

- **Next.js 16** (App Router, SSR/SSG)
- **TypeScript**
- **Tailwind CSS v4**
- **Firebase** (Realtime Database + Authentication)
- **Zustand** (State management)
- **Framer Motion** (Animations)
- **i18next** (TR/EN internationalization)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** > **Email/Password** sign-in method
3. Create an admin user (email/password)
4. **Realtime Database** is already configured

## Deploy to Vercel

```bash
npx vercel
```

Or connect the GitHub repo to Vercel for automatic deployments.

## Project Structure

```
src/
  app/           - Next.js App Router pages
  admin/         - Admin panel components
  components/    - Shared UI components
  hooks/         - Custom React hooks
  lib/           - Firebase config, i18n setup
  locales/       - TR/EN translation files
  store/         - Zustand state management
  styles/        - Global CSS
  types/         - TypeScript interfaces
```
