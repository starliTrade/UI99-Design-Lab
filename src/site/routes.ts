/**
 * LIMINAL · SITE — THE ROUTES
 *
 * One table. The top bar, the docs sidebar, the ⌘K palette and the page switch
 * all read it, so adding a page is adding a row — the same rule the fixture
 * table follows for components.
 *
 * The shape is shadcn's, because that is the shape a component library's site
 * has settled into and there is nothing to gain by inventing a different one: a
 * top bar with the sections, a sidebar inside the docs, and a page per
 * component.
 */
export type DocSlug =
  | 'introduction'
  | 'installation'
  | 'theming'
  | 'typography'
  | 'accessibility'
  | 'contract'
  | 'agents';

export type Route =
  | { page: 'home' }
  | { page: 'docs'; slug: DocSlug }
  | { page: 'components' }
  | { page: 'component'; name: string }
  | { page: 'blocks' }
  | { page: 'themes' }
  | { page: 'colors' };

export interface DocPage {
  slug: DocSlug;
  label: string;
  /** One line, used as the sidebar's tooltip and the page's subtitle. */
  note: string;
  /** The sidebar group it belongs to. */
  section: string;
}

export const DOCS: DocPage[] = [
  { slug: 'introduction', label: 'Introduction', note: 'What this is, and what it claims', section: 'Getting started' },
  { slug: 'installation', label: 'Installation', note: 'Add it to an app', section: 'Getting started' },
  { slug: 'theming', label: 'Theming', note: 'Two scales, and an identity that is not a setting', section: 'Getting started' },
  { slug: 'typography', label: 'Typography', note: 'The scale, and why it is fluid', section: 'Foundations' },
  { slug: 'accessibility', label: 'Accessibility', note: 'The rules, and the guards that hold them', section: 'Foundations' },
  { slug: 'contract', label: 'The contract', note: 'The rules as executable checks', section: 'Foundations' },
  { slug: 'agents', label: 'For agents', note: 'A machine-readable contract', section: 'Foundations' },
];

/** The top bar. Five destinations, which is what fits before it becomes a list. */
export const TOP_NAV: { page: Route['page']; label: string; note: string }[] = [
  { page: 'docs', label: 'Docs', note: 'How it works' },
  { page: 'components', label: 'Components', note: 'All of them, live' },
  { page: 'blocks', label: 'Blocks', note: 'Whole screens' },
  { page: 'themes', label: 'Themes', note: 'Density and motion' },
  { page: 'colors', label: 'Colors', note: 'The ladder and the spectrum' },
];

/** A stable key for a route, so React can tell two routes apart. */
export function routeKey(r: Route): string {
  switch (r.page) {
    case 'component':
      return `component:${r.name}`;
    case 'docs':
      return `docs:${r.slug}`;
    default:
      return r.page;
  }
}
