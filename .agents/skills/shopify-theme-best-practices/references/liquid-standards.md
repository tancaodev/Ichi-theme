# Liquid Development Standards

These guidelines govern how Liquid code (sections, snippets, templates) should be structured, configured, and documented.

---

## 1. Feature Toggles & Client Customization

When adding a feature or option to a component, determine the intended audience:

- **Client-configurable:** If store merchants/clients need to toggle it on/off in the theme editor, add a checkbox setting in the section/block schema (`settings`).
- **Developer-only toggle:** If only developers should toggle or configure the feature, define a Liquid variable at the top of the file (e.g., `{% assign enable_feature = false %}`).
- **Respect Site-Wide Settings:** Respect global theme settings or variables (e.g., `settings.accent_color`, global cart type). Any global settings or variables introduced or relied upon must be documented for PR review.

---

## 2. Component Design & Abstraction

- **File Names:** Newly added files use `_` (never `-`) as the word separator, and sections, blocks and HTML-rendering snippets get a type prefix so they are distinguishable from Shopify Skeleton's original files. Skeleton files (`css-variables`, `meta-tags`, `image`, `hello-world`, `custom-section`, header/footer groups) keep their names.

  | Type | Prefix | Example |
  | :--- | :--- | :--- |
  | Section | `sc_` | `sections/sc_hero.liquid` |
  | Theme block (public) | `blck_` | `blocks/blck_heading.liquid` |
  | Private block (only usable by sections/blocks that name it) | `_blck_` | `blocks/_blck_slide.liquid` |
  | Snippet that renders HTML markup | `snip_` | `snippets/snip_heading.liquid` |
  | Helper snippet (CSS variables / `{% style %}` output, no markup) | none | `snippets/heading_styles.liquid`, `snippets/css_var_margin.liquid` |

  The prefix applies to the file name (and therefore the block `type` / render name) only; setting ids, locale keys and CSS classes keep the bare component name (`heading_*`, `blocks.heading`, `.heading`).

- **Self-Contained Components:** Think in modular components. A Liquid section should be responsible for its own markup, settings, assets, and logic. This keeps components portable and backportable.
- **Check Existing Solutions:**
  1. Reuse an existing Ichi block/snippet (`blck_*`, `snip_*`, `css_var_*`, `*_variables`) before writing a new one.
  2. Read Skeleton and Shopify's docs for the platform pattern.
  3. Dawn (`_reference/dawn`) may be read to understand expected **behavior** (accessibility, edge cases). **Never copy Dawn code, markup or class names**: Theme Store does not accept Dawn-derived themes.
  4. Do not base markup on paid UI kits (e.g. Tailwind UI) whose license does not allow redistribution in a sold theme.
- **Keep it lean:** build only the features the design needs; no speculative options.
- **No store-specific data:** never hard-code store IDs, handles, product/collection references, text or URLs. Defaults must work on any store (Theme Store requirement).

---

## 3. Native Shopify & Storefront Features

Always build for Shopify native features, multi-currency, and internationalization:

- **Translation Strings:** Always use locale strings via the `t` filter rather than hardcoded text strings:
  ```liquid
  {{ 'products.product.add_to_cart' | t }}
  ```
  Reference: [Shopify Storefront Locale Files](https://shopify.dev/docs/themes/architecture/locales/storefront-locale-files)

- **Relative & Locale-Aware URLs:** Ensure internal links support Markets and localization:
  ```liquid
  {{ routes.root_url }}
  {{ routes.cart_url }}
  ```
  Reference: [Shopify Locale-Aware URLs](https://shopify.dev/docs/themes/markets/multiple-currencies-languages#locale-aware-urls)

- **Product URLs in Collection Context:** Always preserve collection context when linking to products where applicable:
  ```liquid
  <a href="{{ product.url | within: collection }}">{{ product.title }}</a>
  ```

---

## 4. Snippet Documentation Header Standard

Every snippet starts with a Liquid `{%- doc -%}` block: a short description, each parameter with `@param {type} name - description` (optional ones in `[brackets]`), and an `@example` render call. Theme check reads this format to validate `{% render %}` arguments. Follow the `liquid-doc-comments` skill for the exact format; do not use `{% comment %}` headers for new snippets.

### Template:
```liquid
{%- doc -%}
  Renders the product badge for sale / sold-out states.

  @param {object} product - The product to evaluate.
  @param {string} [class] - Extra classes on the wrapper.

  @example
  {% render 'snip_product_badge', product: product %}
{%- enddoc -%}
```
