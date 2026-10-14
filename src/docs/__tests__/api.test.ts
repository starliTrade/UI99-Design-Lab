import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * THE API TABLE MUST BE GENERATED, AND MUST BE CURRENT.
 *
 * A hand-written props table has a documentation bug on the day a prop changes.
 * This one is read from the `…Props` interfaces, and this test fails when the
 * committed JSON is out of date — the same arrangement the design contract has.
 *
 * It also guards the READER, which is a light parser rather than the TypeScript
 * compiler API: this repo is on TypeScript 7, the native port, where
 * `ts.createProgram` does not exist. A light parser without a guard is a parser
 * that lies, so the test asserts it found things.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const JSON_PATH = resolve(ROOT, 'src/docs/api.json');

interface Entry {
  component: string;
  path: string;
  props: { name: string; type: string; required: boolean; doc?: string }[];
}

const api: Entry[] = JSON.parse(readFileSync(JSON_PATH, 'utf8'));

describe('the API table', () => {
  it('is current — regenerating produces the same file', () => {
    const before = readFileSync(JSON_PATH, 'utf8');
    execFileSync('bun', ['scripts/gen-api.ts'], { cwd: ROOT, stdio: 'pipe' });
    const after = readFileSync(JSON_PATH, 'utf8');
    expect(after, 'run `bun scripts/gen-api.ts` and commit the result').toBe(before);
  });

  it('found components — a reader that finds nothing is not a reader', () => {
    expect(api.length).toBeGreaterThan(60);
    const total = api.reduce((n, e) => n + e.props.length, 0);
    expect(total).toBeGreaterThan(400);
  });

  it('reads real props, not empty shells', () => {
    const button = api.find((e) => e.component === 'Button');
    expect(button, 'Button has a props interface').toBeTruthy();
    const names = button!.props.map((p) => p.name);
    expect(names).toContain('size');
    expect(names).toContain('variant');
    expect(names).toContain('disabled');
  });

  it('knows which props are required', () => {
    const slider = api.find((e) => e.component === 'Slider');
    const value = slider?.props.find((p) => p.name === 'value');
    expect(value?.required).toBe(true);
    const size = slider?.props.find((p) => p.name === 'size');
    expect(size?.required).toBe(false);
  });

  it('carries the REASON, where a prop has one', () => {
    // The JSDoc in this repo is where the reason lives, not the description.
    const input = api.find((e) => e.component === 'Input');
    const size = input?.props.find((p) => p.name === 'size');
    expect(size?.doc, 'Input.size explains why it exists').toBeTruthy();
    expect(size!.doc!.length).toBeGreaterThan(40);
  });

  it('every entry points at a file that exists', () => {
    for (const e of api) {
      expect(existsSync(resolve(ROOT, 'src', e.path)), e.path).toBe(true);
    }
  });
});
