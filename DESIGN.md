# BELOW THE SURFACE
## Personal portfolio — creative direction & implementation contract

> **Historical design brief (archived):** This document is preserved as the original pre-implementation creative specification (Revision 1.0). Subsequent revisions superseded parts of its navigation and branding (the live site uses public identity **Tamer Akdeniz** with monogram **`TA`**, expedition index navigation, and a compact globe language selector). For current production architecture, operations, and deployment documentation, see [README.md](./README.md), [docs/operations.md](./docs/operations.md), and [docs/deployment.md](./docs/deployment.md).

**Owner:** Tamer Akdeniz · **Domain:** tamerakdeniz.com · **Revision:** 1.0

This document is the source of truth for a full visual redesign of the existing portfolio. It is not a request to build a disconnected demo. Implement in the existing repository, preserve verified content and functioning features, and deliver a production-ready experience. English is the proposed primary copy language; preserve any existing Turkish localization and language switching. All copy here is proposed, not evidence of achievements.

## 01 / Creative thesis
The site is an editorial expedition through a builder's mind. The ocean is a metaphor for curiosity and depth, not the subject of a diving business. Combine BELOW THE SURFACE (narrative), THE INVENTOR'S LAB (engineering evidence), and independent editorial design (visual language). The visitor should remember a person who explores, builds and learns, not a list of frameworks.

Primary audiences: engineering recruiters, product teams, collaborators. In 5 seconds they should know whose site this is and what he does; in 30 seconds they should reach real projects or CV; in 3 minutes they should understand his approach. Prioritize clarity over spectacle. Mood: quiet, precise, curious, cinematic, tactile. Avoid nautical costumes, submarines, cartoon fish, fake sonar terminals, cyberpunk neon, generic AI purple gradients, glassmorphism, floating blobs, pill-heavy UI, bento dashboards, skill bars, typewriter titles, stock laptop imagery, fake testimonials, invented metrics and awards.

Signature visual: a continuous bathymetric contour line system that evolves from sparse surface lines to denser technical diagrams, finally becoming a single horizon line. It is the connective tissue of the site, not a repeated background wallpaper. Create original procedural SVG with deterministic paths, not a stock illustration. The depth scale is explicitly metaphorical; never imply a real dive profile or certification depth.

## 02 / Audit before editing (mandatory)
- Read repository instructions, README, package manifest, lockfile, routes, components, CSS, content sources, assets, integrations, analytics, localization, accessibility, deployment config and git status. Identify actual framework and package manager; do not assume Next.js or migrate without reason.
- Run existing build/lint/typecheck/tests and capture baseline failures. Capture current desktop/mobile screenshots when browser tooling exists. Inventory all existing routes, projects, CV downloads, external links, contact forms, chatbot, theme controls and other functionality if present; do not add speculative integrations.
- Preserve existing URLs, SEO metadata, canonical URLs, structured data, sitemap, robots, contact behavior, environment variable contracts, analytics consent, and backend APIs. If a route changes, add a verified redirect. Do not overwrite user edits or secrets, force-push, deploy, or delete content without explicit approval.
- Verify name spelling, dates, roles, availability, links and asset rights from repository. Existing verified content overrides example text here. Do not manufacture project ownership, usage numbers, performance gains, employment or qualifications. If information is missing omit it or record a clearly identified internal TODO, never publish placeholder claims.
- Make a short audit and implementation plan, then execute in the same session. Do not stop after planning. Keep modifications scoped to redesign; reuse sound existing infrastructure.

## 03 / Information architecture
Home is a continuous narrative with direct links; project detail pages are independent shareable documents, not modal-only experiences. Keep current route conventions. Proposed mapping if absent: /, /work, /work/[slug], /lab, /about, /contact; /notes only if real notes exist. Avoid redundant empty routes: home anchors are acceptable for about/contact. Use /#work etc with stable IDs. Archive lives on /work or /lab. Provide a functional 404 in same visual language.

