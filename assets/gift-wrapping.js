/**
 * Gift Wrapping Component Scripts
 * Follows Shopify CORE theme best practices:
 * - Native ES6 Web Components
 * - Flat control flow with early returns
 * - JSDoc typing
 * - connectedCallback / disconnectedCallback lifecycle listener management
 */

/**
 * Web Component for Product Detail Page (PDP) Gift Wrapping Form
 */
class GiftWrapping extends HTMLElement {
  constructor() {
    super();

    /** @type {HTMLInputElement|null} */
    this.checkboxEl = null;
    /** @type {HTMLElement|null} */
    this.fieldsContainerEl = null;
    /** @type {HTMLInputElement[]} */
    this.inputEls = [];
    /** @type {HTMLInputElement[]} */
    this.hiddenPropEls = [];

    this.onCheckboxChange = this.handleCheckboxChange.bind(this);
    this.onInputType = this.handleInputCount.bind(this);
  }

  connectedCallback() {
    this.checkboxEl = this.querySelector('.gift-wrapping__checkbox');
    this.fieldsContainerEl = this.querySelector('.gift-wrapping__fields');
    this.inputEls = [...this.querySelectorAll('.gift-wrapping__input')];
    this.hiddenPropEls = [...this.querySelectorAll('.gift-wrapping__hidden-prop')];

    if (!this.checkboxEl || !this.fieldsContainerEl) return;

    this.checkboxEl.addEventListener('change', this.onCheckboxChange);

    for (const inputEl of this.inputEls) {
      inputEl.addEventListener('input', this.onInputType);
    }
  }

  disconnectedCallback() {
    if (this.checkboxEl) {
      this.checkboxEl.removeEventListener('change', this.onCheckboxChange);
    }

    for (const inputEl of this.inputEls) {
      inputEl.removeEventListener('input', this.onInputType);
    }
  }

  /**
   * Handles toggle expand/collapse of the gift form
   * @param {Event} event
   */
  handleCheckboxChange(event) {
    if (!this.checkboxEl || !this.fieldsContainerEl) return;

    const isChecked = this.checkboxEl.checked;
    this.checkboxEl.setAttribute('aria-expanded', isChecked ? 'true' : 'false');
    this.fieldsContainerEl.setAttribute('aria-hidden', isChecked ? 'false' : 'true');

    if (isChecked) {
      this.fieldsContainerEl.classList.remove('tw-hidden');
      for (const inputEl of this.inputEls) {
        inputEl.disabled = false;
      }
      for (const propEl of this.hiddenPropEls) {
        propEl.disabled = false;
      }
      return;
    }

    this.fieldsContainerEl.classList.add('tw-hidden');
    for (const inputEl of this.inputEls) {
      inputEl.disabled = true;
    }
    for (const propEl of this.hiddenPropEls) {
      propEl.disabled = true;
    }
  }

  /**
   * Handles character count update for inputs
   * @param {Event} event
   */
  handleInputCount(event) {
    const inputEl = /** @type {HTMLInputElement} */ (event.currentTarget);
    if (!inputEl) return;

    const parentFieldEl = inputEl.closest('.gift-wrapping__field');
    if (!parentFieldEl) return;

    const counterEl = parentFieldEl.querySelector('.js-char-count');
    if (!counterEl) return;

    counterEl.textContent = String(inputEl.value.length);
  }
}

if (!customElements.get('gift-wrapping')) {
  customElements.define('gift-wrapping', GiftWrapping);
}

/**
 * Web Component for Cart Drawer Line Item Gift Wrapping
 */
