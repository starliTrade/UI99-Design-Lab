#!/usr/bin/env bash
#
# LIMINAL — does a real Next.js app use this library?
#
# The roadmap's definition of done for the package phase: "a blank Next.js
# project with `npm i` renders a LIMINAL button". This is that, as a script,
# because "it server-renders in vitest" and "it works in Next.js" are different
# claims and only one of them is the one a consumer cares about.
#
# It installs from a TARBALL, not from the source directory. `npm pack` applies
# the `files` list, so the tarball is exactly what npm would publish — a
# symlink to the repo would test a package nobody will ever install.
#
#   bash scripts/verify-next-smoke.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${TMPDIR:-/tmp}/liminal-next-smoke"
mkdir -p "$WORK"

echo "── building the library ─────────────────────────────────────────────"
(cd "$ROOT" && bun run build:lib >/dev/null)
TARBALL="$(cd "$ROOT" && npm pack --pack-destination "$WORK" 2>/dev/null | tail -1)"
echo "packed $TARBALL"

echo "── scaffolding a Next.js app ────────────────────────────────────────"
rm -rf "$WORK/app" "$WORK/node_modules" "$WORK/package.json" "$WORK/tsconfig.json" "$WORK/next.config.mjs" "$WORK/.next"
mkdir -p "$WORK/app"

cat > "$WORK/package.json" <<JSON
{
  "name": "liminal-next-smoke",
  "private": true,
  "scripts": { "build": "next build" },
  "dependencies": { "liminal": "file:$WORK/$TARBALL", "next": "15.5.4", "react": "19.3.0", "react-dom": "19.3.0" },
  "devDependencies": { "typescript": "5.9.3", "@types/react": "19.3.0", "@types/node": "22.10.2" }
}
JSON

cat > "$WORK/app/layout.tsx" <<'TSX'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
TSX

# NO "use client" IN THIS FILE, ON PURPOSE.
#
# It is a Server Component importing a library whose entry carries the
# directive. If the directive did not survive the build, the hooks inside
# Button would run on the server and React would refuse — here.
cat > "$WORK/app/page.tsx" <<'TSX'
import { Button, Card, Input } from 'liminal';
import 'liminal/styles.css';

export default function Page() {
  return (
    <main>
      <h1>LIMINAL in Next.js</h1>
      <Card>
        <Input label="Name" />
        <Button>Save</Button>
      </Card>
    </main>
  );
}
TSX

cat > "$WORK/next.config.mjs" <<'JS'
export default { reactStrictMode: true };
JS

cat > "$WORK/tsconfig.json" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["dom", "dom.iterable", "esnext"], "jsx": "preserve",
    "module": "esnext", "moduleResolution": "bundler", "strict": true, "noEmit": true,
    "esModuleInterop": true, "skipLibCheck": true, "allowJs": true, "incremental": true,
    "resolveJsonModule": true, "isolatedModules": true, "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"], "exclude": ["node_modules"]
}
JSON

echo "── installing from the tarball ──────────────────────────────────────"
(cd "$WORK" && npm install --no-audit --no-fund >/dev/null 2>&1)

echo "── next build ───────────────────────────────────────────────────────"
(cd "$WORK" && npx next build 2>&1 | tail -12)

echo "── and the server-rendered HTML ─────────────────────────────────────"
HTML="$WORK/.next/server/app/index.html"
for needle in 'liminal-button' '>Save<' 'LIMINAL in Next.js'; do
  if grep -q "$needle" "$HTML"; then
    echo "  ✓ $needle"
  else
    echo "  ✗ $needle  — the library did not render"
    exit 1
  fi
done

echo
echo "a blank Next.js app renders LIMINAL components."