| Chapter | Depth label | Anchor | Purpose |
|---|---:|---|---|
| 00 Surface | 00 m | surface | identity, immediate actions |
| 01 The Human | 10 m | about | personal story |
| 02 Selected Works | 20 m | work | evidence of product and engineering ability |
| 03 Inside the Lab | 30 m | lab | experiments and archive |
| 04 Engineering DNA | 40 m | engineering | approach and verified stack |
| 05 The Journey | 50 m | journey | education and experience |
| 06 Beyond the Known | 60 m | contact | conversation and return to surface |

Use depth as a normalized visual progress scale over the chapter intervals, not an actual measurement. Map active chapter and local progress to 0–60 m, clamp, recompute on resize/layout changes, never cause scroll jumps. At last chapter show 60 m; optional progress between anchors, integer display. Screen readers get chapter names, not constant live announcements. On desktop fixed right rail; mobile small nonblocking chapter label. No scroll hijacking.

## 04 / Visual system
### Color tokens
```css
:root {
  --abyss: #080F16;
  --ocean: #162B36;
  --trench: #050A0F;
  --tidal: #458C8C;
  --signal: #B5F5D2;
  --paper: #EDECE6;
  --ink: #142027;
  --muted-dark: #A4B4BE;
  --muted-light: #46575C;
  --line-dark: #30454F;
  --line-light: #BCC7C4;
  --focus-dark: #B5F5D2;
  --focus-light: #145C58;
  --ease-out: cubic-bezier(.22,1,.36,1);
  --radius: 2px;
}
```
Abyss and paper are the principal contrast pair. Signal is a scarce accent for actionable states, active markers and focus on dark backgrounds; use ink on signal. Tidal is decorative on dark, not default small text. On paper use ink and muted-light. Validate every text/background and control contrast (WCAG 2.2 AA target); 1px separators are decorative unless communicating state. Explicit semantic error/success tokens must meet contrast. No global gradient wash: subtle chapter-local atmospheric shading only. Light editorial islands in Human or work sections make dark chapters meaningful. Recruiter view uses paper by default.

### Typography
Space Grotesk (display and headings), Instrument Serif (select editorial emphasis, not paragraphs), IBM Plex Mono (chapter IDs/metadata), system sans or Space Grotesk (body). Use licensed local WOFF2/subsets or existing licensed font assets; no remote font dependency if avoidable. Fallbacks preserve readable layout. No font files need to be shipped in this brief.
- Hero display clamp(3.4rem, 8.5vw, 9rem), line-height .88–.98, letter spacing -.055em. Use explicit responsive line breaks, never split words or clip ascenders.
- H2 clamp(2.5rem, 5.7vw, 5.5rem), line-height 1.02, tracking -.04em.
- H3 clamp(1.6rem, 3vw, 2.75rem); body 17–19px desktop / 16–17px mobile, line-height 1.6; metadata 12–13px with moderate tracking.
- Body measure 55–72 characters; avoid uppercase paragraphs. One semantic H1, logical heading hierarchy. Turkish glyph coverage including İ/ı/ş/ğ test.

### Grid & spacing
Desktop 12 columns max content width 1440px, gutters 24px, side padding clamp(24px,5vw,88px), reserve rail space. Tablet 8 columns / 24px gutters; mobile 4 columns / 16px gutters / 20px sides (16px at 320). Breakpoints 768 and 1024px, optional wide 1440. Spacing scale 4,8,12,16,24,32,48,64,96,128,160; chapter padding clamp(72px,11vw,160px). Align rules and labels to grid, permit intentional asymmetry. No arbitrary blank 100vh chapters; only hero approximately 90–100svh, expanding with content. Radius 0–4px except natural focus/controls. Shadows minimal. Lines, image crops and scale establish hierarchy rather than cards.

