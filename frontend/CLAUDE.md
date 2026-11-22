# Kaamsathi Frontend (Phase 6)

Idea/rules: `../backend/Job_Portal_Project_Reference.md` · API history: `../backend/CLAUDE.md` (read only the needed section).
Pattern reference: `C:\Users\Rakesh\Desktop\Audit-Tool\audit-frontend` (same stack, adapt, don't copy blindly).
Templates: `C:\Users\Rakesh\Downloads\Kaamsathi-Frontend-Templates\Kaamsathi-Frontend-Templates\` (see Design).

## Rules
- Step by step, one small piece at a time: before each piece say WHAT + HOW in easy words, list files + folder + why, then build. Ask OK only for idea/decision changes.
- Short replies: must-know points + "🎤 Interview" box. No scope creep.
- After every piece: types + lint, then update this file (**minimum words**).
- Module done → say "✅ MODULE COMPLETE". No git commands/reminders (user commits).
- One visible action per tool call. Never modify `../backend`; report gaps (file + snippet).
- Verify every API against the backend controller + DTO before wiring.
- Senior-level clean code; polished, responsive UI; comments only for non-obvious WHY.
- Ask before running tests; say which specs and why (user is new to Playwright).

## Stack (locked)
Next.js 16.4 (App Router, Turbopack, React Compiler) · React 19.3 · TS strict · AntD v6 + nextjs-registry · RTK Query · styled-components · Motion (`motion/react`) · lucide-react · dayjs · Prettier (120, CRLF). Port **3000**.
- `cacheComponents` OFF (AntD/styled-components random ids break prerender).
- Providers: AntdRegistry → StyledComponentsRegistry → StoreProvider (`makeStore`) → ThemeProvider (ConfigProvider + GlobalStyles + MotionConfig reducedMotion="user" + AntD App).
- Lint `set-state-in-effect`: initial state via `useState(() => …)`; effects only sync outside things.
- ONE `baseApi`; features use `injectEndpoints`. AntD overrides need `&&`. styled-components files need `"use client"`.
- Theme: `<html data-theme>` set before paint (`THEME_INIT_SCRIPT`); `lib/themeMode.ts` (localStorage `kaamsathi.theme`, follows system, cross-tab). Client hooks not exported from `lib/index.ts` (server layout imports it). `<html>`/`<body>` suppressHydrationWarning.
- Security headers in `next.config.ts`; DevTools off in prod; never keep passwords in state.
- Dates: UTC `Instant` → IST via one formatter. Money: whole rupees (`₹1,499`).
- Dev server: never `next build` while `next dev` runs; config change restarts dev; port 3000 busy → ask user to stop old server. Broken `@next/swc-win32-x64-msvc` → delete folder + `npm install`.

## Session (BFF, Audit-style cookies)
Browser never sees tokens; calls same-origin `/api/*`.
- `lib/server/session.ts`: httpOnly cookies `ks_at` (expiresIn − 30 s), `ks_rt` (7 d), sameSite lax; refresh deduped per token (10 s) because backend rotates it.
- Routes: `app/api/auth/login` (cookies → returns `/me` user), `app/api/auth/logout` (always 204), `app/api/[...path]` (forward + Bearer; no access cookie → refresh first; 401 → refresh + retry once; invalid refresh / DELETE me → clear; `auth/refresh` → 404; backend down → 502 `BACKEND_UNAVAILABLE`).
- Client `lib/session.ts` (Audit pattern): `/api/auth/me` once per load; `undefined` checking / `null` signed out; cross-tab signal; sign-in handoff. `useAuth()` → `{ user, isReady, logout }`.
- `proxy.ts` (Step 3) = optimistic guard only, never session logic.

## Folder structure (locked)
```
src/app/            routes only (thin page.tsx → feature component)
  api/              BFF route handlers
  (auth)/           login, register, forgot-password, reset-password, accept-invite, session-expired
  (public)/         Home, jobs, jobs/[id], companies/[id]
  (protected)/      seeker/…, employer/…, admin/… (layout = guard + shell)
src/components/     shared: layout/, ui/
src/config/ lib/ (lib/server/ = server-only) store/ styles/ types/
src/features/<module>/  api/ components/ hooks/ styles/ types/ utils/ index.ts
e2e/                Playwright (gitignored): support/, <feature>.spec.ts
```
One-feature code stays in the feature; import features only via `index.ts`. Lowercase singular folders, created with their first file. Temporary: `app/page.tsx` preview → Home in Step 4.

## Backend contract
- No wrapper: success = DTO; error = `ApiError {timestamp,status,code,message,path}` (show message, branch on code). Page = `{items, page (0-based), size, totalItems, totalPages}`, max 50. `NamedRef {id,name}`; ids are UUID strings.
- `CurrentUser` = `{id,email,role,status,photoFileId,createdAt}`. Roles SEEKER / COMPANY_OWNER / RECRUITER / ADMIN.
- One login page for all roles. Register: seeker | company → OTP on the same page (6 digits, 10 min, 5 tries, resend 60 s) → login. Admins never register.
- Login errors: 401 INVALID_CREDENTIALS · 403 EMAIL_NOT_VERIFIED · 403 ACCOUNT_SUSPENDED · 429 ACCOUNT_LOCKED.
- Files: multipart `file` (photo), `screenshot` (payment); photo/logo 2 MB, resume 5 MB pdf/docx, proof 5 MB. Protected images/downloads: fetch → blob URL.
- User's `DEV_EXPOSE_TOKENS` is off → OTP/links only in the IntelliJ console (ask the user).

| Module | Endpoints (`/api`) |
|---|---|
| auth | signup/seeker\|company, verify-email, resend-otp, login, logout, forgot-password, reset-password · GET/DELETE me · PUT/DELETE me/photo · GET users/{id}/photo · invites (owner), invites/accept, GET invites/{token} (preview) |
| company | POST companies · GET companies/{id} (public) · GET/PUT companies/me · PUT companies/me/logo · me/recruiters (+DELETE {id}) · me/transfer-ownership · me/subscription · admin: companies/pending, {id}/verify\|reject |
| masterdata | GET masterdata/{skills,industries,categories,cities}?q · admin …/all, POST, PUT {id}, {id}/activate\|deactivate |
| job | GET jobs (q, cityId, categoryId, skillId, workMode, jobType, experience, salaryMin, page, size), jobs/{id} · owner/recruiter: POST jobs, jobs/mine, PUT {id}, {id}/close\|reopen · seeker: POST/DELETE {id}/save, jobs/saved · admin/jobs (+block\|unblock) |
| seeker | GET/PUT seekers/me · PUT/GET seekers/me/resume |
| application | POST jobs/{id}/apply · applications/mine, applications/{id}, {id}/withdraw · recruiter: jobs/{id}/applications, company/applications/{id} (first open = VIEWED), {id}/resume, {id}/status, {id}/notes, {id}/rating |
| payment | plans · POST payments (multipart), payments/mine · admin/plans, admin/payments/pending, {id}/approve\|reject |
| notification | notifications, unread-count, {id}/read, read-all |
| admin | admin/dashboard, admin/audit-log, admin/users (?excludeSelf; +{id}, suspend/unsuspend/delete), admin/admins |

UI rules: show backend statuses as-is; job card employer badge ("Replies to X% within 4 days" / "New employer"); seeker never sees notes/rating; limit errors → friendly message + link to plans/company.
Gaps → `BACKEND_REQUESTS.md` (add new ones there). #1–#14 ✅ pushed (main `232980b`, PR #8) → wire per screen after checking controller + DTO.

## Design
- Effects from Skiper UI / Vengeance UI (+ "animeaster", lib unconfirmed): REWRITE in styled-components + Motion in `components/ui/` (no Tailwind), tokens only. Use on Home hero/sections, job/company cards, empty/success states, dashboard numbers; not forms/tables/auth.
- Templates = source of truth: read a screen's template(s) before building; copy sizes/text/states. `Screen--state.html` = states. `13-mobile` = 390 px. `14-ai-phase7` = later.
- Check: `npx playwright screenshot --viewport-size="1440,900" --color-scheme=dark <url> <scratchpad png>` for template + ours, compare.
- Tokens (last "comfort layer") live in `styles/tokens.ts`; no hard-coded colours. Fonts Plus Jakarta Sans 15/24, JetBrains Mono.
- Sizes: inputs/buttons 48px r12; auth card r24 p40 (440/460/480/520 wide); section cards r16; glows blur 100 opacity .18.
- Signed-in UI: sizes via `s(px)` (`styles/scale.ts`); `--s` = clamp(0.9px, 100vw/1440, 1px) on ≥1024px (user's 150%-scaled laptop ≈1280 wide looked too big at 1×).
- Auth pages: sizes via `u(px)`; `--u` = clamp(0.8px, min(100dvh/900, 100vw/1440), 1px) on ≥1024px; short screens → tighter spacing, never smaller text (`shortScreen` in `auth.styles.ts`); brand panel hidden <1024px. Logo top-left corner, theme toggle top-right (logo above the card made Register scroll).
- Feel: no jumps/spinner flashes; skeletons; soft shared motion (`styles/motion.ts`); hover-only scrollbars.
- **Compact layout (user, all modules):** most info on one screen, no scrolling for a 10-row page. Table full width; add/edit/details in a right **Drawer** (≤440 wide) opened from a PageHeader primary button (header actions top-aligned, 40px = theme toggle); one toolbar row (tabs/filters left, search right); filter Selects = `components/ui/HoverSelect` (open on hover); rows **fit the screen**: `FIT_ROW_HEIGHT` in DataTable = clamp(28px btn + padding, (100dvh − s(262))/10, s(56)) — also on MasterList grid rows; `size="small"` buttons 28px; **10 rows per page**, every table paginated (`Pager` 32px items in card footer; `lib/usePagedList` when the backend returns all). Columns: first left, rest centered (DataTable rule; actions `justify-content: center`). Badges one width (`StatusBadge` min-width s(108), height s(22)). Shell padding 20/32/24, section gaps 16. Own row shown, tagged **ME** (no actions) — user's choice.
- Shared UI first (`components/ui/`). Forms: inline validation, backend message in FormErrorAlert (place INSIDE the form), trim emails, Save disabled until valid/changed (non-auth), leave warning.
- In-sentence links get a soft underline (WCAG).
- Off-screen glows: page wrapper `overflow: clip` (both axes), else they add scroll.

## Testing
Playwright + axe (Chromium now; Firefox/WebKit before release). `npm run test:e2e`; terminal: `--reporter=list --output="$env:TEMP\pw-results"`.
`e2e/support/mockApi.ts`: `mockApi`, `apiError`, `mockSignedOut`, `errorBanner`, `waitForAnimations` (call before axe/screenshots). Mocks need no CORS; BFF routes are tested live.
While building → that module's specs; shared code changed → full suite; release → all browsers + live backend.

## Plan (every screen = its template; adjust only when needed and tell the user why)
1 Setup · 2 Auth (2.1 Session · 2.2 API · 2.3 Shell · 2.4 Sign in · 2.5 Register+OTP · 2.6 Forgot/Reset · 2.7 Invite) · 3 App shell + nav + bell · 4 Public · 5 Seeker · 6 Employer · 7 Admin

| Step | Templates |
|---|---|
| 2 | 01-auth/* |
| 3 | 12-common (States, ConfirmDialogs), 09-file (FileUploads); bell = placeholder |
| last (user) | 10-notification (NotificationsPanel, NotificationsPage) — after Step 7 |
| 4 | 05-job (Main = Home, JobSearch, JobDetail), 06 MasterDataPickers, 13-mobile (Home, Search, Job) |
| 5 | 04-seeker, 07 (SeekerDashboard, ApplyFlow--*, ApplicationTracker), 05 SavedJobs, 13 MobileTracker |
| 6 | 03-company (RegisterCompany--*, CompanyProfile, EmployerDashboard, Team, RecruiterView), 05 (EmployerJobs, PostJob, PostBlocked--*), 07 Applicants, 09 ResumeViewer--*, 08 (Billing, SubscriptionStates--*), 02 StaffSettings--owner/recruiter, 13 MobileApplicants |
| 7 | 11-admin, 02 (AdminUsers, AdminUserDetail, StaffSettings--admin/main-admin), 03 (AdminCompanies, AdminCompanyManage), 05 AdminJobs, 06 AdminMasterData--*, 08 (AdminPayments, AdminPlans, AdminBillingHistory) |
| later | 14-ai-phase7 · 10 EmailTemplates (backend emails) |

## Progress
- ✅ 1 Setup · ✅ 2 Auth (main `8bbf7e3`) · Step 3 + 7.1–7.3 merged (main `232980b`); later pieces uncommitted: Sign in 14 · Register+OTP 10 · Forgot/Reset 8 · Invite 5. Release TODO: Firefox paste, WebKit hydration race (register spec).
- ✅ 3.1 proxy guard (5) · ✅ 3.2 SidebarShell/RoleGuard/PageHeader/AccountMenu + placeholder page per nav link (10) · ✅ 3.3 StateCard/ErrorState/404 (1) · ✅ 3.4 ConfirmDialog (title in Modal `title`, `mask={{closable}}`).
- Sidebar: 216px, collapse to 72px rail (localStorage), link ::before gradient + ::after edge bar on top.
- Order (user): ADMIN first → 4 Public → 5 Seeker (+top bar, mobile tabs, 3.5 FileUploads) → 6 Employer → notifications last. Step 7: Master data → Plans → Users → Jobs → Companies → Payments → Audit log → Dashboard last.
- ✅ 7.1 Master data (7): tabs + counts (`?list=`), search in toolbar, inline rename, Hide/Show, add drawer (stays open; city needs State).
- ✅ 7.2 Plans (6): table + "New plan"/Edit drawer (PlanForm, PlanRequest limits).
- ✅ 7.3 Users (8): filters → URL, server paging, Suspend/Delete confirm, own row tagged ME, "Add admin" drawer (main admin only + other admins), UserDetailDrawer (row + photo img + audit by targetId).
- Wiring backend #1–#14 (backend restarted, live): ✅ Users list (company under email, Delete disabled if ownsCompany, `mainAdmin` flag; types AdminUser/AdminUserDetail + audit action/targetType/targetLabel; api `userDetail`) 8/8.
- Next: UserDetailDrawer → `useUserDetailQuery` (security, activity, consent); audit `targetLabel` in history; master data "Added" (createdAt); auth details.lockedUntil/triesLeft, reset + invite previews; then 7.4 Jobs.
- Shared: `lib/format` (IST, ₹), `lib/usePagedList`, ui DataTable/Pager/StatusBadge/StatTile/Panel/HoverSelect. Dashboard components drafted, not wired.
- Auth pages: `--u` max 1.25px, AuthShell `fitHeight`, `shortScreen` 720px (re-check company 701–719). Template changes told: locked "in 15 minutes", logo/toggle corners, no tries-left (now shipped → add).
