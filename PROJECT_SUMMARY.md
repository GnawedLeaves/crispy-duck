# Crispy Duck — Project Documentation

> **Crispy Duck** is a mobile-first PWA that turns a photo of a paper Tanita/NTUC body-composition printout into a structured, queryable health history — with AI coaching, trend charts, and friend-to-friend comparison.

---

# Part 1 — Detailed Project Overview (for interviews)

## 1. The Problem

Public gym body-composition machines (Tanita scales at NTUC / ActiveSG gyms) print a **paper receipt** with ~17 metrics: weight, body fat %, fat mass, fat-free mass, muscle mass, total body water, bone mass, BMR, metabolic age, visceral fat rating, BMI, degree of obesity, ideal body weight.

Those slips get lost. Even if you photograph them, a camera roll gives you no trend line — you can only eyeball the latest photo against the previous one. There is no export, no API, and no account system on the machine.

**Crispy Duck closes that loop:** photograph the slip once, and the data becomes permanent, charted, analysable, and shareable.

## 2. Architecture at a Glance

```
┌──────────────────────────────────────────────────────────────────┐
│  Next.js 16 App Router (React 19.2)                              │
│  ├─ Server Components  → data fetching, SSR                      │
│  ├─ Server Actions     → all DB mutations ("use server")         │
│  ├─ Route Handler      → /api/scan (binary upload path)          │
│  └─ proxy.ts           → edge auth gate on /scan /stats /friends │
└───────────────┬──────────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────────┐
│  Supabase                                                        │
│  ├─ Auth        → email+password, anonymous guest sessions       │
│  ├─ Postgres    → profiles, tanita_scans, friendships,           │
│  │                ai_analyses  (+ RLS on every table)            │
│  ├─ RPC         → get_friend_panel() (SQL-side join + filter)    │
│  ├─ Storage     → `scans` (private, signed URLs)                 │
│  │                `avatars` (public, cache-busted)               │
│  └─ Edge Fn     → process-scan → Google Cloud Document AI (OCR)  │
└───────────────┬──────────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────────┐
│  Google AI                                                       │
│  ├─ Document AI  → OCR of the printed slip                       │
│  └─ Gemini Flash → body-recomposition coaching analysis          │
│                    (via Vercel AI SDK v7)                        │
└──────────────────────────────────────────────────────────────────┘
```

## 3. Feature Breakdown

### 3.1 The Scanning Pipeline (the core of the app)

The end-to-end flow in [scannerview.tsx](app/scan/components/scannerview.tsx) is the most technically interesting part of the project. It is a **five-stage pipeline with a recovery path at every stage.**

**Stage 1 — Client-side image normalisation**
iPhones shoot HEIC by default, which browsers and Document AI both reject. The app detects `image/heic` / `image/heif` and transcodes to JPEG at quality 0.8 **in the browser** using `heic2any`, which is **dynamically imported** (`await import("heic2any")`) so the ~1MB decoder is only downloaded by users who actually upload a HEIC — it never enters the main bundle.

**Stage 2 — A deliberate workaround for an iOS Safari + Vercel bug**
The natural Next.js approach is a Server Action taking `FormData`. That path is **broken on iOS WebKit behind Vercel's edge** — multipart bodies arrive truncated or empty. The fix implemented here: read the file to a raw base64 string client-side (`FileReader` → strip the `data:` prefix), and `POST` it as **JSON** to a dedicated Route Handler at [/api/scan](app/api/scan/route.ts), which rebuilds the `ArrayBuffer` server-side via `atob` + `Uint8Array`. Supporting config: `maxDuration = 120` on the route and `serverActions.bodySizeLimit: "10mb"` in [next.config.ts](next.config.ts).

*This is a genuinely good interview story: it's a real cross-platform bug, correctly diagnosed, with a workaround that trades elegance for reliability — and the reasoning is documented in a code comment.*

**Stage 3 — OCR via Supabase Edge Function**
The image lands in a **private** Supabase Storage bucket, then a Supabase Edge Function (`process-scan`) is invoked with the storage path and MIME type. It calls **Google Cloud Document AI** and returns the raw extracted text. Keeping the Google credentials inside an Edge Function means they never touch the Next.js server or the client.

**Stage 4 — A hand-written domain parser**
Document AI returns unstructured text, not fields. [`parseTautaScan()`](app/utils/common.tsx) turns it into a typed object:

