import { targetClient } from './firebase-target.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
const client = targetClient({ environment: 'emulator', project: 'demo-portfolio' });
const email = 'admin@example.test';
const password = 'Emulator-only-123!';
const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-emulator-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
let user = await response.json();
if (!response.ok && user.error?.message === 'EMAIL_EXISTS') {
  const login = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-emulator-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
  user = await login.json();
}
if (!user.localId) throw new Error('Emulator account creation failed');
await client.auth('update', { localId: user.localId, customAttributes: JSON.stringify({ admin: true }) });
// Seed only when the isolated database is empty; never overwrite an ongoing lifecycle.
if (!await client.db('siteData')) await client.db('', 'PATCH', { siteData: {
  projects: [], skills: [], timeline: [], aboutEntries: [], cvFiles: [], activeAboutId: '', activeCvId: '',
  profile: { fullName: 'CMS Test Operator', shortName: 'CMS Test', role: { en: 'Synthetic test profile', tr: 'Sentetik test profili' } },
  contactInfo: { email: 'portfolio@example.test', location: { en: 'Test environment', tr: 'Test ortamı' }, social: { github: '', instagram: '', linkedin: '', upwork: '' } },
  homeHero: { title: { en: 'Below the Surface', tr: 'Yüzeyin Altında' }, description: { en: 'Isolated CMS verification', tr: 'Yalıtılmış CMS doğrulaması' }, moreLabel: { en: 'About', tr: 'Hakkımda' }, icon: { mode: 'material', materialIcon: 'code', imageUrl: '' } },
  availability: { status: 'not-available', customLabel: { en: '', tr: '' } }, display: { featuredCount: 3 },
}, siteDrafts: {} });
await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/emulator-admin.json', JSON.stringify({ uid: user.localId, email, password }, null, 2), { mode: 0o600 });
console.log(`Isolated admin: ${email}; password: ${password}; UID saved in artifacts/emulator-admin.json`);
