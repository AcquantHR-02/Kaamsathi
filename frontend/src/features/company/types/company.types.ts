// Mirrors backend company DTOs (company/dto).

export type CompanyStatus = "PENDING" | "VERIFIED" | "REJECTED";

/** Public reply badge: "Replies to X% within 4 days" or "New employer" (< 10 applications). */
export interface EmployerScore {
  replyRatePercent: number | null;
  basedOnApplications: number;
  newEmployer: boolean;
}

export interface Company {
  id: string;
  ownerId: string;
  name: string;
  gstin: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  status: CompanyStatus;
  rejectionReason: string | null;
  responseScore: EmployerScore;
  createdAt: string;
}
