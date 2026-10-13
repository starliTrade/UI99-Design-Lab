#!/usr/bin/env bun
/**
 * LIMINAL — the token contract's changelog.
 *
 * The package changelog records what changed in the code. This records what
 * changed in the CONTRACT, which is a different question: a consumer can take a
 * new package version without a single token moving, and can have a token move
 * without touching their code.
 *
 * Run: bun scripts/gen-token-changelog.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOKEN_VERSION, TOKEN_CHANGES, DEPRECATION_WINDOW_MINORS } from '../src/engine/liminal-token-version';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../tokens/CHANGELOG.md');

const byKind = (k: string) => TOKEN_CHANGES.filter((c) => c.kind === k);

const section = (title: string, kind: string, empty: string) => {
  const items = byKind(kind);
  if (!items.length) return `### ${title}\n\n${empty}\n`;
  return `### ${title}\n\n${items
    .map((c) => `- \`${c.token}\` — ${c.what}${c.migration ? `\n  - **چه باید کرد:** ${c.migration}` : ''}${c.removeIn ? `\n  - **حذف در:** ${c.removeIn}` : ''}`)
    .join('\n')}\n`;
};

const md = `# LIMINAL — تغییرات قرارداد توکن

> **نسخه‌ی فعلی: \`${TOKEN_VERSION}\`**
>
> این نسخه از نسخه‌ی کتابخانه **جدا** است، و تفاوتش تشریفاتی نیست.
>
> یک کامپوننت می‌تواند بازنویسی شود **بدون اینکه یک توکن عوض شود** — تغییر نام، prop تازه، رفع باگ.
> و یک توکن می‌تواند عوض شود **بدون اینکه یک خط کد کامپوننت جابه‌جا شود**: یک هگز نردبان یک گام ۸بیتی
> می‌لغزد، و **هر سطح در اپ هر مصرف‌کننده رنگش کمی فرق می‌کند.** دومی در diff **دیده نمی‌شود** و روی
> صفحه **دیده می‌شود**.
>
> پس قرارداد توکن نسخه‌ی خودش را دارد، و هر تغییرش با **کاری که مصرف‌کننده باید بکند** ثبت می‌شود.

## سیاست deprecation

یک توکن حداقل **${DEPRECATION_WINDOW_MINORS} نسخه‌ی minor** deprecate می‌ماند قبل از حذف.
همان قاعده‌ای که نقشه راه برای بسته می‌گذارد، و به همان دلیل: مصرف‌کننده یک انتشار لازم دارد
تا **متوجه شود** و یک انتشار تا **عمل کند**.

## ${TOKEN_VERSION}

${section('افزوده‌شده', 'added', '_چیزی افزوده نشده._')}
${section('تغییر‌یافته', 'changed', '_چیزی تغییر نکرده._')}
${section('deprecate‌شده', 'deprecated', '_چیزی deprecate نشده._')}
${section('حذف‌شده', 'removed', '_چیزی حذف نشده._')}
---

## چرا الان خالی است

قرارداد روی \`${TOKEN_VERSION}\` است و **منتشر نشده**، پس هیچ‌چیز deprecate و هیچ‌چیز حذف نشده.
این فایل وجود دارد تا **اولین تغییر جایی برای رفتن داشته باشد** — و تا مصرف‌کننده‌ای که فایل DTCG را
می‌خواند، **تاریخ قرارداد** را ببیند، نه اینکه از diff استنتاجش کند.

## نحوه‌ی خواندن این فایل

| بخش | یعنی |
|---|---|
| **افزوده‌شده** | توکن تازه. کاری لازم نیست. |
| **تغییر‌یافته** | مقدار عوض شده. مصرف‌کننده باید نگاه کند — ممکن است ظاهرش عوض شده باشد. |
| **deprecate‌شده** | هنوز کار می‌کند. تا نسخه‌ی اعلام‌شده حذف می‌شود. |
| **حذف‌شده** | **این یکی می‌شکند.** |
`;

writeFileSync(OUT, md);
console.log('wrote', OUT);
