# Backend requests from the frontend (Phase 6)

Things the frontend screens need that the backend doesn't provide yet. Each item names the screen, what's missing
today, and a suggested shape (change names as you like — just tell us). The frontend has a fallback for every item,
so none of them block work; they make the screens complete.

Priority: **P1** = a screen is noticeably incomplete · **P2** = nice to have · **P3** = polish.

Last updated: 2026-11-22 (backend shipped all items — see the table below).

---

## ✅ Shipped by the backend (2026-11-22) — all 14 items

All changes only ADD fields / endpoints (nothing renamed). Exact names:

| # | What shipped |
|---|---|
| 1 | `GET /api/admin/users/{id}` (ADMIN) → `{id, email, role, status, photoFileId, createdAt, company: NamedRef\|null, ownsCompany, mainAdmin, emailVerified, consentGivenAt, security: {failedLogins, maxFailedLogins, lockedUntil, activeSessions}, activity}`. `activity` depends on role (null keys are left out): SEEKER `{applications, activeApplications, savedJobs, resumes}` · COMPANY_OWNER / RECRUITER `{jobsPosted}` · ADMIN `{adminActions}`. 404 `USER_NOT_FOUND`. |
| 2 | `GET /api/admin/users` items now also have `company: {id, name} \| null`, `ownsCompany: boolean`, `mainAdmin: boolean`. |
| 3 | `GET /api/admin/admins` items have `mainAdmin: boolean` (exactly one is true; it is the `ADMIN_EMAIL` account, not "the oldest"). |
| 4 | `AuditLogResponse` + `action` (e.g. `COMPANY_VERIFIED`, `SKILL_CREATED`, `USER_DELETED`), `targetType` (`USER`, `COMPANY`, `JOB`, `PAYMENT`, `PLAN`, `SKILL`, `CITY`, `INDUSTRY`, `JOB_CATEGORY`), `targetLabel` (name snapshot; for a delete it is taken before the row is gone; for creates `targetId` is now the new item's id). Action names: `ADMIN_CREATED`, `USER_SUSPENDED/UNSUSPENDED/DELETED`, `COMPANY_VERIFIED/REJECTED`, `JOB_BLOCKED/UNBLOCKED`, `PAYMENT_APPROVED/REJECTED`, `<TYPE>_CREATED/UPDATED/DEACTIVATED/ACTIVATED` for SKILL, CITY, INDUSTRY, JOB_CATEGORY, PLAN. All three may be null on old rows → keep the fallback. |
| 5 | `PaymentRequestResponse` + `company: {id, name}` (`companyId` stays) — queue, billing history, approve / reject replies. |
| 6 | `SkillResponse`, `CityResponse`, `IndustryResponse`, `JobCategoryResponse` + `createdAt`. |
| 7 | `DashboardResponse.users.newThisWeek` (accounts made in the last 7 days), `DashboardResponse.jobs.expiringThisWeek` (ACTIVE jobs whose 60 days end in the next 7 days). |
| 8 | `GET /api/auth/invites/{token}` (public; note the `/api/auth` prefix) → `{email, companyName, invitedBy, expiresAt}`. `invitedBy` is the inviter's **email** (owners have no name in our data). Bad / used / expired → 400 `INVALID_LINK`. |
| 9 | `GET /api/auth/reset-password/{token}` (public) → `{maskedEmail: "p•••@gmail.com"}`. Bad / used / expired → 400 `INVALID_LINK`. The link stays usable. |
| 10 | `ACCOUNT_LOCKED` (429) now has `details.lockedUntil` (Instant) + header `Retry-After: <seconds>`. |
| 11 | `INVALID_OTP` after a wrong code has `details.triesLeft` (0 = code is dead, ask for a new one). No `details` for an unknown email or an expired code. |
| 12 | `GET /api/companies/{id}` (public, VERIFIED only; others 404 `COMPANY_NOT_FOUND`) → `{id, name, industry, size, location, website, logoFileId, responseScore: {replyRatePercent, basedOnApplications, newEmployer}, liveJobs, memberSince}`. |
| 13 | `PUT /api/companies/me/logo` (COMPANY_OWNER, multipart part `file`, jpeg/png/webp ≤ 2 MB → 200 `CompanyResponse`), `DELETE /api/companies/me/logo` → 204, `GET /api/companies/{id}/logo` (public image; 404 `FILE_NOT_FOUND` when none). `CompanyResponse` + `logoFileId`. Job cards do NOT carry the logo id yet — ask if needed. |
| 14 | `GET /api/admin/users?excludeSelf=true` leaves the calling admin out (default `false`). |

**Error shape:** `ApiError` may now include an optional `details` object (left out of the JSON when empty). Same 5 fields as before otherwise.

---

## Admin

### 1. Admin user detail — `GET /api/admin/users/{id}` · P1 · ✅ shipped
**Screen:** Admin → Users → user detail (template `02-users/AdminUserDetail`).
**Today:** there's no endpoint for one user, so a detail page can't load by itself (on reload or from a link). The
frontend shows a small drawer built from the list row instead.
**Suggested response** (`UserResponse` + extras):
```json
{
  "id": "…", "email": "…", "role": "SEEKER", "status": "ACTIVE", "photoFileId": null, "createdAt": "…",
  "emailVerified": true,
  "consentGivenAt": "2026-10-02T14:10:00Z",
  "company": { "id": "…", "name": "TechNova Labs" },
  "security": { "failedLogins": 2, "maxFailedLogins": 5, "lockedUntil": null, "activeSessions": 2 },
  "activity": { "applications": 7, "activeApplications": 4, "savedJobs": 7, "resumes": 2 }
}
```
`company` null for seekers/admins. `activity` can be role-specific (e.g. jobs posted for recruiters).

### 2. Users list — company name + "owns a company" · P2 · ✅ shipped
**Screen:** Admin → Users table.
**Today:** `UserResponse` has no company, so the table can't show "TechNova Labs" under an owner/recruiter email,
and Delete can't be disabled in advance for an owner who still owns a company (the user only finds out from the
409 message after clicking).
**Suggested:** add to the list items `"company": NamedRef | null` and `"ownsCompany": boolean`.

