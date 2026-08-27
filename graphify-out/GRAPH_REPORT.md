# Graph Report - CrealyHub  (2026-08-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 338 nodes · 602 edges · 19 communities (15 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `46dda992`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- generation.ts
- publishing.ts
- createSupabaseServerClient
- devDependencies
- editorial/actions.ts
- compilerOptions
- image-generator.ts
- dependencies
- create-brief.tsx
- brand-form.tsx
- sidebar.tsx
- coming-soon.tsx
- app/layout.tsx
- src/proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `createSupabaseServerClient()` - 23 edges
2. `env` - 18 edges
3. `processGenerationJob()` - 16 edges
4. `compilerOptions` - 16 edges
5. `InstagramClient` - 11 edges
6. `processPublishingJob()` - 10 edges
7. `scripts` - 9 edges
8. `AIProvider` - 8 edges
9. `log()` - 8 edges
10. `OpenAIImageProvider` - 7 edges

## Surprising Connections (you probably didn't know these)
- `BrandPage()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/(dashboard)/settings/brand/page.tsx → src/lib/supabase/server.ts
- `POST()` --calls--> `processGenerationJob()`  [EXTRACTED]
  src/app/api/jobs/generation/route.ts → src/lib/jobs/generation.ts
- `processGenerationJob()` --calls--> `log()`  [EXTRACTED]
  src/lib/jobs/generation.ts → src/lib/observability/logger.ts
- `processPublishingJob()` --calls--> `decryptToken()`  [EXTRACTED]
  src/lib/jobs/publishing.ts → src/lib/instagram/crypto.ts
- `signOut()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/lib/auth/actions.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (19 total, 4 thin omitted)

### Community 0 - "generation.ts"
Cohesion: 0.11
Nodes (30): planCarousel(), OpenAIProvider, planContent(), writeCopy(), CarouselPlan, carouselPlanSchema, carouselSlideSchema, ContentIdea (+22 more)

### Community 1 - "publishing.ts"
Cohesion: 0.09
Nodes (24): authorized(), POST(), authorized(), GET, maxDuration, POST, run(), supabaseSecretKey (+16 more)

### Community 2 - "createSupabaseServerClient"
Cohesion: 0.11
Nodes (23): GET(), GET(), dynamic, Page(), metadata, Connection, InstagramConnectionPanel(), signIn() (+15 more)

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

### Community 8 - "create-brief.tsx"
Cohesion: 0.17
Nodes (8): CreateBrief(), formats, initial, createContent(), createContentSchema, CreateContentState, hasSupabaseEnv, enqueueGeneration()

### Community 9 - "brand-form.tsx"
Cohesion: 0.18
Nodes (9): BrandPage(), BrandForm(), initial, BrandActionState, saveBrand(), splitLines(), BrandRecord, brandFormSchema (+1 more)

### Community 10 - "sidebar.tsx"
Cohesion: 0.31
Nodes (5): NavItem(), primary, settings, Sidebar(), cn()

### Community 12 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): dmSans, metadata, newsreader

### Community 13 - "src/proxy.ts"
Cohesion: 0.60
Nodes (3): refreshSession(), config, proxy()

## Knowledge Gaps
- **96 isolated node(s):** `CarouselPlan`, `ContentIdea`, `CopyPackage`, `AIResult`, `AIUsage` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `env` connect `generation.ts` to `publishing.ts`, `createSupabaseServerClient`, `image-generator.ts`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `createSupabaseServerClient()` connect `createSupabaseServerClient` to `create-brief.tsx`, `brand-form.tsx`, `editorial/actions.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `InstagramClient` connect `publishing.ts` to `createSupabaseServerClient`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `CarouselPlan`, `ContentIdea`, `CopyPackage` to the rest of the system?**
  _96 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `generation.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1072463768115942 - nodes in this community are weakly interconnected._
- **Should `publishing.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08974358974358974 - nodes in this community are weakly interconnected._
- **Should `createSupabaseServerClient` be split into smaller, more focused modules?**
  _Cohesion score 0.10953058321479374 - nodes in this community are weakly interconnected._