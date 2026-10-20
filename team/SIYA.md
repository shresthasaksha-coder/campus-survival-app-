# Siya Darshani Singh Thakuri — Design, mobile layout, and accessibility

This is your proposed work area, not a claim of completed authorship. Clone the full shared repository and make your changes there. The separate member ZIP is only a reference packet of your assigned files.

## Main files to read and edit

- `app/globals.css`
- `app/layout.tsx`
- `app/ui/campus-dialog.tsx`
- `public/favicon.svg`
- `hooks/use-small-screen.ts`

## Understand this first

- Find the theme variables and the responsive sections in `app/globals.css`.
- Read how `app/ui/campus-dialog.tsx` handles keyboard focus, Escape, and closing a popup.
- Check the page wrapper and styles imported by `app/layout.tsx`.

## Choose a first task

These tasks are suggestions for work still to do. Pick one, agree on the scope, and create a pull request for your actual change.

- Check the Home, Profile, map, and Community screens at 320 px, 768 px, and desktop widths. Fix actual clipping or wrapping issues you find and record the before/after.
- Test all navigation, forms, and dialogs with a keyboard; fix any focus or label problem you observe.
- Make one agreed visual improvement, such as tighter mobile form spacing, while preserving contrast and button consistency.

## Check your work

- Check horizontal overflow at each target width.
- Use Tab and Shift+Tab through a dialog; verify Escape closes it and returns focus.
- Check field labels, error visibility, and focus outlines.
- Confirm reduced-motion styles and color-independent status labels remain intact.

Run `npx tsc --noEmit` and `npm run build` for code changes. Run the local integration checks for API/authentication/database changes; instructions and cleanup are in `GITHUB-GUIDE.md`.

## Coordinate with the team

Coordinate JSX changes in `app/page.tsx` with Saksham and account form markup with Yash. Optional starter components do not need rewriting.

## Push your change

After cloning, installing, and updating `main` as described in [GITHUB-GUIDE.md](../GITHUB-GUIDE.md), create your first branch:

```sh
git switch -c codex/siya-design
```

Make the change first. The staging example below lists common owned paths; remove paths you did not work on and add any new source file you created. For a new migration, stage its SQL file and updated Drizzle metadata together after coordinating with Yash.

```sh
git status --short
git diff
git add -- app/globals.css app/layout.tsx app/ui/campus-dialog.tsx public/favicon.svg team/SIYA.md
git diff --cached --stat
git diff --cached
git commit -m "Describe the change you actually made"
git push -u origin codex/siya-design
```

Replace the example commit message with a specific description. Open a pull request to `main` and include what you tested. If you used another branch name, use that name in the push command.

## Presentation responsibility

Explain the spacing and color choices, then show keyboard navigation and one mobile layout.

## Additional assigned files

These files are included in your packet for maintenance or reference. Starter and vendor files are provided infrastructure, not tasks to recreate. See `team/FILE-OWNERSHIP.csv` for the file categories.

- `components/ui/accordion.tsx`
- `components/ui/alert-dialog.tsx`
- `components/ui/alert.tsx`
- `components/ui/aspect-ratio.tsx`
- `components/ui/attachment.tsx`
- `components/ui/avatar.tsx`
- `components/ui/badge.tsx`
- `components/ui/breadcrumb.tsx`
- `components/ui/bubble.tsx`
- `components/ui/button-group.tsx`
- `components/ui/button.tsx`
- `components/ui/calendar.tsx`
- `components/ui/card.tsx`
- `components/ui/carousel.tsx`
- `components/ui/chart.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/collapsible.tsx`
- `components/ui/combobox.tsx`
- `components/ui/command.tsx`
- `components/ui/context-menu.tsx`
- `components/ui/dialog.tsx`
- `components/ui/direction.tsx`
- `components/ui/drawer.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/empty.tsx`
- `components/ui/field.tsx`
- `components/ui/form.tsx`
- `components/ui/hover-card.tsx`
- `components/ui/input-group.tsx`
- `components/ui/input-otp.tsx`
- `components/ui/input.tsx`
- `components/ui/item.tsx`
- `components/ui/kbd.tsx`
- `components/ui/label.tsx`
- `components/ui/marker.tsx`
- `components/ui/menubar.tsx`
- `components/ui/message-scroller.tsx`
- `components/ui/message.tsx`
- `components/ui/native-select.tsx`
- `components/ui/navigation-menu.tsx`
- `components/ui/pagination.tsx`
- `components/ui/popover.tsx`
- `components/ui/progress.tsx`
- `components/ui/radio-group.tsx`
- `components/ui/resizable.tsx`
- `components/ui/scroll-area.tsx`
- `components/ui/select.tsx`
- `components/ui/separator.tsx`
- `components/ui/sheet.tsx`
- `components/ui/sidebar.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/slider.tsx`
- `components/ui/sonner.tsx`
- `components/ui/spinner.tsx`
- `components/ui/switch.tsx`
- `components/ui/table.tsx`
- `components/ui/tabs.tsx`
- `components/ui/textarea.tsx`
- `components/ui/toggle-group.tsx`
- `components/ui/toggle.tsx`
- `components/ui/tooltip.tsx`
- `components.json`
- `postcss.config.mjs`
- `public/file.svg`
- `public/globe.svg`
- `public/window.svg`
- `vendor/shadcn-tailwind-4.13.0.LICENSE.md`
- `vendor/shadcn-tailwind-4.13.0.css`
