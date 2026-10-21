import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const base = process.env.TEST_URL || 'http://127.0.0.1:5173';
assert.match(
  new URL(base).hostname,
  /^(127\.0\.0\.1|localhost)$/,
  'Run these tests only against the local website.',
);
const checks = [];
const run = randomUUID();
const emailA = `qa-a-${run}@campus-test.invalid`;
const emailB = `qa-b-${run}@campus-test.invalid`;
const password = `  Study-${randomUUID()}!  `;
const alice = { cookie: '' };
const bob = { cookie: '' };
const testAccounts = [emailA, emailB];
const cleanup = `
DELETE FROM reports WHERE user_id IN (SELECT id FROM accounts WHERE email IN ('${emailA}', '${emailB}'));
DELETE FROM replies WHERE user_id IN (SELECT id FROM accounts WHERE email IN ('${emailA}', '${emailB}'));
DELETE FROM questions WHERE user_id IN (SELECT id FROM accounts WHERE email IN ('${emailA}', '${emailB}'));
DELETE FROM saves WHERE user_id IN (SELECT id FROM accounts WHERE email IN ('${emailA}', '${emailB}'));
DELETE FROM checklist WHERE user_id IN (SELECT id FROM accounts WHERE email IN ('${emailA}', '${emailB}'));
DELETE FROM profiles WHERE user_id IN (SELECT id FROM accounts WHERE email IN ('${emailA}', '${emailB}'));
DELETE FROM sessions WHERE user_id IN (SELECT id FROM accounts WHERE email IN ('${emailA}', '${emailB}'));
DELETE FROM accounts WHERE email IN ('${emailA}', '${emailB}');
`;
await writeFile('.sites-runtime/test-cleanup.sql', cleanup);

async function request(path, body, client = null, origin = base) {
  const response = await fetch(base + '/api/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(client?.cookie ? { cookie: client.cookie } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json', Origin: origin }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }
  const cookie = response.headers.get('set-cookie');
  if (cookie && client) client.cookie = cookie.split(';')[0];
  return { status: response.status, data, cookie };
}
function registration(email, displayName = 'QA Student') {
  return { email, password, confirmPassword: password, displayName, studentType: 'incoming' };
}

const guest = await request('bootstrap');
assert.equal(guest.status, 200);
assert.equal(guest.data.user, null);
assert.equal((await request('saves', { itemId: 'housing-west', saved: true })).status, 401);
checks.push('Guest browsing works; protected writes require a session');

assert.equal(
  (
    await request('auth/register', {
      ...registration(emailA),
      password: 'short',
      confirmPassword: 'short',
    })
  ).status,
  400,
);
assert.equal(
  (
    await request('auth/register', {
      ...registration(emailA),
      confirmPassword: 'different-password',
    })
  ).status,
  400,
);
assert.equal(
  (await request('auth/register', registration(emailA), alice, 'https://invalid.example')).status,
  403,
);
checks.push('Weak passwords, confirmation mismatches, and cross-origin registration are rejected');

const registerA = await request('auth/register', registration(emailA, 'QA Alice'), alice);
assert.equal(registerA.status, 201, JSON.stringify(registerA.data));
assert.match(registerA.cookie, /HttpOnly/);
assert.match(registerA.cookie, /SameSite=Lax/);
assert.match(registerA.cookie, /Max-Age=604800/);
assert.equal((await request('bootstrap', undefined, alice)).data.user.displayName, 'QA Alice');
assert.equal((await request('auth/register', registration(emailA))).status, 409);
checks.push('Account creation sets a protected cookie; duplicate email is rejected');

const firstCookie = alice.cookie;
assert.equal((await request('auth/logout', {}, alice)).status, 200);
assert.equal((await request('bootstrap', undefined, { cookie: firstCookie })).data.user, null);
assert.equal(
  (await request('saves', { itemId: 'housing-west', saved: true }, { cookie: firstCookie })).status,
  401,
);
assert.equal(
  (await request('auth/login', { email: emailA, password: password.trim() }, alice)).status,
  401,
);
assert.equal(
  (await request('auth/login', { email: 'unknown-' + emailA, password }, alice)).status,
  401,
);
assert.equal(
  (await request('auth/login', { email: '  ' + emailA.toUpperCase() + ' ', password }, alice))
    .status,
  200,
);
assert.notEqual(alice.cookie, firstCookie);
checks.push('Real password login, email normalization, logout invalidation, and fresh sessions');

