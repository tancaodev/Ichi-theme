---
name: shopify-theme-best-practices
description: >-
  Provides development guidelines and best practices for the Ichi Shopify theme (built on Shopify Skeleton).
  Use when creating or refactoring Liquid sections, blocks or snippets, writing CSS (vanilla CSS + custom
  properties, critical.css, {% stylesheet %}), writing theme JavaScript (vanilla ES6, Web Components), or reviewing pull requests.
---

# Ichi Theme Best Practices

Ichi is built on **Shopify Skeleton** (not Dawn) and targets the **Shopify Theme Store**. These guidelines keep the code original, portable, fast and compliant. For the full submission checklist, use the `theme-store-requirements` skill.

---

## Quick Reference / Core Rules

| Domain | Key Rules |
| :--- | :--- |
| **General** | • Base is **Skeleton**. Dawn is reference only (`_reference/dawn`): read for behavior, **never copy code**.<br>• **No build tools**: vanilla CSS and native ES6 ship as written. Do **not** minify theme CSS/JS (Theme Store rule).<br>• Every PR passes `shopify theme check` with 0 errors (CI enforces it). |
| **Liquid** | • **Merchant toggles**: add a setting to the section/block schema.<br>• **Dev toggles**: define a Liquid variable (`{% assign ... %}`).<br>• **Self-contained components**: sections/blocks own their markup, settings, styles and logic.<br>• **New file names**: `_` as separator (no `-`); prefixes: sections `sc_`, theme blocks `blck_`, private blocks `_blck_`, HTML-rendering snippets `snip_` (Skeleton's original files keep their names).<br>• **Native Shopify**: translation strings (`\| t`), locale-aware URLs (`routes.*`), `{{ product.url \| within: collection }}`.<br>• **Snippet docs**: `{% doc %}` header with `@param` and `@example` (see `liquid-doc-comments` skill). |
| **CSS** | • **Vanilla CSS + custom properties**. Settings → `{% style %}` variables; static CSS reads them.<br>• Where CSS lives: global tokens in `css-variables.liquid`, base in `critical.css`, components in `{% stylesheet %}`, large/rare sections in `assets/sc_*.css` loaded by the section.<br>• Colors as full values + `color-mix()` for opacity (no Dawn `rgb` triplets).<br>• Modern CSS: nesting, `@layer`, `:has()`, logical properties, `clamp()`, container queries. |
| **JavaScript** | • **HTML/CSS first**: native `<details>/<summary>`, `<dialog>` instead of JS toggles.<br>• **Modular**: single-purpose file per component, loaded with `defer` only where used; inline `<script>` only if tiny and used once.<br>• **Flat code**: early returns; avoid nested `if`.<br>• **Modern ES6**: `const`/`let`, `async/await`, arrow functions, JSDoc typing.<br>• **Naming**: booleans (`is*`, `has*`), plurals (`items`), DOM elements (`buttonEl`, `cardEls`).<br>• **Web Components**: `dataset` for state, `connectedCallback`/`disconnectedCallback` for listener cleanup. |
| **PR** | • Theme check 0 errors; test with `shopify theme dev`.<br>• Document new settings, blocks, presets and global variables in the PR description. |

---

## Detailed Guidelines & References

1. **Liquid Standards**: [references/liquid-standards.md](./references/liquid-standards.md)
   - Feature toggles, component design, file naming.
   - Internationalization, Markets, collection URL context.
   - Snippet documentation with `{% doc %}`.

2. **CSS Standards**: [references/css-standards.md](./references/css-standards.md)
   - Where CSS lives (tokens, critical, `{% stylesheet %}`, section assets, per-instance `{% style %}`).
   - Custom property conventions, `color-mix()`, modern CSS features.
   - Selectors, units, breakpoints, shipping without minification.

3. **JavaScript & Web Components**: [references/javascript-standards.md](./references/javascript-standards.md)
   - Minimizing JS in favor of HTML5 semantic elements and CSS.
   - Flat architecture, ES6 conventions, Web Component lifecycle.

4. **CORE Workflow (optional)**: [references/core-workflow-checklist.md](./references/core-workflow-checklist.md)
   - Only when a component is backported to a shared CORE repository. Not part of the normal Ichi flow.

Fallback: [Shopify Theme Best Practices](https://shopify.dev/docs/storefronts/themes/best-practices).

---

## Snippet Documentation Format (Quick Copy)

```liquid
{%- doc -%}
  Brief description of what the snippet renders.

  @param {object} product - The product to render.
  @param {string} [variant] - Optional visual variant. Defaults to 'default'.

  @example
  {% render 'snip_example', product: product %}
{%- enddoc -%}
```

---

## Component CSS Pattern (Quick Copy)

```liquid
{%- liquid
  assign st = block.settings
  assign block_id = 'example-' | append: block.id
-%}
{% style %}
  #{{ block_id }} {
    --example-gap: {{ st.gap }}px;
  }
{% endstyle %}

<div id="{{ block_id }}" class="example" data-style="{{ st.style }}" {{ block.shopify_attributes }}>
  ...
</div>

{% stylesheet %}
  .example {
    display: flex;
    gap: var(--example-gap, 1.6rem);
    border: 1px solid color-mix(in srgb, var(--color-foreground) 15%, transparent);

    &[data-style='boxed'] {
      padding: 1.6rem;
    }
  }
{% endstylesheet %}
```

---

## JavaScript Web Component Template (Quick Copy)

```javascript
/**
 * Custom Web Component for theme interaction
 */
class CustomThemeElement extends HTMLElement {
  constructor() {
    super();
    this.buttonEl = null;
    this.onClickHandler = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.buttonEl = this.querySelector('[data-action="trigger"]');
    if (!this.buttonEl) return;
    this.buttonEl.addEventListener('click', this.onClickHandler);
  }

  disconnectedCallback() {
    if (!this.buttonEl) return;
    this.buttonEl.removeEventListener('click', this.onClickHandler);
  }

  handleClick(event) {
    if (!this.dataset.targetId) return;
    // Perform flat, single-purpose logic here
  }
}

if (!customElements.get('custom-theme-element')) {
  customElements.define('custom-theme-element', CustomThemeElement);
}
```
