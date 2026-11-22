// Shared shapes that match the backend's common DTOs (backend/common/dto).

/** Every backend error body (GlobalExceptionHandler). Branch on `code`, show `message`. */
export interface ApiError {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
}

/** Paged list. `page` is 0-based; default size 20, max 50. */
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

/** Id + display name (city, skill, category, company, plan…). */
export interface NamedRef {
  id: string;
  name: string;
}

export type Role = "SEEKER" | "COMPANY_OWNER" | "RECRUITER" | "ADMIN";

export type UserStatus = "UNVERIFIED" | "ACTIVE" | "SUSPENDED";

/** Backend auth/dto/UserResponse: the signed-in user (GET /api/auth/me, login reply). */
export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  photoFileId: string | null;
  createdAt: string;
}
