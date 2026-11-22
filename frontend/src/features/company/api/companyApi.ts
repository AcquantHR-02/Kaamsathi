import { baseApi } from "@/store/baseApi";
import type { Company } from "../types/company.types";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Admin: companies waiting for verification, oldest first (plain list, no paging). */
    pendingCompanies: builder.query<Company[], void>({
      query: () => "/companies/pending",
      providesTags: [{ type: "Company", id: "PENDING" }],
    }),
  }),
});

export const { usePendingCompaniesQuery } = companyApi;
