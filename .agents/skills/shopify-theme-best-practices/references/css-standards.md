# CSS Standards

Ichi uses **modern vanilla CSS + CSS custom properties**. There is no CSS framework and no CSS build step: the files in `assets/` and the `{% stylesheet %}` / `{% style %}` tags in Liquid are what ships.

---

## 1. Where CSS lives

| Layer | Location | Loaded | Use for |
| :--- | :--- | :--- | :--- |
| Global tokens | `snippets/css-variables.liquid` (`{% style %}`, rendered in `layout/theme.liquid`) | Every page, inline | `:root` custom properties driven by **theme settings** (colors, fonts, radius, page width, spacing) |
| Critical base | `assets/critical.css` | Every page, preloaded | Reset, base typography, layout primitives (`.page-width`, grid/stack helpers), utility classes such as `.visually-hidden` |
| Component | `{% stylesheet %}` inside the block / snippet / section | Every page (Shopify bundles all `{% stylesheet %}` tags into one file) | Small or widely used blocks and snippets |
| Section-specific | `assets/sc_<name>.css`, loaded with `{{ 'sc_<name>.css' \| asset_url \| stylesheet_tag }}` inside the section | Only when the section is on the page | Large sections, or sections used on few templates (product media, cart drawer, facets…) |
| Per-instance values | `{% style %}` inside the block/section, scoped by `#id` | Inline, per instance | CSS custom properties from **block/section settings** (padding, gap, colors per instance) |

Rules:
- `{% stylesheet %}` is **not** per page: everything in it ships on every page. If a component is heavy and only appears on a few templates, use a section asset file instead.
- `{% stylesheet %}` and `{% javascript %}` cannot contain Liquid. Put setting-driven values in a `{% style %}` tag as custom properties, and read them in the static CSS.
- Do not add a new global stylesheet for one component. Do not duplicate rules between `critical.css` and components.

---

## 2. Custom properties

- **Settings → variables, static CSS → reads variables.** Liquid only outputs custom properties; selectors and declarations stay static.
  ```liquid
  {% style %}
    #{{ block_id }} {
      --heading-margin-block: {{ block.settings.margin }}px;
    }
  {% endstyle %}
  ```
  ```css
  .heading { margin-block: var(--heading-margin-block, 0); }
  ```
- **Naming:** `--<component>-<property>` for component variables (`--icon-size`, `--social-radius`); global tokens use the Skeleton names (`--color-background`, `--color-foreground`, `--font-primary--family`, `--page-width`).
- **Colors are full values** (`#rrggbb`, `rgb()`), not the Dawn `r, g, b` triplet. For opacity use `color-mix()`:
  ```css
  border-color: color-mix(in srgb, var(--color-foreground) 15%, transparent);
  ```
  Never write `rgba(var(--color-foreground), 0.15)`.
- Always give `var()` a sensible fallback when the variable comes from an optional setting.

---

## 3. Modern CSS features (use them)

All of these are supported by the browsers the Theme Store requires:
- **Nesting** for component states and children, kept shallow (max 2–3 levels).
- **`@layer`** to order reset → base → components → utilities, so component rules do not need extra specificity.
- **`:has()`, `:is()`, `:where()`** instead of JS for parent/state styling. Use `:where()` to keep reset/base specificity at zero.
- **Logical properties** (`margin-block`, `padding-inline`, `inset-inline-start`) for RTL support.
- **`clamp()`** for fluid type/spacing; **container queries** (`@container`) for blocks whose layout depends on their slot rather than the viewport.
- **`color-mix()`** for tints and transparency.

---

## 4. Selectors and specificity

- Scope every component under its root class (`.icon-block .icon-block__media`). BEM-style class names: `.block`, `.block__element`, `[data-variant='x']` for variants driven by settings.
- Use `data-*` attributes (from settings) for variants instead of generating class names in Liquid.
- No `!important` (except utilities such as `.visually-hidden`), no ID selectors in static CSS (IDs only in `{% style %}` to scope per-instance variables).
- Do not add `div:empty { display: none }` or similar global rules that hide merchant content.

---

## 5. Units and breakpoints

- **Design frames: 1920px desktop, 393px mobile. Root font-size is fluid, `1rem = 16px` at both frames.** Write sizes in `rem` as `px-in-design / 16` (a 24px heading is `1.5rem`). Settings entered in px are converted the same way in Liquid: `{{ settings.x | divided_by: 16.0 }}rem`.
  - The root rule lives in `assets/critical.css` only; components never set `html` font-size:

    | Viewport | Root font-size |
    | :--- | :--- |
    | ≥ 1920px | `100%` (16px) |
    | 992–1919px | `clamp(75%, 100vw * 16 / 1920, 100%)` (12 → 16px) |
    | ≤ 991.98px | `clamp(87.5%, 100vw * 16 / 393, 112.5%)` (14 → 18px, 16px at 393) |

  - Limits are in `%`, never `px`, so the visitor's browser font-size preference still applies (WCAG 1.4.4). The caps avoid tiny text on small laptops and oversized text on tablets.
  - Line-height and letter-spacing in `em` (unitless line-height is fine) so they follow the font size.
  - Typography styles that differ on mobile get a `-mb` token (`--typo-h1-size-mb`) applied in the `max-width: 991.98px` query.
- **Breakpoints** (desktop / mobile split at 992px):
  ```css
  @media screen and (max-width: 991.98px) { /* mobile + tablet */ }
  @media screen and (min-width: 992px)    { /* desktop */ }
  ```
  Use these two values only; do not introduce 750px/990px queries. Container queries are fine for slot-dependent layouts.
- Use `px` for borders/hairlines, `rem` for type and spacing, `%`/`fr`/`min()` for layout.

---

## 6. Shipping and performance

- **Do not minify** theme CSS. Theme Store requirements forbid minified `.css`/`.js` in the theme (except third-party libraries). Shopify's CDN serves assets compressed; measure Lighthouse on the theme as shipped.
- Keep `critical.css` small: only what is needed above the fold on every template.
- Fonts via `font_face` with `font_display: 'swap'`; preload only the base variant.
- Prefer `transform`/`opacity` for animation; respect `prefers-reduced-motion`.
