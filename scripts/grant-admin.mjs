import { targetClient, targetOptions } from './firebase-target.mjs';
try {
  const options = targetOptions({ uid: { type: 'string' }, email: { type: 'string' }, 'confirm-email': { type: 'string' }, revoke: { type: 'boolean' } });
  if (!options.uid || !options.email) throw new Error('Specify BOTH --uid USER_ID and --email EXPECTED_EMAIL');
  if (options.uid === 'portfolio-intake-server') throw new Error('Reserved server identity cannot be provisioned as a human admin');
  const client = targetClient(options);
  const result = await client.auth('lookup', { localId: [options.uid] });
  const user = result.users?.find((u) => u.localId === options.uid);
  if (!user || user.email !== options.email || user.disabled) throw new Error('Target UID/email mismatch, missing user, or disabled account');
  const claims = JSON.parse(user.customAttributes || '{}');
  if (options.revoke) delete claims.admin; else claims.admin = true;
  console.log(JSON.stringify({ project: options.project, environment: options.environment, uid: options.uid, email: options.email, action: options.revoke ? 'revoke-admin' : 'grant-admin', dryRun: !options.apply }, null, 2));
  if (options.apply) {
    if (options.environment === 'production' && options['confirm-email'] !== options.email) throw new Error('Production provisioning requires --confirm-email matching the verified email');
    await client.auth('update', { localId: options.uid, customAttributes: JSON.stringify(claims) });
    console.log('Claim updated. Sign out and sign in to refresh the ID token.');
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
