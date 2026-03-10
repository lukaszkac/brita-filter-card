# Brita Filter Card – Home Assistant Lovelace Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/lukaszkac/brita-filter-card.svg)](https://github.com/lukaszkac/brita-filter-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Animated Lovelace card for the [Brita Filter](https://github.com/lukaszkac/brita-filter) integration. Shows a water drop that fills based on remaining filter life.

## Features

- 🌊 Animated wave inside water drop
- 🎨 Color-coded: blue (good) → orange (replace soon) → red (replace now)
- 🌗 Dark / Light theme with auto-detection from HA
- 🇬🇧 English / 🇵🇱 Polish — auto-detected from HA locale
- Visual editor support in dashboard UI

## Requirements

Install the [Brita Filter](https://github.com/lukaszkac/brita-filter) integration first.

## Installation via HACS

1. In HACS → Frontend → ⋮ → Custom repositories
2. Add `https://github.com/lukaszkac/brita-filter-card` as **Lovelace**
3. Install **Brita Filter Card**
4. Refresh browser

## Manual installation

Copy `dist/brita-filter-card.js` to your `config/www/` directory, then add a resource in Settings → Dashboards → Resources:

```
/local/brita-filter-card.js  (JavaScript module)
```

## Configuration

### Minimal

```yaml
type: custom:brita-filter-card
entity: sensor.brita_filter_remaining
```

### Full

```yaml
type: custom:brita-filter-card
entity: sensor.brita_filter_remaining
title: Brita Water Filter   # optional, auto-translated if omitted
language: pl                # optional: en, pl — auto-detected if omitted
theme: auto                 # optional: auto, dark, light
```

## Options

| Option | Default | Description |
|---|---|---|
| `entity` | required | `sensor.brita_filter_remaining` (or `_2`, `_3` for multiple filters) |
| `title` | auto | Card title — auto-translated to HA language if omitted |
| `language` | auto | `en` or `pl` — override HA locale |
| `theme` | `auto` | `auto`, `dark` or `light` |

## Multiple filters

For each filter instance just point to its `remaining` sensor — the card automatically finds the sibling entities:

```yaml
type: custom:brita-filter-card
entity: sensor.brita_filter_remaining      # first pitcher

type: custom:brita-filter-card
entity: sensor.brita_filter_2_remaining    # second pitcher
```

## License

MIT
