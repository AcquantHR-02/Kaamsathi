"use client";

import { useState } from "react";

// Pages a full list in the browser, for endpoints that return everything (plans, master data, queues).
// Same 0-based page as the backend's Page, so <Pager> works for both kinds of table.

export function usePagedList<T>(items: readonly T[] | undefined, size: number) {
  const [requested, setPage] = useState(0);
  const totalItems = items?.length ?? 0;
  const lastPage = Math.max(0, Math.ceil(totalItems / size) - 1);
  // Clamped at render (not in an effect): after a delete/search the page never points past the end.
  const page = Math.min(requested, lastPage);

  return {
    page,
    size,
    totalItems,
    setPage,
    pageItems: items?.slice(page * size, (page + 1) * size),
  };
}
