import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/config/constants";

// The ONE API definition. Every feature adds its endpoints with baseApi.injectEndpoints (never createApi).
// No global Content-Type: fetchBaseQuery sets JSON for objects and lets the browser set the multipart
// boundary for FormData (photo, resume, payment screenshot).
// Step 2 (auth) adds: Bearer access token on every call + one shared token refresh on 401.
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: [],
  endpoints: () => ({}),
});