### UI primitives
Wordmark MTA or verified full name, no registered trademark symbol. Header links Work / About / Lab / Contact; CV and Recruiter view available without menus on desktop where space permits. Mobile header: wordmark, mode link, menu button. Buttons: primary solid signal on dark, ink on paper; secondary underline or hairline outline, visible hover and focus; minimum 44px interaction targets. Text links clearly distinguished. Menu dialog focus trap, escape, restore focus, lock only while open. Icons simple line icons, 16–20px, text labels for ambiguous actions. Native form controls with labels, inline errors, pending/success/error states; preserve actual submission backend. Do not introduce forms if existing mail link is sufficient. No fake online status. No audio by default.

## 05 / Page art direction and copy
### 00 — Surface
First frame: near-black canvas, top horizontal nav, left column giant headline occupying roughly 7/12, right 5/12 original contour field with one signal marker, bottom horizontal rule and chapter metadata. Header sits above art; text always higher contrast. Hero copy example:
```
MUSTAFA TAMER AKDENIZ / SOFTWARE DEVELOPER
Beyond
the surface.
I build software, explore ideas, and turn complex problems into useful products.
[Explore selected work ↘]   [View CV ↗]
00 / SURFACE                         SCROLL TO EXPLORE
```
Name and role are visible without scrolling at common viewport sizes; if CV absent use verified contact link. No claim of availability unless content confirms it. Art may respond to pointer with max 8px translation on fine pointers only, never block clicks. Hero typography arrives in 0–650ms; visible text must not depend on JS. No loading gate, no intro overlay.

Desktop composition guide (not literal content):
```
MTA                 WORK   ABOUT   LAB   CONTACT      RECRUITER VIEW
-------------------------------------------------------------------
SOFTWARE DEVELOPER                            .-- contour lines --.
Beyond                                        /    .---.           \\
the surface.                                 |    (  +  )          |
I build software ...                          \\    '---'          /
Explore work ↘    View CV ↗                    '-----------------'
-------------------------------------------------------------------
00 / SURFACE                          SCROLL TO EXPLORE       00 m
```
Mobile: nav then name, headline 2–3 lines, supporting copy and actions, contour art below/behind empty space; no overlapping text, rail removed, hero height auto.

### 01 — The Human
Paper background, editorial spread: authentic portrait or diving photo spanning 5 columns, text spanning 6 offset by 1. Caption is factual location/date only if verified. Headline: “Curiosity takes me deeper.” Body: software development, product thinking and diving instruction; connect exploration, preparation, responsibility and iterative learning without overstating parallels. Include short factual identity paragraph and a link to longer about if present. Use one serif phrase, not whole text. If no real imagery use contour graphic or typography, not generated likeness/stock diver passed off as owner. Photo may use grayscale/neutral treatment but preserve original context. Desktop alternate image/text alignments; mobile image after intro.

### 02 — Selected Works
Three featured projects max initially, chosen from actual portfolio and asset quality. Suggested order AKAR, CallWhisper, Pathyvo if verified; Telco CRM may substitute to emphasize backend engineering. Never hide other existing work: archive link is always visible. Each feature is a full editorial spread with number, real product screenshot, one-sentence problem, role, selected technologies, and meaningful case-study link. Layout variation: project 1 wide image with left caption, project 2 split dark spread, project 3 offset image with paper background. No repetitive equal-size cards. Visual identity of project screens stays authentic; frame minimally. Use verified demos/repositories as secondary links; no dead controls. If screenshot missing use an original architecture/typographic treatment with no fake UI. Mobile single-column, no horizontal-only carousel.

Suggested evidence angles (verify before publishing): AKAR cultural heritage platform; CallWhisper real-time AI coaching; Pathyvo AI career mentoring; Telco CRM service architecture; ScreenTimer focus tools; Rhymov sports matching; Qirushio realtime quiz. Preserve all existing projects, and only add these if repository or owner-provided material supports publication. Never claim solo authorship on teams.

### Project detail template
Above fold: title, one-sentence outcome or purpose, role/team/date/status when verified, real cover and action links. Then narrative: Context → Problem → Constraints → My contribution → Design/architecture decisions and tradeoffs → Implementation → Evidence/results → Lessons/next steps. Include only measured results and label qualitative observations. For complex systems use an accessible SVG diagram, text alternative and clear legend; no fake architecture. Include gallery with real screenshots, captions and accessible lightbox only if needed; escape and focus restoration required. Prev/next project and return to work. Direct URL works on reload and via back button. Metadata/OG image per project if existing infrastructure permits.

