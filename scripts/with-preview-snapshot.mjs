import { spawn } from 'node:child_process';
const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error('Supply a command');
const env = { ...process.env, NEXT_PUBLIC_PORTFOLIO_SNAPSHOT: '1', NEXT_PUBLIC_VERCEL_ENV: 'preview', NEXT_PUBLIC_FIREBASE_USE_EMULATORS: '0', NEXT_PUBLIC_ALLOW_PREVIEW_WRITES: '0', PORTFOLIO_PUBLIC_ACTIONS_ENABLED: '0', GEMINI_API_KEY: '', FIREBASE_SERVER_CREDENTIALS_JSON: '', TURNSTILE_SECRET_KEY: '', NEXT_PUBLIC_TURNSTILE_SITE_KEY: '' };
for (const name of ['API_KEY','AUTH_DOMAIN','DATABASE_URL','PROJECT_ID','STORAGE_BUCKET','MESSAGING_SENDER_ID','APP_ID','MEASUREMENT_ID']) env[`NEXT_PUBLIC_FIREBASE_${name}`] = '';
const child = spawn(command, args, { env, stdio: 'inherit' });
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { process.exitCode = code ?? 1; });
child.on('error', () => { process.exitCode = 1; });
