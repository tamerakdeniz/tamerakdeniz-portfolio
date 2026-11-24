// Resolves the `@/` alias and extensionless TypeScript imports so plain `node --test` can load src/.
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const SRC = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../src');

function withExtension(file) {
  for (const candidate of [`${file}.ts`, `${file}.tsx`, path.join(file, 'index.ts')]) {
    if (existsSync(candidate)) return candidate;
  }
  return path.extname(file) && existsSync(file) ? file : null;
}

export async function resolve(specifier, context, next) {
  if (specifier === 'server-only') {
    return { url: 'data:text/javascript,', shortCircuit: true };
  }
  let file = null;
  if (specifier.startsWith('@/')) {
    file = withExtension(path.join(SRC, specifier.slice(2)));
  } else if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
    const parent = path.dirname(fileURLToPath(context.parentURL));
    if (!path.extname(specifier)) file = withExtension(path.resolve(parent, specifier));
  }
  if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  return next(specifier, context);
}
