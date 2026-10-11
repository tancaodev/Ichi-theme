---
name: shopify-theme-best-practices
description: >-
  Provides development guidelines and best practices for Shopify theme and CORE component development.
  Use when creating or refactoring Liquid sections or snippets, styling with Tailwind CSS, writing theme
  JavaScript (vanilla ES6, Web Components), reviewing pull requests, or preparing components for backporting to CORE.
---

# Shopify Theme & CORE Best Practices

This skill outlines the architectural standards, code style, and review processes required when building Shopify themes and reusable CORE components. Adhering to these guidelines ensures portability, high performance, clean abstraction, and seamless backporting into the CORE repository.

---

## Quick Reference / Core Rules

| Domain | Key Rules |
| :--- | :--- |
| **General** | • Do **not** track Dawn updates (rip out Dawn styles in favor of Tailwind; cull unused features).<br>• Check the **CORE inventory doc** before building from scratch.<br>• Use **Tailwind build tools for CSS**; **no build tools for JS** (native ES6). |
| **Liquid** | • **Client toggles**: add setting to section/block schema.<br>• **Dev toggles**: define a Liquid variable (`{% assign ... %}`).<br>• **Self-contained components**: sections handle their own markup/logic.<br>• **Native Shopify**: use translation strings (`| t`), relative URLs (`routes.*`), and `{{ product.url \| within: collection }}`.<br>• **Snippet header comment**: mandatory documentation format with `Accepts:` and `Usage:`. |
| **CSS (Tailwind)** | • **Abstraction**: extract repeated elements into Liquid snippets, or use `@apply` in CSS.<br>• Avoid standalone `.css` files where possible (keep components self-contained).<br>• **No arbitrary brackets `[ ]`**: use standard Tailwind scale (e.g. avoid `tw-p-[1.2rem]`).<br>• **No bracketed parent selectors**: avoid `[&>*]:...` to minimize bundle size. |
| **JavaScript** | • **HTML/CSS first**: use native tags like `<details>/<summary>` instead of JS toggles.<br>• **Modular**: single-purpose JS file or inline `<script>` if only used once on a page.<br>• **Flat code**: use early returns; avoid nested `if` statements.<br>• **Modern ES6**: `const`/`let` (no `var`), `async/await` (no `.then`), arrow functions, JSDoc typing.<br>• **Arrays/Strings**: use `.includes()`, avoid `.contains()`; prefer `for...of` over `reduce`.<br>• **Naming**: booleans (`is*`, `has*`), plurals (`items`), DOM elements (`buttonEl`, `cardEls`).<br>• **Web Components**: use DOM `dataset` for state, `querySelector`, `connectedCallback`/`disconnectedCallback` for event listener cleanup. |
| **CORE & PR** | • Pass client QA & design review before backporting.<br>• Remove client-specific code, IDs, handles, and client Tailwind prefixes before PR to CORE.<br>• Include live theme preview URL and setting/variable documentation in the PR description. |

---

## Detailed Guidelines & References

For comprehensive instructions, examples, and edge-case handling, refer to the specialized reference documents:

1. **Liquid Standards**:
   [Read Liquid Guidelines](./references/liquid-standards.md)
   - Feature toggles (client schema settings vs developer variables).
   - Component independence and culling Dawn functionality.
   - Internationalization, Markets, and collection URL preservation.
   - Standardized snippet comment headers.

2. **Tailwind CSS Standards**:
   [Read Tailwind CSS Guidelines](./references/tailwind-css-standards.md)
   - Proper abstraction (snippet extraction vs `@apply`).
   - Maintaining self-contained components without extra `.css` files.
   - Avoiding arbitrary value classes (`[1.2rem]`) and bracketed descendant selectors (`[&>*]`).
   - Handling client-specific Tailwind prefixes (`tw-`).

3. **JavaScript & Web Components**:
   [Read JavaScript Guidelines](./references/javascript-standards.md)
   - Minimizing JS in favor of HTML5 semantic elements and CSS.
   - Flat architecture with early return pattern.
   - Strict ES6 conventions, `async/await`, and JSDoc typing.
   - Web Components API (`customElements.define`), DOM state management, and lifecycle hooks (`connectedCallback`, `disconnectedCallback`).

4. **CORE Development Workflow & Checklist**:
   [Read CORE Workflow & Checklist](./references/core-workflow-checklist.md)
   - The end-to-end backporting workflow from client theme to CORE repo.
   - Pre-PR verification checklist.
   - Fallback to official [Shopify Theme Best Practices](https://shopify.dev/docs/storefronts/themes/best-practices).

---

## Snippet Documentation Format (Quick Copy)

When authoring any snippet, place this header at the very top:

```liquid
{% comment %}
  Snippet Name
  Brief description of what the snippet does.

  Accepts:
  - param_one: {Object} - Description of param_one
  - optional_param: {String} - Description of optional_param (Optional)

  Usage:
  {% render 'snippet-name',
    param_one: product,
    optional_param: 'value'
  %}
{% endcomment %}
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
