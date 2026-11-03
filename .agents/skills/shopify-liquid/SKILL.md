---
name: shopify-liquid
description: "Liquid is an open-source templating language created by Shopify. It is the backbone of Shopify themes and is used to load dynamic content on storefronts. Keywords: liquid, theme, shopify-theme, liquid-component, liquid-block, liquid-section, liquid-snippet, liquid-schemas, shopify-theme-schemas"
---

# Shopify Liquid Development Guidelines

Use this skill when developing Shopify theme templates, sections, blocks, or snippets, writing Liquid scripts, and defining theme schema configuration settings.

## Theme Architecture

**Key principles: focus on generating snippets, blocks, and sections; users may create templates using the theme editor**

### Directory structure

```
.
├── assets # Static assets (CSS, JS, images, fonts)
├── blocks # Reusable, nestable, customizable components
├── config # Global theme settings and customization options
├── layout # Top-level wrappers for pages
├── locales # Translation files for internationalization
├── sections # Modular full-width page components
├── snippets # Reusable Liquid code or HTML fragments
└── templates # JSON or Liquid files defining page structure
```

#### `sections`

- `.liquid` files for reusable modules customizable by merchants
- Can include blocks for merchant-managed content
- Must include `{% schema %}` tag for theme editor settings
- Use `{{ block.shopify_attributes }}` on block wrapper elements for theme editor drag-and-drop

#### `blocks`

- `.liquid` files for reusable small components (don't need full-width)
- Can include nested blocks via `{% content_for 'blocks' %}`
- Must include `{% schema %}` tag
- Must have `{% doc %}` tag when statically rendered via `{% content_for 'block', id: '42', type: 'block_name' %}`

#### `snippets`

- Reusable code fragments rendered via `{% render 'snippet', param: value %}`
- Accept parameters for dynamic behavior
- Must have the `{% doc %}` tag as the header

#### `layout`

- Defines overall HTML structure (`<head>`, `<body>`), wraps templates
- Must include `{{ content_for_header }}` in `<head>` and `{{ content_for_layout }}` for page content

#### `config`

- `config/settings_schema.json`: defines global theme settings
- `config/settings_data.json`: holds data for those settings

#### `locales`

- Translation files by language code (e.g., `en.default.json`, `fr.json`)
- Access via `{{ 'key' | t }}` filter

#### `templates`

- JSON or `.liquid` files defining which sections/blocks appear on each page type

### CSS & JavaScript

- Write per-component CSS/JS using `{% stylesheet %}` and `{% javascript %}` tags
- These tags are only supported in `snippets/`, `blocks/`, and `sections/`
- Liquid is NOT rendered inside `{% stylesheet %}` or `{% javascript %}` tags

### LiquidDoc

Snippets and static blocks must include a LiquidDoc header:
```liquid
{% doc %}
@param {image} image - The image to render
@param {string} [url] - Optional destination URL
@example
{% render 'image', image: product.featured_image %}
{% enddoc %}
```

## Schema tag good practices

**Single CSS property** — use CSS variables:
```liquid
<div style="--gap: {{ block.settings.gap }}px">Content</div>
{% stylesheet %}
  .collection { gap: var(--gap); }
{% endstylesheet %}
```

**Multiple CSS properties** — use CSS classes:
```liquid
<div class="{{ block.settings.layout }}">Content</div>
```

**`visible_if` Constraints & Limitations**
- **No parentheses allowed**: Shopify does not support parentheses `()` inside `visible_if` strings. To represent complex logic, distribute the conditions. For example, instead of `(A or B) and C`, write `A and C or B and C` (since `and` takes precedence over `or`).
- **255 Character Limit**: The `visible_if` string must not exceed 255 characters. If distributing logic (like expanding `or` conditions) causes the string to exceed this limit, you must aggressively simplify it by stripping conditions from right to left, keeping only the most essential visibility rules and removing lengthy `or` chains.

## Liquid reference

### Delimiters

- `{{ ... }}` / `{{- ... -}}`: Output (dashes trim whitespace)
- `{% ... %}` / `{%- ... -%}`: Logic tags (dashes trim whitespace)

### Gotchas

- **No parentheses** in conditions — use nested `if` for complex logic or combine with `and` / `or`
- **Liquid objects inside logic tags** — do not use `{{ ... }}` inside `{% ... %}` tags. Incorrect: `{% if {{ settings.enable }} == true %}`. Correct: `{% if settings.enable == true %}`
- **Truthy / Falsy** — only `false` and `nil` are falsy in Liquid. Empty strings `""`, `0`, and empty arrays are all truthy. Always check array sizes `size > 0` or check for blank `var != blank`.
- **String keys in translation filters** — Always wrap the key name in quotes: `{{ 'sections.featured_collection.title' | t }}`.

### Filters and functions

Use standard Shopify Liquid filters:
- Array filters: `map`, `sort`, `where`, `first`, `last`, `size`, `concat`
- Math filters: `plus`, `minus`, `times`, `divided_by`, `modulo`, `round`, `floor`, `ceil`, `abs`
- String filters: `append`, `prepend`, `split`, `replace`, `strip_html`, `escape`, `url_encode`, `base64_encode`, `t`
- HTML filters: `image_url`, `image_tag`, `video_tag`, `payment_type_svg_tag`

### Theme schema fields

Each setting in the `settings` array must be an object with properties:
- `type`: setting type (e.g. `text`, `image_picker`, `checkbox`, `select`, `range`)
- `id`: identifier used to access value (e.g., `block.settings.id`)
- `label`: merchant-facing label
- `default`: fallback value
