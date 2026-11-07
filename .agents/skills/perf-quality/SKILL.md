---
name: perf-quality
description: Expert reviewer for Shopify theme performance (runtime, loading speed), SEO, and accessibility. Use this skill when auditing code for performance bottlenecks, forced reflows, memory leaks, rAF overhead, LCP/CLS/INP issues, and WCAG compliance.
---

# Performance & Quality Reviewer

Act as a senior performance engineer reviewing Shopify theme code for runtime performance, loading speed, SEO, and accessibility. Flag issues proactively — don't wait to be asked.

---

## Part 1: Runtime Performance

### Force Reflow / Forced Synchronous Layout

**The #1 jank-causing mistake.** Reading a layout property immediately after writing to the DOM forces the browser to recalculate layout synchronously.

**Dangerous read properties** (trigger layout if DOM is dirty):
`offsetTop`, `offsetLeft`, `offsetWidth`, `offsetHeight`, `scrollTop`, `scrollLeft`, `scrollWidth`, `scrollHeight`, `clientTop`, `clientLeft`, `clientWidth`, `clientHeight`, `getComputedStyle()`, `getBoundingClientRect()`

**Rules:**

1. Never interleave reads and writes in a loop
2. Batch all reads first, then all writes
3. Use `requestAnimationFrame` only for writes — reads should happen before rAF
4. In slider/carousel scroll callbacks, avoid reading layout per event — cache sizes and reuse the position data the slider already tracks
5. **Wrap UI click handlers that trigger slider navigation (e.g. `scrollTo()` on the slider list) in `requestAnimationFrame`.** This defers style invalidations to the render cycle, preventing third-party scripts or MutationObservers from synchronously forcing a double layout recalculation (Layout Thrashing) in the middle of the click event.

**Bad:**

```javascript
elements.forEach((el) => {
  const height = el.offsetHeight; // READ → forces layout
  el.style.height = height + 10 + "px"; // WRITE → invalidates layout
  // Next iteration: READ forces layout AGAIN
});
```

**Good:**

```javascript
const heights = elements.map((el) => el.offsetHeight); // All reads first
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + "px"; // All writes second
});
```

### Guard DOM Writes

Never write to the DOM if the value hasn't changed. Every DOM mutation (even redundant ones) can trigger style recalculation.

```javascript
// BAD — writes every frame
_updateColorScheme() {
  this.classList.remove(this.cfg.colorScheme, this.cfg.stickyColorScheme);
  this.classList.add(useSticky ? this.cfg.stickyColorScheme : this.cfg.colorScheme);
}

// GOOD — guard + single mutation
_updateColorScheme() {
  const target = useSticky ? this.cfg.stickyColorScheme : this.cfg.colorScheme;
  if (this._currentScheme === target) return;
  this.classList.replace(this._currentScheme, target);
  this._currentScheme = target;
}
```

**Apply this pattern to:**

- `setAttribute` / `removeAttribute` (especially `disabled`)
- `classList.add/remove/toggle`
- `style.*` property changes
- `textContent` / `innerHTML`
- `dataset.*` changes

### rAF Best Practices

1. **Never do heavy work inside rAF** — keep it under 4ms to hit 60fps
2. **One rAF per frame** — deduplicate with a dirty flag:
   ```javascript
   _scheduleUpdate() {
     if (this._rafPending) return;
     this._rafPending = true;
     requestAnimationFrame(() => {
       this._rafPending = false;
       this._doUpdate();
     });
   }
   ```
3. **Cancel on destroy** — always `cancelAnimationFrame` in cleanup
4. **Don't start rAF loops for static content** — use IntersectionObserver to start/stop

### CSS Containment

Use `contain` to tell the browser that style/layout changes inside an element cannot affect siblings or ancestors.

| Value                         | Effect                                           |
| ----------------------------- | ------------------------------------------------ |
| `contain: layout style paint` | Full isolation — best for animated components    |
| `contain: content`            | Shorthand for `layout paint style` (not `size`)  |
| `content-visibility: auto`    | Skips rendering for off-screen elements entirely |
| `content-visibility: hidden`  | Skips rendering entirely (like `display: none` but keeps element in DOM) |

**Use on:** carousels, sticky headers, marquees, parallax components, accordions, dialogs

#### The `content-visibility` Console Warning Trap

