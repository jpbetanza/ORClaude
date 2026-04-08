<!--
Sync Impact Report
==================
Version change: UNDEFINED → 1.0.0 (initial adoption)
Added principles:
  - I. Pipeline-First Architecture (derived from src/index.ts sequential pipeline)
  - II. Fail-Fast Validation (derived from CLI error handling requirements)
  - III. Observable Operations (derived from CLI debuggability needs)
  - IV. Test-Driven Quality (derived from existing vitest setup)
  - V. Simplicity & Minimalism (derived from project YAGNI approach)
Added sections:
  - Error Handling & Resilience (Network Resilience, Security Practices, Input Validation)
  - Tooling & Quality (Required Tooling, Code Standards, Dependencies)
  - Governance (Constitutional Supremacy, Amendment Procedure, Compliance Review)
Removed sections: None
Templates requiring updates (all ⚠ pending review):
  - .specify/templates/plan-template.md (Constitution Check section intentionally generic)
  - .specify/templates/spec-template.md (no changes needed - already aligned)
  - .specify/templates/tasks-template.md (no changes needed - already aligned)
  - .specify/templates/agent-file-template.md (no changes needed - intentionally generic)
Follow-up TODOs: None
-->

# orclaude Constitution

## Core Principles

### I. Pipeline-First Architecture

The CLI follows a sequential pipeline where each module is **independent, self-contained, and testable in isolation**:

- **config** — Resolves and persists OpenRouter API key
- **models** — Fetches and filters model list from OpenRouter
- **picker** — Interactive model selection
- **launcher** — Spawns Claude with configured environment

Data flows in one direction: config → models → picker → launcher. No module may import from a downstream module. Each module MUST export its dependencies for testability.

### II. Fail-Fast Validation

Validate all inputs at pipeline entry points and fail immediately with **clear, actionable error messages**:

- Missing or invalid API key: Prompt for resolution before proceeding
- Network failures: Report immediately with retry guidance
- Missing required models: Cannot proceed without user selection
- Configuration errors: Surface the specific field and why it failed

Error messages MUST be human-readable (not raw API responses or stack traces) and MUST NOT expose secrets.

### III. Observable Operations

CLI tools require structured output for debuggability. All modules MUST log:

- Entry/exit of each pipeline stage with timing
- Network requests (method, URL truncated, status code — never request bodies)
- User choices made (model selected, etc.) for auditability
- Errors with sufficient context to reproduce

Logging format: `[MODULE] message`. Use `console.log` for normal output, `console.error` for failures.

### IV. Test-Driven Quality

Tests are **mandatory** for new features and **required** for bug fixes:

- **Unit tests**: Each pipeline module tested in isolation with mocked dependencies
- **Integration tests**: Full pipeline tested end-to-end
- **Bug fixes**: A failing regression test MUST accompany every fix before merging

Testing framework: Vitest. Run `npm run test` before any PR. Coverage should be proportional to module complexity.

### V. Simplicity & Minimalism

Start simple, prefer the straightforward approach, and avoid gold-plating:

- Small, focused modules with single responsibilities
- YAGNI: Do not add functionality until it is actually needed
- Avoid premature abstraction — inline simple logic rather than over-engineering
- Configuration over convention: Explicit is better than implicit

## Error Handling & Resilience

### Network Resilience

- Network requests MUST have timeouts (default: 10s for API calls)
- On API failure, report the error and suggest remediation (check API key, network connectivity)
- Do not crash — allow user to retry or reconfigure

### Security Practices

- API keys MUST never appear in logs, error messages, or console output
- API keys stored in `~/.orclaude/config.json` with filesystem permissions as the access control
- Use `OPENROUTER_API_KEY` environment variable when available (takes priority)

### Input Validation

- API key: Non-empty string, basic format validation before API call
- Model selection: Must be from the filtered list of tool-compatible models
- File paths: Validate existence before use

## Tooling & Quality

### Required Tooling

- **TypeScript**: Strict mode enabled; no `any` without explicit justification
- **Vitest**: Unit and integration tests; `npm run test` must pass before merge
- **ESM-only**: Package uses `"type": "module"`; all imports require `.js` extensions

### Code Standards

- No commented-out code in deliverables
- No TODO comments without an associated issue/ticket
- Error handling: Use typed errors, never swallow exceptions silently

### Dependencies

- Runtime dependencies: `@inquirer/*` for prompts, `chalk` for terminal styling
- Minimize dependencies — each new dependency is a maintenance burden
- No heavy frameworks; prefer direct API calls

## Governance

### Constitutional Supremacy

This constitution supersedes all other project practices. When conflicts arise, this document prevails.

### Amendment Procedure

1. Propose change with rationale and migration plan
2. Require approval from project maintainer
3. Version bump following semantic versioning rules:
   - **MAJOR**: Backward-incompatible governance changes, principle removals or redefinitions
   - **MINOR**: New principle or materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements
4. Document amendment in this file with version and date

### Compliance Review

- All PRs and reviews MUST verify constitutional compliance
- Complexity additions MUST be justified with evidence that simpler alternatives were considered and rejected
- Use `CLAUDE.md` for runtime development guidance; constitution is persistent governance

**Version**: 1.0.0 | **Ratified**: 2026-04-07 | **Last Amended**: 2026-04-07
