'use client';

import { useEffect } from 'react';
import { initBotId } from 'botid/client/core';
import { PREVIEW_WRITES_BLOCKED, SNAPSHOT_PREVIEW, USE_EMULATORS } from '@/lib/firebase-config';

export const BOTID_PROTECTED_ROUTES = [
  { path: '/api/contact', method: 'POST', advancedOptions: { checkLevel: 'basic' as const } },
  { path: '/api/chat', method: 'POST', advancedOptions: { checkLevel: 'basic' as const } },
];

let initialized = false;

/** Initialize Vercel BotID Basic once on the client; skipped in emulators and read-only previews. */
export function ensureBotIdInitialized(): void {
  if (initialized || typeof window === 'undefined' || USE_EMULATORS || SNAPSHOT_PREVIEW || PREVIEW_WRITES_BLOCKED) {
    return;
  }
  initialized = true;
  initBotId({ protect: BOTID_PROTECTED_ROUTES });
}

/** Invisible Vercel BotID Basic client protection for public action forms. */
export function HumanCheck({ action, onToken }: { action: 'contact' | 'chat'; onToken?: (token: string) => void }) {
  void action;
  void onToken;
  useEffect(() => {
    ensureBotIdInitialized();
  }, []);
  return null;
}
