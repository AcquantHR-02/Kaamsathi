// The ONE place that formats dates and money. Backend sends UTC instants; India reads IST.

const IST = "Asia/Kolkata";

const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric" });
const dateTimeYearFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: IST }); // YYYY-MM-DD
const countFmt = new Intl.NumberFormat("en-IN");

/** "21 Nov, 11:42" (IST). */
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso)).replace(" at ", ", ");

/** "2 Oct 2026, 19:40" (IST). */
export const formatDateTimeYear = (iso: string) => dateTimeYearFmt.format(new Date(iso)).replace(" at ", ", ");

/** "21 Nov 2026" (IST). */
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));

/** Indian grouping: 12,480 · 1,25,000. */
export const formatCount = (n: number) => countFmt.format(n);

/** Whole rupees: "₹1,499". */
export const formatRupees = (n: number) => `₹${countFmt.format(n)}`;

/** Calendar days between an instant and now, counted in IST (so 11 pm → 1 am is "1 day"). */
export function daysSince(iso: string, now = new Date()): number {
  const day = (d: Date) => Date.parse(dayKeyFmt.format(d));
  return Math.max(0, Math.round((day(now) - day(new Date(iso))) / 86_400_000));
}

/** "today" · "1 day" · "5 days". */
export function daysLabel(iso: string): string {
  const days = daysSince(iso);
  return days === 0 ? "today" : `${days} ${days === 1 ? "day" : "days"}`;
}
