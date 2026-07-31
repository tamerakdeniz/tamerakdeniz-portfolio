'use client';

import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ContactModal } from '@/components/ui/ContactModal';
import { CVModal } from '@/components/ui/CVModal';
import { CursorGlow } from '@/components/ui/InteractiveEffects';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className="flex-1 flex flex-col pt-16">
        {children}
      </main>
      <Footer />
      <ContactModal />
      <CVModal />
    </>
  );
}
