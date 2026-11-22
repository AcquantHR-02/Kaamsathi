import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/config/constants";

// The ONE API definition. Every feature adds its endpoints with baseApi.injectEndpoints (never createApi).
// No global Content-Type: fetchBaseQuery sets JSON for objects and lets the browser set the multipart
// boundary for FormData (photo, resume, payment screenshot).
// Tokens never reach the browser: the BFF (app/api) adds the Bearer token and refreshes on 401.
// Tags: a write invalidates the lists it changes, so they refetch by themselves.
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Dashboard", "AuditLog", "Company", "Payment", "MasterData", "Plan", "User"],
  endpoints: () => ({}),
});
