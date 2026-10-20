# Saksham Shrestha — Pages and navigation

This is your proposed work area, not a claim of completed authorship. Clone the full shared repository and make your changes there. The separate member ZIP is only a reference packet of your assigned files.

## Main files to read and edit

- `app/page.tsx`
- `app/ui/campus-illustration.tsx`
- `lib/send-campus-request.ts`

## Understand this first

- Follow the route state and `hashchange` listener in `app/page.tsx`.
- Find the Home, Campus directions, Community, and Profile section comments.
- Trace a Save click through `updateSavedResource()` and `sendCampusApiRequest()` to the server.

## Choose a first task

These tasks are suggestions for work still to do. Pick one, agree on the scope, and create a pull request for your actual change.

- Keep search terms and the selected search category in the URL so refreshing and browser Back restore the search. Coordinate the API contract with Anwar.
- Move the campus-map view into a separate component, preserving the typed starting point, destination selection, and permission feedback.
- Record the navigation and save/unsave flows you actually tested in a short task note.

## Check your work

- Follow every main navigation link and use browser Back.
- Search, change category, open a result, and return to the list.
- Log in, save and unsave an item, refresh, and check Profile.
- Choose a map destination and verify the generated directions link.

Run `npx tsc --noEmit` and `npm run build` for code changes. Run the local integration checks for API/authentication/database changes; instructions and cleanup are in `GITHUB-GUIDE.md`.

## Coordinate with the team

Ask Siya for shared CSS changes. Ask Anwar before changing API request or response fields. Ask Yash before changing the login/session flow.

## Push your change

After cloning, installing, and updating `main` as described in [GITHUB-GUIDE.md](../GITHUB-GUIDE.md), create your first branch:

```sh
git switch -c codex/saksham-pages
```

Make the change first. The staging example below lists common owned paths; remove paths you did not work on and add any new source file you created. For a new migration, stage its SQL file and updated Drizzle metadata together after coordinating with Yash.

```sh
git status --short
git diff
git add -- app/page.tsx app/ui/campus-illustration.tsx lib/send-campus-request.ts team/SAKSHAM.md
git diff --cached --stat
git diff --cached
git commit -m "Describe the change you actually made"
git push -u origin codex/saksham-pages
```

Replace the example commit message with a specific description. Open a pull request to `main` and include what you tested. If you used another branch name, use that name in the push command.

## Presentation responsibility

Explain how the URL chooses a page, where page data comes from, and what happens when a student saves an item.

## Additional assigned files

These files are included in your packet for maintenance or reference. Starter and vendor files are provided infrastructure, not tasks to recreate. See `team/FILE-OWNERSHIP.csv` for the file categories.

Your main files and this personal guide are the complete assignment.