### 03 — Inside the Lab
Dark technical archive, title “Ideas in motion.” Tabular/index composition with hairline separators, ID, title, category, actual status, year, arrow. Filters only if enough items and data supports them; category buttons accessible, URL state optional. Status vocabulary: Prototype / In progress / Shipped / Archived only when factual. No mock records. Rows expand or link to existing detail; don't make inaccessible clickable divs. Include real notes if available; otherwise omit notes rather than populate with AI-written diary entries. At mobile use stacked rows with no horizontal overflow.

### 04 — Engineering DNA
Technical editorial spread, not skill cloud. Headline “How I build.” 3 pillars: Systems & backend; Product & interface; AI & automation. Map actual technologies to real project examples, show decisions, not fabricated proficiency ratings. A lightweight diagram can connect problem → design → build → validate → iterate (conceptual workflow, not assertion of process on every project). Use verified experience in Python/FastAPI, Java/Spring, TS/React, Docker and databases as available; preserve current data. No decorative terminal with fake commands. Each pillar has text, 2–4 technology labels and a related work link.

### 05 — The Journey
Chronological field log with years, institutions, roles and factual milestones. Suggested entries from owner context: Çukurova Computer Programming (department valedictorian), Anadolu MIS degree, Google AI & Technology Academy, Turkcell GYG5.0, 42 Istanbul, freelance/WXCO history, diving instruction. Confirm all dates, current status and public visibility with existing source; never label 42 as completed degree without evidence. Use vertical timeline with legible dates, no fake stats or animated counters. CV download and experience links visible. Keep overlapping roles intelligible.

### 06 — Beyond the Known
Return to near-black with a single horizon line; calm, spacious end frame. Headline “There’s always more beneath the surface.” Secondary “Have a problem worth exploring? Let’s talk.” Primary verified email/contact action, GitHub and LinkedIn links if present, CV, back to surface. Footer with verified name/year, no fake badges. Contact form only when functional. No forced animation or autoplay. Depth rail settles at 60 m.

## 06 / Interaction and motion contract
Motion is purposeful: reveal structure, indicate chapter transition, acknowledge interaction. Native scroll is baseline. CSS transitions and IntersectionObserver first; GSAP/ScrollTrigger only for contour progression or a genuinely valuable synchronized sequence. Do not install Lenis, Three.js, React Three Fiber, or additional animation libraries by default; optional enhancement only with measured benefit, no duplicate RAF loops. No WebGL required for signature aesthetic.

| Interaction | Behavior | Timing / constraints |
|---|---|---|
| Hero | text opacity/translate reveal, contour draw | 450–650ms; max 16px offset; no gate |
| Chapter entering | optional heading/caption reveal once | 350–550ms, stagger 50–80ms, max 24px |
| Contour progression | slow path/opacity changes, scrub if used | native scroll, no heavy layout recalculation |
| Work image | slight crop/scale on hover | 1.00–1.025, 280ms, fine pointer only |
| Link | underline extension / arrow nudge | 150–220ms, max 4px |
| Navigation | anchor jump or smooth scroll | native, reduced motion instant |
| Menu / palette | fade and small shift | 150–220ms, no delayed focus |
| Recruiter toggle | instant usable content | optional brief fade, no layout flash |

Respect prefers-reduced-motion and explicit motion preference; reduced mode disables parallax, scrub, path drawing, animated counters, smooth scrolling and nonessential movement. All content in final visible state, no invisible server-rendered text. If using GSAP scope effects, matchMedia and cleanup on route/unmount; never animate layout properties per frame. Pause offscreen/hidden document animation. No pinning on mobile; desktop pinning optional and only if it does not obstruct content. No custom cursor replacing system pointer. No infinite animated decoration unless it can be stopped and justified.

