import type { MasterKind } from "../types/masterdata.types";

/** Tab order + wording for the four lists (template 06-masterdata/AdminMasterData--*). */
export const MASTER_LISTS: { kind: MasterKind; label: string; singular: string; example: string }[] = [
  { kind: "skills", label: "Skills", singular: "skill", example: "Kafka" },
  { kind: "cities", label: "Cities", singular: "city", example: "Nagpur" },
  { kind: "industries", label: "Industries", singular: "industry", example: "Logistics" },
  { kind: "categories", label: "Job categories", singular: "job category", example: "Customer support" },
];

export const isMasterKind = (value: string | null): value is MasterKind =>
  MASTER_LISTS.some((list) => list.kind === value);

/** Same rule as the backend: names are unique ignoring capital letters (and outer spaces). */
export const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
