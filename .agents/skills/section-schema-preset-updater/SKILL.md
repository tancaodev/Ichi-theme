---
name: section-schema-preset-updater
description: Review Designer-configured production section JSON and update the corresponding Shopify section schema preset while minimizing overrides, safely promoting defaults for otherwise-unused blocks, and removing store-specific resource references. Use when synchronizing a production section configuration into an Ichi theme section preset; do not use for general template cleanup.
---

# Section Schema Preset Updater

Turn a configured section from a production template into a lean, reusable preset in the corresponding `sections/*.liquid` schema. Preserve the Designer's portable design decisions without carrying merchant-specific content or redundant values into the codebase.

## Required Input

The user should provide the configured section JSON, either as pasted JSON or a file. Infer the target section from its `type`; ask only if the type is missing or maps ambiguously to more than one section file.

Treat the supplied configuration as source material, not as authorization to update templates, listing mirrors, unrelated presets, or production themes.

## Review the Relevant Schemas

Before editing:

1. Read the target section's complete `{% schema %}` object, including its settings, block definitions, and every existing preset.
2. Resolve each configured block type to its schema:
   - For theme blocks, inspect the corresponding `blocks/<type>.liquid` file.
   - For section-local blocks, inspect the matching block definition inside the section schema.
3. Build the effective configuration by overlaying supplied values on schema defaults. Evaluate `visible_if` conditions against that effective state and discard values for settings that are inactive.
4. Compare values using their JSON types. Do not treat `false`, `0`, `""`, and `null` as interchangeable.

## Check Block Reuse Before Changing Defaults

For every supplied block type, search the full repository with `rg` for actual configured uses outside the target preset. Check at least:

- `templates/**/*.json` and `listings/**/*.json`;
- section groups or other JSON configuration files;
- presets in `sections/*.liquid`;
- presets in `blocks/*.liquid` and parent block schemas.

Ignore schema declarations, render calls, documentation, and the target preset itself when deciding whether a block is used elsewhere. Report the evidence used for the decision.

- If the block type is used elsewhere, preserve its current schema defaults and put only necessary non-default portable values in the target section preset.
- If the block type is not used elsewhere, prefer changing each portable Designer-configured setting's schema `default` and omit that setting from the section preset.
- Do not change a shared default merely because the current search finds no exact setting override. Reuse is determined at the block-type level.
- For a section-local block, treat uses in other presets of the same section as reuse.
- Never promote store-specific resources or merchant URLs into defaults.

Changing a default must preserve a valid Shopify schema value and must not contradict a `visible_if` dependency. If a setting cannot define a schema default, keep the portable value in the preset instead.

## Produce a Lean Preset

Update the matching object in the section schema's `presets` array. Preserve its localized `name`, `category`, block structure, and ordering unless the supplied JSON establishes a required change.

For section settings and for blocks whose defaults should not change:

- Omit a setting when its supplied value equals the applicable schema default.
- Omit inactive settings whose `visible_if` evaluates to false.
- Keep a non-default value only when it is portable and needed to reproduce the configured design.
- Do not automatically change a section setting's default solely to shrink one preset. Change it only when the section schema clearly intends that value as the general baseline and existing presets/usages remain correct.

Keep block IDs stable when updating an existing preset. For a new preset, use deterministic descriptive IDs that are valid in Shopify preset JSON. Preserve `block_order` exactly where the section schema uses the legacy object-plus-order form; preserve array order where it uses an array form.

## Remove Store-Specific Data

Remove a setting from the preset instead of copying it when its value depends on a particular store. Determine this from both the setting schema type and the value. This includes, but is not limited to:

- products and product lists;
- collections and collection lists;
- pages, blogs, and articles;
- metafields, metaobjects, and dynamic-source references;
- navigation menus;
- uploaded images, videos, files, or other merchant library assets;
- `shopify://` resource identifiers, handles, GIDs, or values that only resolve in the source store.

Do not move any such value into a schema default. Preserve empty structural blocks when they are required for the preset's intended composition, but omit their store-specific settings.

## Normalize Links

For any setting whose schema type or purpose is a link or URL:

- Replace every non-empty supplied destination with the literal value `/collections/all`.
- Keep `/collections/all` explicitly in the preset so the preset never retains or inherits the production URL.
- Do not apply this rule to resource-picker settings such as `collection`, `product`, `page`, `blog`, or `article`; remove those settings instead.
- Remove an empty link unless the preset requires the key for a documented behavior.

## Preserve Explicit Color-Scheme Opt-Out

If the supplied JSON explicitly contains `inherit_color_scheme: false`, keep that exact key-value pair in the preset. This is a hard exception to default de-duplication and inference: preserve it even when the schema default is already `false`, when another color-scheme setting implies it, or when the containing block is otherwise eligible for default promotion.

Apply the same rule only to an equivalent prefixed inheritance setting when the supplied configuration explicitly contains that setting as `false`; do not invent inheritance keys that were absent from the input.

## Verification

Before finishing:

1. Parse the edited `{% schema %}` JSON and each edited block schema as strict JSON.
2. Confirm the preset contains no inactive settings, redundant defaults, or store-specific resource values.
3. Confirm every non-empty link/URL value in the updated preset is exactly `/collections/all`.
4. Confirm every explicit `inherit_color_scheme: false` from the supplied configuration remains in the preset.
5. Re-run the repository search for any block whose default changed and verify it still has no use outside the target preset.
6. Review the diff to ensure no unrelated presets, templates, locales, or schema behavior changed.

Do not run a production build. In the final response, identify the updated preset, list any block defaults changed because the blocks were unused elsewhere, summarize values removed or normalized, and state the validation performed.
