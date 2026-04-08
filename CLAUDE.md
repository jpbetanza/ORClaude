# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**orclaude** is a CLI tool that launches Claude Code configured to use OpenRouter models. It provides an interactive picker for selecting Opus, Sonnet, Haiku, and subagent models, then spawns Claude with the appropriate environment variables.

## Commands

```bash
npm run build      # Compile TypeScript to dist/
npm run dev        # Run with tsx (no compile step)
npm run test       # Run all tests (vitest run)
npm run test:watch # Run tests in watch mode
npm link           # Install CLI globally for local testing
```

## Architecture

The CLI follows a **sequential pipeline** — each module is independent and testable:

1. **config** → Resolves OpenRouter API key (env var → `~/.orclaude/config.json` → interactive prompt)
2. **models** → Fetches model list from OpenRouter, filters for tool-compatible models
3. **picker** → Interactive search prompts for model selection (Opus required; Sonnet, Haiku, Subagent optional)
4. **launcher** → Spawns `claude` process with env vars (`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, model defaults)

Entry point: `src/index.ts` orchestrates the flow and passes data between modules.

## Source Structure

| File | Responsibility |
|------|----------------|
| `src/index.ts` | Entry point; orchestrates config → models → picker → launcher |
| `src/config.ts` | API key resolution and persistence to `~/.orclaude/config.json` |
| `src/models.ts` | Fetches from OpenRouter `/api/v1/models`, filters for `tools` support |
| `src/picker.ts` | Interactive model selection using `@inquirer/search` |
| `src/launcher.ts` | Spawns `claude` child process with OpenRouter env vars |
| `bin/orclaude.js` | Simple shebang entry point importing `dist/index.js` |

## Key Implementation Details

- **ESM-only**: Package uses `"type": "module"`, so all imports require `.js` extensions
- **API key priority**: `OPENROUTER_API_KEY` env var → `~/.orclaude/config.json` → interactive prompt with validation
- **Model filtering**: Only models with `supported_parameters` including `"tools"` are shown
- **Model persistence**: Selected models are saved to `config.json` and offered as defaults on reuse
- **Launcher behavior**: Passes `extraArgs` from `process.argv.slice(2)` to the spawned `claude` process
