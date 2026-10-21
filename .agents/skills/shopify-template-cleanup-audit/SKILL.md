---
name: shopify-template-cleanup-audit
description: Audit process to verify that a Shopify JSON template has been correctly cleaned according to the "thin JSON" and "default-store asset" standards.
---

# Shopify Template Cleanup Audit

Use this skill to verify that a Shopify JSON template (e.g., `index.json`) has been correctly optimized. This ensures that no redundant data remains and all store-specific assets have been normalized.

## Audit Checklist

### 1. Default-Store Asset Normalization
- [ ] **Links:** All `url`-type settings (e.g. `button_link`, `link`) must be exactly `/collections/all` or `/collections`. 
    - *Fail if:* A link points to a specific product handle, another collection, or an external URL.
- [ ] **Menus:** All `link_list` settings (e.g. `menu`) must be `main-menu` (or `footer` for footer menus).
    - *Fail if:* A menu refers to a custom handle like `header-menu-secondary`.
- [ ] **Data Handles:** No specific handles for products, collections, or articles should exist (e.g., `article_resource: "journal"`).
    - *Fail if:* `collection: "best-sellers"` or `product: "product-handle"` is explicitly set.

### 2. Color Schemes
- [ ] **Scheme references:** Every `color_scheme` value must exist in `config/settings_data.json` / `settings_schema.json` color scheme groups.
    - *Fail if:* A section references a scheme ID that only exists on the source store.
    - *Fail if:* `color_scheme` equals the schema `default` (should be removed).

### 3. Redundancy & Defaults
- [ ] **Schema Parity:** Pick 3-5 random blocks/sections and check their Liquid schema.
    - *Fail if:* A setting in the JSON matches the `default` value in the Liquid schema.
- [ ] **Empty Values:** Ensure no `""`, `null`, `[]`, or `{}` remain if they aren't required by the schema logic.
- [ ] **Keywords:** No keys should have values like `"default"`, `"none"`, or `"inherit"`.

### 4. Conditional Dependencies
- [ ] **Enabled Flags:** Check settings that are only used when a toggle is on (look for `visible_if` in the schema or `{% if section.settings.<flag> %}` in Liquid).
    - *Fail if:* The toggle is off but its dependent settings still hold values.

## Audit Procedure

1.  **Grep Check:** Run searches for illegal handles or links:
    ```bash
    grep -v "/collections" templates/index.json | grep "shopify://"
    grep -v "main-menu" templates/index.json | grep "\"menu\""
    ```
2.  **Manual Spot Check:** Cross-reference at least one block and two sections against their Liquid schemas.
3.  **Color Scheme Scan:** Search for `color_scheme` and verify each ID exists and is not the schema default.
4.  **Report Results:** List all findings with the exact JSON path and the fix to apply.
