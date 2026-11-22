import { baseApi } from "@/store/baseApi";
import type { MasterItem, MasterItemInput, MasterKind } from "../types/masterdata.types";

// Admin side of master data. Public pickers (GET /masterdata/{kind}?q) come with Step 4.
// Each list has its own tag, so changing a city refetches only cities.

const listTag = (kind: MasterKind) => ({ type: "MasterData" as const, id: kind });

export const masterdataApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Admin: every item, hidden ones included. */
    allMasterItems: builder.query<MasterItem[], MasterKind>({
      query: (kind) => `/masterdata/${kind}/all`,
      providesTags: (_result, _error, kind) => [listTag(kind)],
    }),
    addMasterItem: builder.mutation<MasterItem, { kind: MasterKind } & MasterItemInput>({
      query: ({ kind, ...body }) => ({ url: `/masterdata/${kind}`, method: "POST", body }),
      invalidatesTags: (_result, error, { kind }) => (error ? [] : [listTag(kind), "AuditLog"]),
    }),
    renameMasterItem: builder.mutation<MasterItem, { kind: MasterKind; id: string } & MasterItemInput>({
      query: ({ kind, id, ...body }) => ({ url: `/masterdata/${kind}/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, error, { kind }) => (error ? [] : [listTag(kind), "AuditLog"]),
    }),
    setMasterItemActive: builder.mutation<MasterItem, { kind: MasterKind; id: string; active: boolean }>({
      query: ({ kind, id, active }) => ({
        url: `/masterdata/${kind}/${id}/${active ? "activate" : "deactivate"}`,
        method: "POST",
      }),
      invalidatesTags: (_result, error, { kind }) => (error ? [] : [listTag(kind), "AuditLog"]),
    }),
  }),
});

export const {
  useAllMasterItemsQuery,
  useAddMasterItemMutation,
  useRenameMasterItemMutation,
  useSetMasterItemActiveMutation,
} = masterdataApi;
