<p align="center">
  <h1 align="center">🏨 RoomGenie — Intelligent Hotel Search & Recommendation</h1>
  <p align="center">
    <strong>Find the perfect stay, right inside Claude Code and OpenClaw.</strong>
  </p>
  <p align="center">
    Search hotels, homestays, resorts with natural language. Real-time hotel data from reliable sources.
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/@roomgenie/cli"><img src="https://img.shields.io/npm/v/@roomgenie/cli?label=roomgenie-cli&color=blue" alt="npm version"></a>
    <a href="https://github.com/roomgenie/roomgenie-skill"><img src="https://img.shields.io/github/stars/roomgenie/roomgenie-skill?style=social" alt="GitHub Stars"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License"></a>
    <a href="https://github.com/roomgenie/roomgenie-skill"><img src="https://img.shields.io/badge/version-0.1.0-orange" alt="Skill Version"></a>
  </p>
</p>

---

## Why RoomGenie?

You're planning a trip, looking for the perfect place to stay. RoomGenie lets you **search hotels without leaving your terminal**. It connects Claude Code and OpenClaw agents to real-time hotel search, giving you structured results in seconds.

- **Natural language in, structured data out** — ask in plain English or Chinese, get JSON you can pipe, filter, or render
- **Simple and powerful** — one command for all your hotel search needs
- **Real-time data** — results from reliable sources
- **Zero config to start** — works out of the box, optional API key for enhanced results

## Quick Start

### Step 1 — Install the Skill

**OpenClaw:**

```bash
# via clawhub (Recommended)
clawhub install roomgenie

# or via npx
npx skills add roomgenie/roomgenie-skill
```

**Claude Code:**

```bash
cp -r /path/to/roomgenie-skill/skills/roomgenie ~/.claude/skills/roomgenie
```

### Step 2 — Install the CLI

```bash
npm i -g @roomgenie/cli
```

### Step 3 — Verify

```bash
roomgenie search --city "Beijing"
```

You should see structured JSON output. You're good to go.

### Step 4 — Configure (optional)

The skill works without any API keys. For enhanced results, set one up:

```bash
roomgenie config set ROOMGENIE_API_KEY "your-key"
```

## Commands

RoomGenie provides two commands:

| Command | Purpose | Required Params |
|---------|---------|-----------------|
| `search` | Natural-language hotel search across all accommodation types | `--city` |
| `config` | Manage configuration | |

### `search` — Hotel Search

Simple and powerful hotel search with natural language.

**OpenClaw / Claude Code:**

```
/roomgenie search --city "Beijing"
/roomgenie search --city "Shanghai" --keyword "budget"
/roomgenie search --city "Hangzhou" --check-in 2026-04-15 --check-out 2026-04-20
```

**CLI:**

```bash
roomgenie search --city "Beijing"
roomgenie search --city "Shanghai" --keyword "budget"
roomgenie search --city "Hangzhou" --check-in 2026-04-15 --check-out 2026-04-20
```

**Parameters:**

| Flag | Description |
|------|-------------|
| `--city` | City name **(required)** |
| `--keyword` | Search keyword (optional) |
| `--check-in` | Check-in date (`YYYY-MM-DD`, optional) |
| `--check-out` | Check-out date (`YYYY-MM-DD`, optional) |

### `config` — Configuration Management

Manage your RoomGenie configuration.

**CLI:**

```bash
# Set an API key
roomgenie config set ROOMGENIE_API_KEY "your-key"

# Get a configuration value
roomgenie config get ROOMGENIE_API_KEY

# List all configuration
roomgenie config list
```

## Featured Use Cases

### Business Trip Planning

> "Find me a nice hotel in Shanghai for next week"

```
/roomgenie search --city "Shanghai" --check-in 2026-04-15 --check-out 2026-04-20
```

### Weekend Getaway

> "Recommend hotels in Hangzhou near West Lake"

```
/roomgenie search --city "Hangzhou" --keyword "West Lake"
```

### Budget Travel

> "Find affordable hotels in Beijing city center"

```
/roomgenie search --city "Beijing" --keyword "budget"
```

## Examples

### OpenClaw

Just type naturally in OpenClaw — RoomGenie activates automatically on hotel queries:

> Find me hotels in Shanghai for this weekend

> What are the best hotels in Beijing with good ratings?

Or use the slash command directly:

```
/roomgenie search --city "Shanghai" --check-in 2026-04-12 --check-out 2026-04-14
```

### Claude Code

Ask naturally or use the `/roomgenie` slash command inside Claude Code:

> I'm planning a trip to Hangzhou — find me nice hotels

> What are some good hotels in Beijing?

```
/roomgenie search --city "Hangzhou"
/roomgenie search --city "Beijing" --keyword "center"
```

## How It Works

```
You ask your agent ──→ RoomGenie Skill activates ──→ roomgenie-cli runs ──→ RoomGenie API
                                                                                   │
You see rich results ←── Agent formats markdown ←── JSON response ←──────────────┘
```

- **Runtime**: Node.js
- **Output**: Single-line JSON to `stdout`, errors/hints to `stderr`
- **Context isolation**: Each command runs in its own execution context
- **Pattern matching**: Intent-based activation at priority 85 — the agent automatically routes hotel queries to RoomGenie

## Accommodation Types Covered

RoomGenie covers all types of stays:

| Category | Examples |
|----------|---------|
| **Hotels** | Luxury hotels, business hotels, boutique hotels, budget hotels |
| **Alternative Stays** | Homestays, inns, hostels, serviced apartments |
| **Resorts** | Beach resorts, mountain resorts, spa resorts |

## Project Structure

This repository contains **only the skill definition**. The actual CLI implementation lives in a separate repository:

- **roomgenie-skill** (this repo): Skill definition, documentation, and configuration
- **roomgenie-cli** (separate repo): CLI implementation, API integration, and business logic

## License

[MIT](LICENSE) — Copyright (c) 2026 roomgenie