const rotatedCookie = alice.cookie;
await request('auth/login', { email: emailA, password }, alice);
assert.equal((await request('bootstrap', undefined, { cookie: rotatedCookie })).data.user, null);
checks.push('Logging in again revokes the previous browser session');

const search = await request('search?q=housing&category=housing');
assert.equal(search.data.items.length, 3);
assert.equal((await request('search?q=zznonexistent')).data.items.length, 0);
assert.equal((await request('saves', { itemId: 'not-real', saved: true }, alice)).status, 400);
await request('saves', { itemId: 'housing-west', saved: true }, alice);
await request('saves', { itemId: 'housing-west', saved: true }, alice);
assert.deepEqual((await request('bootstrap', undefined, alice)).data.saved, ['housing-west']);
await request('checklist', { step: 'water:provider', complete: true }, alice);
assert.equal((await request('bootstrap', undefined, alice)).data.checklist['water:provider'], true);
checks.push('Search, saved items without duplicates, and checklist persistence');

assert.equal((await request('auth/register', registration(emailB, 'QA Bob'), bob)).status, 201);
const b = (await request('bootstrap', undefined, bob)).data;
assert.deepEqual(b.saved, []);
assert.deepEqual(b.checklist, {});
await request('saves', { itemId: 'housing-west', saved: false }, bob);
await request('profile', { displayName: 'Bob Updated', studentType: 'current' }, bob);
const a = (await request('bootstrap', undefined, alice)).data;
assert.deepEqual(a.saved, ['housing-west']);
assert.equal(a.user.displayName, 'QA Alice');
assert.equal((await request('bootstrap')).data.user, null);
checks.push('Two accounts have separate saves, checklist progress, and profiles');

await request('auth/logout', {}, alice);
await request('auth/login', { email: emailA, password }, alice);
assert.deepEqual((await request('bootstrap', undefined, alice)).data.saved, ['housing-west']);
assert.equal((await request('bootstrap', undefined, alice)).data.checklist['water:provider'], true);
checks.push('Saved data survives logging out and back in');

const question = await request(
  'questions',
  {
    title: 'QA: testing student accounts',
    body: 'Disposable local test question for the email and password login update.',
    category: 'Other',
  },
  alice,
);
assert.equal(question.status, 201);
const reply = await request(
  'replies',
  { questionId: question.data.id, body: 'A reply from a second account.' },
  bob,
);
assert.equal(reply.status, 201);
const thread = await request('questions/' + question.data.id);
assert.equal(thread.data.question.author, 'QA Alice');
assert.equal(thread.data.replies[0].author, 'Bob Updated');
assert.equal(thread.data.replies[0].body, 'A reply from a second account.');
assert.equal(thread.data.question.userId, undefined);
assert.equal(thread.data.question.email, undefined);
assert.equal(
  (
    await request(
      'reports',
      {
        targetId: question.data.id,
        targetType: 'question',
        reason: 'A disposable local report for verification.',
      },
      bob,
    )
  ).status,
  201,
);
checks.push('Community questions, replies, and reports use the correct account');

for (let i = 0; i < 10; i++) {
  const result = await request('auth/login', { email: emailB, password: 'incorrect-password' });
  assert.equal(result.status, 401);
}
assert.equal(
  (await request('auth/login', { email: emailB, password: 'incorrect-password' })).status,
  429,
);
checks.push('Repeated login attempts are rate limited');

await request('auth/logout', {}, alice);
await request('auth/logout', {}, bob);
console.log(
  JSON.stringify(
    { passed: checks.length, checks, cleanup: '.sites-runtime/test-cleanup.sql' },
    null,
    2,
  ),
);
