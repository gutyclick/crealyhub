# Graph Report - CrealyHub  (2026-08-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 259 nodes · 405 edges · 20 communities (16 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c0faec5b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- env.ts
- compilerOptions
- generation.ts
- schemas.ts
- dependencies
- devDependencies
- image-pipeline.ts
- coming-soon.tsx
- scripts
- image-generator.ts
- create-brief.tsx
- sidebar.tsx
- notifications/provider.ts
- app/layout.tsx
- src/proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `processGenerationJob()` - 16 edges
2. `compilerOptions` - 16 edges
3. `env` - 13 edges
4. `createSupabaseServerClient()` - 10 edges
5. `scripts` - 9 edges
6. `AIProvider` - 8 edges
7. `OpenAIImageProvider` - 7 edges
8. `ComingSoon()` - 7 edges
9. `include` - 7 edges
10. `StorageProvider` - 6 edges

## Surprising Connections (you probably didn't know these)
- `BrandPage()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/(dashboard)/settings/brand/page.tsx → src/lib/supabase/server.ts
- `BrandForm()` --indirect_call--> `saveBrand()`  [INFERRED]
  src/components/brand/brand-form.tsx → src/lib/brand/actions.ts
- `signOut()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/lib/auth/actions.ts → src/lib/supabase/server.ts
- `createContent()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/lib/content/actions.ts → src/lib/supabase/server.ts
- `CreateBrief()` --indirect_call--> `createContent()`  [INFERRED]
  src/components/content/create-brief.tsx → src/lib/content/actions.ts

## Import Cycles
- None detected.

## Communities (20 total, 4 thin omitted)

### Community 0 - "env.ts"
Cohesion: 0.11
Nodes (15): BrandPage(), metadata, BrandForm(), initial, signIn(), signOut(), BrandActionState, saveBrand() (+7 more)

### Community 1 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 2 - "generation.ts"
Cohesion: 0.15
Nodes (20): authorized(), POST(), planCarousel(), planContent(), writeCopy(), buildVisualPrompt(), buildBrandContext(), getRecentContentContext() (+12 more)

### Community 3 - "schemas.ts"
Cohesion: 0.16
Nodes (16): OpenAIProvider, CarouselPlan, carouselPlanSchema, carouselSlideSchema, ContentIdea, contentIdeaSchema, contentPlanSchema, CopyPackage (+8 more)

### Community 4 - "dependencies"
Cohesion: 0.09
Nodes (23): clsx, lucide-react, next, openai, dependencies, clsx, lucide-react, next (+15 more)

### Community 5 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, supabase, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 6 - "image-pipeline.ts"
Cohesion: 0.16
Nodes (5): ImageFormat, dimensions, StorageProvider, StoredObject, SupabaseStorageProvider

### Community 8 - "scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, build, db:reset, db:start, db:stop, dev (+4 more)

### Community 9 - "image-generator.ts"
Cohesion: 0.27
Nodes (6): GeneratedImage, ImageProvider, OpenAIImageProvider, renderPrompt(), sizes, VisualPrompt

### Community 10 - "create-brief.tsx"
Cohesion: 0.29
Nodes (7): CreateBrief(), formats, initial, createContent(), createContentSchema, CreateContentState, enqueueGeneration()

### Community 11 - "sidebar.tsx"
Cohesion: 0.31
Nodes (5): NavItem(), primary, settings, Sidebar(), cn()

### Community 12 - "notifications/provider.ts"
Cohesion: 0.40
Nodes (3): NoopNotificationProvider, NotificationEvent, NotificationProvider

### Community 13 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): dmSans, metadata, newsreader

### Community 14 - "src/proxy.ts"
Cohesion: 0.60
Nodes (3): refreshSession(), config, proxy()

## Knowledge Gaps
- **83 isolated node(s):** `BrandFormValues`, `NotificationEvent`, `LogLevel`, `Job`, `CarouselPlan` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `env` connect `schemas.ts` to `env.ts`, `image-generator.ts`, `generation.ts`, `image-pipeline.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `BrandFormValues`, `NotificationEvent`, `LogLevel` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `env.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10685483870967742 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._