- **Regex metadata extraction** — pulls `16/JAN/2026 13:33` style timestamps out of the document globally.
- **Section bounding** — the printout repeats labels under `INPUT`, `RESULT`, and `DESIRABLE RANGE` headers. The parser splits on those headers so `WEIGHT` under "desirable range" can't contaminate the actual result. This is the key insight that makes the parse reliable.
- **Dual-layout key/value handling** — some fields print as `VISCERAL FAT RATING 14` (same line), others as `WEIGHT` / `96.4` (next line). The parser handles both by checking `line === label` vs `line.startsWith(label)`.
- **OCR error correction** — replaces the letter `O` with the digit `0` before numeric extraction, a classic OCR confusion on 7-segment-style print.

**Stage 5 — Validation heuristic**
Users will inevitably upload a photo of their cat. Rather than trusting the OCR blindly, the app counts how many *required* fields came back empty (`countEmptyRequiredFields`, excluding the two genuinely optional ones) and rejects the scan above a threshold of 5, with a specific, actionable error: *"This image doesn't look like a valid Tanita scan: N fields couldn't be read."* — plus a one-tap "Try a different image" recovery.

**Throughout — progress UX**
OCR takes 10–30 seconds, which is long enough that users assume the app has frozen. The solution is a three-step progress checklist (`Uploading → Reading with Google Doc AI → Retrieving results`) with a computed percentage bar and ✓ / ● / ○ state icons, paired with `AnimatedLoadingText` rotating playful copy every 5s ("Squeezing your fats…", "Feeding ducks…"). This is product thinking, not just engineering.

### 3.2 Draft Persistence — Two Storage Layers, Deliberately

A user OCRs a scan, gets a 17-field review form, and then their phone rings. [editFormView.tsx](app/scan/components/editFormView.tsx) handles this with a **split persistence strategy**:

| Data | Store | Reason |
|---|---|---|
| Parsed scan fields | **Cookie** (7-day expiry, `SameSite=Lax`, URL-encoded JSON) | Small, and readable server-side if that's ever needed |
| Base64 image preview | **sessionStorage** | Base64 images are megabytes — cookies cap at ~4KB |

The draft is written on *every* keystroke via `useEffect`, restored on mount in the parent, and cleared on successful save or explicit cancel. Critically, drafting is **skipped when editing an already-saved scan** (`if (isEditingExisting) return;`) so editing scan #3 doesn't clobber a half-finished new scan the user parked.

There's also a separate reusable `usePersistedForm` hook backed by `localStorage`, SSR-safe via a `typeof window === "undefined"` guard in the lazy initialiser.

### 3.3 Form Validation & Error Attribution

Beyond the usual required-field checks, [editFormView.tsx](app/scan/components/editFormView.tsx) does two uncommon things:

1. **Scroll-to-first-error.** A `useRef<Record<string, HTMLDivElement>>` map holds a ref per field; on validation failure the first errored field is `scrollIntoView({ behavior: "smooth", block: "center" })`. On a 17-field mobile form, this is the difference between "the save button did nothing" and a usable app.

2. **Server-error → field-error inference.** Postgres returns opaque messages like `numeric field overflow`. `parseServerError()` pattern-matches the message and maps it back onto the specific numeric fields it could plausibly refer to, highlighting them in red rather than dumping a raw DB error at the user. Date/time errors are similarly routed to the date and time inputs.

Also handled: **format normalisation across three sources.** `scanTime` arrives as bare `"HH:mm"` when freshly OCR'd but `"HH:mm:ss"` from the Postgres `time` column, and neither parses in dayjs without a date — so the code regex-extracts hours/minutes directly and zero-pads. Future-dated OCR results (OCR misreads on the year) silently fall back to today.

### 3.4 AI Coaching Analysis

