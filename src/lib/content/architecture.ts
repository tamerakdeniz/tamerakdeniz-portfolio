import type { Loc } from './portfolio';

/**
 * This site's own architecture, as implemented in this repository. Every node and edge
 * corresponds to code listed in `files`; update both together.
 */
export type Zone = 'client' | 'server' | 'service';

export interface ArchNode {
  id: string;
  zone: Zone;
  name: Loc;
  body: Loc;
  files: string[];
  /** Centre in the 1000 × 560 map. */
  x: number;
  y: number;
}

export interface ArchEdge {
  id: string;
  from: string;
  to: string;
  label: Loc;
  points: [number, number][];
  /** Label anchor in map units. */
  at: [number, number];
}

const l = (en: string, tr: string): Loc => ({ en, tr });

export const ZONES: { id: Zone; name: Loc; x: number }[] = [
  { id: 'client', name: l('On your device', 'Sizin cihazınızda'), x: 130 },
  { id: 'server', name: l('On the server', 'Sunucuda'), x: 480 },
  { id: 'service', name: l('Services', 'Servisler'), x: 860 },
];

export const NODES: ArchNode[] = [
  {
    id: 'browser',
    zone: 'client',
    name: l('This page', 'Bu sayfa'),
    body: l(
      'Server-rendered HTML that carries both languages, so switching never reloads. The water is one WebGL2 fragment shader, loaded only when the device allows motion and WebGL; otherwise a CSS gradient takes its place.',
      'Her iki dili de taşıyan, sunucuda üretilmiş HTML; dil değiştirmek sayfayı yeniden yüklemez. Su, tek bir WebGL2 fragment shader’ı; yalnızca cihaz hareket ve WebGL’e izin verdiğinde yüklenir, aksi hâlde yerini bir CSS geçişi alır.'
    ),
    files: ['src/components/scene/OceanScene.tsx', 'src/components/scene/shaders.ts', 'src/components/portfolio/T.tsx'],
    x: 130,
    y: 200,
  },
  {
    id: 'admin',
    zone: 'client',
    name: l('Admin panel', 'Yönetim paneli'),
    body: l(
      'A private dashboard at /admin for editing projects, the timeline, texts and files, and for reading contact messages. It is not linked from the public site.',
      '/admin altında, projeleri, zaman çizelgesini, metinleri ve dosyaları düzenlemek ve iletişim mesajlarını okumak için özel bir panel. Herkese açık siteden bağlantı verilmez.'
    ),
    files: ['src/app/admin/page.tsx', 'src/lib/firebase.ts'],
    x: 130,
    y: 440,
  },
  {
    id: 'pages',
    zone: 'server',
    name: l('Next.js pages', 'Next.js sayfaları'),
    body: l(
      'Every page is rendered on the server. Content is re-read from the database at most once a minute (incremental static regeneration), so pages stay fast and close to live.',
      'Her sayfa sunucuda üretilir. İçerik veritabanından en fazla dakikada bir yeniden okunur (artımlı statik yenileme); sayfalar hızlı ve canlıya yakın kalır.'
    ),
    files: ['src/app/page.tsx', 'src/lib/content/site-data.ts', 'src/lib/content/portfolio.ts'],
    x: 480,
    y: 80,
  },
  {
    id: 'chat',
    zone: 'server',
    name: l('/api/chat', '/api/chat'),
    body: l(
      'Verifies Vercel BotID Basic and durable rate limits, pairs the question with the site’s published content, and asks Gemini — falling back to a second model if the first is unavailable.',
      'Vercel BotID Basic ve kalıcı istek sınırlarını doğrular, soruyu sitenin yayınlanmış içeriğiyle eşleştirir ve Gemini’ye sorar; ilk model yanıt vermezse ikinci bir modele geçer.'
    ),
    files: ['src/app/api/chat/route.ts', 'src/lib/public-action-guard.ts', 'src/lib/gemini-chat.ts'],
    x: 480,
    y: 230,
  },
  {
    id: 'cv',
    zone: 'server',
    name: l('/api/download-cv', '/api/download-cv'),
    body: l(
      'Streams the CV PDF from an allow-listed storage host, so the download keeps a proper file name.',
      'Özgeçmiş PDF’ini izin verilen depolama adresinden aktarır; indirilen dosya düzgün bir adla kaydedilir.'
    ),
    files: ['src/app/api/download-cv/route.ts'],
    x: 480,
    y: 380,
  },
  {
    id: 'rtdb',
    zone: 'service',
    name: l('Realtime Database', 'Realtime Database'),
    body: l(
      'One public, read-only siteData tree holds published projects, the timeline, the about text and contact details. Private drafts and contact submissions live in restricted nodes written through authenticated admin or protected server intake.',
      'Herkese açık, salt okunur tek bir siteData ağacı yayınlanmış projeleri, zaman çizelgesini, hakkımda metnini ve iletişim bilgilerini tutar. Özel taslaklar ve iletişim mesajları yalnızca yetkili yönetim veya korumalı sunucu alımıyla yazılan kısıtlı düğümlerde durur.'
    ),
    files: ['database.rules.json', 'src/app/api/contact/route.ts', 'src/components/portfolio/ContactForm.tsx'],
    x: 860,
    y: 80,
  },
  {
    id: 'gemini',
    zone: 'service',
    name: l('Google Gemini', 'Google Gemini'),
    body: l(
      'A flash-lite Gemini model writes the answers, instructed to use only the content published here.',
      'Yanıtları, yalnızca burada yayınlanan içeriği kullanması istenen flash-lite bir Gemini modeli yazar.'
    ),
    files: ['src/lib/gemini-chat.ts'],
    x: 860,
    y: 230,
  },
  {
    id: 'storage',
    zone: 'service',
    name: l('Firebase Storage', 'Firebase Storage'),
    body: l(
      'Project images, the portrait and the CV PDF, uploaded through the admin panel and optimised by Next.js on the way to the page.',
      'Yönetim panelinden yüklenen proje görselleri, portre ve özgeçmiş PDF’i; sayfaya giderken Next.js tarafından optimize edilir.'
    ),
    files: ['src/lib/portfolio-storage.ts', 'storage.rules'],
    x: 860,
    y: 380,
  },
  {
    id: 'auth',
    zone: 'service',
    name: l('Firebase Auth', 'Firebase Auth'),
    body: l(
      'Email and password sign-in, used only by the admin panel. Every write to site content requires it.',
      'Yalnızca yönetim panelinin kullandığı e-posta ve şifreyle giriş. Site içeriğine yapılan her yazma işlemi bunu gerektirir.'
    ),
    files: ['src/lib/firebase.ts', 'database.rules.json'],
    x: 860,
    y: 500,
  },
];

