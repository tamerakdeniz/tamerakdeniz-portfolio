import { spawn } from 'node:child_process';
import { emulatorEnv } from './emulator-env.mjs';
const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error('Usage: node scripts/with-emulators.mjs <command> [args]');
const child = spawn(command, args, { stdio: 'inherit', env: { ...process.env, ...emulatorEnv } });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