- A **reusable, generic Server Action** ([actions.ts](app/utils/ai/actions.ts)) wraps the **Vercel AI SDK v7** + `@ai-sdk/google`, exposing `prompt`, `systemInstruction`, `tone`, and arbitrary `context` (auto-serialised whether it's an object, array, or string). Any feature can call it — it isn't coupled to body scans.
- A domain-specific **system prompt** ([statsAiInsights.tsx](app/stats/components/currentStats/statsAiInsights.tsx)) frames Gemini as a body-recomposition analyst, constrains output to two bolded sections (KEY TRENDS / PERFORMANCE INSIGHTS & ACTION PLAN), and forces bullet formatting — prompt engineering for **consistent, renderable output**, not just a chat reply.
- The user's real scan history is injected as structured JSON context, so the analysis is grounded in actual data.
- Output renders through **`react-markdown`** with Tailwind Typography, plus copy-to-clipboard (with a 2-second ✓ confirmation), regenerate, and dismiss controls.
- **Analyses are persisted.** Each generation writes to an `ai_analyses` table alongside a **snapshot of the trend data it was based on** — so a past analysis stays interpretable even after new scans change the trend. There's a full history list, a detail view at `/stats/analysis/[id]`, and delete.
- A thin `useAiInsight()` hook encapsulates the loading/error/result state machine.

### 3.5 Social Layer

- **Friendship state machine** over a single `friendships` table: `send → pending → accepted`, plus reject and cancel (the same DELETE, kept as two named functions because they're different user intents in different UI contexts — and the code comment says exactly that).
- **A Postgres RPC (`get_friend_panel`) does the work in SQL**, taking filter, search, limit, and offset. Rather than fetching all profiles and all friendships and joining in JavaScript, one round trip returns the panel already filtered and joined — then a mapper converts the flat SQL row into the app's nested `FriendModel` shape.
- **Debounced search** (350ms) in `useFriendController`, with an `active` flag in the effect cleanup to **discard stale responses** — a proper race-condition guard, not just a debounce.
- **Friend profile viewing and head-to-head comparison** at `/profile/compare/[userId]`, fully server-rendered.

### 3.6 The Comparison Algorithm (`mergeAndFillTrendData`)

Comparing two people's scan histories is a real data problem: you and your friend weigh in on **different, irregular dates**. Naively merging produces charts full of holes.

The implementation does a **last-observation-carried-forward (LOCF) merge**:
1. Union both date sets, sort chronologically.
2. Build `Map` lookups for O(1) access per series.
3. Walk the master timeline; where a series has no reading for a date, carry its last known value forward.

The result is two continuous lines on a shared axis. This is a genuine time-series technique (used in clinical and financial data), applied correctly.

### 3.7 Data Visualisation

- **Tremor's `LineChart` vendored into the repo** (~900 lines, built on Recharts) rather than installed — giving full control over legend behaviour, tooltip rendering, click-to-highlight series, and a custom `useOnWindowResize` hook.
- Trend charts across weight, fat %, muscle mass, fat mass, TBW %, metabolic age, BMI, and visceral fat rating.
- Custom `ProgressBar` / `ProgressBarStatItem` components for at-a-glance current stats.
- **Per-user chart colour, persisted to the profile** — with a nice touch: when you and your friend have both picked the same colour, the comparison chart automatically shifts one of them so the lines stay distinguishable.

### 3.8 Authentication & Onboarding

- **Multi-step signup wizard** (email → password → display name → sex → birthday → done) with a `stepsBar` progress indicator and per-step validation, deliberately split from account creation so the auth account exists before the profile does.
- **Mid-wizard drop-off is handled explicitly**: the account can exist without a profile row, `getUserContext()` returns `profile: null` in that case, and the user is routed back into the wizard on next login instead of landing in a broken state.
- **Username generation with collision retry** — generates a random username and retries up to 5 times specifically on Postgres error code `23505` (unique violation), bailing immediately on any other error. Correct error-code-specific retry logic rather than a blind retry loop.
- **Anonymous guest sessions** via `signInAnonymously()` so people can try the app without signing up.
- **Route protection at the edge** in [proxy.ts](proxy.ts) — Next.js 16's replacement for `middleware.ts` — guarding `/scan`, `/stats`, `/friends`, and bouncing authenticated users off `/login`, with the full Supabase SSR cookie get/set bridge.
- **Avatar upload** with MIME-type and 5MB size validation, `upsert` to a deterministic path, and a `?t=${Date.now()}` **cache-buster** so the new image shows immediately instead of a stale CDN copy.
- Themed default duck avatars selected by sex when no avatar is set (with a guard against the classic `"[object Object]"` stringification bug).

### 3.9 Security Posture

- **Row Level Security is the primary authorisation mechanism** — friend scan data is fetched with the *same* query as your own, just a different `user_id`; RLS decides whether rows come back. A non-friend gets `[]`, not an error. Authorisation lives in the database, not in application `if` statements.
- **Every mutation is double-scoped** — `updateScanData` and `deleteScanData` filter on `.eq("id", scanId).eq("user_id", currentUserId)`, so even a leaked scan ID can't be used to touch someone else's row.
- **Scan images live in a private bucket.** Displaying a past scan for reference during editing requires minting a **1-hour signed URL** server-side (`createSignedUrl`), gated on an authenticated user — with a `cancelled` flag in the `useEffect` cleanup so a stale URL never lands on a re-rendered component.
- Google Cloud credentials are isolated inside the Supabase Edge Function.
- Auth checks are done with `supabase.auth.getUser()` (server-verified) rather than trusting the session cookie's contents.

### 3.10 PWA & Mobile

- **Installable PWA** via Next.js's typed `MetadataRoute.Manifest` — `display: "standalone"`, theme colours sourced from the design tokens, 192/512 icons, and **narrow + wide screenshots** to satisfy Chrome's "Richer Install UI" requirements.
- Service worker registered client-side on mount.
- Mobile-first throughout: native `<input type="date">` / `<input type="time">` pickers for reliable mobile keyboards, responsive button padding, touch-friendly hit areas.

### 3.11 Design System & Motion

- **Neo-brutalist visual language** — hard 2px borders, offset solid shadows (`box-shadow: 4px 4px 0px`), a warm cream/amber palette, Josefin Sans via `next/font` — with buttons that physically "press in" via an `inset` shadow and a 2px translate on `:active`.
- **A single source of truth for colour**: a typed `token` object in [theme.ts](app/theme.ts) is injected as CSS custom properties on `<body>`, so the same values drive Tailwind classes, inline styles, the toast system, and the PWA manifest.
- **React 19 View Transitions** — the app opts into the experimental `viewTransition` flag and uses React's `<ViewTransition>` component with `addTransitionType("forwards" | "backwards")` inside `startTransition`, backed by hand-written `::view-transition-old/new()` keyframes for **directional** slide animations. A `TransitionLink` wrapper makes this a drop-in replacement for `next/link`.
- **Custom toast system** built on React Context with auto-dismissing, colour-coded, stacking notifications.
- A `withDelay()` HOF wraps click handlers in a 300ms `setTimeout` so the button's press animation is visible before navigation — deliberate perceived-performance work.
- Route-level `loading.tsx` files for App Router streaming skeletons.

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16.2.6** (App Router, Server Components, Server Actions, Route Handlers, `proxy.ts`) |
| UI | **React 19.2.4** (`ViewTransition`, `startTransition`, `addTransitionType`, Context) |
| Language | **TypeScript 5** (strict interfaces, generics, `keyof` mapped types, discriminated string unions) |
| Database / Auth / Storage | **Supabase** — Postgres + RLS, Auth (email + anonymous), Storage, RPC, **Edge Functions** |
| OCR | **Google Cloud Document AI** |
| Generative AI | **Google Gemini Flash** via **Vercel AI SDK v7** (`ai`, `@ai-sdk/google`) |
| Charts | **Tremor** (vendored) on **Recharts 3** |
| Styling | **Tailwind CSS v4**, **daisyUI 5**, CSS custom properties, `tailwind-merge`, `tailwind-variants` |
| Utilities | `dayjs`, `heic2any`, `react-markdown`, `lucide-react`, `clsx` |
| Platform | Vercel, PWA (manifest + service worker) |

## 5. Engineering Themes Worth Highlighting in an Interview

1. **Real-world constraints drove real engineering.** The iOS/Vercel FormData workaround, the HEIC transcode, the private-bucket signed URLs, and the OCR `O`→`0` correction are not tutorial code — each exists because something actually broke.
2. **Authorisation pushed into the database.** RLS + defensive `user_id` scoping on every mutation, rather than trusting client-supplied IDs.
3. **Work pushed to the right layer.** OCR into an Edge Function (credential isolation), friend-panel joins into a Postgres RPC (one round trip), HEIC decoding into the browser (server cost), heavy decoders into a dynamic import (bundle size).
4. **Failure is a first-class state.** Every async path has a typed error result, a user-readable message, and a recovery action. `{ data, error }` result tuples are used consistently instead of throwing.
5. **Perceived performance is treated as a feature.** Progress checklists, rotating loading copy, press animations before navigation, cache-busted avatars, scroll restoration after edits, streaming loading skeletons.
6. **The app is adopting a framework's bleeding edge deliberately** — Next 16's `proxy.ts`, React 19 View Transitions, Tailwind v4's CSS-first config, AI SDK v7 — and the repo carries an `AGENTS.md` instructing contributors to read the shipped framework docs rather than trust prior knowledge.
7. **Good code hygiene.** Deprecated functions are marked `@deprecated` with a pointer to the replacement, non-obvious decisions carry "why" comments, and shared logic is extracted into hooks (`useAiInsight`, `usePersistedForm`, `useFriendController`) and controllers.

---

# Part 2 — Résumé Bullet Points

> Copy-paste ready. Pick the 4–6 that best match the role you're applying for.

### Headline version (short — 4 bullets)

**Crispy Duck — AI Body Composition Tracker** · *Next.js 16, React 19, TypeScript, Supabase, Google Cloud AI*

- Built a full-stack PWA that digitises paper gym body-scan printouts via **Google Cloud Document AI OCR**, replacing a lossy manual process with a permanent, charted health history.
- Engineered a resilient upload pipeline handling **iOS HEIC transcoding**, a **client-side base64/JSON workaround for an iOS Safari + Vercel `FormData` bug**, and a validation heuristic that rejects non-scan images before they reach the database.
- Integrated **Google Gemini** via the **Vercel AI SDK** to generate persisted, data-grounded body-recomposition coaching analyses from users' real scan histories.
- Secured multi-tenant social data with **Postgres Row Level Security**, private-bucket signed URLs, and `user_id`-scoped mutations, enabling safe friend-to-friend progress comparison.

### Extended version (full — 10 bullets)

**Crispy Duck — AI-Powered Body Composition Tracker & Social Fitness PWA**
*Next.js 16 · React 19 · TypeScript · Supabase (Postgres/Auth/Storage/Edge Functions) · Google Document AI · Google Gemini · Tailwind v4*

- **Architected and shipped a full-stack, installable PWA** that converts photographs of physical Tanita body-scan printouts into structured, trend-charted health data — eliminating a lossy paper-and-camera-roll workflow.
- **Built a 5-stage OCR ingestion pipeline** (client-side HEIC→JPEG transcode → private Storage upload → Supabase Edge Function → Google Cloud Document AI → domain parser), isolating cloud credentials server-side and keeping a ~1MB decoder out of the main bundle via dynamic import.
- **Authored a custom OCR text parser** extracting 17 body-composition metrics from unstructured output, using section-boundary splitting to prevent field contamination, dual-layout key/value handling, regex timestamp extraction, and OCR character-confusion correction.
- **Diagnosed and worked around a production iOS Safari + Vercel `FormData` bug** by re-architecting uploads to client-side base64 + JSON POST through a dedicated Route Handler — restoring upload reliability for all mobile users.
- **Integrated Google Gemini via the Vercel AI SDK** behind a reusable, generic Server Action, with domain-specific system-prompt engineering that constrains output to consistently renderable Markdown; analyses persist alongside a snapshot of the data they were generated from.
- **Implemented Row Level Security-based authorisation** in Postgres, with defensive `user_id` scoping on every mutation and time-limited signed URLs for private storage — so friend data access is enforced by the database, not by client-side checks.
- **Designed a dual-layer draft persistence system** (cookies for form state, `sessionStorage` for base64 previews) letting users abandon and resume a 17-field review form across sessions without data loss.
- **Built a social layer** with a Postgres RPC-backed friend panel (SQL-side filtering, search, and pagination in a single round trip), debounced search with stale-response race guards, and a full friend-request state machine.
- **Implemented a last-observation-carried-forward time-series merge algorithm** to align two users' irregularly-dated scan histories onto a shared axis, powering gap-free head-to-head comparison charts.
- **Adopted bleeding-edge framework features in production**: Next.js 16 `proxy.ts` edge middleware, React 19 `<ViewTransition>` with directional transition types, Tailwind CSS v4's CSS-first configuration, and AI SDK v7.

### Skills line (for a skills section)

`TypeScript` · `React 19` · `Next.js 16 (App Router, Server Components, Server Actions)` · `Node.js` · `PostgreSQL` · `Supabase` · `Row Level Security` · `Edge Functions` · `Google Cloud Document AI` · `Google Gemini / LLM Integration` · `Vercel AI SDK` · `Prompt Engineering` · `OCR & Text Parsing` · `Data Visualisation (Recharts/Tremor)` · `Tailwind CSS v4` · `PWA / Service Workers` · `Mobile-First Responsive Design` · `REST API Design` · `Cloud Storage & Signed URLs` · `Vercel`
