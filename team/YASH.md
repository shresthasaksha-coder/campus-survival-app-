# Yashkumar Jani — Accounts, database, and integration

This is your proposed work area, not a claim of completed authorship. Clone the full shared repository and make your changes there. The separate member ZIP is only a reference packet of your assigned files.

## Main files to read and edit

- `app/student-login-form.tsx`
- `lib/student-authentication.ts`
- `db/index.ts`
- `db/schema.ts`
- `drizzle/`
- `package.json`
- `package-lock.json`
- `vite.config.ts`

## Understand this first

- Trace registration from `app/student-login-form.tsx` to `handleStudentAuthentication()` in `lib/student-authentication.ts`.
- Explain salted password hashes, session cookies, expiry, and logout invalidation.
- Match database tables in `db/schema.ts` to their migration files.

## Choose a first task

These tasks are suggestions for work still to do. Pick one, agree on the scope, and create a pull request for your actual change.

- Verify installation from a clean clone and correct any reproducible setup issue in coordination with Anwar.
- Review the expired-session behavior and add a test for a missing, invalid, or expired session case that is not already covered. Coordinate test-file edits with Anwar.
- Review account-form feedback with Siya and improve an unclear validation message if you find one.

## Check your work

- Register, log out, and log in using a local test account.
- Try a wrong password, a duplicate email, and a confirmation mismatch.
- Verify a second account cannot see the first account's saved items.
- Run the integration checks and clean only their generated test records.

Run `npx tsc --noEmit` and `npm run build` for code changes. Run the local integration checks for API/authentication/database changes; instructions and cleanup are in `GITHUB-GUIDE.md`.

## Coordinate with the team

Review Anwar's API changes, coordinate test edits, and merge reviewed pull requests. Generate a new migration for schema changes; never edit an applied migration.

## Push your change

After cloning, installing, and updating `main` as described in [GITHUB-GUIDE.md](../GITHUB-GUIDE.md), create your first branch:

```sh
git switch -c codex/yash-accounts
```

Make the change first. The staging example below lists common owned paths; remove paths you did not work on and add any new source file you created. For a new migration, stage its SQL file and updated Drizzle metadata together after coordinating with Yash.

```sh
git status --short
git diff
git add -- app/student-login-form.tsx lib/student-authentication.ts db/schema.ts db/index.ts team/YASH.md
git diff --cached --stat
git diff --cached
git commit -m "Describe the change you actually made"
git push -u origin codex/yash-accounts
```

Replace the example commit message with a specific description. Open a pull request to `main` and include what you tested. If you used another branch name, use that name in the push command.

## Presentation responsibility

Explain how the server identifies the account and how saved data persists after refresh. State that email verification and emailed recovery are still unfinished.

## Additional assigned files

These files are included in your packet for maintenance or reference. Starter and vendor files are provided infrastructure, not tasks to recreate. See `team/FILE-OWNERSHIP.csv` for the file categories.

- `.gitignore`
- `.npmrc`
- `.prettierrc.json`
- `.siya/hosting.json`
- `Start-Siya-Campus.command`
- `build/connector-preview-plugin.mjs`
- `build/connector-preview-worker.mjs`
- `build/sites-vite-plugin.LICENSE`
- `build/sites-vite-plugin.ts`
- `build/sites-worker.ts`
- `cloudflare-env.d.ts`
- `components/service-error-message.tsx`
- `drizzle.config.ts`
- `eslint.config.mjs`
- `examples/d1/app/api/notes/route.ts`
- `examples/d1/db/schema.ts`
- `lib/connector-context.ts`
- `lib/connector-contract.mts`
- `lib/connector-errors.mts`
- `lib/connector-preview.d.ts`
- `lib/connectors.ts`
- `lib/utils.ts`
- `next-env.d.ts`
- `next.config.ts`
- `scripts/build-verified.sh`
- `scripts/connector-preview/connector-preview-session.mjs`
- `scripts/connector-preview/host-binding.mjs`
- `scripts/connector-preview/protocol.mjs`
- `scripts/execution-profile.mjs`
- `scripts/install-ci.mjs`
- `scripts/install-ci.sh`
- `scripts/install-pnpm.sh`
- `scripts/npm-install.mjs`
- `scripts/pnpm-install.mjs`
- `scripts/run-framework.mjs`
- `scripts/sites-env.mjs`
- `scripts/sites-env.sh`
- `tsconfig.json`
