import { baseApi } from "@/store/baseApi";
import type { PaymentRequest, Plan, PlanInput } from "../types/payment.types";

const PLANS = { type: "Plan" as const, id: "LIST" };

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Admin: payments waiting for approval, oldest first (plain list). */
    pendingPayments: builder.query<PaymentRequest[], void>({
      query: () => "/admin/payments/pending",
      providesTags: [{ type: "Payment", id: "PENDING" }],
    }),

    /** Admin: every plan (hidden too), cheapest first. */
    adminPlans: builder.query<Plan[], void>({
      query: () => "/admin/plans",
      providesTags: [PLANS],
    }),
    addPlan: builder.mutation<Plan, PlanInput>({
      query: (body) => ({ url: "/admin/plans", method: "POST", body }),
      invalidatesTags: (_r, error) => (error ? [] : [PLANS, "AuditLog"]),
    }),
    updatePlan: builder.mutation<Plan, { id: string } & PlanInput>({
      query: ({ id, ...body }) => ({ url: `/admin/plans/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, error) => (error ? [] : [PLANS, "AuditLog"]),
    }),
    setPlanActive: builder.mutation<Plan, { id: string; active: boolean }>({
      query: ({ id, active }) => ({ url: `/admin/plans/${id}/${active ? "activate" : "deactivate"}`, method: "POST" }),
      invalidatesTags: (_r, error) => (error ? [] : [PLANS, "AuditLog"]),
    }),
  }),
});

export const {
  usePendingPaymentsQuery,
  useAdminPlansQuery,
  useAddPlanMutation,
  useUpdatePlanMutation,
  useSetPlanActiveMutation,
} = paymentApi;
