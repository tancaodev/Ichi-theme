# Tailwind CSS Standards

These standards govern how CSS is structured, abstracted, and applied using Tailwind build tools.

---

## 1. Abstraction & Reusability

Tailwind utility classes are powerful, but duplicated lists of 10+ classes across identical elements lead to maintenance headaches and bloated markup.

### Rule:
If an element is repeated or has shared styling across multiple locations:
1. **Preferred (Snippet Extraction):** Extract the element into its own Liquid snippet. This encapsulates the HTML markup and Tailwind classes in a single source of truth.
   - *Example:* Create `snippets/button.liquid` or `snippets/product-badge.liquid`.
2. **Alternative (`@apply` in CSS):** If markup extraction into a snippet is impractical or impossible (e.g., dynamic third-party markup or tight integration with third-party apps), create a custom CSS class and apply Tailwind classes using `@apply`:
   ```css
   .custom-button {
     @apply inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors;
   }
   ```

---

## 2. Self-Contained Components (Minimize `.css` Files)

- Strive to keep components self-contained. A component should ideally live in its Liquid section/snippet and rely on Tailwind utility classes.
- Avoid introducing unnecessary standalone `.css` files. Managing separate CSS files spreads component concerns across multiple locations and adds asset overhead.

---

## 3. Avoid Arbitrary Value Brackets `[ ]`

### Rule:
Do not use arbitrary pixel/rem values enclosed in brackets (e.g., `tw-p-[1.2rem]`, `tw-w-[342px]`, `tw-top-[17px]`).

- **Why:** Arbitrary values inflate CSS output, break the design token scale, and lead to visual inconsistency.
- **Solution:** Always round to the closest standard Tailwind spacing/sizing class (e.g., `p-5`, `w-80`, `top-4`).
- **Design Alignment:** If the design specification uses an off-grid value, verify with the designer first. In almost all design systems, values should snap to the established scale.

---

## 4. Avoid Arbitrary Parent/Child Brackets `[&>*]`

### Rule:
Do not use bracketed child selectors on parent containers to style child elements (e.g., `[&>*]:tw-mb-4`).

- **Why:** Complex bracketed selectors bloat the generated CSS bundle and complicate specificity.
- **Solution:** Apply utility classes directly to child elements or blocks.

### BAD Example:
```liquid
<!-- Avoid bracketed descendant selector on parent -->
<div class="[&>*]:tw-mb-4">
  {% for block in section.blocks %}
    {% if block.type == 'header' %}
      <h2>{{ block.settings.text }}</h2>
    {% endif %}
    {% if block.type == 'text' %}
      <p>{{ block.settings.text }}</p>
    {% endif %}
  {% endfor %}
</div>
```

### GOOD Example:
```liquid
<!-- Clean, direct classes on elements without bloated parent selectors -->
<div>
  {% for block in section.blocks %}
    {% if block.type == 'header' %}
      <h2 class="tw-mb-4">{{ block.settings.text }}</h2>
    {% endif %}
    {% if block.type == 'text' %}
      <p class="tw-mb-4">{{ block.settings.text }}</p>
    {% endif %}
  {% endfor %}
</div>
```

---

## 5. Client Prefixes vs CORE

- If a client site configuration uses a prefix (e.g., `tw-`), follow it consistently on the client theme.
- When preparing and backporting components to CORE, remember to normalize or remove client-specific Tailwind prefix conventions as outlined in the CORE Backport Checklist.
