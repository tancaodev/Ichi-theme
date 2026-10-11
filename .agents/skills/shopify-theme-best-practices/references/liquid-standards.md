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

- **Self-Contained Components:** Think in modular components. A Liquid section should be responsible for its own markup, settings, assets, and logic. This keeps components portable and backportable.
- **Check Existing Solutions:**
  1. Check the CORE inventory first to see if a component already exists.
  2. If not, check Dawn components as a base. Feel free to use Dawn as an initial base and cull unwanted features.
  3. If Dawn is insufficient or styling requires Tailwind, use Tailwind UI components as a basis for markup and styling.
- **Cull Dawn Bloat:** If a Dawn component includes complex functionality rarely needed by clients, strip it out. We do not track Dawn updates.
- **Avoid Hard-Coded Client Data:** Avoid hard-coding client-specific IDs, handles, text, or URLs. If temporary hardcoding is unavoidable during rapid client work, flag it clearly with `{% comment %} TODO: Remove client-specific reference for CORE {% endcomment %}`.

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

Every snippet must begin with a structured Liquid comment describing its name, purpose, accepted parameters (with types), and an example `{% render %}` call.

### Template:
```liquid
{% comment %}
  Snippet Name
  Brief description of what the snippet does.

  Accepts:
  - variable_name: {Type} - Description of the variable and its role.
  - optional_variable: {Type} - Description (Optional)

  Usage:
  {% render 'snippet-name',
    variable_name: value,
    optional_variable: value
  %}
{% endcomment %}
```

### Real-world Example:
```liquid
{% comment %}
  Layered image
  Renders layered product images with customizable sheet and duvet covers.

  Accepts:
  - pillow_cover_product: {Object} - The product object for pillow cover
  - sheet_product: {Object} - The product object for sheet
  - duvet_cover_product: {Object} - The product object for duvet cover (Optional)

  Usage:
  {% render 'layered-image',
    pillow_cover_product: product,
    sheet_product: product.metafields.custom.sheet_product
  %}
{% endcomment %}
```
