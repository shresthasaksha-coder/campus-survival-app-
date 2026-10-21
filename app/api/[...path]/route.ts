import { findSignedInStudent, handleStudentAuthentication, AuthError } from '../../../lib/student-authentication';
import { connectToDatabase } from '../../../db';
import { profiles, saves, checklist, questions, replies, reports } from '../../../db/schema';
import { and, eq, desc, gte, count } from 'drizzle-orm';
import { catalog, seedQuestions, utilitySteps } from '../../../lib/campus-directory';
export const dynamic = 'force-dynamic';
const sendJsonResponse = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
class BadRequest extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
function validateTextField(v: unknown, label: string, min: number, max: number) {
  if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max)
    throw new BadRequest(`${label} must contain ${min}–${max} characters.`);
  return v.trim();
}
// Validate requests before reading or changing account data.
async function readJsonRequest(req: Request) {
  if (!req.headers.get('content-type')?.includes('application/json'))
    throw new BadRequest('Send a JSON request.', 415);
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin)
    throw new BadRequest('This request must come from Campus Survival.', 403);
  if (Number(req.headers.get('content-length') || 0) > 16000)
    throw new BadRequest('The request is too large.', 413);
  const text = await req.text();
  if (text.length > 16000) throw new BadRequest('The request is too large.', 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new BadRequest('The request could not be read.');
  }
}
async function handleCampusRequest(req: Request) {
  const url = new URL(req.url),
    path = url.pathname.replace(/^\/api\//, '');
  let input: any;
  if (req.method === 'POST') {
    input = await readJsonRequest(req);
    if (!input || typeof input !== 'object' || Array.isArray(input))
      throw new BadRequest('Invalid request.');
    if (path.startsWith('auth/')) return handleStudentAuthentication(req, path, input);
  }
  const user = await findSignedInStudent(req);
  const db = connectToDatabase();
  // Public reads and the current account's dashboard data.
  if (req.method === 'GET') {
    if (path === 'bootstrap') {
      const profile = user
        ? (await db.select().from(profiles).where(eq(profiles.userId, user.userId)))[0]
        : null;
      const saved = user
        ? await db.select({ itemId: saves.itemId }).from(saves).where(eq(saves.userId, user.userId))
        : [];
      const progress = user
        ? await db
            .select({ step: checklist.step, complete: checklist.complete })
            .from(checklist)
            .where(eq(checklist.userId, user.userId))
        : [];
      return sendJsonResponse({
        user: user
          ? {
              displayName: profile?.displayName || 'Student',
              email: user.email,
              studentType: profile?.studentType || 'incoming',
            }
          : null,
        saved: saved.map((x) => x.itemId),
        checklist: Object.fromEntries(progress.map((x) => [x.step, x.complete])),
        catalog,
      });
    }
    if (path === 'search') {
      const q = (url.searchParams.get('q') || '').trim().toLowerCase().slice(0, 150),
        category = url.searchParams.get('category') || 'all';
      return sendJsonResponse({
        items: catalog.filter(
          (x) =>
            (category === 'all' || x.category === category) &&
            `${x.title} ${x.summary} ${x.description} ${x.tag} ${x.location}`
              .toLowerCase()
              .includes(q),
        ),
      });
    }
    if (path === 'questions') {
      const rows = await db.select().from(questions).orderBy(desc(questions.createdAt)).limit(100);
      const counts = await db
        .select({ questionId: replies.questionId, total: count() })
        .from(replies)
        .groupBy(replies.questionId);
      return sendJsonResponse({
        questions: [
          ...rows.map(({ userId, ...q }) => ({ ...q, own: user?.userId === userId })),
          ...seedQuestions,
        ].map((q) => ({ ...q, replies: counts.find((r) => r.questionId === q.id)?.total || 0 })),
      });
    }
    if (path.startsWith('questions/')) {
      const id = path.split('/')[1],
        q =
          (await db.select().from(questions).where(eq(questions.id, id)))[0] ||
          seedQuestions.find((x) => x.id === id);
      if (!q) throw new BadRequest('This question could not be found.', 404);
      const rows = await db
        .select({
          id: replies.id,
          author: replies.author,
          body: replies.body,
          createdAt: replies.createdAt,
        })
        .from(replies)
        .where(eq(replies.questionId, id))
        .orderBy(replies.createdAt)
        .limit(200);
      const { userId, ...publicQuestion } = q as typeof q & { userId?: string };
      return sendJsonResponse({ question: publicQuestion, replies: rows });
    }
    throw new BadRequest('Not found.', 404);
  }
  // Every write below this point requires a valid account session.
  if (!user) throw new BadRequest('Sign in to save items or contribute.', 401);
  const now = new Date().toISOString(),
    id = crypto.randomUUID();
  if (path === 'profile' && req.method === 'POST') {
    const displayName = validateTextField(input.displayName, 'Display name', 2, 50),
      studentType = input.studentType;
    if (!['incoming', 'current'].includes(studentType))
      throw new BadRequest('Choose a valid student type.');
    await db
      .insert(profiles)
      .values({ userId: user.userId, displayName, studentType })
      .onConflictDoUpdate({ target: profiles.userId, set: { displayName, studentType } });
    return sendJsonResponse({ ok: true });
  }
  if (path === 'saves' && req.method === 'POST') {
    if (!catalog.some((x) => x.id === input.itemId) || typeof input.saved !== 'boolean')
      throw new BadRequest('Choose an available item.');
    if (input.saved)
      await db
        .insert(saves)
        .values({ userId: user.userId, itemId: input.itemId, createdAt: now })
        .onConflictDoNothing();
    else
      await db
        .delete(saves)
        .where(and(eq(saves.userId, user.userId), eq(saves.itemId, input.itemId)));
    return sendJsonResponse({ saved: input.saved });
  }
  if (path === 'checklist' && req.method === 'POST') {
    const allowed = ['electricity', 'internet', 'water'].flatMap((u) =>
      utilitySteps.map((s) => `${u}:${s.id}`),
    );
    if (!allowed.includes(input.step) || typeof input.complete !== 'boolean')
      throw new BadRequest('Choose a valid checklist step.');
    await db
      .insert(checklist)
      .values({ userId: user.userId, step: input.step, complete: input.complete })
      .onConflictDoUpdate({
        target: [checklist.userId, checklist.step],
        set: { complete: input.complete },
      });
    return sendJsonResponse({ ok: true });
  }
  const profile = (await db.select().from(profiles).where(eq(profiles.userId, user.userId)))[0],
    author = profile?.displayName || 'Student',
    since = new Date(Date.now() - 3600000).toISOString();
  if (path === 'questions' && req.method === 'POST') {
    const title = validateTextField(input.title, 'Title', 5, 120),
      content = validateTextField(input.body, 'Question', 10, 2000);
    if (!['Housing', 'Getting around', 'Campus life', 'Food', 'Other'].includes(input.category))
      throw new BadRequest('Choose a category.');
    const recent = await db
      .select({ n: count() })
      .from(questions)
      .where(and(eq(questions.userId, user.userId), gte(questions.createdAt, since)));
    if (recent[0].n >= 20) throw new BadRequest('Please wait before posting more questions.', 429);
    await db
      .insert(questions)
      .values({
        id,
        userId: user.userId,
        author,
        title,
        body: content,
        category: input.category,
        createdAt: now,
      });
    return sendJsonResponse({ id }, 201);
  }
  if (path === 'replies' && req.method === 'POST') {
    const content = validateTextField(input.body, 'Reply', 2, 2000),
      questionId = validateTextField(input.questionId, 'Question', 1, 100);
    if (
      !seedQuestions.some((x) => x.id === questionId) &&
      !(
        await db.select({ id: questions.id }).from(questions).where(eq(questions.id, questionId))
      )[0]
    )
      throw new BadRequest('Question not found.', 404);
    const recent = await db
      .select({ n: count() })
      .from(replies)
      .where(and(eq(replies.userId, user.userId), gte(replies.createdAt, since)));
    if (recent[0].n >= 50) throw new BadRequest('Please wait before posting more replies.', 429);
    await db
      .insert(replies)
      .values({ id, questionId, userId: user.userId, author, body: content, createdAt: now });
    return sendJsonResponse({ id }, 201);
  }
  if (path === 'reports' && req.method === 'POST') {
    const reason = validateTextField(input.reason, 'Reason', 10, 1000),
      targetId = validateTextField(input.targetId, 'Item', 1, 100),
      targetType = input.targetType;
    let exists = false;
    if (targetType === 'listing') exists = catalog.some((x) => x.id === targetId);
    else if (targetType === 'question')
      exists =
        seedQuestions.some((x) => x.id === targetId) ||
        !!(
          await db.select({ id: questions.id }).from(questions).where(eq(questions.id, targetId))
        )[0];
    else if (targetType === 'reply')
      exists = !!(
        await db.select({ id: replies.id }).from(replies).where(eq(replies.id, targetId))
      )[0];
    if (!exists) throw new BadRequest('This item could not be found.', 404);
    const recent = await db
      .select({ n: count() })
      .from(reports)
      .where(and(eq(reports.userId, user.userId), gte(reports.createdAt, since)));
    if (recent[0].n >= 20)
      throw new BadRequest('Please wait before submitting another report.', 429);
    await db
      .insert(reports)
      .values({ id, userId: user.userId, targetType, targetId, reason, createdAt: now });
    return sendJsonResponse({ id }, 201);
  }
  throw new BadRequest('Not found.', 404);
}
async function handleRequestSafely(req: Request) {
  try {
    return await handleCampusRequest(req);
  } catch (e) {
    if (e instanceof BadRequest || e instanceof AuthError)
      return sendJsonResponse({ error: e.message }, e.status);
    console.error('Campus API error', e);
    return sendJsonResponse({ error: 'We could not complete that request. Please try again.' }, 500);
  }
}
export const GET = handleRequestSafely;
export const POST = handleRequestSafely;
