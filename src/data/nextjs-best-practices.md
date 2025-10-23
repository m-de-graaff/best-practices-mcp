# Next.js Best Practices (2025)

Type-safe, fast, accessible, and maintainable — with Biome, not ESLint.

## 0) Baseline

Framework: Next.js (App Router)
Language: TypeScript (strict)
Lint/Format: Biome
Styling: Tailwind CSS (or CSS Modules)
Data layer: fetch/Server Actions for server state; TanStack Query only for rich client state needs
Testing: Vitest (unit) + Playwright (e2e)
CI: type-check, lint, build, test; block merges on failures

## 1) Project Structure
```bash
/app
  /(marketing)          # parallel route groups by concern
    layout.tsx
    page.tsx
  /(dashboard)
    layout.tsx
    page.tsx
    users/
      page.tsx
      [id]/
        page.tsx
  api/                  # route handlers (API)
    users/route.ts
  actions/              # server actions (isolated)
    users.ts
  components/
    ui/                 # leaf UI components (mostly client)
    server/             # server-only components (db/fetch/render)
  lib/
    db.ts               # DB client
    auth.ts             # auth helpers
    fetcher.ts          # common fetch helpers
    zod-schemas.ts      # validation schemas
    analytics.ts
  styles/
  types/
  hooks/
  public/
  scripts/              # one-off scripts/migrations
```

Rules of thumb
- Server by default. Only mark components use client when you need browser APIs, interactivity, or local state that can’t be server-driven.
- Co-locate files by feature, not type, within route groups.
- Keep Route Handlers under app/api/**/route.ts. Prefer them over legacy pages/api.

## 2) TypeScript: strict & ergonomic
`tsconfig.json` (starter)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": false,
    "checkJs": false,
    "jsx": "preserve",
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "noErrorTruncation": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Guidelines
- Prefer type aliases + zod for external input validation.
- Never any. Use unknown + narrow.
- Export Props/Result types next to implementations.
- Create types/env.d.ts to annotate allowed process.env.*.

## 3) Biome (formatter + linter + a11y)
`biome.json`
```json
{
  "$schema": "https://biomejs.dev/schemas/latest/schema.json",
  "root": true,
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "a11y": {
        "noAutofocus": "error",
        "noNoninteractiveTabindex": "error",
        "noRedundantAlt": "error",
        "useButtonType": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUndeclaredVariables": "error"
      },
      "style": {
        "useFilenamingConvention": "warn",
        "useImportExtensions": "off"
      },
      "suspicious": {
        "noArrayIndexKey": "warn",
        "noUnsafeOptionalChaining": "error"
      }
    }
  },
  "vcs": { "enabled": true }
}
```

Package scripts
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "fmt": "biome format --write .",
    "lint": "biome lint .",
    "check": "pnpm typecheck && pnpm lint",
    "precommit": "pnpm fmt && pnpm lint"
  }
}
```

> If you used ESLint before: delete it. Biome covers formatting, linting, and basic a11y rules with great perf.

## 4) Rendering & Data Fetching

Golden rule: Server first. Fetch data on the server (RSC), stream what’s heavy, move interactivity into small client islands.

When to use what

- RSC (Server Components): reading data, templating pages, SEO-critical content.
- Server Actions: mutations/form posts, secrets, DB work — without API roundtrips.
- Route Handlers (app/api/.../route.ts): external consumers, webhooks, or when you need a stable HTTP API.
- Client Components (use client): interactive widgets, local ephemeral state, websockets.

Cache & revalidate
```ts
// app/products/page.tsx (RSC)
import { Suspense } from "react";

async function getProducts() {
  const res = await fetch(`${process.env.API_URL}/products`, {
    // Cache for 10 min, revalidate in background
    next: { revalidate: 600 }
  });
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<Product[]>;
}

export default async function Page() {
  const data = getProducts();
  return (
    <Suspense fallback={<div className="skeleton" />}>
      {/* Streaming + suspense-friendly */}
      <ProductsList products={await data} />
    </Suspense>
  );
}
```

Force dynamic (no cache)
```ts
// Route Handler: no caching for personalized data
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

Static generation w/ ISR
```ts
export const revalidate = 3600; // page-level ISR
```

Server Actions: canonical pattern
```ts
// app/actions/users.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(1)
});

export async function createUser(formData: FormData) {
  const parsed = CreateUser.safeParse({
    email: formData.get("email"),
    name: formData.get("name")
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  await db.user.create({ data: parsed.data });
  revalidatePath("/users");
  return { ok: true };
}
```

```ts
// app/users/new/page.tsx
import { createUser } from "@/app/actions/users";

export default function NewUser() {
  return (
    <form action={createUser} className="grid gap-3 max-w-sm">
      <input name="email" type="email" required className="input" />
      <input name="name" required className="input" />
      <button type="submit" className="btn">Create</button>
    </form>
  );
}
```