class CartGiftWrapping extends HTMLElement {
  constructor() {
    super();

    /** @type {HTMLElement|null} */
    this.viewEl = null;
    /** @type {HTMLElement|null} */
    this.editEl = null;
    /** @type {HTMLButtonElement|null} */
    this.editButtonEl = null;
    /** @type {HTMLButtonElement|null} */
    this.cancelButtonEl = null;
    /** @type {HTMLButtonElement|null} */
    this.submitButtonEl = null;

    /** @type {HTMLInputElement|null} */
    this.inputToEl = null;
    /** @type {HTMLInputElement|null} */
    this.inputFromEl = null;
    /** @type {HTMLTextAreaElement|null} */
    this.inputMessageEl = null;

    this.originalValues = {
      to: '',
      from: '',
      message: ''
    };

    this.onEditClick = this.handleEdit.bind(this);
    this.onCancelClick = this.handleCancel.bind(this);
    this.onSubmitClick = this.handleSubmit.bind(this);
    this.onCharCount = this.handleCharCount.bind(this);
    this.onStopPropagation = (e) => e.stopPropagation();
    this.onCheckboxChange = this.handleCheckboxToggle.bind(this);
    /** @type {HTMLInputElement[]} */
    this.checkboxEls = [];
  }

  connectedCallback() {
    this.addEventListener('change', this.onStopPropagation);

    this.viewEl = this.querySelector('.cart-gift-wrapping__view');
    this.editEl = this.querySelector('.cart-gift-wrapping__edit');
    this.editButtonEl = this.querySelector('.cart-gift-wrapping__edit-btn');
    this.cancelButtonEl = this.querySelector('.cart-gift-wrapping__cancel-btn');
    this.submitButtonEl = this.querySelector('.cart-gift-wrapping__submit-btn');

    this.inputToEl = this.querySelector('.cart-gift-wrapping__input-to');
    this.inputFromEl = this.querySelector('.cart-gift-wrapping__input-from');
    this.inputMessageEl = this.querySelector('.cart-gift-wrapping__input-message');

    if (this.inputToEl) this.originalValues.to = this.inputToEl.value;
    if (this.inputFromEl) this.originalValues.from = this.inputFromEl.value;
    if (this.inputMessageEl) this.originalValues.message = this.inputMessageEl.value;

    if (this.editButtonEl) this.editButtonEl.addEventListener('click', this.onEditClick);
    if (this.cancelButtonEl) this.cancelButtonEl.addEventListener('click', this.onCancelClick);
    if (this.submitButtonEl) this.submitButtonEl.addEventListener('click', this.onSubmitClick);

    this.checkboxEls = Array.from(this.querySelectorAll('.cart-gift-wrapping__checkbox'));
    for (const cb of this.checkboxEls) {
      cb.addEventListener('change', this.onCheckboxChange);
    }

    const editableInputs = [this.inputToEl, this.inputFromEl, this.inputMessageEl];
    for (const el of editableInputs) {
      if (el) el.addEventListener('input', this.onCharCount);
    }
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onStopPropagation);

    if (this.editButtonEl) this.editButtonEl.removeEventListener('click', this.onEditClick);
    if (this.cancelButtonEl) this.cancelButtonEl.removeEventListener('click', this.onCancelClick);
    if (this.submitButtonEl) this.submitButtonEl.removeEventListener('click', this.onSubmitClick);

    for (const cb of this.checkboxEls) {
      cb.removeEventListener('change', this.onCheckboxChange);
    }

