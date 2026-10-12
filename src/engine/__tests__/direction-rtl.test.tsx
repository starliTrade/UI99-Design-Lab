import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { DirProvider, useDirection, useIsRTL, pick, inlineStart, inlineEnd } from '../liminal-direction';
import { Button } from '../../components/atoms/Button/Button';
import { Toggle } from '../../components/atoms/Toggle/Toggle';
import { Checkbox } from '../../components/inputs/Checkbox/Checkbox';
import { NavItem } from '../../components/nav/NavItem/NavItem';
import { Avatar } from '../../components/data/Avatar/Avatar';
import { PERSIAN_LINE_HEIGHT_FLOOR } from '../liminal-persian';
import { JALALI_WEEK_START } from '../liminal-jalali';

afterEach(cleanup);

function Probe() {
  const dir = useDirection();
  const rtl = useIsRTL();
  return <span data-testid="probe">{`${dir}:${rtl}:${inlineStart(dir)}:${inlineEnd(dir)}:${pick(dir, 'a', 'b')}`}</span>;
}

/**
 * jsdom has no layout engine, so it cannot resolve `margin-inline-start` to a
 * physical side. What it CAN prove is the half that decides everything else:
 * the provider sets the document direction, the helpers answer correctly, and
 * the components emit logical properties rather than physical ones. The
 * rendered result is checked in a real browser by `scripts/verify-rtl.mjs`.
 */
describe('rtl — the provider sets the document direction', () => {
  it('writes dir on the document element, where portals can see it', () => {
    render(
      <DirProvider dir="rtl">
        <Probe />
      </DirProvider>,
    );
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('restores the previous value when it unmounts', () => {
    document.documentElement.setAttribute('dir', 'ltr');
    const { unmount } = render(
      <DirProvider dir="rtl">
        <Probe />
      </DirProvider>,
    );
    unmount();
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });

  it('removes the attribute if there was none', () => {
    document.documentElement.removeAttribute('dir');
    const { unmount } = render(
      <DirProvider dir="rtl">
        <Probe />
      </DirProvider>,
    );
    unmount();
    expect(document.documentElement.hasAttribute('dir')).toBe(false);
  });

  it('answers the direction and the axis through context', () => {
    const { getByTestId } = render(
      <DirProvider dir="rtl">
        <Probe />
      </DirProvider>,
    );
    expect(getByTestId('probe').textContent).toBe('rtl:true:right:left:b');
  });

  it('defaults to ltr with no provider', () => {
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('probe').textContent).toBe('ltr:false:left:right:a');
  });
});

describe('rtl — the components render the same tree in both directions', () => {
  // A component that branches on direction in its markup would produce a
  // different tree here. None should: the axis is the CSS layer's job.
  const CASES: Array<[string, React.ReactElement]> = [
    ['Button', <Button>Save</Button>],
    ['Toggle', <Toggle checked onChange={() => {}} aria-label="On" />],
    ['Checkbox', <Checkbox checked={false} onChange={() => {}} label="Agree" />],
    ['NavItem', <NavItem>Dashboard</NavItem>],
    ['Avatar', <Avatar name="Clara" />],
  ];

  for (const [name, ui] of CASES) {
    it(`${name} renders identically under rtl`, () => {
      const ltr = render(ui).container.innerHTML;
      cleanup();
      const rtl = render(<DirProvider dir="rtl">{ui}</DirProvider>).container.innerHTML;
      expect(rtl).toBe(ltr);
    });
  }
});

describe('rtl — a component reads the direction from the document, not a prop', () => {
  // Select used to carry its own `rtl` and `dir` props and derive everything
  // from them. Two sources of direction is one too many: a field inside an RTL
  // page whose prop said `ltr` would render its caret on the wrong side.
  it('Select has no direction prop left', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/components/inputs/Select/Select.tsx'), 'utf8');
    expect(src).not.toMatch(/^\s*rtl\?:\s*boolean/m);
    expect(src).not.toMatch(/^\s*dir\?:\s*'rtl'/m);
    expect(src).toContain('useDirection()');
  });

  it('and no component derives its own direction from a prop', () => {
    const offenders: string[] = [];
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const e of readdirSync(dir)) {
        if (e === '__tests__' || e === 'node_modules') continue;
        const full = resolve(dir, e);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (/\.tsx$/.test(e) && !/Demo\.tsx$/.test(e)) out.push(full);
      }
      return out;
    };
    for (const file of walk(resolve(process.cwd(), 'src/components'))) {
      const text = readFileSync(file, 'utf8');
      if (/isRTL\s*=/.test(text)) offenders.push(file.split('/').pop()!);
    }
    expect(offenders).toEqual([]);
  });
});

describe('rtl — the CSS layer carries the language rules', () => {
  const fonts = readFileSync(resolve(process.cwd(), 'src/engine/liminal-fonts.css'), 'utf8');
  const index = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

  it('is imported by the entry stylesheet', () => {
    expect(index).toContain('liminal-fonts.css');
  });

  it('applies to :lang(fa), not to a class', () => {
    // A component that renders Persian should get this by declaring the
    // language — which it should do anyway for hyphenation and screen readers.
    expect(fonts).toContain(':lang(fa)');
  });

  it('sets the font, the floor and zero tracking together', () => {
    const block = fonts.slice(fonts.indexOf(':lang(fa)'));
    expect(block).toContain('font-family: var(--liminal-font-fa)');
    expect(block).toContain('line-height: var(--liminal-line-height-fa-floor');
    expect(block).toContain('letter-spacing: 0');
  });

  it('uses swap, not block — a FOUT is the honest failure mode', () => {
    expect(fonts).toContain('font-display: swap');
    expect(fonts).not.toContain('font-display: block');
  });

  it('splits the face by unicode-range so a page downloads only what it renders', () => {
    expect((fonts.match(/unicode-range/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(fonts).toContain('U+0600-06FF');
  });
});

describe('rtl — the constants the language rules rest on', () => {
  it('the Persian line-height floor is above every Latin level but body copy', () => {
    expect(PERSIAN_LINE_HEIGHT_FLOOR).toBeGreaterThan(1.5);
  });

  it('the week starts on Saturday', () => {
    expect(JALALI_WEEK_START).toBe(6);
  });
});