If you see the Chrome DevTools warning: **"Rendering was performed in a subtree hidden by content-visibility"**, it means an element is using `content-visibility: hidden` (like Shopify's native `<shopify-account>` login dialog) but JavaScript is synchronously reading its layout (`getBoundingClientRect()`, etc.).
- **Who causes it?** Often browser extensions (like Dashlane searching for hidden password inputs) or third-party Shopify Apps (like Kwift) using global `MutationObserver`s.
- **Is it a bug?** No. It's just a performance warning that the browser had to bypass the `content-visibility` optimization to satisfy the layout read. If it's caused by external extensions/apps on a locked Web Component, safely ignore it. Do not attempt to "fix" standard class toggles just to silence this warning.

**Individual values:**
- `layout` — internal layout is isolated; creates containing block for `absolute`/`fixed` children
- `style` — scopes CSS counters / `quotes`; lightweight, no visual side-effects
- `paint` — clips visual overflow (like `overflow: clip`); creates new stacking context

**Nesting is safe.** Multiple nested `contain: layout style paint` boundaries give the browser more specific isolation hints. No conflicts.

**Caveats:**
- `contain: style` prevents CSS counters from leaking — doesn't prevent inherited properties from cascading into the element
- `contain: paint` implies visual clipping but does **NOT** create a scroll container (unlike `overflow: hidden`). This is critical for ViewTimeline — see below

#### Containment vs `overflow: hidden` — ViewTimeline Implications

`overflow: hidden` and `contain: paint` both clip visual overflow, but they behave differently for scroll-driven animations:

| CSS Property | Creates scroll container? | Clips overflow? | Blocks ViewTimeline? |
|---|---|---|---|
| `overflow: visible` (default) | ❌ | ❌ | ❌ |
| `overflow: hidden` | ✅ **Yes** | ✅ | ✅ **Yes — breaks ViewTimeline** |
| `overflow: clip` | ❌ | ✅ | ❌ |
| `overflow: auto / scroll` | ✅ | ✅ | ✅ **Yes** |
| `contain: paint` | ❌ | ✅ | ❌ |
| `contain: layout style paint` | ❌ | ✅ | ❌ |

**Key insight:** `ViewTimeline` tracks an element's visibility in its **nearest scroll container ancestor**. `overflow: hidden` creates a scroll container; `contain: paint` does not. So `contain: layout style paint` can replace `overflow: hidden` when you need visual clipping without breaking `ViewTimeline`.

**Example:** A carousel viewport originally used `overflow: hidden` which blocked ViewTimeline for parallax inside slides. Switching to `contain: layout style paint` preserved visual clipping while allowing ViewTimeline to track against the page viewport.

**Note:** ViewTimeline resolves its scrollport **once at creation time**. Toggling overflow CSS after animation creation won't update the binding — you must `.cancel()` and recreate.

### Style Recalculation

The most common Shopify theme bottleneck. Triggers:

- Class changes (`classList.*`)
- Attribute changes that match CSS selectors (`[disabled]`, `[data-*]`)
- `:hover` / `:focus` state changes on elements with many descendants
- Custom property (`--var`) changes that cascade to many children

**Mitigations:**

1. Guard all class/attribute writes (see above)
2. Use CSS containment to scope recalculation
3. Minimize selector complexity — avoid `.parent .deeply .nested .child`
4. Prefer `classList.replace()` over `remove()` + `add()`

### The Global `:has()` Trap

**The deadilest style recalculation bug.** Modern rendering engines (Chrome/Blink) cannot effectively optimize DOM mutations against top-level relational selectors. 

**Bad:**
```scss
// Any inline-style transform on descendant elements nested deep inside .main triggers document-wide invalidations!
body:has(.my-component) { padding-top: 50px; }
```

**Good:**
```liquid
// Server-side inject explicit body classes during SSR directly in `theme.liquid`
<body class="{% if has_component %}body--has-my-component{% endif %}">
```
*Rule*: Never use `:has()` on `html`, `body`, or massive wrappers like `.main`. The browser treats any inline-style change (like a carousel dragging via `transform`) inside the relational tree as a full layout mutation, recalculating thousands of nodes repeatedly at 100ms+ per frame.

### Flexbox Shrink vs Implicit Bounds Trap

When building global layout grids like `[data-width="fill"]` (flex: 1 1 0%), browsers strictly respect the internal sizes of nested `.marquee` or `max-content` elements. 

**Bad:**
```css
[data-width="fill"] { flex: 1 1 0%; min-width: unset; } // Resolves to `auto`, completely ignoring 0% basis in favor of intrinsic child content width!
```

**Good:**
```css
[data-width="fill"] { flex: 1 1 0%; min-width: 0px; } // Natively overrides the `auto` boundary trap, strictly wrapping around user definitions without blowing out sibling limits
```

### WAAPI "Animation Stacking" vs Elasticity Momentum

For things like pointers/cursors, constantly firing `element.animate()` without calling `cancel()` creates a massive stacking leak (creating 60+ new animation instances per second). However, this stacking physically overlays interpolation vectors—meaning the continuous compounding WAAPI calls overlap to create **ultra-smooth, organic "momentum" trails** that CSS transitions physically cannot replicate due to native path replacement mechanics!

If a designer strictly requires organic WAAPI momentum (ignoring the 1-2ms style recalculation penalty on each rAF tick):
- Do **not** call `this._anim.cancel()` immediately! Let the WAAPI frames stack on top of each other slightly.
- **You must implement severe garbage pruning** via `setTimeout` explicitly scrubbing `a.playState === 'finished'`, otherwise the GPU rendering threads will completely lock up over 20-30 seconds of cursor movement as tracking layers reach the hundreds!

### The `will-change` Typography Bug (macOS)

Adding `will-change: transform, opacity` (or filter) to text elements forces them onto a separate hardware-accelerated compositor layer.
On macOS (specifically WebKit/Blink), this **disables subpixel anti-aliasing** for that layer.
- **The Symptom:** Text suddenly appears thinner, lighter in weight, or blurry while animating, and then "snaps" back to full thickness when the animation completes and `will-change` is removed.
- **The Fix:** Remove `will-change` entirely from text components (like `HighlightTextWImg`) unless absolutely necessary for frame-rate survival. Modern browsers can animate `transform` and `opacity` efficiently without forced layer promotion. If you must use it, apply it ONLY during the active animation window and remove it immediately after.

### Long Tasks & Main Thread Yielding

Massive synchronous loops (like serializing `outerHTML` for every section on a page to cache it) can block the main thread for 50ms+, causing INP (Interaction to Next Paint) failures and dropped frames.

**Fix: Yield to the main thread inside the loop using `setTimeout`.**
This breaks the monolithic 50ms block into tiny 2ms chunks, allowing the browser to paint frames and handle user inputs in between iterations.

```javascript
// BAD: Blocks main thread for 45ms
#cachePageSections() {
  for (const section of document.querySelectorAll('.shopify-section')) {
    this.#cache.set(section.id, section.outerHTML); // synchronous serialization
  }
}

// GOOD: Yields to main thread, zero freezing
async #cachePageSections() {
  for (const section of document.querySelectorAll('.shopify-section')) {
    this.#cache.set(section.id, section.outerHTML);
    await new Promise(resolve => setTimeout(resolve, 0)); // yield
  }
}
```

### Memory Leaks

Common leak patterns in custom elements:

1. **Event listeners not removed:**

   ```javascript
   // BAD
   connectedCallback() {
     window.addEventListener('resize', this.onResize);
   }
   // Forgot disconnectedCallback!

   // GOOD
   disconnectedCallback() {
     window.removeEventListener('resize', this.onResize);
   }
   ```

2. **Observer not disconnected:**

   ```javascript
   disconnectedCallback() {
     this._intersectionObserver?.disconnect();
     this._resizeObserver?.disconnect();
     this._mutationObserver?.disconnect();
   }
   ```

3. **Slider/library instances not destroyed:**

   ```javascript
   disconnectedCallback() {
     this.cleanupFunctions.forEach(fn => fn());
     this.sliderApi?.destroy?.();
     this.sliderApi = null;
   }
   ```

4. **Closures retaining DOM references** — use WeakRef for optional references
5. **setInterval without clearInterval** — always store and clear IDs

### Scroll-Linked Performance

The scroll dispatcher pattern fires callbacks on every frame. Subscribers must:

1. **Exit early** if nothing changed (guard clauses)
2. **Never read layout** inside scroll handlers
3. **Never trigger style recalc** (no class changes) unless absolutely necessary
4. **Use `will-change: transform`** on elements that transform during scroll

### Scroll-Driven Animations (ViewTimeline)

**Prefer native `ViewTimeline` for scroll-linked animations.** In Chrome/Edge 115+, animations bound to a `ViewTimeline` run entirely **off the main thread** — zero JS cost per frame, no rAF overhead, no style recalculation.

**Pattern: hybrid ViewTimeline with Anime.js fallback**

```javascript
_init() {
  if (typeof ViewTimeline !== 'undefined') {
    this._initViewTimeline();
  } else {
    this._initAnimejs();
  }
}

_initViewTimeline() {
  this._anim = this._inner.animate(
    [
      { transform: 'translateY(-20%) scale(1.2)' },
      { transform: 'translateY(0%)   scale(1.2)' },
    ],
    {
      fill: 'both',
      timeline: new ViewTimeline({ subject: this, axis: 'block' }),
    },
  );
  this._isNative = true;
}

_initAnimejs() {
  this._anim = waapi.animate(this._inner, {
    translateY: ['-20%', '0%'],
    scale: [1.2, 1.2],
    ease: 'linear',
    composition: 'replace',
    autoplay: onScroll({ target: this, sync: true }),
  });
  this._isNative = false;
}
```

**Cleanup rules:**
- Native WAAPI animations use `.cancel()` (not `.revert()` — that's Anime.js-specific)
- Use `commitStyles()` before `cancel()` to bake the current transform into inline style and avoid visual snapping (critical for slideshow slide transitions)
- Clear committed inline styles before creating a new animation: `this._inner.style.transform = ''`

**ViewTimeline subject selection:**
- The `subject` determines which element's viewport visibility drives progress
- Use `this` (the component itself) when possible — simplest
- Use `this.closest('section')` when `this` is in a complex layout that confuses tracking
- Subject must NOT be inside an `overflow: hidden` ancestor (see CSS Containment above)

**Smooth-scroll libraries:**
- If a virtual smooth-scroll library (e.g. Lenis) is ever added, `ViewTimeline` may stop working because native scroll is intercepted; fall back to a JS position-based animation in that case

---

## Part 2: Loading Speed

### Critical Rendering Path

1. **Inline critical CSS** — use `{% style %}` for above-fold component styles (scoped)
2. **Defer non-critical JS** — use `defer` attribute or dynamic `import()`
3. **Preload key assets** — fonts, hero images
4. **Avoid render-blocking resources** — no synchronous scripts in `<head>`

### Image Optimization (Shopify-specific)

1. **Always specify width in `image_url`:**
   ```liquid
   {{ image | image_url: width: 800 | image_tag }}
   ```
2. **Use `sizes` attribute** for responsive images:
   ```liquid
   sizes: '(min-width: 990px) 33vw, 50vw'
   ```
3. **Lazy load below-fold images** — `loading="lazy"` (default in Shopify)
4. **Eager load LCP image** — `loading="eager"` for the first visible image
5. **Prefer WebP/AVIF** — Shopify CDN serves these automatically

### Video Optimization

1. **`preload="none"`** for below-fold videos
2. **Target < 2MB** for background videos
3. **Use IntersectionObserver** to play/pause based on visibility
4. **Never autoplay with sound** — blocks page load on mobile

### JavaScript Loading

1. **Per-section scripts** — load each component's JS only in the section that needs it, deferred:
   ```liquid
   <script src="{{ 'my-component.js' | asset_url }}" defer="defer"></script>
   ```
   Keep shared helpers in a small number of modules; do not inline large scripts into `theme.liquid`.
2. **Keep shared CSS lean** — everything in `{% stylesheet %}` ships on every page; move large or template-specific styles into `assets/sc_*.css` loaded by the section, and keep `critical.css` to above-the-fold essentials
3. **Avoid synchronous data parsing** in constructors — defer to `connectedCallback`

### Deferred Interaction and INP

Deferral is only a win when the first action remains correct:

1. Test with the custom element undefined and the module network request delayed.
2. Distinguish definition from readiness; require an idempotent direct-prepare path for idle/viewport-initialized APIs.
3. Replay only discrete JS-owned events and scope replay to the actual controls.
4. Preserve native values for input/change and submit through `requestSubmit()`.
5. Wait for downstream event consumers before replaying a producer action.
6. Keep native navigation/details/select/scroll fallbacks live.
7. Treat pointer drag as non-replayable; use eager loading or a real native scrolling fallback.
8. Recover current hover/focus after presence-loaded delegation attaches.

Avoid heavy initialization inside the captured event. Start asset activation synchronously, then resolve readiness asynchronously so the browser can paint the pending state.

### Fonts

1. **`font-display: swap`** — always, prevents invisible text during load
2. **Preload primary font** — use `<link rel="preload" as="font" crossorigin>`
3. **Limit font variants** — each weight/style is a separate file download
4. **Use system fallback stack** — define proper fallback fonts

---

## Part 3: SEO

### HTML Semantics

1. **Single `<h1>` per page** — section headings should be `<h2>`+
2. **Heading hierarchy** — never skip levels (h1 → h3)
3. **Semantic elements** — use `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
4. **Structured data** — JSON-LD for products, articles, breadcrumbs

### Meta Tags

1. **Unique `<title>`** per page — include brand name
2. **Meta description** — 150-160 chars, compelling, unique per page
3. **Canonical URL** — prevent duplicate content
4. **Open Graph / Twitter cards** — for social sharing

### Content

1. **Alt text on all images** — descriptive, not keyword-stuffed
2. **Internal linking** — breadcrumbs, related products, related articles
3. **URL structure** — clean, readable, include keywords
4. **Mobile-first** — Google indexes mobile version

### Performance as SEO

Core Web Vitals directly impact rankings:

- **LCP < 2.5s** — optimize hero image/video loading
- **CLS < 0.1** — set explicit dimensions on images/videos, avoid layout shifts
- **INP < 200ms** — keep event handlers fast, avoid forced reflow

---

## Part 4: Accessibility (WCAG 2.1 AA)

### Interactive Elements

1. **All clickable elements need `role` + keyboard support:**
   - Buttons: `<button>` (not `<div onclick>`)
   - Links: `<a href>` (not `<span onclick>`)
   - Custom controls: `role="button"` + `tabindex="0"` + keydown handler
2. **Focus indicators** — never `outline: none` without a visible alternative
3. **Focus trapping** — in modals/drawers, trap focus inside
4. **Skip navigation** — hidden link to skip to `<main>`

### ARIA

1. **`aria-label`** on icon-only buttons (e.g., close, hamburger, cart)
2. **`aria-expanded`** on toggles (accordion, dropdown, drawer)
3. **`aria-hidden="true"`** on decorative elements (icons inside labeled buttons)
4. **`aria-live="polite"`** on dynamic content areas (cart count, notifications)
5. **`role="list"` / `role="listitem"`** when using non-list elements for lists

### Media

1. **Alt text** — always present, empty `alt=""` for decorative images
2. **Video captions** — provide `<track>` for video content
3. **Reduced motion** — respect `prefers-reduced-motion`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

### Color & Contrast

1. **4.5:1 ratio** for normal text, **3:1** for large text
2. **Don't rely on color alone** — use icons, patterns, or text labels too
3. **Test with color scheme switching** — light/dark modes must both meet contrast

### Forms

1. **`<label>` for every input** — associated via `for`/`id`
2. **Error messages** linked via `aria-describedby`
3. **Required fields** marked with `aria-required="true"`
4. **Autocomplete attributes** on address/payment fields

---

## Review Checklist

When reviewing any code change, check:

### Performance

- [ ] No forced reflow (read-after-write)
- [ ] DOM writes are guarded (only write if value changed)
- [ ] rAF work < 4ms
- [ ] Event listeners cleaned up in `disconnectedCallback`
- [ ] Observers disconnected on destroy
- [ ] Slider/library instances destroyed on cleanup
- [ ] No `setInterval` without `clearInterval`
- [ ] CSS containment on animated/isolated components
- [ ] Images use `image_url: width:` with appropriate size
- [ ] Cold first click/keydown/input/change/submit is handled or has a native fallback
- [ ] Deferred controller readiness includes nested/downstream consumers
- [ ] Pointer drags are eager or retain native scrolling behavior

### SEO

- [ ] Proper heading hierarchy
- [ ] Alt text on images
- [ ] Meta title/description
- [ ] Semantic HTML elements

### Accessibility

- [ ] Interactive elements are keyboard accessible
- [ ] ARIA attributes on dynamic UI
- [ ] Focus management in modals/drawers
- [ ] Color contrast meets WCAG AA
- [ ] Respects `prefers-reduced-motion`
