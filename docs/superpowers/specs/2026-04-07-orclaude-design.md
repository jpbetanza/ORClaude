# orclaude — CLI Design Spec

## Overview

`orclaude` is a Node.js CLI tool that launches Claude Code configured to use OpenRouter as its API backend. It provides an interactive, searchable model picker so the user can select which OpenRouter-hosted model to use for each Claude Code role (main model, small model).

## CLI Flow

### 1. API Key Resolution

1. Check `OPENROUTER_API_KEY` environment variable
2. Check `~/.orclaude/config.json` for a stored key
3. If neither found, prompt the user to paste their key, validate it by calling `GET https://openrouter.ai/api/v1/auth/key` with the key as Bearer token, and save to `~/.orclaude/config.json`

### 2. Model Fetching & Filtering

- Fetch all models from `GET https://openrouter.ai/api/v1/models` (no auth required)
- Filter to models where `supported_parameters` includes `tools`
- This ensures compatibility with Claude Code's tool-use workflow

### 3. Model Selection (per role)

Two sequential picker prompts using `@inquirer/search`:

1. **"Select main model"** — required, user must pick one
2. **"Select small model"** — optional, user can press Esc/Ctrl+C to skip

Each picker displays models as:
```
anthropic/claude-sonnet-4 — 200K ctx — $3/$15 per 1M tokens
```
Format: `model_id — context_length — input_price/output_price per 1M tokens`

Search filters against model id and name as the user types.

### 4. Launch Claude Code

- Spawn `claude` via `child_process.spawn` with `stdio: 'inherit'`
- Set environment variables on the child process:
  - `ANTHROPIC_BASE_URL=https://openrouter.ai/api/v1`
  - `ANTHROPIC_API_KEY=<openrouter_api_key>`
- Pass `--model <main_model_id>` and `--small-model <small_model_id>` (omitted if skipped)
- Forward any extra CLI args from `orclaude` to `claude`
- Exit with the same exit code as the `claude` process

## Project Structure

```
orclaude/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Entry point — orchestrates the full flow
│   ├── config.ts         # Load/save API key from ~/.orclaude/config.json
│   ├── models.ts         # Fetch & filter models from OpenRouter API
│   ├── picker.ts         # Inquirer search prompts for model selection
│   └── launcher.ts       # Spawn claude process with env vars
└── bin/
    └── orclaude.js       # Shebang entry point for npx/global install
```

## Dependencies

**Runtime:**
- `@inquirer/search` — searchable select prompt
- `@inquirer/input` — API key input prompt
- `chalk` — colored terminal output

**Dev:**
- `typescript`, `@types/node`
- `tsx` — development runner

## Build & Distribution

- TypeScript compiles to `dist/`
- `bin/orclaude.js` is the shebang entry (`#!/usr/bin/env node`) pointing to `dist/index.js`
- Installable globally via `npm i -g` or runnable with `npx`

## Config File

Location: `~/.orclaude/config.json`

```json
{
  "apiKey": "sk-or-..."
}
```

## Key Decisions

- **No auth on model fetch** — OpenRouter's `/api/v1/models` is a public endpoint
- **Filter on `tools` only** — sufficient to ensure Claude Code compatibility
- **Inquirer.js over Ink** — simpler, less code, good enough UX for a picker
- **stdio: inherit** — Claude Code fully owns the terminal after launch
- **Env vars over config flags** — `ANTHROPIC_BASE_URL` and `ANTHROPIC_API_KEY` are the standard way to redirect Claude Code to a custom backend