### Recruiter view (P0)
A distinct information-first rendering using the same data, not a second stale portfolio. Accessible from header and footer, direct URL via existing routing or `?view=recruiter` (prefer stable shareable /resume if routing supports it). Show name, concise role, contact, CV, featured projects, tech/experience and education in a compact paper layout. No cinematic animation. Preserve project links, back-to-explore and browser history. Explicit URL preference beats stored preference; default to editorial view for new users; persistence optional, avoid hydration flash. Print styles remove chrome and use readable paper. Do not invent a PDF resume; use actual asset if available.

### Command palette (P1)
Cmd/Ctrl+K only when not interfering with text input; visible accessible trigger if enabled. Search known pages/projects, keyboard navigation, Enter activates, Escape closes, focus restoration, no network needed. Optional shortcut hints only desktop. Easter eggs P2: one harmless contour detail or hidden note with no essential content. No secret data, audio surprise, or game requirement.

## 07 / Assets & original graphics
Inventory existing assets first. Prioritize real project screenshots and personal photography. Do not use copyrighted third-party imagery without permission or scrape references. Use CSS/SVG contours generated from deterministic sine/noise-like curves with bounded coordinates; 12–20 paths hero, varied spacing, hairline strokes ~0.6–1px; use a single SVG responsive viewBox, aria-hidden decorative, pointer-events none. Lower chapters may use contour fragments as separators. Avoid dense stripes behind body text. Implement with seeded deterministic math; SSR/client output identical. Use WebP/AVIF or existing optimized images, explicit dimensions/aspect ratios, responsive sizes, lazy below fold; hero LCP asset eager only if it is the actual LCP. No raw multi-MB video in initial viewport. Do not fabricate photos or product screens. For missing material record asset path/spec and omit publicly or use neutral vector alternative.

## 08 / Engineering implementation
Adapt paths to repository; suggested boundaries: `components/portfolio/` with SiteHeader, ChapterShell, DepthRail, ContourField, EditorialHero, HumanSpread, FeaturedWork, LabIndex, EngineeringPillars, JourneyLog, ContactHorizon, RecruiterView, ProjectDetail, MotionProvider; `styles/tokens.css`; shared typed content adapter. Keep server-rendered content where framework supports it and isolate interactive client components. No monolithic page component or duplicated source of truth. Keep existing stack and lockfile; if Next.js already present use its image/font/metadata facilities as appropriate. Avoid framework version upgrades for cosmetic changes.

Data contract (adapt existing schema, do not duplicate): project slug, title, summary, role?, team?, dates?, status?, tags[], cover?, gallery[], links{}, sections[], featured boolean; image alt, width, height, attribution if applicable. Journey entries and social links sourced from existing content. Missing optional fields omitted in render. Build-time content validation for duplicate slugs and malformed links where practical. Never expose secrets or private repository URLs without authorization. Sanitize untrusted rich content. Preserve existing backend/API contracts. No new telemetry or external service without permission.

Navigation: semantic landmarks, skip link, anchor offsets under header, focus visible, route transitions nonblocking, active chapter tracking using IntersectionObserver or equivalent. On JS failure core information and links remain usable if rendering stack permits. SEO: meaningful titles/descriptions, canonical URL, existing hreflang, sitemap, social previews, Person/CreativeWork schema only for verified facts. Preserve robots policy. No indexation of duplicate recruiter URL if canonical design dictates. Respect consent and existing privacy policy.

## 09 / Responsive & accessibility requirements
Test 320, 375, 390, 768, 1024, 1440, 1920 CSS px; portrait and landscape where relevant. No horizontal overflow, clipped title, overlapping rail/nav, offscreen focus, tiny hit targets, hidden important text. 200% browser zoom and 320px reflow; readable text at 16px baseline. Touch has equivalent interactions; hover never required. Keyboard-only journey, menus, filters, palette and links; visible focus not obscured. WCAG 2.2 AA target: contrast 4.5:1 normal text, 3:1 large text and essential nontext UI; meaningful alt, decorative SVG hidden, labels for controls, no color-only states. No continuous live-region announcements of depth. Check reduced motion, no JS where supported, slow connection, failed media, missing optional data. Safari/iOS and Chromium/Firefox. Use native scroll and safe area insets; no fullscreen trapping.

