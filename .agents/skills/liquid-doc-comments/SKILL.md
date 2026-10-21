---
name: liquid-doc-comments
description: Guide for writing Liquid doc comments ({%- doc -%}) for snippets and components according to the theme's standard format.
---

# Liquid Snippet Documenter

When the user requests documentation for a Liquid snippet or file, you MUST follow this exact format using `{%- doc -%}` and `{%- enddoc -%}` blocks at the very top of the file.

## Rules

1. **Tag Usage**: Always use the Liquid doc tags `{%- doc -%}` at the beginning and `{%- enddoc -%}` at the end of the comment block.
2. **Description**: Start with a clear, brief sentence describing what the snippet renders or its main functionality.
3. **Parameters**:
   - List each accepted parameter using the `@param` tag.
   - **Format**: `@param {type} param_name - Description of the parameter.`
   - **Optional Parameters**: If a variable is optional (e.g., has a fallback or `| default:` inside the file), wrap the variable name in square brackets: `@param {type} [param_name] - Description.`
   - **Common Types**: `{object}`, `{string}`, `{number}`, `{boolean}`.
4. **Example**: Include an `@example` section demonstrating how to call the snippet using `{% render ... %}` with sample arguments.

## Standard Format Example

```liquid
{%- doc -%}
  Renders a product media component.

  @param {object} media - The product media object.
  @param {object} [selected_product] - The currently selected product.
  @param {boolean} [first_3d_model] - Indicates if this is the first 3D model.

  @example
  {% render 'product-media', media: media, preview_image_only: false, loading: 'lazy' %}
{%- enddoc -%}
```

## Anti-Patterns
* Do NOT use standard HTML comments `<!-- ... -->` or standard Liquid comments `{% comment %}` for the main snippet documentation.
* Do NOT omit the `@example` block unless the snippet requires zero parameters and the usage is blatantly obvious.
* Do NOT forget the square brackets for optional parameters.
