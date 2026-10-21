---
name: theme-store-requirements
description: Complete Shopify Theme Store submission requirements checklist. Use this skill when auditing the Ichi theme for Theme Store compliance, checking what's been done, and identifying what's missing. Covers exclusivity, design, features, templates, performance, accessibility, SEO, locales, settings, and more.
---

# Shopify Theme Store Requirements

Reference this skill to audit Ichi theme compliance against all Theme Store submission requirements.
Mark items `[x]` as completed, `[/]` as in-progress, `[ ]` as not started.

---

## 1. Theme Store Exclusivity

- [ ] Theme distributed exclusively through Shopify Theme Store (not on other marketplaces)
- [ ] No designer credits or links to developer's website in theme files
- [ ] No affiliate links in theme files

## 2. Uniqueness

- [ ] Codebase has meaningful differences from other themes
- [ ] Theme preset identity is unique
- [ ] Presets have clear industry focus
- [ ] Inventive art direction distinguishing from other themes
- [ ] Cohesive look across all templates (index, product, collection, blog, search, cart)
- [ ] Unique customization options or functionality
- [ ] A merchant can't customize one preset to look identical to another Theme Store preset

## 3. Theme Design & UX

### Visual Design

- [ ] Unique and intentional design targeting specific merchant type/industry
- [ ] Professional-quality visuals (no blurry, stretched, pixelated, or clipart imagery)
- [ ] Simple, complementary color palette — cohesive, no clashing or readability issues

### Layout

- [ ] Clear, organized page structure following logical grid
- [ ] Consistent spacing and alignment between sections/blocks
- [ ] Clear content hierarchy (size, color, contrast, position guide attention)
- [ ] Flexible layouts remain visually appealing when content varies (no awkward gaps/blank areas)

### Consistency

- [ ] Consistent typography — limited font count, complementary pairing
- [ ] Consistent visual/interaction design (buttons, links, forms styled uniformly)
- [ ] Settings clearly organized with simple language in Shopify Admin

### Customer Shopping Experience

- [ ] Clear & effortless navigation (homepage → product → cart → checkout)
- [ ] Thoughtful product discovery (menus, featured collections, recommendations)
- [ ] Frictionless shopping interactions (options, add-to-cart, edit cart, checkout all clear & responsive)

### Demo Store Experience

- [ ] Complete, realistic demo store (no Lorem Ipsum or placeholder content)
- [ ] All sections and features fit the type of business portrayed
- [ ] Inspiring merchant experience with engaging content and realistic product displays

## 4. Features

All themes must support:

- [ ] **Sections Everywhere** — Online Store 2.0 compatible (JSON templates)
- [ ] **Discounts** — Display discount amounts for items and orders in cart, checkout, and order templates
- [ ] **Accelerated checkout buttons** — On product page AND cart page; branded colors not modified
- [ ] **Faceted search filtering** — On collection pages AND search pages (availability, price, type, vendor, variant options)
- [ ] **Gift cards** — Gift card template renders gift card page
- [ ] **Image focal points** — Support `image_picker` focal point setting
- [ ] **Images for social sharing** — `page_image` object for social thumbnails
- [ ] **Country selection** — Currency/country selector following UX guidelines
- [ ] **Language selection** — Language selector following UX guidelines
- [ ] **Multi-level menus** — Nested dropdown menus
- [ ] **Newsletter forms** — Email collection for marketing
- [ ] **Pickup availability** — On product page (without adding to cart)
- [ ] **Related product recommendations** — Auto-generated on product pages
- [ ] **Complementary product recommendations** — On product pages
- [ ] **Rich product media** — 3D models, embedded videos, Vimeo/YouTube in product template, featured product, quick view
- [ ] **Search box or link to search** — With search template AND predictive search
- [ ] **Selling plans** — Subscriptions shown in cart AND customer pages
- [ ] **Shop Pay Installments** — Banner on product page
- [ ] **Unit pricing** — On collection, product, cart, AND customer pages
- [ ] **Variant images** — Shown when associated variant selected
- [ ] **Follow on Shop** — `login_button` Liquid filter; branded colors not modified

