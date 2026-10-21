---
name: generate-pr
description: Generate a short commit/PR title, concise commit message or PR body (with ## Summary and ## Key Changes), and labels from the current workspace or branch changes. Use when the user asks to generate a commit message, commit title, or open/create a PR.
---

# Generate Commit Message / PR

You are a Senior Developer. Analyze the current git changes/diff in this workspace (staged/unstaged working tree changes for commits, or branch diff against `main` for PRs).

## Steps

1. Review the changes:
   - For commits: `git status --short`, `git diff --stat`, `git diff --cached --stat`, and read the relevant diffs.
   - For PRs against `main`:
     - `git log main..HEAD --oneline`
     - `git diff main...HEAD --stat`
     - `git diff main...HEAD` (read the relevant parts)
2. Auto-generate a short, clear **Title** using Conventional Commits format (`feat:`, `fix:`, `style:`, `perf:`, `refactor:`, `docs:`, `chore:`).
3. Auto-generate a concise **Message / Body** with `## Summary` and `## Key Changes` sections in that order (no ClickUp task section needed for internal commits/PRs). Keep it brief and scannable:

   ```markdown
   ## Summary
   ...

   ## Key Changes
   - ...
   ```

4. If creating a **Pull Request**:
   - Pick PR **Label(s)** based on the type of change:
     - Fetch the available labels with `gh label list`. Only use labels that already exist; never create new ones.
     - Map the change type to a label:

       | Change type | Label |
       | --- | --- |
       | Bug fix (`fix:`) | `bug` |
       | New feature or improvement (`feat:`, `style:`, `perf:`, `refactor:`) | `enhancement` |
       | Docs, skills, or guides only (`docs:`) | `documentation` |

     - Use more than one label when the PR clearly covers several types. If none fits, skip the label.
   - **Execution:** Create the Pull Request with the GitHub CLI:
     - If the current branch is `main`, stop and ask the user which branch to use.
     - Push the branch if it has no upstream: `git push -u origin HEAD`.
     - `gh pr create --base main --title "<title>" --body "<body>" --label "<label>"` (repeat `--label` for each label).
   - Report the PR URL and the labels applied.

If generating a commit message or if `gh` is not used, output the **Title** and **Message / Body** clearly so the user can copy or commit directly.
