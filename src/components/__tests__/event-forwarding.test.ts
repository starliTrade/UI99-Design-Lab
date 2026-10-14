import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * A COMPONENT MUST FORWARD THE EVENTS IT DOES NOT USE.
 *
 * `Button` pulled eight handlers out of its props — onMouseEnter, onFocus,
 * onBlur and five more — and then never used one of them. The interaction is
 * CSS, so there was nothing to protect them from, and the effect was that a
 * consumer's `onFocus` was silently dropped.
 *
 * It surfaced as a HoverCard that could not open on focus: a card built on a
 * Button, whose keyboard path went through a handler the Button had eaten. A
 * dropped event is invisible in review — the component still works, just not
 * for the person who passed the handler.
 *
 * So: if a component destructures an event handler, it must use it.
 */
const SRC = resolve(__dirname, '../..');
const HANDLER = /^\s{4,}(on[A-Z][A-Za-z]+),$/gm;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    if (e === '__tests__' || e === '__matrix__' || e === 'node_modules') continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx$/.test(e) && !/Demo|Showcase/.test(e)) out.push(full);
  }
  return out;
}

describe('a component forwards the events it does not use', () => {
  it('no component destructures an event handler and drops it', () => {
    const offenders: string[] = [];
    for (const file of walk(join(SRC, 'components'))) {
      const src = readFileSync(file, 'utf8');
      const destructured = [...src.matchAll(HANDLER)].map((m) => m[1]);
      for (const handler of new Set(destructured)) {
        // One occurrence means the destructure line and nothing else.
        const uses = src.match(new RegExp(`\\b${handler}\\b`, 'g'))?.length ?? 0;
        if (uses <= 1) offenders.push(`${file.replace(SRC + '/', '')} drops ${handler}`);
      }
    }
    expect(offenders, 'a handler a consumer passed, thrown away').toEqual([]);
  });

  it('the sweep can fail — a component that drops one is caught', () => {
    // The guard is only worth having if it can go red, and the first version of
    // this test was itself vacuous: the fake was one line, the pattern wants a
    // destructure line, so it matched nothing and passed by finding nothing.
    // A test that cannot fail is worse than no test.
    const dropped = `function C({
      onClick,
      onFocus,
      ...rest
    }) {
      return <button {...rest} />;
    }`;
    const kept = `function C({
      onClick,
      onFocus,
      ...rest
    }) {
      return <button onClick={onClick} onFocus={onFocus} {...rest} />;
    }`;
    const droppedFound = [...dropped.matchAll(HANDLER)]
      .map((m) => m[1])
      .filter((h) => (dropped.match(new RegExp(`\\b${h}\\b`, 'g'))?.length ?? 0) <= 1);
    const keptFound = [...kept.matchAll(HANDLER)]
      .map((m) => m[1])
      .filter((h) => (kept.match(new RegExp(`\\b${h}\\b`, 'g'))?.length ?? 0) <= 1);
    expect(droppedFound).toEqual(['onClick', 'onFocus']);
    expect(keptFound).toEqual([]);
  });
});
