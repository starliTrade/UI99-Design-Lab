#!/usr/bin/env node
/**
 * LIMINAL — Component Scaffolder
 * bun scaffold Button control    → src/components/atoms/Button/
 * bun scaffold Card panel        → src/components/containers/Card/
 * bun scaffold Table panel       → src/components/data/Table/
 *
 * هر کامپوننت از چرخه: ایده → تست چشمی → سیاست → قانون → موتور → کامپوننت → تست → ممیزی → ثبت
 * این اسکریپت قدم «کامپوننت» را می‌سازد — بقیه را انسان انجام می‌دهد.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const ROLE_GROUP = {
  canvas: 'layout', chrome: 'layout', work: 'layout',
  panel: 'containers', control: 'atoms', well: 'inputs',
  menu: 'containers', popover: 'containers', modal: 'containers', toast: 'feedback',
};

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(`
LIMINAL Scaffolder — کامپوننت را از موتور بساز

  bun scaffold <Name> <role> [group]

  مثال:
    bun scaffold Button control        → atoms/Button (role: control)
    bun scaffold Card panel            → containers/Card (role: panel)
    bun scaffold Table panel data      → data/Table (role: panel)
    bun scaffold Chart panel data      → data/Chart (role: panel)

  نقش‌ها: canvas, chrome, work, panel, control, well, menu, popover, modal, toast
  گروه‌ها: atoms, inputs, containers, data, nav, feedback, layout, composites
`);
  process.exit(0);
}

const [name, role, groupOverride] = args;
const group = groupOverride || ROLE_GROUP[role] || 'atoms';

if (!ROLE_GROUP[role] && !groupOverride) {
  console.error(`نقش ناشناخته: ${role} — باید یکی از ${Object.keys(ROLE_GROUP).join(', ')} باشد`);
  process.exit(1);
}

const dir = join(ROOT, `src/components/${group}/${name}`);
if (existsSync(dir)) {
  console.error(`وجود دارد: ${dir}`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });

// ۱. Component.tsx — از قالب
const template = readFileSync(join(ROOT, 'src/components/_template/Component.tsx'), 'utf8');
const componentCode = template
  .replaceAll('Template', name)
  .replaceAll('template', name.toLowerCase())
  .replaceAll("TemplateRole = 'control'", `TemplateRole = '${role}'`)
  .replaceAll("role = 'control'", `role = '${role}'`);

writeFileSync(join(dir, `${name}.tsx`), componentCode);

// ۲. index.ts
writeFileSync(join(dir, 'index.ts'), `export { ${name} } from './${name}';\nexport type { ${name}Props } from './${name}';\n`);

// ۳. test — ۱۰ شرط قرارداد
writeFileSync(join(dir, `${name}.test.tsx`), `import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ${name} } from './${name}';

// هر کامپوننت ۱۰ شرط قرارداد را پاس می‌کند
describe('${name} — قرارداد', () => {
  it('رندر می‌شود', () => {
    const { container } = render(<${name} />);
    expect(container.firstChild).toBeTruthy();
  });
  it('نقش ${role} دارد', () => {
    const { container } = render(<${name} />);
    expect(container.firstChild).toHaveAttribute('data-role', '${role}');
  });
  // TODO: ۸ شرط دیگر — a11y, contrast, placement, visual
});
`);

// ۴. fixtures.tsx — یک سطر اضافه کن
const fixturesPath = join(ROOT, 'src/components/__matrix__/fixtures.tsx');
let fixtures = readFileSync(fixturesPath, 'utf8');
const line = `  { name: '${name}', group: '${group[0].toUpperCase() + group.slice(1)}', role: '${role}', sizes: ['sm','md','lg'], states: ['idle','hover','focus','active','disabled'], variants: ['primary'] },`;
fixtures = fixtures.replace('// فاز ۲ — اتم‌ها (۸)', `// فاز ۲ — اتم‌ها (۸)\n${line}`);
writeFileSync(fixturesPath, fixtures);

console.log(`✓ ${name} ساخته شد — نقش ${role} — گروه ${group}`);
console.log(`  ${dir}/`);
console.log(`  fixtures.tsx ← یک سطر اضافه شد`);
console.log(`\n  بعدی: تست چشمی → سیاست → قانون → موتور → تست → ممیزی → ثبت`);
