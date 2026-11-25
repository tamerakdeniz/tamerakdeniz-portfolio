import { parseArgs } from 'node:util';

export function targetOptions(extra = {}) {
  const { values } = parseArgs({ options: {
    environment: { type: 'string' }, project: { type: 'string' },
    'dry-run': { type: 'boolean' }, apply: { type: 'boolean' },
    'allow-production': { type: 'boolean' }, 'confirm-project': { type: 'string' },
    ...extra,
  } });
  if (!['emulator', 'production'].includes(values.environment) || !values.project) throw new Error('Specify --environment emulator|production and --project PROJECT_ID');
  if (values.apply && values['dry-run']) throw new Error('Choose --apply OR --dry-run');
  if (values.environment === 'emulator' && values.project !== 'demo-portfolio') throw new Error('Emulator target must be demo-portfolio');
  if (values.environment === 'production' && (values.project.startsWith('demo-') || !/^[a-z][a-z0-9-]+$/.test(values.project))) throw new Error('Invalid production project');
  if (values.apply && values.environment === 'production' && (!values['allow-production'] || values['confirm-project'] !== values.project)) throw new Error('Production writes require --allow-production --confirm-project PROJECT_ID (only after owner approval)');
  return values;
}

export function targetClient(options) {
  const emulator = options.environment === 'emulator';
  const token = emulator ? 'owner' : process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  if (!token) throw new Error('Supply a short-lived GOOGLE_OAUTH_ACCESS_TOKEN using approved operator credentials; never put it in arguments.');
  const authOrigin = emulator ? 'http://127.0.0.1:9099/identitytoolkit.googleapis.com' : 'https://identitytoolkit.googleapis.com';
  const database = emulator ? 'http://127.0.0.1:9000/?ns=demo-portfolio-default-rtdb' : options['database-url'];
  if (database && !emulator) {
    const url = new URL(database);
    if (url.protocol !== 'https:' || !new RegExp(`^${options.project}(-default-rtdb)?(?:\\.[a-z0-9-]+)?\\.(firebaseio\\.com|firebasedatabase\\.app)$`).test(url.hostname)) throw new Error('Database URL must explicitly belong to the target project');
  }
  const request = async (url, method = 'GET', body, headers = {}) => {
    const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Firebase request failed (${response.status}); check target, credentials, and rules.`);
    return response.status === 204 ? null : response.json();
  };
  return {
    token,
    auth: (action, body) => request(`${authOrigin}/v1/projects/${options.project}/accounts:${action}`, 'POST', body),
    db: (path, method = 'GET', body) => {
      if (!database) throw new Error('Specify --database-url for production');
      const url = new URL(database); url.pathname = `/${path}.json`;
      return request(url, method, body);
    },
    storageOrigin: emulator ? 'http://127.0.0.1:9199' : 'https://firebasestorage.googleapis.com',
  };
}
