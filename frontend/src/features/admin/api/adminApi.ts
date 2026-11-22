import { baseApi } from "@/store/baseApi";
import type { PageResponse } from "@/types";
import type {
  AdminUser,
  AdminUserDetail,
  AuditLogEntry,
  AuditLogParams,
  Dashboard,
  UsersParams,
} from "../types/admin.types";

const USERS = { type: "User" as const, id: "LIST" };
const ADMINS = { type: "User" as const, id: "ADMINS" };

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    dashboard: builder.query<Dashboard, void>({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),
    /** Newest first; filter by admin or by target (e.g. one company's history). */
    auditLog: builder.query<PageResponse<AuditLogEntry>, AuditLogParams>({
      query: (params) => ({ url: "/admin/audit-log", params }),
      providesTags: ["AuditLog"],
    }),

    /** All accounts, newest first; q = email contains. Empty filters are dropped from the URL. */
    users: builder.query<PageResponse<AdminUser>, UsersParams>({
      query: (params) => ({
        url: "/admin/users",
        params: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "")),
      }),
      providesTags: [USERS],
    }),
    /** One account with sign-in security + role-specific activity. */
    userDetail: builder.query<AdminUserDetail, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),
    /** Suspending also signs the person out everywhere (backend revokes refresh tokens). */
    setUserSuspended: builder.mutation<AdminUser, { id: string; suspended: boolean }>({
      query: ({ id, suspended }) => ({
        url: `/admin/users/${id}/${suspended ? "suspend" : "unsuspend"}`,
        method: "POST",
      }),
      invalidatesTags: (_r, error, { id }) =>
        error ? [] : [USERS, ADMINS, { type: "User", id }, "AuditLog", "Dashboard"],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, error) => (error ? [] : [USERS, ADMINS, "AuditLog", "Dashboard"]),
    }),

    /** Oldest first, so [0] is the main admin. */
    admins: builder.query<AdminUser[], void>({
      query: () => "/admin/admins",
      providesTags: [ADMINS],
    }),
    /** Main admin only. Backend emails a 24 h set-password link. */
    createAdmin: builder.mutation<AdminUser, { email: string }>({
      query: (body) => ({ url: "/admin/admins", method: "POST", body }),
      invalidatesTags: (_r, error) => (error ? [] : [USERS, ADMINS, "AuditLog", "Dashboard"]),
    }),
  }),
});

export const {
  useDashboardQuery,
  useAuditLogQuery,
  useUsersQuery,
  useUserDetailQuery,
  useSetUserSuspendedMutation,
  useDeleteUserMutation,
  useAdminsQuery,
  useCreateAdminMutation,
} = adminApi;