Route Handler example (API)
```ts
// app/api/users/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  // validate with zod...
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

## 5) State Management: minimal & intentional

- Colocate state with the component that uses it.
- Distinguish server state (fetched) from client state (UI, ephemeral).
- Start with React: useState, useReducer, useContext.
- Add a light store only when needed:
  - Zustand/Jotai for local, portable client state.
  - TanStack Query when you genuinely need client-side caching/invalidation (e.g., offline UX, optimistic updates). Avoid duplicating the same data in server and client caches.

## 6) Performance Playbook

- Images: use next/image with fill or explicit sizes; lazy-load below the fold; provide alt.
- Fonts: use next/font (self-hosted). Avoid runtime FOUT by preloading critical fonts.
- Code splitting: next/dynamic for heavy client components.
- Streaming + Suspense: wrap slow server reads.
- fetch hints: use next: { revalidate } for ISR and cache: "no-store" for per-request data.
- Reduce “use client” surface area: smaller client islands = smaller bundles.
- Avoid client fetching for SSR/SEO content.
- Measure, then optimize: CWV (LCP, INP, CLS), React Profiler, next/script with strategy.

## 7) Accessibility (baked in)

- Semantic HTML: use real <button>, <nav>, <main>, <h1..h6>.
- Always label controls: aria-label or visible <label> + htmlFor.
- Keyboard behavior: focus rings, logical tab order, no keyboard traps.
- Color contrast: aim for WCAG AA minimum.
- Biome a11y rules enabled (see config above).
- Test with keyboard + screen reader; run Playwright a11y scans on CI.

## 8) Error Handling & Observability

- Wrap RSC boundaries with error UI:
```tsx
// app/users/error.tsx
"use client";
export default function Error({ error }: { error: Error }) {
  return <p>Something went wrong: {error.message}</p>;
}
```

- Use Route Handler try/catch with structured error JSON.
- Centralize logging (server) and capture client errors with a small boundary + console.error or a telemetry SDK you trust.
- Add request IDs and propagate to logs for correlation.

## 9) Security & Config

- Env vars: server secrets never exposed; browser-visible vars must start with NEXT_PUBLIC_.
- Headers (via middleware or platform config):
  - Content-Security-Policy (adapt to your assets)
  - Strict-Transport-Security
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy minimal
- CSRF: Server Actions avoid many CSRF pitfalls (non-GET + framework protections), but if you expose JSON APIs, include CSRF or same-site cookie strategy.
- Auth: do on server; never trust client claims. Sanitize/validate all inputs with zod.

## 10) next.config essentials
```ts
// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.example.com" }
    ]
  },
  experimental: {
    // enable if your project benefits — keep surface minimal
    // ppr: true, // partial prerendering (if available in your version)
  }
};

export default config;
```

> Keep the experimental surface tiny; only opt-in when you truly need it.

## 11) Forms: prefer server actions

- Use plain <form action={serverAction}>.
- Validate with zod on the server; return structured errors to re-render with issues.
- For client-side UX (e.g., instant validation), use react-hook-form + @hookform/resolvers/zod, but still validate on the server.

## 12) SEO & Metadata

- Use the App Router Metadata API per route.
- Provide canonical URLs, open graph images, structured data where relevant.
- Avoid client-only rendering for SEO-relevant content.

## 13) Testing Strategy

- Unit (Vitest): pure functions, small components.
- Component (Vitest + Testing Library): client components with interactions.
- E2E (Playwright): critical flows, auth, forms, a11y scans.
- Server Actions: test by invoking the function directly (mock DB).
- Run tests and typechecks on CI; require them for merge.

## 14) DX Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "biome lint .",
    "fmt": "biome format --write .",
    "test": "vitest run",
    "test:ui": "vitest",
    "e2e": "playwright test",
    "check": "pnpm typecheck && pnpm lint && pnpm test"
  }
}
```

## 15) Practical Patterns (copyable)
Suspense streaming section

```tsx
// app/(dashboard)/page.tsx
import { Suspense } from "react";
import FastPanel from "@/components/server/fast-panel";
import SlowPanel from "@/components/server/slow-panel";

export default function Dashboard() {
  return (
    <>
      <FastPanel />
      <Suspense fallback={<div className="skeleton h-32" />}>
        {/* Streams when data is ready */}
        <SlowPanel />
      </Suspense>
    </>
  );
}
```

Client island (small, isolated)
```tsx
// components/ui/theme-toggle.tsx
"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(prev => (prev === "light" ? "dark" : "light"))}
      className="btn-ghost"
    >
      {theme === "light" ? "🌞" : "🌙"}
    </button>
  );
}
```

TanStack Query only where needed
```tsx
// components/client/live-notifications.tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export function LiveNotifications() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      return (await res.json()) as { id: string; text: string }[];
    },
    refetchInterval: 10_000
  });
  return <ul>{data?.map(n => <li key={n.id}>{n.text}</li>)}</ul>;
}
```

## 16) Don’ts (easy wins)

Don’t sprinkle use client on route layouts/pages unless necessary.
Don’t duplicate server-fetched data into client caches “just because”.
Don’t disable Biome rules en masse — tune them thoughtfully.
Don’t push large images/raw assets to the repo — use a bucket/CDN.
Don’t ship unvalidated input to your DB or external APIs.

## 17) Migration/Adoption tips

Convert leaf components to RSC first (read-only pieces).
Move form posts to Server Actions incrementally.
Replace pages/api with Route Handlers where external callers need APIs.
Turn on ISR for obviously static lists; measure impact (CWV) before broader rollout.

##18) Starter .env.example
```ini
# Server-only
DATABASE_URL="postgres://..."
API_URL="https://api.example.com"

# Browser-visible
NEXT_PUBLIC_APP_NAME="My App"
NEXT_PUBLIC_ANALYTICS_ID="..."
```

19) Quick checklists

### Performance

next/image everywhere (with sizes)
Fonts via next/font
Streaming slow parts with <Suspense>
Minimal client islands
Cache & revalidate tuned

### Accessibility

Labels, roles, keyboard paths
Color contrast AA
Biome a11y rules clean
Run screen reader + keyboard pass

### Reliability

Server Actions validate w/ zod
Error boundaries for routes
Playwright happy path & auth flows

### Security

No secrets in client bundle
Sensible security headers
Input sanitized, output encoded