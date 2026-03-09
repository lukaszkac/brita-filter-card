# Brita Filter Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

Animated Lovelace card for the [Brita Filter](https://github.com/lukaszkac/brita-filter) integration.

Shows an animated water drop that fills based on remaining filter life. Color changes from blue → orange → red as the filter ages.

## Requirements

Install the [Brita Filter](https://github.com/lukaszkac/brita-filter) integration first.

## Installation via HACS

1. In HACS → Frontend → ⋮ → Custom repositories
2. Add `https://github.com/lukaszkac/brita-filter-card` as **Lovelace**
3. Install **Brita Filter Card**
4. Refresh browser

## Usage

```yaml
type: custom:brita-filter-card
entity: sensor.brita_filter_filter_remaining
title: Brita Water Filter   # optional
```

## Features

- 🌊 Animated wave inside water drop
- 🎨 Color-coded: blue (ok) → orange (replace soon) → red (replace now)
- 🌍 Auto-detects language (EN/PL)
- Visual editor support in dashboard UI
