# imjustlucas.dev: animation & motion audit

- **Repo**: `ImJustLucas/imjustlucas.dev`, branch `spec/4-content-admin-locales`
- **Commit audited**: `b7c1179`
- **Date**: 2026-10-19
- **Scope**: the public site (`app/[locale]/`, `components/`): sidebar, menu, mobile menu, Presence card, Project and Video cards, accordion, dropdown, theme toggle, plus the MDF 2025 3D scene. The Admin is out of scope.
- **Method**: `improve-animations` skill, `standard` effort. Read-only: no source file was edited and nothing was run. Every finding below was checked against the cited `file:line`. Things that can't be judged from code alone are marked **PLAUSIBLE**, and their plan includes a feel-check step.

---

## TL;DR (FR)

Le site bouge très peu, et le peu qui bouge vient presque entièrement des valeurs par défaut de shadcn/tailwindcss-animate. Il n'y a **aucun token de motion** et **aucune gestion de `prefers-reduced-motion`**. Plusieurs animations sont **mortes** : des `group-hover:` sans `group` sur la ProjectCard, une transition d'image qui n'a rien à animer, des icônes soleil/lune qui ne s'animent jamais à cause de `disableTransitionOnChange`. La scène 3D MDF 2025 est la plus « vivante », mais sa physique dépend du framerate (les pièces tombent deux fois plus vite sur un écran 120 Hz), elle tourne et fait du son à l'infini sans pause, et un `camera.far = 4` fait disparaître la scène si on redimensionne la fenêtre après un clic. Le menu mobile, la carte Presence et les changements de page apparaissent sans transition. Ce sont les coutures les plus naturelles pour la future direction « plus colorée, plus moi » (musique, skate, surf, LoL).

---

## 1. Recon

| Aspect | Finding |
| --- | --- |
| Stack | Next.js 16 App Router, React 19.3, Tailwind CSS **3.4.14**, shadcn/ui (new-york), Radix (accordion, dropdown-menu), next-themes, next-intl |
| Motion libraries | **None** for the DOM (no Motion/Framer, GSAP or React Spring). CSS transitions plus `tailwindcss-animate` (`animate-in`/`animate-out`). 3D: React Three Fiber 9.1, drei 10, postprocessing, hand-written per-frame physics in `useFrame` |
| Sound | `use-sound` (`/sounds/click.mp3` on every menu click), `new Audio()` in the scene (`coin.mp3`, `impact.mp3`) |
| Motion tokens | **None.** No `--ease-*` or `--duration-*` in `styles/globals.css`. `tailwind.config.ts` only extends the accordion keyframes (`0.2s ease-out`, the weak built-in curve) |
| `tailwindcss-animate` defaults | `animate-in`/`out` use `animation-duration: 150ms` and **no timing function**, so the browser default `ease` applies (`node_modules/tailwindcss-animate/index.js:14-30`) |
| Reduced motion | **No `prefers-reduced-motion`, `motion-reduce:` or `motion-safe:` anywhere** in `app/`, `components/`, `styles/` or `tailwind.config.ts` |
| Hover gating | Plain `hover:` everywhere, and `future.hoverOnlyWhenSupported` is not enabled |
| Personality today | Neutral zinc shadcn: crisp, almost motionless. **Target (per Lucas)**: more colourful, more personal (music, skate, surf, League of Legends). Corrective fixes below stay crisp. Personality motion is listed under "Missed opportunities" for the direction session |
| Documented motion decisions | None in `docs/`, `docs/adr/` or `CODING_STANDARDS.md`. `docs/routing.md:21` settles one constraint the plans respect: **the sidebar is mounted once** and only restyled between the desktop column and the mobile overlay (one Lanyard socket, one set of menu sounds) |

**Frequency map (per visit; this is a portfolio, not an app)**

| Frequency | Elements |
| --- | --- |
| Every visit, several times | Sidebar menu items (hover, press, active state), page change, Project and Video card hover |
| Every mobile visit | Mobile menu open/close (once per navigation on phone) |
| Ambient, unprompted | Presence card (appears when the Lanyard socket connects, changes with each song or game) |
| Occasional | FAQ accordion, theme dropdown, locale switch |
| Rare / celebration | MDF 2025 3D scene (unlisted route `/mdf-2025`) |

---

## 2. Vetted findings, ordered by leverage (impact ÷ effort)

