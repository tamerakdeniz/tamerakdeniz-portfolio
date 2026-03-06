'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ContactModal } from '@/components/ui/ContactModal';
import { CVModal } from '@/components/ui/CVModal';
import { CursorGlow } from '@/components/ui/InteractiveEffects';

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className={`flex-1 flex flex-col ${isHome ? 'pt-16' : 'pt-20 sm:pt-20'}`}>
        {children}
      </main>
      {!isHome && <Footer />}
      <ContactModal />
      <CVModal />
    </>
  );
}