## 10 / Performance budgets and verification
Targets, not claimed measurements: LCP <=2.5s, INP <=200ms, CLS <=0.1 at field p75 when real data exists. Lab Lighthouse mobile performance >=90, accessibility >=95 (prefer 100), SEO >=95 under documented repeatable conditions; accessibility still requires manual checks. Run production build, report environment and median of 3 runs if available. Aim initial route JS <=200KB gzip excluding unavoidable baseline framework; report baseline and delta if framework exceeds it, justify additions. Hero media <=250KB preferred; initial image payload <=500KB preferred; no unsolicited video. Responsive lazy image loading, font subset, avoid hydration bloat and main-thread animation. Keep interaction responsive on throttled CPU/network. Never claim field INP from Lighthouse; use lab TBT as diagnostic only. If targets missed report actual results and reason; do not hide failure.

## 11 / Implementation sequence
P0: repository audit → content inventory → tokens and primitives → responsive header/hero → all home chapters → case study/detail/route preservation → recruiter view → accessibility + responsive + production checks. P1: scoped scroll motion, contour progression polish, optional command palette, archive filters and diagrams as justified. P2: experimental extras only after P0/P1 quality gates; omit if no benefit. Maintain a usable page after each phase. No bulk dependency upgrades. Use existing package manager scripts; run lint, typecheck, tests, build. Add targeted tests for chapter navigation, mode URL/state, route links and key interactions, and Playwright if available/appropriate. Do not rewrite unrelated tests to pass.

## 12 / Acceptance checklist (definition of done)
- [ ] Existing content, routes and functional integrations audited and preserved; all published facts verified or clearly omitted.
- [ ] Hero immediately communicates identity and role; direct work/CV or contact actions work.
- [ ] Custom contour signature and coherent 7-chapter narrative; asymmetrical editorial compositions, no generic repeated card layout.
- [ ] At least one real case study if source material exists; no fabricated metrics/screens; archive exposes remaining work.
- [ ] Recruiter view shares content data, has working deep link, browser history and print layout.
- [ ] No empty pages, dead buttons, placeholder text, broken media or console/hydration errors attributable to redesign.
- [ ] Keyboard, reduced motion, contrast, 200% zoom, touch and all target widths checked; no horizontal overflow.
- [ ] Build/lint/typecheck/test run with exact outcomes, baseline failures separately reported.
- [ ] Actual performance checks documented; budgets met or exceptions described.
- [ ] Desktop 1440 and mobile 390 screenshots for hero, work, recruiter and contact; full-page screenshots if tooling available; inspect them visually before finalizing.
- [ ] Final report includes changed files, architecture, content/asset gaps, commands/results, screenshots paths, remaining risks and any decisions requiring owner review. No deployment or commits pushed without explicit request.

## 13 / Review rubric (100 points)
Originality and coherent art direction 25; editorial typography/layout 20; content clarity and credible engineering evidence 20; responsive/accessibility 15; performance and technical quality 15; preservation of existing behavior 5. Target >=85 with no critical failure. Critical failures override score: broken core route/contact/CV, invented claims, hidden content in reduced motion, unusable mobile or failed production build due to redesign. Review visually, not merely by code checklist. Compare screenshots against this brief rather than a generic template aesthetic.

## 14 / References and implementation notes
- GSAP matchMedia and scoped cleanup: https://www.gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Core Web Vitals: https://web.dev/articles/vitals
These are technical references, not visual templates to copy. The live domain was not retrievable during brief preparation; the repository audit is therefore mandatory and framework/assets/routes are not assumed verified. All design choices above are proposed by creative direction and can be adjusted where actual code or content makes them unsuitable; document changes explicitly.
