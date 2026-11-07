# CORE Development Workflow & Component Checklist

> **Optional.** This applies only when an Ichi component is backported to a shared CORE repository. It is not part of the normal Ichi development flow; for Ichi PRs use the rules in `SKILL.md`.

This document details the process for developing components on client themes, backporting candidates to the CORE repository, preparing Pull Requests, and completing final verification.

---

## 1. Development & Code Review Workflow

1. **Inventory Identification:**
   - Check if the component you are planning or building is listed on the **CORE inventory doc**.
   - Confirm the component does not already exist in CORE. If it already exists, reuse or extend it rather than creating a duplicate from scratch.
2. **Client Implementation & Validation:**
   - Build and test the component on the client site first.
   - Verify that the component passes both client QA and internal design review.
3. **Branching CORE:**
   - Create a feature branch on the `CORE` repository for your component.
4. **Sanitization for CORE:**
   - Remove any client-specific logic, hardcoded IDs, handles, store names, or proprietary assets.
   - Ensure all data/metafields/settings your component requires are defined in CORE or included in your branch.
5. **Pull Request Submission:**
   - Open a PR targeting the `CORE` `main` branch.
   - Flag the PR for review on Slack.
   - Provide a comprehensive PR description containing:
     - A link to a live/preview theme demonstrating the component in action.
     - Full documentation of all settings, schema blocks, and Liquid variables.
     - Notes on any site-wide variables or settings your component depends upon.
6. **Review & Merge:**
   - Address any review feedback or requested changes promptly.
   - Once approved, merge the PR into `main` and delete the feature branch.

---

## 2. Component Pre-PR Checklist

Before marking a component ready or submitting a PR to CORE, verify each checklist item:

- [ ] **Client Site QA:** Component has passed QA testing on the client site.
- [ ] **Design Review:** Component has passed design review against the provided specs.
- [ ] **CORE Inventory Confirmed:** Component is on the CORE inventory and does not already exist in CORE.
- [ ] **Code Comments:** Any complex or non-obvious logic is clearly documented with inline comments.
- [ ] **Snippet Documentation:** All snippets include a `{% doc %}` header (`@param` with types and an `@example`).
- [ ] **Client References Purged:** All client-specific identifiers, URLs, strings, and hardcoded values are removed.
- [ ] **Standards Adherence:** Component strictly follows Liquid, CSS, and JS guidelines from this skill.
- [ ] **PR Created:** PR opened against the CORE repository `main` branch.
- [ ] **Theme Preview Link:** PR description contains a direct link to a live preview theme.
- [ ] **Settings Documentation:** PR description outlines all section settings, blocks, presets, and Liquid variables needed for testing.

---

## 3. Fallback to Shopify Theme Best Practices

If an architectural or implementation question is not covered by internal CORE guidelines, fall back to official Shopify guidance:
- [Shopify Theme Best Practices](https://shopify.dev/docs/storefronts/themes/best-practices)
  - Accessibility (WCAG 2.1 AA compliant markup and keyboard navigation)
  - Performance (lazy loading non-critical media, avoiding render-blocking scripts)
  - Search Engine Optimization (semantic tags, heading hierarchy)
  - Internationalization & Currency Markets
