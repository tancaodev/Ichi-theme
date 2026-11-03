---
name: shopify-use-shopify-cli
description: "Guidelines and reference for using Shopify CLI to build, test, run, and troubleshoot Shopify apps, custom storefronts, and theme dev workflows."
---

# Shopify CLI Development Guidelines

Use this skill when running or troubleshooting Shopify CLI commands during local theme development, configuration validation, app auth, or store workflows.

## Installation & Upgrades

Shopify CLI (`@shopify/cli`) is the command-line tool for generating and working with Shopify apps, themes, and custom storefronts.

### Commands

* **Global Installation:**
  ```bash
  npm install -g @shopify/cli@latest
  ```
* **Upgrade to latest:**
  ```bash
  shopify upgrade
  ```
* **Check version:**
  ```bash
  shopify version
  ```
* **List all commands:**
  ```bash
  shopify commands
  ```
* **Help for a specific command:**
  ```bash
  shopify help [command]
  ```

---

## Core Workflows

### Theme Development

* **Start local server:** Runs a local development server for testing theme changes.
  ```bash
  shopify theme dev
  ```
* **Pull theme settings:** Pulls the latest theme settings from a Shopify store.
  ```bash
  shopify theme pull
  ```
* **Push theme changes:** Pushes local theme files to a development theme.
  ```bash
  shopify theme push
  ```
* **Run theme check:** Runs linter checks on theme code to catch errors or issues.
  ```bash
  shopify theme check
  ```

### App Configuration & Validation

* **Validate app configuration:** Validates configuration TOML files on disk (e.g. `shopify.app.toml`, `shopify.app.name.toml`, `shopify.extension.toml`).
  ```bash
  shopify app config validate --json
  ```

---

## CLI Troubleshooting

* **Authentication Issues:** Authenticate or switch stores.
  ```bash
  shopify store auth
  ```
* **Run existing query:**
  ```bash
  shopify store execute
  ```
* If a command is missing or unrecognized, try running `shopify upgrade` to fetch the latest CLI plugin updates.
