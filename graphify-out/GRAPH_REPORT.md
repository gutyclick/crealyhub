# Graph Report - CrealyHub  (2026-08-27)

## Corpus Check
- 84 files · ~9,877 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 371 nodes · 668 edges · 23 communities (17 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `77d4e209`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- generation.ts
- publishing.ts
- instagram/actions.ts
- devDependencies
- editorial/actions.ts
- compilerOptions
- image-generator.ts
- dependencies
- buffer.ts
- createSupabaseServerClient
- sidebar.tsx
- analytics/page.tsx
- app/layout.tsx
- src/proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- CrealyHub
- vercel.json
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `createSupabaseServerClient()` - 27 edges
2. `env` - 21 edges
3. `processGenerationJob()` - 16 edges
4. `compilerOptions` - 16 edges
5. `InstagramClient` - 11 edges
6. `processPublishingJob()` - 10 edges
7. `scripts` - 9 edges
8. `createSupabaseAdminClient()` - 9 edges
9. `AIProvider` - 8 edges
10. `fillContentBuffer()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Page()` --calls--> `getApprovalQueue()`  [EXTRACTED]
  src/app/(dashboard)/approvals/page.tsx → src/lib/editorial/data.ts
- `Page()` --calls--> `getCalendarPosts()`  [EXTRACTED]
  src/app/(dashboard)/calendar/page.tsx → src/lib/editorial/data.ts
- `BrandPage()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/(dashboard)/settings/brand/page.tsx → src/lib/supabase/server.ts
- `GET()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/api/instagram/callback/route.ts → src/lib/supabase/server.ts
- `GET()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/api/instagram/connect/route.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (23 total, 6 thin omitted)

### Community 0 - "generation.ts"
Cohesion: 0.09
Nodes (36): authorized(), GET, POST, run(), planCarousel(), OpenAIProvider, planContent(), writeCopy() (+28 more)

### Community 1 - "publishing.ts"
Cohesion: 0.14
Nodes (16): authorized(), GET, maxDuration, POST, run(), ApiError, InstagramClient, waitForContainer() (+8 more)

### Community 2 - "instagram/actions.ts"
Cohesion: 0.16
Nodes (15): GET(), GET(), Connection, InstagramConnectionPanel(), account(), disconnectInstagram(), testInstagram(), authorizationUrl() (+7 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (31): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, supabase, tailwindcss, @tailwindcss/postcss (+23 more)

### Community 4 - "editorial/actions.ts"
Cohesion: 0.14
Nodes (23): dynamic, Page(), dynamic, Page(), ApprovalCard(), CalendarBoard(), drop(), approvePost() (+15 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "image-generator.ts"
Cohesion: 0.11
Nodes (11): GeneratedImage, ImageFormat, ImageProvider, OpenAIImageProvider, renderPrompt(), sizes, VisualPrompt, dimensions (+3 more)

### Community 7 - "dependencies"
Cohesion: 0.09
Nodes (23): clsx, lucide-react, next, openai, dependencies, clsx, lucide-react, next (+15 more)

### Community 8 - "buffer.ts"
Cohesion: 0.10
Nodes (22): authorized(), GET, maxDuration, POST, run(), BatchGenerator(), CreateBrief(), formats (+14 more)

### Community 9 - "createSupabaseServerClient"
Cohesion: 0.09
Nodes (21): BrandPage(), dynamic, Page(), Page(), pct(), metadata, BrandForm(), initial (+13 more)

### Community 10 - "sidebar.tsx"
Cohesion: 0.31
Nodes (5): NavItem(), primary, settings, Sidebar(), cn()

### Community 12 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): dmSans, metadata, newsreader

### Community 13 - "src/proxy.ts"
Cohesion: 0.60
Nodes (3): refreshSession(), config, proxy()

### Community 19 - "CrealyHub"
Cohesion: 0.29
Nodes (6): Base de datos local, Content Engine, CrealyHub, Desarrollo, Seguridad, Verificación

## Knowledge Gaps
- **111 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `env` connect `generation.ts` to `publishing.ts`, `instagram/actions.ts`, `image-generator.ts`, `buffer.ts`, `createSupabaseServerClient`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `createSupabaseServerClient()` connect `createSupabaseServerClient` to `buffer.ts`, `instagram/actions.ts`, `editorial/actions.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `InstagramClient` connect `publishing.ts` to `instagram/actions.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `generation.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09014675052410902 - nodes in this community are weakly interconnected._
- **Should `publishing.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13675213675213677 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._