### 3. Who is the main admin — explicit flag · P2 · ✅ shipped
**Screen:** Admin → Users ("Add an admin" is main-admin only; the main admin row can't be changed).
**Today:** the frontend assumes `GET /api/admin/admins` returns the main admin first (oldest). That works but is
implicit.
**Suggested:** `"mainAdmin": true` on the admin in `GET /api/admin/admins`, or `"mainAdmin": boolean` in `GET /api/auth/me`
for admins.

### 14. Users list — leave out the caller · P3 · ✅ shipped
**Screen:** Admin → Users.
**Today:** the signed-in admin's own row is hidden in the browser, so "Showing 1–10 of 40" is off by one on
pages where they don't appear.
**Suggested:** exclude the caller from `GET /api/admin/users` (or an `excludeSelf=true` param).

### 4. Audit log — say *what* was acted on · P1 · ✅ shipped
**Screens:** Admin → Audit log, Dashboard "Recent admin actions".
**Today:** `AuditLogResponse` has only `method`, `path`, `targetId`. The frontend turns method + path into words
("Verified company") but can only show the target as `#8f2c1a7e`.
**Suggested:** add `"targetType": "COMPANY" | "USER" | "JOB" | "PAYMENT" | "PLAN" | "SKILL" | …` and
`"targetLabel": "TechNova Labs"` (a snapshot taken when the action happened, so it survives renames/deletes).
Optional: `"action": "COMPANY_VERIFIED"` so the frontend doesn't parse paths.

### 5. Payments — company name · P1 · ✅ shipped
**Screens:** Admin → Payments queue, Dashboard "Payments to approve", billing history.
**Today:** `PaymentRequestResponse` has `companyId` only, so admins can't see *who* paid without another lookup.
**Suggested:** replace or add `"company": { "id": "…", "name": "TechNova Labs" }`.

### 6. Master data — added date · P3 · ✅ shipped
**Screen:** Admin → Master data (template has an "Added" column).
**Today:** `SkillResponse` / `CityResponse` / `IndustryResponse` / `JobCategoryResponse` have no date; the column is
dropped.
**Suggested:** add `"createdAt": Instant`.

### 7. Dashboard — weekly hints · P3 · ✅ shipped
**Screen:** Admin → Dashboard (template tiles say "+312 this week", "74 expire this week").
**Today:** `DashboardResponse` has totals only.
**Suggested:** `users.newThisWeek`, `jobs.expiringThisWeek`.

---

## Auth

### 8. Invite preview — `GET /api/invites/{token}` · P1 · ✅ shipped
**Screen:** Accept invite (template shows "Rakesh invited you to TechNova Labs as recruiter" + the invited email).
**Today:** no way to read an invite before accepting, so that block is dropped.
**Suggested:** public, returns `{ "email": "…", "companyName": "…", "invitedBy": "…", "expiresAt": "…" }`; 404 /
`INVALID_LINK` when expired or used.

### 9. Reset password — whose account · P3 · ✅ shipped
**Screen:** Reset password (template shows "for p•••@gmail.com").
**Today:** the reset token gives no email.
**Suggested:** `GET /api/auth/reset-password/{token}` → `{ "maskedEmail": "p•••@gmail.com" }`, or the same check
used by #8.

### 10. `ACCOUNT_LOCKED` — unlock time · P2 · ✅ shipped
**Screen:** Sign in (locked notice).
**Today:** the 429 has no time, so the frontend says a fixed "in 15 minutes".
**Suggested:** add `"lockedUntil": Instant` to that `ApiError` (or a `Retry-After` header).

### 11. `INVALID_OTP` — tries left · P3 · ✅ shipped
**Screen:** Register → email OTP.
**Today:** no count, so the "3 tries left" line is dropped.
**Suggested:** add `"triesLeft": number` to that `ApiError`.

---

## Company

### 12. Public company profile — `GET /api/companies/{id}` · P1 · ✅ shipped
**Screen:** Public company page `/companies/[id]` (Step 4) and job detail "About the company".
**Today:** only `GET /api/companies/me` (signed-in owner/recruiter) exists.
**Suggested:** public, `VERIFIED` companies only: name, industry, size, location, website, logo, `responseScore`,
live job count.

### 13. Company logo upload — `PUT /api/companies/me/logo` · P2 · ✅ shipped
**Screens:** Company profile, job cards, company page.
**Today:** no logo upload; the frontend shows initials.
**Suggested:** multipart `file`, 2 MB image (same as profile photo), plus `GET /api/companies/{id}/logo`, and
`logoFileId` in `CompanyResponse`.

---

## Notes for the backend team
- Error shape stays `ApiError {timestamp, status, code, message, path}`; new fields can be added next to it.
- Please keep new fields **additive** (no renames) so the current frontend keeps working.
- Tell the frontend when an item ships; we'll switch the fallback off and update the screen.
