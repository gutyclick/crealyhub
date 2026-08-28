# Graph Report - CrealyHub  (2026-08-27)

## Corpus Check
- 94 files · ~11,619 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 425 nodes · 785 edges · 25 communities (19 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4f3888e6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- env.ts
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
- app/layout.tsx
- src/proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- CrealyHub
- vercel.json
- AGENTS.md
- brand-form.tsx
- error.tsx

## God Nodes (most connected - your core abstractions)
1. `createSupabaseServerClient()` - 36 edges
2. `env` - 23 edges
3. `processGenerationJob()` - 16 edges
4. `compilerOptions` - 16 edges
5. `InstagramClient` - 14 edges
6. `createSupabaseAdminClient()` - 11 edges
7. `processPublishingJob()` - 10 edges
8. `log()` - 10 edges
9. `scripts` - 9 edges
10. `AIProvider` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Page()` --calls--> `getApprovalQueue()`  [EXTRACTED]
  src/app/(dashboard)/approvals/page.tsx → src/lib/editorial/data.ts
- `Page()` --calls--> `getCalendarPosts()`  [EXTRACTED]
  src/app/(dashboard)/calendar/page.tsx → src/lib/editorial/data.ts
- `Page()` --calls--> `getLibraryData()`  [EXTRACTED]
  src/app/(dashboard)/library/page.tsx → src/lib/dashboard/data.ts
- `OverviewPage()` --calls--> `getOverviewData()`  [EXTRACTED]
  src/app/(dashboard)/overview/page.tsx → src/lib/dashboard/data.ts
- `GET()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/api/instagram/callback/route.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (25 total, 6 thin omitted)

### Community 0 - "env.ts"
Cohesion: 0.09
Nodes (36): authorized(), GET, POST, run(), planCarousel(), OpenAIProvider, planContent(), writeCopy() (+28 more)

### Community 1 - "publishing.ts"
Cohesion: 0.11
Nodes (21): authorized(), GET, maxDuration, POST, run(), ApiError, InstagramClient, waitForContainer() (+13 more)

### Community 2 - "instagram/actions.ts"
Cohesion: 0.13
Nodes (18): GET(), GET(), dynamic, Page(), Connection, InstagramConnectionPanel(), account(), disconnectInstagram() (+10 more)

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
Cohesion: 0.08
Nodes (28): authorized(), GET, maxDuration, POST, run(), authorized(), GET, maxDuration (+20 more)

### Community 9 - "createSupabaseServerClient"
Cohesion: 0.06
Nodes (37): number, Page(), percent(), Page(), OverviewPage(), BrandPage(), Page(), pct() (+29 more)

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

### Community 23 - "brand-form.tsx"
Cohesion: 0.22
Nodes (7): BrandForm(), initial, BrandActionState, saveBrand(), splitLines(), brandFormSchema, BrandFormValues

## Knowledge Gaps
- **126 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createSupabaseServerClient()` connect `createSupabaseServerClient` to `buffer.ts`, `instagram/actions.ts`, `editorial/actions.ts`, `brand-form.tsx`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `env` connect `env.ts` to `publishing.ts`, `instagram/actions.ts`, `image-generator.ts`, `buffer.ts`, `createSupabaseServerClient`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `InstagramClient` connect `publishing.ts` to `instagram/actions.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `env.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09143686502177069 - nodes in this community are weakly interconnected._
- **Should `publishing.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1092436974789916 - nodes in this community are weakly interconnected._
- **Should `instagram/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13054187192118227 - nodes in this community are weakly interconnected._