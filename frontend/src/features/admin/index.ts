// Public surface of the admin feature: routes import from "@/features/admin" only.
export { default as AdminDashboard } from "./components/AdminDashboard";
export { default as AdminUsers } from "./components/AdminUsers";
export * from "./api/adminApi";
export * from "./types/admin.types";
