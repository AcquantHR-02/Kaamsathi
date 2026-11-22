import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminMasterData } from "@/features/masterdata";

export const metadata: Metadata = { title: "Master data" };

// Suspense: the screen reads ?list= with useSearchParams.
export default function MasterDataPage() {
  return (
    <Suspense>
      <AdminMasterData />
    </Suspense>
  );
}
