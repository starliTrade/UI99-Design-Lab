# Security Policy

## Supported versions

LIMINAL is pre-1.0. Security fixes land on the latest published minor version.

| Version | Supported |
| --- | --- |
| 0.x (latest) | ✅ |
| older 0.x | ❌ |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report privately through GitHub's
[Security Advisories](https://github.com/starliTrade/UI99-Design-Lab/security/advisories/new)
for this repository. If you cannot use that channel, open a minimal public issue
asking for a private contact route — without details of the vulnerability.

Please include:

- a description of the issue and its impact,
- steps to reproduce, or a proof of concept,
- affected versions and environment (browser, React version, bundler),
- any suggested fix.

## What to expect

- **Acknowledgement** within 3 working days.
- **Assessment** within 10 working days, including whether we consider it in scope.
- **Fix and disclosure** coordinated with you; we credit reporters unless you ask
  us not to.

## Scope

LIMINAL is a client-side UI library. The most relevant classes of issue are:

- cross-site scripting through component props that render HTML,
- unsafe handling of user-supplied URLs (`href`, `src`) in components,
- supply-chain risk in the published package.

Out of scope: vulnerabilities in the demo application's fictional data, and issues
that require an already-compromised build environment.

## Our practices

- Dependencies are kept minimal on purpose; every runtime dependency is a
  deliberate decision.
- The published package ships with npm provenance so the build is verifiable.
- We do not collect telemetry and do not execute network requests at import time.