## 5. Templates, Sections & Blocks

### Required Templates

- [ ] `theme.liquid` (layout)
- [ ] `404.json`
- [ ] `article.json`
- [ ] `blog.json`
- [ ] `cart.json`
- [ ] `collection.json`
- [ ] `index.json`
- [ ] `list-collections.json`
- [ ] `page.json`
- [ ] `page.contact.json`
- [ ] `password.json`
- [ ] `product.json`
- [ ] `search.json`
- [ ] `gift_card.liquid`
- [ ] `settings_data.json` (config)
- [ ] `settings_schema.json` (config)

### Section Requirements

- [ ] All templates support sections (JSON templates) — except customer accounts, gift card, checkout
- [ ] **Custom Liquid section** included (setting type `liquid`, available on all section-supporting templates)
- [ ] Header and footer rendered within **section groups**

### Block & App Block Requirements

- [ ] Product page main section uses **individual blocks** for price, vendor, description, etc.
- [ ] **App blocks** (`@app` type) supported in main product section AND featured product section
- [ ] **Custom Liquid blocks** added wherever app blocks are considered

### ⚠️ Submission Note

- [ ] `config/markets.json` is NOT included in submission

## 6. Lighthouse Performance & Accessibility

- [ ] Minimum **average Lighthouse accessibility score of 90** across product, collection, and home page (desktop AND mobile)
- [ ] Sections contain actual images and content during testing (not empty)

## 7. Pages

### Layout Page

- [ ] Payment icons use `enabled_payment_types` + `payment_type_img_url` or `payment_type_svg_tag` (full color)
- [ ] `<html>` has `lang="{{ request.locale.iso_code }}"`
- [ ] All URLs use `routes` object (e.g., `routes.root_url` not `/`)
- [ ] `content_for_header` not modified or parsed

### Product Page

**Required product info:**
- [ ] `product.title` (not truncated)
- [ ] `variant.price`
- [ ] `variant.unit_price`
- [ ] Variant's compare-at price
- [ ] `product.description`
- [ ] Option names and option values

**Layout & media:**
- [ ] All product images displayed and viewable
- [ ] Different image ratios don't break layout
- [ ] Variant images shown when variant selected

**Pricing:**
- [ ] Uses `cart.taxes_included` to indicate tax-inclusive pricing

**Buying functions:**
- [ ] Variants split into separate options
- [ ] Quantity selector
- [ ] Add to cart button (disabled/replaced for unavailable/sold-out)
- [ ] Callback to update price/compare-at-price/sold-out messages for selected variant
- [ ] First available variant loads by default

**Required feature support:**
- [ ] Product recommendations
- [ ] Rich product media
- [ ] Accelerated checkout buttons (enabled by default)
- [ ] Pickup availability
- [ ] Shop Pay Installments

**Gift card products:**
- [ ] Option to send to recipient
- [ ] Uses `form.email`, `form.name`, `form.message`
- [ ] Uses `send_on` attribute

**Product option swatches:**
- [ ] `swatch.image` supported
- [ ] `swatch.color` supported

### Collection Page

- [ ] `collection.title` (not truncated)
- [ ] `collection.description`
- [ ] `collection.image`
- [ ] Products in grid/list with: `product.title` (not truncated, links to URL), `product.price`, `product.images`, `variant.unit_price`, at least one media
- [ ] Grid doesn't break with varying aspect ratios
- [ ] Sale badge or `compare_at_price_max` shown when appropriate
- [ ] Sort products ability
- [ ] Empty collection message
- [ ] `product.price_varies` used to show price range
- [ ] Pagination or lazy loading

### Collection List Page

- [ ] `collection.title` (not truncated)
- [ ] `collection.featured_image` (falls back to first product image)
- [ ] Pagination or lazy loading

### Cart Page