| # | Severity | Category | Location | Finding | Fix summary | Plan |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | HIGH | Accessibility | `app/[locale]/mdf-2025/components/master-dev-scene.tsx:124-209, 329, 390`; `certificate.tsx:19-24` | The scene runs infinite motion (coin rain, spin, bob, stars, bloom) and repeated impact sounds with **no pause control and no reduced-motion branch**. WCAG 2.2.2 (Pause, Stop, Hide) and 1.4.2 (Audio Control) | `usePrefersReducedMotion` hook, a `still` mode (`frameloop="demand"` and frozen `useFrame`), a Pause/Play button, impact sounds only for user-thrown coins | 003 |
| 2 | HIGH | Performance / physicality | `master-dev-scene.tsx:126-127, 135-137, 172` | Physics advances **per frame**, not per second (`position += velocity`, `velocity.y -= 0.001`, `rotation += speed`). On a 120 Hz display (MacBook ProMotion, recent phones) coins fall and spin **2× faster**; when the frame rate drops they slow down | Scale every step by `Math.min(delta, 1/20) * 60` | 002 |
| 3 | MEDIUM | Foundation (cohesion / accessibility) | `styles/globals.css`, `tailwind.config.ts:57-82` | No easing tokens. The accordion uses the weak built-in `ease-out`, dropdowns use the browser `ease`, `hover:` is not gated for touch, and nothing handles reduced motion | Add `--ease-out`, `--ease-in-out` and `--ease-drawer` tokens mapped to Tailwind `ease-*`, set `future.hoverOnlyWhenSupported`, add a reduced-motion baseline for `animate-in`/`out` | 001 |
| 4 | MEDIUM | Cohesion / performance | `components/projects/ProjectCard.tsx:30, 38, 48, 80, 102` | **Dead hover states.** `group-hover:` is used in 3 places but the `Card` has no `group` class. The image has `transition-transform duration-300` with no transform to animate. The card uses `transition-all duration-300` (animates any property, at the 300ms ceiling) | Add `group`, list the transitioned properties, restore a subtle image zoom on hover with a reduced-motion branch. Same pattern on `VideoCard` | 005 |
| 5 | MEDIUM | Easing / physicality / perf | `components/sidebar/menu/MenuItem.tsx:26-29, 45` | `transition-all duration-200 ease-in-out` on the most-hovered element on the site. `ease-in-out` on a hover delays feedback, `active:scale-95` is heavier than needed, and `focus:` (not `focus-visible:`) leaves a sticky highlight after a mouse click. The active dot has `transition-all` but mounts and unmounts, so it never animates | Explicit properties at 150ms with the strong `ease-out`, `active:scale-[0.97]`, `focus-visible:`, a small entrance on the dot | 006 |
| 6 | MEDIUM | Missed opportunity / perf | `components/sidebar/Sidebar.tsx:27-36, 46`; `app/[locale]/ClientLayout.tsx:17-21` | The mobile menu **teleports** (`hidden` ↔ `fixed`). Content behind gets `filter: blur-sm` **on top of** the overlay's `backdrop-blur-sm` (two full-screen blurs on mobile, both snapping in). The Menu/X icon swaps without transition | Overlay always mounted on mobile (keeping one mount, per `docs/routing.md`), opacity/visibility fade at 200ms in and 150ms out, drop the redundant content blur, crossfade the icons | 007 |
| 7 | MEDIUM | Physicality / easing | `components/ui/dropdown-menu.tsx:55, 74` | The dropdown (theme menu) zooms from 95% **from its centre**, not from its trigger, with the browser default `ease` | `origin-[var(--radix-dropdown-menu-content-transform-origin)]` plus `ease-out` | 008 |
| 8 | MEDIUM | Correctness (scene) — **PLAUSIBLE** | `master-dev-scene.tsx:286` | `camera.far = 4` on every click, without `updateProjectionMatrix()`. The value takes effect at the next resize (R3F calls `updateProjectionMatrix()` in `updateCamera` on resize). The camera sits 8 units away, so **the certificate and stars vanish** after "click, then resize window or rotate phone" | Delete the line | 004 |
| 9 | LOW | Performance (scene) | `master-dev-scene.tsx:139, 142, 192, 109-113`; `:390, 212, 315, 323` | Per-frame allocations in each coin's `useFrame` (`position.clone()`, `new THREE.Vector3()` ×2): about 30+ objects per frame, which means GC jank. `<Canvas shadows>` with 3 `castShadow` casters and **no `receiveShadow` anywhere**, so shadow maps are rendered every frame for nothing | Reuse vectors, hoist the constant Box3, drop `shadows`/`castShadow` | 002 (allocations), 004 (shadows) |
| 10 | LOW | Interaction (scene) — **PLAUSIBLE** | `master-dev-scene.tsx:283-306, 357` | R3F fires `onClick` after a drag, so **orbiting the camera throws a coin** on release. User coins spawn exactly at the camera position (z = 8), so they can flash through the near plane. `mouse` is R3F's deprecated alias of `pointer` | Ignore clicks with `event.delta > 4`, spawn 1.5 units in front of the camera, use `pointer` | 004 |
| 11 | LOW | Physicality / purpose | `components/theme-switch.tsx:25-26`; `app/[locale]/layout.tsx:62` | Sun/Moon icons use `scale-0` and `transition-all`, but `disableTransitionOnChange` (a deliberate choice that stops every colour from transitioning on a theme switch) blocks transitions during the switch, so **the icon morph never plays**. Dead code built on `scale(0)` | Swap with a keyframe entrance (keyframes aren't blocked), from scale 0.5 instead of 0 | 010 |
| 12 | LOW | Purpose / state indication | `components/ui/accordion.tsx:31, 48` | The FAQ trigger has **no chevron or open-state indicator**, and `transition-all` on the trigger animates nothing. The height keyframes restart from zero when toggled quickly (accepted Radix limitation, rare action) | Add a rotating `ChevronDownIcon` (200ms, strong `ease-in-out`), remove `transition-all`, accordion keyframes switch to the token (via 001) | 009 |
| 13 | LOW | Missed opportunity / affordance | `components/presence/Presence.tsx:23-30`; `PresenceActivity.tsx:18`; `PresenceListening.tsx:20` | The Presence card **pops in** when the socket connects and **teleports** on each song or game change. Both cards have `cursor-pointer` but are not links | Keyed entrance (fade + 4px), fade-in of new content on change, remove `cursor-pointer` | 011 |

**Rejected or by design (not reported as problems):**
- `animate-spin` on the scene loader (`scene-loader.tsx:16`): it signals progress and shows a percentage. Keep it, reduced motion included.
- Radix accordion `height` keyframes: the standard Radix approach, small content, rare action. Easing gets fixed via 001, the property stays.
- `disableTransitionOnChange` (`layout.tsx:62`): deliberate. Plan 010 works around it instead of removing it.
- Certificate bob (`certificate.tsx:22`): already time-based (`clock.elapsedTime`), so not frame-rate dependent.
- `transition-colors` on `Button`, `Badge`, `TableRow` and dropdown items: correct.

**Observed but outside motion (follow-ups, not plans):**
- **Unused font**: `styles/globals.css:6` sets `font-family: Arial` and `tailwind.config.ts` doesn't map `--font-geist-sans`, so the site renders in **Arial** even though Geist is loaded (`app/fonts/index.ts`). Worth settling in the visual direction session.
- **No site-wide sound control**: `click.mp3` on every menu click (`MenuItem.tsx:17, 38`) plus the scene sounds. With the "music" direction, a sound toggle (stored in `localStorage`, off when `prefers-reduced-motion`?) belongs to the direction session.
- **Mobile scroll trap (PLAUSIBLE)**: three.js `OrbitControls` sets `touch-action: none` on the canvas (600px tall, `page.tsx:17`), so on a phone a vertical swipe over the scene rotates it instead of scrolling the page. Check on a real device.
- `select-none` on the whole layout (`ClientLayout.tsx:15`) blocks all text selection, including e-mail addresses and dates.

---

## 3. Missed opportunities (additive, for the direction session)

These come from real seams in the code, not a wishlist. Only the first one has a plan (011), because it is corrective. The others depend on the visual direction.

1. **Presence card as a "music" signature** (`components/presence/PresenceListening.tsx`). Beyond plan 011, the card is the most natural place for the musical identity: three equaliser bars (`scaleY` on `transform-origin: bottom`, `linear` infinite loop, durations offset per bar around 0.8–1.2s, **static under `prefers-reduced-motion`**) next to the Spotify logo. For the "playing" state (League of Legends), a pulsing "live" dot (`opacity` 1 → 0.4, 1.5s `ease-in-out` infinite, static under reduced motion). Ambient motion: GPU-only (`transform`/`opacity`), never on layout.
2. **Page changes** (`app/[locale]/ClientLayout.tsx:17-23`). Content teleports on every navigation. A `<div key={pathname}>` wrapper with `animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out` would be cheap. **Caveat**: on first load it delays LCP by about 200ms (opacity 0), so either skip the first render or use View Transitions (Next `experimental.viewTransition` and React `<ViewTransition>`; check their stability for Next 16.4 / React 19.3 before choosing). Decide this together with the direction.
3. **The chibi avatar** (`app/[locale]/layout.tsx:69-76`). `fixed bottom-5 right-5`, `hover:cursor-pointer`, **no interaction**. The cursor promises something. This is the natural "rare delight" moment for the skate/surf/LoL personality: a kickflip on click (a 360° `rotate` with a small `translateY` jump, about 500ms, playful spring, allowed here because it's rare and user-triggered), a different reaction per click, or an easter egg. Under reduced motion: a static sprite or image swap.
4. **Theme change as a colour moment** (`components/theme-switch.tsx`). If the direction goes "more colourful", a theme switch is a good candidate for a circular View Transitions reveal from the button (`clip-path: circle()` with `--ease-out`, about 400ms, rare action). Under reduced motion: an instant switch.
5. **Experiences timeline** (`app/[locale]/experiences/page.tsx:35-61`). Static dots and rails. A 50ms entrance stagger, or a rail that "draws" itself (`scaleY` 0 → 1, `transform-origin: top`), would fit a skate or surf "line". Purely decorative, must never block reading.

---

## 4. Implementation plans

Recommended order and dependencies are in §5. Each plan is self-contained and can be copied as-is into a GitHub issue.

---

# 001 — Add motion tokens, gate hover on touch, and a reduced-motion baseline

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens / Accessibility
- **Estimated scope**: 2 files, about 30 lines

## Problem

The repo has no motion tokens, no reduced-motion handling, and no touch-safe hover. Every later motion fix depends on these three foundations.

```ts
// tailwind.config.ts:77-80 — current
animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
},
```

- `ease-out` here is the CSS keyword, a weak curve. Tailwind's `ease-out` class is `cubic-bezier(0, 0, 0.2, 1)` (`node_modules/tailwindcss/stubs/config.full.js:960`), also weak.
- `tailwindcss-animate` (`animate-in`/`animate-out`, used by `components/ui/dropdown-menu.tsx`) sets no `animation-timing-function`, so the browser default `ease` applies (`node_modules/tailwindcss-animate/index.js:14-30`).
- Plain `hover:` everywhere: on touch devices a tap fires a "false hover" that stays stuck.
- No `prefers-reduced-motion` anywhere in `app/`, `components/`, `styles/` or `tailwind.config.ts`.

## Target

```css
/* styles/globals.css — inside the existing `@layer base { :root { … } }` block (line 16), after `--radius: 0.5rem;` */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

```ts
// tailwind.config.ts — target excerpts
const config: Config = {
  darkMode: ["class"],
  future: { hoverOnlyWhenSupported: true },
  content: [/* unchanged */],
  theme: {
    extend: {
      // …colors, borderRadius unchanged…
      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        drawer: "var(--ease-drawer)",
      },
      keyframes: { /* unchanged */ },
      animation: {
        "accordion-down": "accordion-down 200ms var(--ease-out)",
        "accordion-up": "accordion-up 200ms var(--ease-out)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
```

```css
/* styles/globals.css — appended at the end of the file, outside any @layer */
@media (prefers-reduced-motion: reduce) {
  /* tailwindcss-animate entrances/exits: keep the fade, drop the movement */
  .animate-in,
  .animate-out {
    --tw-enter-scale: 1 !important;
    --tw-exit-scale: 1 !important;
    --tw-enter-rotate: 0 !important;
    --tw-exit-rotate: 0 !important;
    --tw-enter-translate-x: 0 !important;
    --tw-enter-translate-y: 0 !important;
    --tw-exit-translate-x: 0 !important;
    --tw-exit-translate-y: 0 !important;
  }
}
```

Why `!important`: the `zoom-in-95`/`slide-in-from-*` utilities are emitted as `data-[state=open]:…` selectors (class + attribute), which beat `.animate-in` on specificity.

## Repo conventions to follow

- CSS variables live in `styles/globals.css` in the `@layer base { :root { … } }` block (lines 15–42). The tokens are theme-independent, so **don't** copy them into `.dark`.
- Tailwind theme extensions go in `tailwind.config.ts > theme.extend`, next to `keyframes`/`animation`.
- `tailwindcss-animate` derives `animationTimingFunction` from `theme("transitionTimingFunction")`, so after this plan the `ease-out` class sets **both** `transition-timing-function` and `animation-timing-function` to the strong curve. Later plans rely on this.

## Steps

1. `styles/globals.css`: add the three `--ease-*` lines to `:root` (after line 36 `--radius: 0.5rem;`).
2. `styles/globals.css`: append the `@media (prefers-reduced-motion: reduce)` block above at the end of the file.
3. `tailwind.config.ts`: add `future: { hoverOnlyWhenSupported: true },` right after `darkMode: ["class"],`.
4. `tailwind.config.ts`: add `transitionTimingFunction` (above) to `theme.extend`.
5. `tailwind.config.ts`: replace the two `animation` values with `"accordion-down 200ms var(--ease-out)"` and `"accordion-up 200ms var(--ease-out)"`.

## Boundaries

- Do NOT touch any component in this plan (other plans use the tokens).
- Do NOT add a global `* { animation: none !important }` rule: reduced motion means less movement, not zero feedback.
- Do NOT override `transitionTimingFunction.DEFAULT` (used by `transition-colors`, which is fine as is).
- `hoverOnlyWhenSupported` also applies to `app/admin/`. That's intended; don't special-case it.
- No new dependencies. If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint` and `pnpm test` pass; `pnpm build` succeeds.
- **Generated CSS check**: in DevTools on `/fr`, inspect an element with class `ease-out` (none yet, or temporarily on the theme dropdown) and confirm `cubic-bezier(0.23, 1, 0.32, 1)`. Inspect a `hover:` rule and confirm it sits inside `@media (hover: hover) and (pointer: fine)`.
- **Feel check**:
  - Open the theme dropdown (sidebar footer, sun/moon button): it should still fade and zoom. With DevTools > Rendering > "Emulate CSS prefers-reduced-motion: reduce", it **only fades** (no zoom, no slide).
  - Open/close an FAQ item on the home page: the opening starts fast and settles gently (strong curve), still 200ms.
  - On a phone (or DevTools device mode with touch): tap a menu item, and no hover highlight stays stuck on another item.
- **Done when**: the three tokens exist, the flag is on, the accordion uses `var(--ease-out)`, and the dropdown only fades under reduced motion.

---

# 002 — Make the MDF 2025 coin physics frame-rate independent and allocation-free

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: HIGH
- **Category**: Performance / Physicality
- **Estimated scope**: 1 file (`app/[locale]/mdf-2025/components/master-dev-scene.tsx`), about 30 lines

## Problem

`CustomCoin`'s `useFrame` advances the simulation **by a fixed amount per frame**. On a 120 Hz display coins fall and spin twice as fast as on 60 Hz, and they slow down whenever the frame rate drops. The callback also allocates new objects every frame for each coin (15 background coins plus every thrown coin), which feeds the garbage collector and causes jank.

```tsx
// master-dev-scene.tsx:124-139 — current
useFrame((state, delta) => {
  if (meshRef.current) {
    meshRef.current.rotation.y += rotationSpeed;
    meshRef.current.rotation.x += rotationSpeed * 0.5;
    // …
    if (!fallen) {
      meshRef.current.position.x += velocity.current.x;
      meshRef.current.position.y += velocity.current.y;
      meshRef.current.position.z += velocity.current.z;

      coinRef.current.set(meshRef.current.position.clone(), 0.5 * scale);

      if (certificateRef.current.intersectsSphere(coinRef.current)) {
        const certificateCenter = new THREE.Vector3();
        certificateRef.current.getCenter(certificateCenter);
```

```tsx
// master-dev-scene.tsx:171-173 — current
} else {
  velocity.current.y -= 0.001;
}
```

```tsx
// master-dev-scene.tsx:192-196 — current
const movement = new THREE.Vector3()
  .subVectors(meshRef.current.position, lastPosition.current)
  .length();

if (movement < 0.001) {
```

```tsx
// master-dev-scene.tsx:92, 108-113 — current: a constant box rebuilt for every coin
const certificateRef = useRef<THREE.Box3>(new THREE.Box3());
// …
useEffect(() => {
  certificateRef.current.set(
    new THREE.Vector3(-2.5, -1.5, -0.025),
    new THREE.Vector3(2.5, 1.5, 0.025),
  );
  certificateRef.current.translate(new THREE.Vector3(0, 0, 0));
```

## Target

All current constants were tuned at 60 fps. Keep them, and scale each step by "how many 60 fps frames have elapsed", clamped so a frame after a tab switch can't teleport coins:

```tsx
// module level, next to the shader and sound helpers
const CERTIFICATE_BOX = new THREE.Box3(
  new THREE.Vector3(-2.5, -1.5, -0.025),
  new THREE.Vector3(2.5, 1.5, 0.025),
);
const CERTIFICATE_CENTER = CERTIFICATE_BOX.getCenter(new THREE.Vector3());
/** The physics constants are tuned per 60 fps frame. */
const FRAMES_PER_SECOND = 60;
const MAX_DELTA = 1 / 20;
```

```tsx
// inside CustomCoin's useFrame — target shape
useFrame((state, delta) => {
  if (!meshRef.current) return;
  const step = Math.min(delta, MAX_DELTA) * FRAMES_PER_SECOND;

  meshRef.current.rotation.y += rotationSpeed * step;
  meshRef.current.rotation.x += rotationSpeed * 0.5 * step;
  // shader time update unchanged

  if (!fallen) {
    meshRef.current.position.addScaledVector(velocity.current, step);

    coinRef.current.center.copy(meshRef.current.position);
    coinRef.current.radius = 0.5 * scale;

    if (CERTIFICATE_BOX.intersectsSphere(coinRef.current)) {
      tempVector.current
        .copy(meshRef.current.position)
        .sub(CERTIFICATE_CENTER)
        .normalize();
      // …bounce code unchanged (it sets velocities, not increments)…
    } else {
      velocity.current.y -= 0.001 * step;
    }

    // …fall-below-−10 respawn unchanged…

    const movement = meshRef.current.position.distanceTo(lastPosition.current);
    if (movement < 0.001 * step) {
      // …unchanged…
    }
    lastPosition.current.copy(meshRef.current.position);
  }
});
```

## Repo conventions to follow

- The file already disables `react/no-unknown-property` and uses `useRef<THREE.Vector3>` for reusable vectors (`tempVector`, `lastPosition`, lines 103–104). Imitate that: reuse, don't allocate.
- Module-level constants already live at the top of the file (`GoldenShaderMaterial`, `playCoinSound`).

## Steps

1. Add `CERTIFICATE_BOX`, `CERTIFICATE_CENTER`, `FRAMES_PER_SECOND` and `MAX_DELTA` (above) at module level, after `playImpactSound` (line 69).
2. In `CustomCoin`: delete `certificateRef` (line 92), and in the `useEffect` (lines 108–122) delete the `certificateRef.current.set(…)` and `.translate(…)` calls. Keep the `lastPosition` copy and `playCoinSound`.
3. At the start of `useFrame`, compute `const step = Math.min(delta, MAX_DELTA) * FRAMES_PER_SECOND;`.
4. Multiply both rotation increments (lines 126–127) by `step`.
5. Replace the three `position.x/y/z +=` lines (135–137) with `meshRef.current.position.addScaledVector(velocity.current, step);`.
6. Replace line 139 with `coinRef.current.center.copy(meshRef.current.position); coinRef.current.radius = 0.5 * scale;`.
7. Replace `certificateRef.current.intersectsSphere` with `CERTIFICATE_BOX.intersectsSphere`, and replace lines 142–143 (`new THREE.Vector3()` plus `getCenter`) by using `CERTIFICATE_CENTER` in `.sub(…)`.
8. Line 172: `velocity.current.y -= 0.001 * step;`.
9. Lines 192–196: `const movement = meshRef.current.position.distanceTo(lastPosition.current);` and `if (movement < 0.001 * step)`.

## Boundaries

- Do NOT change the tuning values (`fallSpeed`, `rotationSpeed`, `0.7` bounce, `0.1` spread, `0.2` throw speed, `-10` floor).
- Do NOT touch `Scene`, `Coins`, `Certificate`, lighting or postprocessing (plans 003/004).
- Do NOT add a physics library (`@react-three/cannon` is installed but unused; leave it).
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm test`, `pnpm build`.
- **Feel check** on `/fr/mdf-2025`:
  - On a MacBook with a 120 Hz screen: drag the window between the built-in display (120 Hz) and a 60 Hz external monitor. Coins fall and spin **at the same speed** on both (before the fix, about 2× faster at 120 Hz).
  - DevTools > Performance > CPU throttling "6× slowdown": coins keep their real-time speed (fewer frames, same pace).
  - Switch tabs for 10 seconds and come back: no coin jumps across the screen (clamp `MAX_DELTA`).
  - Throw about 10 coins in a row: the bounce on the certificate looks the same as before.
  - DevTools > Performance, 5s recording: no regular "Minor GC" spikes caused by `useFrame`.
- **Done when**: no `.clone()` or `new THREE.*` in `CustomCoin`'s `useFrame`, and every increment is multiplied by `step`.

---

# 003 — Give the MDF 2025 scene a pause control, reduced-motion support, and user-initiated sound only

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 4–5 files (scene, certificate, new hook, 2 message dictionaries), about 70 lines
- **Depends on**: 002 (same file, apply 002 first)

## Problem

The scene animates indefinitely (coin rain, coin spin, certificate bob, drei `Stars`, bloom) and plays `impact.mp3` **every time a background coin** touches the certificate, with no way to stop it and no `prefers-reduced-motion` branch. That fails WCAG 2.2.2 (moving content longer than 5s needs pause/stop) and 1.4.2 (automatic audio needs a control). After an in-site navigation (a user gesture), the browser allows audio, so impacts start on their own as soon as the page loads.

```tsx
// master-dev-scene.tsx:163-164 — current: every coin, user or not, plays the impact sound
if (impactVelocity > 0.01 && !hasImpacted.current) {
  playImpactSound();
```

```tsx
// master-dev-scene.tsx:387-394 — current
return (
  <>
    <SceneLoader />
    <Canvas shadows>
      <Scene />
    </Canvas>
  </>
);
```

```tsx
// certificate.tsx:19-24 — current
useFrame((state) => {
  if (groupRef.current) {
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  }
});
```

## Target

- A `usePrefersReducedMotion()` hook (no new dependency).
- A `still` state: `paused ?? prefersReducedMotion`. Paused by default under reduced motion; the visitor can still choose "Play".
- When `still`: `<Canvas frameloop="demand">` (renders only when something changes; drei's `OrbitControls` invalidates on drag, so the camera still orbits), every `useFrame` returns immediately (coins frozen in place, certificate at its base position), `Stars speed={0}`, and clicking doesn't throw a coin.
- A Pause/Play button overlaid on the scene (bottom right), localized.
- `impact.mp3` only for coins thrown by the visitor (`isUserCoin`). `coin.mp3` (on throw) is already user-initiated.

```ts
// lib/use-prefers-reduced-motion.ts — new file
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/** Whether the visitor asked the system for reduced motion; false on the server. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
```

```tsx
// master-dev-scene.tsx — MasterDevScene target shape
export default function MasterDevScene() {
  const t = useTranslations("Mdf2025");
  const prefersReducedMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState<boolean | null>(null);
  const still = paused ?? prefersReducedMotion;

  // …existing audio preload effect unchanged…

  return (
    <>
      <SceneLoader />
      <Canvas shadows frameloop={still ? "demand" : "always"}>
        <Scene still={still} />
      </Canvas>
      <Button
        variant="secondary"
        size="sm"
        className="absolute bottom-3 right-3 z-10"
        onClick={() => setPaused(!still)}
      >
        {still ? <Play aria-hidden /> : <Pause aria-hidden />}
        {still ? t("play") : t("pause")}
      </Button>
    </>
  );
}
```

(`shadows` gets removed in plan 004. If 004 lands first, keep its version of `<Canvas>` and only add `frameloop`.)

Message dictionaries:

```json
// messages/en.json > "Mdf2025" — add
"pause": "Pause animation",
"play": "Play animation"
```

```json
// messages/fr.json > "Mdf2025" — add
"pause": "Mettre l'animation en pause",
"play": "Lancer l'animation"
```

## Repo conventions to follow

- Every visible string goes in **every** dictionary (`messages/en.json` is the reference; `messages/messages.test.ts` checks all dictionaries have the same keys). See `docs/routing.md:17`.
- Client components use `useTranslations` from `next-intl` (as in `scene-loader.tsx:4,8`).
- Buttons: `Button` from `@/components/ui/button`. The label changes with the state, so don't add `aria-pressed` too (that would announce the state twice). Icons: `lucide-react` (`Pause`, `Play`), as in `components/sidebar/Sidebar.tsx:5`.
- The scene container is already `relative` (`app/[locale]/mdf-2025/page.tsx:17`), so `absolute bottom-3 right-3` places the button inside the scene.
- There's no `hooks/` folder. Put the hook in `lib/use-prefers-reduced-motion.ts` (shared utilities live in `lib/`).

## Steps

1. Create `lib/use-prefers-reduced-motion.ts` (above).
2. `master-dev-scene.tsx`: import `useTranslations` (`next-intl`), `Pause`/`Play` (`lucide-react`), `Button` (`@/components/ui/button`), `usePrefersReducedMotion`. Rewrite `MasterDevScene` as above.
3. `Scene`: accept `{ still }: { still: boolean }`. Pass `still` to `<Coins count={15} still={still} />`, to each user `<CustomCoin … still={still} />`, and to `<Certificate position={[0, 0, 0]} still={still} />`. Set `<Stars … speed={still ? 0 : 1} />`. At the start of `handleClick`, add `if (still) return;` and include `still` in the `useCallback` dependencies.
4. `Coins`: accept `still` and pass it to each `CustomCoin`.
5. `CustomCoin`: add the prop `still?: boolean` (default `false`). First line of `useFrame`: `if (still) return;`.
6. `CustomCoin`, impact condition (line 163): `if (isUserCoin && impactVelocity > 0.01 && !hasImpacted.current)`.
7. `certificate.tsx`: add the prop `still?: boolean` (default `false`). In `useFrame`: `if (still || !groupRef.current) return;` before updating `position.y`.
8. Add the `pause`/`play` keys to `messages/en.json` and `messages/fr.json` under `Mdf2025`.

## Boundaries

- Do NOT remove the throw sound (`playCoinSound`, user-initiated) or the audio preload.
- Do NOT build a site-wide sound toggle here (separate follow-up for the direction session). Background impact sounds come back only with that toggle.
- Do NOT change physics or lighting (plans 002/004).
- Do NOT hide or unmount the `Canvas` when `still`: the visitor should still see the scene and be able to orbit it.
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm test` (including `messages.test.ts`), `pnpm build`.
- **Feel check** on `/fr/mdf-2025` and `/en/mdf-2025`:
  - The "Mettre l'animation en pause" / "Pause animation" button sits at the bottom right of the scene. Clicking it freezes coins and certificate where they are, and the camera can still be orbited by dragging. Clicking "Lancer l'animation" resumes from the same state (no jump, thanks to plan 002's `MAX_DELTA` clamp).
  - While paused, clicking the scene doesn't throw a coin.
  - DevTools > Rendering > "prefers-reduced-motion: reduce", then reload: the scene shows up **already paused**, button on "Play". Turning reduced motion off without reloading starts the animation, unless the visitor already used the button.
  - Arrive via the sidebar menu (so audio is allowed): **no** impact sound plays until you throw a coin yourself. Throwing a coin: throw sound, then one impact when it hits the certificate.
  - DevTools > Performance while paused: almost no frames rendered when you're not dragging.
- **Done when**: the button works in both Locales, reduced motion pauses by default, and only user coins play the impact sound.

---

# 004 — Fix the MDF 2025 scene's camera far-plane bug, drag-throws, coin spawn point, and wasted shadows

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: MEDIUM (far plane) / LOW (the rest)
- **Category**: Correctness / Interaction / Performance
- **Estimated scope**: 1 file (`master-dev-scene.tsx`), about 15 lines
- **Depends on**: 002 and 003 (same file; apply in order)

## Problem

1. **Far plane (PLAUSIBLE, confirm with the feel check).** Each click sets `camera.far = 4` without calling `updateProjectionMatrix()`. R3F calls `camera.updateProjectionMatrix()` on every resize (`updateCamera` in `node_modules/@react-three/fiber/dist/events-*.esm.js:443-456`). After "click, then resize the window or rotate the phone", the far plane becomes 4 while the camera is 8 units from the origin (`minDistance = maxDistance = 8`), so the certificate and stars get clipped and disappear.
   ```tsx
   // master-dev-scene.tsx:283-286 — current
   const handleClick = useCallback(() => {
     const cameraPosition = camera.position.clone();
     // eslint-disable-next-line react-hooks/immutability
     camera.far = 4;
   ```
2. **Drag throws a coin.** The invisible click plane (`:357-360`) gets `onClick` even after an `OrbitControls` drag, so every camera orbit throws a coin on release.
3. **Spawn at the camera.** `position: [cameraPosition.x, cameraPosition.y, cameraPosition.z]` (`:300`) puts the coin right on the camera, inside the near plane, which can flash gold on the first frames.
4. **`mouse` is deprecated** in R3F v9 (`useThree().mouse` is an alias of `pointer`), `:266`.
5. **Shadows for nothing.** `<Canvas shadows>` (`:390`), `castShadow` on the coins (`:212`), the `directionalLight` (`:315`) and the `spotLight` (`:323`), but **no `receiveShadow` anywhere** (the GLB certificate has none by default). Shadow maps render every frame and are never shown.

## Target

```tsx
// Scene — target excerpts
const { camera, viewport, pointer } = useThree();

const handleClick = useCallback(
  (event: ThreeEvent<MouseEvent>) => {
    if (still) return;              // from plan 003
    if (event.delta > 4) return;    // a drag to orbit the camera, not a throw
    const cameraPosition = camera.position.clone();

    const mouseX = (pointer.x * viewport.width) / 2;
    const mouseY = (pointer.y * viewport.height) / 2;
    const targetVector = new THREE.Vector3(mouseX, mouseY, 0);
    const direction = new THREE.Vector3()
      .subVectors(targetVector, cameraPosition)
      .normalize();
    const spawn = cameraPosition.addScaledVector(direction, 1.5);

    setUserCoins((prevCoins) => [
      ...prevCoins,
      {
        position: [spawn.x, spawn.y, spawn.z],
        scale: Math.random() * 0.3 + 0.2,
        id: nextId.current++,
        velocity: [direction.x * 0.2, direction.y * 0.2, direction.z * 0.2],
      },
    ]);
  },
  [camera, pointer, viewport, still],
);
```

```tsx
// MasterDevScene — target
<Canvas frameloop={still ? "demand" : "always"}>
```

## Repo conventions to follow

- `ThreeEvent` is imported from `@react-three/fiber` (same import as `Canvas`, `useFrame`, line 12).
- Keep the file's existing comments style (short `//` comment explaining the why).

## Steps

1. Delete lines 285–286 (`// eslint-disable-next-line react-hooks/immutability` and `camera.far = 4;`). Delete the comment on line 281 (`// Mutating the R3F camera…`) and the `eslint-disable-next-line react-hooks/immutability` on line 282 **only if** `pnpm lint` no longer needs them (the callback stops mutating the camera).
2. `useThree()`: replace `mouse` with `pointer` (line 266) and in `handleClick` (lines 288–289), plus the dependencies.
3. Type `handleClick` as `(event: ThreeEvent<MouseEvent>) => …` and add `if (event.delta > 4) return;` (after plan 003's `if (still) return;`).
4. Compute `spawn = cameraPosition.addScaledVector(direction, 1.5)` and use it for `position`.
5. Remove `shadows` from `<Canvas>`, `castShadow` from the coin `<mesh>` (line 212), from the `directionalLight` (315) and the `spotLight` (323), and the `shadow-mapSize-width/height` props (324–325).

## Boundaries

- Do NOT touch the lighting values (intensity, angle, penumbra) or postprocessing (Bloom/Vignette).
- Do NOT add `receiveShadow` to "use" the shadows: removing them is the intended fix (they've never been visible).
- Do NOT change physics (plan 002) or pause/reduced-motion (plan 003).
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm build`.
- **Feel check** on `/fr/mdf-2025`:
  - **Before the fix (to confirm the bug)**: click the scene once, then resize the browser window. On `b7c1179` the certificate should disappear. After the fix it stays visible.
  - Drag to orbit, then release: **no** coin is thrown. A short click (no movement) throws one.
  - A thrown coin appears just in front of the camera, small, and flies towards the click point. No gold flash fills the screen.
  - The image looks identical before and after removing shadows (compare screenshots). DevTools > Performance: shorter frame time.
- **Done when**: `camera.far` is never assigned, `mouse` is gone, clicks after a drag are ignored, and `shadows`/`castShadow` are removed.

---

# 005 — Fix the dead hover states on Project cards and give Video cards the same hover

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: MEDIUM
- **Category**: Cohesion / Performance
- **Estimated scope**: 2 files, about 10 lines
- **Depends on**: 001 (strong `ease-out`, `hoverOnlyWhenSupported`)

## Problem

```tsx
// components/projects/ProjectCard.tsx:30 — current
<Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl max-w-sm h-[500px] flex flex-col">
```
```tsx
// ProjectCard.tsx:38 — current: transitions a transform that never changes
className="object-cover object-top transition-transform duration-300"
```
```tsx
// ProjectCard.tsx:48, 80, 102 — current: group-hover with no `group` ancestor → never fires
<CardTitle className="text-2xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
className="group-hover:border-primary/50 transition-colors"
className="ml-auto group-hover:bg-primary/90 transition-colors"
```

- `group-hover:` is used 3 times but no element has the `group` class: the intended hover hints (title in `primary`, button border) never show.
- `transition-transform duration-300` on the image without a transform: leftover from a removed zoom.
- `transition-all duration-300`: animates every property that changes (layout included), at the top of the UI budget.

`components/videos/VideoCard.tsx:17-25` has no hover at all, so the two card grids feel different.

## Target

```tsx
// ProjectCard.tsx:30 — target
<Card className="group relative overflow-hidden transition-shadow duration-200 ease-out hover:shadow-xl max-w-sm h-[500px] flex flex-col">
```
```tsx
// ProjectCard.tsx:38 — target
className="object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
```
(lines 48, 80, 102 unchanged: they start working once `group` is there)

```tsx
// VideoCard.tsx:17 — target
<Card className="group w-full max-w-sm transition-shadow duration-200 ease-out hover:shadow-xl">
```
```tsx
// VideoCard.tsx:20-24 — target (Image)
<Image
  src={video.thumbnail}
  alt={video.title}
  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
  sizes="(max-width: 768px) 100vw, 384px"
  fill
/>
```

Values: hover shadow 200ms, image zoom 300ms (slow decorative movement on a large surface, still within budget), `ease-out` = `cubic-bezier(0.23, 1, 0.32, 1)` via plan 001, zoom **1.03** (subtle). The image containers already have `overflow-hidden` (`ProjectCard.tsx:31`, `VideoCard.tsx:18`), so the zoom stays clipped.

## Repo conventions to follow

- Styles via Tailwind classes in `className`, merged by `cn` when needed (`components/ui/card.tsx:11`).
- With plan 001, `hover:` and `group-hover:` only apply on devices with a real hover (`@media (hover: hover) and (pointer: fine)`).

## Steps

1. `ProjectCard.tsx:30`: replace `transition-all duration-300` with `group … transition-shadow duration-200 ease-out` (exact class list above).
2. `ProjectCard.tsx:38`: replace the image `className` with the target.
3. `VideoCard.tsx:17`: replace `className="w-full max-w-sm"` with the target.
4. `VideoCard.tsx:22`: replace `className="object-cover"` with the target.

## Boundaries

- Do NOT make the whole card a link (structural change; the cards aren't clickable today, only their buttons are).
- Do NOT add a "lift" (`translateY`) on hover: on a non-clickable card it would promise a click.
- Do NOT touch `TechBadge`, `Badge` or `Button`.
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm build`. In DevTools, check that `group-hover:scale-[1.03]` appears in the CSS inside `@media (hover: hover) and (pointer: fine)`.
- **Feel check** on `/fr/what` and `/fr/videos`:
  - Hovering a Project card: shadow grows, image zooms a little, title turns `primary`, GitHub button border tints. All of it starts right away, with no lag.
  - Hovering a Video card: same shadow and zoom.
  - Run the cursor quickly across the grid: transitions retarget smoothly (no restart from zero, no flicker).
  - DevTools > Animations at 10%: the zoom starts fast and settles. The image never leaves its frame.
  - Reduced motion on: no zoom; the shadow and title colour still change.
  - Phone: tapping a button doesn't leave a stuck hover on the card.
- **Done when**: no `transition-all` in these two files, and hover hints are visible on both card types.

---

# 006 — Tighten the sidebar menu item hover, press and focus feedback

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: MEDIUM
- **Category**: Easing & duration / Physicality / Performance
- **Estimated scope**: 1 file (`components/sidebar/menu/MenuItem.tsx`), about 6 lines
- **Depends on**: 001

## Problem

The menu item is the most-hovered element on the site.

```tsx
// components/sidebar/menu/MenuItem.tsx:25-31 — current
className={cn(
  "w-full justify-start gap-2 transition-all duration-200 ease-in-out",
  "hover:bg-primary/10 hover:text-primary",
  "focus:bg-primary/20 focus:text-primary focus:outline-none",
  "active:scale-95",
  isActive && "bg-primary/10 text-primary font-medium",
)}
```
```tsx
// MenuItem.tsx:44-46 — current: transition on an element that mounts/unmounts, so it never animates
{isActive && (
  <span className="h-2 w-2 rounded-full bg-primary transition-all duration-200 ease-in-out" />
)}
```

- `transition-all`: also animates whatever changes (font weight, padding…).
- `ease-in-out` on a hover: the start is slowed down exactly when the user is looking. Hover and press need an immediate start.
- `active:scale-95`: a 5% press is heavy on a full-width button. Target 0.97.
- `focus:` instead of `focus-visible:`: after a mouse click (client-side navigation), the link keeps focus and stays at `bg-primary/20` until the next click elsewhere. That's a stuck state.
- The active dot pops in.

## Target

```tsx
// MenuItem.tsx:25-31 — target
className={cn(
  "w-full justify-start gap-2 transition-[background-color,color,transform] duration-150 ease-out",
  "hover:bg-primary/10 hover:text-primary",
  "focus-visible:bg-primary/20 focus-visible:text-primary focus-visible:outline-none",
  "active:scale-[0.97] motion-reduce:active:scale-100",
  isActive && "bg-primary/10 text-primary font-medium",
)}
```
```tsx
// MenuItem.tsx:44-46 — target
{isActive && (
  <span className="h-2 w-2 rounded-full bg-primary animate-in fade-in-0 zoom-in-50 duration-200 ease-out" />
)}
```

Values: 150ms for colour and press (press-feedback budget 100–160ms), `ease-out` = `cubic-bezier(0.23, 1, 0.32, 1)` (plan 001), press scale 0.97, dot entrance 200ms from scale 0.5 (never from 0). Under reduced motion: no press scale (colour change only), dot fades without zoom (plan 001 baseline).

## Repo conventions to follow

- `cn` (tailwind-merge) resolves the conflict between the base `Button`'s `transition-colors` (`components/ui/button.tsx:10`) and `transition-[…]`: the latter wins because it comes later.
- `animate-in fade-in-0 zoom-in-50` is the `tailwindcss-animate` syntax already used in `components/ui/dropdown-menu.tsx:74`.

## Steps

1. Line 26: `transition-all duration-200 ease-in-out` → `transition-[background-color,color,transform] duration-150 ease-out`.
2. Line 28: replace the three `focus:` with `focus-visible:`.
3. Line 29: `active:scale-95` → `active:scale-[0.97] motion-reduce:active:scale-100`.
4. Line 45: replace the dot's `className` with the target.

## Boundaries

- Do NOT touch the click sound (`useSound`, line 17) or `closeMenu()`.
- Do NOT create a "sliding" active indicator shared between items (a separate idea; it would need layout measurement).
- Do NOT change `components/ui/button.tsx`.
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm build`.
- **Feel check** (desktop, `/fr`):
  - Run the cursor down the menu: the highlight follows with no perceptible lag.
  - Press and hold an item: it shrinks slightly (3%) and springs back on release.
  - Click "Projets": after navigation, no item stays with the darker background (`bg-primary/20`). Only the active item keeps `bg-primary/10` and its dot.
  - Keyboard: `Tab` through the menu, and the focused item shows `bg-primary/20` (focus-visible works).
  - The active dot appears with a small fade and zoom, no pop.
  - Reduced motion on: no press shrink, colours still change.
- **Done when**: no `transition-all`, `ease-in-out` or `focus:` in `MenuItem.tsx`.

---

# 007 — Animate the mobile menu overlay, remove the double blur, and crossfade the Menu/X icon

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: MEDIUM
- **Category**: Missed opportunity / Performance / Interruptibility
- **Estimated scope**: 2 files (`components/sidebar/Sidebar.tsx`, `app/[locale]/ClientLayout.tsx`), about 25 lines
- **Depends on**: 001

## Problem

```tsx
// components/sidebar/Sidebar.tsx:27-36 — current
<div
  className={cn(
    "md:static md:z-auto md:flex md:h-full md:w-80 md:flex-col md:p-2 md:bg-transparent md:backdrop-blur-none",
    isOpen
      ? "fixed inset-0 z-40 flex flex-col p-4 bg-background/80 backdrop-blur-sm"
      : "hidden",
  )}
>
```
```tsx
// Sidebar.tsx:46 — current
{isOpen ? <X /> : <Menu />}
```
```tsx
// app/[locale]/ClientLayout.tsx:17-21 — current
<div
  className={`bg-primary-foreground w-full h-full rounded-lg p-4 pb-8 overflow-y-scroll	 ${
    isOpen ? "blur-sm" : ""
  }`}
>
```

- On mobile the overlay goes from `display: none` to fully shown in one frame, and back: a teleport on every open and close (once per navigation on a phone).
- The content panel gets `filter: blur(4px)` **and** the overlay above it has `backdrop-filter: blur(4px)`. That's two full-screen blurs, the first on a scrolling container (expensive on mobile Safari), and it snaps in.
- The Menu/X icon switches abruptly.

Constraint (settled in `docs/routing.md:21`): **the sidebar content is mounted once** and only restyled between the desktop column and the mobile overlay (one Lanyard socket, one set of sounds). Don't split it into two components.

## Target

The overlay stays mounted on mobile and toggles between visible and invisible with an opacity transition. `visibility` is included in the transition: per the CSS spec it stays `visible` for the whole interpolation when one of its endpoints is `visible`, so the fade-out is visible and the element becomes non-focusable and non-clickable afterwards, like `hidden` today.

```tsx
// Sidebar.tsx:27-36 — target
<div
  className={cn(
    "fixed inset-0 z-40 flex flex-col p-4 bg-background/80 backdrop-blur-sm",
    "transition-[opacity,visibility] ease-out",
    isOpen
      ? "visible opacity-100 duration-200"
      : "invisible opacity-0 pointer-events-none duration-150",
    "md:static md:z-auto md:h-full md:w-80 md:p-2 md:bg-transparent md:backdrop-blur-none",
    "md:visible md:opacity-100 md:pointer-events-auto md:transition-none",
  )}
>
```

```tsx
// Sidebar.tsx:46 — target (inside the existing Button)
<Menu
  aria-hidden
  className={cn(
    "absolute transition-[opacity,transform,filter] duration-200 ease-out motion-reduce:transform-none",
    isOpen ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0",
  )}
/>
<X
  aria-hidden
  className={cn(
    "absolute transition-[opacity,transform,filter] duration-200 ease-out motion-reduce:transform-none",
    isOpen ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]",
  )}
/>
```

```tsx
// ClientLayout.tsx:17-23 — target
<div className="bg-primary-foreground w-full h-full rounded-lg p-4 pb-8 overflow-y-scroll">
  {children}
</div>
```

Values: open 200ms, close 150ms (the exit is faster than the entrance), `ease-out` = `cubic-bezier(0.23, 1, 0.32, 1)` (plan 001). Icons: crossfade with scale 0.25 → 1 and `blur(4px)` → 0 over 200ms; under reduced motion only the opacity (and blur) change. The two icons are `absolute`: in a flex container centred on both axes (`Button size="icon"`), absolutely positioned children are centred too.

## Repo conventions to follow

- Classes composed with `cn` (`@/lib/utils`), already imported in `Sidebar.tsx:11`.
- The `md:` breakpoint separates desktop (static column) from mobile (overlay); keep that split.

## Steps

1. `Sidebar.tsx:27-36`: replace the `className` with the target (overlay always mounted; mobile and `md:` classes split as shown).
2. `Sidebar.tsx:46`: replace `{isOpen ? <X /> : <Menu />}` with the two stacked icons. Keep the `<span className="sr-only">` right after it as is.
3. `ClientLayout.tsx`: remove the `blur-sm` interpolation (target above), and remove `const { isOpen } = useMobileMenu();` and the `useMobileMenu` import, which are now unused. Also remove the two stray tab characters (`select-none	` line 15, `overflow-y-scroll	` line 18) from the class strings.

## Boundaries

- Do NOT split the sidebar into a desktop and a mobile component (one mount, `docs/routing.md:21`).
- Do NOT add a slide-in for the overlay (a pure fade is enough for a full-screen overlay; a slide would need the `--ease-drawer` curve and a structural redesign, which belongs to the direction session).
- Do NOT touch `contexts/menu-mobile.context.tsx`. Don't add body scroll lock or Escape handling here (separate follow-ups).
- Keep `"use client"` on `ClientLayout.tsx` and its name (a rename is out of scope).
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm build`.
- **Feel check** (DevTools device mode iPhone, or a real phone):
  - Tapping the burger: the overlay fades in over about 200ms, and the icon turns into an X with a soft blur/zoom crossfade.
  - Tapping a menu item: the overlay fades out faster (150ms) and the page is usable straight away.
  - Spam the burger 5 times quickly: the fade **retargets** from its current state, never restarts from zero, never flickers.
  - When the menu is closed, `Tab` never lands on an invisible menu link.
  - Behind the open overlay, the content is blurred **once** (by `backdrop-blur`), not twice.
  - Desktop (≥ 768px): the sidebar is identical to before (static column, no transition when resizing).
  - Reduced motion on: icons only crossfade (no zoom), and the overlay still fades.
  - Only one Lanyard socket: DevTools > Network > WS shows a single `api.lanyard.rest` connection, on mobile and desktop alike.
- **Done when**: no `hidden` toggle left on the sidebar, no `blur-sm` in `ClientLayout.tsx`, and the icon crossfades.

---

# 008 — Scale dropdown menus from their trigger with the strong ease-out

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Easing
- **Estimated scope**: 1 file (`components/ui/dropdown-menu.tsx`), 2 lines
- **Depends on**: 001

## Problem

```tsx
// components/ui/dropdown-menu.tsx:72-75 — current (DropdownMenuContent)
className={cn(
  "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  className,
)}
```
(same set of classes on `DropdownMenuSubContent`, line 55)

- The 95% zoom runs from the **centre** of the menu (default `transform-origin`), not from the trigger button. The theme menu (`components/theme-switch.tsx`, `align="end"`) seems to come out of nowhere.
- No timing function: `tailwindcss-animate` sets none, so the browser `ease` applies.

## Target

Add to **both** class strings (Content line 74 and SubContent line 55):

```
origin-[var(--radix-dropdown-menu-content-transform-origin)] ease-out
```

Radix exposes `--radix-dropdown-menu-content-transform-origin` on the content (computed from `side`/`align`). `ease-out` = `cubic-bezier(0.23, 1, 0.32, 1)` via plan 001, and thanks to `tailwindcss-animate` it also applies to `animation-timing-function`. Duration stays 150ms (default `animate-in`, within the dropdown budget of 150–250ms).

## Repo conventions to follow

- shadcn file: change classes only, keep the structure. Recent shadcn versions ship exactly this `origin-[…]` class. This aligns the file with upstream.

## Steps

1. Line 74: append ` origin-[var(--radix-dropdown-menu-content-transform-origin)] ease-out` to the end of the second string.
2. Line 55: append the same two classes to the end of the string.

## Boundaries

- Do NOT change zoom/slide values or `sideOffset`.
- Do NOT touch the menu items (`transition-colors` is correct).
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm build`.
- **Feel check**: sidebar footer, sun/moon button.
  - DevTools > Animations at 10%: the menu grows **from the corner closest to the button** (bottom right or top right depending on available space), not from its centre.
  - At normal speed, the opening feels immediate.
  - Reduced motion on (plan 001): fade only.
- **Done when**: both contents carry `origin-[var(--radix-dropdown-menu-content-transform-origin)]` and `ease-out`.

---

# 009 — Add an open-state chevron to the FAQ accordion

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: LOW
- **Category**: Purpose & state indication / Easing
- **Estimated scope**: 1 file (`components/ui/accordion.tsx`), about 8 lines
- **Depends on**: 001 (the accordion keyframes move to `var(--ease-out)` there)

## Problem

```tsx
// components/ui/accordion.tsx:28-37 — current
<AccordionPrimitive.Trigger
  ref={ref}
  className={cn(
    "flex flex-1 items-center justify-between py-4 font-medium transition-all",
    className,
  )}
  {...props}
>
  {children}
</AccordionPrimitive.Trigger>
```

- The FAQ (home page, `app/[locale]/page.tsx:61-84`) has **no indicator** of open/closed state or of the fact that it can be expanded (shadcn's default chevron was removed).
- `transition-all` on the trigger animates nothing useful.
- Note: the content's `height` keyframes (`accordion-down`/`up`) restart from zero on a quick double toggle. That's an accepted Radix limitation (rare action); don't fix it here.

## Target

```tsx
// accordion.tsx — target Trigger
<AccordionPrimitive.Trigger
  ref={ref}
  className={cn(
    "flex flex-1 items-center justify-between py-4 text-left font-medium [&[data-state=open]>svg]:rotate-180",
    className,
  )}
  {...props}
>
  {children}
  <ChevronDownIcon
    aria-hidden
    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-in-out motion-reduce:transition-none"
  />
</AccordionPrimitive.Trigger>
```

Values: 180° rotation over 200ms, `ease-in-out` = `cubic-bezier(0.77, 0, 0.175, 1)` (plan 001; movement that stays on screen), synced with the 200ms height animation. Under reduced motion: instant rotation (the state stays readable).

## Repo conventions to follow

- Radix icons are imported from `@radix-ui/react-icons` in the `ui/` primitives (`components/ui/dropdown-menu.tsx:8-12`), so use `ChevronDownIcon` from there.

## Steps

1. Add `import { ChevronDownIcon } from "@radix-ui/react-icons";` after the `AccordionPrimitive` import (line 7).
2. Replace the Trigger's `className` (line 31) with the target (drop `transition-all`, add `text-left` and `[&[data-state=open]>svg]:rotate-180`).
3. Add the `<ChevronDownIcon … />` after `{children}`.

## Boundaries

- Do NOT change `AccordionContent` or the keyframes (plan 001 handles their easing).
- Do NOT change the FAQ texts or structure in `app/[locale]/page.tsx`.
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm build`.
- **Feel check** on `/fr`, FAQ section:
  - Each question shows a chevron on the right. Opening it rotates the chevron upwards in sync with the content expanding.
  - Opening a second question closes the first, and both chevrons move at the same time.
  - Long question on mobile: the text stays left-aligned and the chevron doesn't shrink.
  - Reduced motion on: the chevron flips instantly.
- **Done when**: no `transition-all` in `accordion.tsx`, and the chevron reflects the state.

---

# 010 — Make the theme toggle icon swap actually animate, without scale(0)

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: LOW
- **Category**: Physicality / Purpose
- **Estimated scope**: 1 file (`components/theme-switch.tsx`), 2 lines
- **Depends on**: 001 (reduced-motion baseline that neutralises rotate/scale)

## Problem

```tsx
// components/theme-switch.tsx:25-26 — current
<SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
<MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
```
```tsx
// app/[locale]/layout.tsx:58-63 — deliberate, keep
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
```

`disableTransitionOnChange` (a deliberate choice: it stops every colour on the site from transitioning during a theme switch) injects `* { transition: none !important }` for the duration of the switch. So the icon's `transition-all` **never plays**: the swap snaps. What remains is dead code built on `scale(0)` (an object that appears from nothing), plus `transition-all`.

**Keyframe animations** aren't affected by that rule, and an animation restarts when an element goes from `display: none` to displayed.

## Target

```tsx
// theme-switch.tsx:25-26 — target
<SunIcon className="h-[1.2rem] w-[1.2rem] animate-in fade-in-0 zoom-in-50 spin-in-90 duration-200 ease-out dark:hidden" />
<MoonIcon className="hidden h-[1.2rem] w-[1.2rem] animate-in fade-in-0 zoom-in-50 spin-in-90 duration-200 ease-out dark:block" />
```

Values: entrance 200ms, from scale 0.5 (never 0) and a 90° rotation, `ease-out` = `cubic-bezier(0.23, 1, 0.32, 1)` (plan 001). The outgoing icon disappears immediately (`display: none`), which is acceptable for a 1.2rem icon. Under reduced motion (plan 001 baseline), fade only. Side effect, accepted: on the first full page load, the visible icon plays its entrance once (200ms, sidebar footer).

## Repo conventions to follow

- `tailwindcss-animate` syntax already used in `components/ui/dropdown-menu.tsx:74` (`animate-in fade-in-0 zoom-in-95`).
- The `dark:` variant targets the `.dark` class set by next-themes (`tailwind.config.ts:5`, `darkMode: ["class"]`).

## Steps

1. Line 25: replace the `SunIcon`'s `className` with the target.
2. Line 26: replace the `MoonIcon`'s `className` with the target (no more `absolute`, since only one icon is displayed at a time).

## Boundaries

- Do NOT remove `disableTransitionOnChange` from `layout.tsx`.
- Do NOT change the dropdown or its items.
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm build`.
- **Feel check**: sidebar footer.
  - Switch light → dark: the moon appears with a short rotation and zoom from half size. Dark → light: same for the sun.
  - The button doesn't change size or jump during the swap.
  - Choosing "System" while the system theme matches the current one: nothing moves (no `display` change).
  - Reduced motion on: the icon only fades in.
- **Done when**: no `scale-0` or `transition-all` in `theme-switch.tsx`, and the swap is visible.

---

# 011 — Ease the Presence card in and soften its content changes

- **Status**: TODO
- **Commit**: b7c1179
- **Severity**: LOW
- **Category**: Missed opportunity / Affordance
- **Estimated scope**: 3 files (`components/presence/Presence.tsx`, `PresenceActivity.tsx`, `PresenceListening.tsx`), about 15 lines
- **Depends on**: 001

## Problem

The Presence card shows Lucas's live Discord activity (Spotify or a game) in the sidebar footer.

```tsx
// components/presence/Presence.tsx:20-30 — current
const presence = selectPresence(status);
if (presence.kind === "nothing") return null;

return (
  <div className="pb-4">
    {presence.kind === "playing" && <PresenceActivity presence={presence} />}
    {presence.kind === "listening" && (
      <PresenceListening presence={presence} />
    )}
  </div>
);
```
```tsx
// PresenceActivity.tsx:18 and PresenceListening.tsx:20 — current
<Card className="w-full cursor-pointer">
```

- The card **pops in** when the Lanyard socket connects (client side, after hydration), and **teleports** at every change (new song, new game, playing ↔ listening).
- `cursor-pointer` on a card that is neither a link nor a button: a click affordance that doesn't keep its promise.

## Target

- Keyed entrance on the wrapper by **kind**: a full entrance when the card appears or changes type.
- Fade-in of the inner content keyed by **song or game**: the frame stays still, only the content changes softly.

```tsx
// Presence.tsx — target
const presence = selectPresence(status);
if (presence.kind === "nothing") return null;

return (
  <div
    key={presence.kind}
    className="pb-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out"
  >
    {presence.kind === "playing" && <PresenceActivity presence={presence} />}
    {presence.kind === "listening" && (
      <PresenceListening presence={presence} />
    )}
  </div>
);
```
```tsx
// PresenceActivity.tsx — target excerpts
<Card className="w-full">
  <CardContent className="p-4">
    <div
      key={`${name}·${details ?? ""}`}
      className="flex items-center space-x-4 animate-in fade-in-0 duration-200 ease-out"
    >
```
```tsx
// PresenceListening.tsx — target excerpts
<Card className="w-full">
  <CardContent className="p-4">
    <div
      key={`${song}·${artist}`}
      className="flex items-center space-x-4 animate-in fade-in-0 duration-200 ease-out"
    >
```

Values: entrance 200ms, `translateY(0.25rem)` → 0 (`slide-in-from-bottom-1`) plus fade, `ease-out` = `cubic-bezier(0.23, 1, 0.32, 1)` (plan 001). Content change: fade only, 200ms. Under reduced motion (plan 001 baseline): fades only, no translation. Key-driven keyframes are fine here: changes are a few minutes apart, never rapid.

## Repo conventions to follow

- `tailwindcss-animate` syntax (`animate-in fade-in-0 slide-in-from-…`) as in `components/ui/dropdown-menu.tsx:74`.
- The selection logic (`select-presence.ts`) is a tested pure function. **Don't touch it**: keys are derived in the components.

## Steps

1. `Presence.tsx`: add `key={presence.kind}` and the animation classes to the wrapper `div` (target).
2. `PresenceActivity.tsx:18`: remove `cursor-pointer`. Line 20: add `key={\`${name}·${details ?? ""}\`}` and `animate-in fade-in-0 duration-200 ease-out` to the `div className="flex items-center space-x-4"`.
3. `PresenceListening.tsx:20`: remove `cursor-pointer`. Line 22: add `key={\`${song}·${artist}\`}` and the same classes.

## Boundaries

- Do NOT modify `select-presence.ts` or its tests.
- Do NOT add equalizer bars, a "live" dot, or a Spotify link (personality ideas for the direction session; see §3 of the audit).
- Do NOT change the `useLanyard` connection (one socket, `docs/routing.md:21`).
- If the code differs from the commit stamp, STOP and report.

## Verification

- **Mechanical**: `pnpm lint`, `pnpm test` (`select-presence.test.ts` unchanged and passing), `pnpm build`.
- **Feel check** (needs live Discord activity; Lucas starts Spotify):
  - Reload `/fr`: once the socket connects, the card fades in and rises 4px instead of appearing abruptly.
  - Skip to the next track: the card frame stays still and the artwork and title fade in.
  - Start a game (Spotify off): the card does a full entrance (change of type).
  - The cursor stays an arrow over the card.
  - Reduced motion on: fades only, no rise.
  - Testing without Discord: temporarily force a `presence` value in `Presence.tsx` locally, **without committing it**.
- **Done when**: the card never pops in or teleports, and `cursor-pointer` is gone from both cards.

---

## 5. Execution order and dependencies

| # | Plan | Severity | Depends on | Files | Status |
| --- | --- | --- | --- | --- | --- |
| 001 | Motion tokens, hover gating, reduced-motion baseline | MEDIUM (foundation) | — | `styles/globals.css`, `tailwind.config.ts` | TODO |
| 002 | MDF 2025: frame-rate independent physics, no allocations | HIGH | — | `master-dev-scene.tsx` | TODO |
| 003 | MDF 2025: pause, reduced motion, user-initiated sound | HIGH | 002 | `master-dev-scene.tsx`, `certificate.tsx`, `lib/use-prefers-reduced-motion.ts`, `messages/*.json` | TODO |
| 004 | MDF 2025: far plane, drag ≠ throw, spawn, shadows | MEDIUM/LOW | 002, 003 | `master-dev-scene.tsx` | TODO |
| 005 | Project/Video cards: working hover | MEDIUM | 001 | `ProjectCard.tsx`, `VideoCard.tsx` | TODO |
| 006 | Menu item: hover/press/focus | MEDIUM | 001 | `MenuItem.tsx` | TODO |
| 007 | Mobile menu: fade, single blur, icon crossfade | MEDIUM | 001 | `Sidebar.tsx`, `ClientLayout.tsx` | TODO |
| 008 | Dropdown: origin and easing | MEDIUM | 001 | `ui/dropdown-menu.tsx` | TODO |
| 009 | Accordion: chevron | LOW | 001 | `ui/accordion.tsx` | TODO |
| 010 | Theme toggle: real icon swap | LOW | 001 | `theme-switch.tsx` | TODO |
| 011 | Presence: entrance and soft changes | LOW | 001 | `components/presence/*.tsx` | TODO |

**Recommended order**

1. **Two independent tracks**, which can run in parallel (no shared files):
   - **Track A, UI**: 001 → then 005, 006, 007, 008, 009, 010, 011 in any order (each touches its own files). Suggested order by leverage: 005 → 006 → 007 → 008 → 009 → 010 → 011.
   - **Track B, 3D scene**: 002 → 003 → 004 (same file, strictly sequential).
2. 003 adds a hook in `lib/` and dictionary keys. If 011 or another future plan needs `usePrefersReducedMotion`, reuse it instead of duplicating it.
3. As GitHub issues: one issue per plan, label `ready-for-agent` (triage vocabulary from `docs/agents/triage-labels.md`), with "Depends on #…" in the body for 003/004 and for 005–011 → 001.

**Before execution**: if the visual direction (session `/impeccable init` + `/grill-with-docs`) changes the tokens or the motion personality (for example a bouncier "playful" spring for skate/surf moments), update the values in 001 **before** running 005–011, since they all inherit from it.
