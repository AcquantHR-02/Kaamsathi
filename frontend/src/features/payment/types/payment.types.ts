import type { NamedRef } from "@/types";

// Mirrors backend payment DTOs (payment/dto).

export type PaymentStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export interface PaymentRequest {
  id: string;
  /** Backend sends no company name here (gap) — only the id. */
  companyId: string;
  plan: NamedRef;
  /** Whole rupees, copied from the plan price when paid. */
  amountRupees: number;
  transactionId: string;
  screenshotFileId: string | null;
  status: PaymentStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

/** PlanResponse. Companies see active plans, cheapest first. */
export interface Plan {
  id: string;
  name: string;
  priceRupees: number;
  durationDays: number;
  jobSlots: number;
  recruiterSeats: number;
  active: boolean;
}

/** PlanRequest (create + edit). Editing never changes subscriptions already bought. */
export type PlanInput = Omit<Plan, "id" | "active">;
