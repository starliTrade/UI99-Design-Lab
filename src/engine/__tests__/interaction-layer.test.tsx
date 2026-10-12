import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { TableRow } from '../../components/data/Table/TableRow';
import { Checkbox } from '../../components/inputs/Checkbox/Checkbox';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, '../liminal-interaction.css'), 'utf8');

/**
 * Three times in one session the same defect appeared: a component set a
 * property the layer is supposed to own, and an inline style beat the CSS rule
 * that was meant to handle it.
 *
 *   Checkbox / Radio            `outline: 'none'`   cancelled the focus ring
 *   TableRow                    `background`        cancelled the row hover
 *   Alert/Toast/Breadcrumb/Tabs `color`             cancelled the hover colour
 *
 * The last one had a second half: the layer only had the `:hover` rule, so
 * there was no base rule for a component to hand the property to. A pattern is
 * not complete until BOTH halves exist.
 */
describe('the interaction layer — every opt-in pattern has both halves', () => {
  const patterns = [
    { attr: 'data-liminal-surface', base: 'background', hover: 'background' },
    { attr: 'data-liminal-hover-color', base: 'color', hover: 'color' },
    { attr: 'data-liminal-focus-within', base: 'background', hover: null },
    { attr: 'data-liminal-hover-reveal', base: null, hover: null },
  ];

  it('declares the opt-in attributes it is documented to have', () => {
    for (const p of patterns) {
      expect(css, `${p.attr} is not in the layer`).toContain(`[${p.attr}]`);
    }
  });

  it('gives every pattern that sets a property on hover a base rule too', () => {
    // Without the base rule the component has to set the property itself, and
    // an inline style then cancels the hover — which is exactly what happened.
    for (const p of patterns.filter((x) => x.hover)) {
      const baseRule = new RegExp(`\\[${p.attr}\\]\\s*\\{[^}]*${p.base}`, 's');
      expect(baseRule.test(css), `${p.attr} has a hover rule but no base rule`).toBe(true);
    }
  });

  it('never uses !important to win an argument with an inline style', () => {
    // The fix for an inline style beating a rule is to stop setting it inline,
    // not to shout louder.
    expect(css).not.toContain('!important');
  });
});

describe('the interaction layer — a component that opts in must not set the property', () => {
  // A static scan cannot tell which ELEMENT a declaration belongs to, so this
  // renders the components fixed today and reads their style attribute. The
  // general case is caught by the runtime probe in the commit notes; this is
  // the regression guard for the ones that were wrong.
  const render = (el: React.ReactElement) => renderToStaticMarkup(el);

  const CASES: Array<{ name: string; html: string; attr: string; forbidden: RegExp }> = [
    {
      name: 'TableRow',
      html: render(<TableRow>cell</TableRow>),
      attr: 'data-liminal-surface',
      forbidden: /(^|;)\s*background\s*:/,
    },
    {
      name: 'Checkbox',
      html: render(<Checkbox checked={false} onChange={() => {}} />),
      attr: 'data-liminal-focusable',
      forbidden: /(^|;)\s*outline\s*:/,
    },
  ];

  it('opts in, and leaves the property to the layer', () => {
    for (const c of CASES) {
      expect(c.html, `${c.name} does not opt in`).toContain(c.attr);
      expect(c.forbidden.test(c.html), `${c.name} still sets the property inline`).toBe(false);
    }
  });
});
