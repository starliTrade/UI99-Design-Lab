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
  { page: 'overview', label: 'Overview', note: 'The engine at a glance' },
  { page: 'components', label: 'Components', note: 'All of them, with coverage' },
  { page: 'tokens', label: 'Tokens', note: 'The ladder, the wells, contrast' },
  { page: 'contract', label: 'Contract', note: 'The hard rules, live' },
  { page: 'studio', label: 'Studio', note: 'The review tool' },
  { page: 'examples', label: 'Examples', note: 'A built app' },
];

/** A stable key for a route, so React can tell two routes apart. */
export function routeKey(r: Route): string {
  return r.page === 'component' ? `component:${r.name}` : r.page;
}