    const editableInputs = [this.inputToEl, this.inputFromEl, this.inputMessageEl];
    for (const el of editableInputs) {
      if (el) el.removeEventListener('input', this.onCharCount);
    }
  }

  /**
   * Gets the line index for this item in the cart
   * @returns {number}
   */
  getLineIndex() {
    const lineItem = this.closest('.cart-item') || this.closest('tr');
    if (lineItem) {
      const quantityInput = lineItem.querySelector('.quantity__input');
      if (quantityInput && quantityInput.dataset.index) {
        const parsed = parseInt(quantityInput.dataset.index, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    if (this.dataset.line) {
      const parsed = parseInt(this.dataset.line, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 1;
  }

  /**
   * Gets the current quantity of this line item
   * @returns {number}
   */
  getQuantity() {
    const lineItem = this.closest('.cart-item') || this.closest('tr');
    if (lineItem) {
      const quantityInput = lineItem.querySelector('.quantity__input');
      if (quantityInput && quantityInput.value) {
        const parsed = parseInt(quantityInput.value, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    if (this.dataset.quantity) {
      const parsed = parseInt(this.dataset.quantity, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 1;
  }

  /**
   * Handles user unchecking the gift wrapping checkbox in cart
   * @param {Event} event
   */
  async handleCheckboxToggle(event) {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    const checkboxEl = /** @type {HTMLInputElement} */ (event.currentTarget);
    if (!checkboxEl) return;

    if (!checkboxEl.checked) {
      await this.removeGiftWrap(checkboxEl);
    }
  }

  /**
   * Removes gift wrapping properties from cart item via AJAX
   * @param {HTMLInputElement} checkboxEl
   */
  async removeGiftWrap(checkboxEl) {
    const lineIndex = this.getLineIndex();
    const currentQuantity = this.getQuantity();
    if (!lineIndex) return;

    this.classList.add('tw-opacity-50', 'tw-pointer-events-none');

    try {
      const cartDrawerWrapper = document.querySelector('cart-drawer');
      const cartDrawerItems = document.querySelector('cart-drawer-items');
      const cartItems = document.querySelector('cart-items');

      let sectionsToRender = ['cart-drawer', 'cart-icon-bubble'];
      if (cartDrawerItems && typeof cartDrawerItems.getSectionsToRender === 'function') {
        sectionsToRender = cartDrawerItems.getSectionsToRender().map((s) => s.section);
      } else if (cartItems && typeof cartItems.getSectionsToRender === 'function') {
        sectionsToRender = cartItems.getSectionsToRender().map((s) => s.section);
      } else if (cartItems) {
        sectionsToRender = ['main-cart-items', 'cart-icon-bubble'];
      }

      const changeUrl = window.routes?.cart_change_url || '/cart/change.js';

      const response = await fetch(changeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          line: lineIndex,
          quantity: currentQuantity,
          properties: {
            'To': '',
            'From': '',
            'Gift message': '',
            'Wrap as a gift': '',
            '_Gift Wrap': 'No',
            '_Gift Wrap Price': ''
          },
          sections: sectionsToRender,
          sections_url: window.location.pathname
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.description || 'Failed to remove gift wrapping');
      }

      const parsedState = await response.json();

      if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'gift-wrapping', cartData: parsedState });
      }

      if (cartDrawerWrapper && typeof cartDrawerWrapper.renderContents === 'function') {
        cartDrawerWrapper.renderContents(parsedState);
        return;
      }

      this.remove();

    } catch (error) {
      console.error('Error removing gift wrapping from cart:', error);
      alert('Could not remove gift wrapping. Please try again.');
      if (checkboxEl) checkboxEl.checked = true;
      this.classList.remove('tw-opacity-50', 'tw-pointer-events-none');
    }
  }

  handleEdit() {
    if (!this.viewEl || !this.editEl) return;
    this.viewEl.classList.add('tw-hidden');
    this.editEl.classList.remove('tw-hidden');
    if (this.inputToEl) this.inputToEl.focus();
  }

  handleCancel() {
    if (!this.viewEl || !this.editEl) return;

    if (this.inputToEl) this.inputToEl.value = this.originalValues.to;
    if (this.inputFromEl) this.inputFromEl.value = this.originalValues.from;
    if (this.inputMessageEl) this.inputMessageEl.value = this.originalValues.message;

    this.refreshAllCounters();

    this.editEl.classList.add('tw-hidden');
    this.viewEl.classList.remove('tw-hidden');
  }

  handleCharCount(event) {
    const inputEl = /** @type {HTMLInputElement} */ (event.currentTarget);
    if (!inputEl) return;

    const parentDivEl = inputEl.parentElement;
    if (!parentDivEl) return;

    const countEl = parentDivEl.querySelector('.js-char-count');
    if (!countEl) return;

    countEl.textContent = String(inputEl.value.length);
  }

  refreshAllCounters() {
    const fields = [this.inputToEl, this.inputFromEl, this.inputMessageEl];
    for (const field of fields) {
      if (!field || !field.parentElement) continue;
      const countEl = field.parentElement.querySelector('.js-char-count');
      if (countEl) countEl.textContent = String(field.value.length);
    }
  }

  /**
   * Submits updated gift options to Shopify AJAX Cart API
   */
  async handleSubmit() {
    const lineIndex = this.getLineIndex();
    const currentQuantity = this.getQuantity();
    if (!lineIndex || !this.submitButtonEl) return;

    const toVal = this.inputToEl ? this.inputToEl.value.trim() : '';
    const fromVal = this.inputFromEl ? this.inputFromEl.value.trim() : '';
    const messageVal = this.inputMessageEl ? this.inputMessageEl.value.trim() : '';

    this.setLoading(true);

    try {
      const cartDrawerWrapper = document.querySelector('cart-drawer');
      const cartDrawerItems = document.querySelector('cart-drawer-items');
      const cartItems = document.querySelector('cart-items');
      
      let sectionsToRender = ['cart-drawer', 'cart-icon-bubble'];
      if (cartDrawerItems && typeof cartDrawerItems.getSectionsToRender === 'function') {
        sectionsToRender = cartDrawerItems.getSectionsToRender().map((s) => s.section);
      } else if (cartItems && typeof cartItems.getSectionsToRender === 'function') {
        sectionsToRender = cartItems.getSectionsToRender().map((s) => s.section);
      } else if (cartItems) {
        sectionsToRender = ['main-cart-items', 'cart-icon-bubble'];
      }

      const changeUrl = window.routes?.cart_change_url || '/cart/change.js';

      const response = await fetch(changeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          line: lineIndex,
          quantity: currentQuantity,
          properties: {
            'To': toVal,
            'From': fromVal,
            'Gift message': messageVal,
            'Wrap as a gift': 'Yes',
            '_Gift Wrap': 'Yes'
          },
          sections: sectionsToRender,
          sections_url: window.location.pathname
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.description || 'Failed to update gift wrapping');
      }

      const parsedState = await response.json();

      this.originalValues = {
        to: toVal,
        from: fromVal,
        message: messageVal
      };

      if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'gift-wrapping', cartData: parsedState });
      }

      if (cartDrawerWrapper && typeof cartDrawerWrapper.renderContents === 'function') {
        cartDrawerWrapper.renderContents(parsedState);
        return;
      }

      // Fallback: Update view mode content directly
      this.updateViewSummary(toVal, fromVal, messageVal);
      if (this.editEl) this.editEl.classList.add('tw-hidden');
      if (this.viewEl) this.viewEl.classList.remove('tw-hidden');

    } catch (error) {
      console.error('Error updating gift wrapping in cart:', error);
      alert('Could not update gift wrapping. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Sets loading spinner on the update button
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    if (!this.submitButtonEl) return;
    this.submitButtonEl.disabled = isLoading;

    const btnText = this.submitButtonEl.querySelector('.btn-text');
    const btnLoading = this.submitButtonEl.querySelector('.btn-loading');

    if (btnText && btnLoading) {
      btnText.classList.toggle('tw-hidden', isLoading);
      btnLoading.classList.toggle('tw-hidden', !isLoading);
    }
  }

  /**
   * Updates summary HTML in view mode
   * @param {string} toVal
   * @param {string} fromVal
   * @param {string} messageVal
   */
  updateViewSummary(toVal, fromVal, messageVal) {
    if (!this.viewEl) return;
    let summaryEl = this.viewEl.querySelector('.cart-gift-wrapping__summary');
    if (!summaryEl) {
      summaryEl = document.createElement('p');
      summaryEl.className = 'cart-gift-wrapping__summary tw-text-sm tw-text-gift-preview tw-mt-2.5 tw-leading-relaxed tw-break-words';
      this.viewEl.appendChild(summaryEl);
    }

    const parts = [];
    if (toVal) parts.push(`To: ${toVal}`);
    if (fromVal) parts.push(`From: ${fromVal}`);
    if (messageVal) parts.push(`“${messageVal}”`);

    summaryEl.textContent = parts.join(' / ');
    summaryEl.classList.toggle('tw-hidden', parts.length === 0);
  }
}

if (!customElements.get('cart-gift-wrapping')) {
  customElements.define('cart-gift-wrapping', CartGiftWrapping);
}
