# Graph Report - CrealyHub  (2026-08-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 286 nodes · 470 edges · 21 communities (17 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5fe9f432`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- createSupabaseServerClient
- env.ts
- compilerOptions
- generation.ts
- dependencies
- devDependencies
- image-generator.ts
- create-brief.tsx
- scripts
- brand-form.tsx
- supabase-provider.ts
- coming-soon.tsx
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
3. `createSupabaseServerClient()` - 15 edges
4. `env` - 13 edges
5. `scripts` - 9 edges
6. `AIProvider` - 8 edges
7. `OpenAIImageProvider` - 7 edges
8. `context()` - 7 edges
9. `moveSchedule()` - 7 edges
10. `include` - 7 edges

## Surprising Connections (you probably didn't know these)
- `BrandPage()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/(dashboard)/settings/brand/page.tsx → src/lib/supabase/server.ts
- `signOut()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/lib/auth/actions.ts → src/lib/supabase/server.ts
- `saveBrand()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/lib/brand/actions.ts → src/lib/supabase/server.ts
- `createContent()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/lib/content/actions.ts → src/lib/supabase/server.ts
- `Page()` --calls--> `getApprovalQueue()`  [EXTRACTED]
  src/app/(dashboard)/approvals/page.tsx → src/lib/editorial/data.ts

## Import Cycles
- None detected.

## Communities (21 total, 4 thin omitted)

### Community 0 - "createSupabaseServerClient"
Cohesion: 0.11
Nodes (27): dynamic, Page(), dynamic, Page(), metadata, ApprovalCard(), CalendarBoard(), drop() (+19 more)

### Community 1 - "env.ts"
Cohesion: 0.11
Nodes (19): BrandPage(), OpenAIProvider, CarouselPlan, carouselPlanSchema, carouselSlideSchema, ContentIdea, contentIdeaSchema, contentPlanSchema (+11 more)

### Community 2 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 3 - "generation.ts"
Cohesion: 0.15
Nodes (21): authorized(), POST(), planCarousel(), planContent(), writeCopy(), buildVisualPrompt(), buildBrandContext(), getRecentContentContext() (+13 more)

### Community 4 - "dependencies"
Cohesion: 0.09
Nodes (23): clsx, lucide-react, next, openai, dependencies, clsx, lucide-react, next (+15 more)

### Community 5 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, supabase, tailwindcss, @tailwindcss/postcss (+11 more)

### Community 6 - "image-generator.ts"
Cohesion: 0.21
Nodes (8): GeneratedImage, ImageFormat, ImageProvider, OpenAIImageProvider, renderPrompt(), sizes, VisualPrompt, dimensions

### Community 7 - "create-brief.tsx"
Cohesion: 0.24
Nodes (7): CreateBrief(), formats, initial, createContent(), createContentSchema, CreateContentState, enqueueGeneration()

### Community 8 - "scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, build, db:reset, db:start, db:stop, dev (+4 more)

### Community 9 - "brand-form.tsx"
Cohesion: 0.22
Nodes (7): BrandForm(), initial, BrandActionState, saveBrand(), splitLines(), brandFormSchema, BrandFormValues

### Community 10 - "supabase-provider.ts"
Cohesion: 0.20
Nodes (3): StorageProvider, StoredObject, SupabaseStorageProvider

### Community 12 - "sidebar.tsx"
Cohesion: 0.31
Nodes (5): NavItem(), primary, settings, Sidebar(), cn()

### Community 13 - "notifications/provider.ts"
Cohesion: 0.40
Nodes (3): NoopNotificationProvider, NotificationEvent, NotificationProvider

### Community 14 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): dmSans, metadata, newsreader

### Community 15 - "src/proxy.ts"
Cohesion: 0.60
Nodes (3): refreshSession(), config, proxy()

## Knowledge Gaps
- **88 isolated node(s):** `EditorialSlide`, `CarouselPlan`, `ContentIdea`, `CopyPackage`, `AIResult` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `env` connect `generation.ts` to `createSupabaseServerClient`, `env.ts`, `supabase-provider.ts`, `image-generator.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `createSupabaseServerClient()` connect `createSupabaseServerClient` to `env.ts`, `brand-form.tsx`, `create-brief.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `EditorialSlide`, `CarouselPlan`, `ContentIdea` to the rest of the system?**
  _88 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `createSupabaseServerClient` be split into smaller, more focused modules?**
  _Cohesion score 0.1106612685560054 - nodes in this community are weakly interconnected._
- **Should `env.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11229946524064172 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._