export const STATIC_PAGE_SEGMENTS = [
  "blog",
  "contact",
  "pricing",
] as const;

export type StaticPageSegment = (typeof STATIC_PAGE_SEGMENTS)[number];