export const EDGES: ArchEdge[] = [
  { id: 'html', from: 'browser', to: 'pages', label: l('HTML', 'HTML'), points: [[225, 185], [300, 185], [300, 80], [385, 80]], at: [308, 130] },
  { id: 'ask', from: 'browser', to: 'chat', label: l('question', 'soru'), points: [[225, 205], [320, 205], [320, 230], [385, 230]], at: [326, 222] },
  { id: 'dl', from: 'browser', to: 'cv', label: l('download', 'indir'), points: [[225, 215], [300, 215], [300, 380], [385, 380]], at: [308, 330] },
  {
    id: 'contact',
    from: 'browser',
    to: 'rtdb',
    label: l('contact · protected intake', 'iletişim · korumalı alım'),
    points: [[150, 170], [150, 24], [720, 24], [720, 68], [765, 68]],
    at: [330, 16],
  },
  { id: 'read', from: 'pages', to: 'rtdb', label: l('read · every 60 s', 'okuma · 60 sn'), points: [[575, 80], [765, 80]], at: [590, 72] },
  { id: 'img', from: 'pages', to: 'storage', label: l('images', 'görseller'), points: [[575, 95], [680, 95], [680, 365], [765, 365]], at: [612, 300] },
  { id: 'prompt', from: 'chat', to: 'gemini', label: l('prompt + site content', 'istem + site içeriği'), points: [[575, 230], [765, 230]], at: [590, 222] },
  { id: 'pdf', from: 'cv', to: 'storage', label: l('fetch PDF', 'PDF al'), points: [[575, 380], [765, 380]], at: [590, 374] },
  { id: 'signin', from: 'admin', to: 'auth', label: l('sign in', 'giriş'), points: [[225, 460], [740, 460], [740, 500], [765, 500]], at: [240, 455] },
  { id: 'edit', from: 'admin', to: 'rtdb', label: l('edit content', 'içerik düzenleme'), points: [[225, 420], [720, 420], [720, 92], [765, 92]], at: [240, 415] },
  { id: 'upload', from: 'admin', to: 'storage', label: l('upload', 'yükleme'), points: [[225, 440], [700, 440], [700, 395], [765, 395]], at: [240, 435] },
];
