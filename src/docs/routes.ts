/**
 * LIMINAL · DOCS — THE ROUTES
 *
 * One table. The sidebar, the search and the page switch all read it, so adding
 * a page is adding a row — the same rule the fixture table follows for
 * components.
 */
export type Route =
  | { page: 'overview' }
  | { page: 'components' }
  | { page: 'component'; name: string }
  | { page: 'tokens' }
  | { page: 'contract' }
  | { page: 'studio' }
  | { page: 'examples' };

export interface PageDef {
  page: Route['page'];
  label: string;
  note: string;
}

export const PAGES: PageDef[] = [
  { page: 'overview', label: 'مرور', note: 'موتور در یک نگاه' },
  { page: 'components', label: 'کامپوننت‌ها', note: 'همه، با پوشش' },
  { page: 'tokens', label: 'توکن‌ها', note: 'نردبان، چاه‌ها، کنتراست' },
  { page: 'contract', label: 'قرارداد', note: 'قوانین سخت، زنده' },
  { page: 'studio', label: 'استودیو', note: 'ابزارِ بازبینی' },
  { page: 'examples', label: 'نمونه‌ها', note: 'یک اپ ساخته‌شده' },
];

/** A stable key for a route, so React can tell two routes apart. */
export function routeKey(r: Route): string {
  return r.page === 'component' ? `component:${r.name}` : r.page;
}
