import type { AuditLogEntry } from "../types/admin.types";

// The audit log stores method + path only (no names, no bodies), so the UI turns the backend's
// admin routes into words. Unknown routes fall back to "POST /…" so nothing is ever hidden.

export type AuditTone = "ok" | "warn" | "bad" | "info";

const MASTER: Record<string, string> = {
  skills: "skill",
  industries: "industry",
  categories: "category",
  cities: "city",
};

const ID = "[0-9a-f-]{36}";

const RULES: { method: string; path: RegExp; label: (m: RegExpMatchArray) => string; tone: AuditTone }[] = [
  { method: "POST", path: new RegExp(`^/companies/${ID}/verify$`), label: () => "Verified company", tone: "ok" },
  { method: "POST", path: new RegExp(`^/companies/${ID}/reject$`), label: () => "Rejected company", tone: "bad" },
  { method: "POST", path: new RegExp(`^/admin/payments/${ID}/approve$`), label: () => "Approved payment", tone: "ok" },
  { method: "POST", path: new RegExp(`^/admin/payments/${ID}/reject$`), label: () => "Rejected payment", tone: "bad" },
  { method: "POST", path: new RegExp(`^/admin/jobs/${ID}/block$`), label: () => "Blocked job", tone: "bad" },
  { method: "POST", path: new RegExp(`^/admin/jobs/${ID}/unblock$`), label: () => "Unblocked job", tone: "ok" },
  { method: "POST", path: new RegExp(`^/admin/users/${ID}/suspend$`), label: () => "Suspended user", tone: "warn" },
  { method: "POST", path: new RegExp(`^/admin/users/${ID}/unsuspend$`), label: () => "Unsuspended user", tone: "ok" },
  { method: "DELETE", path: new RegExp(`^/admin/users/${ID}$`), label: () => "Deleted user", tone: "bad" },
  { method: "POST", path: /^\/admin\/admins$/, label: () => "Added admin", tone: "info" },
  { method: "POST", path: /^\/admin\/plans$/, label: () => "Added plan", tone: "info" },
  { method: "PUT", path: new RegExp(`^/admin/plans/${ID}$`), label: () => "Edited plan", tone: "info" },
  {
    method: "POST",
    path: new RegExp(`^/admin/plans/${ID}/(activate|deactivate)$`),
    label: (m) => (m[1] === "activate" ? "Showed plan" : "Hid plan"),
    tone: "warn",
  },
  {
    method: "POST",
    path: /^\/masterdata\/(skills|industries|categories|cities)$/,
    label: (m) => `Added ${MASTER[m[1]]}`,
    tone: "info",
  },
  {
    method: "PUT",
    path: new RegExp(`^/masterdata/(skills|industries|categories|cities)/${ID}$`),
    label: (m) => `Edited ${MASTER[m[1]]}`,
    tone: "info",
  },
  {
    method: "POST",
    path: new RegExp(`^/masterdata/(skills|industries|categories|cities)/${ID}/(activate|deactivate)$`),
    label: (m) => `${m[2] === "activate" ? "Activated" : "Deactivated"} ${MASTER[m[1]]}`,
    tone: "warn",
  },
];

export function describeAudit(entry: Pick<AuditLogEntry, "method" | "path">): { label: string; tone: AuditTone } {
  const path = entry.path.replace(/^\/api/, "");
  for (const rule of RULES) {
    if (rule.method !== entry.method) continue;
    const match = path.match(rule.path);
    if (match) return { label: rule.label(match), tone: rule.tone };
  }
  return { label: `${entry.method} ${path}`, tone: "info" };
}
