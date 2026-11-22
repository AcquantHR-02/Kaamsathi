import { redirect } from "next/navigation";
import { ROUTES } from "@/config/constants";

// TEMPORARY until Home (Step 4, app/(public)/page.tsx): the only real screen so far is Sign in.
export default function HomePage() {
  redirect(ROUTES.LOGIN);
}
