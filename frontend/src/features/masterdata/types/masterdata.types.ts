// Mirrors backend masterdata DTOs (SkillResponse, CityResponse, …). Same shape for all four lists;
// only cities carry a state.

/** URL segment of each list: /api/masterdata/{kind}. */
export type MasterKind = "skills" | "cities" | "industries" | "categories";

export interface MasterItem {
  id: string;
  name: string;
  /** Hidden items stay on old jobs/profiles but can't be picked any more. */
  active: boolean;
  /** Cities only. */
  state?: string;
}

/** Body of POST / PUT (MasterItemRequest; CityRequest adds state). */
export interface MasterItemInput {
  name: string;
  state?: string;
}
