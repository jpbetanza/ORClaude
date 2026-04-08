# orclaude

**Launch Claude Code with any OpenRouter model.**

```
┌─────────────────────────────────────┐
│                                     │
│   ●  OpenRouter  +  Claude          │
│                                     │
└─────────────────────────────────────┘
```

orclaude is a CLI that replaces Anthropic's models with your own OpenRouter choices — pick from hundreds of models with different pricing, context windows, and capabilities, then launch directly into a Claude Code session.

## Features

- Interactive model picker with fuzzy search
- Configure Opus, Sonnet, Haiku, and subagent models independently
- Remembers your last selection for quick reuse
- API key stored locally and validated automatically
- Forwards any `claude` CLI arguments through transparently

## Requirements

- Node.js 20+
- Claude Code (`npm install -g @anthropic-ai/claude-code`)

## Install

```bash
npm install -g orclaude
```

Or build from source:

```bash
git clone https://github.com/jpbetanza/orclaude.git
cd orclaude
npm install
npm run build
npm link
```

## Usage

```bash
orclaude                    # Start fresh (prompts for API key if needed)
orclaude --verbose         # Pass arguments through to claude
OPENROUTER_API_KEY=sk-...  # Skip the API key prompt entirely
```

First run saves your selection to `~/.orclaude/config.json`. On subsequent runs, you'll be asked whether to reuse the same models.

## How it works

orclaude intercepts the standard Anthropic environment variables and points them at OpenRouter's proxy:

```
claude → ANTHROPIC_BASE_URL=https://openrouter.ai/api → OpenRouter → Your model
```

This means it works with any model that OpenRouter supports, as long as it has tool-calling enabled.

## Config location

All data is stored in `~/.orclaude/`:

```
~/.orclaude/config.json   # API key + saved model IDs
```

## License

MIT