- [ ] Line item details: title, unit_price, image, final_price, quantity, options_with_values
- [ ] `cart.total_price` visible
- [ ] `cart.taxes_included` indication
- [ ] Checkout button submitting cart form
- [ ] Line items refresh when quantity updated
- [ ] Ability to change quantity per line item
- [ ] Cart notes supported
- [ ] Selling plans supported
- [ ] Automatic discount codes supported
- [ ] Accelerated checkout buttons

### Page

- [ ] `page.title` and `page.content` included
- [ ] Alternate template for contact form

### Blog Page

- [ ] `blog.title` output
- [ ] Articles display: `article.title` (not truncated, links to URL), `article.image`, `article.excerpt_or_content` (NOT `article.content`)
- [ ] Pagination or lazy loading

### Article Page

- [ ] `article.title` (not truncated)
- [ ] `article.comments`
- [ ] `article.published_at` (NOT `article.created_at`)
- [ ] Comments paginated
- [ ] Comments workflow works without moderation; success/error messages output

### Search Page

- [ ] No-results message
- [ ] Returns different object types (products, blogs, pages) using `object_type`
- [ ] Pagination or lazy loading

### 404 Page

- [ ] Clear "page not found" message
- [ ] Options to proceed (search bar or homepage link)

### Gift Card Page

- [ ] Apple Wallet support
- [ ] Gift card code shown
- [ ] QR code shown (minimum 120×120px)
- [ ] Logo or `shop.name` included

### Customer Pages

- [ ] `line_item.unit_price` displayed
- [ ] Selling plans supported
- [ ] Unit pricing supported

### Password Page

- [ ] Logo or `shop.name`
- [ ] `shop.password_message`
- [ ] Way to enter storefront password

## 8. Consistency & Functionality

- [ ] RTE content (h1-h6, blockquotes, ul, ol) consistent across all templates
- [ ] RTE styling consistent with blog articles, product/collection descriptions
- [ ] Scripts hosted on Shopify servers (except approved third-party libs)
- [ ] No JS that interferes with theme editor or Shopify admin
- [ ] Links to Shopify domains include `rel="nofollow"`
- [ ] Assets use protocol-relative URLs (no hard `http` or `https`)
- [ ] Appropriate licenses for all third-party plugins and images
- [ ] No app-dependent functionality
- [ ] No app-like features requiring API access (wishlists, scheduling, cart-level discount codes, Instagram feeds)

## 9. Browser Compatibility

### Desktop

- [ ] Safari — latest 2 releases (Mac)
- [ ] Chrome — latest 3 releases (Mac + PC)
- [ ] Firefox — latest 3 releases (Mac + PC)
- [ ] Edge — latest 2 releases (PC)

### Mobile

- [ ] Theme is mobile responsive
- [ ] Mobile Safari — latest 2 releases (iOS)
- [ ] Chrome Mobile — latest 3 releases (Android + iOS)
- [ ] Samsung Internet — latest 2 releases (Android)

### Webviews

- [ ] Instagram — latest release (Android + iOS)
- [ ] Facebook — latest release (Android + iOS)
- [ ] Pinterest — latest release (Android + iOS)

## 10. Assets

- [ ] No Sass / `.scss` / `.scss.liquid` files
- [ ] Only native CSS (`.css` or `.css.liquid`)
- [ ] No minified `.css` or `.js` files (except ES6 and third-party libs)

## 11. SEO

- [ ] Theme SEO metadata snippet (title, meta description, canonical URL)
- [ ] Google rich product snippets (structured data)
- [ ] No `robots.txt.liquid` template

## 12. Accessibility

- [ ] All page parts keyboard accessible (including dropdown nav)
- [ ] Visible focus state on focusable elements during keyboard nav
- [ ] All images have `alt` attribute (`image.alt` or `image_url | image_tag: alt:`)
- [ ] Form inputs have unique ID + labels with matching `for` attribute
- [ ] Valid HTML
- [ ] Text contrast ratio: 4.5:1 body text, 3:1 large text (18pt+) and non-text elements
- [ ] Keyboard focus order matches DOM order (top-bottom, left-right)
- [ ] Touch target minimum 24×24 CSS pixels (exceptions for inline text)
- [ ] Headings h1-h6 visually different from each other

