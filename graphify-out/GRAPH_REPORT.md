# Graph Report - CrealyHub  (2026-08-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 242 nodes · 324 edges · 20 communities (15 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f3362bf6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- brand-form.tsx
- dependencies
- devDependencies
- compilerOptions
- coming-soon.tsx
- scripts
- include
- sidebar.tsx
- client.ts
- notifications/provider.ts
- StorageProvider
- app/layout.tsx
- src/proxy.ts
- logger.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `scripts` - 9 edges
3. `Ee()` - 8 edges
4. `Et()` - 8 edges
5. `createSupabaseServerClient()` - 8 edges
6. `ComingSoon()` - 8 edges
7. `getKey()` - 7 edges
8. `include` - 7 edges
9. `reload()` - 6 edges
10. `z()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `BrandPage()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/(dashboard)/settings/brand/page.tsx → src/lib/supabase/server.ts
- `BrandForm()` --indirect_call--> `saveBrand()`  [INFERRED]
  src/components/brand/brand-form.tsx → src/lib/brand/actions.ts
- `signOut()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/lib/auth/actions.ts → src/lib/supabase/server.ts
- `OpenAIProvider` --implements--> `AIProvider`  [EXTRACTED]
  src/lib/ai/client.ts → src/lib/ai/types.ts
- `signIn()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/lib/auth/actions.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (20 total, 5 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.07
Nodes (50): at(), be(), bt(), C(), constructor(), coolingDown(), ct(), D() (+42 more)

### Community 1 - "brand-form.tsx"
Cohesion: 0.10
Nodes (17): BrandPage(), metadata, BrandForm(), initial, signIn(), signOut(), BrandActionState, saveBrand() (+9 more)

### Community 2 - "dependencies"
Cohesion: 0.10
Nodes (21): clsx, lucide-react, next, openai, dependencies, clsx, lucide-react, next (+13 more)

### Community 3 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, supabase, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 6 - "scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, build, db:reset, db:start, db:stop, dev (+4 more)

### Community 7 - "include"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 8 - "sidebar.tsx"
Cohesion: 0.31
Nodes (5): NavItem(), primary, settings, Sidebar(), cn()

### Community 9 - "client.ts"
Cohesion: 0.39
Nodes (3): OpenAIProvider, AIProvider, StructuredRequest

### Community 10 - "notifications/provider.ts"
Cohesion: 0.40
Nodes (3): NoopNotificationProvider, NotificationEvent, NotificationProvider

### Community 12 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): dmSans, metadata, newsreader

### Community 13 - "src/proxy.ts"
Cohesion: 0.60
Nodes (3): refreshSession(), config, proxy()

### Community 14 - "logger.ts"
Cohesion: 0.67
Nodes (3): log(), LogLevel, redact()

## Knowledge Gaps
- **71 isolated node(s):** `BrandContext`, `BrandFormValues`, `NotificationEvent`, `StoredObject`, `LogLevel` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `BrandContext`, `BrandFormValues`, `NotificationEvent` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06954887218045112 - nodes in this community are weakly interconnected._
- **Should `brand-form.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10160427807486631 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._