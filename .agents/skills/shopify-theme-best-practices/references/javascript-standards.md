# JavaScript & Web Components Standards

These guidelines ensure all theme JavaScript is performant, readable, maintainable, and built without extra bundling or compilation steps (no JS build tools).

---

## 1. Native HTML/CSS Over JavaScript

Always question whether JavaScript is truly necessary:
- Use native HTML elements like `<details>` and `<summary>` for toggles, accordions, and dropdowns.
- Use CSS transitions, `:hover`, `:focus-within`, and `:target` where appropriate.
- Save JS strictly for dynamic data fetching, DOM mutations, cart updates, and interactive behaviors that native HTML cannot provide.

---

## 2. File Organization & Inlining

- **Single Purpose:** Each JS file should address a single Liquid file or handle one distinct concept.
- **Single-Use Components:** If a component is only ever rendered once per page, placing its `<script>` directly inside the Liquid file can keep all logic in one place.
- **Multi-Use Components:** If a component is rendered multiple times, import the JS file via `<script src="..." defer></script>`. The browser will cache it upon subsequent loads.
- **No JS Build Step:** Write clean, native ES6+ JavaScript. Do not introduce Webpack, Rollup, or Vite for theme JavaScript.

---

## 3. Flat Code & Early Returns

Avoid deeply nested `if` statements. Keep control flow flat so code reads top-to-bottom like a recipe.

### BAD Example (Deeply nested):
```javascript
function handleClick(event) {
  if (event.target.matches('.save-data')) {
    const id = event.target.getAttribute('data-id');
    if (id) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.setItem(`${token}_${id}`, true);
      }
    }
  }
}
```

### GOOD Example (Flat with early returns):
```javascript
function handleClick(event) {
  if (!event.target.matches('.save-data')) return;

  const id = event.target.getAttribute('data-id');
  if (!id) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  localStorage.setItem(`${token}_${id}`, true);
}
```

---

## 4. Modern ES6 & Syntax Conventions

- **Variable Declarations:** Always use `const`. Only use `let` when the variable must be reassigned. **Never** use `var`.
- **Top-Level Code:** Wrap global scripts in an IIFE to prevent polluting `window`:
  ```javascript
  (() => {
    // Component initialization
  })();
  ```
- **Async/Await over Promises:** Prefer `async/await` over `.then()` chains for clarity and linear reading:
  ```javascript
  // BAD - nested promise chaining
  function getData() {
    fetch('/cart.js')
      .then(res => res.json())
      .then(data => {
        console.log(data);
      });
  }

  // GOOD - linear async/await
  async function getData() {
    const res = await fetch('/cart.js');
    const data = await res.json();
    console.log(data);
  }
  ```
- **Arrow Functions:** Use arrow functions for callbacks to maintain lexical `this` without explicit `.bind(this)` where applicable.
- **Search & Containment:** Use `includes()` for both strings and arrays (`items.includes(x)`). Avoid the obsolete `contains()` method.
- **Loops & Arrays:**
  - Prefer `for...of` loops over `reduce` for complex accumulation; it is significantly easier to read and debug.
  - Use standard array methods (`map`, `filter`, `find`, `some`, `every`).

---

## 5. Naming Conventions

Use self-documenting names that reflect variable types:
- **Booleans (yes/no questions):** `isEnabled`, `hasChildren`, `containsString`, `isOpen`, `isLoading`.
- **Lists / Plurals:** `products`, `children`, `variants`.
- **DOM Elements (`el` / `els` suffix):**
  - Single element: `buttonEl`, `modalEl`, `containerEl`.
  - Multiple elements: `productCardEls`, `tabButtonEls`.

---

## 6. JSDoc Typing

Use JSDoc comments to document parameter types and return values for code intelligence and editor hints without requiring TypeScript compilation:

```javascript
/**
 * Fetches cart data from the Shopify AJAX API
 * @param {string} [cartType] - Optional cart type filter
 * @returns {Promise<Object>} The cart JSON response
 */
async function fetchCart(cartType) {
  const response = await fetch('/cart.js');
  return response.json();
}
```

---

## 7. Web Components API

When building interactive UI elements (drawers, variant pickers, modals, quantity selectors), use Custom Elements (`customElements.define`):

### Guidelines:
1. **DOM for State:** Store state in the DOM using `data-*` attributes and read/write them using `element.dataset.*`. This keeps state synchronized without complex reactive layers.
2. **DOM Queries:** Use `querySelector` and spread `querySelectorAll` to a true Array:
   ```javascript
   const myEl = this.querySelector('.my-class');
   const myEls = [...this.querySelectorAll('.my-class')];
   ```
3. **Lifecycle Hooks:**
   - Attach event listeners in `connectedCallback()`.
   - Always remove event listeners in `disconnectedCallback()` to prevent memory leaks and duplicate listeners if elements are reinitialized.

### Web Component Pattern Example:
```javascript
class QuantitySelector extends HTMLElement {
  constructor() {
    super();
    this.plusButtonEl = null;
    this.minusButtonEl = null;
    this.inputEl = null;
    this.onPlusClick = this.handlePlus.bind(this);
    this.onMinusClick = this.handleMinus.bind(this);
  }

  connectedCallback() {
    this.plusButtonEl = this.querySelector('[data-action="increment"]');
    this.minusButtonEl = this.querySelector('[data-action="decrement"]');
    this.inputEl = this.querySelector('input[type="number"]');

    if (this.plusButtonEl) {
      this.plusButtonEl.addEventListener('click', this.onPlusClick);
    }
    if (this.minusButtonEl) {
      this.minusButtonEl.addEventListener('click', this.onMinusClick);
    }
  }

  disconnectedCallback() {
    if (this.plusButtonEl) {
      this.plusButtonEl.removeEventListener('click', this.onPlusClick);
    }
    if (this.minusButtonEl) {
      this.minusButtonEl.removeEventListener('click', this.onMinusClick);
    }
  }

  handlePlus() {
    if (!this.inputEl) return;
    this.inputEl.stepUp();
    this.inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  handleMinus() {
    if (!this.inputEl) return;
    this.inputEl.stepDown();
    this.inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

if (!customElements.get('quantity-selector')) {
  customElements.define('quantity-selector', QuantitySelector);
}
```