## 13. Social Media

- [ ] Set of social media icons to choose from
- [ ] Open Graph and Twitter card tags
- [ ] Social media placeholder text left empty

## 14. Settings

### Basic

- [ ] All settings adhere to text style and terminology requirements
- [ ] Labels and info text grammatically correct, no spelling errors
- [ ] Default values indicate how to use (no Lorem Ipsum or demo content as placeholder)
- [ ] Favicon setting included
- [ ] Logo upload works with different aspect ratios
- [ ] All settings have a label
- [ ] `link_list` settings in header/footer default to `main-menu` or `footer`
- [ ] Resource-based setting defaults reference existing resources
- [ ] Metaobject settings use only standard definitions
- [ ] `theme_info` section included

### Theme Editor Events

- [ ] Changes in theme editor reflected in preview (`request.design_mode`)

### Text Style

- [ ] Section/preset/category names in **sentence case**
- [ ] Descriptive setting names (no numbered options, except colors)
- [ ] Intuitive language ("Horizontal position" not "X position", "Button label" not "CTA label")
- [ ] **American English**
- [ ] No ampersands (`&`)
- [ ] Declarative statements (not questions)
- [ ] Subject stated only once in heading (no repetition like "slideshow", "slideshow color")
- [ ] Active voice
- [ ] Buttons/actions start with a verb

## 15. Font Picker

- [ ] All fonts use `font_picker` setting type
- [ ] Default font loaded (e.g., `work_sans_n6`)
- [ ] Fonts in defaults/presets use currently available fonts
- [ ] CSS loads bold, italic, and bold-italic variants via `font_modify` filter
- [ ] No custom fonts

## 16. Color System

- [ ] Minimum 4 colors
- [ ] All background colors have corresponding foreground color
- [ ] Color settings use type `color`

## 17. Responsive Images

- [ ] Responsive image strategy for all images (small icons excepted)
- [ ] Images lazy load (only load as needed)

## 18. Theme & Preset Naming

- [ ] Names distinct from Shopify products/events/branded content
- [ ] Names don't include company/Partner account name
- [ ] Names distinct from websites, platforms, SEO terms
- [ ] Names distinct from industries/collections in Theme Store
- [ ] One preset takes the parent theme name
- [ ] Names are 1-2 words, < 30 characters
- [ ] Names unique from existing Theme Store themes

## 19. Theme Versions & Release Notes

- [ ] Version number included
- [ ] Release notes highlight main features

## 20. Demo Stores

- [ ] All presets have at least one demo store
- [ ] Demo matches primary industry and catalog size tags
- [ ] Install store matches demo store expectations
- [ ] Bogus Gateway or test mode enabled, other checkout options disabled
- [ ] All pages use authentic text (no Lorem Ipsum, no profanities)
- [ ] `powered_by_link` unaltered
- [ ] No affiliate linking
- [ ] Shopify domain links include `rel="nofollow"`
- [ ] Only theme-built elements showcased (no embedded text in images mimicking features, no animated GIFs mimicking functionality, no apps)
- [ ] Appropriate rights obtained for all assets

## 21. Documentation & Contact Forms

- [ ] Theme documentation provided
- [ ] Public support contact form provided
- [ ] Both linked to Theme Store listing page
- [ ] Documentation grammatically correct, no spelling errors
- [ ] Documentation consistent with theme settings copy
- [ ] Documentation kept up-to-date
- [ ] FAQ section included

## 22. Merchant Support

- [ ] Assist merchants with theme-related questions
- [ ] Reply to support requests within 2 business days
- [ ] Fix technical issues (broken layout, dead links, logical errors) in timely manner
- [ ] Fix critical bugs immediately

### Install Experience Tips

- [ ] `.json` files don't include demo-store-specific resources (custom metafields, `shopify://` URLs)
- [ ] `link_list` defaults set correctly (`main-menu` / `footer`)
- [ ] Resource-based setting defaults reference existing resources
- [ ] Metaobject settings use only standard definitions

---

## Locales Checklist

All customer-facing text must use translation keys (`{{ 'key' | t }}`). Scan `.liquid` files for hard-coded English strings.

### 1. Global / Layout

- [ ] Skip links ("Skip to content")
- [ ] Global announcements / banners
- [ ] Cookie / tracking banners (if in theme)
- [ ] Global system error messages

### 2. Header & Navigation

- [ ] Cart icon label ("Cart", "Bag")
- [ ] Search trigger text ("Search")
- [ ] Account links ("Log in", "Register", "My account")
- [ ] Language/currency accessible labels
- [ ] Mobile menu labels ("Menu", "Close menu")

### 3. Footer

- [ ] Section headings ("About us", "Customer service")
- [ ] Newsletter copy and button ("Subscribe")
- [ ] Contact info labels
- [ ] Social section title ("Follow us")
- [ ] Payment icons label
- [ ] Copyright text (static parts)

### 4. Home / Generic Sections

- [ ] Section titles/subtitles (fixed or default text)
- [ ] Buttons & CTAs ("Shop now", "Learn more", "View all")
- [ ] Badges ("New", "Sale")
- [ ] Static helper texts

### 5. Product

- [ ] Add to cart button
- [ ] Price labels ("From", "Regular price", "Sale price", "Unit price")
- [ ] Sold-out / unavailable messages
- [ ] Backorder / preorder text
- [ ] Variant picker labels ("Size", "Color")
- [ ] Quantity label
- [ ] Description headings / tab titles
- [ ] Wishlist / compare text (if implemented)

### 6. Collection

- [ ] Collection heading fallback ("All products")
- [ ] Filter UI labels ("Filter", "Sort", "Apply", "Clear all")
- [ ] Sort-by labels
- [ ] Pagination text ("Previous", "Next")
- [ ] Empty state messages

### 7. Cart

- [ ] Headings ("Your cart")
- [ ] Empty state ("Your cart is empty")
- [ ] Buttons ("Update cart", "Checkout", "Continue shopping")
- [ ] Labels ("Note", "Subtotal")
- [ ] Discount / shipping helper text
- [ ] Cart error messages

### 8. Blog & Article

- [ ] "Read more", "Tags", "Published on"
- [ ] Comment form labels and buttons
- [ ] Comment count text
- [ ] Empty state

### 9. Search

- [ ] Input placeholder ("Search products")
- [ ] Search button text
- [ ] Result count (with pluralization)
- [ ] No results message
- [ ] Suggestion text

### 10. Customer Accounts

- [ ] Login page labels ("Log in", "Email", "Password", "Forgot password?")
- [ ] Registration page labels
- [ ] Account dashboard headings
- [ ] Addresses page text ("Add new address", "Edit", "Delete")
- [ ] Order details labels

### 11. Forms & Validation

- [ ] Form field labels and placeholders
- [ ] Submit button text
- [ ] Inline validation messages
- [ ] Success / error messages

### 12. Accessibility / ARIA Labels

- [ ] `aria-label` on buttons/links ("Open cart", "Close menu")
- [ ] Visually hidden text for icons ("Play video")
- [ ] Carousel controls ("Next slide", "Previous slide")

### 13. Empty / Zero States

- [ ] Empty collection, blog, search, cart messages
- [ ] Instructional helper text
- [ ] "No filters applied"

### 14. Utility Status Messages

- [ ] AJAX add-to-cart messages ("Item added to cart")
- [ ] Loading text ("Loading…")
- [ ] Generic error messages

### 15. Meta / SEO Defaults

- [ ] Hard-coded meta title/description fallbacks use `t` filter

### 16. Theme Editor Preview Text

- [ ] Blank-state / placeholder text in sections uses `t` filter

---

## How to Use This Skill

1. **Before submitting:** Walk through each numbered section, checking off items
2. **During development:** Reference specific sections when building features
3. **For audits:** Use the locales checklist to find hard-coded strings
4. **Track progress:** Mark items `[x]` done, `[/]` in-progress, `[ ]` not started
5. **After Shopify feedback:** If submission is rejected, map rejection reasons to specific checklist items
